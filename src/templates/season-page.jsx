import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import parse from 'html-react-parser';
import { GatsbyImage } from 'gatsby-plugin-image';
import { Element } from 'react-scroll';

import Layout from '../components/layout';
import Seo from '../components/seo';
import Schedule from '../components/schedule';
import TableOfContents from '../components/table-of-contents';
import TournamentRoster from '../components/tournamentroster';

const description = 'Data visualizations for Play! Pokemon GO Championship series. See tournament event schedule and details, Pokemon usage, the best Open Great League teams, and best players!';

const tableOfContentsItems = [
  {
    location: 'event-schedule',
    title: 'Schedule',
  },
  {
    location: 'player-list',
    title: 'Teams',
  },
  {
    location: 'usage',
    title: 'Usage',
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

        if (attribs.id === 'player-list') {
          const year = attribs['data-attribute'];
          return <TournamentRoster showWorldsQualified year={year} />;
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

  const titleSections = page?.title?.toUpperCase()?.split(' ');

  return (
    <Layout data-is-root-path>
      <Seo title={page.title} description={description} />
      <header id="season-head">
        <div className="headline-container">
          <div>
            <h1 className="headline" itemProp="headline">
              <b>{titleSections[0]}</b>
              {` ${titleSections[1]} ${titleSections[2]}`}
              <div className="headline-sub">
                {` ${titleSections[3]} ${titleSections[4]} ${titleSections[5]}`}
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
    </Layout>
  );
}

export default SeasonPage;

export const pageQuery = graphql`
  query PageById(
    $id: String!
    $slug: String!
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
      filter: {categories: {nodes: {elemMatch: {slug: {eq: $slug}}}}}
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
