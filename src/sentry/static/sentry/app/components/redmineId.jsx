import React from 'react';

const RedmineId = React.createClass({
  propTypes: {
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.redmineId !== nextProps.redmineId;
  },

  formatRedmineId(redmine_id){
      redmine_id = parseInt(redmine_id, 10);
      // add by hzwangzhiwei @20160411 
      if (isNaN(redmine_id)) {
        return '';
      }
      return '' + redmine_id;
  },

  render() {
    return (
      <span>{this.formatRedmineId(this.props.redmineId)}</span>
    );
  }
});

export default RedmineId;
