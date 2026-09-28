# Question Contract — Data/AI ↔ Software

## Purpose

Question content is expected to be generated/supplied by Data/AI workflows and validated by Curriculum/Admin before it becomes usable. Software must not wait for final real questions to build the platform.

This document defines semantic expectations. A machine-readable JSON Schema should be created under `packages/contracts/questions/` next.

## Workflow

```text
Data / AI Generator
      ↓
Question JSON
      ↓ schema validation
DRAFT
      ↓ Curriculum/Admin review
READY
      ↓ packaging
Student/PvP usage
```

AI generation does not imply content approval.

## Supported conceptual question types

The data model/schema should be able to represent:

- `SINGLE_CHOICE` (PG)
- `MULTIPLE_CHOICE_MULTIPLE_ANSWER` (PGK MCMA)
- `CATEGORY` (PGK Kategori)

MVP scoring may initially publish/use PG only where OPEN-04 blocks PGK scoring.

## Required semantic groups

A candidate question should include or resolve:

### Identity

- external/source identifier;
- logical question identity when imported repeatedly;
- version/variant identity assigned by platform as needed.

### Taxonomy

- chapter;
- subchapter;
- competency;
- level where applicable;
- difficulty.

### Content

- stem/content blocks;
- options/statements/categories according to type;
- optional owned media references.

### Scoring context

- correct answer/key representation;
- point metadata if applicable;
- scoring type/policy compatibility.

### Explanation

- explanation for the concrete version/variant;
- enough context to explain correct/incorrect choices according to product requirements.

### Generation/provenance metadata

Recommended:

- generation source/model/version;
- generation timestamp;
- prompt/template version if relevant;
- reviewer/validation status;
- import batch ID.

These fields help trace AI-generated content quality but do not replace academic review.

## Example semantic shape (not final JSON Schema)

```json
{
  "externalId": "AI-Q-00001",
  "type": "SINGLE_CHOICE",
  "taxonomy": {
    "chapterCode": "BILANGAN",
    "subchapterCode": "PECAHAN",
    "competencyCode": "KOMP-001",
    "level": 1,
    "difficulty": "EASY"
  },
  "stem": {"text": "..."},
  "options": [
    {"id": "A", "text": "..."},
    {"id": "B", "text": "..."}
  ],
  "answer": {"correctOptionIds": ["B"]},
  "explanation": {"text": "..."},
  "generation": {
    "source": "AI",
    "modelVersion": "...",
    "batchId": "..."
  }
}
```

## Versioning

Published/used content must never be silently overwritten. Corrections create a new version/archived state while historical attempts retain their original context.

## Variants

A variant changes numbers/variables/case while preserving:

- competency;
- intended difficulty;
- question type;
- conceptual learning target.

Each concrete variant needs matching answer key and explanation.

## OPEN dependencies

- exact taxonomy and level structure: OPEN-01;
- PGK scoring semantics: OPEN-04;
- number of variants/packages: OPEN-10.

Schema should remain flexible without pretending these decisions are final.
