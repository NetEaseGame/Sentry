from __future__ import absolute_import

from sentry.plugins import register

from .plugin import PopoPlugin

register(PopoPlugin)
