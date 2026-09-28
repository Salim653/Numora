# ADR-002 — REST for product API; WebSocket for PvP

- **Status:** Accepted
- **Date:** 28 September 2026
- **Owners:** Software Engineering; approval aligned with PO/PM where architecture affects project plan

## Context

Most features are request/response CRUD/domain workflows, while PvP requires realtime bidirectional synchronization.

## Decision

Use REST `/api/v1` for normal product functions and WebSocket/Socket.IO for PvP realtime events only.

## Consequences

Keeps API simple and observable while supporting server-authoritative PvP. Requires two transport contracts for PvP-related flows.

## Alternatives considered

GraphQL and WebSocket-everywhere were rejected as unnecessary complexity.
