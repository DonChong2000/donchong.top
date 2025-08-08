import { useRef } from 'react';
import { motion, AnimatePresence, useIsPresent } from 'framer-motion';
import { useSectionStore } from '@/components/SectionProvider';
import clsx from 'clsx';
import { remToPx } from '@/lib/remToPx';
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation';

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

export function TableOfContents() {
  // console.log(useSectionStore((s) => s.sections));

  const tableOfContents = useSectionStore((s) => s.sections);
  let isInsideMobileNavigation = useIsInsideMobileNavigation();
  let [sections, visibleSections] = useInitialValue(
    [useSectionStore((s) => s.sections), useSectionStore((s) => s.visibleSections)],
    isInsideMobileNavigation,
  );

  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: '_top' }, ...sections].findIndex(
      (section) => section.id === visibleSections[0],
    ),
  );
  let itemHeight = remToPx(2);
  let height = useIsPresent()
    ? Math.max(1, visibleSections.length) * itemHeight
    : itemHeight;
  let top = firstVisibleSectionIndex * itemHeight;

  return (
    <div className="hidden xl:block xl:w-64 xl:flex-none xl:sticky xl:top-[4.75rem] xl:h-[calc(100vh-4.75rem)] xl:overflow-y-auto xl:py-16 xl:pl-6 xl:border-l xl:border-zinc-900/10 xl:dark:border-white/10">
      <nav aria-labelledby="on-this-page-title" className="relative pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {sections.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-0 bg-zinc-800/2.5 will-change-transform dark:bg-white/2.5"
              style={{ borderRadius: 8, height, top }}
            />
          )}
        </AnimatePresence>
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
                <li key={section.id} className="relative">
                  <h3>
                    <a
                      href={`#${section.id}`}
                      className={clsx(
                        "block py-1 text-sm transition",
                        section.level === 3 ? "pl-7" : "pl-4",
                        section.id === visibleSections[0]
                          ? "text-[#E49B0F]"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
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
