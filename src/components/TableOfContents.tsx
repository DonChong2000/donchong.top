import { useRef } from 'react';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import { useSectionStore } from '@/components/SectionProvider';
import clsx from 'clsx';
import { remToPx } from '@/lib/remToPx';
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation';

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current;
  return condition ? initialValue : value;
}

export function TableOfContents() {
  // console.log(useSectionStore((s) => s.sections));

  const tableOfContents = useSectionStore((s) => s.sections);
  let isInsideMobileNavigation = useIsInsideMobileNavigation();
  let [sections, visibleSections] = useInitialValue(
    [useSectionStore((s) => s.sections), useSectionStore((s) => s.visibleSections)],
    isInsideMobileNavigation,
  );

  const tocItems = [{ id: '_top', title: 'Overview', level: 2 }, ...sections];

  let firstVisibleSectionIndex = Math.max(
    0,
    tocItems.findIndex((section) => section.id === visibleSections[0]),
  );
  let itemHeight = remToPx(2);
  let height = useIsPresent()
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight;
  let top = firstVisibleSectionIndex * itemHeight;

  return (
    <div className="hidden xl:block xl:w-64 xl:flex-none xl:sticky xl:top-[0.75rem] xl:h-[calc(100vh)] xl:overflow-y-auto xl:py-16 xl:pl-6 "> {/* xl:border-l xl:border-zinc-900/10 xl:dark:border-white/10 */}
      <nav aria-labelledby="on-this-page-title" className="relative pl-5">
        <div className="absolute top-0 left-2 h-full w-[2px] bg-zinc-200 dark:bg-zinc-800" />
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {tocItems.length > 1 && (
            <motion.div
              layout
              className="absolute left-2 top-0 w-0.5 rounded-full bg-charcoal-500 dark:bg-timberwolf-200"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.2 },
              }}
              exit={{ opacity: 0 }}
              style={{
                height: 24,
                top: top,
              }}
            />
          )}
        </AnimatePresence>
        {tocItems.length > 1 && (
          <>
            {/* <h2
              id="on-this-page-title"
              className="font-display text-sm font-medium text-charcoal-700 dark:text-white"
            >
              On this page
            </h2> */}
            <ol role="list" className="mt-16 space-y-2 text-sm">
              {tocItems.map((section) => (
                <li key={section.id} className="relative">
                  <h3>
                    <a
                      href={section.id === '_top' ? '#' : `#${section.id}`}
                      className={clsx(
                        "block text-sm transition",
                        section.level === 3 ? "pl-4" : "pl-0",
                        section.id === visibleSections[0] ||
                          (section.level === 2 &&
                            sections.some(
                              (s) => s.parentId === section.id && s.id === visibleSections[0],
                            ))
                          ? "text-charcoal-500 font-bold dark:text-timberwolf-200 transition-all duration-300 ease-in-out"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all  duration-150 ease-in-out",
                      )}
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
