/* eslint-disable max-len */
/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useState, useEffect } from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';





/**
<SearchBar
  {...props.searchProps}
  style={{ width: "400px", height: "40px" }}
/>
* */
const playerDict = {};


function GBL({ response }) {
  if (response == null || response.gbl == null) {
    return;
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

  
  const divStyle = {
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <div>
      <div>
        <select value={selectedSeason} onChange={handleSeasonChange} style={{ fontFamily: 'var(--fontFamily-sans)' }}>
          {seasons.map((season) => (
            <option key={season} value={season}>
              Season {season}
            </option>
          ))}
        </select>
      </div>
      <br/>
      <div className="data-container">
        {filteredData.map((item, index) => (
          <div key={index} className="data-item grid-container" style={{ fontWeight: 'var(--fontWeight-semibold)', fontFamily: 'var(--fontFamily-sans)' }}>
            <div className="grid-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}><b>{finalDay.rank == null || finalDay.rank == "Unk" || finalDay.rank == "unk" || finalDay.rank == 501 ? "Unknown" : finalDay.rank}</b></div>
                <label>Final Rank</label>
              </div>
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}><b>{finalDay.rating == null || finalDay.rating == "Unk" || finalDay.rating == "unk" ? "Unknown" : finalDay.rating}</b></div>
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
              <div className="grid-item">
                <div style={{ fontSize: '30px' }}><b>{(item.score*100).toFixed(2)}%</b></div>
                <label>Performance Rating</label>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
  

export default GBL;
