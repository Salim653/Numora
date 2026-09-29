import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { schools, users } from './identity.js';

export const classes = pgTable(
  'classes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    schoolId: uuid('school_id')
      .notNull()
      .references(() => schools.id, { onDelete: 'restrict' }),
    teacherUserId: uuid('teacher_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    joinCode: text('join_code').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('classes_join_code_uq').on(table.joinCode),
    index('classes_teacher_idx').on(table.teacherUserId),
    index('classes_school_idx').on(table.schoolId),
  ],
).enableRLS();

export const classMemberships = pgTable(
  'class_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'restrict' }),
    studentUserId: uuid('student_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    leftAt: timestamp('left_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('class_memberships_active_student_uq')
      .on(table.studentUserId)
      .where(sql`${table.leftAt} is null`),
    index('class_memberships_class_idx').on(table.classId),
  ],
).enableRLS();
