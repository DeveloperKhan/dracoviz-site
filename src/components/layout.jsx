import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Social from './social';
import NavBar from './navbar';

function Layout({
  children, isBlogPostArchive, ...rest
}) {
  const {
    wp: {
      // eslint-disable-next-line no-unused-vars
      generalSettings: { title },
    },
  } = useStaticQuery(graphql`
    query LayoutQuery {
      wp {
        generalSettings {
          title
          description
        }
      }
    }
  `);

  return (
    <div className="global-wrapper" {...rest}>
      <NavBar />
      <main>{children}</main>
      <footer id="footer">
        <div className="footer-social">
          <Social
            links={['https://twitter.com/dracoviz', 'https://www.instagram.com/dracoviz.co', 'https://youtube.com/@dracoviz']}
            buttonStyle={{ margin: '0px 10px', backgroundColor: 'transparent' }}
            iconStyle={{ color: '#000000' }}
            openNewTab
          />
        </div>
        <small>
          2023 Dracoviz. All rights reserved of the original content.
          Pokémon and all other names are the property of The Pokémon Company,
          Creatures Inc., Game Freak and Nintendo © 1996-2023
        </small>
      </footer>
    </div>
  );
}

export default Layout;
