// Config — read once at module load
export const MAX_TOKENS = parseInt(process.env.RATE_LIMIT_MAX ?? '5', 10);
export const WINDOW_MS  = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

if (!Number.isFinite(MAX_TOKENS) || MAX_TOKENS <= 0)
  throw new Error('RATE_LIMIT_MAX must be a positive integer');
if (!Number.isFinite(WINDOW_MS)  || WINDOW_MS  <= 0)
  throw new Error('RATE_LIMIT_WINDOW_MS must be a positive integer');

// Precomputed constant — avoids recomputing on every request
const REFILL_RATE = MAX_TOKENS / WINDOW_MS; // tokens per ms

type TokenBucket = { tokens: number; lastRefillTime: number };
export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number };

const buckets = new Map<string, TokenBucket>();
let lastCleanupTime = Date.now();

// Test helper — reset all module state between tests
export function _resetForTests(): void {
  buckets.clear();
  lastCleanupTime = Date.now();
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefillTime: now };
    buckets.set(ip, bucket);
  }

  // Continuous refill
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + (now - bucket.lastRefillTime) * REFILL_RATE);
  bucket.lastRefillTime = now;

  // Time-based stale-entry cleanup (every 2 windows)
  if (now - lastCleanupTime > 2 * WINDOW_MS) {
    const staleThreshold = now - 2 * WINDOW_MS;
    for (const [key, b] of buckets) {
      if (b.lastRefillTime < staleThreshold) buckets.delete(key);
    }
    lastCleanupTime = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }

  return { allowed: false, retryAfterMs: Math.ceil((1 - bucket.tokens) / REFILL_RATE) };
}
