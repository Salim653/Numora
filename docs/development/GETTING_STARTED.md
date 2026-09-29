# Getting Started

## Prerequisites

- Git
- Node.js 24 LTS
- Corepack
- Docker Desktop / Docker Engine + Compose

pnpm is pinned by the repository. The Supabase CLI is available only for optional isolated local work.

On Windows, run `node --version` in the terminal you will use for development. It must report v24; an older system installation can take precedence over a user-installed Node 24 in `PATH`.

## First run

```bash
git clone <repository-url>
cd <repository>
corepack enable
pnpm install
cp .env.example .env
pnpm infra:up
pnpm dev
```

The lockfile and initial Drizzle migration are committed with the bootstrap. Use `pnpm install --frozen-lockfile` to reproduce the dependency versions.

## Local services

- `apps/web` — Next.js on `http://localhost:3000`
- `apps/api` — NestJS on `http://localhost:3001`
- `apps/worker` — BullMQ worker/scheduler process
- PostgreSQL/Auth — shared Supabase Cloud Development project
- Redis — root Docker Compose

Useful checks:

- API: `http://localhost:3001/api/v1/health`
- DB: `http://localhost:3001/api/v1/health/database`
- Swagger: `http://localhost:3001/api/docs`
- Supabase dashboard: the team's Cloud Development project

## Environment files

Use one root `.env` for the local bootstrap. It is loaded by root scripts and is ignored by Git.

```bash
cp .env.example .env
```

Fill the root `.env` from the team's secure Development configuration before starting the apps. The two `NEXT_PUBLIC_SUPABASE_*` values belong to Next.js; `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` must refer to the same project for NestJS token verification. Set `DATABASE_URL` to the Cloud session-pooler URL with TLS. The Google Client Secret and database password must never enter Git or chat. Next.js public values are embedded at build time, so configure each deployed web build for its own environment.

The Database team configures the Google provider and Google OAuth consent screen. Google redirects to the project's Supabase Auth callback; Supabase allows `http://localhost:3000/auth/callback` for local Next.js development. Staging and Production need their own project URLs, callbacks, and credentials. See [Environments](ENVIRONMENTS.md).

Never commit real credentials.

## Database

The source schema lives in `packages/database/src/schema`.

```bash
# Run only as the designated Database operator after schema review:
pnpm db:migrate
```

The shared Cloud database receives committed migrations once through a controlled Database-team operation using `DATABASE_MIGRATION_URL` (direct PostgreSQL connection with `sslmode=require`). Do not run `db:migrate` or `db:seed` on each developer machine. Run `pnpm db:generate` only after changing Drizzle schema; review and commit its SQL.

## Seed data

Bootstrap seed is deterministic and marked `DEMO`. It contains fictional Auth UUIDs, so do not apply it automatically to shared Development. Coordinate any shared fixture with the Database team.

## Authentication

Google login, cookie session, and internal role selection are available once the Database team enables the provider and redirect settings. The current Sprint 2 flow still needs the separate Class and Drill features. See `SPRINT_2_GOAL.md`.

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
