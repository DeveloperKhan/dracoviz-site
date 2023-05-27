import React from 'react';
import { GatsbyImage } from 'gatsby-plugin-image';
import parse from 'html-react-parser';
import { Link } from 'gatsby';
import classnames from 'classnames';
import Pills from './pills';
import { getDateFromTag } from '../utils/date-utils';

function Article({ post, variant = 'medium' }) {
  const featuredImage = {
    data: post.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: post.featuredImage?.node?.alt || '',
  };
  const isLarge = variant === 'large';
  const shouldDisplayImage = featuredImage?.data != null && isLarge;
  const hasCategories = post.categories?.nodes != null && post.categories.nodes.length > 0;
  const hasTags = post.tags?.nodes != null && post.tags.nodes.length > 0;
  const date = hasTags ? getDateFromTag(post.tags.nodes[0].name) : "";
  return (
    <Link to={post.uri} style={{ textDecoration: 'none' }}>
      <div className={classnames('article-item', { 'article-large': isLarge })}>
        {shouldDisplayImage && (
        <GatsbyImage
          image={featuredImage.data}
          alt={featuredImage.alt}
          style={{ width: '100%', height: '25rem' }}
        />
        )}
        <div className={classnames({"article-item-content-large": isLarge})}>
          {hasCategories && <Pills categories={post.categories.nodes} />}
          <div className="article-item-content">
            <h3>{post.title}</h3>
            <div className="article-item-date">{date}</div>
            <p>{parse(post.excerpt)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Article;
