import React from 'react';

import Layout from '../components/layout';
import Seo from '../components/seo';

function GraphicBuilder() {
  const title = "Dracoviz Team Graphic Builder";
  const description = "Make Pokemon GO team graphics for social media, stream content, and more. Full Pokedex with Pokémon HOME sprites."

  return (
    <Layout>
      <Seo title={title} description={description} />
      <h1>Graphic Builder</h1>
    </Layout>
  );
}

export default GraphicBuilder;
