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
  },

  showEditIcon(e) {
    this.refs.redmineEditIcon.className = 'icon fa fa-pencil-square-o redmineEditIcon';
  },

  hideEditIcon(e) {
    this.refs.redmineEditIcon.className = 'icon fa fa-pencil-square-o redmineEditIcon hidden_hzwangzhiwei';
  },

  showRedmineIdInput() {
    let redmine_id = prompt("Input the Redmine Issue ID(输入Redmine上的对应的单号)：", "");
    // TODO check the input is number
    redmine_id = parseInt(redmine_id);
    if (isNaN(redmine_id)) {
      alert("Redmine Issue ID must be a Number(Redmine单号应该是一个数字)!");
      return ;
    }

    this.setState({
      redmineId: redmine_id,
    });
  },

  render() {
    return (
      <span onMouseOver={this.showEditIcon} onMouseOut={this.hideEditIcon}>
        <a title="{this.formatRedmineId(this.props.redmineId)}" 
           href="{this.redmineIssueUrl(this.props.redmineId, this.props.redmineURL)}" 
           target="_blank"
           className="redmineIdLink">{this.formatRedmineId(this.props.redmineId)}</a>
        &nbsp;&nbsp;
        <span ref="redmineEditIcon" onClick={this.showRedmineIdInput} className="icon fa fa-pencil-square-o redmineEditIcon hidden_hzwangzhiwei"></span>
      </span>
    );
  }
});

export default RedmineId;
