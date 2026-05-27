---
name: sf-start
description: "Entry point for new sessions. Asks where the project is (greenfield, existing org, mid-sprint, brownfield) and routes to the right next step."
user-invocable: true
allowed-tools: Read, Glob, Bash, AskUserQuestion
model: sonnet
---

## Phase 1: Detect project state

Run `/sf-project-stage-detect` first to populate context (do not re-ask the user about things we can detect).

Specifically check:
- `sfdx-project.json` exists?
- `force-app/` populated?
- Any `.cls` / `lwc/` / `flow-meta.xml` already present?
- Default `sf` org configured?
- Any unfinished story file in `production/stories/` or `docs/stories/`?

## Phase 2: Ask the user where they are

Use **AskUserQuestion** with these four options:

1. **Greenfield** — brand new project, no SFDX scaffolding yet → run `sf project generate`, set up `force-app/`, scaffold `sfdx-project.json`, ask about target org.
2. **Existing org, new repo** — the org exists, we're starting source-control discipline → suggest pulling metadata via `sf project retrieve sf-start --metadata <types>`, then organizing.
3. **Mid-sprint** — there's a current story or a branch in progress → run `/sprint-status` (if available) or summarize git state and current branch.
4. **Brownfield audit** — inheriting an existing codebase, want a quality picture → run `/sf-apex-review` over `force-app/main/default/classes/` and `/sf-security-review` over the project.

## Phase 3: Hand off

Based on the answer, recommend the appropriate agent or skill. Examples:

- Greenfield → `solution-architect` to talk through data model + sharing first.
- Existing org → `data-lead` for object/field audit, `apex-lead` for code audit.
- Mid-sprint → resume the in-progress story; remind the user `/dev-story` (when added) is the build skill.
- Brownfield → spawn `apex-lead` and `lwc-lead` and `security-lead` in parallel for a triage pass.

**Do not sf-start any work without confirming the route with the user.**
