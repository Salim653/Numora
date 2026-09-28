# Software Engineering Ownership

This file reflects the final job-list image and GitHub accounts supplied by the team. GitHub write access to the repository has not been verified.

## Team structure clarified on 28 September 2026

- **Departemen Software Engineering** combines the divisions and coordinates shared engineering decisions/work.
- A **divisi** is the primary engineering discipline, such as Frontend Engineering or Backend Engineering.
- A **tim** focuses on a feature area while members retain their division scope. For example, a Frontend member in Core Learning/PvP owns frontend work for those features, not backend domain policy.
- The coordinator who supplied this context leads the Software Engineering department, belongs to the Frontend Engineering division, and works on Core Learning and PvP frontend. Product/academic OPEN decisions are made jointly with the responsible PO, Curriculum, Data, Software, and QA owners; department coordination is not unilateral product approval.

| Member | GitHub | Role | Main ownership | Secondary ownership |
|---|---|---|---|---|
| Ferdiansyah Dwana Putra S | `@splakplutoy` | Frontend | Core Learning | PvP & Leaderboard |
| Avicenna A. G. M Benamen | `@Noir-MD` | Frontend | Admin & Content | Core Learning |
| Abdullah Ali Wafa | `@a-ali-wafa` | Frontend | Onboarding | Monitoring |
| Qurotul A'ini | `@ayiinee` | Backend | Core Learning | PvP & Leaderboard |
| Mch. Andi Mai Fatah | `@fathh04` | Backend | Onboarding | Monitoring |
| Tangguh Ittibaur Rosul | `@tangguhir` | Backend | Admin & Content | — |
| Nafi' Azka Fuadi | `@NafiAzka` | Backend | Core Learning | — |
| Muhammad Salim Ramadhan | `@Salim653` | QA | Testing | Testing |

## Ownership principles

- Ownership means first reviewer/coordination responsibility, not exclusive permission to edit code.
- Cross-cutting changes (auth, database schema, contracts, CI) require coordination beyond one feature owner.
- A feature spanning Frontend and Backend should have a named reviewer from both affected sides when possible.
- QA should review acceptance/testability early, not only after implementation.
- Product rule changes require PO/PM approval regardless of code ownership.

## Tentative staging ownership

As of 28 September 2026, the coordinator expects DevOps to handle the staging domain and the Database team to prepare Supabase/Google OAuth, but these assignments have **not been confirmed**. The **team will decide together** which staging hosting provider to use and who is accountable for its setup. The monthly budget for hosting and supporting services is **not set yet**. Record the team's provider, budget, and confirmed assignments here before relying on them for the 12 October target.

## CODEOWNERS

The active reviewer mapping is [`.github/CODEOWNERS`](../../.github/CODEOWNERS). It currently uses accounts with repository write access; the job-list ownership above remains the intended feature assignment. Restore more specific Backend/QA reviewer rules after the repository admin grants their write access. A planned path does not mean its feature already exists. Use [PROJECT_STRUCTURE](PROJECT_STRUCTURE.md) for code placement.

CODEOWNERS requests reviews; it does not reserve files for specific contributors or grant repository access. When a rule lists multiple accounts, GitHub accepts approval from any one listed code owner if code-owner review is required. Request additional Frontend, Backend, or QA reviewers manually when a change needs cross-discipline review. Confirm each listed account has repository write access and configure the `main` branch review rule before relying on automatic requests.
