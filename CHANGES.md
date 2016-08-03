Version 2016-08-03 #847
-------------

- issue合并的时候，取最大的redmine单号；

Version 2016-08-03 #846
-------------

- 设置自动解决的最大时间为30天；

Version 2016-08-03 #845
-------------

- 项目配置页面增加一个输入框，填写所有可同行的server_name;
- 接受trace的地方，过滤server_names


Version 8.0.2
-------------

- Fix ``IntegrityError`` after merging groups.
- Be less noisy about ``Cannot digest timeline, timeline is not in the ready state.``
- Fix incorrect ``Install`` links.
- Fixed being able to select a Chinese locale.
- Multiple bulk deletion improvements and bug fixes.
- Clarify ``Forcing documentation sync`` error messaging.

Version 8.0.1
-------------

- Ignore ``blob:`` urls in hashing algorithms.
- Bump ``extra`` data size to 16k (previously 4k)
- Fixed some odd behavior where superusers appeared as members of a team when they weren't.
- By default, new superusers created through ``sentry createuser`` will be added as a member to a team, if there is only one team available.

Version 8.0.0
-------------

Version 8 of Sentry introduces a brand new frontend. Most of the application has been overhauled
and rewritten on top of React and our web API. Additionally many new features have been exposed
related to workflows (user assignment, snooze, resolution) and release tracking. This changelog
does not attempt to capture the six+ months of incremental features and improvements in this
release of Sentry.

A Note on MySQL
~~~~~~~~~~~~~~~

Due to numerous issues over the years and recent discoveries that nearly all schema migration was
broken in MySQL (due to some behavior in our migration tool), we've made the decision to no longer
support MySQL. It is possible to bring the schema up to date on a MySQL machine, but Sentry's
automated migrations will likely not work and require DBA assistance.

Postgres is now the only supported production database.

A Note on Workers
~~~~~~~~~~~~~~~~~

In the past it was supported to run Sentry's queue workers with the `-B` option to also spawn
a celery beat process within the worker.  This is no longer supported as it causes problems in
some queue setups (in particular if redis is being used).  Instead you should now spawn two
independent processes.  This is outlined in the installation documentation.

Changes to Quotas
~~~~~~~~~~~~~~~~~

Team and System based quotas are now longer available. A new organization-relative project quota replaces them
and can be configured via Rate Limits on the organization dashboard.

Notification Digests
~~~~~~~~~~~~~~~~~~~~

Email notifications will now automatically rollup if the rate of notifications exceeds a threshold. These can be
configured on a per project basis in Project Settings.

Configuration
~~~~~~~~~~~~~

An Install Wizard has been added to aid in configuring necessary first-run options. Notably your Admin Email,
and URL Prefix. The Installation Wizard will also help any future updates and aid when new options are introduced.

A new configuration backend is now utilized for several options. These options can now be
configured via the web UI.

- A new configuration file, `config.yml` has been introduced. This new file is generated during `sentry init`
  the first time, and expected to be pointed at a directory. `config.yml` is the home for new configuration options that will be moved from the existing python config file.

- ``SENTRY_URL_PREFIX`` has been deprecated, and moved to `system.url-prefix` inside of `config.yml` or it
  can be configured at runtime.

- ``INTERNAL_IPS``, if configured, will now restrict superuser access to only users with both ``is_superuser``
  and a matching IP.

CLI
~~~

The `sentry` CLI tooling has been rewritten to be faster and less confusing.

Static files
~~~~~~~~~~~~

Static files are now served with a far-futures Cache-Control header, and are versioned by default. If you were serving `/_static/` explicitly from your server config, you may need to update your rules or adjust the `STATIC_URL` setting accordingly.

General
~~~~~~~

- Source builds now require Node 0.12.x or newer.
- The ``public`` setting on projects has been removed
  - This also removes ``SENTRY_ALLOW_PUBLIC_PROJECTS``
- Clients which were only sending ``sentry_key`` and not using CORS will no
  longer be able to authenticate.
- All incoming events now log through ``sentry.api``, which will additionally
  capture far more events with improved console formatting.
- The 'sentry' user can no longer be removed.
- The Cassandra nodestore backend was broken, and this has been resolved.
- The ``has_perm`` plugin hook is no longer used.
- Do not unconditionally map sys.stdout to sys.stderr
- The HTTP interface's internal structure has greatly changed. Headers and Cookies are now lists. Body
  is now stored as a string.
- The internal metrics backend now supports both Datadog and a simple logging implementation (useful in DEBUG).
- Member roles can now view client keys (DSNs).
- Documentation for configuration wizards is now pulled from docs.getsentry.com as part
  of the ``upgrade`` and ``repair`` processes.
- The SSO flow for existing users has been greatly improved to avoid duplicate accounts.
- Deletions are delayed for one hour and can be cancelled by changing the status
  back to ``VISIBLE``.
- Membership permissions have been overhauled and have been flattened into a single tiered
  role. Additionally owners will no longer be automatically added to new teams.
- ``NotificationPlugin`` now requires ``is_configured`` to be declared.
- ``sentry.search`` should no longer be extended (``index`` and ``upgrade`` have been removed)

Client API
~~~~~~~~~~

- The ``culprit`` attribute will now automatically be filled when not present.
- The ``in_app`` attribute on frames will now be computed on event submission when not present.
- The ``ip_address`` value will always be stored on the user interface when possible.
- The user interface no longer accepts data missing one of the required identifiers.
- The ``fingerprint`` value is now stored in ``Event.data``.
- The ``environment`` attribute is now soft-accepted and tagged.

Schema Changes
~~~~~~~~~~~~~~

- Removed the ``Project.platform`` column.
- Removed the ``Project.organization`` column.
- Removed the ``AccessGroup`` table.
- Added ``EventUser`` table.
- Added ``user.{attribute}`` to search backends.
- Added ``Project.first_event`` column.
- Added ``Release.owner`` column.
- Added ``Organization.default_role`` column.
- Added ``OrganizationMember.role`` column.
- Added ``Broadcast.upstream_id`` column.
- Removed ``Broadcast.badge`` column.
- Added ``Broadcast.title`` column.
- Migrated blob data in ``File`` to ``FileBlob``.
- Removed ``File.storage`` column.
- Removed ``File.storage_options`` columns.
- Added ``OrganizationOption`` table.
- Added ``GroupSnooze`` table.
- Added ``GroupResolution`` table.
- Added ``GroupBookmark.date_added`` column.
- Removed ``User.last_name`` column.
- (App-only) Renamed ``User.first_name`` to ``User.name``.
- Removed ``Activity.event`` column.
- Removed ``Event.num_comments`` column.