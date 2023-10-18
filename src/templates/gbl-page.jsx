/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import parse, { attributesToProps, domToReact } from 'html-react-parser';

import Lightbox from 'yet-another-react-lightbox';
import Layout from '../components/layout';
import Seo from '../components/seo';
import hydrateImages from '../../util/hydrateImages';
import 'yet-another-react-lightbox/styles.css';

const description = 'Top GBL Graphics';

function SeasonPage({ data: { page } }) {
  const [content, setContent] = useState();
  const [srcs, setSrcs] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const newSrcs = [];
    const options = {
      // eslint-disable-next-line react/no-unstable-nested-components
      replace: ({ attribs, children }) => {
        if (!attribs) {
          return undefined;
        }

        if (attribs.class?.includes('wp-block-gallery')) {
          const isArchive = attribs.class?.includes('gbl-archived');
          const reactProps = attributesToProps(attribs);
          const reactChildren = domToReact(children);
          return (
            <div {...reactProps} className="gbl-row">
              {reactChildren.map((item) => {
                if (typeof item === 'string') {
                  return null;
                }
                const { props } = item;
                const imageSrc = props?.children?.props?.src;
                newSrcs.push({ src: imageSrc });
                return (
                  <div
                    onClick={() => setOpen(true)}
                    className={props.className}
                    style={{ width: isArchive ? 280 : 480, cursor: 'pointer' }}
                  >
                    {props.children}
                  </div>
                );
              })}
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
    setSrcs(newSrcs);
    setTimeout(() => hydrateImages(), 50);
    setContent(parse(page.content, options));
  }, []);

  return (
    <Layout data-is-root-path>
      <Seo title={page.title} description={description} />
      <header id="season-head" style={{ marginBottom: -80, textAlign: 'center' }}>
        <h1 className="headline" itemProp="headline">
          Top GO Battle League Teams
        </h1>
      </header>
      <article className="article-body gbl-root">
        {content}
      </article>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={srcs}
      />
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
    }
  }
`;
