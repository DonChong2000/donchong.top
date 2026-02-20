import { streamText } from 'ai';

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

  const normalizedDetailMode = Boolean(detailMode);
  const detailPrompt =
    'You are in detail mode. Provide thorough, well-structured responses with useful context and clear next steps.';
  const systemMessages: Array<{ role: 'system'; content: string }> = [];

  if (pageContext?.content || pageContext?.summary) {
    const contextLines = [
      pageContext.title ? `Title: ${pageContext.title}` : null,
      pageContext.url ? `URL: ${pageContext.url}` : null,
      pageContext.summary ? `Summary: ${pageContext.summary}` : null,
      pageContext.content ? `Content: ${pageContext.content}` : null,
    ].filter(Boolean);

    systemMessages.push({
      role: 'system',
      content:
        'Use the following page context to answer the user. If the question is unrelated, say you do not have relevant info from the page.' +
        `\n${contextLines.join('\n')}`,
    });
  }

  if (normalizedDetailMode) {
    systemMessages.push({ role: 'system', content: detailPrompt });
  }

  const modelMessages = systemMessages.length
    ? [...systemMessages, ...messages]
    : messages;

  const result = await streamText({
    model: 'google/gemini-2.5-flash-lite',
    messages: modelMessages,
    maxOutputTokens: normalizedDetailMode ? 512 : 64,
  });

  return result.toTextStreamResponse();
}
