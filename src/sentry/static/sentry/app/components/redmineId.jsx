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
    // TODO parse redmine url: http://h11.pm.netease.com/projects/h11-bugs/issues/new
    let reg = new RegExp("^http://");
    if (reg.test(this.state.redmineURL)) {
      //start with http://
      let pos = this.state.redmineURL.indexOf("/", 8);
      let root = '';
      if (pos == -1) {
        // can not find /
        return false;
      }
      root = this.state.redmineURL.substring(0, pos);
      if (this.formatRedmineId() === 'unset') {
        return false;
      }
      return root + '/issues/' + this.state.redmineId;
    }
    return false;
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
    // ajax to save to DB, then change state
    this.api.updateRedmineId({id: this.props.id, redmineId: redmine_id});
    this.setState({redmineId: redmine_id});
  },

  render() {
    let issue_url = this.redmineIssueUrl()
    if (issue_url === false) issue_url = '#';
    return (
       <span>
        { issue_url &&
          <a title={this.formatRedmineId()}
            href={issue_url}
            target="_blank"
            className="redmineIdLink">{this.formatRedmineId()}</a>
        }
        { (issue_url === false) &&
          <span className="redmineIdLink">{this.formatRedmineId()}</span>
        }
        &nbsp;&nbsp;
        <span ref="redmineEditIcon" onClick={this.showRedmineIdInput} className="icon fa fa-pencil-square-o redmineEditIcon"></span>
      </span>
    );
  }
});

export default RedmineId;