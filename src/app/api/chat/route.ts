import { jsonSchema, stepCountIs, streamText, tool } from 'ai';

import { searchRagContent } from '../../../lib/rag';

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return new Response(
      'Missing required env var: AI_GATEWAY_API_KEY. Check your .env file.',
      { status: 500 },
    );
  }

  const { messages, detailMode, pageContext } = (await req.json()) as {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    detailMode?: boolean;
    pageContext?: {
      title?: string;
      url?: string;
      content?: string;
      summary?: string;
    } | null;
  };

  const systemMessages: Array<{ role: 'system'; content: string }> = [];

  const safePageContext = pageContext ?? {};

  systemMessages.push({
    role: 'system',
    content: `
      User is now at ${safePageContext.title ?? 'Not provided'} page.
      Here is the page summary: ${safePageContext.summary ?? 'Not provided'}        
      Use the page summary when it is relevant. If it is not relevant, answer normally.
      If the page summary is insufficient for the user request, call the getPageContent tool to retrieve the full content. Only call it when needed, and do not ask for permission.
      If the user asks for information that is not available on the page or requires external knowledge, call the getRagContent tool with a focused query based on the user request.
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
      getPageContent: tool({
        description:
          'Retrieve the full page content when the summary is insufficient to answer the user question.',
        inputSchema: jsonSchema<{}>({
          type: 'object',
          properties: {},
        }),
        execute: async () => ({
          title: pageContext?.title ?? null,
          url: pageContext?.url ?? null,
          content: pageContext?.content ?? '',
        }),
      }),
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
        execute: async ({ query, limit }) =>
          searchRagContent(query, limit),
      }),
    },
    stopWhen: stepCountIs(3),
  });

  return result.toTextStreamResponse();
}
