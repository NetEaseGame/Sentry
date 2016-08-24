import React from 'react';
import ApiMixin from '../mixins/apiMixin';

const FollowIssue = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    follower: React.PropTypes.object.isRequired
  },

  mixins: [
    ApiMixin
  ],
  getInitialState() {
    return {
      follower: this.props.follower,
    };
  },
  componentWillReceiveProps(nextProps) {
      this.setState({
        follower: this.props.follower
      });
  },
  followIt() {
    let follower = {
      name: window.Raven._globalContext.user.name,
      email: window.Raven._globalContext.user.email,
      id: window.Raven._globalContext.user.id,
    };
    this.api.followIt({id: this.props.id, follower: follower, follower_id: window.Raven._globalContext.user.id});
    this.setState({follower: follower});
  },
  render() {
    let username = '暂无';
    if (this.state.follower && this.state.follower.name) {
      username = this.state.follower.name;
    }
    return (
      <span>
        <a onClick={this.followIt}><span title="我来跟进" className="icon fa fa-fort-awesome"></span></a>
        <div className="assign_name_hzwangzhiwei">{username}</div>
      </span>
    );
  }
});

export default FollowIssue;