# Security Baseline

## Security principles

- server-side authorization;
- least privilege;
- minimal PII;
- secrets never committed;
- authoritative server time/scoring;
- immutable/auditable history for important actions;
- validate all untrusted input.

## Authentication

Student/Teacher use Google OAuth through Supabase Auth. NestJS validates identity tokens and maps to internal user state.

Admin has no public registration. Provision internal Admin identities through an authorized process/CLI/seed workflow.

## Teacher verification token

Treat as credential:

- generate with sufficient entropy;
- store hash rather than reusable plaintext where feasible;
- validate on server;
- expire after 3×24h;
- consume exactly once in a transaction;
- do not log raw token;
- support revocation/regeneration operationally.

## Authorization

Check role + Student affiliation (Mandiri/School) + resource relation + account status. Mandiri may use Drill, free MVP TryOut, and create/share a PvP room. Class leaderboard still requires Class membership; Pretest retains the v0.5 affiliation baseline pending clarification. TryOut v1.1 removes the class/payment prerequisite; validate package/attempt ownership and result release server-side. See [latest Core Learning source](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md). UI hiding is never authorization.

## API protection

Before staging/production:

- CORS allowlist;
- rate limiting;
- body size limits;
- DTO/schema validation;
- dependency/security scanning;
- safe error responses;
- request IDs;
- audit for sensitive Admin changes.

## WebSocket

- authenticate connection;
- authorize room/match membership per event;
- rate-limit spam-prone events;
- server computes score/time;
- do not trust client room ownership claims;
- sanitize/validate event payloads.

## R2/file uploads

Use short-lived presigned upload/read authorization where appropriate. Validate:

- allowed MIME/content type;
- size limit;
- object key ownership/prefix;
- metadata record before exposing asset.

## Logging restrictions

Never log:

- OAuth access/refresh tokens;
- bearer JWT;
- teacher verification token;
- passwords if local auth is later introduced;
- unnecessary full Student email/profile details;
- raw secret environment values.

## Dependency/secrets workflow

- enable GitHub secret scanning if available;
- keep `.env` ignored;
- rotate leaked credentials immediately;
- use environment-specific credentials.

## Threat-model priorities

1. unauthorized Teacher reading another Class;
2. Student bypassing locked assessment/Level;
3. replay/double-submit producing extra XP;
4. stolen/reused teacher verification token;
5. forged PvP time/score;
6. object-storage unauthorized upload/read;
7. Admin privilege exposure;
8. sensitive logs/analytics leakage.
