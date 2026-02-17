/** @jest-environment node */
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'Missing required env var: GEMINI_API_KEY. Check your .env file.',
  );
}

jest.setTimeout(10000);

describe('chatbot connection using AI-SDK (Gemini)', () => {
  it('returns text from the model via GEMINI_API_KEY', async () => {
    const googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { text } = await generateText({
      model: googleAI('gemini-2.5-flash'),
      prompt: 'Hello, How is your day?',
      maxOutputTokens: 30,
    });
    expect(text).toBeTruthy();
  });
});
