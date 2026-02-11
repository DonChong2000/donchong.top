import Link from 'next/link';

import { Tag } from '@/components/Tag';

function normalizeTag(tag: string) {
  return tag.toString().trim().toLowerCase();
}

export function TagLink({ tag }: { tag: string }) {
  const normalizedTag = normalizeTag(tag);

  if (!normalizedTag) {
    return null;
  }

  return (
    <Link
      href={`/tags/${normalizedTag}`}
      className="inline-flex align-baseline no-underline hover:opacity-80"
      aria-label={`View pages tagged ${normalizedTag}`}
    >
      <Tag variant="medium" color="zinc">{`#${normalizedTag}`}</Tag>
    </Link>
  );
}
