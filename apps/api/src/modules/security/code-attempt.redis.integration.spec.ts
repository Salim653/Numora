import { randomUUID } from 'node:crypto';
import { Redis } from 'ioredis';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeAttemptLimiter } from './code-attempt-limiter';

afterEach(() => vi.unstubAllEnvs());
describe('code limiter outage', () => {
  it('does not accept code attempts when Redis is missing', async () => {
    vi.stubEnv('REDIS_URL', '');
    const limiter = new CodeAttemptLimiter();
    await expect(limiter.consume('fixture', 5)).rejects.toMatchObject({ status: 503 });
    limiter.onModuleDestroy();
  });
});
const integration = process.env.TEST_REDIS_URL ? describe : describe.skip;
integration('atomic code limits across API instances', () => {
  it('shares the quota and TTL, rejects excess concurrency, then resets after expiry', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('REDIS_URL', process.env.TEST_REDIS_URL!);
    const scope = `teacher:${randomUUID()}:${randomUUID()}`;
    const prefix = process.env.BULLMQ_PREFIX ?? 'numora:test';
    const key = `${prefix}:code-attempts:${scope}`;
    const first = new CodeAttemptLimiter();
    const second = new CodeAttemptLimiter();
    const client = new Redis(process.env.TEST_REDIS_URL!);
    try {
      const results = await Promise.allSettled(
        Array.from({ length: 20 }, (_, i) => (i % 2 ? first : second).consume(scope, 5)),
      );
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(5);
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(15);
      for (const result of results)
        if (result.status === 'rejected') expect(result.reason).toMatchObject({ status: 429 });
      const ttl = await client.pttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60_000);
      await client.pexpire(key, 10);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await expect(first.consume(scope, 5)).resolves.toBeUndefined();
    } finally {
      first.onModuleDestroy();
      second.onModuleDestroy();
      await client.del(key);
      await client.quit();
    }
  });
});
