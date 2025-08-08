'use client';

import Link from 'next/link';
import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';

import { GridPattern } from '@/components/GridPattern';
import { Heading } from '@/components/Heading';
import { ChatBubbleIcon } from '@/components/icons/ChatBubbleIcon';
import { EnvelopeIcon } from '@/components/icons/EnvelopeIcon';
import { UserIcon } from '@/components/icons/UserIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';

interface Recipe {
  href: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  pattern: Omit<
    React.ComponentPropsWithoutRef<typeof GridPattern>,
    'width' | 'height' | 'x'
  >
}

const recipes: Array<Recipe> = [
  {
    href: '/contacts',
    name: 'Contacts',
    description:
      'Learn about the contact model and how to create, retrieve, update, delete, and list contacts.',
    icon: UserIcon,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3],
      ],
    },
  },
  {
    href: '/conversations',
    name: 'Conversations',
    description:
      'Learn about the conversation model and how to create, retrieve, update, delete, and list conversations.',
    icon: ChatBubbleIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3],
      ],
    },
  },
  {
    href: '/messages',
    name: 'Messages',
    description:
      'Learn about the message model and how to create, retrieve, update, delete, and list messages.',
    icon: EnvelopeIcon,
    pattern: {
      y: 32,
      squares: [
        [0, 2],
        [1, 4],
      ],
    },
  },
  {
    href: '/groups',
    name: 'Groups',
    description:
      'Learn about the group model and how to create, retrieve, update, delete, and list groups.',
    icon: UsersIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]],
    },
  },
];

function RecipeIcon({ icon: Icon }: { icon: Recipe['icon'] }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-emerald-300/10 dark:group-hover:ring-emerald-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-emerald-300/10 dark:group-hover:stroke-emerald-400" />
    </div>
  );
}

function Recipe({ recipe }: { recipe: Recipe }) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      key={recipe.href}
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pt-16 pb-4">
        <RecipeIcon icon={recipe.icon} />
        <h3 className="mt-4 text-sm/7 font-semibold text-zinc-900 dark:text-white">
          <Link href={recipe.href}>
            <span className="absolute inset-0 rounded-2xl" />
            {recipe.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {recipe.description}
        </p>
      </div>
    </div>
  );
}

export function Recipes() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="recipes">
        My Favourite Recipes
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {recipes.map((recipe) => (
          <Recipe key={recipe.href} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
