import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import Logo from './logo';

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
          <Logo style={{ marginTop: 10, marginBottom: 10 }} />
        </Link>
      </header>

      <main>{children}</main>
    </div>
  );
}

export default Layout;
