import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../components/layout';

function getProfiles(names) {
  const host = `${window.location.protocol}//${window.location.host}`;
  const url = `${host}/api/profiles?names=${names}`;

  return axios
    .get(url, {
      headers: {
        x_authorization: `Basic ${process.env.GATSBY_SECRET_KEY}`,
      },
    });
}

function formatDataToCsv(data) {
  const myArr = [
    ['name', 'tournament', 'final_rank', 'match_wins', 'match_losses', 'game_wins', 'game_losses'],
  ];
  data.forEach((player) => {
    const { tournaments, name } = player;
    tournaments?.forEach((t) => {
      const {
        tournament, final_rank, match_wins, match_losses, game_wins, game_losses,
      } = t;
      myArr.push([name, tournament, final_rank, match_wins, match_losses, game_wins, game_losses]);
    });
  });
  let csvContent = 'data:text/csv;charset=utf-8,';
  myArr.forEach((rowArray) => {
    const row = rowArray.join(',');
    csvContent += `${row}\r\n`;
  });
  return csvContent;
}

export default function ProfileExport() {
  const [names, setNames] = useState();
  const [missing, setMissing] = useState();
  const [profiles, setProfiles] = useState();
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const response = await getProfiles(names);
    setLoading(false);
    if (response.status !== 200) {
      return;
    }
    const { missingValues, profileData } = response.data;
    setMissing(missingValues);
    const data = profileData?.length > 0
      ? profileData.map((x) => JSON.parse(x))
      : JSON.parse(profileData);
    const csv = formatDataToCsv(data);
    setProfiles(csv);
  };
  const onChange = (event) => {
    const { value } = event.target;
    setNames(value);
  };
  const exportCsv = () => {
    const encodedUri = encodeURI(profiles);
    window.open(encodedUri);
  };
  return (
    <Layout>
      <div className="is-layout-constrained">
        <h1>Profiles Export</h1>
        <h2>Input</h2>
        <label htmlFor="playerNames">
          Player Names
          <br />
          <textarea
            id="playerNames"
            placeholder="Enter comma seperated list of names"
            value={names}
            onChange={onChange}
            style={{ width: '100%', marginBottom: 20 }}
          />
        </label>
        <br />
        <button
          onClick={onClick}
          type="button"
          className="tournaments-button"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Profiles'}
        </button>
        <hr style={{ marginTop: 20 }} />
        <h2>Output</h2>
        <label htmlFor="profileList">
          Profile List
          <br />
          <textarea
            id="profileList"
            value={profiles}
            readOnly
            style={{ width: '100%', marginBottom: 20 }}
          />
        </label>
        <br />
        <button
          onClick={exportCsv}
          type="button"
          className="tournaments-button"
          disabled={loading}
          style={{ marginBottom: 20 }}
        >
          {loading ? 'Loading...' : 'Export CSV'}
        </button>
        <br />
        <label htmlFor="missing">
          Missing Names
          <br />
          <textarea
            id="missing"
            value={missing}
            readOnly
            style={{ width: '100%', marginBottom: 20 }}
          />
        </label>
      </div>
    </Layout>
  );
}
