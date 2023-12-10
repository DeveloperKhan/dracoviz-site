import React, { useEffect, useState } from 'react';
import { graphql } from 'gatsby';
import parse from 'html-react-parser';
import Layout from '../components/layout';
import Seo from '../components/seo';

const description = 'The best Pokémon for the Play! Pokemon GO Championship Series. Tier list of the current meta based off usage and performance.';

function TierListPage({ data: { allWpPost, page } }) {
  const posts = allWpPost.nodes;
  const [content, setContent] = useState();

  useEffect(() => {
    setContent(parse(page.content));
  }, []);

  return (
    <Layout data-is-root-path>
      <Seo title={page.title} description={description} />
      <header id="season-head" style={{ textAlign: 'center', marginBottom: 10 }}>
        <h1 className="headline" itemProp="headline">
          {page.title}
        </h1>
      </header>
      <article
        itemScope
        itemType="http://schema.org/Article"
      >
        <section className="article-body is-layout-constrained" itemProp="articleBody">
          {content}
        </section>
      </article>
    </Layout>
  );
}

export default TierListPage;

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
