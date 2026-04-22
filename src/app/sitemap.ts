import type { MetadataRoute } from 'next';
import glob from 'fast-glob';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://donchong.top';

const EXCLUDE = [/^\/test(\/|$)/, /^\/random-notes\/test(\/|$)/];

function toUrlPath(file: string): string {
  const trimmed = file.replace(/(^|\/)page\.mdx$/, '');
  return trimmed === '' ? '/' : '/' + trimmed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const files = await glob('**/page.mdx', { cwd: 'src/app' });

  const entries = await Promise.all(
    files.map(async (file) => {
      const urlPath = toUrlPath(file);
      if (EXCLUDE.some((re) => re.test(urlPath))) return null;
      const abs = path.join(process.cwd(), 'src', 'app', file);
      let lastModified: Date;
      try {
        lastModified = (await stat(abs)).mtime;
      } catch {
        lastModified = new Date();
      }
      return {
        url: SITE_URL + urlPath,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: urlPath === '/' ? 1 : 0.7,
      };
    }),
  );

  return entries.filter((e): e is NonNullable<typeof e> => e !== null);
}
