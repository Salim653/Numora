import { eq } from 'drizzle-orm';
import { getDatabase } from './client.js';
import {
  chapters,
  subchapters,
  levels,
  competencies,
  questions,
  questionVersions,
  questionVariants,
  assessmentPackages,
  packageItems,
  scoringPolicyVersions,
} from './schema/index.js';

const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;
const chapterId = uuid(100);
const subchapterId = uuid(101);
const levelOneId = uuid(102);
const levelTwoId = uuid(103);
const competencyId = uuid(104);

// DEMO fixtures only. Curriculum must review every stem, key, and explanation before a school trial.
//
// The two levels deliberately differ. Previously only level 1 had packages, so level 2 was
// created and then unreachable: the 80% unlock moved the student forward into an empty level.
// Both levels are seeded, each with two variants, because drill requires a different equivalent
// variant on every retry after the first attempt.
const levelsForDemo = [
  { id: levelOneId, levelNumber: 1, tag: 'L1' },
  { id: levelTwoId, levelNumber: 2, tag: 'L2' },
] as const;

// Offsets keep every level's question, variant, version, package, and package-item UUID distinct.
const levelOffsets = { L1: 0, L2: 1000 } as const;

// DEMO fixtures only. Curriculum must review every stem, key, and explanation before a school trial.
export async function seedDemoLearning(db: Pick<ReturnType<typeof getDatabase>['db'], 'insert' | 'select'> = getDatabase().db) {
  await db
    .insert(chapters)
    .values({ id: chapterId, code: 'DEMO-BILANGAN', name: 'Bab Demo: Bilangan', displayOrder: 1, status: 'READY' })
    .onConflictDoNothing();
  await db
    .insert(subchapters)
    .values({
      id: subchapterId,
      chapterId,
      code: 'DEMO-OPERASI',
      name: 'Subbab Demo: Operasi Bilangan',
      displayOrder: 1,
      status: 'READY',
    })
    .onConflictDoNothing();
  await db
    .insert(levels)
    .values([
      {
        id: levelOneId,
        subchapterId,
        description: 'Level 1 Demo',
        levelNumber: 1,
        status: 'READY',
      },
      {
        id: levelTwoId,
        subchapterId,
        description: 'Level 2 Demo',
        levelNumber: 2,
        status: 'READY',
      },
    ])
    .onConflictDoNothing();

  await db.insert(competencies).values({ id: competencyId, subchapterId, code: 'DEMO-OPERASI', description: 'Operasi bilangan dasar', status: 'READY' }).onConflictDoNothing();

  const policyId = uuid(901);
  await db.insert(scoringPolicyVersions).values({
    id: policyId,
    policyCode: 'DRILL_PG_DEMO',
    version: 1,
    configuration: {
      questionType: 'SINGLE_CHOICE',
      questionCount: 10,
      masteryThreshold: 80,
      stars: {
        one: { minExclusive: 0, maxInclusive: 50 },
        two: { minExclusive: 50, maxInclusive: 90 },
        three: { minExclusive: 90, maxInclusive: 100 },
      },
    },
    effectiveAt: new Date(),
    status: 'PUBLISHED',
  }).onConflictDoNothing();
  const [policy] = await db.select({ id: scoringPolicyVersions.id })
    .from(scoringPolicyVersions)
    .where(eq(scoringPolicyVersions.policyCode, 'DRILL_PG_DEMO'))
    .limit(1);
  if (!policy) throw new Error('Demo Drill scoring policy is missing.');

  for (const level of levelsForDemo) {
    const offset = levelOffsets[level.tag];
    for (let i = 1; i <= 10; i++) {
      const left = i + 1;
      const right = 3;
      const answer = left + right;
      // Rotate the correct option across A-D. Pinning every key to B made the correct
      // answer guessable from the option layout alone.
      const correctKey = 'ABCD'[(i - 1) % 4]!;
      const distractorValues = [answer - 2, answer - 1, answer + 1, answer + 2];
      const optionValues = ['A', 'B', 'C', 'D'].map((key) =>
        key === correctKey ? answer : distractorValues.shift()!);
      const questionId = uuid(200 + offset + i);
      await db
        .insert(questions)
        .values({
          id: questionId,
          primaryCompetencyId: competencyId,
          sourceRef: `DEMO-${level.tag}-${String(i).padStart(2, '0')}`,
          status: 'READY',
        })
        .onConflictDoNothing();
      for (let set = 1; set <= 2; set++) {
        const variantId = uuid(400 + offset + (i - 1) * 2 + set);
        await db
          .insert(questionVariants)
          .values({
            id: variantId,
            questionId,
            originalVariantId: set === 1 ? null : uuid(400 + offset + (i - 1) * 2 + 1),
            variantCode: `DEMO-${level.tag}-${i}-V${set}`,
            kind: set === 1 ? 'ORIGINAL' : 'VARIANT',
            origin: 'DEMO',
          })
          .onConflictDoNothing();
        await db.insert(questionVersions).values({
          id: uuid(300 + offset + (i - 1) * 2 + set),
          variantId,
          versionNumber: 1,
          questionType: 'SINGLE_CHOICE',
          stem: { text: `Berapakah hasil $${left}+${right}$?` },
          optionsOrStatements: optionValues.map((value, index) => ({ id: 'ABCD'[index]!, content: { text: String(value) } })),
          answerKey: { optionId: correctKey },
          explanation: { text: `$${left}+${right}=${answer}$, sehingga jawaban yang benar adalah ${correctKey}.` },
          difficulty: 'EASY',
        }).onConflictDoNothing();
      }
    }

    for (let set = 1; set <= 2; set++) {
      const packageId = uuid(500 + offset + set);
      await db
        .insert(assessmentPackages)
        .values({
          id: packageId,
          familyCode: `DEMO-DRILL-${level.tag}-V${set}`,
          packageVersion: 1,
          name: `Drill Level ${level.levelNumber} Demo - Varian ${set}`,
          assessmentType: 'DRILL',
          chapterId,
          levelId: level.id,
          variantIndex: set,
          isDemo: true,
          scoringPolicyVersionId: policy.id,
          releaseAt: new Date(),
          status: 'PUBLISHED',
        })
        .onConflictDoNothing();
      for (let i = 1; i <= 10; i++) {
        await db
          .insert(packageItems)
          .values({
            id: uuid(600 + offset + set * 20 + i),
            packageId,
            questionVersionId: uuid(300 + offset + (i - 1) * 2 + set),
            displayOrder: i,
            maxPoints: '1',
          })
          .onConflictDoNothing();
      }
    }
  }

  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .limit(1);
  if (!chapter) throw new Error('Demo learning seed failed.');
}
