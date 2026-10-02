# Test Strategy

## Objectives

Testing protects product rules, authorization, historical integrity, realtime synchronization, and deployment confidence.

## Layers

### Unit/domain tests

High priority:

- teacher token expiry and consumption rules;
- Drill 80% mastery/unlock and star independence, including a 7/10 vs 8/10 boundary;
- level lock checks;
- TryOut shared package, free Mandiri/School access, 35 PG/PGK MCMA/Category items, countdown/auto-submit, one attempt/package, immutable IRT-gated result ≤3×24h after batch end;
- scoring-policy behavior;
- Drill XP/star thresholds when DRL-OPEN-01/02/03 close; TryOut score-only XP mapping TRY-TBC-03;
- PvP score calculation;
- leaderboard period boundaries.

### Integration tests

Use real PostgreSQL/Redis test dependencies where valuable:

- teacher token race: two simultaneous consumes produce one success;
- one Student cannot join two Classes;
- assessment submit idempotency;
- finalization writes result/progress/XP/outbox consistently;
- Tryout duplicate start for the same weekly package;
- XP ledger uniqueness;
- question version retained after revision;
- outbox retry behavior.

### API contract tests

- OpenAPI validity/freshness;
- authorization status codes;
- problem-details error shape;
- request validation.

### E2E (Playwright)

Critical flows:

1. Admin creates School and issues teacher token.
2. Teacher authenticates/verifies and creates Class.
3. Student authenticates/joins Class.
4. Student completes Drill and sees result/progress.
5. Teacher views Student progress and sends feedback.
6. Mandiri and School Students start eligible TryOut packages free once; manual/automatic submit yields processing until IRT release, then immutable score/explanation.
7. PvP room/join/match flow where practical in automated browser tests.

For the **first school prototype trial**, the required staging evidence is steps 1–5 through the real Admin, Teacher, and Student UIs: Admin manages School/token, Teacher verifies and creates a Class, Student completes the 10-question demo Drill, and Teacher sees only owned-Class Student level status and latest/best score. Block the trial on login, authorization, answer/result persistence, or 80% scoring/unlock failure. Pretest, Tryout, PvP, leaderboard, feedback, and Mandiri remain later-scope tests. Curriculum review of the demo content and the Product/Design school permission arrangements are separate readiness checks.

### Load tests (k6 before real-user release)

- 100 concurrent baseline;
- 500 concurrent target;
- 1,000 concurrent stress;
- separate WebSocket/PvP connection scenario;
- assessment submit burst scenario;
- leaderboard read scenario.

## Nonfunctional testing

- accessibility checks and keyboard navigation;
- mobile viewports;
- network interruption/retry;
- auth session expiry;
- denied-access states;
- backup restore rehearsal;
- migration rehearsal on staging.

## OPEN items

Tests for OPEN policies should use explicitly named demo policies and must not be mistaken for final product acceptance tests.

## Latest feature acceptance coverage

Use [Drill v1.2 DRL-AC-01–24 and TryOut v1.1 TRY-AC01–25](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md), with scenario mapping in [QA Guide](QA_GUIDE.md). Tests of existing PG fixtures, class-required eligibility, old star ranges or 90-day expiry do not establish final acceptance against these PRDs.

- Domain: Drill <15 minutes versus exactly 15 minutes bonus eligibility, 80 unlock without later relock, completed-level retry, monotonic best score with all attempts retained. Formula tests wait for owners.
- PostgreSQL/API: concurrent manual/auto-submit at deadline, browser absent at expiry, repeated start/re-auth preserving one attempt, released score/model immutability, server-denied premature explanation, all Student affiliations eligible without payment.
- Browser: Pretest info/Skip/all-subchapter Level 1, Drill truthful save states and refresh/exit consequences, failed-only max-three YouTube/report states; TryOut Ongoing/Past/detail/tutorial/rules, all three question controls, countdown no pause, no confirm on auto-submit, processing/delay without partial score.
- IRT/worker: batch end to release ≤3×24h, low-response/error retry under finalized policy, idempotent release/XP, raw submissions preserved, approved TKA scale. No universal sample-size release assumption from the Admin baseline.
- TBC-dependent acceptance: mapping/affiliation/Skip semantics, XP, stars, retention, fallback, duration/scale, past never-attempted access, batch/failure policy and analytics payload must be finalized or use clearly labeled fixture tests only.

The first school trial scope stays Admin → Teacher → School Student → Drill → Teacher progress; the new feature PRDs do not automatically add TryOut/Pretest to that session.
