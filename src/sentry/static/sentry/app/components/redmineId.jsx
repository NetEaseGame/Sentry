import React from 'react';
import ApiMixin from '../mixins/apiMixin';

const RedmineId = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired
  },

  mixins: [
    ApiMixin
  ],
  getInitialState() {
    return {
      redmineId: this.props.redmineId,
      redmineURL: this.props.redmineURL
    };
  },
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.redmineId !== nextState.redmineId || this.state.redmineURL !== nextState.redmineURL;
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        redmineId: this.props.redmineId,
        redmineURL: this.props.redmineURL
      });
    }
  },
  formatRedmineId(){
      let redmine_id = parseInt(this.state.redmineId, 10);
      if (isNaN(redmine_id)) {
        return 'unset';
      }
      return '' + redmine_id;
  },

  redmineIssueUrl() {
    // TODO parse redmine url
    return this.state.redmineURL + this.state.redmineId;
  },

  showEditIcon(e) {
    this.refs.redmineEditIcon.className = 'icon fa fa-pencil-square-o redmineEditIcon';
  },

  hideEditIcon(e) {
    this.refs.redmineEditIcon.className = 'icon fa fa-pencil-square-o redmineEditIcon hidden_hzwangzhiwei';
  },

  showRedmineIdInput() {
    let redmine_id = prompt("Input the Redmine Issue ID(输入Redmine上的对应的单号)：", "");
    if (redmine_id == null) {
      return; // cancel, do nothing
    }

    if (redmine_id != '') {
      redmine_id = parseInt(redmine_id, 10);
      if (isNaN(redmine_id)) {
        alert("Redmine Issue ID must be a Number(Redmine单号应该是一个数字)!");
        return ;
      }
    }
    // TODO ajax to save to DB, then change state
    this.api.updateRedmineId({id: this.props.id, redmineId: redmine_id});
    this.setState({redmineId: redmine_id});
  },

  render() {
    return (
      <span onMouseOver={this.showEditIcon} onMouseOut={this.hideEditIcon}>
        <a title="{this.formatRedmineId()}" 
           href="{this.redmineIssueUrl()}" 
           target="_blank"
           className="redmineIdLink">{this.formatRedmineId()}</a>
        &nbsp;&nbsp;
        <span ref="redmineEditIcon" onClick={this.showRedmineIdInput} className="icon fa fa-pencil-square-o redmineEditIcon hidden_hzwangzhiwei"></span>
      </span>
    );
  }
});

export default RedmineId;