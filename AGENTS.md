# AGENTS.md — Engineering Instructions for Human and AI Contributors

## Purpose

This file is the default engineering context for contributors and AI coding agents working on the TKA Mathematics SMP platform.

The project is a responsive school-based learning platform for Grade IX SMP/MTs students preparing for TKA Mathematics. It includes school/teacher verification, classes, pretest, drill, tryout, progress, feedback, content administration, reports, leaderboards, realtime PvP, video recommendations, analytics, and IRT.

## Mandatory reading order

Before implementing a feature, read:

1. `docs/product/PRODUCT_CONTEXT.md`
2. `docs/product/OPEN_DECISIONS.md`
3. `docs/product/PRD_MAPPING.md`
4. Relevant architecture/API/data document
5. Relevant ADRs
6. Existing tests and contracts for the module

## Source-of-truth precedence

1. Latest approved PRD — product behavior and acceptance criteria.
2. Approved ADR — technical decision only.
3. Approved module specification.
4. Machine-readable contract.
5. Database schema/migrations.
6. Code.

Never invent an answer for an OPEN item. Implement extensibility around it or use explicitly labeled demo/test fixtures.

## Requirement labels

When adding or changing documentation, distinguish:

- **PRD RULE** — directly required by PRD v0.4.
- **ENGINEERING DECISION** — approved technical decision from team alignment/ADR.
- **PROPOSED** — recommendation awaiting approval.
- **OPEN** — unresolved product/academic decision.

Do not present a proposal as a PRD rule.

## Architectural constraints

- Frontend must not query product/business data directly from PostgreSQL/Supabase Data API.
- Supabase in the browser is limited to authentication-related needs unless a new ADR explicitly approves otherwise.
- NestJS is authoritative for authorization, assessment lifecycle, scoring, progress, XP, PvP, and other domain rules.
- PostgreSQL is the durable source of truth.
- Redis is cache/ephemeral/queue infrastructure. Restarting Redis must not erase durable business truth.
- PvP time, answer validity, transition, and score are server-authoritative.
- Historical assessment results must not be recalculated after question/scoring revisions.
- Attempts must reference the content/scoring versions actually used.
- Business time rules such as tryout daily eligibility and leaderboard reset use `Asia/Jakarta`; durable timestamps are stored in UTC.
- Sensitive state-changing operations must be idempotent or protected by equivalent database constraints/transactions.

## Product invariants from PRD v0.4

- Students and Teachers authenticate with Google.
- Teacher features require valid school verification through a single-use token valid for 3×24 hours.
- A Student belongs to at most one class in the current version.
- Student without a class cannot start pretest, drill, tryout, or PvP.
- Pretest is optional and at most once per chapter; final placement rules remain OPEN.
- Drill baseline: 10 questions, count-up timer, 70% mastery threshold, unlimited retry, a different equivalent variant on subsequent attempt, explanation access for 90 days.
- Tryout: at most one start per local calendar day (reset 00:00 WIB); final official configuration remains OPEN-05; MVP scoring focuses on single-answer multiple choice while PGK scoring remains OPEN-04.
- Class leaderboard uses Drill + Tryout XP. PvP XP does not contribute.
- Leaderboards update hourly and reset/archive Wednesday 23:59 WIB.
- PvP uses realtime WebSocket, 10 questions, server-authoritative scoring, and a 20-second reconnect window.
- IRT runs as a daily batch and PRD baseline requires at least 30 responses before showing the result.
- Admin cannot modify MVP product parameters such as mastery threshold, tryout limit, XP formula, or leaderboard reset in the UI.

## Known PRD ambiguities that must not be guessed

- Drill is described as an unlimited count-up timer, while some wording still refers to timeout/timer completion. Treat product timeout semantics as clarification pending; do not introduce a hidden timeout.
- Tryout prose contains older wording about unlimited retry, while the v0.4 change summary, bullets, and acceptance criteria specify one start per day. Implement daily eligibility and record the text inconsistency in product decisions.
- Formula XP is OPEN-11.
- PGK scoring is OPEN-04.
- Pretest amount/duration/placement are OPEN-01 through OPEN-03.
- Official tryout configuration is OPEN-05.

## Coding rules

- TypeScript strict mode.
- DB identifiers: `snake_case`; TypeScript/API JSON: `camelCase`.
- External identifiers use UUID unless an ADR says otherwise.
- API base path: `/api/v1`.
- API errors follow `application/problem+json` conventions.
- Use OpenAPI-generated/shared types where an API contract exists; do not create duplicate handwritten API response types without reason.
- Do not put business rules in React components.
- Do not allow Controllers to contain complex domain logic; use domain/application services.
- Validate untrusted inputs at API/WebSocket boundaries.
- Do not expose stack traces, secrets, auth tokens, verification tokens, or unnecessary student PII in logs.
- Prefer explicit state machines for assessments and PvP rather than booleans such as `isDone`.

## Database and migration rules

- Schema changes require migrations committed to Git.
- Do not modify shared/staging/production schema manually via dashboard as the normal workflow.
- Historical content is versioned/archiveable, not destructively overwritten.
- XP is recorded in an immutable ledger with unique source semantics.
- Outbox events are inserted in the same DB transaction as the business mutation they represent.
- Single-use teacher tokens must be consumed transactionally and stored as secure hashes rather than reusable plaintext where feasible.

## Testing expectations

At minimum, test business-critical rules:

- teacher token expiry and single-use race condition
- one-class-per-student constraint
- locked-level access rejection
- drill 70% unlock logic
- duplicate submit/idempotency
- tryout one-start-per-WIB-calendar-day
- historical content/scoring version preservation
- class vs PvP leaderboard separation
- PvP scoring/timer/reconnect/forfeit
- authorization across teacher-owned classes

Critical flows require E2E coverage before release.

## Definition of Ready

Do not start final behavior for a feature unless its user story, acceptance criteria, authorization, persistence impact, contract, failure states, and relevant OPEN dependencies are known. Generic infrastructure can proceed around unresolved product policies.

## Definition of Done

A feature is not done until:

- acceptance criteria pass
- code is reviewed
- lint/typecheck/build pass
- migrations are included if needed
- API/contract is updated if needed
- tests cover critical behavior
- authorization is tested
- loading/error/empty/access-denied states are handled where applicable
- docs are updated
- no secrets are committed
- QA can verify the flow

## Change discipline

When requirements change:

1. Update PRD/module spec first or record the approved decision.
2. Update `OPEN_DECISIONS.md` and `PRD_MAPPING.md`.
3. Update ADR only if the technical architecture changes.
4. Update contracts/schema/migrations.
5. Update implementation and tests.

Never silently change a product rule only in code.
