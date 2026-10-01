import { Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { getDatabase, questionReports, videoReports } from '@tka/database';
import { adminMutation } from '../audit/admin-mutation';
import type { ContentPageDto } from '../content/content.dto';
import type { AdminReportsDto, ResolveReportDto } from './reports.dto';

@Injectable()
export class ReportsService {
  async list(page: ContentPageDto): Promise<AdminReportsDto> {
    const { db } = getDatabase();
    // Each source is paged separately so a busy question queue cannot hide video reports.
    const [q, v] = await Promise.all([
      db
        .select()
        .from(questionReports)
        .orderBy(desc(questionReports.reportedAt), desc(questionReports.id))
        .limit(page.limit)
        .offset(page.offset),
      db
        .select()
        .from(videoReports)
        .orderBy(desc(videoReports.reportedAt), desc(videoReports.id))
        .limit(page.limit)
        .offset(page.offset),
    ]);
    return {
      items: [
        ...q.map((r) => ({
          id: r.id,
          kind: 'QUESTION' as const,
          referenceId: r.attemptAnswerId,
          category: r.category,
          details: r.details,
          status: r.status,
          followUp: r.followUp,
          reportedAt: r.reportedAt.toISOString(),
        })),
        ...v.map((r) => ({
          id: r.id,
          kind: 'VIDEO' as const,
          referenceId: r.mappingId,
          category: r.category,
          details: r.details,
          status: r.status,
          followUp: r.followUp,
          reportedAt: r.reportedAt.toISOString(),
        })),
      ].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)),
    };
  }
  update(actor: string, kind: 'QUESTION' | 'VIDEO', id: string, body: ResolveReportDto) {
    return adminMutation(
      actor,
      'report_updated',
      kind === 'QUESTION' ? 'question_report' : 'video_report',
      async (tx) => {
        const table = kind === 'QUESTION' ? questionReports : videoReports;
        const [row] = await tx
          .update(table)
          .set({ status: body.status, followUp: body.followUp.trim() })
          .where(eq(table.id, id))
          .returning({ id: table.id });
        if (!row) throw new NotFoundException('Laporan tidak ditemukan.');
        return row;
      },
    );
  }
}
