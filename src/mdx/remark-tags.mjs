import { visit } from 'unist-util-visit';

const TAG_REGEX = /(^|[^A-Za-z0-9_])#([A-Za-z0-9][A-Za-z0-9_-]*)/g;

function normalizeTag(tag) {
  return tag.toString().trim().toLowerCase();
}

function shouldSkipParent(parent) {
  if (!parent) {
    return true;
  }

  return [
    'link',
    'linkReference',
    'definition',
    'code',
    'inlineCode',
    'mdxJsxFlowElement',
    'mdxJsxTextElement',
  ].includes(parent.type);
}

export const remarkTags = () => (tree, file) => {
  const tags = new Set(file.data.tags ?? []);

  visit(tree, 'text', (node, index, parent) => {
    if (typeof index !== 'number' || shouldSkipParent(parent)) {
      return;
    }

    const text = node.value;
    const newNodes = [];
    let lastIndex = 0;
    let match;

    TAG_REGEX.lastIndex = 0;

    while ((match = TAG_REGEX.exec(text)) !== null) {
      const [fullMatch, prefix, rawTag] = match;
      const before = text.slice(lastIndex, match.index + prefix.length);

      if (before) {
        newNodes.push({ type: 'text', value: before });
      }

      const normalizedTag = normalizeTag(rawTag);
      if (normalizedTag) {
        tags.add(normalizedTag);
        newNodes.push({
          type: 'mdxJsxTextElement',
          name: 'TagLink',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'tag',
              value: normalizedTag,
            },
          ],
          children: [],
        });
      } else {
        newNodes.push({ type: 'text', value: `#${rawTag}` });
      }

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      newNodes.push({ type: 'text', value: text.slice(lastIndex) });
    }

    if (newNodes.length > 0) {
      if (newNodes.length === 1) {
        parent.children[index] = newNodes[0];
      } else {
        if (
          newNodes[0].type === 'text' &&
          index > 0 &&
          parent.children[index - 1].type === 'text'
        ) {
          parent.children[index - 1].value += newNodes.shift().value;
        }

        if (
          newNodes.length > 0 &&
          newNodes[newNodes.length - 1].type === 'text' &&
          index < parent.children.length - 1 &&
          parent.children[index + 1].type === 'text'
        ) {
          parent.children[index + 1].value =
            newNodes.pop().value + parent.children[index + 1].value;
        }

        parent.children.splice(index, 1, ...newNodes);
      }

      return [visit.SKIP, index + newNodes.length];
    }
  });

  file.data.tags = Array.from(tags);
};
