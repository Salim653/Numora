# Release Checklist

## Product / requirement

- [ ] Latest PRD/module spec reviewed.
- [ ] OPEN items affecting released behavior are resolved or feature remains disabled/non-final.
- [ ] Acceptance criteria mapped to test evidence.
- [ ] No demo policy is accidentally presented as official product policy.

## Code / contract

- [ ] `main` CI green.
- [ ] OpenAPI/JSON/event contracts current.
- [ ] Migrations reviewed and rehearsed.
- [ ] Feature flags/config correct for environment.
- [ ] No debug endpoints or secrets.

## Security / privacy

- [ ] Auth and resource authorization tested.
- [ ] Admin access internally provisioned.
- [ ] Teacher token flow server-side, single-use, expiry tested.
- [ ] CORS/rate limits/config reviewed.
- [ ] Logs/monitoring scrub secrets and unnecessary PII.
- [ ] Privacy/retention policy approved before real Student rollout.

## Reliability

- [ ] Backup recent.
- [ ] Restore procedure tested according to release stage.
- [ ] Health endpoints pass.
- [ ] Queue/scheduler running.
- [ ] Leaderboard hourly and weekly jobs verified.
- [ ] IRT job safely handles insufficient data.

## QA

- [ ] Student core flow smoke test.
- [ ] Teacher verification/class/monitoring smoke test.
- [ ] Admin school/content/report smoke test.
- [ ] PvP smoke/reconnect test if enabled.
- [ ] Mobile target browsers checked.
- [ ] Loading/error/empty/access-denied states checked.

## Performance

Before real-user release:

- [ ] 100 concurrent baseline tested.
- [ ] 500 concurrent target scenario tested.
- [ ] 1,000 concurrent stress scenario observed/documented.
- [ ] WebSocket/PvP connection scenario separately tested.

## Sign-off

Record date and approval/status from:

- Product Owner
- Project Manager
- Software Engineering
- QA
- DevOps/Platform as applicable
