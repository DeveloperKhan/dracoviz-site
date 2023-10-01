/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable max-len */
/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useState } from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

function GBL({ response }) {
  if (response == null || response.gbl == null) {
    return undefined;
  }

  const seasons = [...new Set(response.gbl.map((item) => item.season))];

  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const filteredData = response.gbl.filter((item) => item.season === selectedSeason);

  const finalDay = filteredData
    .map((filt) => filt.days.find((day) => day.day === 'final'))
    .find((day) => day !== undefined);

  const count = filteredData.reduce((totalCount, filt) => {
    const daysOnLeaderboard = filt.days.filter((day) => day.rank < 501 && day.day !== 'final');
    return totalCount + daysOnLeaderboard.length;
  }, 0);

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
  };

  return (
    <div>
      <div>
        <select
          value={selectedSeason}
          onChange={handleSeasonChange}
          style={{ fontFamily: 'var(--fontFamily-sans)' }}
        >
          {seasons.map((season) => (
            <option key={season} value={season}>
              Season
              {' '}
              {season}
            </option>
          ))}
        </select>
      </div>
      <br />
      <div className="data-container">
        {filteredData.map((item) => (
          <div
            key={item.season}
            className="data-item grid-container"
            style={{
              fontWeight: 'var(--fontWeight-semibold)',
              fontFamily: 'var(--fontFamily-sans)',
            }}
          >
            <div className="gbl-item-row">
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}>
                  <b>
                    {
                      finalDay.rank == null
                      || finalDay.rank === 'Unk'
                      || finalDay.rank === 'unk'
                      || finalDay.rank === 'Unk.'
                      || finalDay.rank === 'unk.'
                      || finalDay.rank === 501
                      || finalDay.rank === '501'
                        ? 'Unknown'
                        : finalDay.rank
                    }
                  </b>
                </div>
                <label>Final Rank</label>
              </div>
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}>
                  <b>
                    {
                      finalDay.rating == null
                      || finalDay.rating === 'Unk'
                      || finalDay.rating === 'unk'
                      || finalDay.rating === 'unk.'
                      || finalDay.rating === 'Unk.'
                        ? 'Unknown'
                        : finalDay.rating
                      }
                  </b>
                </div>
                <label>Final Rating</label>
              </div>
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}><b>{count}</b></div>
                <label>Days on Leaderboard</label>
              </div>
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}><b>{item.peakRank}</b></div>
                <label>Peak Rank</label>
              </div>
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}><b>{item.peakRating}</b></div>
                <label>Peak Rating</label>
              </div>
              <div style={{backgroundColor:"white"}} className="grid-item" data-tooltip-id="pokemon-item" data-tooltip-content={"Performance Rating is a player’s leaderboard percentile finish averaged across an entire season"}>
                <div style={{ fontSize: '30px' }}>
                  <b>{(item.score * 100).toFixed(2)}%</b>
                </div>
                <div>
                  <label>Performance Rating</label>
                  <span className="tooltip">
                      <span>ℹ️</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default GBL;
