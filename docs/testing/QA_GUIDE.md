# QA Guide

## QA should join before implementation ends

QA reviews:

- acceptance criteria;
- edge cases;
- state transitions;
- authorization boundaries;
- OPEN-item assumptions;
- test data needs.

## Required UI states

For main flows verify:

- loading;
- empty;
- validation error;
- system/dependency error;
- success;
- session ended where applicable;
- access denied/locked.

For the first school trial, a simple mock UI is accepted while UI/UX designs are pending. QA still checks the connected task flow, readable text, form labels, keyboard navigation, and status cues that do not rely only on color.

## High-risk scenarios

The six-actor Cloud Development fixture and live Google flow are described in [QA_SEED.md](QA_SEED.md). Use new QA identities; retain the existing sandbox data.

### School verification

- prototype Admin UI lists/creates/edits Schools, changes School status, and issues/reissues/revokes tokens before Teacher onboarding;
- Teacher signs in with Google, chooses the School, and enters the token through UI;
- invalid token;
- expired token;
- used token;
- concurrent use;
- successful verification cannot be duplicated.

### Class

- invalid code/link;
- repeated join;
- Student already in another Class;
- Teacher accesses another Teacher's Class;
- prototype Teacher UI creates a Class, opens its Student list, and shows each authorized Student's level status and latest/best Drill score after submission;
- Teacher with several Classes cannot inspect another Teacher's Students or mix Class progress.

### Drill

- 10 seeded Level-1 PG questions each show four options `A`–`D`; simple inline LaTeX renders legibly, and the questions are visibly labeled demo for school trial participants;
- locked Level direct API access;
- duplicate submit;
- refresh/resume;
- retry receives another variant;
- 70% vs 80% boundary for 10-question Drill; only ≥80% unlocks under the v0.5 baseline;
- star ranges do not replace the 80% unlock rule; score 0 display awaits clarification;
- explanation visibility at 90-day boundary;
- clarification around timeout must not be silently assumed.

### Tryout

- one shared package for all Students in the same weekly period;
- second start of the same package denied or resumes existing attempt;
- Sunday 23:59 → Monday 00:00 WIB package boundary and previous-package lock;
- result/explanation hidden until IRT batch completes;
- Mandiri access unavailable while payment is deferred;
- Tryout does not unlock Drill.

### PvP

- Mandiri and School Students may match across affiliations; Mandiri cannot send classmate notification invites;
- same question/order both players;
- one/both answer timeout;
- reconnect within 20s;
- reconnect after 20s;
- intentional leave;
- system cancellation;
- forfeit not recorded as leaderboard best;
- client attempts to fake score/time.

### Historical integrity

- revise question after Student completes attempt;
- old result still shows old version and same score.

## Regression focus after PRD updates

Every PRD revision requires impact check against `docs/product/PRD_MAPPING.md` and the affected acceptance suite.
