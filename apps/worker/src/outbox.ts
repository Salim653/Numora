import { analyticsEvents, analyticsOutbox, getDatabase } from '@tka/database';
import { and, asc, eq, isNull, lte, or } from 'drizzle-orm';

const RETRY_DELAY_MS = 5 * 60 * 1000;

export async function drainOutboxBatch(limit = 100) {
  const { db } = getDatabase();
  let processed = 0;
  let failed = 0;
  for (let index = 0; index < limit; index++) {
    let selectedId: string | undefined;
    try {
      const found = await db.transaction(async (tx) => {
        const [event] = await tx
          .select()
          .from(analyticsOutbox)
          .where(and(
            isNull(analyticsOutbox.processedAt),
            or(
              isNull(analyticsOutbox.failedAt),
              lte(analyticsOutbox.failedAt, new Date(Date.now() - RETRY_DELAY_MS)),
            ),
          ))
          .orderBy(asc(analyticsOutbox.occurredAt), asc(analyticsOutbox.id))
          .limit(1)
          .for('update', { skipLocked: true });
        if (!event) return false;
        selectedId = event.id;
        await tx.insert(analyticsEvents).values({
          eventId: event.id,
          eventName: event.eventName,
          eventVersion: event.eventVersion,
          actorUserId: event.actorUserId,
          occurredAt: event.occurredAt,
          entityType: event.entityType,
          entityId: event.entityId,
          payload: event.payload,
        }).onConflictDoNothing({ target: analyticsEvents.eventId });
        await tx.update(analyticsOutbox)
          .set({ processedAt: new Date(), failedAt: null })
          .where(eq(analyticsOutbox.id, event.id));
        return true;
      });
      if (!found) break;
      processed++;
    } catch (error) {
      failed++;
      if (selectedId)
        await db.update(analyticsOutbox)
          .set({ failedAt: new Date() })
          .where(and(eq(analyticsOutbox.id, selectedId), isNull(analyticsOutbox.processedAt)));
      console.error('[outbox] delivery failed', {
        eventId: selectedId ?? null,
        reason: error instanceof Error ? error.name : 'UnknownError',
      });
    }
  }
  return { processed, failed };
}
