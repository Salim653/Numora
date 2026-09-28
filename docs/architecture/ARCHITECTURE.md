# Architecture

## 1. Architectural goals

The architecture must support:

- mobile-first responsive web usage;
- clear Student/Teacher/Admin authorization;
- durable assessment and historical integrity;
- realtime PvP without making the entire platform realtime;
- scalable asynchronous processing for analytics, leaderboards, IRT, and outbox delivery;
- team parallelism in a short sprint cycle;
- future growth without introducing microservice/Kubernetes complexity prematurely.

## 2. High-level containers

```text
                         ┌─────────────────────────┐
                         │       Web Browser       │
                         │ Student/Teacher/Admin   │
                         └───────────┬─────────────┘
                                     │ HTTPS / WSS
                              ┌──────▼──────┐
                              │  Next.js Web │
                              └──────┬──────┘
                                     │ REST / WebSocket
                   ┌─────────────────▼─────────────────┐
                   │             NestJS API             │
                   │ REST + AuthZ + PvP Gateway         │
                   └───────┬──────────┬───────────┬─────┘
                           │          │           │
                    ┌──────▼───┐ ┌────▼─────┐ ┌──▼──────────┐
                    │PostgreSQL│ │  Redis   │ │Cloudflare R2│
                    └──────┬───┘ └────┬─────┘ └─────────────┘
                           │          │
                           │     ┌────▼─────┐
                           └────>│  Worker  │
                                 │BullMQ/jobs│
                                 └──────────┘
```

Authentication identity is provided by Supabase Auth/Google OAuth. NestJS verifies identity and evaluates application authorization.

## 3. Monorepo layout

```text
apps/web      Next.js UI and role route groups
apps/api      NestJS REST API and WebSocket gateway
apps/worker   BullMQ processors, scheduler, outbox consumers
packages/database
packages/ui
packages/contracts
packages/config
packages/testing
```

## 4. Why a modular monolith

The current recommendation is a **modular monolith**, not microservices.

Reasons:

- project team and timeline are limited;
- many domains share transactions (assessment finalization → progress → XP → outbox);
- operational complexity of distributed services is not justified yet;
- module boundaries can still be explicit and extracted later if scale requires it.

Modules may have separate service interfaces but initially deploy in the same API/worker processes.

## 5. API patterns

### REST

Used for most product behavior:

- identity/profile state;
- schools/tokens/classes;
- content/admin;
- assessments/results;
- progress/monitoring/feedback;
- reports/video;
- leaderboard reads.

### WebSocket

Reserved for realtime PvP:

- room/invite state;
- ready state;
- question start/timeout;
- answer acknowledgements;
- reconnect;
- match result events.

Do not introduce WebSocket for normal CRUD only because it exists for PvP.

## 6. Authentication and authorization

```text
Google OAuth
   ↓
Supabase Auth identity/JWT
   ↓
NestJS identity verification
   ↓
Internal User + role/status/membership
   ↓
Resource authorization
```

Authorization examples:

- Teacher must be verified and own the Class.
- Student must be a member of a Class before starting assessment/PvP.
- Admin routes require an internally provisioned Admin identity.
- Global PvP leaderboard exposes minimum display information only.

## 7. Assessment architecture

Shared assessment infrastructure supports Pretest, Drill, and Tryout with type-specific policies.

Recommended lifecycle:

```text
CREATED → IN_PROGRESS → SUBMITTED → SCORING → COMPLETED
                      ↘ CANCELLED / SYSTEM_TERMINATED when defined
```

Key rules:

- package/variant is selected server-side;
- refresh resumes the same in-progress attempt where product rules require it;
- duplicate submit creates one final result;
- attempt stores references/snapshots required to preserve historical context;
- scoring policy is versioned;
- progress and XP updates are transactionally linked to finalization where practical.

## 8. Historical integrity

Questions are versioned. A corrected question creates a new content version rather than rewriting the context of previous attempts.

Historical attempts preserve:

- question version/variant;
- submitted answer;
- applicable answer key/explanation context;
- scoring policy version;
- final raw points and normalized score.

Past scores/progress/XP are not recalculated when content or scoring changes.

## 9. Async processing

Use transactional outbox + BullMQ workers.

Example:

```text
BEGIN
  finalize assessment
  update progress
  insert XP ledger
  insert analytics outbox event
COMMIT

worker → publish/process outbox event
```

This reduces the risk of durable business state being committed while the analytics event disappears.

## 10. Redis responsibilities

Allowed uses:

- cache;
- BullMQ data;
- rate limiting;
- PvP transient match state;
- reconnect windows;
- optional Socket.IO adapter when horizontally scaled.

Not allowed as sole durable source:

- final assessment result;
- level progress;
- XP history;
- completed PvP outcome;
- feedback/report/audit.

## 11. Scheduler responsibilities

`apps/worker` owns scheduled jobs unless a later ADR splits a dedicated scheduler.

Expected jobs:

- hourly leaderboard projection refresh;
- Wednesday 23:59 WIB leaderboard period close/archive;
- daily IRT batch trigger;
- continuous/retry outbox processing.

All business-calendar scheduling must explicitly use `Asia/Jakarta` rather than host timezone assumptions.

## 12. Storage

### PostgreSQL

Durable structured data.

### R2

Question/explanation/owned media. Persist `objectKey` and metadata in DB rather than relying on a permanent public URL.

### Video recommendation

Store curated YouTube/video metadata and links in PostgreSQL; do not perform web search at student request time.

## 13. Deployment target

Preferred production topology:

```text
Cloudflare DNS/CDN/R2
          │
          ▼
VPS: Next.js + NestJS + Worker (+ Redis initially)
          │
          ▼
Managed PostgreSQL + Supabase Auth
```

Fallback if budget forces self-hosting must be separately reviewed because it adds database/auth operational ownership.

## 14. Scale posture

Initial planning/test targets:

- 1,000–3,000 registered users planning range;
- 100 concurrent baseline;
- 500 concurrent normal engineering target;
- 1,000 concurrent stress target;
- WebSocket connection/load behavior tested separately from REST throughput.

These are engineering targets, not user-growth predictions.

## 15. Non-goals for initial architecture

Do not add without evidence/ADR:

- Kubernetes;
- service mesh;
- Kafka/Redpanda;
- Elasticsearch;
- full microservices split;
- GraphQL;
- direct browser-to-database business operations.
