import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  analyticsOutbox,
  chapters,
  drillAttemptQuestions,
  drillAttempts,
  drillPackageQuestions,
  drillPackages,
  getDatabase,
  levelProgress,
  levels,
  questions,
  questionVariants,
  questionVersions,
  subchapters,
} from '@tka/database';
import { and, asc, desc, eq, isNotNull, lte, sql } from 'drizzle-orm';
import { IdentityService } from '../identity/identity.service';

const problem = (code: string, detail: string) => ({ code, detail });

export function scoreDrill(correctCount: number, questionCount: number) {
  const score = Math.round((correctCount * 100) / questionCount);
  return {
    score,
    mastered: score >= 80,
    stars: score === 0 ? null : score <= 50 ? 1 : score <= 90 ? 2 : 3,
  };
}

export function selectDrillPackage<T extends { id: string }>(
  packages: T[],
  previousPackageId?: string,
) {
  return previousPackageId
    ? packages.find((item) => item.id !== previousPackageId)
    : packages[0];
}

export function explanationAvailable(completedAt: Date, now = new Date()) {
  return now.getTime() < completedAt.getTime() + 90 * 24 * 60 * 60 * 1000;
}

export function presentActiveQuestion(question: {
  id: string;
  stem: string;
  options: { id: string; text: string }[];
  selectedOptionId: string | null;
  correctOptionId: string;
  explanation: string;
}) {
  return {
    questionInstanceId: question.id,
    stem: question.stem,
    options: question.options,
    selectedOptionId: question.selectedOptionId,
  };
}

function decodeSingleChoiceVersion(row: {
  questionType: string;
  stem: unknown;
  optionsOrStatements: unknown;
  answerKey: unknown;
  explanation: unknown;
}) {
  const textOf = (value: unknown) =>
    value && typeof value === 'object' && 'text' in value && typeof value.text === 'string'
      ? value.text
      : null;
  const stem = textOf(row.stem);
  const explanation = textOf(row.explanation);
  const answer = row.answerKey && typeof row.answerKey === 'object' && 'optionId' in row.answerKey
    ? row.answerKey.optionId
    : null;
  const options = Array.isArray(row.optionsOrStatements)
    ? row.optionsOrStatements.map((item: unknown) => {
        if (!item || typeof item !== 'object' || !('id' in item) || !('content' in item)) return null;
        const content = textOf(item.content);
        return typeof item.id === 'string' && content ? { id: item.id, text: content } : null;
      })
    : [];
  const ids = options.map((item) => item?.id).sort();
  if (row.questionType !== 'SINGLE_CHOICE' || !stem || !explanation ||
      typeof answer !== 'string' || !['A', 'B', 'C', 'D'].includes(answer) ||
      options.length !== 4 || options.some((item) => item === null) ||
      ids.join(',') !== 'A,B,C,D') {
    throw new ServiceUnavailableException(problem('DRILL_CONTENT_INVALID', 'Konten Drill tidak valid.'));
  }
  return { stem, options: options as { id: string; text: string }[], correctOptionId: answer, explanation };
}

@Injectable()
export class LearningService {
  constructor(private readonly identity: IdentityService) {}

  private async student(authorization?: string) {
    const user = await this.identity.me(authorization);
    if (user.role !== 'STUDENT')
      throw new ForbiddenException(problem('STUDENT_REQUIRED', 'Akses Student diperlukan.'));
    return user.id;
  }

  async catalog(authorization?: string) {
    await this.student(authorization);
    const { db } = getDatabase();
    const rows = await db
      .select()
      .from(chapters)
      .where(eq(chapters.status, 'READY'))
      .orderBy(asc(chapters.displayOrder));
    return {
      chapters: rows.map((row) => ({ id: row.id, title: row.name, order: row.displayOrder })),
    };
  }

  async chapter(authorization: string | undefined, chapterId: string) {
    await this.student(authorization);
    const { db } = getDatabase();
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(and(eq(chapters.id, chapterId), eq(chapters.status, 'READY')))
      .limit(1);
    if (!chapter) throw new NotFoundException(problem('CHAPTER_NOT_FOUND', 'Bab tidak ditemukan.'));
    const children = await db
      .select()
      .from(subchapters)
      .where(and(eq(subchapters.chapterId, chapterId), eq(subchapters.status, 'READY')))
      .orderBy(asc(subchapters.displayOrder));
    return {
      chapter: { id: chapter.id, title: chapter.name, order: chapter.displayOrder },
      subchapters: children.map((row) => ({
        id: row.id,
        chapterId: row.chapterId,
        title: row.name,
        order: row.displayOrder,
      })),
    };
  }

  async subchapter(authorization: string | undefined, subchapterId: string) {
    const studentId = await this.student(authorization);
    const { db } = getDatabase();
    const [subchapter] = await db
      .select({
        id: subchapters.id,
        chapterId: subchapters.chapterId,
        title: subchapters.name,
        sortOrder: subchapters.displayOrder,
      })
      .from(subchapters)
      .innerJoin(chapters, eq(chapters.id, subchapters.chapterId))
      .where(
        and(
          eq(subchapters.id, subchapterId),
          eq(subchapters.status, 'READY'),
          eq(chapters.status, 'READY'),
        ),
      )
      .limit(1);
    if (!subchapter)
      throw new NotFoundException(problem('SUBCHAPTER_NOT_FOUND', 'Subbab tidak ditemukan.'));
    const rows = await db
      .select()
      .from(levels)
      .where(and(eq(levels.subchapterId, subchapterId), eq(levels.status, 'READY')))
      .orderBy(asc(levels.levelNumber));
    const progress = await db
      .select()
      .from(levelProgress)
      .where(eq(levelProgress.studentId, studentId));
    const attempts = await db
      .select({ levelId: drillAttempts.levelId })
      .from(drillAttempts)
      .where(and(eq(drillAttempts.studentId, studentId), eq(drillAttempts.status, 'IN_PROGRESS')));
    const byLevel = new Map(progress.map((row) => [row.levelId, row]));
    const active = new Set(attempts.map((row) => row.levelId));
    return {
      subchapter: {
        id: subchapter.id,
        chapterId: subchapter.chapterId,
        title: subchapter.title,
        order: subchapter.sortOrder,
      },
      levels: rows.map((row) => {
        const state = byLevel.get(row.id);
        const unlocked = state?.unlockedAt || row.levelNumber === 1;
        const status = !unlocked
          ? 'locked'
          : state?.completedAt
            ? 'completed'
            : active.has(row.id)
              ? 'inProgress'
              : 'open';
        return {
          id: row.id,
          title: row.description ?? `Level ${row.levelNumber}`,
          order: row.levelNumber,
          status,
          latestScore: state?.latestScore ?? null,
          bestScore: state?.bestScore ?? null,
        };
      }),
    };
  }

  async progress(authorization?: string) {
    const studentId = await this.student(authorization);
    const { db } = getDatabase();
    const published = await db
      .select({ id: levels.id })
      .from(levels)
      .innerJoin(subchapters, eq(subchapters.id, levels.subchapterId))
      .innerJoin(chapters, eq(chapters.id, subchapters.chapterId))
      .where(
        and(
          eq(levels.status, 'READY'),
          eq(subchapters.status, 'READY'),
          eq(chapters.status, 'READY'),
        ),
      );
    const done = await db
      .select({ levelId: levelProgress.levelId })
      .from(levelProgress)
      .where(and(eq(levelProgress.studentId, studentId), isNotNull(levelProgress.completedAt)));
    const [latest] = await db
      .select({ score: drillAttempts.score })
      .from(drillAttempts)
      .where(and(eq(drillAttempts.studentId, studentId), eq(drillAttempts.status, 'COMPLETED')))
      .orderBy(desc(drillAttempts.completedAt), desc(drillAttempts.id))
      .limit(1);
    const publishedIds = new Set(published.map((row) => row.id));
    return {
      completedLevels: done.filter((row) => publishedIds.has(row.levelId)).length,
      totalLevels: published.length,
      latestScore: latest?.score ?? null,
    };
  }

  async start(authorization: string | undefined, levelId: string) {
    const studentId = await this.student(authorization);
    const { db } = getDatabase();
    const attemptId = await db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${studentId}), hashtext(${levelId}))`,
      );
      const [level] = await tx
        .select({ id: levels.id, levelNumber: levels.levelNumber })
        .from(levels)
        .innerJoin(subchapters, eq(subchapters.id, levels.subchapterId))
        .innerJoin(chapters, eq(chapters.id, subchapters.chapterId))
        .where(
          and(
            eq(levels.id, levelId),
            eq(levels.status, 'READY'),
            eq(subchapters.status, 'READY'),
            eq(chapters.status, 'READY'),
          ),
        )
        .limit(1);
      if (!level) throw new NotFoundException(problem('LEVEL_NOT_FOUND', 'Level tidak ditemukan.'));
      if (level.levelNumber !== 1) {
        const [access] = await tx
          .select({ id: levelProgress.id })
          .from(levelProgress)
          .where(and(eq(levelProgress.studentId, studentId), eq(levelProgress.levelId, levelId), isNotNull(levelProgress.unlockedAt)))
          .limit(1);
        if (!access) throw new ForbiddenException(problem('LEVEL_LOCKED', 'Level masih terkunci.'));
      }
      const [existing] = await tx
        .select({ id: drillAttempts.id })
        .from(drillAttempts)
        .where(
          and(
            eq(drillAttempts.studentId, studentId),
            eq(drillAttempts.levelId, levelId),
            eq(drillAttempts.status, 'IN_PROGRESS'),
          ),
        )
        .limit(1);
      if (existing) return existing.id;
      const packages = await tx
        .select()
        .from(drillPackages)
        .where(and(eq(drillPackages.levelId, levelId), lte(drillPackages.publishedAt, new Date())))
        .orderBy(asc(drillPackages.variantSet));
      if (!packages.length)
        throw new ServiceUnavailableException(
          problem('DRILL_PACKAGE_UNAVAILABLE', 'Paket Drill belum tersedia.'),
        );
      const [last] = await tx
        .select({ packageId: drillAttempts.packageId })
        .from(drillAttempts)
        .where(
          and(
            eq(drillAttempts.studentId, studentId),
            eq(drillAttempts.levelId, levelId),
            eq(drillAttempts.status, 'COMPLETED'),
          ),
        )
        .orderBy(desc(drillAttempts.completedAt), desc(drillAttempts.id))
        .limit(1);
      const selected = selectDrillPackage(packages, last?.packageId);
      if (!selected) {
        throw new ServiceUnavailableException(
          problem('DRILL_VARIANT_UNAVAILABLE', 'Varian Drill berikutnya belum tersedia.'),
        );
      }
      const items = await tx
        .select({
          sortOrder: drillPackageQuestions.sortOrder,
          questionVariantId: questionVariants.id,
          questionVersionId: questionVersions.id,
          questionType: questionVersions.questionType,
          contentStatus: questionVersions.contentStatus,
          questionStatus: questions.status,
          stem: questionVersions.stem,
          optionsOrStatements: questionVersions.optionsOrStatements,
          answerKey: questionVersions.answerKey,
          explanation: questionVersions.explanation,
        })
        .from(drillPackageQuestions)
        .innerJoin(
          questionVariants,
          eq(questionVariants.id, drillPackageQuestions.questionVariantId),
        )
        .innerJoin(questionVersions, eq(questionVersions.id, drillPackageQuestions.questionVersionId))
        .innerJoin(questions, eq(questions.id, questionVariants.questionId))
        .where(eq(drillPackageQuestions.packageId, selected.id))
        .orderBy(asc(drillPackageQuestions.sortOrder));
      if (items.length !== 10)
        throw new ServiceUnavailableException(
          problem('DRILL_PACKAGE_INVALID', 'Paket Drill demo harus berisi 10 soal.'),
        );
      if (items.some((item) =>
        item.contentStatus === 'ARCHIVED' || item.questionStatus === 'ARCHIVED' ||
        (!selected.isDemo && (item.contentStatus !== 'READY' || item.questionStatus !== 'READY')),
      )) {
        throw new ServiceUnavailableException(
          problem('DRILL_CONTENT_NOT_READY', 'Konten Drill belum disetujui atau telah diarsipkan.'),
        );
      }
      const [attempt] = await tx
        .insert(drillAttempts)
        .values({ studentId, levelId, packageId: selected.id, isDemo: selected.isDemo })
        .returning({ id: drillAttempts.id });
      if (!attempt) throw new Error('Attempt creation failed.');
      await tx
        .insert(drillAttemptQuestions)
        .values(items.map((item) => ({
          attemptId: attempt.id,
          sortOrder: item.sortOrder,
          questionVariantId: item.questionVariantId,
          questionVersionId: item.questionVersionId,
          ...decodeSingleChoiceVersion(item),
        })));
      return attempt.id;
    });
    return this.attemptForStudent(studentId, attemptId);
  }

  private async attemptForStudent(studentId: string, attemptId: string) {
    const { db } = getDatabase();
    const [attempt] = await db
      .select({
        id: drillAttempts.id,
        studentId: drillAttempts.studentId,
        levelId: drillAttempts.levelId,
        levelTitle: sql<string>`coalesce(${levels.description}, 'Level ' || ${levels.levelNumber})`,
        status: drillAttempts.status,
        startedAt: drillAttempts.startedAt,
        isDemo: drillAttempts.isDemo,
      })
      .from(drillAttempts)
      .innerJoin(levels, eq(levels.id, drillAttempts.levelId))
      .where(eq(drillAttempts.id, attemptId))
      .limit(1);
    if (!attempt || attempt.studentId !== studentId)
      throw new NotFoundException(problem('ATTEMPT_NOT_FOUND', 'Drill tidak ditemukan.'));
    const questions = await db
      .select()
      .from(drillAttemptQuestions)
      .where(eq(drillAttemptQuestions.attemptId, attemptId))
      .orderBy(asc(drillAttemptQuestions.sortOrder));
    return {
      id: attempt.id,
      levelId: attempt.levelId,
      levelTitle: attempt.levelTitle,
      status: attempt.status === 'COMPLETED' ? ('completed' as const) : ('inProgress' as const),
      startedAt: attempt.startedAt.toISOString(),
      isDemo: attempt.isDemo,
      questions: attempt.status === 'COMPLETED' ? [] : questions.map(presentActiveQuestion),
    };
  }

  async attempt(authorization: string | undefined, attemptId: string) {
    return this.attemptForStudent(await this.student(authorization), attemptId);
  }

  async saveAnswer(
    authorization: string | undefined,
    attemptId: string,
    questionInstanceId: string,
    optionId: string | null,
  ) {
    if (
      optionId !== null &&
      (typeof optionId !== 'string' || !['A', 'B', 'C', 'D'].includes(optionId))
    ) {
      throw new BadRequestException(problem('OPTION_INVALID', 'optionId harus A-D atau null.'));
    }
    const studentId = await this.student(authorization);
    const { db } = getDatabase();
    return db.transaction(async (tx) => {
      const [attempt] = await tx
        .select({ studentId: drillAttempts.studentId, status: drillAttempts.status })
        .from(drillAttempts)
        .where(eq(drillAttempts.id, attemptId))
        .for('update')
        .limit(1);
      if (!attempt || attempt.studentId !== studentId)
        throw new NotFoundException(problem('ATTEMPT_NOT_FOUND', 'Drill tidak ditemukan.'));
      if (attempt.status !== 'IN_PROGRESS')
        throw new ConflictException(problem('ATTEMPT_COMPLETED', 'Drill sudah selesai.'));
      const [question] = await tx
        .select()
        .from(drillAttemptQuestions)
        .where(
          and(
            eq(drillAttemptQuestions.id, questionInstanceId),
            eq(drillAttemptQuestions.attemptId, attemptId),
          ),
        )
        .limit(1);
      if (!question)
        throw new NotFoundException(
          problem('QUESTION_NOT_FOUND', 'Soal tidak ditemukan pada Drill ini.'),
        );
      if (optionId !== null && !question.options.some((option) => option.id === optionId))
        throw new ConflictException(problem('OPTION_INVALID', 'Pilihan jawaban tidak tersedia.'));
      await tx
        .update(drillAttemptQuestions)
        .set({ selectedOptionId: optionId })
        .where(eq(drillAttemptQuestions.id, questionInstanceId));
      return { questionInstanceId, selectedOptionId: optionId };
    });
  }

  async submit(authorization: string | undefined, attemptId: string) {
    const studentId = await this.student(authorization);
    const { db } = getDatabase();
    await db.transaction(async (tx) => {
      const [attempt] = await tx
        .select()
        .from(drillAttempts)
        .where(eq(drillAttempts.id, attemptId))
        .for('update')
        .limit(1);
      if (!attempt || attempt.studentId !== studentId)
        throw new NotFoundException(problem('ATTEMPT_NOT_FOUND', 'Drill tidak ditemukan.'));
      if (attempt.status === 'COMPLETED') return;
      const questions = await tx
        .select()
        .from(drillAttemptQuestions)
        .where(eq(drillAttemptQuestions.attemptId, attemptId));
      if (questions.length !== 10)
        throw new ServiceUnavailableException(
          problem('DRILL_PACKAGE_INVALID', 'Paket Drill tidak lengkap.'),
        );
      const correctCount = questions.filter((q) => q.selectedOptionId === q.correctOptionId).length;
      const scored = scoreDrill(correctCount, questions.length);
      const [level] = await tx.select().from(levels).where(eq(levels.id, attempt.levelId)).limit(1);
      if (!level) throw new Error('Attempt level is missing.');
      const [next] = scored.mastered
        ? await tx
            .select({ id: levels.id })
            .from(levels)
            .where(
              and(
                eq(levels.subchapterId, level.subchapterId),
                eq(levels.levelNumber, level.levelNumber + 1),
                eq(levels.status, 'READY'),
              ),
            )
            .limit(1)
        : [];
      const now = new Date();
      await tx
        .update(drillAttempts)
        .set({
          status: 'COMPLETED',
          completedAt: now,
          score: scored.score,
          rawPoints: correctCount,
          correctCount,
          questionCount: questions.length,
          mastered: scored.mastered,
          stars: scored.stars,
          unlockedLevelId: next?.id ?? null,
        })
        .where(eq(drillAttempts.id, attemptId));
      await tx
        .insert(levelProgress)
        .values({
          studentId,
          levelId: attempt.levelId,
          unlockedAt: now,
          latestScore: scored.score,
          bestScore: scored.score,
          bestStars: scored.stars,
          completedAt: scored.mastered ? now : null,
        })
        .onConflictDoUpdate({
          target: [levelProgress.studentId, levelProgress.levelId],
          set: {
            unlockedAt: sql`coalesce(${levelProgress.unlockedAt}, ${now.toISOString()}::timestamptz)`,
            latestScore: scored.score,
            bestScore: sql`greatest(coalesce(${levelProgress.bestScore}, 0), ${scored.score})`,
            bestStars: sql`greatest(${levelProgress.bestStars}, ${scored.stars}::integer)`,
            completedAt: scored.mastered ? now : sql`${levelProgress.completedAt}`,
          },
        });
      if (next)
        await tx
          .insert(levelProgress)
          .values({ studentId, levelId: next.id, unlockedAt: now, unlockSource: 'DRILL' })
          .onConflictDoUpdate({
            target: [levelProgress.studentId, levelProgress.levelId],
            set: {
              unlockedAt: sql`coalesce(${levelProgress.unlockedAt}, ${now.toISOString()}::timestamptz)`,
              unlockSource: sql`case when ${levelProgress.unlockedAt} is null then 'DRILL' else ${levelProgress.unlockSource} end`,
            },
          });
      await tx
        .insert(analyticsOutbox)
        .values({
          eventName: 'drill_completed',
          actorUserId: studentId,
          entityType: 'assessmentAttempt',
          entityId: attemptId,
          payload: { score: scored.score, mastered: scored.mastered, isDemo: attempt.isDemo },
        });
    });
    return this.resultForStudent(studentId, attemptId);
  }

  private async resultForStudent(studentId: string, attemptId: string) {
    const { db } = getDatabase();
    const [attempt] = await db
      .select({
        id: drillAttempts.id,
        studentId: drillAttempts.studentId,
        levelId: drillAttempts.levelId,
        levelTitle: sql<string>`coalesce(${levels.description}, 'Level ' || ${levels.levelNumber})`,
        status: drillAttempts.status,
        completedAt: drillAttempts.completedAt,
        score: drillAttempts.score,
        rawPoints: drillAttempts.rawPoints,
        correctCount: drillAttempts.correctCount,
        questionCount: drillAttempts.questionCount,
        mastered: drillAttempts.mastered,
        stars: drillAttempts.stars,
        unlockedLevelId: drillAttempts.unlockedLevelId,
        isDemo: drillAttempts.isDemo,
      })
      .from(drillAttempts)
      .innerJoin(levels, eq(levels.id, drillAttempts.levelId))
      .where(eq(drillAttempts.id, attemptId))
      .limit(1);
    if (!attempt || attempt.studentId !== studentId)
      throw new NotFoundException(problem('ATTEMPT_NOT_FOUND', 'Drill tidak ditemukan.'));
    if (attempt.status !== 'COMPLETED' || !attempt.completedAt)
      throw new ConflictException(problem('RESULT_PENDING', 'Hasil Drill belum tersedia.'));
    const available = explanationAvailable(attempt.completedAt);
    const questions = available
      ? await db
          .select()
          .from(drillAttemptQuestions)
          .where(eq(drillAttemptQuestions.attemptId, attemptId))
          .orderBy(asc(drillAttemptQuestions.sortOrder))
      : [];
    return {
      attemptId: attempt.id,
      levelId: attempt.levelId,
      levelTitle: attempt.levelTitle,
      score: attempt.score!,
      rawPoints: attempt.rawPoints!,
      correctCount: attempt.correctCount!,
      questionCount: attempt.questionCount!,
      mastered: attempt.mastered!,
      stars: attempt.stars,
      unlockedLevelId: attempt.unlockedLevelId,
      isDemo: attempt.isDemo,
      explanationState: available ? ('available' as const) : ('expired' as const),
      questions: questions.map((row) => ({
        questionInstanceId: row.id,
        stem: row.stem,
        selectedOptionId: row.selectedOptionId,
        correctOptionId: row.correctOptionId,
        options: row.options,
        explanation: row.explanation,
      })),
    };
  }

  async result(authorization: string | undefined, attemptId: string) {
    return this.resultForStudent(await this.student(authorization), attemptId);
  }
}
