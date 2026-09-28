# Database Architecture

**Database:** PostgreSQL  
**ORM/migrations:** Drizzle ORM + Drizzle Kit  
**Durable source of truth:** PostgreSQL

## 1. Naming and identifiers

- DB table/column names: `snake_case`.
- API/TypeScript: `camelCase`.
- Primary identifiers: UUID unless a later ADR approves another strategy.
- Durable timestamps: UTC (`timestamptz`).
- Business-day derivation: explicit `Asia/Jakarta` conversion.

## 2. Core invariants

### Users and classes

- User role cannot be changed by the user after registration.
- A Student has at most one active class membership in the current product version.
- Teacher resource access is limited to Classes they own/manage.
- Teacher product access requires a valid school membership created through token verification.

### Teacher verification token

Recommended table fields:

```text
teacher_verification_tokens
- id
- school_id
- token_hash
- created_by
- created_at
- expires_at
- used_at
- used_by_user_id
- revoked_at
```

Do not rely on a single mutable plaintext `schools.token` value even though the PRD data-minimum table mentions a token field. The behavior requires multiple generated, single-use, expiring credentials.

Token consumption must be atomic, e.g. row lock/conditional update inside one transaction.

### Questions and historical results

Recommended separation:

```text
questions                logical identity
question_versions        immutable/preserved content revision
question_variants        equivalent concrete variant
```

Attempts reference the version/variant they actually received. Editing current content never rewrites historical attempt context.

### Assessment attempts

Conceptual entities:

```text
assessment_attempts
attempt_questions
attempt_answers
scoring_policy_versions
```

Store final result as durable historical facts, including final raw points and normalized score.

### Progress

`level_progress` should represent access/completion independently from attempts. Pretest may unlock a level without marking it completed.

### XP

Use immutable ledger semantics:

```text
xp_ledger
- id
- student_id
- class_id (nullable when source scope differs)
- source_type
- source_id
- xp_amount
- occurred_at
- leaderboard_period_id or derivable period
- idempotency_key / unique source constraint
```

Never implement only `users.total_xp += ...` as the history source.

### Leaderboards

Recommended:

```text
leaderboard_periods
leaderboard_entries   # derived/projection
```

A period becomes archived/closed rather than deleting history. Redis may cache projections; PostgreSQL/ledger remains recoverable source.

### PvP

Persist final match truth:

```text
pvp_rooms
pvp_invites
pvp_players
pvp_question_instances
pvp_answers
pvp_results
```

Redis may hold active transient match state but completed outcome must be persisted.

### Reports and support

Keep question reports and video reports traceable to the exact content/video references involved.

### IRT

Recommended result metadata:

```text
irt_results
- id
- question_version_id or approved item identity
- model_version
- sample_size
- difficulty
- discrimination
- guessing
- calculated_at
- status
```

Model-specific optional fields should not be added as product facts before Data/PO resolve OPEN-12.

## 3. Proposed conceptual table groups

### Identity / Organization

- `users`
- `schools`
- `teacher_verification_tokens`
- `teacher_school_memberships`
- `classes`
- `class_memberships`
- `account_restrictions`

### Content

- `chapters`
- `subchapters`
- `competencies`
- `levels`
- `questions`
- `question_versions`
- `question_variants`
- `assessment_packages`
- `assessment_package_questions`
- `learning_videos`

### Assessments / Progress

- `assessment_attempts`
- `attempt_questions`
- `attempt_answers`
- `scoring_policy_versions`
- `level_progress`

### Gamification

- `xp_ledger`
- `leaderboard_periods`
- `leaderboard_entries`

### PvP

- `pvp_rooms`
- `pvp_invites`
- `pvp_players`
- `pvp_questions`
- `pvp_answers`
- `pvp_results`

### Learning support

- `feedback`
- `question_reports`
- `video_reports`

### Analytics / Operations

- `analytics_outbox`
- `irt_results`
- `audit_logs`
- optional processed-event/integration tables as needed

## 4. Tryout daily eligibility

The product rule is one Tryout start per local calendar day, reset at 00:00 WIB based on start date.

Recommended persistence technique:

- compute `business_start_date` in `Asia/Jakarta` at successful Tryout creation;
- enforce one eligible Tryout start per Student per business date with transaction/unique constraint semantics;
- do not implement “24 hours since last attempt.”

This allows 23:58 and 00:01 attempts on adjacent WIB dates, as the product rule implies.

## 5. Idempotency and uniqueness examples

Use DB constraints in addition to application idempotency where possible:

- one active class membership per Student;
- token can transition unused → used once;
- one final result per attempt;
- one XP ledger contribution per unique source event;
- one Tryout start per Student/business date;
- one answer per PvP player/question state where product requires single submission.

## 6. Deletion and archival

Do not hard-delete historical learning truth during normal operations:

- question versions;
- attempts/results;
- XP ledger;
- leaderboard history;
- completed PvP;
- audit logs.

Use status/archive/revocation patterns according to domain.

Account hard deletion/data-subject handling requires an approved privacy/retention process before real-user release.

## 7. Migrations

Normal workflow:

```text
change Drizzle schema
→ generate migration
→ commit migration in PR
→ CI checks
→ reviewed apply
```

Do not use manual dashboard edits as the canonical shared schema workflow.

## 8. Transactions that should be treated as critical

- teacher token consumption + membership creation;
- class join + one-class validation;
- assessment finalization + final score + progress + XP + outbox;
- PvP finalization + result + XP/best-record source + outbox;
- leaderboard period close/archive metadata;
- content publish/version transition where audit is required.
