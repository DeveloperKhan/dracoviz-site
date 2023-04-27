import React from 'react';
import { graphql } from 'gatsby';

function SeasonPage() {
  return (<div>Meowdy</div>);
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
