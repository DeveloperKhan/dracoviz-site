import React from 'react';
import { GatsbyImage } from 'gatsby-plugin-image';
import parse from 'html-react-parser';
import { Link } from 'gatsby';
import Pills from './pills';

function Article({ post, variant = 'medium' }) {
  const featuredImage = {
    data: post.featuredImage?.node?.localFile?.childImageSharp?.gatsbyImageData,
    alt: post.featuredImage?.node?.alt || '',
  };
  const shouldDisplayImage = featuredImage?.data != null && variant === 'large';
  return (
    <Link to={post.uri} style={{ textDecoration: 'none' }}>
      <div className="article-item">
        {shouldDisplayImage && (
        <GatsbyImage
          image={featuredImage.data}
          alt={featuredImage.alt}
          style={{ width: '100%', height: '25rem', marginBottom: '1rem' }}
        />
        )}
        <Pills categories={post.categories.nodes} />
        <div className="article-item-content">
          <h3>{post.title}</h3>
          {parse(post.excerpt)}
        </div>
      </div>
    </Link>
  );
}

export default Article;
