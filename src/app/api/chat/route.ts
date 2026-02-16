import { streamText } from 'ai';

export async function POST(req: Request) {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return new Response(
      'Missing required env var: AI_GATEWAY_API_KEY. Check your .env file.',
      { status: 500 },
    );
  }

  const { messages } = (await req.json()) as {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  };

  const result = await streamText({
    model: 'google/gemini-2.5-flash-lite',
    messages,
    maxOutputTokens: 256,
  });

  return result.toTextStreamResponse();
}
