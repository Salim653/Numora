# Software Engineering Ownership

This file reflects the final job-list image supplied by the team. GitHub usernames should be added to CODEOWNERS once known.

## Team structure clarified on 28 September 2026

- **Departemen Software Engineering** combines the divisions and coordinates shared engineering decisions/work.
- A **divisi** is the primary engineering discipline, such as Frontend Engineering or Backend Engineering.
- A **tim** focuses on a feature area while members retain their division scope. For example, a Frontend member in Core Learning/PvP owns frontend work for those features, not backend domain policy.
- The coordinator who supplied this context leads the Software Engineering department, belongs to the Frontend Engineering division, and works on Core Learning and PvP frontend. Product/academic OPEN decisions are made jointly with the responsible PO, Curriculum, Data, Software, and QA owners; department coordination is not unilateral product approval.

| Member | Role | Main ownership | Secondary ownership |
|---|---|---|---|
| Ferdiansyah Dwana Putra S | Frontend | Core Learning | PvP & Leaderboard |
| Avicenna A. G. M Benamen | Frontend | Admin & Content | Core Learning |
| Abdullah Ali Wafa | Frontend | Onboarding | — |
| Qurotul A'ini | Backend | Core Learning | PvP & Leaderboard |
| Mch. Andi Mai Fatah | Backend | Onboarding | Monitoring |
| Tangguh Ittibaur Rosul | Backend | Admin & Content | — |
| Nafi' Azka Fuadi | Backend | Core Learning | — |
| Muhammad Salim Ramadhan | QA | Testing | Testing |

## Ownership principles

- Ownership means first reviewer/coordination responsibility, not exclusive permission to edit code.
- Cross-cutting changes (auth, database schema, contracts, CI) require coordination beyond one feature owner.
- A feature spanning Frontend and Backend should have a named reviewer from both affected sides when possible.
- QA should review acceptance/testability early, not only after implementation.
- Product rule changes require PO/PM approval regardless of code ownership.

## Tentative staging ownership

As of 28 September 2026, the coordinator expects DevOps to handle the staging domain and the Database team to prepare Supabase/Google OAuth, but these assignments have **not been confirmed**. The **team will decide together** which staging hosting provider to use and who is accountable for its setup. Both the provider and accountable owner are still open. Record the team's decision and confirmed assignments here before relying on them for the 12 October target.

## CODEOWNERS plan

When GitHub handles are available, map paths such as:

```text
/apps/web/src/features/core-learning/
/apps/api/src/modules/assessments/
/apps/api/src/modules/content/
/apps/api/src/modules/pvp/
/apps/web/src/features/admin/
/packages/contracts/
/packages/database/
```

Do not create CODEOWNERS entries using names without verified GitHub usernames.
