# Contracts Package

Machine-readable contracts shared by Software, QA, and Data/AI.

Current bootstrap contents:

- `openapi/openapi.json` — committed REST contract; regenerate from NestJS after API changes.
- `questions/question.schema.json` — draft Data/AI question ingestion envelope.
- `questions/question-variant.schema.json` — draft equivalent-variant envelope.
- `events/analytics-event.schema.json` — versioned analytics event envelope.
- `websocket/pvp-events.schema.json` — initial PvP event-name/envelope contract.

These schemas intentionally define transport/envelope shape without inventing unresolved PRD academic rules. Human-readable semantics live under `docs/api/` and `docs/data/`.
