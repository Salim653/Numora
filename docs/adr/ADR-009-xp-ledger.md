# ADR-009 — Immutable XP ledger with derived leaderboard projections

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

PRD adds XP sources, hourly leaderboards, weekly archive, duplicate-protection, and separate class/PvP semantics.

## Decision

Record XP source entries immutably and build leaderboard projections/periods from durable sources. Redis may cache projections.

## Consequences

Supports audit/rebuild/archive and prevents `totalXp` from being the only truth. Requires projection jobs/indexing.

## Alternatives considered

Only storing aggregate XP or Redis sorted sets as primary truth was rejected.
