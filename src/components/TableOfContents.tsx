import { useSectionStore } from '@/components/SectionProvider';
export function TableOfContents() {
  // console.log(useSectionStore((s) => s.sections));

  const tableOfContents = useSectionStore((s) => s.sections);

  return (
    <div className="hidden xl:sticky xl:top-[4.75rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.75rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6">
      <nav aria-labelledby="on-this-page-title" className="w-56">
        TEST

        TEST
        {/* {tableOfContents.length > 0 && (
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
        )} */}
      </nav>
    </div>
  );
}
