# Contracts Package

Machine-readable contracts shared by Software, QA, and Data/AI.

Current bootstrap contents:

- `openapi/openapi.json` — committed REST contract; regenerate from NestJS after API changes.
- `questions/question.schema.json` — draft Data/AI question ingestion envelope.
- `questions/question-variant.schema.json` — draft equivalent-variant envelope.
- `events/analytics-event.schema.json` — versioned analytics event envelope.
- `websocket/pvp-events.schema.json` — initial PvP event-name/envelope contract.

These schemas intentionally define transport/envelope shape without inventing unresolved PRD academic rules. Human-readable semantics live under `docs/api/` and `docs/data/`.

The question schemas are **for Data/AI import**, not the internal fixtures for the first school trial and not Student-facing responses. The first trial's four-option, inline-LaTeX demo-question choices are recorded in `docs/data/QUESTION_CONTRACT.md`. `scripts/validate-contracts.mjs` currently checks JSON syntax only; it does not validate question instances against their schemas.
