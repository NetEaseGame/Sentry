import React from 'react';

import {t} from '../../locale';

const BlameInfoData = React.createClass({
  propTypes: {
    blameInfo: React.PropTypes.array.isRequired
  },

  render() {
    let type = 'blameInfo';
    return (
      <div className={'box'}>
        <div className="box-header">
          <a name={type} href={'#' + type} className="permalink">
            <em className="icon-anchor" />
          </a>
          <h3>{t('Blame Informations')}</h3>
        </div>
        <div className="box-content with-padding">
          <div className="box-clippable">
            <table className="table key-value">
              <thead>
                <tr>
                  <th>Log</th>
                  <th>Version</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
              {
                this.props.blameInfo.map(function(info, i) {
                  return (
                    <tr key={'blame_info_' + i}>
                      <td className="value"><pre>{info.log}</pre></td>
                      <td className="value"><pre>{info.version}</pre></td>
                      <td className="value"><pre>{info.user}</pre></td>
                      <td className="value"><pre>{info.time}</pre></td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
});

export default BlameInfoData;
