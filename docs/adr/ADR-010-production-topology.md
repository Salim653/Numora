# ADR-010 — VPS application layer + managed PostgreSQL/Auth preferred

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

Budget should be minimized, but real-user deployment should avoid making one VPS responsible for all application, database, and identity failure domains when possible.

## Decision

Deploy Next.js/NestJS/worker on VPS; prefer managed PostgreSQL + Supabase Auth for production; use Cloudflare R2 for object storage. Full self-hosting remains a budget fallback requiring review.

## Consequences

Reduces DB/auth operational burden while preserving low application-hosting cost. Managed services may introduce paid cost and external dependency.

## Alternatives considered

Single-VPS-everything was not preferred for real-user reliability; Kubernetes/microservices were rejected as over-complex.
