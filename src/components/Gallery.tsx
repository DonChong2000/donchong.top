/* eslint-disable @next/next/no-img-element */
const product = [
    {
      src: '/signal-2025-09-21-195238_002.jpeg',
      alt: 'Two each of gray, white, and black shirts laying flat.',
      text: 'Italian Ciabatta',
      href: '/cookbook/1',
    },
    {
      src: '/signal-2025-09-21-195238_002.jpeg',
      alt: 'Model wearing plain black basic tee.',
      text: 'Example',
      href: '#',
    },
    {
      src: '/signal-2025-09-21-195238_002.jpeg',
      alt: 'Model wearing plain gray basic tee.',
      text: 'Example',
      href: '#',
    },
    {
      src: '/signal-2025-09-21-195238_002.jpeg',
      alt: 'Model wearing plain white basic tee.',
      text: 'Example',
      href: '#',
    },
];

export default function Gallery() {
  return (
    <div>
        <div className="lg:grid lg:grid-cols-3 lg:gap-2 not-prose mt-4">


            <div className="relative row-span-2 aspect-3/4 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75">
            <a href={product[0].href}>
                <img
                    alt={product[0].alt}
                    src={product[0].src}
                    className="row-span-2 aspect-3/4 size-full rounded-lg object-cover max-lg:hidden"
                />
            </a>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <h3 className="relative mt-auto text-center text-l font-bold text-white">{product[0].text}</h3>
            </div>
            </div>

            <div className="relative col-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75">
            <a href={product[1].href}>
                <img
                    alt={product[1].alt}
                    src={product[1].src}
                    className="col-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75"
                />
            </a>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <h3 className="relative mt-auto text-center text-l font-bold text-white">{product[1].text}</h3>
            </div>
            </div>

            <div className="relative col-start-2 row-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75">
            <a href={product[2].href}>
                <img
                    alt={product[2].alt}
                    src={product[2].src}
                    className="col-start-2 row-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75"
                />
            </a>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <h3 className="relative mt-auto text-center text-l font-bold text-white">{product[2].text}</h3>
            </div>
            </div>

            <div className="relative row-span-2 aspect-4/5 size-full object-cover sm:rounded-lg lg:aspect-3/4 hover:opacity-75">
            <a href={product[3].href}>
                <img
                    alt={product[3].alt}
                    src={product[3].src}
                    className="row-span-2 aspect-4/5 size-full object-cover sm:rounded-lg lg:aspect-3/4 hover:opacity-75"
                />
            </a>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <h3 className="relative mt-auto text-center text-l font-bold text-white">{product[3].text}</h3>
            </div>
            </div>

        </div>
    </div>
  );
}