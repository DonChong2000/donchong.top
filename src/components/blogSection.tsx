import Image from 'next/image';

const posts = [
  {
    id: 1,
    title: 'DonChong.Top',
    href: '/this-site',
    description:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.',
    imageUrl:
      '/homepage/icon-trim.png',
    date: 'Jul 17, 2025',
    datetime: '2025-07-17',
    category: { title: 'Marketing', href: '#' },
  },
  {
    id: 2,
    title: 'Swimming Pool Drown Detection and Rescue System (FYP)',
    href: '/projects/drowning-detection-rescue-system',
    description:
      'A system that detects drowning incidents using a wearable device, pinpoints the location with computer vision, and deploys a robotic float for active rescue. I contributed to the concept, research, WebApp, and integration of the computation, wearable, and robotic components, as well as assisting in wearable development.',
    imageUrl:
      '/homepage/fyp_croped.png',
    date: 'Apr 20, 2022',
    datetime: '2022-04-20',
    category: { title: 'Marketing', href: '#' }, 
  },
  {
    id: 3,
    title: 'Timelapse Machine',
    href: '/projects/timelapse-machine',
    description:
      'A system that detects drowning incidents using a wearable device, pinpoints the location with computer vision, and deploys a robotic float for active rescue. I contributed to the concept, research, WebApp, and integration of the computation, wearable, and robotic components, as well as assisting in wearable development.',
    imageUrl:
      '/homepage/timelapseMachine.jpg',
    date: 'Dec 1, 2020',
    datetime: '2020-12-01',
    category: { title: 'Marketing', href: '#' }, 
  },
  {
    id: 4,
    title: 'Bill-AI',
    href: '/projects/bill-ai',
    description:
      'A system that detects drowning incidents using a wearable device, pinpoints the location with computer vision, and deploys a robotic float for active rescue. I contributed to the concept, research, WebApp, and integration of the computation, wearable, and robotic components, as well as assisting in wearable development.',
    imageUrl:
      '/homepage/bill-ai2.png',
    date: 'Nov 08, 2024',
    datetime: '2024-11-08',
    category: { title: 'Marketing', href: '#' }, 
  },
  {
    id: 5,
    title: 'status.donchong.top',
    href: '/projects/site-status',
    description:
      'A system that detects drowning incidents using a wearable device, pinpoints the location with computer vision, and deploys a robotic float for active rescue. I contributed to the concept, research, WebApp, and integration of the computation, wearable, and robotic components, as well as assisting in wearable development.',
    imageUrl:
      '/homepage/status2.png',
    date: 'Aug 27, 2024',
    datetime: '2020-03-16',
    category: { title: 'Marketing', href: '#' }, 
  },
  {
    id: 6,
    title: 'Transriber',
    href: '/projects/transcriber',
    description:
      'A system that detects drowning incidents using a wearable device, pinpoints the location with computer vision, and deploys a robotic float for active rescue. I contributed to the concept, research, WebApp, and integration of the computation, wearable, and robotic components, as well as assisting in wearable development.',
    imageUrl:
      '/homepage/transcriber2.png',
    date: 'May 30, 2025',
    datetime: '2025-05-30',
    category: { title: 'Marketing', href: '#' }, 
  },
];

export default function BlogSection() {
  return (
    <div className="not-prose">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
            {posts.map((post) => (
              <article key={post.id} className="relative isolate flex flex-col gap-8 lg:flex-row">
                <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                  <Image
                    alt=""
                    src={post.imageUrl}
                    fill
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-charcoal-900/10 dark:ring-white/10" />
                </div>
                <div>
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.datetime} className="text-gray-500 dark:text-gray-400">
                      {post.date}
                    </time>
                    {/* <a
                      href={post.category.href}
                      className="relative z-10 rounded-full px-3 py-1.5 font-medium bg-timberwolf-50 text-charcoal hover:bg-timberwolf-100 dark:hover:bg-timberwolf-200"
                    >
                      {post.category.title}
                    </a> */}
                  </div>
                  <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-charcoal-460 group-hover:text-charcoal-600 dark:text-timberwolf-400 dark:group-hover:text-timberwolf-100">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-5 text-sm leading-6 text-charcoal-700 dark:text-charcoal-100">{post.description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}