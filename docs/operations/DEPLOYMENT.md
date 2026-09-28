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
