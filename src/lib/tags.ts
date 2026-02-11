import glob from 'fast-glob';

export type TagPage = {
  url: string;
  title: string;
  description?: string;
  tags: string[];
};

function normalizeTag(tag: string) {
  return tag.toString().trim().toLowerCase();
}

function formatUrlFromFilename(filename: string) {
  const normalized = filename.replace(/\\/g, '/');
  return '/' + normalized.replace(/(^|\/)page\.mdx$/, '');
}

async function loadTagPages(): Promise<TagPage[]> {
  const files = await glob('**/*.mdx', { cwd: 'src/app' });

  return Promise.all(
    files.map(async (filename) => {
      const normalized = filename.replace(/\\/g, '/');
      const url = formatUrlFromFilename(normalized);
      const mod = await import(`../app/${normalized}`);
      const metadata = mod.metadata ?? {};
      const tags = Array.isArray(mod.tags)
        ? mod.tags.map(normalizeTag).filter(Boolean)
        : [];

      const fallbackTitle = url.split('/').filter(Boolean).pop() ?? url;

      return {
        url,
        title: metadata.title ?? fallbackTitle,
        description: metadata.description,
        tags,
      } as TagPage;
    }),
  );
}

export async function getTagIndex() {
  const pages = await loadTagPages();
  const index = new Map<string, TagPage[]>();

  for (const page of pages) {
    for (const tag of page.tags) {
      if (!index.has(tag)) {
        index.set(tag, []);
      }
      index.get(tag)?.push(page);
    }
  }

  for (const [tag, entries] of index.entries()) {
    index.set(
      tag,
      entries.sort((a, b) => a.title.localeCompare(b.title)),
    );
  }

  return index;
}

export async function getAllTags() {
  const index = await getTagIndex();
  return Array.from(index.keys()).sort((a, b) => a.localeCompare(b));
}

export async function getPagesByTag(tag: string) {
  const normalized = normalizeTag(tag);
  const index = await getTagIndex();
  return index.get(normalized) ?? [];
}
