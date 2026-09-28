# IRT Integration

## Product requirements

PRD v0.4 states:

- IRT runs as a daily batch/cron process;
- uses cumulative Student responses rather than a weekly period;
- outputs difficulty, discrimination, guessing according to Data-team capability;
- is shown on Admin question detail;
- current baseline threshold: minimum 30 responses;
- below threshold displays “Data belum cukup”;
- IRT must not modify historical Student score/XP.

Detailed thresholds/model parameters remain OPEN-12.

## Architectural principle

IRT is asynchronous and must not run in the Student answer/submit critical request path.

```text
Assessment response data
       ↓
Daily eligible-item extraction
       ↓
IRT computation (Data/worker)
       ↓
Versioned IRT result
       ↓
Admin query/display
```

## Input contract

At minimum Data needs a documented item-response representation with:

- stable Student/respondent pseudonymous ID;
- question/version/item ID;
- response correctness or category representation appropriate to model;
- attempt timestamp;
- relevant assessment/content version metadata.

Exact model input must be finalized with Data.

## Output metadata

Persist:

- item/question-version ID;
- sample size;
- model/version;
- calculated timestamp;
- status;
- difficulty/discrimination/guessing fields supported by approved model.

## Reproducibility

Store model/version and enough metadata to explain which run produced an Admin-visible result. New IRT runs supersede display results but do not rewrite historical Student assessment facts.
