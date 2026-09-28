# TKA Mathematics SMP Platform

Monorepo bootstrap for Numora, the independent and school-affiliated TKA Mathematics SMP learning platform. Current product baseline: PRD v0.5 (28 September 2026, draft for review). See `docs/development/SPRINT_2_GOAL.md` for the first Student vertical slice.

## Architecture baseline

- `apps/web` — Next.js, mobile-first role-based web UI.
- `apps/api` — NestJS REST API; later also the PvP Socket.IO gateway.
- `apps/worker` — BullMQ workers and scheduled jobs.
- `packages/database` — PostgreSQL/Drizzle schema, migrations, seed.
- `packages/contracts` — OpenAPI and Data/AI/event/WebSocket contracts.
- `packages/ui` — reusable accessible UI primitives.
- Supabase Local — local PostgreSQL + Auth stack.
- Redis — cache, queues, rate-limit/PvP ephemeral state.
- Cloudflare R2 — media assets; not required for the first walking skeleton.

Read `AGENTS.md` before implementing product features.

## Required local tools

- Node.js 24 LTS
- pnpm 12
- Docker Engine/Desktop + Compose
- Git

The Supabase CLI is pinned as a root dev dependency, so use `pnpm supabase:*` scripts rather than relying on a global version.

## First setup

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

After `pnpm supabase:start`, copy the local anon/service keys shown by `pnpm supabase:status` into `.env` when auth work begins.

### Local URLs

- Web: http://localhost:3000
- API health: http://localhost:3001/api/v1/health
- API database health: http://localhost:3001/api/v1/health/database
- Swagger UI: http://localhost:3001/api/docs
- Supabase Studio: http://localhost:54323
- Redis: `redis://127.0.0.1:6379`

## Normal development

```bash
pnpm supabase:start   # once per local session if not already running
pnpm infra:up
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# or all together
pnpm ci
```

## Database workflow

1. Edit schemas under `packages/database/src/schema`.
2. Run `pnpm db:generate`.
3. Review the generated SQL under `packages/database/drizzle`.
4. Commit schema + migration together.
5. Run `pnpm db:migrate` locally.
6. Update seed if the new model needs fixtures.

Do not make normal shared schema changes manually in Supabase Studio.

## OpenAPI

The API is code-first. Generate the committed contract after API changes:

```bash
pnpm openapi:generate
```

`packages/contracts/openapi/openapi.json` is committed as the FE/BE/QA contract. Regenerate it after controller/DTO changes and commit the diff together with the implementation.

## Bootstrap status

This repository intentionally implements only the P0 walking skeleton:

- monorepo/workspace;
- web/API/worker processes;
- PostgreSQL and Redis connectivity;
- foundational identity/school/class schema;
- idempotent demo seed;
- OpenAPI/Swagger bootstrap;
- contract placeholders and JSON schemas;
- CI baseline.

It does **not** silently implement unresolved PRD OPEN items. See `docs/product/OPEN_DECISIONS.md`.
