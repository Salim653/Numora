# ADR-004 — Drizzle ORM + migration-first workflow

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

The TypeScript backend needs typed SQL access with transparent PostgreSQL behavior and migration files reviewable by the team/Data engineers.

## Decision

Use Drizzle ORM and Drizzle Kit. Shared environments use generated committed migrations rather than ad-hoc dashboard edits.

## Consequences

Good SQL visibility/type safety and versioned migrations. Team must understand schema/migration workflow.

## Alternatives considered

Prisma and TypeORM were considered; Drizzle was selected for SQL transparency and lightweight typed workflow.
