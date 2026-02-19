import glob from 'fast-glob';

export type TagPage = {
  url: string;
  title: string;
  descriptionMd?: string;
  priority?: number;
  tags: string[];
  thumbnail?: string;
};

const DEFAULT_THUMBNAIL = '/thumbnial/this-site.png';

function normalizeTag(tag: string) {
  return tag.toString().trim().toLowerCase();
}

function formatUrlFromFilename(filename: string) {
  const normalized = filename.replace(/\\/g, '/');
  return '/' + normalized.replace(/(^|\/)page\.mdx$/, '');
}

export function comparePages(a: TagPage, b: TagPage) {
  const priorityDelta = (b.priority ?? 0) - (a.priority ?? 0);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return a.title.localeCompare(b.title);
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
        descriptionMd: metadata.descriptionMd,
        priority: metadata.priority ?? 0,
        tags,
        thumbnail: metadata.thumbnail ?? DEFAULT_THUMBNAIL,
      } as TagPage;
    }),
  );
}

let tagIndexPromise: Promise<Map<string, TagPage[]>> | null = null;

function buildTagIndex(pages: TagPage[]) {
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
    index.set(tag, entries.sort(comparePages));
  }

  return index;
}

export async function getTagIndex() {
  if (!tagIndexPromise) {
    tagIndexPromise = loadTagPages().then(buildTagIndex);
  }
  return tagIndexPromise;
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
