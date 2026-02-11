import { mdxAnnotations } from 'mdx-annotations';
import remarkGfm from 'remark-gfm';
import { remarkTags } from './remark-tags.mjs';
import { remarkWikiLinkImages } from './remark-wiki-link-images.mjs';

export const remarkPlugins = [
  remarkWikiLinkImages,
  remarkTags,
  mdxAnnotations.remark,
  remarkGfm,
];
