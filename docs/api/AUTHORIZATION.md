# Authorization Model

Authentication answers **who the user is**. Authorization answers **what this user may do to this resource**.

## Identity baseline

- Student/Teacher: Google OAuth through Supabase Auth.
- Admin: internally provisioned/seeder identity; no public Admin registration.
- NestJS maps external auth identity to internal `users` record.

**ENGINEERING DECISION (Cloud Development, 29 September 2026):** Next.js uses a Supabase Auth cookie session. It sends the Supabase access token as a Bearer token to NestJS. `GET /api/v1/identity/me` returns the internal profile or 404 until registration; `POST /api/v1/identity/me` accepts a one-time `STUDENT`/`TEACHER` role choice from a Google-authenticated account. Email and Auth user ID come only from the verified Supabase user. The API returns role, status, Teacher verification, and Student affiliation from PostgreSQL; no browser Data API access is part of this flow. Admin identity remains internally provisioned.

## Authorization dimensions

Evaluate as needed:

1. authenticated identity;
2. role;
3. account active/restriction status;
4. Teacher school verification;
5. Class membership/ownership;
6. resource relationship;
7. product-specific eligibility (level unlocked, active weekly Tryout package, one attempt/package, etc.).

## Matrix baseline

| Resource/action | Student | Teacher | Admin |
|---|---|---|---|
| Own profile read/update display name | Yes | Yes | operational read where authorized |
| Choose/change own role after registration | No | No | internal process only if ever approved |
| List schools for verification | No need | Yes | Yes |
| Consume teacher token | No | Yes | No |
| Generate/revoke teacher token | No | No | Yes |
| Create class | No | Verified Teacher | operational/admin management |
| Join class | Yes if no existing class | No | correction policy OPEN-08 |
| View own assessment results | Yes | own students only | authorized operational access |
| View another Student detail | No | only own class | authorized |
| Manage question bank | No | No | Yes |
| Send feedback | No | own Student only | not standard user flow |
| Read feedback | own only | sent/own-class context as needed | operational only |
| Start Drill without Class | Yes, Mandiri | n/a | n/a |
| Start Pretest/Tryout without Class | No | n/a | n/a |
| Create/share PvP room without Class | Yes, Mandiri | n/a | n/a |
| Invite classmate to PvP | School Student only | n/a | n/a |
| View IRT | No | No | Yes |

## Server enforcement

Do not rely on hidden menus. All sensitive endpoints and WebSocket actions must enforce policy server-side.

Example Teacher check:

```text
authenticated
AND role == TEACHER
AND verified school membership exists
AND class.teacher_id == current_user.id
AND account not restricted
```

## WebSocket

WebSocket connection must authenticate before joining protected rooms. Every state-changing event still validates match membership/state; connection authentication alone is insufficient.

## Least data principle

Global PvP leaderboard should return only minimum display fields required by PRD, not email or private learning history.
