import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { isURL } from 'class-validator';
import { and, asc, eq, sql } from 'drizzle-orm';
import {
  assessmentAttempts,
  assessmentPackages,
  attemptAnswers,
  attemptItems,
  drillAttempts,
  getDatabase,
  learningVideos,
  levels,
  questionReports,
  videoReports,
  videoSubchapterMappings,
} from '@tka/database';
import { IdentityService } from '../identity/identity.service';
import type {
  StudentQuestionReportDto,
  StudentVideoReportDto,
  StudentVideosDto,
} from './student-support.dto';

type SupportReader = Pick<ReturnType<typeof getDatabase>['db'], 'select'>;

@Injectable()
export class StudentSupportService {
  constructor(@Inject(IdentityService) private readonly identity: IdentityService) {}
  private async student(authorization?: string) {
    const profile = await this.identity.me(authorization);
    if (profile.role !== 'STUDENT' || profile.status !== 'ACTIVE')
      throw new ForbiddenException('Akses Student diperlukan.');
    return profile.id;
  }
  private async drill(studentId: string, attemptId: string, db: SupportReader = getDatabase().db) {
    const [canonical] = await db
      .select()
      .from(assessmentAttempts)
      .where(
        and(
          eq(assessmentAttempts.id, attemptId),
          eq(assessmentAttempts.studentId, studentId),
          eq(assessmentAttempts.assessmentType, 'DRILL'),
        ),
      );
    if (canonical) {
      if (canonical.status !== 'GRADED' || canonical.score0To100 === null)
        throw new ConflictException({
          code: 'RESULT_PENDING',
          detail: 'Hasil Drill belum tersedia.',
        });
      const [pkg] = await db
        .select({ levelId: assessmentPackages.levelId })
        .from(assessmentPackages)
        .where(eq(assessmentPackages.id, canonical.packageId));
      return { score: Number(canonical.score0To100), levelId: pkg?.levelId };
    }
    // Read-only compatibility for existing Drill results; no forged canonical answer references.
    const [legacy] = await db
      .select()
      .from(drillAttempts)
      .where(and(eq(drillAttempts.id, attemptId), eq(drillAttempts.studentId, studentId)));
    if (!legacy) throw new NotFoundException('Drill tidak ditemukan.');
    if (legacy.status !== 'COMPLETED' || legacy.score === null)
      throw new ConflictException({
        code: 'RESULT_PENDING',
        detail: 'Hasil Drill belum tersedia.',
      });
    return { score: legacy.score, levelId: legacy.levelId };
  }
  private async recommendations(
    studentId: string,
    attemptId: string,
    db: SupportReader = getDatabase().db,
  ): Promise<StudentVideosDto> {
    const attempt = await this.drill(studentId, attemptId, db);
    if (attempt.score >= 80 || !attempt.levelId) return { items: [] };
    const [level] = await db.select().from(levels).where(eq(levels.id, attempt.levelId));
    if (!level) return { items: [] };
    const items = await db
      .select({
        mappingId: videoSubchapterMappings.id,
        title: learningVideos.title,
        url: learningVideos.url,
        source: learningVideos.source,
      })
      .from(videoSubchapterMappings)
      .innerJoin(learningVideos, eq(learningVideos.id, videoSubchapterMappings.videoId))
      .where(
        and(
          eq(videoSubchapterMappings.subchapterId, level.subchapterId),
          eq(videoSubchapterMappings.status, 'READY'),
          eq(learningVideos.curationStatus, 'READY'),
        ),
      )
      .orderBy(asc(videoSubchapterMappings.recommendationOrder), asc(videoSubchapterMappings.id))
      .limit(3);
    // Imported metadata must meet the same HTTPS requirement as the Admin editor.
    return {
      items: items.filter((item) =>
        isURL(item.url, { protocols: ['https'], require_protocol: true }),
      ),
    };
  }
  async videos(authorization: string | undefined, attemptId: string) {
    return this.recommendations(await this.student(authorization), attemptId);
  }
  async questionReport(authorization: string | undefined, body: StudentQuestionReportDto) {
    const studentId = await this.student(authorization);
    return getDatabase().db.transaction(async (tx) => {
      const id = body.clientRequestId ?? randomUUID();
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'question-report:' + id}))`);
      const [existing] = await tx.select().from(questionReports).where(eq(questionReports.id, id));
      if (existing) {
        if (
          existing.reporterStudentId !== studentId ||
          existing.attemptAnswerId === null ||
          existing.category !== body.category.trim() ||
          (existing.details ?? '') !== (body.details?.trim() ?? '')
        )
          throw new ConflictException('ID pengiriman laporan sudah digunakan.');
        const [answer] = await tx
          .select()
          .from(attemptAnswers)
          .where(eq(attemptAnswers.id, existing.attemptAnswerId));
        if (answer?.attemptItemId !== body.attemptItemId)
          throw new ConflictException('ID pengiriman laporan sudah digunakan.');
        return { id };
      }
      const [item] = await tx
        .select({ id: attemptItems.id })
        .from(attemptItems)
        .innerJoin(assessmentAttempts, eq(assessmentAttempts.id, attemptItems.attemptId))
        .where(
          and(eq(attemptItems.id, body.attemptItemId), eq(assessmentAttempts.studentId, studentId)),
        );
      if (!item)
        throw new NotFoundException({
          code: 'REPORT_ITEM_NOT_FOUND',
          detail: 'Pelaporan soal belum tersedia untuk latihan ini.',
        });
      const [answer] = await tx
        .select({ id: attemptAnswers.id })
        .from(attemptAnswers)
        .where(eq(attemptAnswers.attemptItemId, item.id));
      if (!answer)
        throw new ConflictException({
          code: 'REPORT_ANSWER_UNAVAILABLE',
          detail: 'Pelaporan soal belum tersedia untuk jawaban ini.',
        });
      return (
        await tx
          .insert(questionReports)
          .values({
            id,
            reporterStudentId: studentId,
            attemptAnswerId: answer.id,
            category: body.category.trim(),
            details: body.details?.trim(),
          })
          .returning({ id: questionReports.id })
      )[0]!;
    });
  }
  async videoReport(authorization: string | undefined, body: StudentVideoReportDto) {
    const studentId = await this.student(authorization);
    return getDatabase().db.transaction(async (tx) => {
      const id = body.clientRequestId ?? randomUUID();
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'video-report:' + id}))`);
      const [existing] = await tx.select().from(videoReports).where(eq(videoReports.id, id));
      if (existing) {
        if (
          existing.reporterStudentId !== studentId ||
          existing.mappingId !== body.mappingId ||
          existing.category !== body.category.trim() ||
          (existing.details ?? '') !== (body.details?.trim() ?? '')
        )
          throw new ConflictException('ID pengiriman laporan sudah digunakan.');
        // Even an already accepted retry must not bypass ownership of its assessment context.
        await this.drill(studentId, body.attemptId, tx);
        return { id };
      }
      const recommended = await this.recommendations(studentId, body.attemptId, tx);
      if (!recommended.items.some((item) => item.mappingId === body.mappingId))
        throw new NotFoundException('Rekomendasi video tidak ditemukan.');
      return (
        await tx
          .insert(videoReports)
          .values({
            id,
            reporterStudentId: studentId,
            mappingId: body.mappingId,
            category: body.category.trim(),
            details: body.details?.trim(),
          })
          .returning({ id: videoReports.id })
      )[0]!;
    });
  }
}
