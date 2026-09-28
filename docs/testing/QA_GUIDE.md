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

## High-risk scenarios

### School verification

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
- prototype Teacher UI creates a Class and shows progress for its joined Student after Drill submission.

### Drill

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
