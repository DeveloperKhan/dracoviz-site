import React, { useState, useEffect, useCallback } from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import parse from 'html-react-parser';
import { GatsbyImage } from 'gatsby-plugin-image';

import Seo from '../components/seo';
import Logo from '../components/logo';
import Schedule from '../components/schedule';

function SeasonPage({ data: { allWpPost, page } }) {
  const posts = allWpPost.nodes;
  const featuredImage = {
    data: page.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: page.featuredImage?.node?.alt || '',
  };

  const options = {
    // eslint-disable-next-line react/no-unstable-nested-components
    replace: ({ attribs, children }) => {
      if (!attribs) {
        return undefined;
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

  const [content, setContent] = useState();

  useEffect(() => {
    setContent(parse(page.content, options));
  }, []);

  return (
    <div className="global-wrapper" data-is-root-path>
      <Seo title={page.title} description={page.excerpt} />
      <header id="season-head">
        <Logo style={{ marginBottom: 10 }} />
        <div className="headline-container">
          <h1 className="headline" itemProp="headline">
            <b>PLAY!</b>
            {' '}
            POKEMON GO
            <div className="headline-sub">
              CHAMPIONSHIP SERIES 2023
            </div>
          </h1>
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
        uri
        date(formatString: "MMMM DD, YYYY")
        title
        excerpt
        categories {
          nodes {
            name
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
