import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { insertOne } from '../../utils/db-helpers';
import { reportStatus, reports, users } from '@tka/database';
import { DEMO_ADMIN_AUTH_ID } from '../../config/demo-actor';
import type { Db } from '../../database/database.module';
import { DATABASE } from '../../database/database.module';
import { AuditService } from '../audit/audit.service';
import type { CreateReportDto, UpdateReportDto } from './dto/reports.dto';

type ReportStatus = (typeof reportStatus.enumValues)[number];

const MAX_LIMIT = 100;

@Injectable()
export class ReportsService {
  private async resolveActorId(): Promise<string> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, DEMO_ADMIN_AUTH_ID))
      .limit(1);
    return rows[0]?.id ?? '00000000-0000-4000-8000-000000000001';
  }


  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly audit: AuditService,
  ) {}

  async listReports(params: { page?: number; limit?: number; status?: ReportStatus | undefined }) {
    const limit = Math.min(Math.max(Number(params.limit ?? 20) || 20, 1), MAX_LIMIT);
    const page = Math.max(Number(params.page ?? 1) || 1, 1);
    const offset = (page - 1) * limit;
    const condition = params.status ? eq(reports.status, params.status) : undefined;

    const items = await this.db
      .select()
      .from(reports)
      .where(condition)
      .orderBy(asc(reports.createdAt))
      .limit(limit)
      .offset(offset);
    const total = condition ? await this.db.$count(reports, condition) : await this.db.$count(reports);

    return { items, meta: { page, limit, total } };
  }

  async createReport(dto: CreateReportDto) {
    const created = await insertOne(
      this.db
        .insert(reports)
        .values({
          reporterId: dto.reporterId,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          message: dto.message,
        })
        .returning(),
    );
    await this.audit.record({ action: 'CREATE', entityType: 'Report', entityId: created.id, after: created });
    return created;
  }

  async updateReport(id: string, dto: UpdateReportDto, actorUserId?: string) {
    const actor = actorUserId ?? (await this.resolveActorId());
    const rows = await this.db.select().from(reports).where(eq(reports.id, id)).limit(1);
    const before = rows[0];
    if (!before) throw new NotFoundException('Laporan tidak ditemukan.');

    const changes: Record<string, unknown> = {};
    if (dto.status !== undefined) changes.status = dto.status;
    if (dto.adminNote !== undefined) changes.adminNote = dto.adminNote;

    const [after] = await this.db.update(reports).set(changes).where(eq(reports.id, id)).returning();
    await this.audit.record({
      actorUserId: actor,
      action: 'UPDATE',
      entityType: 'Report',
      entityId: id,
      before,
      after,
    });
    return after;
  }

  /** Dashboard aggregate: currently open reports. */
  async openReportCount() {
    return this.db.$count(reports, eq(reports.status, 'OPEN'));
  }
}
