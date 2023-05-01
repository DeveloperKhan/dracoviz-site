import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import parse from 'html-react-parser';
import { GatsbyImage } from 'gatsby-plugin-image';
import { Element } from 'react-scroll';

import Seo from '../components/seo';
import Logo from '../components/logo';
import Schedule from '../components/schedule';
import TableOfContents from '../components/table-of-contents';
import TournamentRoster from "../components/tournamentroster";

const tableOfContentsItems = [
  {
    location: 'event-schedule',
    title: 'Schedule',
  },
  {
    location: 'usage',
    title: 'Usage',
  },
  {
    location: 'teams',
    title: 'Teams',
  },
];

function SeasonPage({ data: { allWpPost, page } }) {
  const posts = allWpPost.nodes;
  const featuredImage = {
    data: page.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: page.featuredImage?.node?.alt || '',
  };

  const [content, setContent] = useState();

  useEffect(() => {
    const options = {
      // eslint-disable-next-line react/no-unstable-nested-components
      replace: ({ attribs, children }) => {
        if (!attribs) {
          return undefined;
        }

        if (attribs.id === "player-list") {
          return <TournamentRoster tmName="2023_GO_Orlando"/>;
        }

        if (attribs.type === 'div' && attribs.id != null) {
          // eslint-disable-next-line react/jsx-props-no-spreading
          return <Element><div {...attribs}>{children[0].data}</div></Element>;
        }

        // Event schedule
        if (attribs.id === 'event-schedule') {
          return <Schedule data={posts} />;
        }

        // Tableau dashboards
        if (attribs.type === 'text/javascript') {
          return <Helmet><script>{children[0].data}</script></Helmet>;
        }

        return undefined;
      },
    };
    setContent(parse(page.content, options));
  }, []);

  return (
    <div className="global-wrapper" data-is-root-path>
      <Seo title={page.title} description={page.excerpt} />
      <header id="season-head">
        <Logo style={{ marginBottom: 10 }} />
        <div className="headline-container">
          <div>
            <h1 className="headline" itemProp="headline">
              <b>PLAY!</b>
              {' '}
              POKEMON GO
              <div className="headline-sub">
                CHAMPIONSHIP SERIES 2023
              </div>
            </h1>
          </div>
          {/* if we have a featured image for this post let's display it */}
          {featuredImage?.data && (
          <GatsbyImage
            className="headline-image"
            image={featuredImage.data}
            alt={featuredImage.alt}
          />
          )}
        </div>
      </header>
      <TableOfContents items={tableOfContentsItems} />
      <article
        id="season-page"
        itemScope
        itemType="http://schema.org/Article"
      >
        <section className="article-body" itemProp="articleBody">
          {content}
        </section>
      </article>
    </div>
  );
}

export default SeasonPage;

export const pageQuery = graphql`
  query PageById(
    $id: String!
  ) {
    page: wpPage(id: { eq: $id }) {
      id
      content
      title
      date(formatString: "MMMM DD, YYYY")
      featuredImage {
        node {
          altText
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
    allWpPost(
      filter: {categories: {nodes: {elemMatch: {slug: {eq: "2023-series"}}}}}
    ) {
      nodes {
        id
        uri
        date(formatString: "MMMM DD, YYYY")
        title
        excerpt
        categories {
          nodes {
            name
            slug
          }
        }
        tags {
          nodes {
            name
          }
        }
        featuredImage {
          node {
            altText
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
    }
  }
`;
