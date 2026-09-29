# Getting Started

## Prerequisites

- Git
- Node.js 24 LTS
- Corepack

pnpm is pinned by the repository. Obtain the isolated cloud development credentials from the cloud team before running the apps.

On Windows, run `node --version` in the terminal you will use for development. It must report v24; an older system installation can take precedence over a user-installed Node 24 in `PATH`.

## First run

```bash
git clone <repository-url>
cd <repository>
corepack enable
pnpm install
cp .env.example .env
pnpm dev
```

The lockfile and initial Drizzle migration are committed with the bootstrap. Use `pnpm install --frozen-lockfile` to reproduce the dependency versions.

## Local services

- `apps/web` — Next.js on `http://localhost:3000`
- `apps/api` — NestJS on `http://localhost:3001`
- `apps/worker` — BullMQ worker/scheduler process
- PostgreSQL/Auth — isolated Supabase cloud development branch/project
- Redis — cloud TCP/TLS endpoint, with a developer-specific BullMQ prefix

Useful checks:

- API: `http://localhost:3001/api/v1/health`
- DB: `http://localhost:3001/api/v1/health/database`
- Swagger: `http://localhost:3001/api/docs`

The Supabase dashboard URL is supplied by the cloud team. Local web and API ports remain 3000 and 3001.

## Environment files

Use one ignored root `.env` for development. It is loaded by root scripts. Fill it from the development cloud handoff; never copy staging credentials containing real-user data.

```bash
cp .env.example .env
```

Required current values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL`, `REDIS_URL`, and `BULLMQ_PREFIX`. `SUPABASE_URL` is reserved for future server-side Auth verification and is not yet read by the API. Keep `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, and `CORS_ORIGINS` pointed at the local web/API processes. A public key is browser-visible; database and Redis URLs are secrets.

After the worker connects, run `pnpm worker:probe` only against the development Redis endpoint. It explicitly enqueues one job under a `numora:dev:<your-name>` prefix; the worker should log its completion. The command rejects staging prefixes. Do not run this check until the cloud team confirms the target endpoint and prefix.

Use a direct PostgreSQL connection when reachable or a session pooler for IPv4-only laptops; do not use the transaction pooler with this Postgres.js client. Append `sslmode=require` to PostgreSQL URLs, or use `sslmode=verify-full` with the provider CA. Use a Redis protocol endpoint with `rediss://`, not a REST-only URL. The cloud team should confirm BullMQ compatibility and `noeviction`. The Next.js public values are embedded at build time, so restart/rebuild after changing them.

Never commit real credentials.

## Database

The source schema lives in `packages/database/src/schema`.

```bash
pnpm db:generate
```

Run `pnpm db:generate` only after changing the Drizzle schema. It generates SQL offline; review and commit the migration with the schema change. A designated operator sets `DATABASE_MIGRATION_URL` to the target's direct connection and runs `pnpm db:migrate` separately. Do not place migration credentials in a developer's routine `.env`. `pnpm db:seed` requires both `NODE_ENV=development` and `ALLOW_DEMO_SEED=true`; use it only against the isolated development branch. Its fixed `DEMO` auth IDs do not create Google accounts.

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
