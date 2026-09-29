import { Inject, Injectable } from '@nestjs/common';
import { auditLogs } from '@tka/database';
import { eq } from 'drizzle-orm';
import type { Db } from '../../database/database.module';
import { DATABASE } from '../../database/database.module';

export type AuditContext = {
  actorUserId?: string | undefined;
  action: string;
  entityType: string;
  entityId?: string | undefined;
  before?: unknown;
  after?: unknown;
};

/**
 * Audit writer shared by all admin mutations. Reuses the shared `audit_logs`
 * table; before/after snapshots are stored in the `metadata` jsonb column
 * because Numora's audit schema keeps a single jsonb metadata field.
 */
@Injectable()
export class AuditService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  async record(context: AuditContext): Promise<void> {
    await this.db.insert(auditLogs).values({
      actorUserId: context.actorUserId,
      action: context.action,
      entityType: context.entityType,
      entityId: context.entityId,
      metadata: {
        before: context.before ?? null,
        after: context.after ?? null,
      },
    });
  }

  async list(params: { limit?: number | undefined; offset?: number | undefined; entityType?: string | undefined }) {
    const limit = Math.min(Number(params.limit ?? 50) || 50, 100);
    const offset = Math.max(Number(params.offset ?? 0) || 0, 0);
    const condition = params.entityType ? eq(auditLogs.entityType, params.entityType) : undefined;

    const items = await this.db
      .select()
      .from(auditLogs)
      .where(condition)
      .orderBy(auditLogs.createdAt)
      .limit(limit)
      .offset(offset);

    const total = condition
      ? await this.db.$count(auditLogs, condition)
      : await this.db.$count(auditLogs);

    return { items, meta: { limit, offset, total } };
  }
}
