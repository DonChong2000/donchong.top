'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import clsx from 'clsx';

import { Tag } from '@/components/Tag';

type TagPage = {
  url: string;
  title: string;
  description?: string;
  tags: string[];
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
        <button
          type="button"
          onClick={() => setActiveTag(ALL_TAG)}
          aria-pressed={activeTag === ALL_TAG}
          className={clsx(
            'inline-flex rounded-full transition focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 focus-visible:outline-none dark:focus-visible:ring-offset-zinc-900',
            activeTag === ALL_TAG
              ? 'ring-1 ring-zinc-300 dark:ring-zinc-600'
              : 'ring-1 ring-transparent',
          )}
        >
          <Tag variant="medium" color="zinc">
            All
          </Tag>
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() =>
              setActiveTag((current) => (current === tag ? ALL_TAG : tag))
            }
            aria-pressed={activeTag === tag}
            className={clsx(
              'inline-flex rounded-full transition focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 focus-visible:outline-none dark:focus-visible:ring-offset-zinc-900',
              activeTag === tag
                ? 'ring-1 ring-zinc-300 dark:ring-zinc-600'
                : 'ring-1 ring-transparent',
            )}
          >
            <Tag variant="medium" color="zinc">{`#${tag}`}</Tag>
          </button>
        ))}
      </div>

      <ul className="mt-8 space-y-4">
        {visiblePages.map((page) => (
          <li key={page.url}>
            <Link
              href={page.url}
              className="group block rounded-2xl border border-zinc-900/5 bg-white/50 p-4 transition hover:border-zinc-900/10 dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                {page.title}
              </div>
              {page.description && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {page.description}
                </p>
              )}
              <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                {page.url}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
