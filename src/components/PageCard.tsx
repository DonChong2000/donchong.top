import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { TagLink } from '@/components/TagLink';

type PageCardProps = {
  url: string;
  title: string;
  descriptionMd?: string;
  tags?: string[];
  thumbnail?: string;
};

export function PageCard({
  url,
  title,
  descriptionMd,
  tags,
  thumbnail,
}: PageCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-900/5 bg-white/50 p-4 transition hover:border-zinc-900/10 dark:border-white/10 dark:bg-white/5">
      <Link href={url} className="block">
        <div className="flex gap-4">
          {thumbnail && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md dark:bg-white/10 dark:shadow-black/40">
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
            {descriptionMd && (
              <div className="prose mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                <ReactMarkdown //Speific problem on ReactMarkdown and tailwind: https://stackoverflow.com/questions/77548370/react-markdown-not-displaying-ordered-list
                  remarkPlugins={[remarkGfm]}
                  components={{
                    ul: (props) => <ul className="list-disc pl-5" {...props} />,
                    ol: (props) => (
                      <ol className="list-decimal pl-5" {...props} />
                    ),
                    li: (props) => <li className="my-1" {...props} />,
                    strong: (props) => (
                      <strong
                        className="font-semibold text-zinc-900 dark:text-zinc-100"
                        {...props}
                      />
                    ),
                  }}
                >
                  {descriptionMd}
                </ReactMarkdown>
              </div>
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
