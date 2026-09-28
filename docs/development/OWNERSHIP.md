# Software Engineering Ownership

This file reflects the final job-list image supplied by the team. GitHub usernames should be added to CODEOWNERS once known.

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
