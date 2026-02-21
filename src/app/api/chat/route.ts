import { createResource } from '@/lib/actions/resources';
import {
  streamText,
  tool,
  stepCountIs,
} from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
};

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const messagesRaw = (body as { messages?: unknown } | null)?.messages;
  const messages = Array.isArray(messagesRaw)
    ? (messagesRaw as ChatMessage[])
    : null;
  if (!messages || messages.some((message) => typeof message.content !== 'string')) {
    return new Response('Invalid messages payload', { status: 400 });
  }
  const modelMessages = messages
    .filter(
      (
        message,
      ): message is Omit<ChatMessage, 'role'> & {
        role: 'user' | 'assistant' | 'system';
      } => message.role !== 'tool',
    )
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));

  const result = streamText({
    model: 'openai/gpt-4o',
    messages: modelMessages,
    stopWhen: stepCountIs(5),
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        inputSchema: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        inputSchema: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toTextStreamResponse();
}
