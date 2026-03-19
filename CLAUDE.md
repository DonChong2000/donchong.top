# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Use `pnpm` (v10.28.0) as the package manager — not npm or yarn.

```bash
pnpm run dev      # Start dev server at localhost:3000
pnpm run build    # Production build
pnpm run lint     # ESLint
pnpm run test     # Jest tests
pnpm start        # Run production server on port 3000
```

To run a single test file:
```bash
pnpm run test -- src/__tests__/SomeComponent.test.tsx
```

## Architecture Overview

**donchong.top** is a personal portfolio/blog built with Next.js 15 App Router, TypeScript, and Tailwind CSS 4. All content pages are `.mdx` files.

### Content System

All pages (projects, notes, hobbies) are `.mdx` files under `src/app/`. The root layout (`src/app/layout.tsx`) uses `glob('**/*.mdx')` at build time to auto-discover sections and build navigation — adding a new MDX file automatically adds it to the nav.

Custom MDX plugins in `src/mdx/` handle:
- `remark-wiki-link-images.mjs` — Obsidian-style `![[image]]` syntax → Next.js `<Image>` with blur placeholders
- `remark-tags.mjs` — Tag function support in MDX frontmatter
- `rehype.mjs` — Shiki syntax highlighting for code blocks
- `search.mjs` — Builds the Flexsearch index for full-text search

### AI Chatbot (`src/app/api/chat/route.ts`)

Streaming chat API using Vercel AI SDK with Google Gemini 3 Flash. Features:
- Per-IP token bucket rate limiting (`src/lib/rateLimiter.ts`) — configured via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` env vars
- RAG tool (`getRagContent`) that queries PostgreSQL with pgvector for semantic similarity search (`src/lib/rag.ts`)
- Context-aware system prompts based on the current page; word limit of 64 (normal) or 512 (detail mode)

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Key Environment Variables

```
# AI
GOOGLE_GENERATIVE_AI_API_KEY=

# Database (PostgreSQL + pgvector for RAG)
DATABASE_URL=

# Rate limiting
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=60000
```

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) runs lint → build → Docker build → SSH deploy to Oracle Cloud. Docker uses a multi-stage build (Node 20 Alpine) with standalone Next.js output.
