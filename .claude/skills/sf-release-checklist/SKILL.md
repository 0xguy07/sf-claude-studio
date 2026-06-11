---
name: sf-release-checklist
description: "Release-readiness gate. Runs through build/test/security/data/comms/rollback checks before sign-off."
user-invocable: true
allowed-tools: Read, Glob, Bash, Task, AskUserQuestion
model: sonnet
agent: delivery-lead
---

## Phase 1: Build

- [ ] All stories in scope have status = "Done."
- [ ] No outstanding BLOCKING findings from `/sf-code-review`, `/sf-apex-review`, `/sf-lwc-review`, `/sf-security-review`.
- [ ] CI is green on the release branch.
- [ ] A current org snapshot exists (`/sf-snapshot`) — a pre-release record of target-org state to diff against and roll back toward.

## Phase 2: Test

- [ ] Apex coverage ≥ 75% **on changed code** (not just project total).
- [ ] All Jest tests pass.
- [ ] Regression suite run (smoke or full per release size).
- [ ] UAT sign-off recorded.

## Phase 3: Security

- [ ] `/sf-security-review --scope diff` clean (no CRITICAL).
- [ ] No new permission sets granting Modify All Data without justification.
- [ ] No new secrets in source.

## Phase 4: Data

- [ ] Data migration scripts (if any) tested in staging on production-like volume.
- [ ] Backout / data-rollback documented.
- [ ] Storage and API limit headroom verified.

## Phase 5: Deployment

- [ ] `sf project deploy validate` passed against target org.
- [ ] Test level confirmed (RunSpecifiedTests or RunLocalTests, never NoTestRun).
- [ ] Deployment manifest reviewed (no `*` wildcards for production).
- [ ] DestructiveChanges separated and reviewed.

## Phase 6: Communications

- [ ] Release notes drafted (`.claude/docs/templates/release-notes.md`).
- [ ] Stakeholder list notified of date/time/window.
- [ ] Support team briefed on changes that affect users.

## Phase 7: Rollback plan

- [ ] Rollback steps documented in `docs/releases/<release>.md`.
- [ ] Person on call for the deploy window identified.
- [ ] Cutover decision criteria defined ("we abort if X happens").

## Phase 8: Sign-off

Spawn `solution-architect`, `apex-lead`, `qa-lead`, `security-lead`, `devops-lead` in parallel — each provides a one-line sign-off ("ready" / "blocked because X").

If anyone says blocked, stop. Otherwise, present the consolidated checklist with all boxes ticked and ask the user for final go.
