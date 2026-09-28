# Actual Project Bootstrap

## Goal

The current repository is a **walking skeleton**, not a product-feature implementation. It proves that the three application processes and local infrastructure can be developed from one reproducible monorepo before feature teams branch into product modules.

## Implemented P0 bootstrap

- pnpm workspace + Turborepo;
- Next.js web process;
- NestJS API with `/api/v1/health`, database health and Swagger;
- BullMQ worker connecting to Redis;
- PostgreSQL/Drizzle package with foundational Identity/School/Class/Outbox/Audit schema;
- Supabase Local configuration;
- Redis Docker Compose;
- deterministic `DEMO` seed;
- machine-readable OpenAPI/question/event/PvP envelopes;
- TypeScript strict baseline, ESLint, Prettier;
- GitHub CI and PR template;
- CODEOWNERS template awaiting actual GitHub usernames.

## Explicitly not implemented yet

- Google OAuth flow and NestJS JWT authorization;
- complete domain schema for content/assessment/XP/PvP/IRT;
- R2 integration;
- transaction outbox processor;
- actual scheduled jobs;
- PvP gateway/match state machine;
- product UI routes;
- resolved behavior for OPEN PRD items.

Those were outside the original walking-skeleton bootstrap. The newly supplied Sprint 2 Goal now requires Google Student login, Class join, and a persisted Level-1 Drill vertical slice; see `SPRINT_2_GOAL.md`. Remaining feature order follows PRD v0.5 and team refinement.

## Bootstrap acceptance test

A fresh developer machine should be able to run:

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm supabase:start
pnpm infra:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Then verify:

1. Web opens at port 3000.
2. Web reports API connected.
3. API `/api/v1/health` is healthy.
4. API `/api/v1/health/database` is healthy.
5. Swagger opens at `/api/docs`.
6. Worker logs a completed startup probe.
7. Supabase Studio shows foundational tables and DEMO rows.

If this only works on one person's laptop, the original bootstrap reproducibility goal is not met. Passing this check alone does not complete the current Sprint 2 Student flow.

## First team actions after cloning

1. Run the acceptance test on at least two different team members' machines.
2. Commit the generated `pnpm-lock.yaml`.
3. Generate and review the first Drizzle migration; commit schema + migration.
4. Replace `.github/CODEOWNERS.example` with `.github/CODEOWNERS` after collecting GitHub usernames.
5. Enable protected `main` and required CI in GitHub.
6. Refine Auth, Class, seeded content, and Assessment Engine work against the current Sprint 2 Student vertical slice; record the 70%/80% conflict before acceptance.
