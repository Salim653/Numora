# PRD v0.5 → Engineering Mapping

This document maps the team-approved PRD v0.5 (28 September 2026) to implementation areas. It is not a replacement for the PRD. The Sprint 2 Student slice and additional Teacher prototype UI are recorded in `docs/development/SPRINT_2_GOAL.md`.

| PRD area | Key product behavior | Primary backend modules | Primary frontend areas | Persistence / infrastructure | Test emphasis |
|---|---|---|---|---|---|
| §1 Product purpose | TKA Math practice for Mandiri and School Students; progress, monitoring, quality, PvP | cross-cutting | all | analytics | both Student journeys |
| §2 Scope/roles | Student affiliation (Mandiri/School); Student/Teacher/Admin roles; deferred payment | identity, authorization | role route groups, affiliation states | users/memberships | cross-role and cross-affiliation access |
| §3 Auth/School/Class | Google login; school token; join changes affiliation; one-class Student | identity, schools, classes | onboarding, teacher verification, admin school | users, schools, token, memberships | token race, ownership, one-class uniqueness, Mandiri access |
| §4 Material/Pretest | Chapter→Subchapter→Level; 20 questions/chapter; max 3 unlocked levels on perfect pretest | content, assessments, progress | core learning | taxonomy, package, attempt, level progress | OPEN distribution/placement; no duplicate pretest |
| §5 Drill | 10 questions, count-up, 80% mastery, stars, variants, 90-day explanation, baseline XP | assessments, progress, recommendations, XP | core learning | attempts, answers, variants, progress, XP ledger | 80% unlock, stars, retry, idempotency |
| §6 Tryout/Scoring | Weekly shared package Monday 00:00 WIB; one attempt/package; result after IRT; PG MVP | assessments, tryout, scoring, IRT | core learning | package period, attempt, scoring/IRT version | shared package, weekly boundary, gated result |
| §7 PvP | 1v1 realtime across Mandiri/School; classmate invite only for School; 20s reconnect | pvp gateway/match engine | PvP | Redis transient + PostgreSQL result | cross-type access, synchronization, authoritative score |
| §8 Leaderboard | class Drill+Tryout XP vs global PvP best XP; hourly; Wed archive | leaderboard, XP | leaderboard pages | XP ledger, periods, projection/cache | no double count, archive, separation, all-Student PvP |
| §9 Monitoring/support | teacher dashboard, feedback, videos, reports | monitoring, feedback, videos, reports | teacher/admin/student support | feedback/reports/video metadata | resource ownership, read state |
| §10 Admin/content/IRT | content status, audit, historical integrity, IRT | admin, content, audit, IRT | admin | question versions, audit, IRT result | historical immutability |
| §11 Data/NFR | events, reliability, time, privacy, WebSocket/jobs | cross-cutting | states/accessibility | outbox, logging, Redis/BullMQ | idempotency, observability |
| §12 Handoff | module specs with I/O/states/validation/tests | all | all | contracts | DoR/DoD |
| §13 OPEN items | OPEN-01–18 plus documented ambiguities | policy abstractions | feature states | config/versioning | tests gated by approved policy |
| §14 Terms | canonical vocabulary | naming | labels | naming | terminology consistency |

## User stories to technical capabilities

| User story | Technical capability |
|---|---|
| US-01 join class | class code/link/QR resolution, membership transaction, one-class constraint |
| US-02 pretest | pretest eligibility, package selection, placement policy, progress unlock |
| US-03 repeat Drill | assessment persistence, variant rotation, scoring, progress, XP |
| US-04 tryout | weekly shared package, one attempt/package, IRT-gated result/explanation |
| US-05 PvP | cross-affiliation WebSocket room/match state, Redis, durable result, global PvP leaderboard |
| US-06 teacher monitoring | resource-scoped query, progress aggregation, feedback |
| US-07 content correction | question versioning, archive, immutable historical attempts |
| US-08 teacher verification | single-use token transaction + teacher-school membership |
| US-09 school operations | Admin school/token/class/member interfaces + audit |
| US-10 video report | recommendation metadata + report workflow |
| US-11 IRT | response extraction, daily batch, model/versioned result, admin display |
| US-12 Mandiri upgrade | join Class and change affiliation without losing historical learning state; School exit behavior OPEN-15 |
| US-13 stars | derive 1–3 stars from Drill score independently of 80% unlock and XP |

## Sprint 2 slice and dependency

**ENGINEERING UPDATE, 29 September 2026:** the initial identity slice now targets the shared Supabase Cloud Development project. Next.js handles Google Auth; NestJS verifies the token and owns internal role/authorization state. The Database team applies committed Drizzle migrations once to Development. This does not add Class/Drill behavior or resolve any OPEN product item.

The supplied Sprint 2 Goal targets `Google login → Student profile → join Class → demo Level-1 Drill → persisted score/result → progress → Level-2 unlock`. Scope includes FE/API/PostgreSQL integration and idempotent submit. The team confirmed that approved PRD v0.5's **80%** threshold supersedes the PDF's 70%. For the two-week prototype trial with real school users on online staging, **Admin UI lists/creates/edits Schools and issues/reissues/revokes tokens → Teacher Google login and token verification UI → Teacher creates Class → School Student joins and completes Drill → Teacher opens Class list and Student detail for level status and latest/best score**. Level-1 questions are clearly labeled demo content until Curriculum supplies validated questions. Mandiri is outside the first trial. These are additional trial requirements, while the Sprint 2 PDF excludes *full* Admin/Teacher UI from its blockers. Trial starts only when login, authorization, persistence, and 80% scoring/unlock work without critical failures. See `SPRINT_2_GOAL.md`.

Prototype content clarification from the Software Engineering coordinator: the 10 demo `SINGLE_CHOICE` questions use four options `A`–`D` and simple inline LaTeX. Existing question JSON schemas cover Data/AI import, not these internal fixtures or Student-facing responses. Curriculum reviews the demo content before the school trial; see `docs/data/QUESTION_CONTRACT.md`.

## Current dependency order

```text
Identity ──┬── Mandiri Student
           └── School verification / Class ── School Student

Content taxonomy & question model
  ├── Assessment engine
  │     ├── Drill (both affiliations) ── Progress + XP ledger
  │     ├── Pretest (School; OPEN placement)
  │     └── Weekly Tryout (School MVP; IRT-gated result)
  ├── PvP (both affiliations) ── global PvP best XP
  ├── Recommendation / reporting
  └── IRT / analytics

Progress + XP ledger ── class leaderboard / monitoring / feedback
```

## Change-impact rule

**ENGINEERING IMPLEMENTATION, 1 October 2026:** Ferdi's canonical Drill package APIs, Student video/report support, and IRT integration boundary are described in [FERDI_CONTENT_SUPPORT](../api/FERDI_CONTENT_SUPPORT.md). See [implementation status](../development/FERDI_IMPLEMENTATION_2026-10-01.md) for handoffs and blockers. Canonical assessment consumption/migration, the Data model, and Tryout release policy remain dependencies; this update does not resolve OPEN items or declare the MVP ready.

Any PRD change must be checked against at least:

- API/OpenAPI;
- database schema/migrations;
- UI states;
- analytics events;
- test scenarios;
- documentation;
- data/AI content contract where applicable.

## Pemetaan implementasi area siswa ? 1 Oktober 2026

Dashboard/area siswa berada pada `modules/learning/student-dashboard.*` dan layout `app/student`; PvP pada `modules/pvp`, leaderboard pada `modules/leaderboards`, serta proyeksi worker `class-leaderboard.ts` yang juga membangun best record PvP. Kontrak REST/WebSocket dan migrasi 0007/0008 mencatat persistensi/versioning/idempotensi. **OPEN-07/OPEN-11 tetap OPEN**; fixture tes tidak menjadi perilaku produk. Lihat [status integrasi siswa](../development/STUDENT_AREA_IMPLEMENTATION.md).
