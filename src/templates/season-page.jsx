import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import parse from 'html-react-parser';
import { GatsbyImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

const options = {
  replace: ({ attribs, children }) => {
    if (!attribs) {
      return undefined;
    }

    // Tableau dashboards
    if (attribs.type === 'text/javascript') {
      return <Helmet><script>{children[0].data}</script></Helmet>;
    }

    return undefined;
  },
};

function SeasonPage({ data: { allWpPost, page } }) {
  const posts = allWpPost.nodes;
  const featuredImage = {
    data: page.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: page.featuredImage?.node?.alt || '',
  };

  const [content, setContent] = useState();

  useEffect(() => {
    setContent(parse(page.content, options));
  }, []);

  return (
    <Layout>
      <Seo title={page.title} description={page.excerpt} />
      <article
        id="season-page"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{parse(page.title)}</h1>
          {/* if we have a featured image for this post let's display it */}
          {featuredImage?.data && (
            <GatsbyImage
              image={featuredImage.data}
              alt={featuredImage.alt}
              style={{ marginBottom: 50 }}
            />
          )}
        </header>

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
