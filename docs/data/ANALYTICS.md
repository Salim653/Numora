# Analytics Integration

## Goals from product

Data should support analysis of:

- practice frequency;
- completion;
- subchapter difficulty;
- explanation usage;
- feedback;
- PvP;
- school/class activity;
- content/report quality;
- leaderboard periods;
- IRT.

Recording events alone is not proof of “Big Data”; pipeline/analysis should match actual scale and academic criteria.

## Recommended flow

```text
NestJS domain transaction
      ↓
analytics_outbox (PostgreSQL)
      ↓
worker / event processor
      ↓
analytics event sink / Data pipeline
      ↓
Data processing / dashboard / modeling
```

The initial sink may be PostgreSQL or an agreed Data-layer store. Kafka/Redpanda is not required at current scale unless later evidence justifies it.

## Contracts

Software → Data:

- analytics event schema;
- attempt/response extraction contract for IRT;
- stable IDs/time semantics;
- content/taxonomy version identifiers.

Data/AI → Software:

- question/variant JSON schema;
- optional curated video metadata ingestion;
- IRT result schema/job output if Data computes outside application worker.

## Correlation

Use `correlationId`/request or workflow IDs so product actions can be traced across API logs, outbox, workers, and downstream analytics.

## Late/duplicate events

Assume at-least-once asynchronous processing. Consumers should deduplicate by `eventId` and use `occurredAt` rather than ingestion time for event chronology.
