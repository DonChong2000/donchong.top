/** @jest-environment node */
import { generateText } from 'ai';
import 'dotenv/config';
import { POST } from '@/app/api/chat/route';

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

describe('POST /api/chat', () => {
  const originalApiKey = process.env.AI_GATEWAY_API_KEY;
  afterEach(() => {
    process.env.AI_GATEWAY_API_KEY = originalApiKey;
  });

  it('returns a text stream response for valid requests', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(request);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBeTruthy();
  });

  it('returns 500 when AI_GATEWAY_API_KEY is missing', async () => {
    delete process.env.AI_GATEWAY_API_KEY;

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(request);
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toBe(
      'Missing required env var: AI_GATEWAY_API_KEY. Check your .env file.',
    );
  });
});
