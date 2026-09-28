# REST API Guidelines

## Baseline

- Base path: `/api/v1`
- JSON field style: `camelCase`
- External IDs: UUID
- Timestamp representation: ISO-8601 UTC
- Business timezone: `Asia/Jakarta` when a local calendar rule is required
- API contract: OpenAPI 3 generated/maintained from NestJS definitions
- Error media type/convention: `application/problem+json`

## Resource naming

Prefer nouns and domain actions only when resource modeling is insufficient.

Good examples:

```http
POST /api/v1/classes/{classId}/join
POST /api/v1/teacher-verifications
POST /api/v1/assessments/drill/attempts
PATCH /api/v1/assessment-attempts/{attemptId}/answers/{questionInstanceId}
POST /api/v1/assessment-attempts/{attemptId}/submit
GET  /api/v1/students/me/progress
POST /api/v1/pvp/rooms
```

Avoid verb-heavy RPC naming such as `/doJoinClass` or `/getAllStudentProgress`.

## Pagination

Use cursor-based pagination for potentially large/continuously growing collections such as audit logs, reports, attempt history, and admin question lists.

Return stable pagination metadata/links rather than relying only on arbitrary offsets for large data.

## Errors

Suggested shape based on RFC Problem Details concepts:

```json
{
  "type": "https://example.invalid/problems/class-membership-conflict",
  "title": "Class membership conflict",
  "status": 409,
  "detail": "The student already belongs to another class.",
  "instance": "/api/v1/classes/.../join",
  "code": "CLASS_MEMBERSHIP_CONFLICT",
  "requestId": "..."
}
```

`code` is a stable application error code. `detail` may be localized/displayed carefully.

## Validation

- Reject invalid enum/value/UUID/shape at the boundary.
- Resource authorization happens after identity validation and before sensitive response data is returned.
- Never trust client-supplied role, school ownership, class ownership, score, XP, or elapsed time.

## OpenAPI workflow

Target workflow:

```text
NestJS controller/DTO
→ generate OpenAPI
→ commit/update packages/contracts/openapi/openapi.json
→ CI regenerates OpenAPI and fails if the committed file differs
→ frontend/QA use generated contract
```

Breaking changes require coordination and release notes.

`pnpm contracts:validate` currently checks JSON syntax for the question, event, and WebSocket schemas. It does not validate example payloads or the complete OpenAPI specification.

## Versioning

`/api/v1` is the initial public contract namespace. Do not increment API version for ordinary additive changes. Breaking changes should be deliberately managed.
