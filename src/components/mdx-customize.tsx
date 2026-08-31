// Components auto-injected into every MDX page via mdx.tsx, keeping mdx.tsx
// itself as untouched template. Content-only primitives belong here; anything
// that takes a data prop (GalleryGrid, ScrollingCards) stays in its own file
// and is imported by the page that uses it.

export function Figure({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    // my-0 kills prose's 2em image margin, which otherwise sits between the
    // image and its caption. The figure's own spacing is prose's default.
    <figure className="[&_img]:mx-auto [&_img]:my-0">
      {children}
      {/* ponytail: caption is a prop, not children — inline code inside JSX children crashes the Shiki rehype plugin */}
      <figcaption className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {caption}
      </figcaption>
    </figure>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="whitespace-nowrap text-yellow-500 dark:text-yellow-400">
      {'★'.repeat(n)}
      <span className="text-zinc-300 dark:text-zinc-600">
        {'☆'.repeat(5 - n)}
      </span>
    </span>
  );
}
