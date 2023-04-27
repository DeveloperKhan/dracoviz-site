import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';

function Layout({ children }) {
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
    <div className="global-wrapper">
      <header className="global-header">
        <Link className="header-link-home" to="/">
          {title}
        </Link>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default Layout;
