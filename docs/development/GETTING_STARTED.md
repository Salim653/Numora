# Getting Started

## Prerequisites

- Git
- Node.js 24 LTS
- Corepack
- Docker Desktop / Docker Engine + Compose

pnpm and Supabase CLI versions are pinned by the repository.

## First run

```bash
git clone <repository-url>
cd <repository>
corepack enable
pnpm install
cp .env.example .env
pnpm supabase:start
pnpm infra:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The lockfile and initial Drizzle migration are committed with the bootstrap. Use `pnpm install --frozen-lockfile` to reproduce the dependency versions.

## Local services

- `apps/web` — Next.js on `http://localhost:3000`
- `apps/api` — NestJS on `http://localhost:3001`
- `apps/worker` — BullMQ worker/scheduler process
- PostgreSQL/Auth — Supabase Local
- Redis — root Docker Compose

Useful checks:

- API: `http://localhost:3001/api/v1/health`
- DB: `http://localhost:3001/api/v1/health/database`
- Swagger: `http://localhost:3001/api/docs`
- Supabase Studio: `http://localhost:54323`

## Environment files

Use one root `.env` for the local bootstrap. It is loaded by root scripts and is ignored by Git.

```bash
cp .env.example .env
```

After Supabase starts, run `pnpm supabase:status` and fill local keys when auth implementation begins.

Never commit real credentials.

## Database

The source schema lives in `packages/database/src/schema`.

```bash
pnpm db:migrate
pnpm db:seed
```

Run `pnpm db:generate` only after changing the Drizzle schema. Review and commit the generated migration with the schema change.

## Seed data

Bootstrap seed is deterministic and marked `DEMO`. It currently proves database wiring only; richer Curriculum-independent fixtures should be added as assessment modules land.

## Authentication

Google OAuth/Supabase Auth integration was not a blocker for the original walking skeleton. The current Sprint 2 Student flow includes Google login; environment credentials and callback configuration are therefore a delivery dependency for that flow. See `SPRINT_2_GOAL.md`.

## Quality

```bash
pnpm contracts:validate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Or:

```bash
pnpm run ci
```

Use `pnpm run ci`: pnpm 12 reserves `pnpm ci` for a clean dependency install.

## Read before coding

1. `/AGENTS.md`
2. `docs/product/PRODUCT_CONTEXT.md`
3. `docs/product/OPEN_DECISIONS.md`
4. `docs/development/PROJECT_STRUCTURE.md` for code placement.
5. relevant module/API/data docs and ADRs.
