'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ModelContextTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: any) => Promise<unknown> | unknown;
};

type ModelContext = {
  registerTool: (
    tool: ModelContextTool,
    options?: { signal?: AbortSignal },
  ) => void;
  provideContext?: (context: { tools: ModelContextTool[] }) => void;
};

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

export function WebMcp() {
  const router = useRouter();

  useEffect(() => {
    const mc = navigator.modelContext;
    if (!mc || typeof mc.registerTool !== 'function') {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const tools: ModelContextTool[] = [
      {
        name: 'search_site',
        title: 'Search donchong.top',
        description:
          'Full-text search across donchong.top notes, projects, hobbies and recipes. Returns a list of matching pages with their url, section title and parent page title.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string.',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 25,
              description: 'Maximum number of results (default 10).',
            },
          },
          required: ['query'],
        },
        annotations: { readOnlyHint: true },
        execute: async (input: { query?: string; limit?: number }) => {
          const query = String(input?.query ?? '').trim();
          if (!query) return [];
          const limit = Math.min(Math.max(input?.limit ?? 10, 1), 25);
          const { search } = await import('@/mdx/search.mjs');
          const results = (search as (q: string) => Array<{
            url: string;
            title: string;
            pageTitle?: string;
          }>)(query);
          return results.slice(0, limit);
        },
      },
      {
        name: 'navigate',
        title: 'Navigate to a page',
        description:
          'Navigate the user to a path on donchong.top (e.g. "/me", "/projects/this-site"). Use search_site first to discover valid paths.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description:
                'Site-relative path beginning with "/", or a full https://donchong.top URL.',
            },
          },
          required: ['path'],
        },
        execute: async (input: { path?: string }) => {
          const raw = String(input?.path ?? '').trim();
          if (!raw) return { ok: false, error: 'path is required' };
          let target = raw;
          try {
            const u = new URL(raw, window.location.origin);
            if (u.origin !== window.location.origin) {
              return { ok: false, error: 'cross-origin navigation refused' };
            }
            target = u.pathname + u.search + u.hash;
          } catch {
            return { ok: false, error: 'invalid path' };
          }
          router.push(target);
          return { ok: true, navigatedTo: target };
        },
      },
      {
        name: 'fetch_page_markdown',
        title: 'Fetch page as markdown',
        description:
          'Return the markdown source of any page on donchong.top. Useful for grounding answers in the page content.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description:
                'Site-relative path. Defaults to the current page.',
            },
          },
        },
        annotations: { readOnlyHint: true },
        execute: async (input: { path?: string }) => {
          const path = (input?.path ?? window.location.pathname) || '/';
          const res = await fetch(
            `/api/markdown?path=${encodeURIComponent(path)}`,
            { headers: { Accept: 'text/markdown' } },
          );
          if (!res.ok) {
            return { ok: false, status: res.status };
          }
          const markdown = await res.text();
          return {
            ok: true,
            path,
            tokens: Number(res.headers.get('x-markdown-tokens') ?? 0),
            markdown,
          };
        },
      },
    ];

    for (const tool of tools) {
      try {
        mc.registerTool(tool, { signal });
      } catch {
        // ignore — keep other tools registered
      }
    }

    return () => controller.abort();
  }, [router]);

  return null;
}
