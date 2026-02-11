import { ProjectTagFilterClient } from '@/components/ProjectTagFilterClient';
import { getTagIndex, type TagPage } from '@/lib/tags';

const INCLUDED_PREFIXES = ['/projects/', '/notes/', '/hobbies/'];

function isIncludedUrl(url: string) {
  return INCLUDED_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function sortPages(pages: TagPage[]) {
  return pages.slice().sort((a, b) => ((b.priority ?? 0) !== (a.priority ?? 0) ? (b.priority ?? 0) - (a.priority ?? 0) : a.title.localeCompare(b.title)));
}

export async function ProjectTagFilterSection() {
  const index = await getTagIndex();
  const pagesByTag: Record<string, TagPage[]> = {};
  const allPagesMap = new Map<string, TagPage>();

  for (const [tag, pages] of index.entries()) {
    const filteredPages = pages.filter((page) => isIncludedUrl(page.url));
    if (filteredPages.length === 0) {
      continue;
    }

    const sortedPages = sortPages(filteredPages);
    pagesByTag[tag] = sortedPages;

    for (const page of sortedPages) {
      allPagesMap.set(page.url, page);
    }
  }

  const tags = Object.keys(pagesByTag).sort((a, b) => a.localeCompare(b));
  const allPages = sortPages(Array.from(allPagesMap.values()));

  return (
    <ProjectTagFilterClient
      tags={tags}
      pagesByTag={pagesByTag}
      allPages={allPages}
    />
  );
}
