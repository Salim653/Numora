# Engineering Documentation Index

This directory contains the shared engineering context for the TKA Mathematics SMP platform.

The team-supplied PRD v0.5 (28 September 2026) is the current reference but labels itself a consolidated draft for review. Its source PDF was supplied outside this repository and is not yet committed here; the summaries below do not replace the complete PRD. The supplied Sprint 2 Goal PDF is also external; its operative scope and threshold conflict are recorded in `development/SPRINT_2_GOAL.md`.

## Product

- `product/PRODUCT_CONTEXT.md` — product baseline from PRD v0.5 (draft for review).
- `product/PRD_MAPPING.md` — mapping from PRD sections/requirements to technical modules.
- `product/OPEN_DECISIONS.md` — unresolved PRD items, engineering recommendations, and blockers.
- `product/GLOSSARY.md` — canonical project vocabulary.

## Architecture

- `architecture/ARCHITECTURE.md` — system architecture and responsibilities.
- `architecture/SYSTEM_CONTEXT.md` — external actors/systems and system boundaries.
- `architecture/MODULE_BOUNDARIES.md` — module decomposition and dependency rules.
- `architecture/DATABASE.md` — persistence model, invariants, and migration rules.
- `architecture/REALTIME_PVP.md` — PvP state, WebSocket responsibilities, and durability.

## API

- `api/API_GUIDELINES.md`
- `api/AUTHORIZATION.md`
- `api/IDEMPOTENCY.md`

## Data

- `data/QUESTION_CONTRACT.md`
- `data/EVENTS.md`
- `data/ANALYTICS.md`
- `data/IRT_INTEGRATION.md`

## Development

- `development/GETTING_STARTED.md`
- `development/SPRINT_2_GOAL.md` — first Student vertical slice, sprint scope, and unresolved 70%/80% threshold conflict.
- `development/GIT_WORKFLOW.md`
- `development/CODING_STANDARDS.md`
- `development/ENVIRONMENTS.md`
- `development/OWNERSHIP.md`

## Testing

- `testing/TEST_STRATEGY.md`
- `testing/QA_GUIDE.md`

## Security and privacy

- `security/SECURITY.md`
- `security/PRIVACY.md`

## Operations

- `operations/DEPLOYMENT.md`
- `operations/OBSERVABILITY.md`
- `operations/BACKUP_RESTORE.md`
- `operations/RELEASE_CHECKLIST.md`

## Architecture Decision Records

See `adr/README.md` and the individual ADR files.

## Status terminology

- **PRD RULE** — directly stated in PRD v0.5; the supplied version is a draft for review.
- **ENGINEERING DECISION** — approved during technical alignment.
- **PROPOSED** — recommendation pending approval.
- **OPEN** — unresolved product/academic decision.
