# ADR-007 — Transactional outbox for domain events

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

Analytics/event processing must not lose events when a business transaction commits but a downstream publish fails.

## Decision

Insert outbox records in the same PostgreSQL transaction as the business mutation, then process asynchronously with worker retries.

## Consequences

Provides reliable at-least-once event handoff and clear event IDs. Consumers must be idempotent and outbox cleanup/monitoring is needed.

## Alternatives considered

Direct fire-and-forget event publish from request handlers was rejected because of consistency gaps.
