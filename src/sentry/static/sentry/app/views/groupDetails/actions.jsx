import React from 'react';
import {History} from 'react-router';
import ApiMixin from '../../mixins/apiMixin';
import DropdownLink from '../../components/dropdownLink';
import GroupState from '../../mixins/groupState';
import IndicatorStore from '../../stores/indicatorStore';
import MenuItem from '../../components/menuItem';
import LinkWithConfirmation from '../../components/linkWithConfirmation';
import TooltipMixin from '../../mixins/tooltip';
import {t} from '../../locale';

import Modal, {closeStyle} from 'simple-react-modal';
import XHR from 'xhr.js';

const Snooze = {
  // all values in minutes
  '30MINUTES': 30,
  '2HOURS': 60 * 2,
  '24HOURS': 60 * 24,
};

const GroupActions = React.createClass({
  mixins: [
    ApiMixin,
    GroupState,
    History,
    TooltipMixin({
      selector: '.tip',
      container: 'body',
    }),
  ],
  xhr: new XHR(false),
  getInitialState() {
    return {
      showRedmineModel: false,
      redmineProjects: [],
      redmineTrackers: [],
      redmineVersions: []
    };
  },
  onDelete() {
    let group = this.getGroup();
    let project = this.getProject();
    let org = this.getOrganization();
    let loadingIndicator = IndicatorStore.add(t('Delete event..'));

    this.api.bulkDelete({
      orgId: org.slug,
      projectId: project.slug,
      itemIds: [group.id]
    }, {
      complete: () => {
        IndicatorStore.remove(loadingIndicator);

        this.history.pushState(null, `/${org.slug}/${project.slug}/`);
      }
    });
  },

  onUpdate(data) {
    let group = this.getGroup();
    let project = this.getProject();
    let org = this.getOrganization();
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate({
      orgId: org.slug,
      projectId: project.slug,
      itemIds: [group.id],
      data: data,
    }, {
      complete: () => {
        IndicatorStore.remove(loadingIndicator);
      }
    });
  },

  onToggleBookmark() {
    this.onUpdate({isBookmarked: !this.getGroup().isBookmarked});
  },

  getRedmineUrl() {
    let group = this.getGroup();
    let redmine_url = group.project.redmine;
    if (redmine_url) return redmine_url;
    return false;
  },

  // add by hzwangzhiwei @20160412 copy trace and open redmine URL
  onCopyToRedmine(evt) {
    let redmine_url = this.getRedmineUrl();
    if (redmine_url) {
      window.open(redmine_url);
    }
    else {
      // do thing
    }
  },

  // add by hzwangzhiwei @20160923, do redmine order.
  // 打开remine提单窗口
  onRedmineOrderClick(evt) {
    this.xhr.setAsync(false);
    let project = this.getProject();
    if (!project.redmineToken || !project.redmineHost) {
      alert('请先到项目 Setting / 设置 中配置 Redmine API 相关内容！');
      return;
    }
    let projects = [];
    let trackers = [];
    // 请求redmine api，获取该项目的projects、trackers、versions
    this.xhr.get('http://redmineapi.nie.netease.com/api/project', {
      'token': project.redmineToken, 
      'host': project.redmineHost
    }, function(r) {
      r = r.json(); // get the json result.
      if (r.success) {
        for (var i in r.data) projects.push(i);
      }
      else {
        alert('拉取“项目列表”失败，检查是否 Redmine API 相关配置有误！');
        return;
      }
    });
    // 拉取tracker 
    this.xhr.get('http://redmineapi.nie.netease.com/api/tracker', {
      'token': project.redmineToken, 
      'host': project.redmineHost
    }, function(r) {
      r = r.json(); // get the json result.
      if (r.success) {
        trackers = r.data;
      }
      else {
        alert('拉取“跟踪列表”失败，检查是否 Redmine API 相关配置有误！');
        return;
      }
    });
    // 更新界面
    this.setState({
      showRedmineModel: true, 
      redmineProjects: projects,
      redmineTrackers: trackers
    });
    if (projects && projects.length > 0)
      this.onProjectSelected(null, projects[0]);
  },
  // 当选中某一个redmine项目时，更新周版本
  onProjectSelected(evt, redmineProject) {
    let project = this.getProject();
    if (! redmineProject) redmineProject = this.refs.project_selector.value;
    let versions = [];
    this.xhr.setAsync(true);
    this.xhr.get('http://redmineapi.nie.netease.com/api/version', {
      'token': project.redmineToken, 
      'host': project.redmineHost,
      'project': redmineProject
    }, function(r) {
      r = r.json(); // get the json result.
      if (r.success) {
        versions = r.data;
      }
      else {
        alert('拉取项目“周版本”失败，检查是否 Redmine API 先关配置有误！');
        return;
      }
      this.setState({redmineVersions: versions});
    });
  },
  // 关闭redmine提单弹出框
  closeRedmineModal() {
    this.setState({showRedmineModel: false});
  },
  submitRedmineOrder() {
    let project = this.getProject();
    let group = this.getGroup();

    let redmineProject = this.refs.project_selector.value;
    let redmineTracker = this.refs.tracker_selector.value;
    let redmineVersion = this.refs.version_selector.value;

    if (redmineProject && redmineTracker && redmineVersion) {
      this.xhr.setAsync(true); // async
      this.xhr.post('http://redmineapi.nie.netease.com/api/create_issue ', {
        token: project.redmineToken, 
        host: project.redmineHost,
        project: redmineProject,
        tracker: redmineTracker,
        version: redmineVersion,
        subject: '[Sentry] ' + group.title,
        description: description,
        author_mail: Raven._globalContext.user.email,
        assigned_to_mail: group.assignedTo.email,
        follows: [group.follows.email],
      }, function(r) {
        r = r.json(); // get the json result.
        if (r.success) {
          // 提单成功，获取单号，放到redmineID中
          let redmine_id = r.data.id;
          this.api.updateRedmineId({id: group.id, redmineId: redmine_id});
          // 关闭界面
          this.setState({showRedmineModel: false});
        }
        else {
          alert('Redmine 提单失败【'+ r.api_error_msg +'】，检查是否 Redmine API 先关配置有误！');
          return;
        }
      });
    }
    else {
      alert('请先选择提单的“项目”，“跟踪”，“周版本”，然后再提单！');
    }
  },

  onSnooze(duration) {
    this.onUpdate({
      status: 'muted',
      snoozeDuration: duration,
    });
  },
  componentWillUnmount() {
    this.xhr.abort();
  },
  render() {
    let group = this.getGroup();

    let resolveClassName = 'group-resolve btn btn-default btn-sm';
    if (group.status === 'resolved') {
      resolveClassName += ' active';
    }

    let resolveDropdownClasses = 'resolve-dropdown';

    let bookmarkClassName = 'group-bookmark btn btn-default btn-sm';
    if (group.isBookmarked) {
      bookmarkClassName += ' active';
    }
    let copyredmineClassName = 'btn btn-default btn-sm copy_btns_hzwangzhiwei tip'; // add by hzwangzhiwei @20160412
    let copyTraceText = "[Sentry]" + group.title + "\n";
    copyTraceText += "来源：" + group.culprit + "\n\n";
    copyTraceText += "详细：" + group.permalink;

    let snoozeClassName = 'group-snooze btn btn-default btn-sm';
    if (group.status === 'muted') {
      snoozeClassName += ' active';
    }

    let hasRelease = group.tags.filter(item => item.key === 'release').length;
    let releaseTrackingUrl = '/' + this.getOrganization().slug + '/' + this.getProject().slug + '/settings/release-tracking/';

    return (
      <div className="group-actions">
        <div className="btn-group">
          {group.status === 'resolved' ? (
            group.statusDetails.autoResolved ?
             <a className={resolveClassName + ' tip'}
                 title={t('This event is resolved due to the Auto Resolve configuration for this project')}>
                <span className="icon-checkmark" />
              </a>
            :
              <a className={resolveClassName}
                 title={t('Unresolve')}
                 onClick={this.onUpdate.bind(this, {status: 'unresolved'})}>
                <span className="icon-checkmark" />
              </a>
            )
          :
            [
              <a key="resolve-button"
                 className={resolveClassName}
                 title={t('Resolve')}
                 onClick={this.onUpdate.bind(this, {status: 'resolved'})}>
                {t('Resolve')}
              </a>,
              <DropdownLink
                key="resolve-dropdown"
                caret={true}
                className={resolveClassName}
                topLevelClasses={resolveDropdownClasses}
                title="">
                <MenuItem noAnchor={true}>
                  {hasRelease ?
                    <a onClick={this.onUpdate.bind(this, {status: 'resolvedInNextRelease'})}>
                      <strong>{t('Resolved in next release')}</strong>
                      <div className="help-text">{t('Snooze notifications until this issue reoccurs in a future release.')}</div>
                    </a>
                  :
                    <a href={releaseTrackingUrl} className="disabled tip" title={t('Set up release tracking in order to use this feature.')}>
                      <strong>{t('Resolved in next release.')}</strong>
                      <div className="help-text">{t('Snooze notifications until this issue reoccurs in a future release.')}</div>
                    </a>
                  }
                </MenuItem>
              </DropdownLink>
            ]
          }
        </div>
        <div className="btn-group">
          {group.status === 'muted' ?
            <a className={snoozeClassName}
               title={t('Remove Snooze')}
               onClick={this.onUpdate.bind(this, {status: 'unresolved'})}>
             {t('Snooze')}
            </a>
          :
            <DropdownLink
              caret={false}
              className={snoozeClassName}
              title={t('Snooze')}>
              <MenuItem noAnchor={true}>
                <a onClick={this.onSnooze.bind(this, Snooze['30MINUTES'])}>{t('for 30 minutes')}</a>
              </MenuItem>
              <MenuItem noAnchor={true}>
                <a onClick={this.onSnooze.bind(this, Snooze['2HOURS'])}>{t('for 2 hours')}</a>
              </MenuItem>
              <MenuItem noAnchor={true}>
                <a onClick={this.onSnooze.bind(this, Snooze['24HOURS'])}>{t('for 24 hours')}</a>
              </MenuItem>
              <MenuItem noAnchor={true}>
                <a onClick={this.onUpdate.bind(this, {status: 'muted'})}>{t('forever')}</a>
              </MenuItem>
            </DropdownLink>
          }
        </div>
        <div className="btn-group">
          <a className={bookmarkClassName}
             title={t('Bookmark')}
             onClick={this.onToggleBookmark}>
            <span className="icon-bookmark" />
          </a>
        </div>
        <div className="btn-group">
          <a className={copyredmineClassName}
             title={t('Copy Trace to Redmine')}
             data-clipboard-text={copyTraceText}
             onClick={this.onCopyToRedmine}>
            <span className="fa fa-clipboard" />
          </a>
        </div>
        <div className="btn-group">
          <a className={'btn btn-default btn-sm tip'}
             title={t('Redmine 提单')}
             onClick={this.onRedmineOrderClick}>
            <span className="fa fa-share-square-o" />
          </a>
        </div>
        <div className="btn-group">
          <LinkWithConfirmation
               className="group-remove btn btn-default btn-sm"
               title={t('Delete')}
               message={t('Deleting this event is permanent. Are you sure you wish to continue?')}
               onConfirm={this.onDelete}>
            <span className="icon-trash"></span>
          </LinkWithConfirmation>
        </div>
        {group.pluginActions.length !== 0 &&
          <div className="btn-group more">
            <DropdownLink
                className="btn btn-default btn-sm"
                title={t('More')}>
              {group.pluginActions.map((action, actionIdx) => {
                return (
                  <MenuItem key={actionIdx} href={action[1]}>
                    {action[0]}
                  </MenuItem>
                );
              })}
            </DropdownLink>
          </div>
        }
        
        <Modal style={{'padding': '0'}}
               containerStyle={{'padding': '0'}}
               closeOnOuterClick={true}
               show={this.state.showRedmineModel}
               onClose={this.closeRedmineModal}>

          <form className="form-stacked">
            <div className="box">
              <div className="box-header">
                <h3>Redmine 自动提单</h3>
              </div>
              <div className="box-content with-padding">
                <div className="form-group">
                  <label className="control-label ">Project 项目</label>
                  <select className="select form-control" ref="project_selector" onChange={this.onProjectSelected} tabIndex="-1">
                    { this.state.redmineProjects.map(function(project, i) {
                        return (<option key={i} value={project}>{project}</option>);
                      })
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label className="control-label ">Tracker 跟踪</label>
                  <select className="select form-control" ref="tracker_selector" tabIndex="-1">
                    { this.state.redmineTrackers.map(function(tracker, i) {
                        return (<option key={i} value={tracker}>{tracker}</option>);
                      })
                    }
                  </select>
                </div>
                <div className="form-group">
                  <label className="control-label ">Version 周版本</label>
                  <select className="select form-control" ref="version_selector" tabIndex="-1">
                    { this.state.redmineVersions.map(function(version, i) {
                        return (<option key={i} value={version}>{version}</option>);
                      })
                    }
                  </select>
                </div>
                <div className="form-actions">
                  <button type="button" onClick={this.submitRedmineOrder} className="btn btn-primary btn-sm">确认提单</button>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    );
  }
});

export default GroupActions;
