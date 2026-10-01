import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import {
  analyticsOutbox,
  assessmentAttempts,
  assessmentPackages,
  chapters,
  classMemberships,
  classes,
  closeDatabaseConnection,
  competencies,
  getDatabase,
  irtBatches,
  irtItemResults,
  packageItems,
  questions,
  questionVariants,
  questionVersions,
  schools,
  scoringPolicyVersions,
  subchapters,
  users,
} from '@tka/database';
import { IdentityService } from '../identity/identity.service';
import { AssessmentHistoryService } from './assessment-history.service';
import { TryoutReleaseService } from './tryout-release.service';
import { TryoutService } from './tryout.service';

const testUrl = process.env.TEST_DATABASE_URL;
const integration = testUrl ? describe : describe.skip;

function currentMondayWib() {
  const local = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  local.setUTCDate(local.getUTCDate() - daysSinceMonday);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - 7 * 60 * 60 * 1000);
}

integration('Tryout lifecycle against PostgreSQL', () => {
  afterAll(async () => closeDatabaseConnection());

  it('keeps one shared attempt and hides results until complete released IRT data', async () => {
    process.env.DATABASE_URL = testUrl;
    const { db } = getDatabase();
    const suffix = randomUUID().slice(0, 8);
    const [student, independent, teacher] = await db.insert(users).values([
      { authUserId: randomUUID(), role: 'STUDENT', displayName: 'Class Student', email: `tryout-student-${suffix}@example.test` },
      { authUserId: randomUUID(), role: 'STUDENT', displayName: 'Independent', email: `tryout-independent-${suffix}@example.test` },
      { authUserId: randomUUID(), role: 'TEACHER', displayName: 'Teacher', email: `tryout-teacher-${suffix}@example.test` },
    ]).returning({ id: users.id });
    const identity = { me: async (authorization?: string) => ({
      id: authorization === 'independent' ? independent!.id : student!.id,
      role: 'STUDENT',
    }) } as unknown as IdentityService;
    const releases = new TryoutReleaseService();
    const tryout = new TryoutService(identity, releases);
    const history = new AssessmentHistoryService(identity, releases);
    const [school] = await db.insert(schools).values({
      code: `TRYOUT-${suffix}`, name: 'Test School',
    }).returning({ id: schools.id });
    const [schoolClass] = await db.insert(classes).values({
      schoolId: school!.id, teacherUserId: teacher!.id,
      name: 'IX Test', joinCode: `TY${suffix}`,
    }).returning({ id: classes.id });
    await db.insert(classMemberships).values({
      classId: schoolClass!.id, studentUserId: student!.id,
    });
    const [chapter] = await db.insert(chapters).values({
      code: `TRYOUT-${suffix}`, name: 'Tryout Chapter',
      displayOrder: parseInt(suffix, 16) % 2_000_000_000, status: 'READY',
    }).returning({ id: chapters.id });
    const [subchapter] = await db.insert(subchapters).values({
      chapterId: chapter!.id, code: `TRYOUT-${suffix}`, name: 'Tryout Subchapter',
      displayOrder: 1, status: 'READY',
    }).returning({ id: subchapters.id });
    const [competency] = await db.insert(competencies).values({
      subchapterId: subchapter!.id, code: `TRYOUT-${suffix}`,
      description: 'Test competency', status: 'READY',
    }).returning({ id: competencies.id });
    const [policy] = await db.insert(scoringPolicyVersions).values({
      policyCode: `TRYOUT_PG_TEST_${suffix}`, version: 1,
      configuration: { fixture: true, questionType: 'SINGLE_CHOICE' }, status: 'PUBLISHED',
    }).returning({ id: scoringPolicyVersions.id });
    const releaseAt = currentMondayWib();
    await db.update(assessmentPackages).set({ status: 'CLOSED' }).where(and(
      eq(assessmentPackages.assessmentType, 'TRYOUT'),
      eq(assessmentPackages.isDemo, true),
      eq(assessmentPackages.status, 'PUBLISHED'),
      eq(assessmentPackages.releaseAt, releaseAt),
    ));
    const [selectedPackage] = await db.insert(assessmentPackages).values({
      familyCode: `TRYOUT-TEST-${suffix}`, packageVersion: 1,
      name: 'Tryout Test Fixture', assessmentType: 'TRYOUT',
      chapterId: chapter!.id, releaseAt, status: 'PUBLISHED',
      durationSeconds: 3600, scoringPolicyVersionId: policy!.id, isDemo: true,
    }).returning({ id: assessmentPackages.id });
    await expect(db.insert(assessmentPackages).values({
      familyCode: `TRYOUT-DUPLICATE-${suffix}`, packageVersion: 1,
      name: 'Duplicate Test Fixture', assessmentType: 'TRYOUT',
      releaseAt, status: 'PUBLISHED',
      scoringPolicyVersionId: policy!.id, isDemo: true,
    })).rejects.toMatchObject({ cause: { code: '23505' } });
    const versionIds: string[] = [];
    for (let index = 1; index <= 2; index++) {
      const [question] = await db.insert(questions).values({
        primaryCompetencyId: competency!.id, status: 'READY',
      }).returning({ id: questions.id });
      const [variant] = await db.insert(questionVariants).values({
        questionId: question!.id, variantCode: `TRYOUT-${suffix}-${index}`,
        kind: 'ORIGINAL', origin: 'TEST',
      }).returning({ id: questionVariants.id });
      const [version] = await db.insert(questionVersions).values({
        variantId: variant!.id, versionNumber: 1, questionType: 'SINGLE_CHOICE',
        stem: { text: `Test question ${index}` },
        optionsOrStatements: ['A', 'B', 'C'].map((id) => ({ id, content: { text: id } })),
        answerKey: { optionId: 'A' }, explanation: { text: 'A is correct.' },
        difficulty: 'EASY', contentStatus: 'READY',
        reviewedByUserId: teacher!.id, reviewedAt: new Date(),
      }).returning({ id: questionVersions.id });
      versionIds.push(version!.id);
      await db.insert(packageItems).values({
        packageId: selectedPackage!.id, questionVersionId: version!.id,
        displayOrder: index, maxPoints: '1',
      });
    }
    expect(await tryout.current('independent')).toMatchObject({ eligible: false });
    await expect(tryout.start('independent', selectedPackage!.id))
      .rejects.toMatchObject({ status: 403 });
    expect(await tryout.current('student')).toMatchObject({
      id: selectedPackage!.id, state: 'open', eligible: true, questionCount: 2,
    });
    const [a, b] = await Promise.all([
      tryout.start('student', selectedPackage!.id),
      tryout.start('student', selectedPackage!.id),
    ]);
    expect(a.id).toBe(b.id);
    expect(a.questions).toHaveLength(2);
    expect(a.questions[0]).not.toHaveProperty('correctOptionId');
    await tryout.saveAnswer('student', a.id, a.questions[0]!.questionInstanceId, 'A');
    expect((await tryout.attempt('student', a.id)).questions[0]?.selectedOptionId).toBe('A');
    await db.update(assessmentAttempts).set({ deadlineAt: new Date(Date.now() - 1) })
      .where(eq(assessmentAttempts.id, a.id));
    await expect(tryout.saveAnswer('student', a.id, a.questions[0]!.questionInstanceId, 'B'))
      .rejects.toMatchObject({ status: 409, response: { code: 'TRYOUT_DEADLINE_PASSED' } });
    const [firstSubmit, duplicateSubmit] = await Promise.all([
      tryout.submit('student', a.id), tryout.submit('student', a.id),
    ]);
    expect(firstSubmit).toEqual({ state: 'waitingIrt' });
    expect(duplicateSubmit).toEqual(firstSubmit);
    const [stored] = await db.select().from(assessmentAttempts)
      .where(eq(assessmentAttempts.id, a.id));
    expect(stored).toMatchObject({
      status: 'GRADED', score0To100: '50.00', classIdAtStart: schoolClass!.id,
    });
    expect(await db.select().from(analyticsOutbox).where(and(
      eq(analyticsOutbox.entityId, a.id), eq(analyticsOutbox.eventName, 'tryout_completed'),
    ))).toHaveLength(1);
    await expect(tryout.result('student', a.id))
      .rejects.toMatchObject({ status: 409, response: { code: 'TRYOUT_RESULT_PENDING' } });
    expect((await history.list('student')).records[0]).toMatchObject({
      attemptId: a.id, resultState: 'waitingIrt', score: null,
    });
    const [batch] = await db.insert(irtBatches).values({
      packageId: selectedPackage!.id, batchKind: 'TEST', modelVersion: 'fixture',
      status: 'SUCCEEDED', finishedAt: new Date(), resultReleasedAt: new Date(),
    }).returning({ id: irtBatches.id });
    await db.insert(irtItemResults).values(versionIds.map((versionId, index) => ({
      batchId: batch!.id, questionVersionId: versionId,
      sampleSize: index === 0 ? 30 : 29,
      dataStatus: index === 0 ? 'SUFFICIENT' : 'INSUFFICIENT',
    })));
    await expect(tryout.result('student', a.id)).rejects.toMatchObject({ status: 409 });
    await db.update(irtItemResults).set({ sampleSize: 30, dataStatus: 'SUFFICIENT' })
      .where(eq(irtItemResults.questionVersionId, versionIds[1]!));
    expect(await tryout.result('student', a.id)).toMatchObject({
      score: 50, correctCount: 1, questionCount: 2,
    });
    expect((await history.list('student')).records[0]).toMatchObject({
      attemptId: a.id, resultState: 'ready', score: 50,
    });
    await expect(tryout.result('independent', a.id)).rejects.toMatchObject({ status: 404 });
  }, 40_000);
});
