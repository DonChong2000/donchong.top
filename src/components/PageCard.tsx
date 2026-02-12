import Image from 'next/image';
import Link from 'next/link';

type PageCardProps = {
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
};

export function PageCard({
  url,
  title,
  description,
  thumbnail,
}: PageCardProps) {
  return (
    <Link
      href={url}
      className="group block rounded-2xl border border-zinc-900/5 bg-white/50 p-4 transition hover:border-zinc-900/10 dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex gap-4">
        {thumbnail && (
          <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/10">
            <Image
              src={thumbnail}
              alt={title}
              fill
              sizes="112px"
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
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
            {url}
          </div>
        </div>
      </div>
    </Link>
  );
}
