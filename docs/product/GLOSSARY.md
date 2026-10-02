# Project Glossary

Canonical terms should be used consistently across product docs, code, API, database, and analytics.

| Term | Canonical meaning |
|---|---|
| Admin | Internal platform operator role that manages schools, tokens, operational data, content, reports, IRT, analytics, and audit. |
| School | Parent organizational entity that contains verified Teachers and their Classes. |
| Teacher Verification Token | Single-use credential issued for a School; valid 3×24 hours and consumed by a Teacher verification. |
| Teacher | Google-authenticated user who has completed School verification and can manage own Classes/Student progress. |
| Student | Google-authenticated learner with Mandiri or School affiliation; at most one Class membership in the current version. |
| User Mandiri | Student without a Class; can use Drill, free MVP TryOut, create/share a PvP room, and view global PvP leaderboard. |
| User Terafiliasi Sekolah | Student who joined a Class and can use the school-scoped features available in v0.5. |
| Class | Teacher-managed learning group joined through code/QR/link. |
| Chapter | Top-level curriculum grouping. DB/API preferred identifier: `chapter`. |
| Subchapter | Child curriculum grouping within a Chapter. |
| Competency | Academic competency metadata used for content/assessment mapping. |
| Level | Drill stage within one Subchapter. Count/order remain Curriculum-defined. |
| Level unlocked | Student is authorized to start Drill for that Level. |
| Level completed | Student satisfies the Drill mastery rule for that Level. |
| Pretest | Optional 20-question assessment once for life per Chapter, no XP; Skip → Level 1 all Subchapters. All score-to-level mapping DRL-OPEN-04. |
| Drill | Repeatable Level-focused practice. v1.2 uses 10 questions, informational count-up with no pause/deadline, 80 mastery; equivalent retry, separate history and best score. |
| Ambang Ketuntasan | Minimum Drill score for next-level unlock: 80% in PRD v0.5; distinct from stars. |
| Star | Drill result motivation: 1–3 from final score only; all thresholds DRL-OPEN-03. Does not determine unlock. |
| Tryout | Free MVP simulation for all Students, 35 PG/PGK MCMA/PGK Category items, shared per batch, countdown auto-submit, one attempt/package. Released IRT result within 3×24h of batch end; duration/scale/model OPEN. |
| Assessment Attempt | One persisted execution of an assessment package by a Student. |
| Question | Logical item identity. |
| Question Version | Immutable/preserved content context used by an attempt. |
| Variant | Equivalent question form with changed numeric variables/case but same competency/difficulty/type. |
| Raw Point | Item points before normalization to 0–100 assessment score. |
| Score | Drill result on 0–100 scale. TryOut uses the Research/Curriculum-approved TKA scale, still TBC; do not assume the same scale. |
| XP | Activity points from Drill/Tryout/PvP. Drill base/failed-attempt XP/speed formula DRL-OPEN-01/02; <15min bonus eligibility. TryOut score-only, no duration bonus, mapping TRY-TBC-03. |
| XP Ledger | Immutable record of XP source and amount. |
| Class Leaderboard | Per-class ranking from Drill + Tryout XP; not an academic ability measure. |
| Global PvP Leaderboard | Ranking of all Mandiri and School Students by best valid PvP session XP per difficulty. |
| PvP | Realtime 1v1 question match with server-authoritative timer/scoring. |
| Best XP | Best valid PvP session score used for PvP leaderboard. |
| Forfeit | PvP loss caused by deliberate exit or failing to reconnect within allowed window. |
| Feedback | One-way Teacher note to Student, maximum 1,000 characters. |
| Question Report | Student report about question/answer/key/explanation/content quality. |
| Video Report | Student report that a recommended video is not relevant/problematic. |
| IRT | Item Response Theory analysis calculated in daily batch, shown per question when at least 30 respondents exist; also provides weighted TryOut scoring before result/explanation release. The 30-respondent baseline for Admin is not automatically a final TryOut low-response policy. |
| Archive | Preserved historical data that is no longer the current active period/content state. |
| Product Rule | Behavior owned by PO/PRD. |
| Engineering Decision | Technical implementation choice owned by engineering and captured in ADR. |
| OPEN Item | Product/academic decision not yet final and not safe to invent. |

Latest feature sources: [Drill v1.2 / TryOut v1.1 reconciliation](CORE_LEARNING_PRD_UPDATE_2026-10-02.md). `DRL-OPEN-*` refers to Drill source IDs; `TRY-TBC-*` is a local index for TryOut topics without source IDs. Best Score means the highest score among valid attempts for a Level; it never replaces attempt history.
