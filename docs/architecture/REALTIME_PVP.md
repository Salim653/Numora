# Realtime PvP Architecture

## Product baseline

PRD v0.5 baseline requires:

- 1v1 realtime PvP via WebSocket;
- room share by code/link/QR;
- participation across Mandiri and School Students, including across classes;
- optional classmate invite for School Students; Mandiri can create/share a room but cannot send classmate notification invites;
- Easy/Medium/Hard categories (names temporary);
- 10 questions;
- both players receive the same questions/order;
- answers lock after submit;
- next question after both answers or timeout;
- server-authoritative time, answer validity, and score;
- reconnect window 20 seconds;
- failure to reconnect causes forfeit;
- forfeit does not update leaderboard record;
- PvP XP does not contribute to class leaderboard.
- global PvP leaderboard includes both Student affiliations.

## Container responsibilities

```text
Player A ─┐
          ├─ WSS ─> NestJS PvP Gateway / Match Engine
Player B ─┘                 │
                            ├── Redis: active room/match ephemeral state
                            └── PostgreSQL: durable completed result/history
```

## Recommended match state machine

```text
CREATED
  ↓
WAITING_PLAYER
  ↓
READY_CHECK
  ↓
QUESTION_ACTIVE
  ↓
QUESTION_RESOLVED
  ├── next question → QUESTION_ACTIVE
  └── final question → COMPLETED

Alternative terminal states:
FORFEITED
CANCELLED_SYSTEM
EXPIRED (room/invite; exact policy OPEN-07)
```

## Client → server events (contract draft)

- `pvp:room:create`
- `pvp:room:join`
- validate both players as Students; Class membership is not required to create/join a valid room;
- `pvp:invite:create`
- `pvp:invite:accept`
- `pvp:invite:decline`
- `pvp:player:ready`
- `pvp:answer:submit`
- `pvp:reconnect`
- `pvp:leave`

Exact payloads belong in a machine-readable contract later.

## Server → client events (contract draft)

- `pvp:room:state`
- `pvp:invite:received`
- `pvp:match:started`
- `pvp:question:started`
- `pvp:answer:acknowledged`
- `pvp:question:resolved`
- `pvp:opponent:disconnected`
- `pvp:match:completed`
- `pvp:match:forfeited`
- `pvp:match:cancelled`
- standardized error event/acknowledgement

## Server time authority

Client submits answer identity only. Client-provided elapsed time/score is not trusted.

Server determines:

- question start/deadline;
- whether answer arrived before deadline;
- remaining time;
- score formula;
- state transition.

## Baseline scoring

For a correct answer:

```text
100 + floor(50 × remainingTime / questionDuration)
```

Wrong/blank: 0.

Question durations:

- Easy: 30s
- Medium: 45s
- Hard: 60s

## Reconnect

- Detect disconnect and start server-side 20s reconnect window.
- Question timer continues.
- Reconnecting player receives current authoritative match state.
- Locked answers remain locked.
- Player does not replay a previous question.
- No return in 20s → forfeit.

## Durability

Redis holds transient active state; PostgreSQL persists final audit/result context. A Redis restart may cancel active matches if recovery is not yet implemented, but must not delete completed historical matches.

System-wide failure should produce a cancelled/no-win-loss result according to PRD rather than falsely awarding a normal match result.

## Scaling path

Initial single API instance can use Socket.IO locally. If multiple API instances are introduced, use a compatible Redis adapter and ensure room ownership/state remains consistent.

Do not add horizontal WebSocket complexity before load tests justify it.

## OPEN-07

Still unresolved:

- room/invite expiry;
- final readiness edge cases;
- behavior when both players independently lose network.

Implement configuration/state extension points; do not hardcode undocumented product outcomes.
