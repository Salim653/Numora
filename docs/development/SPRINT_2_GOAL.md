# Sprint 2 — First Core Learning Vertical Slice

**Source:** “Sprint 2 Goal.pdf” supplied by the Software Engineering coordinator on 28 September 2026. This file transcribes the sprint target and records its conflict with the newer PRD v0.5; it is not evidence that implementation is complete.

## Goal

Complete one Student flow through real Frontend → API → PostgreSQL → domain scoring/progress → persisted result → updated UI. Seeded/demo content is allowed when clearly labeled. A newly authenticated Student should join a Class, complete a seeded Level-1 Drill, see a stored score, and unlock Level 2 when the agreed mastery threshold is met.

## Main flow

`Google login → Student profile → Join Class → Minimal dashboard → Chapter → Subchapter → Level 1 → Start Drill → Answer 10 single-choice questions → Submit → Score/result → Progress updated → Level 2 unlocked if mastery is met`.

## Must have from Sprint 2 Goal

- Google login and Student identity mapped to an internal user/profile.
- Join Class using a valid code.
- Minimal dashboard and Chapter/Subchapter/Level navigation.
- Seeded single-choice questions and creation of a Drill attempt.
- Persist answers; submit idempotently; score on a 0–100 scale.
- Persist the result and progress; unlock the next level at the approved threshold.
- Show the result and basic explanation.

## Should have if time permits

- Autosave status and resume after refresh.
- Latest/best score and basic attempt history.
- Complete loading/error/empty UI states.
- Basic analytics events.

## Not a blocker for this sprint

Final Pretest placement, Tryout, PvP, leaderboards, final XP formula, full Teacher/Admin UI, IRT, video recommendations, reporting, and advanced monitoring. Their exclusion from this sprint does **not** remove them from PRD v0.5 or from later prototype/release decisions.

## Product-rule conflict to resolve

The supplied Sprint 2 Goal PDF says the unlock threshold is **≥70%**. PRD v0.5, dated 28 September 2026, raises it to **≥80%**. Until PO/Software/QA confirm an explicit sprint exception, **80% is the current PRD baseline**, and Sprint 2 acceptance at 70% is unresolved. See `docs/product/OPEN_DECISIONS.md` CLARIFICATION-003. Do not hardcode or test 70% as an approved v0.5 rule.

## Prototype milestone beyond Sprint 2

The coordinator's near-term goal is an initial prototype ready for trial with Students and Teachers around two weeks after 28 September 2026 (approximately 12 October 2026). This is a planning target, not a confirmed release date. The Sprint 2 Student slice alone does not establish Teacher trial readiness. Minimum Teacher flow, real/demo account setup, content review, pilot environment, privacy arrangements, and QA evidence need joint scoping. See CLARIFICATION-006.
