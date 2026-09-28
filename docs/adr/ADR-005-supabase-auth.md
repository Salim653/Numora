# ADR-005 — Supabase Auth + Google OAuth identity

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

PRD requires Google Auth for Student/Teacher. The application also needs server-side role/resource authorization.

## Decision

Use Supabase Auth/Google OAuth for identity. NestJS verifies identity and is authoritative for application authorization. Do not query product data directly from browser via Supabase Data API.

## Consequences

Avoids building password/OAuth infrastructure and keeps authorization in one domain layer. Production should avoid swapping identity system without a migration plan.

## Alternatives considered

Direct custom OAuth/local password auth was rejected for MVP complexity. OPEN-14 remains product-level for any future local password.
