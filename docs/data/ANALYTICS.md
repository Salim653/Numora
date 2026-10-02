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
- activity by Student affiliation (Mandiri vs School) without exposing unnecessary PII;
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

## Core Learning measurements from latest feature PRDs

[Drill v1.2 / TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md) add explicit retry, pretest skip, video click, detail/processing view, submission type and conditional abandonment events. Use [EVENTS](EVENTS.md) for vocabulary; exact payload schema DRL-OPEN-08 remains OPEN. Preserve all valid attempts for repeat-frequency analysis and derive best score without overwriting history. TryOut completion, batch processing and release are separate milestones; measure ≤3×24h release from batch end. XP/stars/mastery-score formula decisions and TryOut scale are unresolved; analytics must not infer them from legacy values or normalize final TryOut results to 0–100 by assumption.
