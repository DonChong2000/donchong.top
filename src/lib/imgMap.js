// Collect every image under /content/**/images/
const allImages = require.context('../app', true, /images\/.*\.(png|jpe?g|svg|gif)$/);

/**
 * Returns static images from './image' folder
 * ├───test
 * │   │   page.mdx
 * │   └───images
 * │           follow2.png
 * │           img.tsx
 * @param {string} mdxUrl - Pass `import.meta.url` from the MDX file
 */
export function getImageMap(mdxUrl) {
  const normalizedUrl = mdxUrl.replace(/\\/g, '/');
  const match =
    normalizedUrl.match(/\/\.next\/server\/app\/(.*)\/[^/]+$/) ||
    normalizedUrl.match(/\/src\/app\/(.*)\/[^/]+$/) ||
    normalizedUrl.match(/\/app\/(.*)\/[^/]+$/);
  const pagePath = match ? match[1] : null;
  if (!pagePath) {
    console.warn(`Could not determine page path from ${mdxUrl}`);
    return {};
  }

  const prefix = `./${pagePath}/images/`;
  const map = {};

  allImages.keys().forEach((key) => {
    if (key.startsWith(prefix)) {
      const filename = key.replace(prefix, '');
      map[filename] = allImages(key).default;
    }
  });

  return map;
}
