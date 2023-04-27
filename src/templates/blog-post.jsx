import React, { useEffect, useState } from 'react';
import { Link, graphql } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import parse from 'html-react-parser';

// We're using Gutenberg so we need the block styles
// these are copied into this project due to a conflict in the postCSS
// version used by the Gatsby and @wordpress packages that causes build
// failures.
// @todo update this once @wordpress upgrades their postcss version
import '../css/@wordpress/block-library/build-style/style.css';
import '../css/@wordpress/block-library/build-style/theme.css';

import { Helmet } from 'react-helmet';
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

function BlogPostTemplate({ data: { previous, next, post } }) {
  const featuredImage = {
    data: post.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: post.featuredImage?.node?.alt || '',
  };

  const [content, setContent] = useState();

  useEffect(() => {
    setContent(parse(post.content, options));
  }, []);

  return (
    <Layout>
      <Seo title={post.title} description={post.excerpt} />

      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        {/* if we have a featured image for this post let's display it */}
        {featuredImage?.data && (
        <GatsbyImage
          image={featuredImage.data}
          alt={featuredImage.alt}
          style={{ marginBottom: 50, maxHeight: 700 }}
        />
        )}
        <header className="is-layout-constrained" style={{ marginBottom: 50 }}>
          <h1 itemProp="headline">{parse(post.title)}</h1>
          <small>
            Last Updated:
            {' '}
            {post.date}
          </small>
        </header>

        <section itemProp="articleBody">
          {content}
        </section>
      </article>

      <nav className="blog-post-nav">
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            listStyle: 'none',
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.uri} rel="prev">
                ←
                {' '}
                {parse(previous.title)}
              </Link>
            )}
          </li>

          <li>
            {next && (
              <Link to={next.uri} rel="next">
                {parse(next.title)}
                {' '}
                →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
}

export default BlogPostTemplate;

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
