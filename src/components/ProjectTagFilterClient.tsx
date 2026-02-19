'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';

import { PageCard } from '@/components/PageCard';
import { Tag } from '@/components/Tag';

type TagPage = {
  url: string;
  title: string;
  descriptionMd?: string;
  tags: string[];
  thumbnail?: string;
};

type ProjectTagFilterClientProps = {
  tags: string[];
  pagesByTag: Record<string, TagPage[]>;
  allPages: TagPage[];
};

const ALL_TAG = 'all';

export function ProjectTagFilterClient({
  tags,
  pagesByTag,
  allPages,
}: ProjectTagFilterClientProps) {
  const [activeTag, setActiveTag] = useState<string>(ALL_TAG);

  const visiblePages = useMemo(() => {
    if (activeTag === ALL_TAG) {
      return allPages;
    }

    return pagesByTag[activeTag] ?? [];
  }, [activeTag, allPages, pagesByTag]);

  return (
    <div className="not-prose mt-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* All */}
        {(() => {
          const isActive = activeTag === ALL_TAG;

          return (
            <button
              type="button"
              onClick={() => setActiveTag(ALL_TAG)}
              aria-pressed={isActive}
              className="inline-flex rounded-full hover:shadow focus-visible:outline-none dark:hover:shadow-zinc-600"
            >
              <Tag variant="medium" color={isActive ? 'sitetheme' : 'zinc'}>
                All
              </Tag>
            </button>
          );
        })()}

        {/* Other tags */}
        {tags.map((tag) => {
          const isActive = activeTag === tag;

          return (
            <button
              key={tag}
              type="button"
              onClick={() =>
                setActiveTag((cur) => (cur === tag ? ALL_TAG : tag))
              }
              aria-pressed={isActive}
              className="inline-flex rounded-full hover:shadow focus-visible:outline-none dark:hover:shadow-zinc-600"
            >
              <Tag variant="medium" color={isActive ? 'sitetheme' : 'zinc'}>
                {`#${tag}`}
              </Tag>
            </button>
          );
        })}
      </div>

      <ul className="mt-8 space-y-4">
        {visiblePages.map((page) => (
          <li key={page.url}>
            <PageCard
              url={page.url}
              title={page.title}
              descriptionMd={page.descriptionMd}
              tags={page.tags}
              thumbnail={page.thumbnail}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
