# Git Workflow

## Branching model

Use trunk-based development with a protected `main` branch.

Short-lived branches:

```text
feat/core-learning-drill
feat/school-verification
fix/pvp-reconnect
chore/ci
refactor/assessment-policy
```

Avoid permanent `frontend`, `backend`, `develop`, or sprint branches.

## Contributors outside the job list

`CODEOWNERS` assigns reviewers, not permission to edit. Anyone can make local commits after obtaining the repository code. Pushing a branch to this repository requires write access; a contributor without it can propose a pull request from a fork when repository visibility and settings allow. Do not add someone to `CODEOWNERS` only so they can contribute. Their changes still follow the same PR review and CI rules.

## Main branch rules

Recommended GitHub protection:

- no direct push;
- Pull Request required;
- minimum one reviewer;
- required status checks;
- CODEOWNERS review for sensitive paths where configured;
- branch must be up to date before merge when practical.

## Required CI on PR

At minimum:

```text
install
lint
typecheck
unit tests
integration tests where configured
contract/schema validation
build
```

## Commit style

Prefer Conventional Commits:

```text
feat(assessment): add drill attempt finalization
fix(pvp): preserve timer on reconnect
chore(ci): add contract validation
```

## Pull Request content

PR description should include:

- problem/user story;
- PRD/issue reference;
- implementation summary;
- API/schema migration impact;
- screenshots for UI change;
- test evidence;
- known limitations/open items.

## Schema and contract changes

A PR changing DB schema, OpenAPI, question schema, or event schema must call out downstream impact explicitly.

Do not merge a breaking contract change without coordinating affected owners.

## Emergency fixes

Even urgent production fixes should go through a PR where possible. Follow-up documentation/tests are mandatory if an emergency bypass occurs.
