import { afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import {
  analyticsOutbox,
  chapters,
  closeDatabaseConnection,
  competencies,
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
  users,
} from '@tka/database';
import { IdentityService } from '../identity/identity.service';
import { LearningService } from './learning.service';

const testUrl = process.env.TEST_DATABASE_URL;
const integration = testUrl ? describe : describe.skip;

integration('Drill lifecycle against PostgreSQL', () => {
  afterAll(async () => closeDatabaseConnection());

  it('keeps submit idempotent, changes package on retry, and protects student results', async () => {
    process.env.DATABASE_URL = testUrl;
    const { db } = getDatabase();
    const suffix = randomUUID().slice(0, 8);
    const [student, stranger] = await db.insert(users).values([1, 2].map((number) => ({
      authUserId: randomUUID(), role: 'STUDENT' as const,
      displayName: `Student ${number}`, email: `drill-${number}-${suffix}@example.test`,
    }))).returning({ id: users.id });
    const identity = { me: async (authorization?: string) => ({
      id: authorization === 'stranger' ? stranger!.id : student!.id, role: 'STUDENT',
    }) } as unknown as IdentityService;
    const learning = new LearningService(identity);
    const [chapter] = await db.insert(chapters).values({
      code: `TEST-${suffix}`, name: `Bab ${suffix}`, displayOrder: parseInt(suffix, 16) % 2_000_000_000,
      status: 'READY',
    }).returning({ id: chapters.id });
    const [subchapter] = await db.insert(subchapters).values({
      chapterId: chapter!.id, code: `SUB-${suffix}`, name: 'Subbab', displayOrder: 1, status: 'READY',
    }).returning({ id: subchapters.id });
    const [firstLevel, nextLevel] = await db.insert(levels).values([1, 2].map((number) => ({
      subchapterId: subchapter!.id, description: null,
      levelNumber: number, status: 'READY' as const,
    }))).returning({ id: levels.id });
    const [competency] = await db.insert(competencies).values({
      subchapterId: subchapter!.id, code: `COMP-${suffix}`, description: 'Fixture', status: 'READY',
    }).returning({ id: competencies.id });
    const [firstPackage, secondPackage] = await db.insert(drillPackages).values([1, 2].map((number) => ({
      levelId: firstLevel!.id, variantSet: number, publishedAt: new Date(),
    }))).returning({ id: drillPackages.id });
    // A scheduled package sorts first but must not be available before publication.
    await db.insert(drillPackages).values({
      levelId: firstLevel!.id, variantSet: 0, publishedAt: new Date(Date.now() + 86_400_000),
    });

    for (let number = 1; number <= 10; number++) {
      const [question] = await db.insert(questions).values({
        primaryCompetencyId: competency!.id, sourceRef: `TEST-${suffix}-${number}`, status: 'READY',
      }).returning({ id: questions.id });
      const [original] = await db.insert(questionVariants).values({
        questionId: question!.id, variantCode: `ORIG-${suffix}-${number}`, kind: 'ORIGINAL', origin: 'TEST',
      }).returning({ id: questionVariants.id });
      for (const variantNo of [1, 2]) {
        const variant = variantNo === 1 ? original! : (await db.insert(questionVariants).values({
          questionId: question!.id, originalVariantId: original!.id,
          variantCode: `VAR-${suffix}-${number}`, kind: 'VARIANT', origin: 'TEST',
        }).returning({ id: questionVariants.id }))[0]!;
        const [version] = await db.insert(questionVersions).values({
          variantId: variant.id, versionNumber: 1, questionType: 'SINGLE_CHOICE',
          stem: { text: `Soal ${number}, varian ${variantNo}` },
          optionsOrStatements: ['A', 'B', 'C', 'D'].map((id) => ({ id, content: { text: id === 'A' ? 'Benar' : 'Salah' } })),
          answerKey: { optionId: 'A' }, explanation: { text: 'Demo' }, difficulty: 'EASY',
        }).returning({ id: questionVersions.id });
        await db.insert(drillPackageQuestions).values({
          packageId: variantNo === 1 ? firstPackage!.id : secondPackage!.id,
          questionVariantId: variant.id, questionVersionId: version!.id, sortOrder: number,
        });
      }
    }

    await db.insert(levelProgress).values({ studentId: student!.id, levelId: nextLevel!.id });
    expect((await learning.subchapter('student', subchapter!.id)).levels.find((level) => level.id === nextLevel!.id)?.status).toBe('locked');
    await expect(learning.start('student', nextLevel!.id)).rejects.toMatchObject({ status: 403 });
    // A pre-existing attempt cannot bypass the current level eligibility check.
    await db.insert(drillAttempts).values({
      studentId: stranger!.id, levelId: nextLevel!.id, packageId: firstPackage!.id,
    });
    await expect(learning.start('stranger', nextLevel!.id)).rejects.toMatchObject({ status: 403 });
    expect((await learning.subchapter('stranger', subchapter!.id)).levels.find((level) => level.id === nextLevel!.id)?.status).toBe('locked');
    // Draft content is restricted to explicitly labeled demo packages.
    await db.update(drillPackages).set({ isDemo: false }).where(eq(drillPackages.id, firstPackage!.id));
    await expect(learning.start('student', firstLevel!.id)).rejects.toMatchObject({
      status: 503, response: { code: 'DRILL_CONTENT_NOT_READY' },
    });
    await db.update(drillPackages).set({ isDemo: true }).where(eq(drillPackages.id, firstPackage!.id));
    const attempt = await learning.start('student', firstLevel!.id);
    expect(attempt.isDemo).toBe(true);
    expect(attempt.levelTitle).toBe('Level 1');
    expect(attempt.questions).toHaveLength(10);
    expect(await learning.start('student', firstLevel!.id)).toMatchObject({ id: attempt.id });
    await expect(learning.attempt('stranger', attempt.id)).rejects.toMatchObject({ status: 404 });
    for (const item of attempt.questions.slice(0, 8))
      await learning.saveAnswer('student', attempt.id, item.questionInstanceId, 'A');

    const [resultA, resultB] = await Promise.all([
      learning.submit('student', attempt.id),
      learning.submit('student', attempt.id),
    ]);
    expect(resultA).toMatchObject({ score: 80, mastered: true, unlockedLevelId: nextLevel!.id });
    expect(resultA.levelTitle).toBe('Level 1');
    expect(resultB).toMatchObject({ attemptId: attempt.id, score: 80 });
    const events = await db.select({ id: analyticsOutbox.id }).from(analyticsOutbox)
      .where(eq(analyticsOutbox.entityId, attempt.id));
    expect(events).toHaveLength(1);
    await expect(learning.result('stranger', attempt.id)).rejects.toMatchObject({ status: 404 });
    expect((await learning.subchapter('student', subchapter!.id)).levels.find((level) => level.id === nextLevel!.id)?.status).toBe('open');

    const retry = await learning.start('student', firstLevel!.id);
    expect(retry.id).not.toBe(attempt.id);
    expect(retry.questions[0]?.stem).toContain('varian 2');
    for (const item of retry.questions.slice(0, 7))
      await learning.saveAnswer('student', retry.id, item.questionInstanceId, 'A');
    const failedRetry = await learning.submit('student', retry.id);
    expect(failedRetry).toMatchObject({ score: 70, mastered: false, unlockedLevelId: null });
    const [progress] = await db.select().from(levelProgress).where(eq(levelProgress.levelId, firstLevel!.id));
    expect(progress).toMatchObject({ latestScore: 70, bestScore: 80, bestStars: 2 });
    expect((await learning.subchapter('student', subchapter!.id)).levels.find((level) => level.id === nextLevel!.id)?.status).toBe('open');
    await expect(learning.saveAnswer('student', retry.id, retry.questions[0]!.questionInstanceId, 'B'))
      .rejects.toMatchObject({ status: 409 });
    // Archiving source content cannot rewrite a completed attempt's snapshot.
    await db.update(questionVersions).set({ contentStatus: 'ARCHIVED' })
      .where(eq(questionVersions.variantId, (await db.select().from(questionVariants)
        .where(eq(questionVariants.variantCode, `ORIG-${suffix}-1`)))[0]!.id));
    expect(await learning.result('student', attempt.id)).toMatchObject({ score: 80, questions: resultA.questions });
    await expect(learning.start('student', firstLevel!.id)).rejects.toMatchObject({
      status: 503, response: { code: 'DRILL_CONTENT_NOT_READY' },
    });
  }, 30_000);
});
