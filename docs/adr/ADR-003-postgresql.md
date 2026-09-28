# ADR-003 — PostgreSQL as durable primary database

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

Product data is relational and requires strong transactions, uniqueness, historical references, reporting, XP ledger, and content versioning.

## Decision

Use PostgreSQL as the durable source of truth.

## Consequences

Enables transactional integrity and flexible analytics-friendly querying. Schema/migrations need discipline.

## Alternatives considered

MongoDB was an earlier idea but is no longer the selected primary database. Redis is not a durable replacement.
