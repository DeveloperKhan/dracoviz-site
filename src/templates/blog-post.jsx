import React, { useEffect, useState } from 'react';
import { Link, graphql } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import parse from 'html-react-parser';
import {
  Twitter, Facebook, Whatsapp, Telegram, Reddit,
} from 'react-social-sharing';

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
import Pills from '../components/pills';
import TournamentRoster from '../components/tournamentroster';
import { delinkifyEvent } from '../utils/url-utils';
import hydrateImages from '../../util/hydrateImages';

function BlogPostTemplate({ data: { previous, next, post } }) {
  const imageData = post.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData;
  const featuredImage = {
    data: imageData,
    alt: post.featuredImage?.node?.alt || '',
  };
  const [content, setContent] = useState();

  useEffect(() => {
    const options = {
      // eslint-disable-next-line react/no-unstable-nested-components
      replace: ({ attribs, children }) => {
        if (!attribs) {
          return undefined;
        }

        if (attribs.classname === 'player-list') {
          const tmName = attribs.id != null ? attribs.id : delinkifyEvent(post.uri);
          return (
            <div className="is-layout-constrained">
              <TournamentRoster tmName={tmName} />
            </div>
          );
        }

        // Tableau dashboards
        if (attribs.type === 'text/javascript') {
          return <Helmet><script>{children[0].data}</script></Helmet>;
        }

        return undefined;
      },
    };
    setTimeout(() => hydrateImages(), 50);
    setContent(parse(post.content, options));
  }, []);

  const postLink = `https://www.dracoviz.com${post.uri}`;

  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.excerpt}
        image={post.featuredImage?.node?.sourceUrl}
      />

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
          style={{ marginBottom: 50, maxHeight: '30em' }}
        />
        )}
        <header className="article-head is-layout-constrained" style={{ marginBottom: 50 }}>
          <h1 itemProp="headline">{parse(post.title)}</h1>
          <Pills categories={post.categories.nodes} />
          <small>
            Last Updated:
            {' '}
            {post.date}
          </small>
          <div>
            <Twitter style={{ marginLeft: -8 }} link={postLink} small />
            <Facebook link={postLink} small />
            <Reddit link={postLink} small />
            <Telegram link={postLink} small />
            <Whatsapp link={postLink} small />
          </div>
        </header>

        <section className="article-body" itemProp="articleBody">
          {content}
        </section>
      </article>

      <nav className="blog-post-nav">
        <h3>Related Events</h3>
        <ul>
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
      uri
      categories {
        nodes {
          name
          slug
        }
      }
      date(formatString: "MMMM DD, YYYY")
      featuredImage {
        node {
          altText
          sourceUrl
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
