import path from 'node:path';
import { readFile } from 'node:fs/promises';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'top.donchong/site', version: '1.0.0' };

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc: '2.0';
  id?: JsonRpcId;
  method: string;
  params?: any;
};

type JsonRpcResponse =
  | { jsonrpc: '2.0'; id: JsonRpcId; result: unknown }
  | { jsonrpc: '2.0'; id: JsonRpcId; error: { code: number; message: string } };

const TOOLS = [
  {
    name: 'search_site',
    description:
      'Full-text search across donchong.top notes, projects, hobbies and recipes. Returns matching pages with url, section title and parent page title.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query.' },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 25,
          description: 'Maximum number of results (default 10).',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'fetch_page_markdown',
    description:
      'Fetch any page on donchong.top rendered as markdown. Path should be site-relative (e.g. "/", "/me", "/projects/this-site").',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Site-relative path. Defaults to "/".',
        },
      },
      additionalProperties: false,
    },
  },
] as const;

function stripMdx(src: string): string {
  let out = src.replace(/^[ \t]*import\s[^\n]*\n/gm, '');
  out = out.replace(/^[ \t]*export\s+const\s+\w+\s*=\s*\{[\s\S]*?\n\};?\s*\n/gm, '');
  out = out.replace(/^[ \t]*export\s+const\s+\w+\s*=\s*\[[\s\S]*?\n\];?\s*\n/gm, '');
  out = out.replace(/^[ \t]*export\s+const\s+\w+\s*=\s*`[\s\S]*?`;?\s*\n/gm, '');
  return out.replace(/^\s+/, '').trimEnd() + '\n';
}

function resolveMdxPath(urlPath: string): string | null {
  const trimmed = urlPath.replace(/^\/+|\/+$/g, '');
  if (/(^|\/)\.\.(\/|$)/.test(trimmed)) return null;
  const base = path.resolve(process.cwd(), 'src', 'app');
  const candidate =
    trimmed === ''
      ? path.join(base, 'page.mdx')
      : path.join(base, trimmed, 'page.mdx');
  if (
    !candidate.startsWith(base + path.sep) &&
    candidate !== path.join(base, 'page.mdx')
  ) {
    return null;
  }
  return candidate;
}

async function callTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  if (name === 'search_site') {
    const query = String(args.query ?? '').trim();
    if (!query) {
      return {
        content: [{ type: 'text', text: 'query is required' }],
        isError: true,
      };
    }
    const limit = Math.min(Math.max(Number(args.limit ?? 10) || 10, 1), 25);
    const { search } = (await import('@/mdx/search.mjs')) as {
      search: (q: string) => Array<{ url: string; title: string; pageTitle?: string }>;
    };
    const results = search(query).slice(0, limit);
    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
    };
  }

  if (name === 'fetch_page_markdown') {
    const p = String(args.path ?? '/') || '/';
    const filePath = resolveMdxPath(p);
    if (!filePath) {
      return {
        content: [{ type: 'text', text: `invalid path: ${p}` }],
        isError: true,
      };
    }
    try {
      const src = await readFile(filePath, 'utf8');
      return { content: [{ type: 'text', text: stripMdx(src) }] };
    } catch {
      return {
        content: [{ type: 'text', text: `not found: ${p}` }],
        isError: true,
      };
    }
  }

  return {
    content: [{ type: 'text', text: `unknown tool: ${name}` }],
    isError: true,
  };
}

async function handle(msg: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  if (msg.id == null) {
    return null;
  }
  const id = msg.id;
  try {
    switch (msg.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            serverInfo: SERVER_INFO,
            capabilities: { tools: { listChanged: false } },
          },
        };
      case 'ping':
        return { jsonrpc: '2.0', id, result: {} };
      case 'tools/list':
        return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
      case 'tools/call':
        return {
          jsonrpc: '2.0',
          id,
          result: await callTool(
            String(msg.params?.name ?? ''),
            (msg.params?.arguments ?? {}) as Record<string, unknown>,
          ),
        };
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${msg.method}` },
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return { jsonrpc: '2.0', id, error: { code: -32603, message } };
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
      { status: 400 },
    );
  }

  const batch = Array.isArray(body) ? body : [body];
  const responses: JsonRpcResponse[] = [];
  for (const raw of batch) {
    if (!raw || typeof raw !== 'object' || (raw as any).jsonrpc !== '2.0') {
      responses.push({
        jsonrpc: '2.0',
        id: (raw as any)?.id ?? null,
        error: { code: -32600, message: 'Invalid Request' },
      });
      continue;
    }
    const res = await handle(raw as JsonRpcRequest);
    if (res) responses.push(res);
  }

  if (responses.length === 0) {
    return new Response(null, { status: 202 });
  }

  return Response.json(Array.isArray(body) ? responses : responses[0], {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function GET() {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}
