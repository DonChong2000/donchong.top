
import { visit } from 'unist-util-visit';
import sharp from 'sharp';
import { join } from 'path';

const WIKI_LINK_IMAGE_REGEX = /!\[\[([^\]]+)\]\]/g;

const imageMetadataCache = new Map();

function getPagePath(file) {
  const filePath = (file.path || file.history[0] || '').replace(/\\/g, '/');
  const match = filePath.match(/\/src\/app\/(.+)\/[^/]+$/);
  return match ? match[1] : '';
}

async function getImageMetadata(absolutePath) {
  if (imageMetadataCache.has(absolutePath)) {
    return imageMetadataCache.get(absolutePath);
  }

  const image = sharp(absolutePath);
  const [{ width, height }, blurBuffer] = await Promise.all([
    image.metadata(),
    image.clone().resize(8, 8, { fit: 'inside' }).png().toBuffer(),
  ]);

  const blurDataURL = `data:image/png;base64,${blurBuffer.toString('base64')}`;
  const result = { width, height, blurDataURL };
  imageMetadataCache.set(absolutePath, result);
  return result;
}

export const remarkWikiLinkImages = () => async (tree, file) => {
  const pagePath = getPagePath(file);
  const pendingImages = [];

  visit(tree, 'text', (node, index, parent) => {
    if (!parent || typeof index !== 'number') {
      return;
    }

    const text = node.value;
    const newNodes = [];
    let lastIndex = 0;
    let match;

    while ((match = WIKI_LINK_IMAGE_REGEX.exec(text)) !== null) {
      const [fullMatch, imageName] = match;

      // Add the text before the match
      if (match.index > lastIndex) {
        newNodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }

      const src = `/images/${pagePath}/${encodeURIComponent(imageName)}`;
      const absolutePath = join(process.cwd(), 'public', 'images', pagePath, imageName);

      const attributes = [
        { type: 'mdxJsxAttribute', name: 'src', value: src },
        { type: 'mdxJsxAttribute', name: 'alt', value: imageName },
      ];

      const imageNode = {
        type: 'mdxJsxFlowElement',
        name: 'Image',
        attributes,
        children: [],
      };

      newNodes.push(imageNode);
      pendingImages.push({ node: imageNode, absolutePath });

      lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      newNodes.push({ type: 'text', value: text.slice(lastIndex) });
    }

    // If we made any changes, replace the original text node
    if (newNodes.length > 0) {
      // If there was only a single match and nothing else, we can just replace the node.
      if (newNodes.length === 1) {
         parent.children[index] = newNodes[0];
      } else {
        // Otherwise, we need to splice the new nodes in.
        // If the first new node is text and the previous sibling is also text, merge them.
        if (newNodes[0].type === 'text' && index > 0 && parent.children[index - 1].type === 'text') {
            parent.children[index - 1].value += newNodes.shift().value;
        }

        // If the last new node is text and the next sibling is also text, merge them.
        if (newNodes.length > 0 && newNodes[newNodes.length - 1].type === 'text' && index < parent.children.length - 1 && parent.children[index + 1].type === 'text') {
            parent.children[index + 1].value = newNodes.pop().value + parent.children[index + 1].value;
        }

        parent.children.splice(index, 1, ...newNodes);
      }
      // Return the number of nodes added
      return [visit.SKIP, index + newNodes.length];
    }
  });

  // Resolve metadata for all images in parallel
  await Promise.all(pendingImages.map(async ({ node, absolutePath }) => {
    try {
      const { width, height, blurDataURL } = await getImageMetadata(absolutePath);
      node.attributes.push(
        { type: 'mdxJsxAttribute', name: 'width', value: String(width) },
        { type: 'mdxJsxAttribute', name: 'height', value: String(height) },
        { type: 'mdxJsxAttribute', name: 'blurDataURL', value: blurDataURL },
        { type: 'mdxJsxAttribute', name: 'placeholder', value: 'blur' },
      );
    } catch {
      // Image not found or unprocessable — serve without dimensions/blur
    }
  }));
};
