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
  const match = mdxUrl.match(/\/app\/([^/]+)\//);
  const section = match ? match[1] : null;
  if (!section) {
    console.warn(`Could not determine section from ${mdxUrl}`);
    return {};
  }

  const prefix = `./${section}/images/`;
  const map = {};

  allImages.keys().forEach((key) => {
    if (key.startsWith(prefix)) {
      const filename = key.replace(prefix, '');
      map[filename] = allImages(key).default;
    }
  });

  return map;
}
