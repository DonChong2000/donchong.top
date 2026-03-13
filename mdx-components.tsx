import { type MDXComponents } from 'mdx/types'
import Image from 'next/image'

import * as mdxComponents from '@/components/mdx'

export function useMDXComponents(components: MDXComponents) {
  return {
    ...components,
    ...mdxComponents,
    Image,
  }
}
