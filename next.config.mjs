import nextMDX from '@next/mdx'

import { recmaPlugins } from './src/mdx/recma.mjs'
import { rehypePlugins } from './src/mdx/rehype.mjs'
import { remarkPlugins } from './src/mdx/remark.mjs'
import withSearch from './src/mdx/search.mjs'

const withMDX = nextMDX({
  options: {
    remarkPlugins,
    rehypePlugins,
    recmaPlugins,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  output: 'standalone',
  outputFileTracingIncludes: {
    '/**/*': ['./src/app/**/*.mdx'],
  },
  async headers() {
    const linkValue = [
      '<https://donchong.top/sitemap.xml>; rel="sitemap"; type="application/xml"',
      '<https://donchong.top/.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '<https://donchong.top/.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
    ].join(', ')
    return [
      {
        source: '/',
        headers: [
          { key: 'Link', value: linkValue },
          { key: 'Vary', value: 'Accept' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/api-catalog',
        destination: '/api/well-known/api-catalog',
      },
    ]
  },
}

export default withSearch(withMDX(nextConfig))
