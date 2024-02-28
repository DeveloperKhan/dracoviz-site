import React, { useState } from 'react';
import axios from 'axios';
import Layout from '../components/layout';

async function getProfiles(namesString) {
  const host = `${window.location.protocol}//${window.location.host}`;
  const names = namesString.split(',');
  const batchSize = 20;
  const batches = [];
  for (let i = 0; i < names.length; i += batchSize) {
    batches.push(names.slice(i, i + batchSize));
  }

  const requests = batches.map((batch) => {
    const url = `${host}/api/export/profiles?names=${batch.join(',')}`;
    return axios.get(url, {
      headers: {
        x_authorization: `Basic ${process.env.GATSBY_SECRET_KEY}`,
      },
    });
  });

  const responses = await Promise.all(requests);

  // Combine responses
  let missingValues = [];
  let profileData = [];
  let status = 200;
  responses.forEach((response) => {
    status = Math.max(response.status, status);
    missingValues = missingValues.concat(response.data.missingValues);
    profileData = profileData.concat(response.data.profileData);
  });

  return { data: { missingValues, profileData }, status };
}

function getTournaments(names, date) {
  const host = `${window.location.protocol}//${window.location.host}`;
  const url = `${host}/api/export/tournaments?names=${names}&date=${date}`;

  return axios
    .get(url, {
      headers: {
        x_authorization: `Basic ${process.env.GATSBY_SECRET_KEY}`,
      },
    });
}

function getAuth(password) {
  const host = `${window.location.protocol}//${window.location.host}`;
  const url = `${host}/api/export/auth?password=${password}`;

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
  const [tournaments, setTournaments] = useState();
  const [queryDate, setQueryDate] = useState();
  const [usage, setUsage] = useState();
  const [tournamentUsage, setTournamentUsage] = useState();
  const [password, setPassword] = useState();
  const [authed, setAuthed] = useState(false);
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
  const onTournamentsClick = async () => {
    setLoading(true);
    const response = await getTournaments(tournaments, queryDate);
    setLoading(false);
    if (response.status !== 200) {
      return;
    }
    const { usageData, tournamentUsageData } = response.data;
    setUsage(JSON.stringify(usageData, null, 2));
    setTournamentUsage(JSON.stringify(tournamentUsageData, null, 2));
  };
  const onChange = (event) => {
    const { value } = event.target;
    setNames(value);
  };
  const onTournamentsChange = (event) => {
    const { value } = event.target;
    setTournaments(value);
  };
  const onDateChange = (event) => {
    const { value } = event.target;
    setQueryDate(value);
  };
  const onPasswordChange = (event) => {
    const { value } = event.target;
    setPassword(value);
  };
  const onPasswordSubmit = async () => {
    setLoading(true);
    const response = await getAuth(password);
    setLoading(false);
    if (response.status !== 200) {
      return;
    }
    const { authSuccess } = response.data;
    setAuthed(authSuccess);
  };
  const exportCsv = () => {
    const link = document.createElement('a');
    link.href = encodeURI(profiles);
    link.download = 'data.csv';

    link.click();
  };
  if (!authed) {
    return (
      <Layout>
        <div className="is-layout-constrained">
          <input value={password} onChange={onPasswordChange} />
          <button
            onClick={onPasswordSubmit}
            type="button"
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </Layout>
    );
  }
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
            style={{ width: '100%', minHeight: 100, marginBottom: 20 }}
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
        <h2>Output</h2>
        <label htmlFor="profileList">
          Profile List
          <br />
          <textarea
            id="profileList"
            value={profiles}
            readOnly
            style={{ width: '100%', minHeight: 100, marginBottom: 20 }}
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
            style={{ width: '100%', minHeight: 100, marginBottom: 20 }}
          />
        </label>
        <h1>Usage data export</h1>
        <h2>Input</h2>
        <label htmlFor="tournamentNames">
          Tournament Names
          <br />
          <textarea
            id="tournamentNames"
            placeholder="Enter comma seperated list of names (Earliest first, Latest last)"
            value={tournaments}
            onChange={onTournamentsChange}
            style={{ width: '100%', minHeight: 100, marginBottom: 20 }}
          />
        </label>
        <br />
        <label htmlFor="queryDateInput">
          Query Date
          <br />
          <input
            id="queryDateInput"
            placeholder="MM/DD/YYYY"
            value={queryDate}
            onChange={onDateChange}
            style={{ width: '100%', marginBottom: 20 }}
          />
        </label>
        <br />
        <button
          onClick={onTournamentsClick}
          type="button"
          className="tournaments-button"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Usage'}
        </button>
        <h2>Output</h2>
        <label htmlFor="usageList">
          Usage List
          <br />
          <textarea
            id="usageList"
            value={usage}
            readOnly
            style={{ width: '100%', minHeight: 100, marginBottom: 20 }}
          />
        </label>
        <label htmlFor="tournamentUsageList">
          Dracoviz Tournaments Usage List
          <br />
          <textarea
            id="tournamentUsageList"
            value={tournamentUsage}
            readOnly
            style={{ width: '100%', minHeight: 100, marginBottom: 20 }}
          />
        </label>
      </div>
    </Layout>
  );
}
