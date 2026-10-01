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

**ENGINEERING DECISION — requested by the coordinator on 1 October 2026:** Only `@splakplutoy` and `@ayiinee` are repository-wide code owners. Other contributors need approval from either account before merging into `main`. These two maintainers may merge through a PR without another person's approval once the review bypass is configured. CODEOWNERS alone does not grant that bypass.

Required target configuration:

- no direct push;
- Pull Request required;
- minimum one approving review from either code owner for other contributors;
- required status checks;
- CODEOWNERS review for all paths;
- review bypass only for `@splakplutoy` and `@ayiinee`, with the bypass mode **For pull requests only**;
- branch must be up to date before merge when practical.

**Live audit — 1 October 2026:** `main` is protected by three active repository rulesets. `main` (`24155025`) requires one approval and code-owner review; `main-1` (`24294660`) prevents deletion and force pushes; `main-2` (`24294661`) also requires one approval but does not require code-owner review. Both status-check rules currently have an empty required-check list. `@splakplutoy` has write access and can bypass `main`, but cannot bypass `main-2`; `@ayiinee` is the repository admin. The API does not expose the full bypass lists to this write-only account, so their membership has not been verified.

**Pending repository admin setup — approved policy, not yet verified live:** Aini must configure [Settings → Rules → Rulesets](https://github.com/ayiinee/Numora/settings/rules):

1. In both review rulesets, [main](https://github.com/ayiinee/Numora/rules/24155025) and [main-2](https://github.com/ayiinee/Numora/rules/24294661), require a pull request, one approving review, and **Require review from Code Owners**. All active rulesets apply together; changing only one leaves the other approval requirement active.
2. In each review ruleset, set the bypass list to only the individual users `splakplutoy` and `ayiinee`, with **For pull requests only**. Remove any other bypass actors from those review rulesets. Keep deletion/force-push protection in `main-1` without adding a maintainer bypass.
3. Keep the `quality` required status check in a separate ruleset without a maintainer bypass, so skipping approval does not skip CI. Preserve any other existing required checks when configuring it.
4. Merge the CODEOWNERS update into `main`, then verify that a contributor PR is blocked until either maintainer approves, each maintainer can merge a passing PR without another approval, and failing CI still blocks both maintainers. Do not treat this policy as fully active before those checks pass.

The full feature coordination list remains in [OWNERSHIP](OWNERSHIP.md). GitHub supports individual-user ruleset bypass; an Organization transfer is not required for this configuration. See [GitHub's user bypass announcement](https://github.blog/changelog/2026-05-07-repository-rulesets-user-bypass-and-branch-renaming/) and [code-owner review documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

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
