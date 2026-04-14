import Image from 'next/image';

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
      <div className="mt-4 space-y-12 lg:grid lg:grid-cols-3 lg:space-y-0 lg:gap-x-6">
        {callouts.map((callout) => (
          <div key={callout.name} className="group relative">
            <div className="GH not-prose relative aspect-2/1 w-full overflow-hidden rounded-lg group-hover:opacity-75 lg:aspect-square">
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
