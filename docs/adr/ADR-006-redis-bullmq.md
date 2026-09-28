# ADR-006 — Redis + BullMQ for cache, ephemeral state and async jobs

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

The system needs cache, background work, scheduled jobs, rate limits, and transient PvP state.

## Decision

Use Redis for ephemeral/cache/queue state and BullMQ for background/scheduled processing. Durable product truth stays in PostgreSQL.

## Consequences

Enables retries and decoupled jobs without introducing Kafka. Redis failure must not destroy completed business records.

## Alternatives considered

Custom Redis Pub/Sub job system and Kafka were rejected for unnecessary operational complexity.
