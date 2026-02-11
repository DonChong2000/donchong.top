// Collect every image under /content/**/images/
const allImages = require.context(
  '../app',
  true,
  /images\/.*\.(png|jpe?g|svg|gif)$/,
);

function resolvePagePath(mdxUrl) {
  const normalizedUrl = mdxUrl.replace(/^file:\/\//, '');
  const appRoot = '/src/app/';
  const appRootIndex = normalizedUrl.lastIndexOf(appRoot);

  if (appRootIndex === -1) {
    return null;
  }

  const relativeFilePath = normalizedUrl.slice(appRootIndex + appRoot.length);
  const pathParts = relativeFilePath.split('/');
  pathParts.pop();

  return pathParts.join('/');
}

function resolveImageModule(imageModule) {
  if (!imageModule) return imageModule;
  if (typeof imageModule === 'string') return imageModule;
  if (typeof imageModule === 'object' && imageModule.src) return imageModule;
  if (typeof imageModule === 'object' && imageModule.default) {
    return resolveImageModule(imageModule.default);
  }
  return imageModule;
}

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
  const pagePath = resolvePagePath(mdxUrl);
  if (pagePath === null) {
    console.warn(`Could not determine page path from ${mdxUrl}`);
    return {};
  }

  const prefix = pagePath ? `./${pagePath}/images/` : './images/';
  const map = {};

  allImages.keys().forEach((key) => {
    if (key.startsWith(prefix)) {
      const filename = key.replace(prefix, '');
      const imageModule = allImages(key);
      map[filename] = resolveImageModule(imageModule);
    }
  });

  return map;
}
