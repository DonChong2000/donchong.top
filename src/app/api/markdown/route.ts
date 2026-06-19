import { readFile } from 'node:fs/promises';
import type { NextRequest } from 'next/server';

import { resolveMdxPath, stripMdx } from '@/lib/mdxSource';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
