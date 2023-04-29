import { Link } from 'react-scroll';
import React from 'react';

function TableOfContentsHeader({ item }) {
  const { location, title } = item;
  return (
    <Link activeClass="active" className="table-of-contents-item" to={location} spy smooth offset={2} duration={300}>
      {title}
    </Link>
  );
}

function TableOfContents({ items }) {
  return (
    <nav id="table-of-contents">
      <ul className="table-of-contents-items">
        {items.map((item) => <TableOfContentsHeader item={item} />)}
      </ul>
    </nav>
  );
}

export default TableOfContents;
