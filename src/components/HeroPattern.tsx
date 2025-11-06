import { GraphPattern } from '@/components/GraphPattern';

export function HeroPattern() {
  return (
    <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
      <div className="absolute top-0 left-1/2 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
        <div className="absolute inset-0 bg-linear-to-br from-[#91a1c4] to-[#1c1665] opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-[#]/30 dark:to-[#FFFFFF]/30 dark:opacity-100">
          <GraphPattern
            width={72}
            height={56}
            x={-12}
            y={4}
            className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-5deg] fill-black/5 stroke-black/5 mix-blend-overlay dark:fill-white/2.5 dark:stroke-white/15"
          />
        </div>
        <svg
          viewBox="0 0 1113 440"
          aria-hidden="true"
          className="absolute top-0 left-1/2 ml-[-19rem] w-[69.5625rem] fill-white blur-[26px] dark:hidden"
        >
          <path d="M.016 439.5s-9.5-300 434-300S882.516 20 882.516 20V0h230.004v439.5H.016Z" />
        </svg>
      </div>
    </div>
  );
}
