import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const accept = (req.headers.get('accept') ?? '').toLowerCase();
  if (!accept.includes('text/markdown')) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/.well-known/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/api/markdown';
  url.search = '';
  const headers = new Headers(req.headers);
  headers.set('x-md-path', pathname);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/|favicon\\.ico).*)'],
};
