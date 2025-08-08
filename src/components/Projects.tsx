import { Button } from '@/components/Button';
import { Heading } from '@/components/Heading';

const projects = [
  {
    href: '/authentication',
    name: 'Authentication',
    description: 'Learn how to authenticate your API requests.',
  },
  {
    href: '/pagination',
    name: 'Pagination',
    description: 'Understand how to work with paginated responses.',
  },
  {
    href: '/errors',
    name: 'Errors',
    description:
      'Read about the different types of errors returned by the API.',
  },
  {
    href: '/webhooks',
    name: 'Webhooks',
    description:
      'Learn how to programmatically configure webhooks for your app.',
  },
];

export function Projects() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="projects">
        Projects
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {projects.map((project) => (
          <div key={project.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {project.description}
            </p>
            <p className="mt-4">
              <Button href={project.href} variant="text" arrow="right">
                Read more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
