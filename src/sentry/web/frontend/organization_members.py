# -*- coding: utf-8 -*-
from __future__ import absolute_import

from django.db.models import Q

from sentry import roles
from sentry.models import (
    AuthProvider, OrganizationAccessRequest, OrganizationMember, Team, OrganizationMemberTeam
)
from sentry.web.frontend.base import OrganizationView
from django.core.urlresolvers import reverse


class OrganizationMembersView(OrganizationView):
    def handle(self, request, organization, team=None):
        # 当前登陆人具有权限的小组
        team_list = Team.objects.get_for_user(organization=organization, user=request.user)
        if not team_list:
            team_list = []

        if team is None:
            if len(team_list) > 0:
                team = team_list[0]
            if team:
                # 当前登陆用户有小组，直接选择第一个小组，跳转过去
                redirect_uri = reverse('sentry-organization-team-members', args=[organization.slug, team.slug])
            else:
                # 当前用不存在任何小组，那么，直接跳转到首页
                redirect_to = reverse('sentry-auth-organization', args=[organization.slug])
            # 跳转
            return self.redirect(redirect_uri)

        # 查询当前这个小组内的成员
        queryset = OrganizationMemberTeam.objects.filter(
            Q(user__is_active=True) | Q(user__isnull=True),
            organization=organization,
        ).select_related('organizationmember').select_related('user')

        queryset = sorted(queryset, key=lambda x: x.email or x.user.get_display_name())

        try:
            auth_provider = AuthProvider.objects.get(organization=organization)
        except AuthProvider.DoesNotExist:
            auth_provider = None

        member_list = []
        for om in queryset:
            print (om.role)
            needs_sso = bool(auth_provider and not getattr(om.flags, 'sso:linked'))
            member_list.append((om, needs_sso))

        # if the member is not the only owner we allow them to leave the org
        member_can_leave = any(
            1 for om, _ in member_list
            if (om.role == roles.get_top_dog().id
                and om.user != request.user
                and om.user is not None)
        )

        # TODO(dcramer): ideally member:write could approve
        can_approve_requests_globally = request.access.has_scope('org:write')
        can_add_members = request.access.has_scope('org:write')
        can_remove_members = request.access.has_scope('member:delete')

        # pending requests
        if can_approve_requests_globally:
            access_requests = list(OrganizationAccessRequest.objects.filter(
                team__organization=organization,
                member__user__is_active=True,
            ).select_related('team', 'member__user'))
        elif request.access.has_scope('team:write') and request.access.teams:
            access_requests = list(OrganizationAccessRequest.objects.filter(
                member__user__is_active=True,
                team__in=request.access.teams,
            ).select_related('team', 'member__user'))
        else:
            access_requests = []

        context = {
            'org_has_sso': auth_provider is not None,
            'member_list': member_list,
            'request_list': access_requests,
            'ref': request.GET.get('ref'),
            'can_add_members': can_add_members,
            'can_remove_members': can_remove_members,
            'member_can_leave': member_can_leave,
            'team_list': team_list
        }

        return self.respond('sentry/organization-members.html', context)
