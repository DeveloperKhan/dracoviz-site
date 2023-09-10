import React from 'react';
import classNames from 'classnames';

function Pills({ categories }) {
  return (
    <div className="article-item-categories">
      {categories.map((category) => {
        if (category.slug === '2023-series' || category.slug === '2024-series') {
          return null;
        }
        return (
          <span className={
          classNames(
            'pill',
            {
              'pill-primary': category.slug === 'regional-event',
              'pill-accent': category.slug === 'na-region',
              'pill-red': category.slug === 'eu-region',
              'pill-green': category.slug === 'apac-region',
              'pill-purple': category.slug === 'pokemon-go-international-event',
              'pill-blue': category.slug === 'special-event',
              'pill-pink': category.slug === 'latam-region',
              'pill-black': category.slug === 'world-championships',
            },
          )
        }
          >
            {category.name}
          </span>
        );
      })}
    </div>
  );
}

export default Pills;
