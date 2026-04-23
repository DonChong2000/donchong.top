export const runtime = 'nodejs';

const SITE = 'https://donchong.top';

const body = JSON.stringify({
  $schema:
    'https://static.modelcontextprotocol.io/schemas/2025-10-17/server.schema.json',
  name: 'top.donchong/site',
  title: 'donchong.top',
  description:
    "MCP server for donchong.top — exposes the site's content as resources, full-text search and chat as tools.",
  version: '1.0.0',
  websiteUrl: SITE,
  repository: {
    url: 'https://github.com/DonChong2000/donchong.top',
    source: 'github',
  },
  serverInfo: {
    name: 'top.donchong/site',
    version: '1.0.0',
  },
  supportedProtocolVersions: ['2025-03-26', '2025-06-18'],
  transport: {
    type: 'streamable-http',
    endpoint: `${SITE}/mcp`,
  },
  remotes: [
    {
      transportType: 'streamable-http',
      url: `${SITE}/mcp`,
    },
  ],
  capabilities: {
    tools: { listChanged: false },
  },
  tools: [
    {
      name: 'search_site',
      description:
        'Full-text search across donchong.top notes, projects and hobbies.',
    },
    {
      name: 'fetch_page_markdown',
      description:
        'Fetch any page on donchong.top rendered as markdown (proxies the Accept: text/markdown content negotiation skill).',
    },
  ],
});

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  });
}
