# Open Decisions Register

**Product source:** team-approved PRD v0.5 §13, 28 September 2026. The PDF still bears its prior “draft for review” label; the team approval was confirmed by the Software Engineering coordinator on 28 September 2026.
**Rule:** an `OPEN` item must not be silently resolved. Approved PRD rules apply, while explicitly unresolved details remain open. Product decisions are made jointly with the responsible owners listed in the PRD; the Software Engineering coordinator coordinates FE/BE execution but does not unilaterally change academic/product policy.

## Status legend

- **PRD RULE** — stated behavior in team-approved v0.5, except details explicitly marked OPEN.
- **OPEN** — unresolved policy/academic detail.
- **PARTLY OPEN** — part of the decision is confirmed; remaining details are listed explicitly.
- **PROPOSED** — engineering recommendation awaiting owner agreement.
- **BLOCKS FINAL** — cannot publish the affected final behavior before resolution.

| ID | Decision needed | PRD owner | Baseline / treatment now | Impact |
|---|---|---|---|---|
| OPEN-01 | Bab/subbab/kompetensi, jumlah/urutan level, definisi tuntas | Curriculum + PO | PRD mentions 5 levels per subbab; keep taxonomy dynamic until Curriculum confirms | Blocks final content/progress |
| OPEN-02 | Distribution of 20 Pretest questions per subbab | Curriculum + PO | 20 total per bab is baseline; demo package only until distribution approved | Blocks final Pretest package |
| OPEN-03 | Placement mapping to at most 3 unlocked levels | Curriculum + PO | Perfect score can unlock at most 3; mapping for other outcomes is open | Blocks final placement |
| OPEN-04 | PGK MCMA/Category scoring and rounding | Research & Curriculum + PO | Publish PG scoring first; retain extensible question types | Blocks PGK |
| OPEN-05 | Official Tryout specification | Research & Curriculum + PO | Weekly package cadence is baseline; question count/duration/content still open | Blocks final Tryout publication |
| OPEN-06 | Name/positioning/language/visual identity | PO + UI/UX | Numora is current name; UI/UX supplied a v0.1 visual implementation baseline, but final identity/handoff remains open | Does not block backend |
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

## Clarifications and decision records

### CLARIFICATION-001 — Drill timeout

PRD v0.5 specifies an unlimited count-up timer but DRL-AC4 still mentions timeout. **Proposed engineering treatment:** no hidden product timeout; server tracks elapsed time for result/XP. Owner: PO + Software + QA. Status: OPEN.

### CLARIFICATION-002 — Drill explanation and history

PRD limits explanation access to 90 days while requiring immutable historic scores/content. **Proposed engineering treatment:** expire access to explanation without deleting attempt/version facts. Owner: PO + Data + Software. Status: PROPOSED.

### CLARIFICATION-003 — Sprint 2 mastery threshold

**Resolved 28 September 2026:** the Software Engineering coordinator confirmed the team's decision to follow approved PRD v0.5 for Sprint 2. Level 2 unlocks at **≥80%**; the supplied Sprint 2 Goal PDF's ≥70% is superseded. Record Sprint 2 acceptance and tests at 80%. This does not resolve any other OPEN item.

### CLARIFICATION-004 — Star at score 0

The PRD defines 1 star at 10–50, 2 at 60–90, and 3 at 100. It does not state how score 0 is shown. Owner: PO + UI/UX. Status: OPEN clarification.

### CLARIFICATION-005 — Level count wording

MAT-01 states 5 levels per subbab but also says Curriculum defines the number of levels; OPEN-01 repeats that dependency. The schema should stay flexible until the owner confirms whether five is a fixed MVP rule. Owner: Curriculum + PO. Status: OPEN.

### CLARIFICATION-006 — Prototype trial scope

**Confirmed by the coordinator, 28 September 2026:**

- Online staging ready around **12 October 2026** for real school Students/Teachers. Initial estimate: more than 20 Students and/or several Teachers/Classes; exact count pending.
- First trial covers only Admin → Teacher → School Student → Drill → Teacher progress. Mandiri, Pretest, Tryout, PvP, leaderboard, and feedback remain in PRD v0.5 but outside this first session.
- Admin UI lists/creates/edits/changes status of Schools and issues/reissues/revokes Teacher tokens.
- Teacher uses Google login and School token verification, creates a Class, then opens a Class list and Student detail showing level status and latest/best Drill score. Access stays limited to Classes that Teacher owns.
- Software and Curriculum prepare the 10 Level-1 PG demo questions with exactly four options `A`–`D` and simple inline LaTeX in text; Curriculum reviews them before the school trial. They remain visibly labeled demo while final Curriculum material is unavailable. The existing question JSON schemas are for Data/AI import, not the demo fixture format; this prototype choice does not resolve final academic content policy.
- Product/Design and the school coordinate school permission, participant/guardian consent where needed, and demo-content notice.
- The first partner school has not been selected yet; Product/Design's coordination with a school remains a trial dependency.
- Trial cannot start if login, authorization, answer/result persistence, or the 80% scoring/unlock rule fails.
- The staging domain and access to Supabase/Google OAuth are not available yet and must be provisioned before online trial verification.
- UI/UX will prepare designs/wireframes later; a simple mock UI is accepted for the first school trial if the connected flow and basic accessibility work.

The supplied Sprint 2 Goal defines one Student vertical slice and excludes *full* Admin/Teacher UI from sprint blockers; the specified Admin/Teacher actions are additional prototype requirements. The first partner school has **not been selected**. The **team will decide together** which staging host to use and who owns its setup; no provider or accountable owner is confirmed yet, and the monthly budget is **not set**. DevOps for the domain and Database for Supabase/Google OAuth are **tentative owners pending team confirmation**. Exact participant count, staging hosting/OAuth configuration, and QA evidence still need scoping. Owner: PO + Software + QA. **Status: PARTLY OPEN.**

**ENGINEERING UPDATE, 29 September 2026:** the Database team prepared a shared Supabase Cloud Development project. Development now uses Cloud PostgreSQL/Auth and no longer requires Supabase Local. The Database team owns Google provider/dashboard configuration for this migration. This does not close the separate staging domain, OAuth, hosting, or trial-readiness dependencies above.

## Decision workflow

When a joint decision is reached, record its owner/date and update the PRD or module specification first; then update this register, `PRD_MAPPING.md`, affected contracts/schema/tests, and an ADR only if architecture changes. The original PDF metadata should be synchronized with the team's approval record when its owner republishes it.
