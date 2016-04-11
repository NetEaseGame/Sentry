import React from 'react';

const RedmineId = React.createClass({
  propTypes: {
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.redmineId !== nextProps.redmineId;
    return this.props.redmineURL !== nextProps.redmineURL;
  },

  formatRedmineId(redmine_id){
      redmine_id = parseInt(redmine_id, 10);
      // add by hzwangzhiwei @20160411 
      if (isNaN(redmine_id)) {
        return '';
      }
      return '' + redmine_id;
  },
  redmineIssueUrl(redmine_id, redmine_url) {
    return redmine_url + redmine_id;
  }
  render() {
    return (
      <span>
        <a href="{this.redmineIssueUrl(this.props.redmineId, this.props.redmineURL)}" target="_blank">{this.formatRedmineId(this.props.redmineId)}</a>
      </span>
    );
  }
});

export default RedmineId;
