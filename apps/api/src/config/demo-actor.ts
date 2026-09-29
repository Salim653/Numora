/**
 * Deterministic DEMO admin actor id, matching the `@tka/database` seed. Auth is
 * intentionally out of scope for admin endpoints, so this is the audit actor
 * until authorization lands. Do not ship to production auth.
 *
 * The seed inserts the user with a fixed `authUserId` (Supabase auth uid) while
 * `users.id` is generated randomly. Audit logs FK to `users.id`, so the admin
 * actor must be resolved by `authUserId`, not hardcoded.
 */
export const DEMO_ADMIN_AUTH_ID = '00000000-0000-4000-8000-000000000001';
