import React from 'react';
import { Link, graphql } from 'gatsby';
import Article from '../components/article';

import Layout from '../components/layout';
import Seo from '../components/seo';

function BlogIndex({
  data,
  pageContext: { nextPagePath, previousPagePath },
}) {
  const posts = data.allWpPost.nodes;
  const missingPostText = 'No blog posts found.';

  if (!posts.length) {
    return (
      <Layout isBlogPostArchive>
        <Seo title="All posts" />
        <p className="is-layout-constrained">
          {missingPostText}
          {' '}
          <Link to="/">Go to home</Link>
        </p>
      </Layout>
    );
  }

  return (
    <Layout isBlogPostArchive>
      <Seo title="All posts" />
      <section className="is-layout-constrained">
        <ol style={{ listStyle: 'none' }}>
          {posts.map((post, index) => (
            <Article post={post} variant={index === 0 ? 'large' : 'medium'} key={post.id} />
          ))}
        </ol>

        {previousPagePath && (
          <>
            <Link to={previousPagePath}>Previous page</Link>
            <br />
          </>
        )}
        {nextPagePath && <Link to={nextPagePath}>Next page</Link>}
      </section>
    </Layout>
  );
}

export default BlogIndex;

export const pageQuery = graphql`
  query WordPressPostArchive($offset: Int!, $postsPerPage: Int!) {
    allWpPost(
      filter: {categories: {nodes: {elemMatch: {slug: {nin: ["regional-event", "special-event", "pokemon-go-international-event"]}}}}}
      sort: { fields: [date], order: DESC }
      limit: $postsPerPage
      skip: $offset
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
