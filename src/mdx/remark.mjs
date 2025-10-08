import { mdxAnnotations } from 'mdx-annotations';
import remarkGfm from 'remark-gfm';
import { remarkWikiLinkImages } from './remark-wiki-link-images.mjs';

export const remarkPlugins = [
  remarkWikiLinkImages,
  mdxAnnotations.remark,
  remarkGfm,
];
