# -*- coding: utf-8 -*-
# add by 20160822, a popo notice plugin.

from __future__ import absolute_import

import logging
import sentry

from django.conf import settings
from django import forms
from django.utils.translation import ugettext_lazy as _

from sentry.plugins.bases import notify

from EPlib.popo import POPO

def is_popo(value):
    if not value:
        return False
    # 1. popo 群
    if value.isdigit():
        return True
    # 2. popo email
    if value.endswith('@corp.netease.com') or value.endswith('@mesg.corp.netease.com'):
        return True
    return False
    

class PopoOptionsForm(notify.NotificationConfigurationForm):
    popos = forms.CharField(
        label=_('Notice POPOs'),
        widget=forms.Textarea(attrs={
            'class': 'span6', 'placeholder': '添加需要被通知的POPO群或者人！'}),
        help_text=_('填写POPO通知人/群，每行一个'))

    def clean_popo(self):
        value = self.cleaned_data.get('popo')
        if not is_popo(value):
            raise forms.ValidationError('Invalid POPO')
        return value


class PopoPlugin(notify.NotificationPlugin):
    author = 'hzwangzhiwei'
    author_url = 'http://git-qa.gz.netease.com/groups/hs-tool-group'
    version = sentry.VERSION
    description = "Integrates POPO Notice."
    resource_links = []

    slug = 'Popo'
    title = 'Popo'
    conf_title = title
    conf_key = 'Popo'
    project_conf_form = PopoOptionsForm
    logger = logging.getLogger('sentry.plugins.popo')
    project_default_enabled = True  # add by hzwangzhiwei @20160822, default is open

    def is_configured(self, project, **kwargs):
        return bool(self.get_option('popos', project))

    def get_popo_message(self, group, event, rule):
        if rule:
            rule_label = rule.label or ''
        else:
            rule_label = ''

        msg = "【Sentry 提醒】\n\n规则：" + rule_label + "\n项目：" + group.project.name + '\n\n' + event.message + '\n> ' + group.culprit + '\n\n地址：' + group.get_absolute_url()
        return msg

    def get_popos(self, project):
        popos = self.get_option('popos', project)
        if not popos:
            return ()
        return filter(bool, popos.strip().splitlines())

    def notify_users(self, group, event, fail_silently=False, rule=None):
        message = self.get_popo_message(group, event, rule)
        for popo in self.get_popos(group.project):
            POPO.send_to_user(popo, message, async='1')
