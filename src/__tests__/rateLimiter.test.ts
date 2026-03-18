/** @jest-environment node */

describe('rateLimiter', () => {
  let checkRateLimit: (ip: string) => ReturnType<typeof import('@/lib/rateLimiter').checkRateLimit>;
  let _resetForTests: () => void;
  let MAX_TOKENS: number;
  let WINDOW_MS: number;

  beforeEach(() => {
    jest.resetModules();
    const mod = require('@/lib/rateLimiter');
    checkRateLimit = mod.checkRateLimit;
    _resetForTests = mod._resetForTests;
    MAX_TOKENS = mod.MAX_TOKENS;
    WINDOW_MS = mod.WINDOW_MS;
    _resetForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults: MAX_TOKENS=5, WINDOW_MS=60000', () => {
    expect(MAX_TOKENS).toBe(5);
    expect(WINDOW_MS).toBe(60000);
  });

  it('first request is allowed', () => {
    const result = checkRateLimit('1.2.3.4');
    expect(result.allowed).toBe(true);
  });

  it('first MAX_TOKENS requests are all allowed', () => {
    for (let i = 0; i < MAX_TOKENS; i++) {
      expect(checkRateLimit('1.2.3.4').allowed).toBe(true);
    }
  });

  it('request MAX_TOKENS+1 is denied', () => {
    for (let i = 0; i < MAX_TOKENS; i++) {
      checkRateLimit('1.2.3.4');
    }
    const result = checkRateLimit('1.2.3.4');
    expect(result.allowed).toBe(false);
  });

  it('retryAfterMs is positive when denied', () => {
    for (let i = 0; i < MAX_TOKENS; i++) {
      checkRateLimit('1.2.3.4');
    }
    const result = checkRateLimit('1.2.3.4');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      // Should be approximately one token refill time
      const expectedMs = WINDOW_MS / MAX_TOKENS;
      expect(result.retryAfterMs).toBeLessThanOrEqual(expectedMs + 1); // +1 for Math.ceil
    }
  });

  it('exhausted bucket refills after WINDOW_MS', () => {
    jest.useFakeTimers();
    const now = Date.now();
    jest.setSystemTime(now);

    for (let i = 0; i < MAX_TOKENS; i++) {
      checkRateLimit('1.2.3.4');
    }
    expect(checkRateLimit('1.2.3.4').allowed).toBe(false);

    // Advance time by a full window
    jest.setSystemTime(now + WINDOW_MS);

    expect(checkRateLimit('1.2.3.4').allowed).toBe(true);
  });

  it('separate IPs have independent buckets', () => {
    for (let i = 0; i < MAX_TOKENS; i++) {
      checkRateLimit('1.1.1.1');
    }
    expect(checkRateLimit('1.1.1.1').allowed).toBe(false);
    expect(checkRateLimit('2.2.2.2').allowed).toBe(true);
  });

  it('tokens decrement correctly across requests', () => {
    // Exhaust all tokens
    for (let i = 0; i < MAX_TOKENS; i++) {
      const result = checkRateLimit('1.2.3.4');
      expect(result.allowed).toBe(true);
    }
    // Next should be denied
    const denied = checkRateLimit('1.2.3.4');
    expect(denied.allowed).toBe(false);
  });

  it('unknown IP fallback pools headerless requests', () => {
    for (let i = 0; i < MAX_TOKENS; i++) {
      checkRateLimit('unknown');
    }
    expect(checkRateLimit('unknown').allowed).toBe(false);
    // Different IP still has its own bucket
    expect(checkRateLimit('1.2.3.4').allowed).toBe(true);
  });
});
