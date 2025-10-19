'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { AnimatePresence, motion} from 'framer-motion';

import { Button } from '@/components/Button';
import { useIsInsideMobileNavigation } from '@/components/MobileNavigation';
import { useSectionStore } from '@/components/SectionProvider';
import { Tag } from '@/components/Tag';
import { remToPx } from '@/lib/remToPx';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface NavGroup {
  title: string,
  links: {
    title: string,
    href: string,
    children?: {
      title: string,
      href: string,
      id: string,
    }[],
  }[]
}


function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);
  const hasMounted = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue) {
      try {
        setState(JSON.parse(storedValue));
      } catch (error) {
        console.error('Error reading from localStorage', error);
      }
    }
  }, [key]);

  // Save to localStorage on state change, but only after the initial load has happened.
  useEffect(() => {
    if (hasMounted.current) {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    } else {
      hasMounted.current = true;
    }
  }, [key, state]);

  return [state, setState];
}

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current;
  return condition ? initialValue : value;
}

function TopLevelNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
}: {
  href: string
  children: React.ReactNode
  tag?: string
  active?: boolean
  isAnchorLink?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-sm transition',
        isAnchorLink ? 'pl-7' : 'pl-4',
        active
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
      )}
    >
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  );
}

function VisibleSectionHighlight({
  group,
  pathname,
  openDropdowns,
}: {
  group: NavGroup
  pathname: string
  openDropdowns: { [key: string]: boolean }
}) {
  const itemHeight = remToPx(2);
  let calculatedTop = -1; // Sentinel value
  let currentHeight = 0;

  for (const link of group.links) {
    const isParentActive =
      (link.href !== '#' && pathname.startsWith(link.href)) ||
      (link.children &&
        link.children.some((child) => pathname.startsWith(child.href)));

    if (isParentActive) {
      calculatedTop = currentHeight;

      if (link.children) {
        const activeChildIndex = link.children.findIndex((child) =>
          pathname.startsWith(child.href),
        );
        if (activeChildIndex !== -1) {
          const isDropdownOpen = openDropdowns[link.title] === true;
          if (isDropdownOpen) {
            // If open, marker is on the specific child.
            calculatedTop = currentHeight + (activeChildIndex + 1) * itemHeight;
          }
          // If closed, marker is on the parent, which is already set.
        }
      }
      break;
    }

    // If we haven't found the active item yet, advance the height counter.
    currentHeight += itemHeight;

    // And if its dropdown is open, add the height of its children.
    if (openDropdowns[link.title] && link.children) {
      currentHeight += link.children.length * itemHeight;
    }
  }

  if (calculatedTop === -1) {
    return null; // Active page not in this group.
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="absolute inset-x-0 top-0 bg-timberwolf-800/2.5 will-change-transform dark:bg-white/2.5"
      style={{ borderRadius: 8, height: itemHeight, top: calculatedTop }}
    />
  );
}

function ActivePageMarker({
  group,
  pathname,
  openDropdowns,
}: {
  group: NavGroup
  pathname: string
  openDropdowns: { [key: string]: boolean }
}) {
  const itemHeight = remToPx(2);
  const offset = remToPx(0.25);
  let calculatedTop = -1; // Sentinel value

  let currentHeight = offset;

  for (const link of group.links) {
    // Case 1: The link itself is the active page.
    if (link.href === pathname) {
      calculatedTop = currentHeight;
      break;
    }

    // Case 2: The active page is a child of the current link.
    if (link.children) {
      const activeChildIndex = link.children.findIndex(
        (child) => child.href === pathname,
      );
      if (activeChildIndex !== -1) {
        const isDropdownOpen = openDropdowns[link.title] === true;
        if (isDropdownOpen) {
          // If open, marker is on the specific child.
          calculatedTop = currentHeight + (activeChildIndex + 1) * itemHeight;
        } else {
          // If closed, marker is on the parent.
          calculatedTop = currentHeight;
        }
        break;
      }
    }

    // If we haven't found the active item yet, advance the height counter.
    currentHeight += itemHeight;

    // And if its dropdown is open, add the height of its children.
    if (openDropdowns[link.title] && link.children) {
      currentHeight += link.children.length * itemHeight;
    }
  }

  if (calculatedTop === -1) {
    return null; // Active page not in this group.
  }

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-charcoal-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top: calculatedTop }}
    />
  );
}

function ParentLink({
  link,
  isOpen,
  setIsOpen,
}: {
  link: NavGroup['links'][number]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const pathname = usePathname();

  return (
    <motion.li layout="position" className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 py-1 pr-3 text-sm transition pl-4 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <span className="truncate">{link.title}</span>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>
      <AnimatePresence mode="popLayout" initial={false}>
        {isOpen && (
          <motion.ul
            role="list"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.1 },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15 },
            }}
          >
            {link.children?.map((child) => (
              <li key={child.id}>
                <NavLink
                  href={child.href}
                  active={child.href === pathname}
                  isAnchorLink
                >
                  {child.title}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup
  className?: string
}) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation();
  let [pathname, sections] = useInitialValue(
    [usePathname(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation,
  );

  let isActiveGroup =
    group.links.findIndex(
      (link) =>
        (link.href !== '#' && pathname.startsWith(link.href)) ||
        (link.children &&
          link.children.some((child) => pathname.startsWith(child.href))),
    ) !== -1;

  const [openDropdowns, setOpenDropdowns] = usePersistentState<{
    [key: string]: boolean
  }>(`nav-group-dropdown-state-${group.title}`, {});

  const handleDropdownToggle = (title: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold text-zinc-900 dark:text-white"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && (
            <VisibleSectionHighlight
              group={group}
              pathname={pathname}
              openDropdowns={openDropdowns}
            />
          )}
        </AnimatePresence>
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker
              group={group}
              pathname={pathname}
              openDropdowns={openDropdowns}
            />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => {
            if (link.children) {
              return (
                <ParentLink
                  key={link.href}
                  link={link}
                  isOpen={openDropdowns[link.title] || false}
                  setIsOpen={() => handleDropdownToggle(link.title)}
                />
              );
            }
            return (
              <motion.li key={link.href} layout="position" className="relative">
                <NavLink href={link.href} active={link.href === pathname}>
                  {link.title}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}

export const navigation: Array<NavGroup> = [
  {
    title: 'Projects',
    links: [
      { title: 'Overview', href: '/projects-overview' },
      // { title: 'Chat-CV', href: '/chat-cv' },
      { title: 'This Site', href: '/this-site' },
      { title: 'And more...', href: '/projects/drowning-detection-rescue-system',
        children: [
          { title: 'Drowning Detection & Rescue System', href: '/projects/drowning-detection-rescue-system', id: 'Drowning Detection & Rescue System' },
          { title: 'Timelapse Machine', href: '/projects/timelapse-machine', id: 'Timelapse Machine' },
          { title: 'Bill-AI', href: '/projects/bill-ai', id: 'Bill-AI' },
          { title: 'status.donchong.top', href: '/projects/site-status', id: 'status.donchong.top' },
          { title: 'Comparing ASR Solutions', href: '/projects/comparing-asr-solutions', id: 'Comparing ASR Solutions' },
          { title: 'Transcriber', href: '/projects/transcriber', id: 'Transcriber' },
        ],
      },


    ],
  },
  {
    title: 'Hobbies',
    links: [
      { title: 'GTNH', href: '/gtnh' },
      { title: 'Cookbook', href: '/cookbook',
        children: [
          { title: 'Recipe1', href: '/cookbook/1', id: 'Recipe1' },

        ],
      },
      { title: 'Random Notes', href: '/random-notes',
        children: [
          { title: 'The Seagram Building', href: '/random-notes/the-seagram-building', id: 'The Seagram Building' },
          { title: 'Test', href: '/random-notes/test', id: 'Test' }
        ],
      },
    ],
  }
];

export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="/me">About Me</TopLevelNavItem>
        {/* <TopLevelNavItem href="/contacts">Contacts</TopLevelNavItem> */}
        {/* <TopLevelNavItem href="#">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="#">Support</TopLevelNavItem> */}
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
        {/* <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button href="#" variant="filled" className="w-full">
            Sign in
          </Button>
        </li> */}
      </ul>
    </nav>
  );
}
