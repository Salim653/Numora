# PRD v0.4 → Engineering Mapping

This document maps product requirements to implementation areas. It is not a replacement for the PRD.

| PRD area | Key product behavior | Primary backend modules | Primary frontend areas | Persistence / infrastructure | Test emphasis |
|---|---|---|---|---|---|
| §1 Product purpose | School-based TKA Math practice; progress, monitoring, quality, PvP | cross-cutting | all | analytics | product journey |
| §2 Scope/roles | Student/Teacher/Admin boundaries | identity, authorization | role route groups | users/memberships | cross-role access denial |
| §3 Auth/School/Class | Google login; school token; one-class Student | identity, schools, classes | onboarding, teacher verification, admin school | users, schools, token, memberships | token race, ownership, one-class uniqueness |
| §4 Material/Pretest | Chapter→Subchapter→Level; optional once/chapter | content, assessments, progress | core learning | taxonomy, package, attempt, level progress | OPEN policies, no duplicate pretest |
| §5 Drill | 10 questions, count-up, 70%, variants, 90-day explanation | assessments, progress, recommendations, XP | core learning | attempts, answers, variants, XP ledger | unlock, retry variant, duplicate submit |
| §6 Tryout/Scoring | 1/day WIB; backend package; PG MVP | assessments, tryout, scoring | core learning | attempt/package/scoring version | day-boundary race, package selection |
| §7 PvP | 1v1 realtime; shared questions; 20s reconnect | pvp gateway/match engine | PvP | Redis transient + PostgreSQL result | synchronization, authoritative score |
| §8 Leaderboard | class/PvP separated; hourly; Wed archive | leaderboard, XP | leaderboard pages | XP ledger, periods, projection/cache | no double count, archive, separation |
| §9 Monitoring/support | teacher dashboard, feedback, videos, reports | monitoring, feedback, videos, reports | teacher/admin/student support | feedback/reports/video metadata | resource ownership, read state |
| §10 Admin/content/IRT | content status, audit, historical integrity, IRT | admin, content, audit, IRT | admin | question versions, audit, IRT result | historical immutability |
| §11 Data/NFR | events, reliability, time, privacy, WebSocket/jobs | cross-cutting | states/accessibility | outbox, logging, Redis/BullMQ | idempotency, observability |
| §12 Handoff | module specs with I/O/states/validation/tests | all | all | contracts | DoR/DoD |
| §13 OPEN items | unresolved academic/product policy | policy abstractions | feature states | config/versioning | tests gated by approved policy |
| §14 Terms | canonical vocabulary | naming | labels | naming | terminology consistency |

## User stories to technical capabilities

| User story | Technical capability |
|---|---|
| US-01 join class | class code/link/QR resolution, membership transaction, one-class constraint |
| US-02 pretest | pretest eligibility, package selection, placement policy, progress unlock |
| US-03 repeat Drill | assessment persistence, variant rotation, scoring, progress, XP |
| US-04 tryout | daily eligibility, simulation package, result/explanation |
| US-05 PvP | WebSocket room/match state, Redis, durable result, PvP leaderboard |
| US-06 teacher monitoring | resource-scoped query, progress aggregation, feedback |
| US-07 content correction | question versioning, archive, immutable historical attempts |
| US-08 teacher verification | single-use token transaction + teacher-school membership |
| US-09 school operations | Admin school/token/class/member interfaces + audit |
| US-10 video report | recommendation metadata + report workflow |
| US-11 IRT | response extraction, daily batch, model/versioned result, admin display |

## Current dependency order

```text
Identity
  ↓
School verification / Class
  ↓
Content taxonomy & question model
  ↓
Assessment engine
  ├── Pretest
  ├── Drill
  └── Tryout
       ↓
Progress + XP ledger
  ├── Monitoring / Feedback
  └── Leaderboards

Content/question model also feeds:
  ├── PvP
  ├── Recommendation/reporting
  └── IRT/analytics
```

## Change-impact rule

Any PRD change must be checked against at least:

- API/OpenAPI;
- database schema/migrations;
- UI states;
- analytics events;
- test scenarios;
- documentation;
- data/AI content contract where applicable.
