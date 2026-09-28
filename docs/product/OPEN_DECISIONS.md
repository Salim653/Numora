# Open Decisions Register

**Product source:** PRD v0.5 §13, 28 September 2026 (consolidated draft for review).
**Rule:** an `OPEN` item must not be silently resolved. A PRD baseline can guide a demo or schema, but does not make its unresolved details final. Product decisions are made jointly with the responsible owners listed in the PRD; the Software Engineering coordinator coordinates FE/BE execution but does not unilaterally change academic/product policy.

## Status legend

- **PRD BASELINE** — stated behavior in v0.5 usable for planning while the PRD is reviewed.
- **OPEN** — unresolved policy/academic detail.
- **PROPOSED** — engineering recommendation awaiting owner agreement.
- **BLOCKS FINAL** — cannot publish the affected final behavior before resolution.

| ID | Decision needed | PRD owner | Baseline / treatment now | Impact |
|---|---|---|---|---|
| OPEN-01 | Bab/subbab/kompetensi, jumlah/urutan level, definisi tuntas | Curriculum + PO | PRD mentions 5 levels per subbab; keep taxonomy dynamic until Curriculum confirms | Blocks final content/progress |
| OPEN-02 | Distribution of 20 Pretest questions per subbab | Curriculum + PO | 20 total per bab is baseline; demo package only until distribution approved | Blocks final Pretest package |
| OPEN-03 | Placement mapping to at most 3 unlocked levels | Curriculum + PO | Perfect score can unlock at most 3; mapping for other outcomes is open | Blocks final placement |
| OPEN-04 | PGK MCMA/Category scoring and rounding | Research & Curriculum + PO | Publish PG scoring first; retain extensible question types | Blocks PGK |
| OPEN-05 | Official Tryout specification | Research & Curriculum + PO | Weekly package cadence is baseline; question count/duration/content still open | Blocks final Tryout publication |
| OPEN-06 | Name/positioning/language/visual identity | PO + UI/UX | Numora is current name; brand can still be reviewed | Does not block backend |
| OPEN-07 | PvP invite expiry and two-player disconnect/readiness edges | PO + Software + QA | Explicit state machine; no undocumented final outcome | Blocks final edge behavior |
| OPEN-08 | Class end and wrong-class correction with history | PO + Data | No self-transfer; preserve immutable history | Blocks correction/transfer flow |
| OPEN-09 | Performance, browser, retention, backup/recovery, Google integration | Technical + PO | Engineering planning targets below | Must close before broader real-user release |
| OPEN-10 | Variant/package counts and video mapping | Curriculum + PO | Metadata-driven mapping; no assumed final count | Blocks content completeness |
| OPEN-11 | Final XP formula | PO + Data | PRD gives Drill baseline `(correct × 100) + max(0, (15 − minutes) × 10)`; policy version needed | Blocks final XP semantics |
| OPEN-12 | IRT model/parameter details | Data + PO | Minimum 30 respondents and daily batch are PRD baselines | Blocks final statistical configuration |
| OPEN-13 | Admin ban policy | PO | Represent restriction with status/reason; avoid invented effects | Blocks final ban behavior |
| OPEN-14 | Local password, if any | PO + Software | Google for Student/Teacher; internal Admin | Needs PO decision if local passwords are desired |
| OPEN-15 | Conversion School ↔ Mandiri on leaving class | PO + Data | Joining class changes affiliation; no self-leave or automatic downgrade in v0.5 | Blocks exit/downgrade behavior |
| OPEN-16 | Admin sub-role split | PO + Software | One Admin role in v0.5 | Deferred |
| OPEN-17 | Tryout price/payment method | PO + Software | Payment deferred from MVP; Mandiri Tryout remains unavailable | Deferred |
| OPEN-18 | IRT batch duration for weekly Tryout package | Data + PO | PRD says result/explanation after IRT, target max 3×24h after package ends | Blocks final release timing/failure rule |

## Engineering recommendations for OPEN-09

These are planning targets, not confirmed product performance or privacy policy:

- 1,000–3,000 registered users planning range; load scenarios of 100 baseline, 500 target, 1,000 stress.
- Mobile-first; Android Chrome/iOS Safari and desktop Chrome/Edge/Firefox, latest two major versions where practical.
- WCAG 2.2 AA where feasible.
- Backup planning RPO ≤24h and RTO ≤4h, validated through a restore exercise before broad release.
- Supabase Auth + Google OAuth for Student/Teacher, NestJS authorization. Do not change providers without a migration plan.
- Drill explanation access is 90 days. Tryout result/explanation access is gated by IRT; historical retention and other deletion periods require a separate policy. Do not auto-delete attempts, XP, events, audit, PvP history, or IRT inputs.

## Clarifications to discuss together

### CLARIFICATION-001 — Drill timeout

PRD v0.5 specifies an unlimited count-up timer but DRL-AC4 still mentions timeout. **Proposed engineering treatment:** no hidden product timeout; server tracks elapsed time for result/XP. Owner: PO + Software + QA. Status: OPEN.

### CLARIFICATION-002 — Drill explanation and history

PRD limits explanation access to 90 days while requiring immutable historic scores/content. **Proposed engineering treatment:** expire access to explanation without deleting attempt/version facts. Owner: PO + Data + Software. Status: PROPOSED.

### CLARIFICATION-003 — Sprint 2 mastery threshold

The supplied Sprint 2 Goal PDF says Level 2 unlocks at **≥70%**, while PRD v0.5 says **≥80%**. The older number must not become an unstated exception. Until joint clarification, docs use 80% as the latest PRD baseline and mark the Sprint 2 acceptance threshold as a conflict. Owner: PO + Software + QA. Status: OPEN clarification.

### CLARIFICATION-004 — Star at score 0

The PRD defines 1 star at 10–50, 2 at 60–90, and 3 at 100. It does not state how score 0 is shown. Owner: PO + UI/UX. Status: OPEN clarification.

### CLARIFICATION-005 — Level count wording

MAT-01 states 5 levels per subbab but also says Curriculum defines the number of levels; OPEN-01 repeats that dependency. The schema should stay flexible until the owner confirms whether five is a fixed MVP rule. Owner: Curriculum + PO. Status: OPEN.

### CLARIFICATION-006 — Prototype trial scope

The coordinator targets a prototype ready for Student and Teacher trial in about two weeks, whereas the supplied Sprint 2 Goal defines one Student vertical slice and excludes full Teacher UI from sprint blockers. Confirm minimum Teacher-visible functionality, pilot participants, and trial environment before declaring the prototype ready. Owner: PO + Software + QA. Status: OPEN.

## Decision workflow

When a joint decision is reached, record its owner/date and update the PRD or module specification first; then update this register, `PRD_MAPPING.md`, affected contracts/schema/tests, and an ADR only if architecture changes. The PRD draft status should be recorded as approved only when the owners actually approve it.
