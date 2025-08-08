import { useSectionStore } from '@/components/SectionProvider';
export function TableOfContents() {
  // console.log(useSectionStore((s) => s.sections));

  const tableOfContents = useSectionStore((s) => s.sections);

  return (
    <div className="hidden xl:block xl:w-64 xl:flex-none xl:sticky xl:top-[4.75rem] xl:h-[calc(100vh-4.75rem)] xl:overflow-y-auto xl:py-16 xl:pl-6 xl:border-l xl:border-zinc-900/10 xl:dark:border-white/10">
      <nav aria-labelledby="on-this-page-title">
        {tableOfContents.length > 0 && (
          <>
            <h2
              id="on-this-page-title"
              className="font-display text-sm font-medium text-slate-900 dark:text-white"
            >
              On this page
            </h2>
            <ol role="list" className="mt-4 space-y-3 text-sm">
              {tableOfContents.map((section) => (
                <li key={section.id}>
                  <h3>
                    <a
                      href={`#${section.id}`}
                    >
                      {section.title}
                    </a>
                  </h3>
                </li>
              ))}
            </ol>
          </>
        )}
      </nav>
    </div>
  );
}
