const categories = [
  {
    name: 'ULV',
    href: '#the-beginning',
    imageSrc: '/2025-08-10_22.17.15.png',
  },
  {
    name: 'LV - MV',
    href: '#steam-age-and-lv-tier',
    imageSrc: '/2025-08-10_22.29.38.png',
  },
  {
    name: 'HV - EV',
    href: '#mv-hv-ev',
    imageSrc: '/2025-08-10_22.41.03.png',
  },
  {
    name: 'IV',
    href: '#iv-tier',
    imageSrc: '/2025-08-10_23.56.43.png',
  },
  { name: 'ZPM?', href: '#', imageSrc: '/Pasted%20image%2020250630155824.png' },
];

export function ScrollingCards(props: React.ComponentPropsWithoutRef<'div'>) {
  return (

      <div {...props}>
        <div className="mt-4 flow-root">
          <div className="-my-2">
            <div className="relative box-content h-50 overflow-x-auto py-2 xl:overflow-visible">
              <div className="absolute flex space-x-8 px-4 sm:px-6 lg:px-8 xl:relative xl:grid xl:grid-cols-5 xl:gap-x-8 xl:space-x-0 xl:px-0">
                {categories.map((category) => (
                  <a
                    key={category.name}
                    href={category.href}
                    className="relative flex h-50 w-56 flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
                  >
                    <span aria-hidden="true" className="absolute inset-0">
                      <img alt="" src={category.imageSrc} className="h-full w-full object-cover object-center not-prose" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-gray-800 opacity-50"
                    />
                    <span className="relative mt-auto text-center text-lg font-bold text-white whitespace-nowrap">{category.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:hidden">
          <a href="#" className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Browse all categories
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>
  );
}