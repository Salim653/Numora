import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { checkDatabaseConnection, closeDatabaseConnection } from '@tka/database';
import { drainOutboxBatch } from './outbox.js';
import { projectClassLeaderboard } from './class-leaderboard.js';

const redisUrl = process.env.REDIS_URL;
const prefix = process.env.BULLMQ_PREFIX;
if (!redisUrl) throw new Error('REDIS_URL is required.');
if (!redisUrl.startsWith('rediss://')) throw new Error('REDIS_URL must use TLS (rediss://).');
if (!prefix || prefix.includes('<'))
  throw new Error('BULLMQ_PREFIX must identify this environment.');
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
let outboxTimer: ReturnType<typeof setInterval> | undefined;
let outboxBusy = false;
let leaderboardTimer: ReturnType<typeof setTimeout> | undefined;
let leaderboardBusy = false;
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
  await checkDatabaseConnection();
  console.log('[worker] Redis connected');
  const poll = async () => {
    if (outboxBusy) return;
    outboxBusy = true;
    try {
      const result = await drainOutboxBatch();
      if (result.processed || result.failed) console.log('[outbox] batch', result);
    } catch (error) {
      console.error('[outbox] polling failed', {
        reason: error instanceof Error ? error.name : 'UnknownError',
      });
    } finally {
      outboxBusy = false;
    }
  };
  await poll();
  outboxTimer = setInterval(() => void poll(), 5_000);
  const project = async () => {
    leaderboardBusy = true;
    try {
      const result = await projectClassLeaderboard();
      console.log('[leaderboard] class projection', result);
    } catch (error) {
      console.error('[leaderboard] projection failed', {
        reason: error instanceof Error ? error.name : 'UnknownError',
      });
    } finally {
      leaderboardBusy = false;
    }
  };
  const scheduleNextHour = () => {
    const delay = 3_600_000 - (Date.now() % 3_600_000);
    leaderboardTimer = setTimeout(async () => {
      await project();
      scheduleNextHour();
    }, delay);
  };
  await project();
  scheduleNextHour();
}

async function shutdown(signal: string) {
  console.log(`[worker] received ${signal}; shutting down`);
  if (outboxTimer) clearInterval(outboxTimer);
  if (leaderboardTimer) clearTimeout(leaderboardTimer);
  while (outboxBusy || leaderboardBusy) await new Promise((resolve) => setTimeout(resolve, 50));
  await worker.close();
  await connection.quit();
  await closeDatabaseConnection();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void bootstrap();
