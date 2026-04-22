export const runtime = 'nodejs';

const SITE = 'https://donchong.top';

const body = JSON.stringify({
  linkset: [
    {
      anchor: `${SITE}/api/chat`,
      'service-desc': [
        { href: `${SITE}/openapi/chat.yaml`, type: 'application/yaml' },
      ],
      'service-doc': [
        { href: `${SITE}/docs/api/chat.md`, type: 'text/markdown' },
      ],
    },
    {
      anchor: `${SITE}/api/markdown`,
      'service-desc': [
        { href: `${SITE}/openapi/markdown.yaml`, type: 'application/yaml' },
      ],
      'service-doc': [
        {
          href: `${SITE}/.well-known/agent-skills/markdown-negotiation.md`,
          type: 'text/markdown',
        },
      ],
    },
  ],
});

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  });
}
