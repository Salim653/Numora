# Environments

## Logical environments

The platform uses three logical environments:

- Development
- Staging
- Production

Even if Staging/Production are not provisioned in Sprint 2, configuration must not assume only one environment.

## Development

Cloud-first Development stack:

- Next.js local process
- NestJS local process
- Worker local process
- shared Supabase Cloud Development PostgreSQL/Auth project prepared by the Database team
- Redis via Docker Compose
- Development R2 bucket or local mock when necessary

Developers do not need to start Supabase Local. Keep `supabase/config.toml` and the CLI scripts only for optional isolated work. `DATABASE_URL` points to the Cloud runtime connection; only the designated Database operator uses `DATABASE_MIGRATION_URL` to apply committed migrations. Do not run the fictional-identity DEMO seed as part of shared Development startup.

The Database team configures Google OAuth in its Google Cloud project and the Supabase dashboard: the Google redirect URI is the Cloud project's `/auth/v1/callback`, while the Supabase redirect allowlist includes each permitted Next.js `/auth/callback` URL. Development allows `http://localhost:3000/auth/callback`. Student/Teacher identity flows through Supabase Auth; NestJS reads role and authorization state from PostgreSQL. Product tables remain unavailable through the browser Data API.

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

For the prototype trial, staging must be reachable by the school and support Google OAuth callbacks for real Student/Teacher accounts. Demo Level-1 content must be visibly identified as demo and reviewed by Curriculum before use. Teacher data access must stay within owned Classes. The Development project is prepared; staging domain/project access remains a separate delivery dependency until confirmed. Development credentials or seed-only identities do not prove the school-facing staging flow.

The staging hosting provider and accountable setup owner will be decided **jointly by the team**; neither is chosen yet. The monthly budget for hosting and supporting services is also **unset**. Domain setup is tentatively expected from DevOps; Supabase/Google OAuth project setup is tentatively expected from the Database team. Confirm these owners before treating the work as assigned. Early frontend development and the first school trial may use a simple mock UI while UI/UX prepares designs, provided the connected flow and basic accessibility work.

## Production

Preferred target:

- VPS for Next.js/NestJS/Worker;
- Redis initially on managed/self-hosted infrastructure appropriate to budget;
- managed PostgreSQL + Supabase Auth preferred;
- Cloudflare DNS/CDN/R2.

Use a separate Supabase project, Google OAuth client/configuration, database connection, and secret set for each deployed environment. Do not place all environment credentials in one shared `.env` across machines. Next.js `NEXT_PUBLIC_*` values must be set for each environment's build, while NestJS receives its own `SUPABASE_*` and `DATABASE_URL` settings.

## Secrets

Repository may contain `.env.example`, never real `.env` secrets.

Use GitHub Environment Secrets and/or server secret management for deployment.

## Domain/OAuth

A final domain is not required to start development, but it is required before stable staging/public OAuth callbacks and production routing are finalized.
