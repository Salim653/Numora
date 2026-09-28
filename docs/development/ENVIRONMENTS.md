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
- first prototype trial with real school Students and Teachers, once the agreed permission/privacy checks are complete;
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

For the prototype trial, staging must be reachable by the school and support Google OAuth callbacks for real Student/Teacher accounts. Demo Level-1 content must be visibly identified as demo and reviewed by Curriculum before use. Teacher data access must stay within owned Classes. As of 28 September 2026, the staging domain and access to the Supabase/Google OAuth projects are not yet available; provisioning is a delivery dependency. Do not assume local Supabase credentials or seed-only identities prove the school-facing flow.

The staging hosting provider and accountable setup owner will be decided **jointly by the team**; neither is chosen yet. The monthly budget for hosting and supporting services is also **unset**. Domain setup is tentatively expected from DevOps; Supabase/Google OAuth project setup is tentatively expected from the Database team. Confirm these owners before treating the work as assigned. Early frontend development and the first school trial may use a simple mock UI while UI/UX prepares designs, provided the connected flow and basic accessibility work.

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
