# Environments

## Logical environments

The platform uses three logical environments:

- Development
- Staging
- Production

Even if Staging/Production are not provisioned in Sprint 2, configuration must not assume only one environment.

## Development

Preferred local stack:

- Next.js local process
- NestJS local process
- Worker local process
- Supabase local PostgreSQL/Auth services
- Redis via Docker Compose
- Development R2 bucket or local mock when necessary

Shared development cloud services may be added, but local reproducibility remains a goal.

## Staging

Purpose:

- integrated QA;
- OAuth callback verification;
- migration rehearsal;
- WebSocket integration;
- pre-release smoke/E2E/load tests.

Must use separate:

- database;
- OAuth client/config;
- R2 bucket/prefix;
- secrets;
- observability environment.

## Production

Preferred target:

- VPS for Next.js/NestJS/Worker;
- Redis initially on managed/self-hosted infrastructure appropriate to budget;
- managed PostgreSQL + Supabase Auth preferred;
- Cloudflare DNS/CDN/R2.

Do not place all environment credentials in one shared `.env` across machines.

## Secrets

Repository may contain `.env.example`, never real `.env` secrets.

Use GitHub Environment Secrets and/or server secret management for deployment.

## Domain/OAuth

A final domain is not required to start development, but it is required before stable staging/public OAuth callbacks and production routing are finalized.
