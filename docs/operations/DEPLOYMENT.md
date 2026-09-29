# Deployment

## Preferred production topology

```text
Cloudflare DNS/CDN
      │
      ▼
VPS application layer
  - Next.js
  - NestJS API/WebSocket
  - Worker/Scheduler
      │
      ▼
Supabase cloud PostgreSQL + Auth; Redis cloud

Cloudflare R2 is used for owned object media.
```

## Managed dependencies

Supabase and Redis cloud reduce local infrastructure work and keep the same service types across environments. Use an isolated development Supabase branch/project; staging contains real-user data. If Redis is shared, isolate BullMQ keys with distinct prefixes and credentials where available.

A full self-hosted fallback needs a separate operational review. The choice of a deployment container is independent of the no-Docker development setup.

## Environments

Deployment must separate Development, Staging, and Production configuration/secrets.

## Deployment flow target

```text
merge to main
→ CI build/test
→ build immutable application artifact/container
→ deploy staging
→ migration rehearsal + smoke/E2E
→ approved production deployment
→ health/smoke checks
```

## Database migrations

- run controlled migration before/with deployment;
- use a direct `DATABASE_MIGRATION_URL` only in the designated migration runner, separate from runtime `DATABASE_URL`;
- keep Drizzle migrations canonical; do not enable another automatic Supabase migration path without coordinating it;
- avoid destructive incompatible changes without phased rollout;
- back up before high-risk migrations;
- verify rollback/forward-fix approach.

## Health endpoints

Recommended:

- `/health/live` — process alive, minimal dependencies;
- `/health/ready` — ready to serve, key dependencies healthy within reasonable checks.

## Rollback

Application rollback must not blindly roll database schema backward if new writes have occurred. Prefer backward-compatible migrations and forward fixes when possible.

## Domain/OAuth

Stable staging/production domain is required to finalize OAuth redirect URIs and public routing but is not a development blocker.
