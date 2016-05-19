import React from 'react';
import ApiMixin from '../../mixins/apiMixin';
import LoadingError from '../../components/loadingError';
import LoadingIndicator from '../../components/loadingIndicator';
import {t} from '../../locale';

import ReactEcharts from 'react-echarts-component';

const TopIssuePersonPieChart = React.createClass({
  propTypes: {
    endpoint: React.PropTypes.string.isRequired,
    cnt: React.PropTypes.string.isRequired
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
  // 将statData转为echart option
  getOption() {
    let legend_data = [];
    this.state.statsData.map(function(e) {
      legend_data.push(e['name'])
    });
    // [
    //     {value:335, name:'直接访问'},
    //     {value:310, name:'邮件营销'},
    //     {value:234, name:'联盟广告'},
    //     {value:135, name:'视频广告'},
    //     {value:1548, name:'搜索引擎'}
    // ]
    let testOption = {
        title : {
            text: 'Trace类型 TOP ' + this.props.cnt + "占比情况",
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: legend_data
        },
        series : [
            {
                name: 'Trace类型',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:this.state.statsData,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    return testOption;
  },

  render() {
    let option = this.getOption();
    return (
      <ReactEcharts
        height={400}
        option={option} />
    );
  }
});
export default TopIssuePersonPieChart;
