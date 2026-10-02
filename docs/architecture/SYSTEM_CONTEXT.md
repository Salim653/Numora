# System Context

## System under design

Numora is a responsive web system used by independent and school-affiliated Students, Teachers, and Admins. It centralizes school verification, learning content, assessment attempts, progress, PvP, recommendations, monitoring, and analytics-related event production.

## Actors and external systems

```text
Student ───────┐
Teacher ───────┼──> TKA Platform
Admin ─────────┘       │
                       ├── Google OAuth / Supabase Auth
                       ├── PostgreSQL
                       ├── Redis
                       ├── Cloudflare R2
                       ├── YouTube (external video navigation only)
                       └── Data/AI workflows (question generation, analytics, IRT)
```

## Actor responsibilities

### Student

- authenticates with Google;
- may join at most one Class;
- may begin as Mandiri without a Class, access Drill/free MVP TryOut, and retain learning/PvP history when joining one;
- performs Pretest/Drill/Tryout;
- views results/progress/feedback;
- participates in PvP;
- views leaderboards;
- reports questions/videos.

### Teacher

- authenticates with Google;
- verifies against one registered School using a single-use token;
- creates/manages own Classes;
- monitors own Students;
- sends feedback.

### Admin

- internally provisioned identity;
- manages School/token operational data;
- manages content/packages/videos;
- reviews reports;
- views IRT/analytics/audit;
- applies account restrictions according to approved policy.

## External-system boundaries

### Google / Supabase Auth

Provides identity authentication. It does **not** decide application resource authorization.

### PostgreSQL

Durable source of truth for product data, history, XP ledger, completed PvP, audit, and outbox.

### Redis

Ephemeral/cache/queue state. Used for BullMQ and PvP transient state; not durable truth.

### Cloudflare R2

Object storage for owned learning media such as question/explanation assets. Object metadata lives in PostgreSQL.

### Data/AI workflows

Provide generated candidate question/variant data and consume documented analytics/IRT inputs. Generated questions require product/content validation before readiness.

## Trust boundaries

- Browser input is untrusted.
- WebSocket events are untrusted until server validation.
- AI-generated content is untrusted until schema validation and content review.
- External video metadata must be stored/curated before serving as recommendation.
- Authentication identity claims must be mapped to internal application user state before authorization.

## Latest feature scope

[Drill v1.2 / TryOut v1.1](../product/CORE_LEARNING_PRD_UPDATE_2026-10-02.md) define student journeys and require Curriculum-supplied banks/packages. Admin CRUD/configuration is outside these feature PRDs; operational Admin responsibilities above remain separately scoped. Teacher observes owned-Class progress only. TryOut has no payment actor/integration on MVP; all Students are free, subject to package and attempt eligibility.
