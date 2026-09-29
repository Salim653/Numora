import { eq } from 'drizzle-orm';
import { getDatabase } from './client.js';
import {
  chapters,
  subchapters,
  levels,
  questions,
  questionVersions,
  questionVariants,
  drillPackages,
  drillPackageQuestions,
} from './schema/index.js';

const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;
const chapterId = uuid(100);
const subchapterId = uuid(101);
const levelOneId = uuid(102);
const levelTwoId = uuid(103);

// DEMO fixtures only. Curriculum must review every stem, key, and explanation before a school trial.
export async function seedDemoLearning() {
  const { db } = getDatabase();
  await db
    .insert(chapters)
    .values({ id: chapterId, title: 'Bab Demo: Bilangan', sortOrder: 1, publishedAt: new Date() })
    .onConflictDoNothing();
  await db
    .insert(subchapters)
    .values({
      id: subchapterId,
      chapterId,
      title: 'Subbab Demo: Operasi Bilangan',
      sortOrder: 1,
      publishedAt: new Date(),
    })
    .onConflictDoNothing();
  await db
    .insert(levels)
    .values([
      {
        id: levelOneId,
        subchapterId,
        title: 'Level 1 Demo',
        sortOrder: 1,
        publishedAt: new Date(),
      },
      {
        id: levelTwoId,
        subchapterId,
        title: 'Level 2 Demo',
        sortOrder: 2,
        publishedAt: new Date(),
      },
    ])
    .onConflictDoNothing();

  for (let i = 1; i <= 10; i++) {
    const questionId = uuid(200 + i);
    const versionId = uuid(300 + i);
    await db
      .insert(questions)
      .values({
        id: questionId,
        levelId: levelOneId,
        code: `DEMO-L1-${String(i).padStart(2, '0')}`,
      })
      .onConflictDoNothing();
    await db
      .insert(questionVersions)
      .values({ id: versionId, questionId, version: 1 })
      .onConflictDoNothing();
    for (let set = 1; set <= 2; set++) {
      const left = i + set;
      const right = set + 2;
      const answer = left + right;
      const optionValues = [answer - 2, answer, answer + 1, answer + 2];
      await db
        .insert(questionVariants)
        .values({
          id: uuid(400 + (i - 1) * 2 + set),
          questionVersionId: versionId,
          variantNo: set,
          stem: `Berapakah hasil $${left}+${right}$?`,
          options: optionValues.map((value, index) => ({
            id: 'ABCD'[index]!,
            text: String(value),
          })),
          correctOptionId: 'B',
          explanation: `$${left}+${right}=${answer}$, sehingga jawaban yang benar adalah B.`,
          isDemo: true,
        })
        .onConflictDoNothing();
    }
  }

  for (let set = 1; set <= 2; set++) {
    const packageId = uuid(500 + set);
    await db
      .insert(drillPackages)
      .values({
        id: packageId,
        levelId: levelOneId,
        variantSet: set,
        isDemo: true,
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
    for (let i = 1; i <= 10; i++) {
      await db
        .insert(drillPackageQuestions)
        .values({
          id: uuid(600 + set * 20 + i),
          packageId,
          questionVariantId: uuid(400 + (i - 1) * 2 + set),
          sortOrder: i,
        })
        .onConflictDoNothing();
    }
  }

  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.id, chapterId))
    .limit(1);
  if (!chapter) throw new Error('Demo learning seed failed.');
}
