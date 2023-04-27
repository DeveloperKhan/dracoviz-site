/* eslint-disable @typescript-eslint/no-use-before-define */
const path = require('path');

// This is a simple debugging tool
// dd() will prettily dump to the terminal and kill the process
// const { dd } = require(`dumper.js`)

/**
 * exports.createPages is a built-in Gatsby Node API.
 * It's purpose is to allow you to create pages for your site! 💡
 *
 * See https://www.gatsbyjs.com/docs/node-apis/#createPages for more info.
 */
exports.createPages = async (gatsbyUtilities) => {
  // Query our posts from the GraphQL server
  const { posts, pages } = await getPosts(gatsbyUtilities);

  // If there are no posts in WordPress, don't do anything
  if (!posts.length) {
    return;
  }

  // Grab season page for our homepage
  const homePage = getHomePage(pages);

  if (!homePage) {
    return;
  }

  // If there are posts, create pages for them
  await createIndividualBlogPostPages({ posts, gatsbyUtilities });
  createHomePage({ homePage, gatsbyUtilities });

  // And a paginated archive
  // await createBlogPostArchive({ posts, gatsbyUtilities });
};

const getHomePage = (pages) => {
  const homeEdge = pages.find(({ page }) => page.uri === '/play-pokemon-go-championship-series-2023/');
  return homeEdge ? homeEdge.page : null;
};

/**
 * This function creates all the individual blog pages in this site
 */
const createIndividualBlogPostPages = async ({ posts, gatsbyUtilities }) => Promise.all(
  posts.map(({ previous, post, next }) => gatsbyUtilities.actions.createPage({
    // Use the WordPress uri as the Gatsby page path
    // This is a good idea so that internal links and menus work 👍
    path: post.uri,

    // use the blog post template as the page component
    component: path.resolve('./src/templates/blog-post.jsx'),

    // `context` is available in the template as a prop and
    // as a variable in GraphQL.
    context: {
      // we need to add the post id here
      // so our blog post template knows which blog post
      // the current page is (when you open it in a browser)
      id: post.id,

      // We also use the next and previous id's to query them and add links!
      previousPostId: previous ? previous.id : null,
      nextPostId: next ? next.id : null,
    },
  })),
);

const createHomePage = ({ homePage, gatsbyUtilities }) => {
  gatsbyUtilities.actions.createPage({
    path: '/',
    component: path.resolve('./src/templates/season-page.jsx'),
    context: {
      id: homePage.id,
    },
  });
};

/**
 * We're passing in the utilities we got from createPages.
 * So see https://www.gatsbyjs.com/docs/node-apis/#createPages for more info!
 */
async function getPosts({ graphql, reporter }) {
  const graphqlResult = await graphql(/* GraphQL */ `
  query {
    allWpPost {
      edges {
        previous {
          id
        }
        # note: this is a GraphQL alias. It renames "node" to "post" for this query
        # We're doing this because this "node" is a post! It makes our code more readable further down the line.
        post: node {
          id
          uri
        }
        next {
          id
        }
      }
    }
    allWpPage {
      edges {
        page: node {
          id
          uri
        }
      }
    }
  }
  `);

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading WP data',
      graphqlResult.errors,
    );
    return;
  }

  // eslint-disable-next-line consistent-return
  return {
    posts: graphqlResult.data.allWpPost.edges,
    pages: graphqlResult.data.allWpPage.edges,
  };
}
