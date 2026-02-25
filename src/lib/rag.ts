import pg from 'pg';
import { createGateway, embed } from 'ai';

type RagChunk = {
  content: string;
  source: string | null;
  title: string | null;
  similarity: number;
};

const { Client } = pg;

function getRequiredEnv(name: string, hint?: string) {
  const value = process.env[name];
  if (!value) {
    const suffix = hint ? ` ${hint}` : '';
    throw new Error(`Missing ${name}.${suffix}`.trim());
  }
  return value;
}

function normalizeVector(values: number[]) {
  return `[${values.join(',')}]`;
}

async function embedText(query: string) {
  const apiKey = getRequiredEnv(
    'AI_GATEWAY_API_KEY',
    'Add it to your .env file.',
  );
  const model = process.env.EMBEDDING_MODEL ?? 'google/gemini-embedding-001';
  const gateway = createGateway({ apiKey });
  const { embedding } = await embed({
    model: gateway.embeddingModel(model),
    value: query,
  });

  if (!embedding || embedding.length === 0) {
    throw new Error('Embedding API returned empty vector');
  }

  return embedding;
}

export async function searchRagContent(
  query: string,
  limit = 5,
): Promise<RagChunk[]> {
  const databaseUrl = getRequiredEnv(
    'DATABASE_URL',
    'Add it to your .env file.',
  );

  const embedding = await embedText(query);
  const vectorLiteral = normalizeVector(embedding);
  const db = new Client({ connectionString: databaseUrl });

  await db.connect();
  try {
    const result = await db.query(
      `SELECT
         content,
         metadata->>'source' AS source,
         metadata->>'basename' AS basename,
         metadata->>'title' AS title,
         1 - (embedding <=> $1::vector) AS similarity
       FROM document_chunks
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorLiteral, limit],
    );

    return (result.rows as Array<{
      content?: string;
      source?: string;
      basename?: string;
      title?: string;
      similarity?: number;
    }>).map((row) => ({
      content: row.content ?? '',
      source: row.source ?? row.basename ?? null,
      title: row.title ?? null,
      similarity: Number(row.similarity ?? 0),
    }));
  } finally {
    await db.end();
  }
}
