# ADR-008 — Versioned question and historical assessment context

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

PRD requires revisions not to recalculate/change past results and old results to display the content context actually used.

## Decision

Separate logical Question from Question Version/Variant. Attempts reference immutable/preserved versions and scoring-policy version.

## Consequences

Historical integrity is maintained and AI/content corrections can proceed safely. Storage/model becomes more explicit.

## Alternatives considered

In-place mutation of published questions was rejected.
