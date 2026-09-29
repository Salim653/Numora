import { afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import {
  analyticsOutbox,
  chapters,
  closeDatabaseConnection,
  drillPackageQuestions,
  drillPackages,
  getDatabase,
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
      title: `Bab ${suffix}`, sortOrder: parseInt(suffix, 16) % 2_000_000_000,
      publishedAt: new Date(),
    }).returning({ id: chapters.id });
    const [subchapter] = await db.insert(subchapters).values({
      chapterId: chapter!.id, title: 'Subbab', sortOrder: 1, publishedAt: new Date(),
    }).returning({ id: subchapters.id });
    const [firstLevel, nextLevel] = await db.insert(levels).values([1, 2].map((number) => ({
      subchapterId: subchapter!.id, title: `Level ${number}`,
      sortOrder: number, publishedAt: new Date(),
    }))).returning({ id: levels.id });
    const [firstPackage, secondPackage] = await db.insert(drillPackages).values([1, 2].map((number) => ({
      levelId: firstLevel!.id, variantSet: number, publishedAt: new Date(),
    }))).returning({ id: drillPackages.id });

    for (let number = 1; number <= 10; number++) {
      const [question] = await db.insert(questions).values({
        levelId: firstLevel!.id, code: `TEST-${suffix}-${number}`,
      }).returning({ id: questions.id });
      const [version] = await db.insert(questionVersions).values({
        questionId: question!.id, version: 1,
      }).returning({ id: questionVersions.id });
      const variants = await db.insert(questionVariants).values([1, 2].map((variantNo) => ({
        questionVersionId: version!.id, variantNo, stem: `Soal ${number}, varian ${variantNo}`,
        options: [{ id: 'A', text: 'Benar' }, { id: 'B', text: 'Salah' }],
        correctOptionId: 'A', explanation: 'Demo', isDemo: true,
      }))).returning({ id: questionVariants.id, variantNo: questionVariants.variantNo });
      await db.insert(drillPackageQuestions).values(variants.map((variant) => ({
        packageId: variant.variantNo === 1 ? firstPackage!.id : secondPackage!.id,
        questionVariantId: variant.id, sortOrder: number,
      })));
    }

    const attempt = await learning.start('student', firstLevel!.id);
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
    expect(resultB).toMatchObject({ attemptId: attempt.id, score: 80 });
    const events = await db.select({ id: analyticsOutbox.id }).from(analyticsOutbox)
      .where(eq(analyticsOutbox.entityId, attempt.id));
    expect(events).toHaveLength(1);
    await expect(learning.result('stranger', attempt.id)).rejects.toMatchObject({ status: 404 });
    expect((await learning.subchapter('student', subchapter!.id)).levels.find((level) => level.id === nextLevel!.id)?.status).toBe('open');

    const retry = await learning.start('student', firstLevel!.id);
    expect(retry.id).not.toBe(attempt.id);
    expect(retry.questions[0]?.stem).toContain('varian 2');
  }, 30_000);
});
