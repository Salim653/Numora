# Idempotency and Duplicate Protection

PRD v0.4 requires refresh/retry behavior to avoid duplicate attempts, points, and PvP answers.

## Operations requiring duplicate protection

At minimum:

- class join;
- teacher token consumption;
- start/restore assessment where refresh must not create a new attempt;
- assessment submit;
- XP ledger contribution;
- Tryout daily start;
- PvP answer submission;
- PvP finalization;
- background outbox processing;
- leaderboard archive/period close.

## Defense layers

Use a combination of:

1. explicit request idempotency key where appropriate;
2. unique database constraints;
3. row locking/conditional state transitions;
4. transaction boundaries;
5. worker job deduplication/idempotent handlers.

## Example — assessment submit

Unsafe:

```text
POST submit
→ insert result
→ increment XP
```

called twice can double count.

Safer:

```text
transaction
  lock attempt
  require state IN_PROGRESS/SUBMITTED as allowed
  if already COMPLETED: return existing result
  finalize one result
  insert XP with unique source id
  insert outbox event with unique event id
commit
```

## Example — teacher token

Atomically ensure token is:

- correct;
- not expired;
- not used;
- not revoked;

then mark used and create Teacher-school membership in the same transaction.

## Example — Tryout daily start

Do not rely only on frontend button disabling. Enforce unique eligible start by Student + WIB business date.

## Worker handlers

Assume at-least-once delivery. A retried job/event must not corrupt state or duplicate ledger entries.
