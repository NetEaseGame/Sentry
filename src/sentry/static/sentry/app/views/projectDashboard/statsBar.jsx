import React from 'react';
import ApiMixin from '../../mixins/apiMixin';
import LoadingError from '../../components/loadingError';
import LoadingIndicator from '../../components/loadingIndicator';
import {t} from '../../locale';

const TeamStatsBar = React.createClass({
  propTypes: {
    endpoint: React.PropTypes.string.isRequired
  },

  mixins: [
    ApiMixin
  ],
  getInitialState() {
    return {
      statsData: {},
      loading: true,
      error: false
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  componentWillReceiveProps() {
    this.setState({
      loading: true,
      error: false
    }, this.fetchData);
  },

  fetchData() {
    this.api.request(this.props.endpoint, {
      query: {
      },
      success: (data) => {
        this.setState({
          statsData: data,
          loading: false,
          error: false
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true
        });
      }
    });
  },

  render() {
    console.log(this.state.statsData);
    return (
      <div className="row team-stats">
        <div className="col-md-3 stat-column">
          <span className="count">{this.state.statsData.total || 0}</span>
          <span className="count-label">{t('Total Count')}</span>
        </div>
        <div className="col-md-3 stat-column">
          <span className="count">{this.state.statsData.total || 0}</span>
          <span className="count-label">{t('Solved Count')}</span>
        </div>
        <div className="col-md-3 stat-column">
          <span className="count">{this.state.statsData.total || 0}</span>
          <span className="count-label">{t('Ignore Count')}</span>
        </div>
        <div className="col-md-3 stat-column align-right bad">
          <span className="count">{this.state.statsData.total || 0}%</span>
          <span className="count-label">{t('Done rate')}</span>
        </div>
      </div>
    );
  }
});

export default TeamStatsBar;

