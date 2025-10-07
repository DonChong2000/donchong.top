import { mdxAnnotations } from 'mdx-annotations';
import remarkGfm from 'remark-gfm';
import { remarkTransformImages } from './remark-transform-images.mjs';

export const remarkPlugins = [remarkTransformImages, mdxAnnotations.remark, remarkGfm];
