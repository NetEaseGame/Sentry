from __future__ import absolute_import

from rest_framework.response import Response

from sentry.app import tsdb
from sentry.api.base import DocSection, StatsMixin
from sentry.api.bases.project import ProjectEndpoint
from sentry.utils.apidocs import scenario, attach_scenarios

from django.db import connection
import MySQLdb

@scenario('RetrieveEventCountsProjcet')
def retrieve_event_counts_project(runner):
    runner.request(
        method='GET',
        path='/projects/%s/%s/stats/' % (
            runner.org.slug, runner.default_project.slug)
    )


def dictFetchAll(cursor):
    desc = cursor.description
    return [
        dict(zip([col[0] for col in desc], row)) for row in cursor.fetchall()
    ]

class ProjectStatsEndpoint(ProjectEndpoint, StatsMixin):
    doc_section = DocSection.PROJECTS

    @attach_scenarios([retrieve_event_counts_project])
    def get(self, request, project):
        """
        Retrieve Event Counts for a Project
        ```````````````````````````````````

        .. caution::
           This endpoint may change in the future without notice.

        Return a set of points representing a normalized timestamp and the
        number of events seen in the period.

        Query ranges are limited to Sentry's configured time-series
        resolutions.

        :pparam string organization_slug: the slug of the organization.
        :pparam string project_slug: the slug of the project.
        :qparam string stat: the name of the stat to query (``"received"``,
                             ``"rejected"``, ``"blacklisted"``)
        :qparam timestamp since: a timestamp to set the start of the query
                                 in seconds since UNIX epoch.
        :qparam timestamp until: a timestamp to set the end of the query
                                 in seconds since UNIX epoch.
        :qparam string resolution: an explicit resolution to search
                                   for (eg: ``10s``).  This should not be
                                   used unless you are familiar with Sentry's
                                   internals as it's restricted to pre-defined
                                   values.
        :auth: required
        """
        # add by hzwangzhiwei
        # if action is "stat", then get the stats category
        action = request.GET.get('action', '')
        if action == 'stat':
            # update by hzwangzhiwei @20160816 for #860
            stats = {'TOTAL': 0, 'RESOLVED': 0, 'MUTED': 0} # result
            from sentry.models import Group, GroupStatus
            from django.utils import timezone
            from datetime import timedelta
            from django.db.models import Count
            # status_map = ['UNRESOLVED', 'RESOLVED', 'MUTED', 'PENDING_DELETION', 'DELETION_IN_PROGRESS', 'PENDING_MERGE']

            # 1. search status == 'RESOLVED'
            statsQuerySet = Group.objects.filter(project_id=project.id, status=GroupStatus.RESOLVED).aggregate(cnt=Count('id'))
            stats['RESOLVED'] = stats['RESOLVED'] + int(statsQuerySet.get('cnt', 0))

            # 2. search auto RESOLVED
            resolve_age = project.get_option('sentry:resolve_age', None)
            if resolve_age:
                statsQuerySet = Group.objects.filter(project_id=project.id, status=GroupStatus.UNRESOLVED, last_seen__lte=(timezone.now()-timedelta(hours=int(resolve_age)))).aggregate(cnt=Count('id'))
                stats['RESOLVED'] = stats['RESOLVED'] + int(statsQuerySet.get('cnt', 0))

            # 3. search all count.
            statsQuerySet = Group.objects.filter(project_id=project.id).aggregate(cnt=Count('id'))
            stats['TOTAL'] = stats['TOTAL'] + int(statsQuerySet.get('cnt', 0))
            
            # 4. ignore count, MUTED
            statsQuerySet = Group.objects.filter(project_id=project.id, status=GroupStatus.MUTED).aggregate(cnt=Count('id'))
            stats['MUTED'] = int(statsQuerySet.get('cnt', 0))

            return Response(stats)

        elif action == 'topIssueType':
            cnt = 15
            try:
                cnt = int(request.GET.get('cnt', ''))
            except:
                cnt = 15

            stats = []
            cursor = connection.cursor()
            # select
            raw_sql = "select id, substring_index(message, ': ',1) as issue_type, count(id) as cnt from sentry_groupedmessage where project_id = %s group by issue_type order by cnt desc limit %s;"
            cursor.execute(raw_sql, [project.id, cnt])
            raw_querySet = dictFetchAll(cursor)
            for s in raw_querySet:
                stats.append({'name': s.get('issue_type', ''), 'value': s.get('cnt', 0)})

            return Response(stats)

        elif action == 'topIssuePerson':
            cnt = 15
            try:
                cnt = int(request.GET.get('cnt', ''))
            except:
                cnt = 15

            stats = []
            cursor = connection.cursor()
            # select
            raw_sql = "select sentry_groupasignee.id, first_name, email, count(user_id) as cnt from sentry_groupasignee join auth_user on sentry_groupasignee.user_id = auth_user.id where project_id = %s group by user_id order by cnt desc limit %s;"
            cursor.execute(raw_sql, [project.id, cnt])
            raw_querySet = dictFetchAll(cursor)
            for s in raw_querySet:
                stats.append({'name': s.get('first_name', ''), 'value': s.get('cnt', 0), 'email': s.get('email', '')})

            return Response(stats)

        stat = request.GET.get('stat', 'received')
        if stat == 'received':
            stat_model = tsdb.models.project_total_received
        elif stat == 'rejected':
            stat_model = tsdb.models.project_total_rejected
        elif stat == 'blacklisted':
            stat_model = tsdb.models.project_total_blacklisted
        else:
            raise ValueError('Invalid stat: %s' % stat)

        data = tsdb.get_range(
            model=stat_model,
            keys=[project.id],
            **self._parse_args(request)
        )[project.id]

        return Response(data)
