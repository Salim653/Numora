import { sql } from 'drizzle-orm';
import { boolean, check, foreignKey, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { levels, questionVariants, questionVersions } from './content.js';
import { users } from './identity.js';

export const drillAttemptStatus = pgEnum('drill_attempt_status', ['IN_PROGRESS', 'COMPLETED']);
export type ChoiceOption = { id: string; text: string };

export const drillPackages = pgTable(
  'drill_packages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    levelId: uuid('level_id')
      .notNull()
      .references(() => levels.id, { onDelete: 'restrict' }),
    variantSet: integer('variant_set').notNull(),
    isDemo: boolean('is_demo').notNull().default(true),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => [uniqueIndex('drill_packages_level_set_uq').on(t.levelId, t.variantSet)],
).enableRLS();
export const drillPackageQuestions = pgTable(
  'drill_package_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    packageId: uuid('package_id')
      .notNull()
      .references(() => drillPackages.id, { onDelete: 'restrict' }),
    questionVariantId: uuid('question_variant_id')
      .notNull()
      .references(() => questionVariants.id, { onDelete: 'restrict' }),
    questionVersionId: uuid('question_version_id')
      .notNull()
      .references(() => questionVersions.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [
    uniqueIndex('drill_package_questions_order_uq').on(t.packageId, t.sortOrder),
    foreignKey({
      name: 'drill_package_questions_variant_version_fk',
      columns: [t.questionVersionId, t.questionVariantId],
      foreignColumns: [questionVersions.id, questionVersions.variantId],
    }).onDelete('restrict'),
  ],
).enableRLS();

export const drillAttempts = pgTable(
  'drill_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    levelId: uuid('level_id')
      .notNull()
      .references(() => levels.id, { onDelete: 'restrict' }),
    packageId: uuid('package_id')
      .notNull()
      .references(() => drillPackages.id, { onDelete: 'restrict' }),
    status: drillAttemptStatus('status').notNull().default('IN_PROGRESS'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    score: integer('score'),
    rawPoints: integer('raw_points'),
    correctCount: integer('correct_count'),
    questionCount: integer('question_count'),
    mastered: boolean('mastered'),
    stars: integer('stars'),
    unlockedLevelId: uuid('unlocked_level_id').references(() => levels.id, {
      onDelete: 'restrict',
    }),
    isDemo: boolean('is_demo').notNull().default(true),
    scoringPolicyVersion: text('scoring_policy_version').notNull().default('DRILL_PG_DEMO_V1'),
  },
  (t) => [
    uniqueIndex('drill_attempts_one_active_uq')
      .on(t.studentId, t.levelId)
      .where(sql`${t.status} = 'IN_PROGRESS'`),
    index('drill_attempts_student_level_idx').on(t.studentId, t.levelId),
    check('drill_attempts_score_range', sql`${t.score} is null or (${t.score} between 0 and 100)`),
  ],
).enableRLS();

export const drillAttemptQuestions = pgTable(
  'drill_attempt_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => drillAttempts.id, { onDelete: 'restrict' }),
    questionVariantId: uuid('question_variant_id')
      .notNull()
      .references(() => questionVariants.id, { onDelete: 'restrict' }),
    questionVersionId: uuid('question_version_id')
      .notNull()
      .references(() => questionVersions.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').notNull(),
    stem: text('stem').notNull(),
    options: jsonb('options').$type<ChoiceOption[]>().notNull(),
    correctOptionId: text('correct_option_id').notNull(),
    explanation: text('explanation').notNull(),
    selectedOptionId: text('selected_option_id'),
  },
  (t) => [
    uniqueIndex('drill_attempt_questions_order_uq').on(t.attemptId, t.sortOrder),
    foreignKey({
      name: 'drill_attempt_questions_variant_version_fk',
      columns: [t.questionVersionId, t.questionVariantId],
      foreignColumns: [questionVersions.id, questionVersions.variantId],
    }).onDelete('restrict'),
  ],
).enableRLS();
