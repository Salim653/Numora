# Analytics Event Contract

## Purpose

Product events provide a stable interface from Software to Data/Analytics. Database tables are implementation details; Data workflows should prefer documented event/dataset contracts rather than inferring semantics from arbitrary schema.

## Event envelope

Recommended versioned envelope:

```json
{
  "eventId": "uuid",
  "eventName": "drill_completed",
  "eventVersion": 1,
  "occurredAt": "2026-09-28T10:00:00Z",
  "actorId": "uuid-or-null",
  "actorRole": "STUDENT",
  "entityType": "assessmentAttempt",
  "entityId": "uuid",
  "correlationId": "uuid",
  "payload": {}
}
```

## PRD event vocabulary

PRD v0.5 lists at least:

- `account_registered`
- `class_joined`
- `user_type_changed`
- `assessment_started`
- `assessment_completed`
- `level_unlocked`
- `star_earned`
- `explanation_viewed`
- `feedback_sent`
- `feedback_read`
- `question_reported`
- `pvp_disconnected`
- `school_created`
- `token_generated`
- `teacher_verified`
- `class_created`
- `pretest_started`
- `drill_started`
- `drill_completed`
- `tryout_started`
- `tryout_completed`
- `pvp_started`
- `pvp_completed`
- `video_reported`
- `leaderboard_archived`
- `irt_calculated`
- `pvp_cancelled`

Exact payload schemas must be agreed with Data + PO.

## Versioning rules

- `eventName` meaning must remain stable.
- Additive optional fields do not necessarily require a new major event version.
- Semantic reinterpretation/removal requires a new `eventVersion`.
- Consumers should tolerate unknown additive fields.

## Privacy

Do not put raw auth tokens, passwords, teacher verification tokens, unnecessary email, or full sensitive response content into generic analytics events.

Use stable internal IDs and documented joins/datasets when detail is required.

## Delivery

Domain transaction writes an outbox event. Worker processes/publishes it asynchronously.

Handlers must tolerate duplicate delivery; `eventId` is globally unique.
