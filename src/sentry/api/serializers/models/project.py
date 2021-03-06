from __future__ import absolute_import

from sentry.api.serializers import Serializer, register
from sentry.models import Project


@register(Project)
class ProjectSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        from sentry import features

        feature_list = []
        if features.has('projects:quotas', obj, actor=user):
            feature_list.append('quotas')
        if features.has('projects:global-events', obj, actor=user):
            feature_list.append('global-events')
        if features.has('projects:user-reports', obj, actor=user):
            feature_list.append('user-reports')

        return {
            'id': str(obj.id),
            'slug': obj.slug,
            'name': obj.name,
            'isPublic': obj.public,
            'dateCreated': obj.date_added,
            'firstEvent': obj.first_event,
            'redmineToken': obj.redmine_token, # add by hzwangzhiwei@20160926 add redmine api info.
            'redmineHost': obj.redmine_host,
            'features': feature_list,
        }
