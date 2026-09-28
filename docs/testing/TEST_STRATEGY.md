# Test Strategy

## Objectives

Testing protects product rules, authorization, historical integrity, realtime synchronization, and deployment confidence.

## Layers

### Unit/domain tests

High priority:

- teacher token expiry and consumption rules;
- Drill 80% mastery/unlock and star independence, including a 7/10 vs 8/10 boundary;
- level lock checks;
- Tryout Monday 00:00 WIB shared-package release, one attempt/package, and IRT-gated result;
- scoring-policy behavior;
- XP policy when OPEN-11 becomes final;
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
6. School Student starts the current weekly Tryout package once; result remains gated until IRT completion.
7. PvP room/join/match flow where practical in automated browser tests.

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
