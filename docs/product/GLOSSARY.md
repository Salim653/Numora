# Project Glossary

Canonical terms should be used consistently across product docs, code, API, database, and analytics.

| Term | Canonical meaning |
|---|---|
| Admin | Internal platform operator role that manages schools, tokens, operational data, content, reports, IRT, analytics, and audit. |
| School | Parent organizational entity that contains verified Teachers and their Classes. |
| Teacher Verification Token | Single-use credential issued for a School; valid 3×24 hours and consumed by a Teacher verification. |
| Teacher | Google-authenticated user who has completed School verification and can manage own Classes/Student progress. |
| Student | Google-authenticated learner; at most one Class membership in the current version. |
| Class | Teacher-managed learning group joined through code/QR/link. |
| Chapter | Top-level curriculum grouping. DB/API preferred identifier: `chapter`. |
| Subchapter | Child curriculum grouping within a Chapter. |
| Competency | Academic competency metadata used for content/assessment mapping. |
| Level | Drill stage within one Subchapter. Count/order remain Curriculum-defined. |
| Level unlocked | Student is authorized to start Drill for that Level. |
| Level completed | Student satisfies the Drill mastery rule for that Level. |
| Pretest | Optional assessment, at most once per Chapter, used to determine initial Level access per Subchapter. |
| Drill | Repeatable Level-focused practice. v0.4 baseline uses 10 questions, count-up timer, 70% mastery. |
| Tryout | TKA Mathematics simulation with daily start limit and official configuration still dependent on OPEN-05. |
| Assessment Attempt | One persisted execution of an assessment package by a Student. |
| Question | Logical item identity. |
| Question Version | Immutable/preserved content context used by an attempt. |
| Variant | Equivalent question form with changed numeric variables/case but same competency/difficulty/type. |
| Raw Point | Item points before normalization to 0–100 assessment score. |
| Score | Assessment result on 0–100 scale. |
| XP | Activity points from Drill/Tryout/PvP. Exact final formula is OPEN-11. |
| XP Ledger | Immutable record of XP source and amount. |
| Class Leaderboard | Per-class ranking from Drill + Tryout XP; not an academic ability measure. |
| PvP | Realtime 1v1 question match with server-authoritative timer/scoring. |
| Best XP | Best valid PvP session score used for PvP leaderboard. |
| Forfeit | PvP loss caused by deliberate exit or failing to reconnect within allowed window. |
| Feedback | One-way Teacher note to Student, maximum 1,000 characters. |
| Question Report | Student report about question/answer/key/explanation/content quality. |
| Video Report | Student report that a recommended video is not relevant/problematic. |
| IRT | Item Response Theory analysis calculated in daily batch, shown per question when sufficient responses exist. |
| Archive | Preserved historical data that is no longer the current active period/content state. |
| Product Rule | Behavior owned by PO/PRD. |
| Engineering Decision | Technical implementation choice owned by engineering and captured in ADR. |
| OPEN Item | Product/academic decision not yet final and not safe to invent. |
