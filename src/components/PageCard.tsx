import Image from 'next/image';
import Link from 'next/link';

import { TagLink } from '@/components/TagLink';

type PageCardProps = {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
};

export function PageCard({
  url,
  title,
  description,
  tags,
  thumbnail,
}: PageCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-900/5 bg-white/50 p-4 transition hover:border-zinc-900/10 dark:border-white/10 dark:bg-white/5">
      <Link href={url} className="block">
        <div className="flex gap-4">
          {thumbnail && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/10">
              <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {title}
            </div>
            {description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </Link>
      {tags && tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <TagLink key={tag} tag={tag} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
