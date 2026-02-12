import { ProjectTagFilterClient } from '@/components/ProjectTagFilterClient';
import { comparePages, getTagIndex, type TagPage } from '@/lib/tags';

const INCLUDED_PREFIXES = ['/projects/', '/notes/', '/hobbies/'];

function isIncludedUrl(url: string) {
  return INCLUDED_PREFIXES.some((prefix) => url.startsWith(prefix));
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

    pagesByTag[tag] = filteredPages;

    for (const page of filteredPages) {
      allPagesMap.set(page.url, page);
    }
  }

  const tags = Object.keys(pagesByTag).sort((a, b) => a.localeCompare(b));
  const allPages = Array.from(allPagesMap.values()).sort(comparePages);

  return (
    <ProjectTagFilterClient
      tags={tags}
      pagesByTag={pagesByTag}
      allPages={allPages}
    />
  );
}
