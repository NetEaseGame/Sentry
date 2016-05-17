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

  done_rate() {
    if (this.state.statsData.TOTAL == 0) {
      return "";
    }
    else {
      return ((this.state.statsData.RESOLVED + this.state.statsData.MUTED) * 100 / this.state.statsData.TOTAL).toFixed(2);
    }
  },

  render() {
    let rate = this.done_rate();
    let classname = 'col-md-3 stat-column align-right bad';
    if (rate == "" || rate >= 80) {
      classname = 'col-md-3 stat-column align-right good';
    }
    else if (rate >=50 && rate <= 80) {
      classname = 'col-md-3 stat-column align-right mid';
    }
    else {
      classname = 'col-md-3 stat-column align-right bad';
    }

    if (rate != "") {
      rate = rate + " %";
    }

    return (
      <div className="row team-stats">
        <div className="col-md-3 stat-column">
          <span className="count">{this.state.statsData.TOTAL || 0}</span>
          <span className="count-label">{t('Total Count')}</span>
        </div>
        <div className="col-md-3 stat-column">
          <span className="count">{this.state.statsData.RESOLVED || 0}</span>
          <span className="count-label">{t('Solved Count')}</span>
        </div>
        <div className="col-md-3 stat-column">
          <span className="count">{this.state.statsData.MUTED || 0}</span>
          <span className="count-label">{t('Ignore Count')}</span>
        </div>
        <div className={classname}>
          <span className="count">{rate}</span>
          <span className="count-label">{t('Done rate')}</span>
        </div>
      </div>
    );
  }
});

export default TeamStatsBar;

