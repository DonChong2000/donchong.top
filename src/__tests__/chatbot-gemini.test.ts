/** @jest-environment node */
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';

const shouldSkipGeminiTest =
  process.env.SKIP_GEMINI_TESTS === 'true' || !process.env.GEMINI_API_KEY;

jest.setTimeout(10000);

describe('chatbot connection using AI-SDK (Gemini)', () => {
  const testCase = shouldSkipGeminiTest ? it.skip : it;

  testCase('returns text from the model via GEMINI_API_KEY', async () => {
    const googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const { text } = await generateText({
      model: googleAI('gemini-flash-latest'),
      prompt: 'Hello, How is your day?',
      maxOutputTokens: 10,
    });
    expect(text).toBeTruthy();
  });
});
