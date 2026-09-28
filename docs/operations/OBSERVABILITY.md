# Observability

## Goals

PRD requires storage/scoring/match failures to be traceable. Observability must allow a user-visible failure to be followed across API, database/worker, and PvP processing.

## Logging

Use structured JSON logs (Pino recommended).

Common fields:

```json
{
  "level": "info",
  "requestId": "uuid",
  "userId": "uuid-or-null",
  "module": "assessments",
  "operation": "submitDrillAttempt",
  "durationMs": 84
}
```

Do not log secrets/credentials or unnecessary PII.

## Correlation

Generate/propagate `requestId`/`correlationId` through:

- frontend error/support context where safe;
- REST request;
- domain log;
- outbox event;
- worker log.

## Error monitoring

Sentry or equivalent may be used for Frontend/Backend error tracking with PII scrubbing and environment separation.

## Metrics and tracing

OpenTelemetry backend instrumentation is recommended for:

- request duration/error rate;
- DB latency;
- queue processing/retry;
- assessment submit latency;
- active WebSocket/PvP metrics;
- worker/job success/failure;
- leaderboard/IRT scheduled job duration.

## Alerts before real-user release

At minimum alert/notice on:

- API unavailable;
- high server error rate;
- database connection exhaustion/failure;
- queue backlog/failures;
- scheduled leaderboard archive failure;
- daily IRT job failure;
- repeated PvP system cancellation rate.

Exact thresholds should be tuned from staging/load baselines.
