# Privacy and Data Minimization

The platform targets SMP students. Before real-user deployment, Product/Institution must approve the applicable consent/privacy policy. This document defines engineering minimization recommendations, not legal advice.

For the first prototype trial, real school Students and Teachers will access online staging. Product/Design coordinates school permission, participant/guardian consent where needed, and a clear notice that Level-1 questions are demo content. Engineering still needs the approved collection/access/retention arrangements before providing real-user access.

## Minimum identity data recommended

Store only what the product needs:

- internal user ID;
- external auth provider ID;
- display name;
- email where required for authentication/account operation;
- role;
- account status/restrictions;
- Class membership;
- Teacher School membership.

Do not add by default:

- full date of birth;
- phone;
- home address;
- parent identity/contact;
- precise location;
- government/student identity documents.

## Profile picture

PRD uses Google profile photo with initial fallback. Avoid copying photos to R2 unless a later need is approved.

## Leaderboards

Global PvP leaderboard includes Mandiri and School Students and exposes only minimum display information needed, not email or learning history.

## Analytics

Prefer internal IDs/pseudonymous identifiers. Generic events should not carry unnecessary PII or raw auth credentials.

## Retention

Latest retention/display context ([PRD reconciliation](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md)):

- Drill explanation/history retention: DRL-OPEN-07; 90 days in v0.5/current implementation is superseded as final product authority;
- TryOut result/explanation: only after released IRT, within 3×24h after batch end; exact failure/schedule policy remains OPEN-18. No fixed expiration is stated by TryOut v1.1;
- leaderboard periods: archived, not deleted.

Other data retention remains unresolved under OPEN-09. Do not automatically delete durable attempts/audit/XP/IRT inputs until an approved policy exists.

## Access and deletion requests

Before real users, define:

- who can request correction/deletion;
- what historical/audit data must remain for integrity;
- how account disabling differs from hard deletion;
- backup-retention implications;
- Data-team downstream deletion propagation where required.
