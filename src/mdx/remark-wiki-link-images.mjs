
import { visit } from 'unist-util-visit';
import fs from 'fs';
import path from 'path';

const WIKI_LINK_IMAGE_REGEX = /!\[\[([^\]]+)\]\]/g;

// Load dimension manifest once at plugin init
const manifestPath = path.resolve(
  import.meta.dirname,
  '../lib/image-dimensions.json',
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

function routeFromFile(file) {
  const filePath = file.history[0]?.replace(/\\/g, '/') || '';
  const match = filePath.match(/\/src\/app\/(.*)\/page\.mdx$/);
  return match ? match[1] : '';
}

export const remarkWikiLinkImages = () => (tree, file) => {
  const route = routeFromFile(file);

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

      const cleanedName = imageName.split('?')[0].split('#')[0];
      const encodedName = encodeURIComponent(cleanedName);
      const srcUrl = `/images/${route}/${encodedName}`;

      // Look up dimensions from manifest
      const dims = manifest[srcUrl];

      const attributes = [
        {
          type: 'mdxJsxAttribute',
          name: 'src',
          value: srcUrl,
        },
        { type: 'mdxJsxAttribute', name: 'alt', value: imageName },
      ];

      // Add width/height from manifest
      if (dims) {
        attributes.push({
          type: 'mdxJsxAttribute',
          name: 'width',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: String(dims.width),
            data: {
              estree: {
                type: 'Program',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'Literal',
                      value: dims.width,
                      raw: String(dims.width),
                    },
                  },
                ],
                sourceType: 'module',
              },
            },
          },
        });
        attributes.push({
          type: 'mdxJsxAttribute',
          name: 'height',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: String(dims.height),
            data: {
              estree: {
                type: 'Program',
                body: [
                  {
                    type: 'ExpressionStatement',
                    expression: {
                      type: 'Literal',
                      value: dims.height,
                      raw: String(dims.height),
                    },
                  },
                ],
                sourceType: 'module',
              },
            },
          },
        });
      }

      // Add sizes for responsive loading
      attributes.push({
        type: 'mdxJsxAttribute',
        name: 'sizes',
        value: '(min-width: 768px) 720px, 100vw',
      });

      // Add the image node
      newNodes.push({
        type: 'mdxJsxFlowElement',
        name: 'Image',
        attributes,
        children: [],
      });

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
};
