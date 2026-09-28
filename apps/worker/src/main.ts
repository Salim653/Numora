import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const queueName = 'bootstrap';

const worker = new Worker(
  queueName,
  async (job) => ({
    processedAt: new Date().toISOString(),
    jobName: job.name,
  }),
  { connection },
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

  const queue = new Queue(queueName, { connection });
  await queue.add(
    'startup-probe',
    { source: 'tka-worker' },
    {
      jobId: `startup-${Date.now()}`,
      removeOnComplete: 10,
      removeOnFail: 10,
    },
  );
  await queue.close();
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
