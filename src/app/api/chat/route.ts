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
      If the user asks questions that are clearly unrelated to the task or topic, gently steer the conversation back to what you can help with. Keep the tone friendly, use light humor when appropriate, respond in at most 32 words.

      - At most you use tool-call 4 times.
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

  const result = streamText({
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
    stopWhen: stepCountIs(5),
    onFinish: ({ finishReason, steps }) => {
      console.info('chat stream completed', {
        finishReason,
        stepCount: steps?.length ?? 0,
        wordLimit,
      });
    },
  });

  let hasNonWhitespace = false;

  const stream = new ReadableStream<string>({
    async start(controller) {
      const reader = result.textStream.getReader();
      let didError = false;
      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            if (!hasNonWhitespace && /\S/.test(value)) {
              hasNonWhitespace = true;
            }
            controller.enqueue(value);
          }
        }

        const finishReason = await result.finishReason;
        const errors: string[] = [];

        if (!hasNonWhitespace) {
          errors.push('Empty model response');
        }

        if (finishReason !== 'stop') {
          errors.push('Model did not finish normally');
        }

        if (errors.length > 0) {
          controller.enqueue(
            `\n\n[Error] ${errors.join('. ')} (finishReason: ${finishReason})\n`,
          );
        }
      } catch (error) {
        didError = true;
        controller.error(error);
      } finally {
        reader.releaseLock();
        if (!didError) {
          controller.close();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
