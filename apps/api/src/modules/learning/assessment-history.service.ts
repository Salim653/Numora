import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  assessmentAttempts,
  assessmentPackages,
  getDatabase,
} from '@tka/database';
import { and, desc, eq, inArray, isNotNull, lt, or } from 'drizzle-orm';
import { IdentityService } from '../identity/identity.service';
import { TryoutReleaseService } from './tryout-release.service';

const problem = (code: string, detail: string) => ({ code, detail });
const PAGE_SIZE = 20;

@Injectable()
export class AssessmentHistoryService {
  constructor(
    private readonly identity: IdentityService,
    private readonly releases: TryoutReleaseService,
  ) {}

  async list(authorization: string | undefined, cursor?: string) {
    const user = await this.identity.me(authorization);
    if (user.role !== 'STUDENT')
      throw new ForbiddenException(problem('STUDENT_REQUIRED', 'Akses Student diperlukan.'));
    return this.listForStudent(user.id, cursor);
  }

  async listForStudent(studentId: string, cursor?: string) {
    const { db } = getDatabase();
    const [position] = cursor
      ? await db
          .select({ id: assessmentAttempts.id, finishedAt: assessmentAttempts.finishedAt })
          .from(assessmentAttempts)
          .where(and(
            eq(assessmentAttempts.id, cursor),
            eq(assessmentAttempts.studentId, studentId),
            isNotNull(assessmentAttempts.finishedAt),
          ))
          .limit(1)
      : [];
    if (cursor && (!position || !position.finishedAt))
      throw new NotFoundException(problem('CURSOR_NOT_FOUND', 'Posisi riwayat tidak ditemukan.'));

    const rows = await db
      .select({
        id: assessmentAttempts.id,
        assessmentType: assessmentAttempts.assessmentType,
        packageId: assessmentAttempts.packageId,
        title: assessmentPackages.name,
        finishedAt: assessmentAttempts.finishedAt,
        score: assessmentAttempts.score0To100,
        status: assessmentAttempts.status,
      })
      .from(assessmentAttempts)
      .innerJoin(assessmentPackages, eq(assessmentPackages.id, assessmentAttempts.packageId))
      .where(and(
        eq(assessmentAttempts.studentId, studentId),
        inArray(assessmentAttempts.assessmentType, ['PRETEST', 'DRILL', 'TRYOUT']),
        isNotNull(assessmentAttempts.finishedAt),
        or(
          eq(assessmentAttempts.status, 'GRADED'),
          and(
            eq(assessmentAttempts.assessmentType, 'TRYOUT'),
            eq(assessmentAttempts.status, 'SUBMITTED'),
          ),
        ),
        position?.finishedAt
          ? or(
              lt(assessmentAttempts.finishedAt, position.finishedAt),
              and(
                eq(assessmentAttempts.finishedAt, position.finishedAt),
                lt(assessmentAttempts.id, position.id),
              ),
            )
          : undefined,
      ))
      .orderBy(desc(assessmentAttempts.finishedAt), desc(assessmentAttempts.id))
      .limit(PAGE_SIZE + 1);
    const page = rows.slice(0, PAGE_SIZE);
    const tryoutIds = [...new Set(page
      .filter((row) => row.assessmentType === 'TRYOUT')
      .map((row) => row.packageId))];
    const releasedPackages = await this.releases.releasedPackageIds(tryoutIds);
    return {
      records: page.map((row) => {
        const ready = row.assessmentType !== 'TRYOUT' ||
          (row.status === 'GRADED' && releasedPackages.has(row.packageId));
        return {
          attemptId: row.id,
          activity: row.assessmentType.toLowerCase() as 'drill' | 'pretest' | 'tryout',
          title: row.title,
          submittedAt: row.finishedAt!.toISOString(),
          resultState: ready ? ('ready' as const) : ('waitingIrt' as const),
          score: ready && row.score !== null ? Number(row.score) : null,
        };
      }),
      nextCursor: rows.length > PAGE_SIZE ? page.at(-1)!.id : null,
    };
  }
}
