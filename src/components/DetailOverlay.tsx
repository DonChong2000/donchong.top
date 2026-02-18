import Image from "next/image";

interface Callout {
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  priority?: boolean;
}

interface DetailOverlayProps {
  callouts: Callout[];
}

export function DetailOverlay({ callouts }: DetailOverlayProps) {
  return (

      <div>

          <div className="space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0 mt-4">
            {callouts.map((callout) => (
              <div key={callout.name} className="group relative">
                <div className="relative h-80 w-full overflow-hidden rounded-lg  sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 group-hover:opacity-75 sm:h-64 GH not-prose">
                  <Image
                    src={callout.imageSrc}
                    alt={callout.imageAlt}
                    fill
                    priority={callout.priority}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <h3 className="mt-6 text-sm">
                  <a href={callout.href}>
                    <span className="absolute inset-0" />
                    {callout.name}
                  </a>
                </h3>
                <p className="text-base font-semibold">{callout.description}</p>
              </div>
            ))}
          </div>
        </div>
  );
}
