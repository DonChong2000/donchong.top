import { slugifyWithCounter } from '@sindresorhus/slugify';
import * as acorn from 'acorn';
import { toString } from 'mdast-util-to-string';
import { mdxAnnotations } from 'mdx-annotations';
import shiki from 'shiki';
import { visit } from 'unist-util-visit';

function rehypeParseCodeBlocks() {
  return (tree) => {
    visit(tree, 'element', (node, _nodeIndex, parentNode) => {
      if (node.tagName === 'code') {
        parentNode.properties.language = node.properties.className
          ? node.properties?.className[0]?.replace(/^language-/, '')
          : 'txt';
      }
    });
  };
}

let highlighter;

function rehypeShiki() {
  return async (tree) => {
    highlighter =
      highlighter ?? (await shiki.getHighlighter({ theme: 'css-variables' }));

    visit(tree, 'element', (node) => {
      if (node.tagName === 'pre' && node.children[0]?.tagName === 'code') {
        let codeNode = node.children[0];
        let textNode = codeNode.children[0];

        node.properties.code = textNode.value;

        if (node.properties.language) {
          let tokens = highlighter.codeToThemedTokens(
            textNode.value,
            node.properties.language,
          );

          textNode.value = shiki.renderToHtml(tokens, {
            elements: {
              pre: ({ children }) => children,
              code: ({ children }) => children,
              line: ({ children }) => `<span>${children}</span>`,
            },
          });
        }
      }
    });
  };
}

function rehypeSlugify() {
  return (tree) => {
    let slugify = slugifyWithCounter();
    visit(tree, 'element', (node) => {
      if ((node.tagName === 'h2' || node.tagName === 'h3') && !node.properties.id) {
        node.properties.id = slugify(toString(node));
      }
    });
  };
}

function rehypeAddMDXExports(getExports) {
  return (tree) => {
    let exports = Object.entries(getExports(tree));

    for (let [name, value] of exports) {
      for (let node of tree.children) {
        if (
          node.type === 'mdxjsEsm' &&
          new RegExp(`export\\s+const\\s+${name}\\s*=`).test(node.value)
        ) {
          return;
        }
      }

      let exportStr = `export const ${name} = ${value}`;

      tree.children.push({
        type: 'mdxjsEsm',
        value: exportStr,
        data: {
          estree: acorn.parse(exportStr, {
            sourceType: 'module',
            ecmaVersion: 'latest',
          }),
        },
      });
    }
  };
}

function getSections(node, parentId = null) {
  let sections = [];
  let currentH2Id = parentId;

  for (let child of node.children ?? []) {
    if (child.type === 'element' && (child.tagName === 'h2' || child.tagName === 'h3')) {
      const level = parseInt(child.tagName.replace('h', ''));
      let sectionData = `{
        title: ${JSON.stringify(toString(child))},
        id: ${JSON.stringify(child.properties.id)},
        level: ${level},
        ...${child.properties.annotation}
      }`;

      if (level === 2) {
        currentH2Id = child.properties.id;
      } else if (level === 3 && currentH2Id) {
        sectionData = sectionData.replace('}', `, parentId: ${JSON.stringify(currentH2Id)}}`);
      }
      sections.push(sectionData);
    } else if (child.children) {
      sections.push(...getSections(child, currentH2Id));
    }
  }

  return sections;
}

export const rehypePlugins = [
  mdxAnnotations.rehype,
  rehypeParseCodeBlocks,
  rehypeShiki,
  rehypeSlugify,
  [
    rehypeAddMDXExports,
    (tree) => ({
      sections: `[${getSections(tree).join()}]`,
    }),
  ],
];
