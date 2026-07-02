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

**donchong.top** is a personal portfolio/blog built with Next.js 15 App Router, TypeScript, and Tailwind CSS 4. All content pages are `.mdx` files. Besides the human-facing site it exposes several agent-facing endpoints (MCP, markdown negotiation — see below).

### Content System

All pages (projects, notes, hobbies) are `.mdx` files under `src/app/`. The root layout (`src/app/layout.tsx`) uses `glob('**/*.mdx')` at build time to auto-discover sections and build navigation — adding a new MDX file automatically adds it to the nav.

Custom MDX plugins in `src/mdx/` (6 files):
- `remark-wiki-link-images.mjs` — Obsidian-style `![[image]]` syntax → Next.js `<Image>` with blur placeholders. Images must be placed in `public/images/{page-path}/` where `{page-path}` mirrors the MDX file's location under `src/app/` (e.g. `src/app/notes/aws-saa-c03/page.mdx` → `public/images/notes/aws-saa-c03/`)
- `remark-tags.mjs` — Tag function support in MDX frontmatter
- `remark.mjs` — aggregates the remark plugin array used by next.config
- `rehype.mjs` — Shiki syntax highlighting for code blocks
- `recma.mjs` — mdx-annotations recma plugin
- `search.mjs` — Builds the Flexsearch index for full-text search

### AI Chatbot (`src/app/api/chat/route.ts`)

Streaming chat API using the Vercel AI SDK **through AI Gateway** (not a direct `@ai-sdk/google` connection): `streamText` gets the bare model string `google/gemini-3-flash`, which the SDK resolves via Gateway; `AI_GATEWAY_API_KEY` is checked at the top of the route. (`createGateway` is called explicitly only in `src/lib/rag.ts` for embeddings.) Features:
- Per-IP token bucket rate limiting (`src/lib/rateLimiter.ts`) — configured via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` env vars
- RAG tool (`getRagContent`) that queries PostgreSQL with pgvector for semantic similarity search (`src/lib/rag.ts`); embedding model from `EMBEDDING_MODEL` env var (default `google/gemini-embedding-001`)
- Context-aware system prompts based on the current page; word limit of 64 (normal) or 512 (detail mode)

### Agent-facing endpoints

- `src/app/mcp/route.ts` — MCP server (streamable HTTP, JSON-RPC 2.0) at `/mcp` with two tools: `search_site` and `fetch_page_markdown`.
- `src/app/api/markdown/route.ts` — `/api/markdown?path=/some/page` returns that page's MDX as `text/markdown` (imports/exports stripped, `x-markdown-tokens` header). Path resolution goes through `resolveMdxPath` in `src/lib/mdxSource.ts`, which has path-traversal protection — keep it that way.
- `src/middleware.ts` — content negotiation: any page requested with `Accept: text/markdown` is rewritten to `/api/markdown`.
- `src/app/api/well-known/mcp/server-card/route.ts` — MCP server card (`/.well-known/mcp/server-card.json`).
- `src/app/api/well-known/api-catalog/route.ts` — RFC 9264 linkset API catalog listing `/api/chat` and `/api/markdown`.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Environment Variables

Do not read `.env` (it holds real keys); the variables the code reads are:

```
AI_GATEWAY_API_KEY=      # required — chat + RAG embeddings go through AI Gateway
DATABASE_URL=            # PostgreSQL + pgvector for RAG
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=60000
EMBEDDING_MODEL=         # optional, defaults to google/gemini-embedding-001
SKIP_GEMINI_TESTS=       # test-only escape hatch (src/__tests__/chatbot-gemini.test.ts)
```

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`, `ubuntu-24.04-arm` runner): lint → build → Docker build (CI validation only) → SSH to the production server, which rebuilds via `docker compose up -d --build`. Multi-stage Docker build (Node 20 Alpine) with standalone Next.js output. **Pushing to `main` deploys to production — don't push unless asked.**
