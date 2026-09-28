# Engineering Documentation Index

This directory contains the shared engineering context for the TKA Mathematics SMP platform.

PRD v0.5 (28 September 2026) is the team-approved product source of truth, as confirmed by the Software Engineering coordinator on 28 September 2026. The PDF still carries its earlier “draft for review” label; the source PDF was supplied outside this repository and is not yet committed here. The summaries below do not replace the complete PRD. The supplied Sprint 2 Goal PDF is also external; its older 70% threshold has been superseded by the approved PRD's 80% rule.

## Product

- `product/PRODUCT_CONTEXT.md` — product rules from team-approved PRD v0.5.
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

## Design

- `design/README.md` — status, provenance, and use of the UI/UX baseline.
- `design/NUMORA_UI_DESIGN_SYSTEM.md` — team-supplied visual, component, responsive, and accessibility guidance before final UI handoff.
- `design/NUMORA_UI_SKILL.md` — team-supplied frontend workflow reference, adapted to local document paths; not an installed agent skill.

## Development

- `development/PROJECT_STRUCTURE.md` — panduan utama lokasi kode, struktur folder saat ini dan yang direncanakan, serta contoh kerja lintas tim.
- `development/GETTING_STARTED.md`
- `development/SPRINT_2_GOAL.md` — first Student vertical slice and additional Teacher UI needed for the prototype trial.
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

- **PRD RULE** — directly stated in team-approved PRD v0.5.
- **ENGINEERING DECISION** — approved during technical alignment.
- **PROPOSED** — recommendation pending approval.
- **OPEN** — unresolved product/academic decision.
