import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import Logo from './logo';
import Social from './social';
import BlogPostButton from './blog-post-button';

function Layout({ children, isHomepage, isBlogPostArchive, ...rest }) {
  const {
    wp: {
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
    <>
      <div className="global-wrapper" {...rest} >
        {isHomepage ?? (
          <header className="global-header">
            <Link className="header-link-home" to="/">
              <Logo />
            </Link>
            {!isBlogPostArchive && <BlogPostButton />}
          </header>
        )}

        <main>{children}</main>

        <footer id="footer">
          <div className="footer-social">
            <Social
              links={['https://twitter.com/dracoviz','https://www.instagram.com/dracoviz.co','https://youtube.com/@dracoviz']}
              buttonStyle={{margin: '0px 10px', backgroundColor: 'transparent'}}
              iconStyle={{color: '#000000'}}
              openNewTab={true}
            />
          </div>
          <small>
            2023 Dracoviz. All rights reserved of the original content. Pokémon and all other names are the property of The Pokémon Company, Creatures Inc., Game Freak and Nintendo © 1996-2023
          </small>
        </footer>
      </div>
    </>
  );
}

export default Layout;
