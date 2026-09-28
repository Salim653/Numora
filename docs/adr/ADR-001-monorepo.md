# ADR-001 — Monorepo with pnpm + Turborepo

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

The team needs one repository for Next.js, NestJS, worker, shared contracts/UI/config and a short sprint cycle with multiple Frontend/Backend/QA contributors.

## Decision

Use a pnpm workspace with Turborepo. Keep deployable applications under `apps/` and shared libraries/contracts under `packages/`.

## Consequences

Simplifies shared types/contracts, one CI surface, atomic cross-layer PRs, and consistent tooling. Requires disciplined boundaries and CI performance management.

## Alternatives considered

Separate repositories for frontend/backend were considered but rejected because they increase contract/version coordination overhead for this team.
