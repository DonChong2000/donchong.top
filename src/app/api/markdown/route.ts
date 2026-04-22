import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  const candidate = trimmed === ''
    ? path.join(base, 'page.mdx')
    : path.join(base, trimmed, 'page.mdx');
  if (!candidate.startsWith(base + path.sep) && candidate !== path.join(base, 'page.mdx')) {
    return null;
  }
  return candidate;
}

export async function GET(req: NextRequest) {
  const p =
    req.headers.get('x-md-path') ??
    req.nextUrl.searchParams.get('path') ??
    '/';
  const filePath = resolveMdxPath(p);
  if (!filePath) {
    return new Response('Not found', { status: 404 });
  }

  let src: string;
  try {
    src = await readFile(filePath, 'utf8');
  } catch {
    return new Response('Not found', { status: 404 });
  }

  const md = stripMdx(src);
  const tokens = md.split(/\s+/).filter(Boolean).length;

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(tokens),
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  });
}
