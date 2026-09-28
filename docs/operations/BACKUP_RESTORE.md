# Backup and Restore

## Baseline target

Engineering planning baseline:

- RPO ≤ 24 hours
- RTO ≤ 4 hours

This is a target until Product/Technical owners finalize OPEN-09.

## Scope

Back up/restore strategy must cover:

- PostgreSQL durable data;
- migration history;
- essential R2-owned assets/metadata relationship;
- deployment configuration needed to restore service (without storing secrets insecurely).

Redis is not the durable business backup source.

## Restore test

A backup policy is not complete until a restore has been rehearsed.

Before real-user release:

1. Create backup/snapshot.
2. Restore into isolated environment.
3. Run integrity checks/migrations if required.
4. Verify representative Student historical attempts, content versions, XP, class memberships, and admin data.
5. Record actual restore duration and gaps.

## High-risk migration procedure

Before a destructive/high-risk migration:

- confirm backup freshness;
- document migration and recovery plan;
- rehearse on staging where practical;
- monitor after deployment.
