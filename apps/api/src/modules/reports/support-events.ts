import { ConflictException } from '@nestjs/common';
import { analyticsOutbox, getDatabase } from '@tka/database';
import { eq } from 'drizzle-orm';

type Writer = Pick<ReturnType<typeof getDatabase>['db'], 'insert' | 'select'>;
// Payloads remain PROPOSED (DRL-OPEN-08); enable only after Data reviews the documented v1 mapping.
export async function recordSupportEvent(
  tx: Writer,
  event: {
    id: string;
    actorUserId: string;
    eventName: string;
    entityType: string;
    entityId: string;
    correlationId?: string | undefined;
    payload: Record<string, unknown>;
  },
) {
  if (process.env.SUPPORT_ANALYTICS_ENABLED !== 'true') return;
  const [inserted] = await tx
    .insert(analyticsOutbox)
    .values({ ...event, eventVersion: '1' })
    .onConflictDoNothing({ target: analyticsOutbox.id })
    .returning({ id: analyticsOutbox.id });
  if (!inserted) {
    const [existing] = await tx
      .select()
      .from(analyticsOutbox)
      .where(eq(analyticsOutbox.id, event.id));
    // JSONB normalizes object key order. Compare canonical primitive fields without trusting a client actor.
    const keys = Object.keys(event.payload).sort();
    if (
      !existing ||
      existing.actorUserId !== event.actorUserId ||
      existing.eventName !== event.eventName ||
      existing.entityType !== event.entityType ||
      existing.entityId !== event.entityId ||
      (existing.correlationId ?? null) !== (event.correlationId ?? null) ||
      Object.keys(existing.payload as object).length !== keys.length ||
      keys.some(
        (key) =>
          JSON.stringify((existing.payload as Record<string, unknown>)[key]) !==
          JSON.stringify(event.payload[key]),
      )
    )
      throw new ConflictException({
        code: 'INTERACTION_REQUEST_CONFLICT',
        detail: 'ID interaksi sudah digunakan.',
      });
  }
}
