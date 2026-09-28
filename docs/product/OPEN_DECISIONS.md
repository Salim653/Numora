# Open Decisions Register

**Product source:** PRD v0.4 §13.  
**Rule:** an OPEN item must not be silently resolved in implementation. Recommendations below are technical proposals, not product facts, unless approved by the stated owner(s).

## Decision status legend

- `OPEN` — unresolved.
- `BASELINE EXISTS` — PRD contains a usable baseline but some final parameters remain open.
- `TECH RECOMMENDATION` — engineering can implement an abstraction/default but PO/owner approval is still required.
- `BLOCKS FINAL` — final product behavior/publication cannot be completed safely before the item is resolved.

| ID | Product decision needed | Owner in PRD | Engineering treatment now | Impact |
|---|---|---|---|---|
| OPEN-01 | Chapter/subchapter/competency list, level count/order, completion definition | Curriculum + PO | Dynamic taxonomy and level schema; never hardcode level count | Blocks final pretest/progress semantics |
| OPEN-02 | Exact pretest question count/distribution | Curriculum + PO | Package-driven engine; demo fixtures only | Blocks final pretest package |
| OPEN-03 | Pretest duration, placement mapping, unlock cap | Curriculum + PO | `PretestPlacementPolicy`; no official mapping in code yet | Blocks final placement |
| OPEN-04 | PGK MCMA/Category scoring and rounding | Research & Curriculum + PO | Implement PG final; support extensible answer/scoring types | Blocks final PGK and some point semantics |
| OPEN-05 | Official tryout specification | Research & Curriculum + PO | Generic timed assessment engine + demo package | Blocks public/final tryout configuration |
| OPEN-06 | Brand/name/language/visual identity | PO + UI/UX | Design tokens and neutral components | Does not block backend |
| OPEN-07 | PvP invitation expiry/readiness/two-player disconnect edge cases | PO + Software + QA | Explicit state machine; TTL configurable; **proposed default 15 min only for demo if needed** | Blocks final edge behavior |
| OPEN-08 | Class end lifecycle and wrong-class correction with existing progress/XP | PO + Data | No self-transfer; preserve immutable history and delay destructive migration | Blocks class-transfer final behavior |
| OPEN-09 | Performance, browser, retention, backup/recovery, Google integration feasibility | Technical + PO | Engineering baselines below | Must be finalized before real-user release |
| OPEN-10 | Number of variants/packages and recommendation mapping | Curriculum + PO | Metadata-based mapping; no fixed count | Blocks content-completeness decision |
| OPEN-11 | Final XP formula | PO + Data | Versioned `XpPolicy`; XP ledger schema independent of formula | Blocks final Drill/Tryout XP |
| OPEN-12 | IRT threshold and parameters | Data + PO | PRD baseline: minimum 30 responses; persist `modelVersion` and sample size | Blocks final statistical configuration, not pipeline |
| OPEN-13 | Admin ban policy | PO | Generic restriction record with reason/start/end/revoke; no invented outcomes | Blocks final ban effects |
| OPEN-14 | Local password, if any | PO + Software | Recommend **no local password for MVP**; Google Auth for Student/Teacher and internally provisioned Admin identity | Needs PO approval |

## Engineering recommendations for OPEN-09

These were agreed as technical planning baselines, not PRD product claims:

### Capacity targets

- Registered-user planning range: ~1,000–3,000.
- Baseline load test: 100 concurrent.
- Normal engineering target: 500 concurrent.
- Stress target: 1,000 concurrent.
- Treat these as test targets, not forecasts.

### Browser support

- Mobile-first.
- Android Chrome and iOS Safari.
- Chrome/Edge/Firefox desktop.
- Target latest two major versions where practical.

### Accessibility

- Target WCAG 2.2 AA where feasible.

### Backup/recovery baseline

- RPO ≤ 24 hours.
- RTO ≤ 4 hours.
- Must be validated by an actual restore exercise before real-user release.

### Authentication feasibility

Recommended architecture: Supabase Auth + Google OAuth for Student/Teacher, with NestJS authorization. Do not replace auth provider between development and production unless an approved migration plan exists.

### Retention

Explicit PRD rule exists for Drill explanation visibility (90 days) and Tryout explanation (unlimited). Other retention periods remain unapproved; do not automatically delete attempts, analytics, audit, XP, PvP history, or IRT inputs until policy is approved.

## Clarifications created by PRD text inconsistencies

### CLARIFICATION-001 — Drill timeout semantics

**Observed text:** timer is “count-up, unlimited,” but DRL text/acceptance still references timer completion/timeout.  
**Engineering baseline:** no hidden product timeout. Compute duration from server timestamps; support only user submit until PO clarifies otherwise.  
**Owner:** PO + Software/QA.  
**Status:** OPEN clarification.

### CLARIFICATION-002 — Tryout retry wording

**Observed text:** one older paragraph says tryout can be repeated without limit, while v0.4 summary, detailed bullet, and TRY-AC1 specify limit 1× per day.  
**Engineering baseline:** enforce one start per `Asia/Jakarta` calendar day.  
**Owner:** PO.  
**Status:** daily limit treated as current v0.4 decision; textual cleanup recommended.

### CLARIFICATION-003 — Drill 90-day “storage” wording

**Observed text:** PRD frames 90-day Drill explanation as storage efficiency while also requiring historical result/version integrity.  
**Engineering recommendation:** retain attempt/question/scoring history; restrict explanation access after 90 days rather than destructively deleting historical assessment context unless PO explicitly requires physical deletion.  
**Owner:** PO + Data + Software.  
**Status:** PROPOSED.

## Approval workflow

When an OPEN item is resolved:

1. PO/owner records the decision and effective date.
2. Update PRD/module specification.
3. Update this file.
4. Identify impacted modules/contracts/schema/tests using `PRD_MAPPING.md`.
5. Create/update ADR only when the technical solution changes.
6. Implement through reviewed PR.
