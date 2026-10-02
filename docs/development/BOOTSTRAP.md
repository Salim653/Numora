# Actual Project Bootstrap

## Goal

The current repository is a **walking skeleton**, not a product-feature implementation. It proves that the three application processes and cloud development dependencies can be used from one reproducible monorepo before feature teams branch into product modules.

## Implemented P0 bootstrap

- pnpm workspace + Turborepo;
- Next.js web process;
- NestJS API with `/api/v1/health`, database health and Swagger;
- BullMQ worker connecting to Redis;
- PostgreSQL/Drizzle package with foundational Identity/School/Class/Outbox/Audit schema;
- Supabase cloud development connection configuration;
- Redis cloud connection and BullMQ prefix configuration;
- deterministic `DEMO` seed;
- machine-readable OpenAPI/question/event/PvP envelopes;
- TypeScript strict baseline, ESLint, Prettier;
- GitHub CI and PR template;
- CODEOWNERS mapped to the supplied GitHub accounts; repository write access still needs verification.

## Explicitly not implemented yet

- Google OAuth flow and NestJS JWT authorization;
- complete domain schema for content/assessment/XP/PvP/IRT;
- R2 integration;
- transaction outbox processor;
- actual scheduled jobs;
- PvP gateway/match state machine;
- product UI routes;
- resolved behavior for OPEN PRD items.

Those were outside the original walking-skeleton bootstrap. The newly supplied Sprint 2 Goal now requires Google Student login, Class join, and a persisted Level-1 Drill vertical slice; see `SPRINT_2_GOAL.md`. Remaining feature work follows [latest Drill v1.2 / TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md), the cross-feature v0.5 baseline and team refinement; bootstrap evidence does not prove acceptance of updated features.

## Bootstrap acceptance test

A fresh developer machine should be able to run:

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

Then verify:

1. Web opens at port 3000.
2. Web reports API connected.
3. API `/api/v1/health` is healthy.
4. API `/api/v1/health/database` is healthy.
5. Swagger opens at `/api/docs`.
6. Worker logs a successful connection to development Redis, without adding a job on startup.
7. The Supabase development branch has the reviewed Drizzle schema; optional `DEMO` rows exist only if seeded there deliberately.

If this only works on one person's laptop, the original bootstrap reproducibility goal is not met. Passing this check alone does not complete the current Sprint 2 Student flow.

## First team actions after cloning

1. Run the acceptance test on at least two different team members' machines.
2. Verify `pnpm install --frozen-lockfile` using the committed lockfile.
3. Have a designated operator review and apply the committed Drizzle migration to the isolated development branch using a direct `DATABASE_MIGRATION_URL`.
4. Confirm each account in `.github/CODEOWNERS` has repository write access.
5. Enable protected `main` and required CI in GitHub.
6. Refine Auth, Class, seeded content, and Assessment Engine work against the Sprint 2 Student vertical slice at the approved 80% mastery threshold; plan Admin School/token UI and Teacher verification/create-Class/progress UI for the online school prototype trial.
