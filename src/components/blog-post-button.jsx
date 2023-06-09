import React from "react";
import { Link } from "gatsby";

function BlogPostButton() {
  return (
    <Link className="blog-post-button" to="/blog/1">Our Blog Posts</Link>
  );
}

export default BlogPostButton;
