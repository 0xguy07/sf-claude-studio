---
name: sf-deploy
description: "Pre-flight checks before sf project deploy start. Validates manifest, runs scanner, dry-runs, confirms target org and test level. Stops if target is production without explicit confirmation."
argument-hint: "[--target-org <alias>] [--manifest <path>]"
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion
model: sonnet
agent: devops-lead
---

## Phase 1: Identify target org

Read the argument, or `sf config get target-org`. If `production` (or any alias the user has flagged as production), require **explicit re-confirmation** via AskUserQuestion before proceeding.

## Phase 2: Identify what will deploy

Run `sf project deploy preview --target-org <alias>` and show the file list. Confirm the count is what the user expects.

## Phase 3: Run scanner / analyzer

If `sf scanner` or `sf code-analyzer` is available, run it on the changed paths and show critical/high findings. **Block** if any CRITICAL.

## Phase 4: Run validate (mandatory)

```
sf project deploy validate --target-org <alias> --test-level RunSpecifiedTests --tests <test-class-list>
```

If RunSpecifiedTests isn't appropriate, propose `RunLocalTests` and ask. Never `NoTestRun` for non-scratch orgs.

## Phase 5: Show result

If validate fails, surface the failure and stop. Do not proceed to `start`.

## Phase 6: Ask before deploying

Final prompt: "Validation passed. Deploy to `<alias>` now?" — only proceed on explicit yes.

## Phase 7: Deploy

```
sf project deploy start --target-org <alias> --test-level RunSpecifiedTests --tests <list>
```

Tail the deploy with `sf project deploy report --use-most-recent --wait 30`.

## Phase 8: Post-deploy

Remind the user about post-deploy steps from `.claude/docs/templates/deployment-plan.md` (assign permission sets, run data scripts, notify stakeholders).
