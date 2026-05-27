---
name: sf-init
description: "Bootstrap a new Salesforce DX project with sf-claude-studio scaffolding: sfdx-project.json, .mcp.json, code-analyzer.yml, .claude/, and CI templates."
user-invocable: true
allowed-tools: Read, Glob, Bash, Write, Edit, AskUserQuestion
model: sonnet
---

## Phase 1: Confirm intent

Use AskUserQuestion to confirm:
- Project name?
- Default target org alias?
- Will MCP be used? (yes → copy `.mcp.json.example` → `.mcp.json` and pick a preset; no → skip)
- DevOps target? (DevOps Center / Copado / Gearset / Flosum / plain Git+CI)

Don't write any files until the user confirms the answers.

## Phase 2: Detect existing state

- `sfdx-project.json` already present?
- `force-app/` already populated?
- `.git/` initialized?

If sfdx-project already exists, switch to "augment existing project" mode (just add `.claude/` + `.mcp.json` + `code-analyzer.yml`) and skip the scaffolding step.

## Phase 3: Scaffold (only if greenfield)

```
sf project generate --name <project-name> --output-dir .
```

Then add (with the user's confirmation, file by file):

- `.mcp.json` — copy `.mcp.json.example`, update org alias and pick a preset (default `apex-dev`).
- `code-analyzer.yml` — the template at the repo root.
- `.github/workflows/ci.yml` — CI running scanner + Apex tests on PR (only if user picked Git+CI).
- `README.md` — link to this template's docs.

## Phase 4: Pick MCP preset

If MCP is enabled, ask which preset (apex-dev, lwc-dev, aura-migrate, mobile-dev, data-admin) and update `.mcp.json` `--toolsets` accordingly. Show the preset table from `.claude/docs/mcp-presets.md` first.

## Phase 5: Verify

- Run `sf --version` and report.
- Run `sf org display --target-org <alias>` and report.
- Run `sf code-analyzer --version` (if available) and report.
- List the files written.

## Phase 6: Next steps

Tell the user:
1. Run `/sf-project-stage-detect` to confirm everything wired up.
2. Run `/sf-apex-review` (or any review skill) on a real file to test the loop.
3. If MCP is enabled, restart Claude Code so the MCP server loads.
