import React from 'react';
import ReactDOM from 'react-dom';

export default function hydrateImages() {
  const doc = document;
  const inlineWPimages = Array.from(
    doc.querySelectorAll('[data-wp-inline-image]'),
  );

  if (!inlineWPimages.length) {
    return;
  }

  import(
    /* webpackChunkName: "gatsby-plugin-image" */ 'gatsby-plugin-image'
  ).then((mod) => {
    inlineWPimages.forEach((image) => {
      // usually this is the right element to hydrate on
      const grandParentIsGatsbyImage = image?.parentNode?.parentNode?.classList?.contains(
        'gatsby-image-wrapper',
      );

      // but sometimes this is the right element
      const parentIsGatsbyImage = image?.parentNode?.classList?.contains('gatsby-image-wrapper');

      if (!grandParentIsGatsbyImage && !parentIsGatsbyImage) {
        return;
      }

      const gatsbyImageHydrationElement = grandParentIsGatsbyImage
        ? image.parentNode.parentNode
        : image.parentNode;

      if (
        image.dataset
          && image.dataset.wpInlineImage
          && gatsbyImageHydrationElement
      ) {
        const hydrationData = doc.querySelector(
          `script[data-wp-inline-image-hydration="${image.dataset.wpInlineImage}"]`,
        );

        if (hydrationData) {
          const imageProps = JSON.parse(
            hydrationData.innerHTML,
          );

          const root = ReactDOM.createRoot(gatsbyImageHydrationElement);
          root.render(React.createElement(mod.GatsbyImage, imageProps));
        }
      }
    });
  });
}
