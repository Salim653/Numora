# Module Boundaries

The backend is a modular monolith. Modules own business behavior, not merely tables.

## Recommended modules

| Module | Owns | Depends on |
|---|---|---|
| `identity` | internal user, role/status mapping, auth context | auth provider |
| `schools` | school, teacher verification token, teacher-school membership | identity, audit |
| `classes` | class lifecycle, join code/link, student membership | identity, schools |
| `content` | taxonomy, question/version/variant, package metadata, content status | audit |
| `assessments` | attempt lifecycle, package instance, answers, finalization | content, scoring, identity |
| `scoring` | scoring policy interfaces/versions | content |
| `progress` | level access/completion, latest/best score | assessments |
| `xp` | XP policy interface and immutable ledger | assessments/PvP |
| `tryout` | free all-Student package eligibility, 35-item/three-format contract, countdown finalization, one attempt/package, immutable IRT release | assessments, IRT |
| `leaderboards` | periods/projections/archive | XP, PvP results |
| `pvp` | cross-affiliation room/invite/match state, scoring orchestration | content, identity, XP |
| `monitoring` | teacher-facing aggregates | classes, progress, assessments |
| `feedback` | one-way teacher notes/read state | classes, identity |
| `videos` | curated recommendation metadata | content |
| `reports` | question/video reports and admin workflow | content, videos |
| `irt` | result persistence/job orchestration | assessment response data |
| `analytics` | outbox/event envelope | all producing modules |
| `audit` | actor/time/change record | cross-cutting |
| `admin` | admin application services/queries | multiple modules, no duplicate core rules |

## Boundary rules

1. A module should call another module's application/domain interface rather than reaching directly into its internal repository where practical.
2. `admin` is not allowed to duplicate content/school business rules; it orchestrates authorized admin use cases.
3. `leaderboards` consumes XP/PvP sources; it must not independently invent XP.
4. `monitoring` aggregates existing learning data; it must not modify learning results.
5. `irt` produces the initial TryOut weighted result; it never rewrites released or historical Student scores.
6. `pvp` reuses the shared question/content model and must not introduce an incompatible PvP-only question representation.
7. `web` must not own authoritative scoring/progress rules.

## Dependency shape

```text
identity
  ├── schools ── classes
  │                │
content ── assessments ── progress
   │          │          │
   │          ├── xp ─── leaderboards
   │          ├── monitoring
   │          └── analytics
   │
   ├── pvp ── xp / leaderboard
   ├── videos / reports
   └── irt (through response dataset)
```

Avoid circular dependencies. When a cycle appears, extract a stable shared contract/value object rather than importing entire modules into each other.

## Frontend route/module suggestion

```text
/student/*
/teacher/*
/admin/*
```

Shared feature folders should reflect domain capabilities, e.g. `features/assessments`, `features/classes`, not generic `components/pageA` structures.

## Feature policy ownership

[Latest Core Learning PRDs](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md) leave XP formulas, star mapping, retention, placement, duration/scale and model policy OPEN. `progress` owns highest valid best score and irreversible unlock; `assessments` owns save/finalize/manual-auto race; `tryout` owns Ongoing/Past and release gating; `irt` owns versioned computation. Curriculum supplies bank/packages. Existing `admin` CRUD remains a separate operational capability outside the student feature scope.
