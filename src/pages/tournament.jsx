import React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';
import TournamentRoster from '../components/tournamentroster';

function TournamentPage({ location }) {
  const siteTitle = 'tournamentnena';

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="Tournament" />
      <main>
        <h1>playing pokmoen</h1>
        <p>Tournamnets rock!!!1</p>
        <TournamentRoster />
      </main>
    </Layout>
  );
}

export default TournamentPage;
