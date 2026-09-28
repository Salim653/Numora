import { sql } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['STUDENT', 'TEACHER', 'ADMIN']);
export const accountStatus = pgEnum('account_status', ['ACTIVE', 'DISABLED']);
export const schoolStatus = pgEnum('school_status', ['ACTIVE', 'INACTIVE']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    authUserId: uuid('auth_user_id').notNull(),
    role: userRole('role').notNull(),
    displayName: text('display_name').notNull(),
    email: text('email').notNull(),
    status: accountStatus('status').notNull().default('ACTIVE'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('users_auth_user_id_uq').on(table.authUserId),
    uniqueIndex('users_email_uq').on(table.email),
  ],
);

export const schools = pgTable(
  'schools',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    status: schoolStatus('status').notNull().default('ACTIVE'),
    ...timestamps,
  },
  (table) => [uniqueIndex('schools_code_uq').on(table.code)],
);

export const teacherVerificationTokens = pgTable(
  'teacher_verification_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    schoolId: uuid('school_id')
      .notNull()
      .references(() => schools.id, { onDelete: 'restrict' }),
    tokenHash: text('token_hash').notNull(),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    usedByUserId: uuid('used_by_user_id').references(() => users.id, { onDelete: 'restrict' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('teacher_verification_tokens_hash_uq').on(table.tokenHash),
    index('teacher_verification_tokens_school_idx').on(table.schoolId),
  ],
);

export const teacherSchoolMemberships = pgTable(
  'teacher_school_memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    teacherUserId: uuid('teacher_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    schoolId: uuid('school_id')
      .notNull()
      .references(() => schools.id, { onDelete: 'restrict' }),
    verificationTokenId: uuid('verification_token_id')
      .notNull()
      .references(() => teacherVerificationTokens.id, { onDelete: 'restrict' }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('teacher_school_memberships_token_uq').on(table.verificationTokenId),
    uniqueIndex('teacher_school_memberships_active_teacher_uq')
      .on(table.teacherUserId)
      .where(sql`${table.endedAt} is null`),
    index('teacher_school_memberships_school_idx').on(table.schoolId),
  ],
);
