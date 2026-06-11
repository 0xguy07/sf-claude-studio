# sf-claude-studio

A Claude Code harness for Salesforce delivery work — an opinionated set of agents, slash-command skills, hooks, and path-scoped rules that mirror how a real SF delivery team is organized.

This file is the index. The real content lives in three companion files that Claude Code injects alongside this one:

| File | What's in it |
|-|-|
| [`AGENTS.md`](AGENTS.md) | Agent registry, the three-tier hierarchy, delegation rules, the collaboration protocol every agent follows |
| [`STANDARDS.md`](STANDARDS.md) | Coding standards, path-scoped rule index, what `validate-commit` enforces, citations |
| [`TOOLS.md`](TOOLS.md) | Required and optional tools — `sf` CLI, Claude Code, Code Analyzer v5, MCP integration, permission model |

## First time here?

Run `/sf-doctor` to check that everything's wired up.
Run `/sf-start` to pick the right entry point based on project state.
Run `/sf-help` to see all skills.

## Metadata discipline

Before writing or editing metadata, check `docs/schema/`. If the object isn't snapshotted, run `/sf-describe-snapshot` for it first. Never write a field reference that isn't in the snapshot.

`docs/org-context.md` holds the org's purpose, key custom objects, gotchas, and decision log — read it for project intent.

## Collaboration protocol fast-path

Steps 1–3 of the [`AGENTS.md`](AGENTS.md) collaboration protocol (ask, present options, user decides) may be relaxed for routine changes within approved scope. Steps 4–5 (show before writing, approve to write) are never relaxed. Uncomment to opt in:

<!-- Routine changes within approved scope may skip steps 1-3 of the collaboration protocol. Steps 4-5 still apply. -->

## Slash command catalog

**Project / onboarding**
`/sf-init` `/sf-start` `/sf-help` `/sf-project-stage-detect` `/sf-doctor`

**Session control**
`/sf-status` `/sf-context` `/sf-think` `/sf-trace`

**Reviews**
`/sf-apex-review` `/sf-lwc-review` `/sf-flow-review` `/sf-code-review` `/sf-security-review` `/sf-governor-check` `/sf-soql-selectivity` `/sf-scan`

**Org operations**
`/sf-retrieve` `/sf-soql` `/sf-anon` `/sf-describe-snapshot` `/sf-snapshot`

**Specialist surfaces**
`/sf-aura-migrate` `/sf-omnistudio-detect` `/sf-apex-debug`

**Planning & QA**
`/sf-create-stories` `/sf-test-plan` `/sf-apex-test-write`

**Release**
`/sf-deploy` `/sf-release-checklist`

## What lives where

```
.claude/
  agents/     — agent definitions (markdown + YAML frontmatter)
  skills/     — slash commands (one subdirectory per skill, contains SKILL.md)
  hooks/      — bash hook scripts
  rules/      — path-scoped coding standards
  docs/
    templates/    — story, ADR, deployment plan, release notes, etc.
    mcp-presets.md — Salesforce DX MCP toolset presets
  settings.json — permissions, hooks, statusline wiring
AGENTS.md     — see above
STANDARDS.md  — see above
TOOLS.md      — see above
.mcp.json.example — copy to .mcp.json to enable the Salesforce DX MCP server
code-analyzer.yml — Salesforce Code Analyzer v5 config
force-app/    — your SFDX source (not provided by this template)
```
