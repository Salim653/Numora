# Release Checklist

## Product / requirement

- [ ] Latest PRD/module spec reviewed.
- [ ] For the prototype school trial, clearly label demo Level-1 questions and explain that their scores are not official TKA ability measures.
- [ ] Curriculum has reviewed the demo questions, answer keys, and explanations before school participants use them.
- [ ] OPEN items affecting released behavior are resolved or feature remains disabled/non-final.
- [ ] Acceptance criteria mapped to test evidence.
- [ ] No demo policy is accidentally presented as official product policy.

## Code / contract

- [ ] `main` CI green.
- [ ] OpenAPI/JSON/event contracts current.
- [ ] Migrations reviewed and rehearsed.
- [ ] Runtime and migration database credentials point to the intended environment; migration uses the approved direct connection.
- [ ] Development data/Auth is isolated from real-user staging; BullMQ prefixes differ by environment/developer.
- [ ] DEMO seed has not run against staging or production.
- [ ] Feature flags/config correct for environment.
- [ ] No debug endpoints or secrets.

## Security / privacy

- [ ] Product/Design and school confirm permission, participant/guardian consent where needed, and the demo-content notice before real school users enter staging.
- [ ] Auth and resource authorization tested.
- [ ] Admin access internally provisioned.
- [ ] Teacher token flow server-side, single-use, expiry tested.
- [ ] CORS/rate limits/config reviewed.
- [ ] Logs/monitoring scrub secrets and unnecessary PII.
- [ ] Privacy/retention policy approved before real Student rollout.

## Reliability

- [ ] Backup recent.
- [ ] Restore procedure tested according to release stage.
- [ ] Health endpoints pass.
- [ ] Queue/scheduler running.
- [ ] Leaderboard hourly and weekly jobs verified.
- [ ] IRT job safely handles insufficient data.

## QA

- [ ] Prototype chain verified on staging: Admin lists/creates/edits School and manages token in UI → Teacher Google login/verifies token/creates Class → Student joins/completes Drill → Teacher opens Class/Student detail and views persisted progress in UI.
- [ ] A Teacher cannot see Student progress from another Teacher's Class.
- [ ] Do not begin the school trial if login, cross-role/Class authorization, answer/result persistence, or 80% scoring/unlock fails.
- [ ] Student core flow smoke test.
- [ ] Teacher verification/class/monitoring smoke test.
- [ ] Admin school/content/report smoke test.
- [ ] PvP smoke/reconnect test if enabled.
- [ ] Mobile target browsers checked.
- [ ] Loading/error/empty/access-denied states checked.

## Performance

Before real-user release:

- [ ] 100 concurrent baseline tested.
- [ ] 500 concurrent target scenario tested.
- [ ] 1,000 concurrent stress scenario observed/documented.
- [ ] WebSocket/PvP connection scenario separately tested.

## Sign-off

Record date and approval/status from:

- Product Owner
- Project Manager
- Software Engineering
- QA
- DevOps/Platform as applicable

## Core Learning gates from latest feature PRDs

[Source reconciliation and full AC references](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md). Apply when releasing the respective feature; the first school trial retains its recorded Drill scope.

- [ ] Drill DRL-AC-01–24 and TryOut TRY-AC01–25 mapped to reviewable evidence.
- [ ] Free TryOut access works for Mandiri and School Students; no class/payment prerequisite.
- [ ] TryOut 35-item packages and all PG/PGK MCMA/Category interactions/rubrics verified.
- [ ] Countdown no pause; auto-submit at 0 works without browser requests and races safely with manual submit.
- [ ] Waiting/processing hides score/key/explanation; result release occurs ≤3×24h after approved batch end and never changes after release.
- [ ] Duration/TKA scale/model/low-response/batch schedule/past never-attempted eligibility finalized; no assumptions from PG demo fixtures.
- [ ] Drill <15min bonus eligibility, irreversible unlock, best score/history, retry/fallback and failed-only max-three YouTube/report verified.
- [ ] XP/star formulas, Pretest mapping, retention and session/exit policy finalized; legacy 90-day access/old star ranges not mislabeled PRD rules.
- [ ] Analytics vocabulary/payload approved; no duplicate final result/XP/history/outbox contribution.
- [ ] Curriculum supplies reviewed content; existing Admin CRUD does not expand student-feature scope or expose parameter editors.
