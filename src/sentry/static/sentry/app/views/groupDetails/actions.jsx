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
  onRedmineOrderClick(evt) {
    this.setState({showRedmineModel: true});
  },
  closeRedmineModal() {
    this.setState({showRedmineModel: false});
  },
  onSnooze(duration) {
    this.onUpdate({
      status: 'muted',
      snoozeDuration: duration,
    });
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
        
        <Modal style={{background: 'red'}}
               containerStyle={{background: 'blue'}}
               closeOnOuterClick={true}
               show={this.state.showRedmineModel}
               onClose={this.closeRedmineModal.bind(this)}>
          <div>hey</div>
        </Modal>
      </div>
    );
  }
});

export default GroupActions;
