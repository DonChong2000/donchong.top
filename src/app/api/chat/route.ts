import { jsonSchema, stepCountIs, streamText, tool } from 'ai';

import { searchRagContent } from '@/lib/rag';

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return new Response(
      'Missing required env var: AI_GATEWAY_API_KEY. Check your .env file.',
      { status: 500 },
    );
  }

  const { messages, detailMode, pageMeta } = (await req.json()) as {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    detailMode?: boolean;
    pageMeta?: {
      title?: string;
      url?: string;
    } | null;
  };

  const systemMessages: Array<{ role: 'system'; content: string }> = [];

  const safePageMeta = pageMeta ?? {};

  systemMessages.push({
    role: 'system',
    content: `
      User is now at ${safePageMeta.title ?? 'Not provided'} page.
      Page URL: ${safePageMeta.url ?? 'Not provided'}
      If the user asks for information that is not available or requires external knowledge, call the getRagContent tool with a focused query based on the user request without asking.
      If the answer cannot be determined from the retrieved context, respond with a brief statement indicating uncertainty (e.g., “I don’t have enough information” or “Sorry, I don't know”). Do not add any new information.
      `,
  });

  const wordLimit = Boolean(detailMode) ? 512 : 64;

  systemMessages.push({
    role: 'system',
    content: `Answer in fewer than ${wordLimit} words`,
  });

  const modelMessages = systemMessages.length
    ? [...systemMessages, ...messages]
    : messages;

  const result = await streamText({
    model: 'google/gemini-3-flash',
    messages: modelMessages,
    maxOutputTokens: 10000,
    tools: {
      getRagContent: tool({
        description:
          'Retrieve relevant knowledge-base content for the user request using semantic search.',
        inputSchema: jsonSchema<{ query: string; limit?: number }>({
          type: 'object',
          properties: {
            query: { type: 'string' },
            limit: { type: 'number' },
          },
          required: ['query'],
        }),
        execute: async ({ query, limit }) => searchRagContent(query, limit),
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toTextStreamResponse();
}
