import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  analyticsEvents,
  analyticsOutbox,
  closeDatabaseConnection,
  getDatabase,
} from '@tka/database';
import { drainOutboxBatch } from './outbox.js';

const testUrl = process.env.TEST_DATABASE_URL;
const integration = testUrl ? describe : describe.skip;

integration('durable analytics outbox', () => {
  afterAll(async () => closeDatabaseConnection());

  it('records an event once and safely retries duplicate delivery', async () => {
    process.env.DATABASE_URL = testUrl;
    const { db } = getDatabase();
    const [event] = await db.insert(analyticsOutbox).values({
      eventName: 'drill_completed',
      entityType: 'assessmentAttempt',
      entityId: randomUUID(),
      payload: { score: 80 },
      occurredAt: new Date('2020-01-01T00:00:00.000Z'),
    }).returning({ id: analyticsOutbox.id });
    expect(await drainOutboxBatch(1)).toEqual({ processed: 1, failed: 0 });
    expect(await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.eventId, event!.id))).toHaveLength(1);
    const [processed] = await db.select().from(analyticsOutbox)
      .where(eq(analyticsOutbox.id, event!.id));
    expect(processed?.processedAt).toBeInstanceOf(Date);
    await db.update(analyticsOutbox)
      .set({ processedAt: null })
      .where(eq(analyticsOutbox.id, event!.id));
    expect(await drainOutboxBatch(1)).toEqual({ processed: 1, failed: 0 });
    expect(await db.select().from(analyticsEvents)
      .where(eq(analyticsEvents.eventId, event!.id))).toHaveLength(1);
  });
});
