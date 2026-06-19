import path from 'node:path';

export function stripMdx(src: string): string {
  let out = src.replace(/^[ \t]*import\s[^\n]*\n/gm, '');
  out = out.replace(/^[ \t]*export\s+const\s+\w+\s*=\s*\{[\s\S]*?\n\};?\s*\n/gm, '');
  out = out.replace(/^[ \t]*export\s+const\s+\w+\s*=\s*\[[\s\S]*?\n\];?\s*\n/gm, '');
  out = out.replace(/^[ \t]*export\s+const\s+\w+\s*=\s*`[\s\S]*?`;?\s*\n/gm, '');
  return out.replace(/^\s+/, '').trimEnd() + '\n';
}

export function resolveMdxPath(urlPath: string): string | null {
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
