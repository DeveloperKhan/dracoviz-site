import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableOfContents from './table-of-contents';
import { getAchievements } from '../utils/achievements';

// We're using Gutenberg so we need the block styles
// these are copied into this project due to a conflict in the postCSS
// version used by the Gatsby and @wordpress packages that causes build
// failures.
// @todo update this once @wordpress upgrades their postcss version
import '../css/@wordpress/block-library/build-style/style.css';
import '../css/@wordpress/block-library/build-style/theme.css';

import Layout from './layout';
import Seo from './seo';
import ProfileRoster from './profileroster';
import SearchBar from './searchbar';
import GBL from './gbl';
import useWindowSize from '../utils/use-window-size';

let tableOfContentsItems = [

];

const loadingStyle = {
  fontFamily: 'Jost, sans-serif',
  fontWeight: '400',
  fontSize: '25px',
  marginTop: '-40px', // Adjust this value as needed
};
const usernameStyle = {
  fontFamily: 'Jost, sans-serif',
  fontWeight: '800',
  fontSize: '4rem',
  maxWidth: '100%', // Set a maximum width to prevent text from overflowing
  marginTop: '-40px', // Adjust this value as needed
  wordWrap: 'break-word', // Add this line to enable word wrapping
};
const smallerFontSize = {
  fontSize: '3rem', // Adjust this font size as needed
};

const smallestFontSize = {
  fontSize: '3rem', // Adjust this font size as needed
};

function Profile(props) {
  const name = props?.params?.id;
  const [content] = useState();
  const [profileName, setProfileName] = useState('Loading...');
  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState(null);

  const [playerFound, setPlayerFound] = useState(false);
  const [gblFound, setGBLFound] = useState(false);
  const [tournamentsFound, setTournamentsFound] = useState(false);
  const [profileStyle, setProfileStyle] = useState(loadingStyle);
  const [showMore, setShowMore] = useState(false);
  const { width } = useWindowSize();

  let fontSizeStyle = {};

  if (width <= 820) {
    fontSizeStyle = smallerFontSize;
  }
  if (width <= 480) {
    fontSizeStyle = smallestFontSize;
  }

  useEffect(() => {
    const host = `${window.location.protocol}//${window.location.host}`;
    const tmUrl = `${host}/api/tournament?searchType=profile&name=${name}`;

    axios
      .get(tmUrl, {
        headers: {
          x_authorization: `Basic ${process.env.GATSBY_SECRET_KEY}`,
        },
      })
      .then((response) => {
        if (response.data.allProfiles != null) {
          // setProfileStyle(usernameStyle);
          setProfileName((name != null && name !== '') ? 'Player not found' : 'Explore GBL and Play! Pokemon data from any player!');
          setAllProfiles(response.data.allProfiles);
          return;
        }
        const obj = JSON.parse(response.data);

        setProfileStyle(usernameStyle);
        if (obj == null) {
          setProfileName('Player not found');
        } else {
          setPlayerFound(true);
          tableOfContentsItems = [];
          if (obj.tournaments != null) {
            setTournamentsFound(true);
            tableOfContentsItems.push({
              location: 'play-pokemon',
              title: 'Play! Pokemon',
            });
          }
          if (obj.gbl != null) {
            tableOfContentsItems.push(
              {
                location: 'go-battle-league',
                title: 'GO Battle League',
              },
            );
            setGBLFound(true);
          }
        }
        setProfile(obj);
      });
  }, []);

  const playerProfileStyle = {
    fontFamily: 'Jost, sans-serif',
    fontWeight: '400',
    fontSize: '40px',
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

  let achievements = [];
  let imageElements = [];
  if (profile !== null) {
    achievements = getAchievements(profile);
  }

  const maxAchievementsToShow = showMore ? achievements.length : 5;
  // Render the list of images in the grid
  imageElements = achievements.slice(0, maxAchievementsToShow).map((achievement, index) => (
    <div key={achievement.id} style={gridItemStyle} data-tooltip-id="pokemon-item" data-tooltip-content={achievement.description}>
      <img src={achievement.image} alt={`${index + 1}`} style={imageStyle} className="image-glow" />
    </div>
  ));

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <Layout>
      <Seo title={profile != null ? profile.name : ''} description={profile != null ? profile.name : ''} />
      <div className="profile-container is-layout-constrained">
        <div className="wp-block-group">
          {!playerFound && (
          <div style={playerProfileStyle}>
            <p><b>PLAYER PROFILE</b></p>
          </div>
          )}
          <div style={{ ...profileStyle, ...fontSizeStyle }}>
            <h1>{profile != null ? profile.name : profileName}</h1>
          </div>
          {playerFound && (
          <div>
            <h2>Player Achievements</h2>
          </div>
          )}
          {playerFound && (
          <div>
            <div>
              <div style={gridContainerStyle}>{imageElements}</div>
              {achievements.length > 5 && (
                <button className="player-item-modal-link" onClick={toggleShowMore}>
                  {showMore ? 'Show less...' : 'Show more...'}
                </button>
              )}
            </div>
          </div>
          )}
          {allProfiles != null && (
            <SearchBar allSuggestions={allProfiles} />
          )}
        </div>

        {playerFound && (
        <div>
          <TableOfContents items={tableOfContentsItems} />

          {tournamentsFound && (
          <div className="play-pokemon">
            <h2>Play! Pokemon</h2>
          </div>
          )}
          {tournamentsFound && (
            <>
              <ProfileRoster className="play-pokemon" playerName={name} response={profile} />
              <br />
              <small>The following Play! data isn’t included: all 2022 data Senior and Master divisions except for Worlds and last-chance Qualifier; and 2023 Mexico City Qualifier. Partial data is currently available for 2023 Asia Qualifiers as we’re working to update our database.</small>
            </>
          )}

          {gblFound && (
          <>
            <div className="go-battle-league">
              <h2>GO Battle League</h2>
            </div>
            <GBL playerName={name} response={profile} />
            <br />
            <small>
              Data is sourced from
              {' '}
              <a href="https://twitter.com/JJan11PGO" target="_blank" rel="noreferrer">JJan</a>
              .
            </small>
          </>
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
        )}
      </div>

    </Layout>
  );
}

export default Profile;
