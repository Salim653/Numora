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
- Teacher accesses another Teacher's Class.

### Drill

- locked Level direct API access;
- duplicate submit;
- refresh/resume;
- retry receives another variant;
- 69% vs 70% boundary;
- explanation visibility at 90-day boundary;
- clarification around timeout must not be silently assumed.

### Tryout

- first start in WIB day succeeds;
- second start same WIB day denied;
- 23:59 → 00:00 boundary;
- explanation remains available;
- Tryout does not unlock Drill.

### PvP

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
