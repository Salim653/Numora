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
  - Redis initially if operationally acceptable
      │
      ▼
Managed PostgreSQL + Supabase Auth

Cloudflare R2 is used for owned object media.
```

## Why managed PostgreSQL/Auth is preferred

It reduces the team's responsibility for database backup/upgrade/failure handling and avoids changing the authentication architecture between development and production.

A full self-hosted fallback is possible if budget requires it, but needs a separate operational review.

## Environments

Deployment must separate Development, Staging, and Production Supabase projects, Google OAuth configuration, database connections, and secrets. Build Next.js with that environment's `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_API_URL`; configure NestJS with the matching `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and private `DATABASE_URL`. Cloud Development is shared by developers; Staging and Production must not reuse it.

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

- run committed Drizzle migrations once per environment using a private direct `DATABASE_MIGRATION_URL`, under Database-team control; normal application processes use their separate `DATABASE_URL`;
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

For each environment, configure the Google OAuth redirect URI to that Supabase project's `/auth/v1/callback`. Add the corresponding Next.js `/auth/callback` URL to Supabase Auth's redirect allowlist and set the Site URL. Stable staging/production domains are required to finalize these settings but are not a Development blocker. The Google Client Secret stays in the provider configuration, never in the application build.
