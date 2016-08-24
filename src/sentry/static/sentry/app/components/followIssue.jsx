import React from 'react';
import ApiMixin from '../mixins/apiMixin';

const FollowIssue = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired
  },

  mixins: [
    ApiMixin
  ],
  getInitialState() {
    return {
      username: this.props.username,
    };
  },
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.username !== nextState.username;
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps.username != this.props.username) {
      this.setState({
        username: this.props.username
      });
    }
  },
  followIt() {
    this.api.followIt({id: this.props.id, follower: window.Raven._globalContext.user.email});
    this.setState({username: window.Raven._globalContext.user.name});
  },
  render() {
    return (
      <span>
        <a onClick={this.followIt}><span title="我来跟进" className="icon fa fa-fort-awesome"></span></a>
        <div className="assign_name_hzwangzhiwei">{this.state.username}</div>
      </span>
    );
  }
});

export default FollowIssue;