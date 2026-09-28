# Sprint 2 — First Core Learning Vertical Slice

**Sources:** “Sprint 2 Goal.pdf” and the team-approved PRD v0.5, both supplied by the Software Engineering coordinator on 28 September 2026. The coordinator confirmed that PRD v0.5's 80% mastery rule applies to Sprint 2 and that the two-week prototype also needs Teacher UI for class creation and progress viewing. This file records scope and decisions, not implementation completion.

## Goal

Complete one Student flow through real Frontend → API → PostgreSQL → domain scoring/progress → persisted result → updated UI. Seeded/demo content is allowed when clearly labeled. A newly authenticated Student should join a Class, complete a seeded Level-1 Drill, see a stored score, and unlock Level 2 at **≥80%**.

## Main flow

`Google login → Student profile → Join Class → Minimal dashboard → Chapter → Subchapter → Level 1 → Start Drill → Answer 10 single-choice questions → Submit → Score/result → Progress updated → Level 2 unlocked at ≥80%`.

## Must have from Sprint 2 Goal

- Google login and Student identity mapped to an internal user/profile.
- Join Class using a valid code.
- Minimal dashboard and Chapter/Subchapter/Level navigation.
- Seeded single-choice questions and creation of a Drill attempt.
- Persist answers; submit idempotently; score on a 0–100 scale.
- Persist the result and progress; unlock the next level at the approved **80%** threshold.
- Show the result and basic explanation.

## Should have if time permits

- Autosave status and resume after refresh.
- Latest/best score and basic attempt history.
- Complete loading/error/empty UI states.
- Basic analytics events.

## Not a blocker for this sprint

Final Pretest placement, Tryout, PvP, leaderboards, final XP formula, **full** Teacher/Admin UI, IRT, video recommendations, reporting, and advanced monitoring. The separate prototype trial target still requires **Teacher class creation and Student progress viewing through UI**.

## Resolved threshold discrepancy

The supplied Sprint 2 Goal PDF says **≥70%**, but approved PRD v0.5 says **≥80%**. On 28 September 2026, the Software Engineering coordinator confirmed the team's agreement to use the newer PRD. Sprint 2 implementation and acceptance tests therefore use **≥80%**. See `docs/product/OPEN_DECISIONS.md` CLARIFICATION-003 for the decision record.

## Prototype milestone beyond Sprint 2

The coordinator's near-term goal is an initial prototype ready for trial with Students and Teachers around two weeks after 28 September 2026 (approximately 12 October 2026). This is a planning target, not a confirmed release date. In addition to the Student slice, Teacher must be able to create a Class and see the joined Student's progress through real UI backed by the API/database. Full Teacher monitoring/feedback remains outside the supplied Sprint 2 Goal. Teacher verification/onboarding details, real/demo account setup, content review, pilot environment, privacy arrangements, and QA evidence still need joint scoping. See CLARIFICATION-006.
