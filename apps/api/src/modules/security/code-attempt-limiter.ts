import { HttpException, Injectable, ServiceUnavailableException, type OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

const consumeScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('PEXPIRE', KEYS[1], 60000) end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

@Injectable()
export class CodeAttemptLimiter implements OnModuleDestroy {
  private redis?: Redis;
  private connecting?: Promise<void>;

  private async connection(): Promise<Redis> {
    const url = process.env.REDIS_URL;
    if (!url || (!url.startsWith('rediss://') &&
      !(process.env.NODE_ENV === 'test' && /^redis:\/\/(localhost|127\.0\.0\.1):/.test(url))))
      throw new Error('Code attempt limiter requires Redis TLS.');
    if (!this.redis) {
      this.redis = new Redis(url, {
        lazyConnect: true, enableOfflineQueue: false, maxRetriesPerRequest: 0,
        connectTimeout: 2000, commandTimeout: 2000, retryStrategy: () => null,
      });
      // Redis emits connection errors; never log connection strings or credentials.
      this.redis.on('error', () => {});
    }
    const client = this.redis;
    if (client.status !== 'ready') {
      this.connecting ??= client.connect().finally(() => { this.connecting = undefined; });
      await this.connecting;
    }
    return client;
  }

  async consume(scope: string, limit: number): Promise<void> {
    let count: number;
    let ttl: number;
    try {
      const client = await this.connection();
      const prefix = process.env.BULLMQ_PREFIX ?? `numora:${process.env.NODE_ENV ?? 'production'}`;
      const result = await client.eval(consumeScript, 1, `${prefix}:code-attempts:${scope}`);
      if (!Array.isArray(result) || result.length !== 2) throw new Error('Invalid limiter response.');
      count = Number(result[0]);
      ttl = Number(result[1]);
      if (!Number.isInteger(count) || count < 1 || !Number.isFinite(ttl) || ttl < 0)
        throw new Error('Invalid limiter counter.');
    } catch {
      this.redis?.disconnect();
      this.redis = undefined;
      throw new ServiceUnavailableException({
        code: 'CODE_LIMITER_UNAVAILABLE', detail: 'Verifikasi kode sementara tidak tersedia. Coba lagi nanti.',
      });
    }
    if (count > limit)
      throw new HttpException({
        code: 'CODE_ATTEMPT_LIMIT', detail: 'Terlalu banyak percobaan kode. Coba lagi setelah jeda.',
        retryAfter: Math.max(1, Math.ceil(ttl / 1000)),
      }, 429);
  }

  onModuleDestroy() { this.redis?.disconnect(); }
}
