import { streamText } from 'ai';

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return new Response(
      'Missing required env var: AI_GATEWAY_API_KEY. Check your .env file.',
      { status: 500 },
    );
  }

  const { messages, detailMode } = (await req.json()) as {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    detailMode?: boolean;
  };

  const normalizedDetailMode = Boolean(detailMode);
  const detailPrompt =
    'You are in detail mode. Provide thorough, well-structured responses with useful context and clear next steps.';
  const modelMessages = normalizedDetailMode
    ? [{ role: 'system' as const, content: detailPrompt }, ...messages]
    : messages;

  const result = await streamText({
    model: 'google/gemini-2.5-flash-lite',
    messages: modelMessages,
    maxOutputTokens: normalizedDetailMode ? 512 : 64,
  });

  return result.toTextStreamResponse();
}
