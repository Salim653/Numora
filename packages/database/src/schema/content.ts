import { relations, sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Content administration schema.
 *
 * DB column naming follows the repo-wide `snake_case` convention; the API layer
 * exposes the same data as `camelCase`. Domain rules (version immutability,
 * video capacity, package publishability, IRT visibility) live in the `content`
 * API module, not in this file.
 *
 * QUESTION: uuid[] question_version_ids on tryout_packages is validated in the
 * API layer; a normalized junction is deferred until package composition rules
 * are finalized.
 */

export const contentStatus = pgEnum('content_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const tryoutPackageStatus = pgEnum('tryout_package_status', ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
export const reportStatus = pgEnum('report_status', ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED']);
export const reportReferenceType = pgEnum('report_reference_type', ['QUESTION', 'VIDEO']);

const contentTimestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const chapters = pgTable(
  'chapters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(1),
    status: contentStatus('status').notNull().default('DRAFT'),
    ...contentTimestamps,
  },
  (table) => [index('chapters_sort_order_idx').on(table.sortOrder)],
);

export const subchapters = pgTable(
  'subchapters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chapterId: uuid('chapter_id')
      .notNull()
      .references(() => chapters.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(1),
    status: contentStatus('status').notNull().default('DRAFT'),
    ...contentTimestamps,
  },
  (table) => [
    index('subchapters_chapter_idx').on(table.chapterId),
    index('subchapters_sort_order_idx').on(table.chapterId, table.sortOrder),
  ],
);

export const levels = pgTable(
  'levels',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subchapterId: uuid('subchapter_id')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(1),
    status: contentStatus('status').notNull().default('DRAFT'),
    ...contentTimestamps,
  },
  (table) => [
    index('levels_subchapter_idx').on(table.subchapterId),
    index('levels_sort_order_idx').on(table.subchapterId, table.sortOrder),
  ],
);

export const relatedVideos = pgTable(
  'related_videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subchapterId: uuid('subchapter_id')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull(),
    ...contentTimestamps,
  },
  (table) => [index('related_videos_subchapter_idx').on(table.subchapterId, table.sortOrder)],
);

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    levelId: uuid('level_id')
      .notNull()
      .references(() => levels.id, { onDelete: 'restrict' }),
    code: varchar('code').notNull(),
    type: varchar('type').notNull().default('MULTIPLE_CHOICE'),
    stemLatex: text('stem_latex').notNull(),
    explanationLatex: text('explanation_latex'),
    tags: jsonb('tags').notNull().default(sql`'[]'::jsonb`),
    status: contentStatus('status').notNull().default('DRAFT'),
    ...contentTimestamps,
  },
  (table) => [
    uniqueIndex('questions_code_uq').on(table.code),
    index('questions_level_idx').on(table.levelId),
  ],
);

export const questionVersions = pgTable(
  'question_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    choices: jsonb('choices').notNull(),
    rationale: text('rationale'),
    contentSnapshot: jsonb('content_snapshot').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...contentTimestamps,
  },
  (table) => [
    uniqueIndex('question_versions_question_version_uq').on(table.questionId, table.versionNumber),
    index('question_versions_published_idx').on(table.publishedAt),
  ],
);

export const tryoutPackages = pgTable(
  'tryout_packages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    code: varchar('code').notNull(),
    status: tryoutPackageStatus('status').notNull().default('DRAFT'),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    questionVersionIds: uuid('question_version_ids')
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    ...contentTimestamps,
  },
  (table) => [
    uniqueIndex('tryout_packages_code_uq').on(table.code),
    index('tryout_packages_status_idx').on(table.status),
  ],
);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reporterId: text('reporter_id').notNull(),
    referenceType: reportReferenceType('reference_type').notNull(),
    referenceId: uuid('reference_id').notNull(),
    message: text('message'),
    status: reportStatus('status').notNull().default('OPEN'),
    adminNote: text('admin_note'),
    ...contentTimestamps,
  },
  (table) => [
    index('reports_status_idx').on(table.status),
    index('reports_reference_idx').on(table.referenceType, table.referenceId),
  ],
);

export const irtAggregates = pgTable(
  'irt_aggregates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    questionVersionId: uuid('question_version_id')
      .notNull()
      .unique()
      .references(() => questionVersions.id, { onDelete: 'cascade' }),
    responseCount: integer('response_count').notNull().default(0),
    correctCount: integer('correct_count').notNull().default(0),
    difficulty: real('difficulty'),
    discrimination: real('discrimination'),
    ...contentTimestamps,
  },
  (table) => [index('irt_aggregates_question_version_idx').on(table.questionVersionId)],
);

export const chaptersRelations = relations(chapters, ({ many }) => ({
  subchapters: many(subchapters),
}));

export const subchaptersRelations = relations(subchapters, ({ one, many }) => ({
  chapter: one(chapters, { fields: [subchapters.chapterId], references: [chapters.id] }),
  levels: many(levels),
  videos: many(relatedVideos),
}));

export const levelsRelations = relations(levels, ({ one }) => ({
  subchapter: one(subchapters, { fields: [levels.subchapterId], references: [subchapters.id] }),
}));

export const relatedVideosRelations = relations(relatedVideos, ({ one }) => ({
  subchapter: one(subchapters, { fields: [relatedVideos.subchapterId], references: [subchapters.id] }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  level: one(levels, { fields: [questions.levelId], references: [levels.id] }),
  versions: many(questionVersions),
}));

export const questionVersionsRelations = relations(questionVersions, ({ one }) => ({
  question: one(questions, { fields: [questionVersions.questionId], references: [questions.id] }),
}));
