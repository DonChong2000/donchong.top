/* eslint-disable @next/next/no-img-element */
const product = {
  images: [
    {
      src: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-02-secondary-product-shot.jpg',
      alt: 'Two each of gray, white, and black shirts laying flat.',
      href: '/cookbook/1',
    },
    {
      src: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-02-tertiary-product-shot-01.jpg',
      alt: 'Model wearing plain black basic tee.',
      href: '#',
    },
    {
      src: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-02-tertiary-product-shot-02.jpg',
      alt: 'Model wearing plain gray basic tee.',
      href: '#',
    },
    {
      src: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-02-featured-product-shot.jpg',
      alt: 'Model wearing plain white basic tee.',
      href: '#',
    },
  ],
};

export default function Gallery() {
  return (
    <div>
        <div className="lg:grid lg:grid-cols-3 lg:gap-2 ">


            <div className="row-span-2 aspect-3/4 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75">
            <a href={product.images[0].href}>
                <img
                    alt={product.images[0].alt}
                    src={product.images[0].src}
                    className="row-span-2 aspect-3/4 size-full rounded-lg object-cover max-lg:hidden"
                />
            </a>

            </div>

            <div className="col-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75">
            <a href={product.images[1].href}>
                <img
                    alt={product.images[1].alt}
                    src={product.images[1].src}
                    className="col-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75"
                />
            </a>
            </div>

            <div className="col-start-2 row-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75">
            <a href={product.images[2].href}>
                <img
                    alt={product.images[2].alt}
                    src={product.images[2].src}
                    className="col-start-2 row-start-2 aspect-3/2 size-full rounded-lg object-cover max-lg:hidden hover:opacity-75"
                />
            </a>
            </div>

            <div className="row-span-2 aspect-4/5 size-full object-cover sm:rounded-lg lg:aspect-3/4 hover:opacity-75">
            <a href={product.images[3].href}>
                <img
                    alt={product.images[3].alt}
                    src={product.images[3].src}
                    className="row-span-2 aspect-4/5 size-full object-cover sm:rounded-lg lg:aspect-3/4 hover:opacity-75"
                />
            </a>
            </div>

        </div>
    </div>
  );
}
