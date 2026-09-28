# Privacy and Data Minimization

The platform targets SMP students. Before real-user deployment, Product/Institution must approve the applicable consent/privacy policy. This document defines engineering minimization recommendations, not legal advice.

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

Global PvP leaderboard exposes only minimum display information needed, not email or learning history.

## Analytics

Prefer internal IDs/pseudonymous identifiers. Generic events should not carry unnecessary PII or raw auth credentials.

## Retention

Known product retention/display rule:

- Drill explanation access: 90 days;
- Tryout explanation access: unlimited;
- leaderboard periods: archived, not deleted.

Other data retention remains unresolved under OPEN-09. Do not automatically delete durable attempts/audit/XP/IRT inputs until an approved policy exists.

## Access and deletion requests

Before real users, define:

- who can request correction/deletion;
- what historical/audit data must remain for integrity;
- how account disabling differs from hard deletion;
- backup-retention implications;
- Data-team downstream deletion propagation where required.
