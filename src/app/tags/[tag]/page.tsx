import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Prose } from '@/components/Prose';
import { Tag } from '@/components/Tag';
import { getAllTags, getPagesByTag } from '@/lib/tags';

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return {
    title: `#${tag}`,
    description: `Pages tagged with #${tag}.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const pages = await getPagesByTag(tag);

  if (pages.length === 0) {
    notFound();
  }

  return (
    <article className="flex h-full flex-col pt-16 pb-10">
      <Prose className="flex-auto">
        {/* <h1 className="flex flex-wrap items-center gap-3">Tag:</h1>
        <p>
          <span className="inline-flex items-baseline">
            <Tag variant="medium" color="zinc">{`#${tag}`}</Tag>
          </span>
        </p>*/}

        {/* <div className="">
          Tag:<Tag variant="medium" color="zinc">{`#${tag}`}</Tag>
        </div> */}

        {/* <h1 className="flex flex-wrap items-end gap-2 leading-normal">
          <span className="leading-none">Tag:</span>
          <Tag variant="medium" color="zinc">{`#${tag}`}</Tag>
        </h1> */}

        <h1>#{tag}</h1>

        <ul className="not-prose mt-8 space-y-4">
          {pages.map((page) => (
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
      </Prose>
    </article>
  );
}
