import { Worker } from 'bullmq';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;
const prefix = process.env.BULLMQ_PREFIX;
if (!redisUrl) throw new Error('REDIS_URL is required.');
if (!redisUrl.startsWith('rediss://')) throw new Error('REDIS_URL must use TLS (rediss://).');
if (!prefix || prefix.includes('<'))
  throw new Error('BULLMQ_PREFIX must identify this environment.');
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const queueName = 'bootstrap';

const worker = new Worker(
  queueName,
  async (job) => ({
    processedAt: new Date().toISOString(),
    jobName: job.name,
  }),
  { connection, prefix },
);

worker.on('completed', (job) => {
  console.log(`[worker] completed ${job.id ?? 'unknown'} (${job.name})`);
});

worker.on('failed', (job, error) => {
  console.error(`[worker] failed ${job?.id ?? 'unknown'}: ${error.message}`);
});

async function bootstrap() {
  await connection.ping();
  console.log('[worker] Redis connected');
}

async function shutdown(signal: string) {
  console.log(`[worker] received ${signal}; shutting down`);
  await worker.close();
  await connection.quit();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void bootstrap();
