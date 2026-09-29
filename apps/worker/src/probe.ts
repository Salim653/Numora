import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const prefix = process.env.BULLMQ_PREFIX;
if (!redisUrl) throw new Error('REDIS_URL is required.');
if (!redisUrl.startsWith('rediss://')) throw new Error('REDIS_URL must use TLS (rediss://).');
if (!prefix?.startsWith('numora:dev:') || prefix.includes('<')) {
  throw new Error('The probe requires a developer-specific BULLMQ_PREFIX.');
}

async function run(redisUrl: string, prefix: string) {
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: 1 });
  const queue = new Queue('bootstrap', { connection, prefix });
  try {
    const job = await queue.add('manual-probe', {}, { removeOnComplete: 10, removeOnFail: 10 });
    console.log(`Queued manual probe ${job.id ?? 'unknown'} under ${prefix}.`);
  } finally {
    await queue.close();
    await connection.quit();
  }
}

void run(redisUrl, prefix);
