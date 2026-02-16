/** @jest-environment node */
import { generateText } from 'ai';
import 'dotenv/config';

if (!process.env.AI_GATEWAY_API_KEY) {
  throw new Error(
    'Missing required env var: AI_GATEWAY_API_KEY. Check your .env file.',
  );
}

describe('chatbot connection using AI-SDK (Vercel)', () => {
  it('returns text from the model via vercelAPI', async () => {
    const { text } = await generateText({
      model: 'google/gemini-2.5-flash-lite',
      prompt: 'Hello, How is your day?',
      maxOutputTokens: 64,
    });

    expect(text).toBeTruthy();
  });
});
