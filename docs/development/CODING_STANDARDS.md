# Coding Standards

## General

- TypeScript strict mode.
- Prefer explicit, domain-oriented names.
- Keep functions/services small enough to test independently.
- Avoid “god services” and generic `utils.ts` dumping grounds.
- Favor composition and explicit dependencies.

## Naming

- TypeScript variables/functions: `camelCase`.
- Types/classes/components: `PascalCase`.
- Database: `snake_case`.
- REST JSON: `camelCase`.
- Events: lowercase `snake_case` names consistent with PRD event vocabulary.

## Backend

- Controllers parse/validate/authenticate/orchestrate; domain/application service owns business behavior.
- Repositories own persistence access.
- Domain rules must be testable without HTTP transport when practical.
- Use DTO validation for external input.
- Never trust client role, score, timing, or ownership claims.

## Frontend

- Business/server state through API/query layer.
- TanStack Query for server-state caching/fetch lifecycle.
- React Hook Form + Zod for form state/validation where appropriate.
- Avoid Redux unless a concrete cross-feature client-state requirement justifies it.
- Reusable accessible primitives live in `packages/ui`.
- No direct product-data query to Supabase/PostgreSQL.

## Error handling

- Public REST errors follow the project problem-details format.
- Log operational detail server-side; do not expose internal stack traces.
- Distinguish validation, authorization, not-found, conflict/idempotency, and dependency errors.

## Time

- Persist UTC.
- Never use server local timezone implicitly for business-day rules.
- Use explicit `Asia/Jakarta` logic for Tryout and leaderboard schedule.

## Security

- Never log auth bearer tokens, OAuth credentials, verification tokens, or unnecessary PII.
- Validate file type/size and R2 upload authorization.
- Hash teacher verification token material at rest when feasible.

## Comments and documentation

Comments should explain **why** or a non-obvious invariant, not restate code. Product rules should reference requirement IDs in tests or module docs when useful.
