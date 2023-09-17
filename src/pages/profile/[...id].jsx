import React, { useEffect, useState } from 'react';
import { Link, graphql } from 'gatsby';
import axios from 'axios';
import { GatsbyImage } from 'gatsby-plugin-image';
import parse from 'html-react-parser';
import { Router } from '@reach/router';
import {
 Twitter, Facebook, Whatsapp, Telegram, Reddit,
} from 'react-social-sharing';
import TableOfContents from '../../components/table-of-contents';
import hello from '../../../static/hello2.png'; // Adjust the path to your image
import {getAchievements} from '../../utils/achievements';


// We're using Gutenberg so we need the block styles
// these are copied into this project due to a conflict in the postCSS
// version used by the Gatsby and @wordpress packages that causes build
// failures.
// @todo update this once @wordpress upgrades their postcss version
import '../../css/@wordpress/block-library/build-style/style.css';
import '../../css/@wordpress/block-library/build-style/theme.css';

import { Helmet } from 'react-helmet';
import Layout from '../../components/layout';
import Seo from '../../components/seo';
import Pills from '../../components/pills';
import ProfileRoster from '../../components/profileroster';
import GBL from '../../components/gbl';
import { delinkifyEvent } from '../../utils/url-utils';

const tableOfContentsItems = [
  {
    location: 'play-pokemon',
    title: 'Play! Pokemon',
  },
  {
    location: 'go-battle-league',
    title: 'Go Battle League',
  }
];

function PlayerTemplate(props) {
  const name = props.params.id;
  const [content, setContent] = useState();
  const [profile, setProfile] = useState(null); // Initialize with null or an initial value if needed


  const host = `${window.location.protocol}//${window.location.host}`;
  const tmUrl = `${host}/api/tournament?searchType=profile&name=${name}`

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(tmUrl, {
        headers: {
          'x_authorization': `Basic ${process.env.GATSBY_SECRET_KEY}` 
        }
      })
      .then((response) => {
        setProfile(response);
        setIsLoading(false); // Set loading to false when data is fetched
      });
  }, []);

  const postLink = 'https://www.dracoviz.com';

  const containerStyle = {
    padding: '20px', // Adjust the padding as needed
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '1150px', // Adjust the maximum width as needed
    margin: '0 auto', // Center the container horizontally
  };

  const playerProfileStyle = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: '400',
    fontSize: '40px',
  };
  const usernameStyle = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: '400',
    fontSize: '25px',
    marginTop: '-40px', // Adjust this value as needed
  };
  const achievementsStyle = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: '400',
    fontSize: '25px',
    marginTop: '-10px', // Adjust this value as needed
  };
  const achievementNameStyle = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: '400',
    fontSize: '15px',
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)', // 8 columns, each with 1 fraction of the available space
    gap: '10px', // Adjust the gap between images
  };

  const gridItemStyle = {
    width: '100%', // Ensure images expand to fill the grid column
    overflow: 'hidden', // Prevent images from overflowing their container
  };

  const imageStyle = {
    width: '100%', // Ensure images fill their container
    height: 'auto', // Maintain aspect ratio
  };
  var achievements = [];
  var imageElements = [];
  if (profile !== null) {
    achievements = getAchievements(profile.data[0]);
  }


  // Render the list of images in the grid
  imageElements = achievements.map((achievement, index) => (
    <div key={index} style={gridItemStyle}>
      <img src={achievement.image} alt={`Image ${index + 1}`} style={imageStyle} />
      <div style={achievementNameStyle}>{achievement.name}</div>
    </div>
  ));


  return (
    <Layout>
      <Seo title={name} description={name} />    
      <div style={containerStyle}>
        <div style={playerProfileStyle}>
          <p><b>PLAYER PROFILE</b></p>
        </div>
        <div style={usernameStyle}>
          <p>{name}</p>
        </div>
        <div style={achievementsStyle}>
          <p><b>Player Achievements</b></p>
        </div>
        <div>
          <div style={gridContainerStyle}>{imageElements}</div>
        </div>
      </div>
      <div className="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
        <TableOfContents items={tableOfContentsItems} />

        <div class="play-pokemon wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
        <h2 class="wp-block-heading">Play! Pokemon</h2>
      </div>
      {!isLoading && (
        <ProfileRoster className="play-pokemon" playerName={name} response={profile} />
      )}
      <br/>
      <br/>
      <br/>
      <div class="go-battle-league wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained">
        <h2 class="wp-block-heading">GO Battle League</h2>
      </div>
      {!isLoading && (
        <GBL className="go-battle-league" playerName={name} response={profile} />
      )}

        <article
          className="player"
          itemScope
          itemType="http://schema.org/Article"
        >

          <section className="article-body" itemProp="articleBody">
            {content}
          </section>
        </article>
      </div>

    </Layout>
  );
}

export default PlayerTemplate;

export const pageQuery = graphql`
  query BlogPostById(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    post: wpPost(id: { eq: $id }) {
      id
      excerpt
      content
      title
      uri
      categories {
        nodes {
          name
          slug
        }
      }
      date(formatString: "MMMM DD, YYYY")
      featuredImage {
        node {
          altText
          sourceUrl
          localFile {
            childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: TRACED_SVG
                layout: FULL_WIDTH
              )
            }
          }
        }
      }
    }
    previous: wpPost(id: { eq: $previousPostId }) {
      uri
      title
    }
    next: wpPost(id: { eq: $nextPostId }) {
      uri
      title
    }
  }
`;
