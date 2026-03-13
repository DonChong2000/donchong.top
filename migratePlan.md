# Image Pipeline Migration Plan

## Problem

Images lived inside the webpack build graph (`src/app/**/images/`), loaded at runtime through `require.context`. This meant every image was processed by webpack on every build, MDX pages needed three lines of boilerplate (`import Image`, `import getImageMap`, `export const img = …`), and the build had no intrinsic knowledge of image dimensions or blur data — it relied on Next.js static-import magic that only worked for directly imported assets.

## Principles

### 1. Move images out of the build graph

Images are static assets. They belong in `public/`, where Next.js serves them directly without webpack processing. The directory structure mirrors app routes (`public/images/<route>/`) so image paths are predictable from any MDX page.

### 2. Eliminate per-page boilerplate

With images in `public/`, MDX files no longer need `import Image`, `import getImageMap`, or `export const img = …`. The `Image` component is registered globally via `mdx.tsx`, and Obsidian-style wiki links (`![[filename.jpg]]`) are the only syntax needed — the remark plugin resolves each reference to the correct `/images/<route>/` URL automatically.

### 3. Compute image metadata at compile time, not as a separate step

Width, height, and blur placeholders are derived on-the-fly during MDX compilation using `image-size` and `sharp`, cached in an in-memory Map for the duration of each dev/build session. This replaces the previous two-phase approach (a `prebuild` script generating a JSON manifest, then the build reading it). Dev and production builds now follow the same code path — no separate generation step, no JSON file to keep in sync.

### 4. Inject all image data through the AST

The remark plugin is the single source of truth for image metadata. It injects `width`, `height`, `placeholder`, and `blurDataURL` as props directly into each `<Image>` node in the MDX AST. Downstream components become pure pass-throughs — they receive everything they need as props and do not look up data from external manifests.

### 5. Remove the `require.context` image map

The old `imgMap.js` used `require.context` to dynamically collect images at build time and exposed them via `img['filename.jpg']`. This is replaced entirely by static URL paths (`/images/route/filename.jpg`) and the wiki-link remark plugin. The `require.context` pattern, along with `@types/webpack-env`, is no longer needed.

## What changed

| Area | Before | After |
|------|--------|-------|
| Image location | `src/app/**/images/` | `public/images/<route>/` |
| Image loading | `require.context` via `imgMap.js` | Static serving from `public/` |
| MDX boilerplate | 3-line import preamble per page | None |
| Image syntax | `img['name.jpg']` or `<Image src={img[…]} />` | `![[name.jpg]]` (wiki links) |
| Dimension data | `prebuild` → JSON manifest → read at init | Computed on-the-fly during MDX compilation |
| Blur placeholders | JSON manifest lookup in React components | Injected as AST props by remark plugin |
| Dev workflow | Change image → run `prebuild` → restart | Change image → restart dev server |

## Dead code after migration

- `src/lib/imgMap.js` — deleted (replaced by static URLs + remark plugin)
- `src/lib/image-dimensions.json` — no longer imported by any code
- `scripts/generate-manifest.mjs` — no longer called by any npm script
- `scripts/migrate-images.mjs` — one-time migration script, can be archived
