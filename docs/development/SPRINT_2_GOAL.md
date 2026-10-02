# Sprint 2 — First Core Learning Vertical Slice

**Sources:** “Sprint 2 Goal.pdf” and the team-approved PRD v0.5, both supplied by the Software Engineering coordinator on 28 September 2026. The coordinator confirmed that PRD v0.5's 80% mastery rule applies to Sprint 2 and that the two-week prototype also needs Teacher UI for class creation and progress viewing. This file records scope and decisions, not implementation completion. **Update 2 October 2026:** [Drill v1.2 and TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md) supersede conflicting feature rules; the previously agreed first-trial scope below is retained.

**ENGINEERING UPDATE, 29 September 2026:** a shared Supabase Cloud Development project is prepared for the Google Auth/PostgreSQL integration. This does not remove the separate staging provisioning dependency for the school trial.

## Goal

Complete one Student flow through real Frontend → API → PostgreSQL → domain scoring/progress → persisted result → updated UI. Curriculum has not supplied final Level-1 content yet, so Software and Curriculum will prepare 10 demo single-choice questions with four options `A`–`D` and text/simple inline LaTeX; Curriculum will review them before the trial, and the UI will label them as demo. A newly authenticated Student should join a Class, complete a seeded Level-1 Drill, see a stored score, and unlock Level 2 at **≥80%**.

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

Final Pretest placement, full TryOut (35 questions, three formats, free all Students), PvP, leaderboards, final XP/star/retention policies, **full** Teacher/Admin UI, IRT, video recommendations, reporting, and advanced monitoring. The separate prototype trial target still requires **Teacher class creation and Student progress viewing through UI**.

## Resolved threshold discrepancy

The supplied Sprint 2 Goal PDF says **≥70%**, but approved PRD v0.5 says **≥80%**. On 28 September 2026, the Software Engineering coordinator confirmed the team's agreement to use the newer PRD. Sprint 2 implementation and acceptance tests therefore use **≥80%**. See `docs/product/OPEN_DECISIONS.md` CLARIFICATION-003 for the decision record.

## Prototype milestone beyond the supplied Sprint 2 Goal

The coordinator's near-term goal is **online staging ready for trial around 12 October 2026** with real Students and Teachers from a school. The partner school has **not been selected yet**. The first trial tests only **Admin → Teacher → School Student → Drill → Teacher progress**. It excludes the Mandiri, Pretest, Tryout, PvP, leaderboard, and feedback flows from this first session. The expected first cohort is **more than 20 Students and/or several Teachers/Classes**; the exact count still needs confirmation. This is a readiness target, not a claim that the trial is completed by that date.

The minimum connected prototype flow is:

1. Admin uses UI to list/create/edit/change School status and to issue, reissue, or revoke single-use Teacher verification tokens.
2. Teacher uses Google login, chooses the School, verifies the token through UI, creates a Class, and shares its join code.
3. Student uses Google login, joins the Class, completes the seeded Level-1 Drill, and sees persisted result/progress at the approved 80% unlock threshold.
4. Teacher opens a Class list, then an authorized Student's detail, to view **level status and latest/best Drill score** through UI backed by the API/database.

Full Teacher monitoring/feedback and Admin functions beyond School/token management remain outside the supplied Sprint 2 Goal; the specific Admin/Teacher actions above are additional **prototype trial requirements**. Teacher may see progress only for Classes they own. The trial must **not begin** if login, resource authorization, answer/result persistence, or 80% unlock/scoring fails. Demo content is drafted by Software with Curriculum, contains simple text/math formulas, and is reviewed by Curriculum before the trial; results must not be presented as official TKA ability measurement. Product/Design coordinates school permission, participant/guardian consent where needed, and the demo-content notice with the school. The staging domain and Supabase/Google OAuth project access **are not available yet**; provisioning and callback setup are dependencies. Exact participant count and QA evidence still need joint scoping. See CLARIFICATION-006.

UI/UX designs or wireframes are still being prepared. A **simple mock UI is acceptable for the first school trial** if the connected flow and basic accessibility work. For this temporary UI, follow the team-supplied [NUMORA UI design-system baseline](../design/README.md): centralize tokens and shared components so the eventual approved UI handoff can refine presentation without changing product behavior. The team will **jointly decide** the staging host and accountable setup owner; neither has been selected yet. DevOps handling the domain and the Database team handling Supabase/Google OAuth remain tentative responsibilities pending team confirmation.

## Feature PRD alignment dependencies

Drill retains the prototype 10-question/80 unlock flow. Latest acceptance also requires no-pause count-up, <15min bonus eligibility (formula TBC), completed-level retry with equivalent variants/fallback pending, separate history/highest best score, honest save states and refresh/exit warnings, failed-only max-three YouTube/report. XP/star formulas and retention are now DRL-OPEN; legacy values do not become trial policy by being implemented. Confirm the subset and pending-policy display with PO/QA before trial. New TryOut access rules do not automatically add TryOut to the first school session.
