# -*- coding: utf-8 -*-
from __future__ import absolute_import

from django.contrib import messages
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _, ugettext

from sentry import roles
from sentry.models import OrganizationMember, OrganizationMemberTeam, Team
from sentry.web.frontend.base import OrganizationView
from sentry.web.forms.edit_organization_member import EditOrganizationMemberForm


class OrganizationMemberSettingsView(OrganizationView):
    def get_form(self, request, member):
        return EditOrganizationMemberForm(
            data=request.POST or None,
            instance=member,
            initial={
                'role': member.role,
                'teams': Team.objects.filter(
                    id__in=OrganizationMemberTeam.objects.filter(
                        organizationmember=member,
                    ).values('team'),
                ),
            }
        )

    def resend_invite(self, request, organization, member):
        messages.success(request, ugettext('An invitation to join %(organization)s has been sent to %(email)s') % {
            'organization': organization.name,
            'email': member.email,
        })

        member.send_invite_email()

        redirect = reverse('sentry-organization-member-settings',
                           args=[organization.slug, member.id])

        return self.redirect(redirect)

    def view_member(self, request, organization, member):
        context = {
            'member': member,
            'enabled_teams': set(member.teams.all()),
            # 'all_teams': Team.objects.filter(
            #     organization=organization,
            # ),
            # 当前登陆人具有权限的小组 update by hzwangzhiwei @20160830
            'all_teams': Team.objects.get_for_user(organization=organization, user=request.user),
            'role_list': roles.get_all(),
        }

        return self.respond('sentry/organization-member-details.html', context)

    def handle(self, request, organization, member_id):
        # 当前登陆人具有权限的小组
        team_list = Team.objects.get_for_user(organization=organization, user=request.user)
        if not team_list:
            team_list = []
        team_list = [team.id for team in team_list]
        try:
            member = OrganizationMember.objects.get(
                Q(user__is_active=True) | Q(user__isnull=True),
                id=member_id,
            )
        except OrganizationMember.DoesNotExist:
            return self.redirect(reverse('sentry'))

        if request.POST.get('op') == 'reinvite' and member.is_pending:
            return self.resend_invite(request, organization, member)

        can_admin = request.access.has_scope('member:delete')

        role_level = 4 # max role level
        if can_admin and not request.is_superuser():
            acting_member = OrganizationMember.objects.get(
                user=request.user,
                organization=organization,
            )
            if acting_member.role == 'owner':
                role_level = 4
            elif  acting_member.role == 'manager':
                role_level = 3
            elif  acting_member.role == 'admin':
                role_level = 2
            elif  acting_member.role == 'member':
                role_level = 1
            else:
                role_level = 0
            can_admin = acting_member.can_manage_member(member)

        if member.user == request.user or not can_admin:
            return self.view_member(request, organization, member)

        form = self.get_form(request, member)
        if form.is_valid():
            member = form.save(request.user, organization, request.META['REMOTE_ADDR'])

            messages.add_message(request, messages.SUCCESS,
                _('Your changes were saved.'))

            redirect = reverse('sentry-organization-member-settings',
                               args=[organization.slug, member.id])

            return self.redirect(redirect)
        print (team_list)
        context = {
            'member': member,
            'form': form,
            'role_list': roles.get_all(),
            'team_list': team_list,
            'role_level': role_level
        }

        return self.respond('sentry/organization-member-settings.html', context)
