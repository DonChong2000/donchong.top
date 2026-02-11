import { slugifyWithCounter } from '@sindresorhus/slugify';
import * as acorn from 'acorn';
import glob from 'fast-glob';
import * as fs from 'fs';
import { toString } from 'mdast-util-to-string';
import * as path from 'path';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { createLoader } from 'simple-functional-loader';
import { filter } from 'unist-util-filter';
import { EXIT, SKIP, visit } from 'unist-util-visit';
import * as url from 'url';

import { remarkTags } from './remark-tags.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const processor = remark().use(remarkMdx).use(extractSections);
const tagProcessor = remark().use(remarkMdx).use(remarkTags);
const slugify = slugifyWithCounter();

function isObjectExpression(node) {
  return (
    node.type === 'mdxTextExpression' &&
    node.data?.estree?.body?.[0]?.expression?.type === 'ObjectExpression'
  );
}

function excludeObjectExpressions(tree) {
  return filter(tree, (node) => !isObjectExpression(node));
}

function extractSections() {
  return (tree, { sections }) => {
    slugify.reset();

    visit(tree, (node) => {
      if (node.type === 'heading' || node.type === 'paragraph') {
        let content = toString(excludeObjectExpressions(node));
        if (node.type === 'heading' && node.depth <= 2) {
          let hash = node.depth === 1 ? null : slugify(content);
          sections.push([content, hash, []]);
        } else {
          sections.at(-1)?.[2].push(content);
        }
        return SKIP;
      }
    });
  };
}

function getPriorityFromTree(tree) {
  let priority = 0;

  visit(tree, 'mdxjsEsm', (node) => {
    if (typeof node.value !== 'string') {
      return;
    }

    let parsed;
    try {
      parsed = acorn.parse(node.value, {
        sourceType: 'module',
        ecmaVersion: 'latest',
      });
    } catch {
      return;
    }

    for (let statement of parsed.body ?? []) {
      if (statement.type !== 'ExportNamedDeclaration') {
        continue;
      }

      let declaration = statement.declaration;
      if (!declaration || declaration.type !== 'VariableDeclaration') {
        continue;
      }

      for (let declarator of declaration.declarations) {
        if (
          declarator.id?.type !== 'Identifier' ||
          declarator.id.name !== 'metadata' ||
          declarator.init?.type !== 'ObjectExpression'
        ) {
          continue;
        }

        for (let prop of declarator.init.properties) {
          if (prop.type !== 'Property') {
            continue;
          }

          let key = prop.key;
          let keyName =
            key.type === 'Identifier'
              ? key.name
              : key.type === 'Literal'
                ? key.value
                : null;

          if (keyName !== 'priority') {
            continue;
          }

          let value = prop.value;
          if (value.type === 'Literal' && typeof value.value === 'number') {
            priority = value.value;
            return EXIT;
          }

          if (
            value.type === 'UnaryExpression' &&
            value.operator === '-' &&
            value.argument.type === 'Literal' &&
            typeof value.argument.value === 'number'
          ) {
            priority = -value.argument.value;
            return EXIT;
          }
        }
      }
    }
  });

  return priority;
}

function getTagsAndPriority(mdx) {
  let vfile = { value: mdx, data: {} };
  let tree = tagProcessor.parse(vfile);
  let priority = getPriorityFromTree(tree);

  tagProcessor.runSync(tree, vfile);

  let tags = Array.isArray(vfile.data.tags) ? vfile.data.tags : [];

  return { tags, priority };
}

export default function Search(nextConfig = {}) {
  let cache = new Map();

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let appDir = path.resolve('./src/app');
            this.addContextDependency(appDir);

            let files = glob.sync('**/*.mdx', { cwd: appDir });
            let data = files.map((file) => {
              let url = '/' + file.replace(/(^|\/)page\.mdx$/, '');
              let mdx = fs.readFileSync(path.join(appDir, file), 'utf8');

              let sections = [];
              let tags = [];
              let priority = 0;

              if (cache.get(file)?.[0] === mdx) {
                sections = cache.get(file)[1];
                tags = cache.get(file)[2] ?? [];
                priority = cache.get(file)[3] ?? 0;
              } else {
                let vfile = { value: mdx, sections };
                processor.runSync(processor.parse(vfile), vfile);
                let tagData = getTagsAndPriority(mdx);
                tags = tagData.tags;
                priority = tagData.priority;
                cache.set(file, [mdx, sections, tags, priority]);
              }

              return { url, sections, tags, priority };
            });

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                tokenize: 'full',
                document: {
                  id: 'url',
                  index: 'content',
                  store: ['title', 'pageTitle', 'priority'],
                },
                context: {
                  resolution: 9,
                  depth: 2,
                  bidirectional: true
                }
              })

              let data = ${JSON.stringify(data)}

              let tagSet = new Set()

              for (let { tags = [] } of data) {
                for (let tag of tags) {
                  if (tag) {
                    tagSet.add(tag)
                  }
                }
              }

              let tagList = Array.from(tagSet).sort((a, b) => a.localeCompare(b))

              for (let { url, sections, priority } of data) {
                for (let [title, hash, content] of sections) {
                  sectionIndex.add({
                    url: url + (hash ? ('#' + hash) : ''),
                    title,
                    content: [title, ...content].join('\\n'),
                    pageTitle: hash ? sections[0][0] : undefined,
                    priority: typeof priority === 'number' ? priority : 0,
                  })
                }
              }

              export function search(query, options = {}) {
                let result = sectionIndex.search(query, {
                  ...options,
                  enrich: true,
                })
                if (result.length === 0) {
                  return []
                }
                let ranked = result[0].result.map((item, index) => ({
                  url: item.id,
                  title: item.doc.title,
                  pageTitle: item.doc.pageTitle,
                  priority: typeof item.doc.priority === 'number' ? item.doc.priority : 0,
                  rank: index,
                }))

                ranked.sort((a, b) => b.priority - a.priority || a.rank - b.rank)

                return ranked.map((item) => ({
                  url: item.url,
                  title: item.title,
                  pageTitle: item.pageTitle,
                }))
              }

              export function searchTags(query, options = {}) {
                if (typeof query !== 'string' || !query.startsWith('#')) {
                  return []
                }

                let limit = typeof options.limit === 'number' ? options.limit : 5
                let normalized = query.replace(/^#+/, '').trim().toLowerCase()

                let matches = normalized
                  ? tagList.filter((tag) => tag.startsWith(normalized))
                  : tagList

                return matches.slice(0, limit).map((tag) => ({
                  url: '/tags/' + tag,
                  title: '#' + tag,
                  pageTitle: 'Tags',
                }))
              }
            `;
          }),
        ],
      });

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
}
