# sf-claude-studio — Project Configuration

This project turns Claude Code into a **Salesforce delivery studio**: an opinionated set of agents, slash-command skills, hooks, and path-scoped rules that mirror how a real SF delivery team is organized.

## How agents are organized

Three tiers, same model as a real delivery org:

- **Tier 1 — Architects (Opus):** `solution-architect`, `technical-architect`, `delivery-lead`
- **Tier 2 — Department Leads (Sonnet):** `apex-lead`, `lwc-lead`, `integration-lead`, `data-lead`, `qa-lead`, `devops-lead`, `security-lead`
- **Surface specialists (Sonnet):** `aura-migrator`, `visualforce-maintainer`, `omnistudio-builder`, `apex-debugger`
- **Future:** flow-builder, soql-optimizer, apex-test-writer, sandbox-manager, cloud specialists (sales/service/experience/nonprofit/marketing)

Delegation rules:

1. **Vertical** — architects delegate to leads; leads delegate to specialists.
2. **Horizontal** — same-tier agents consult but cannot make binding cross-domain decisions.
3. **Conflict resolution** — design conflicts escalate to `solution-architect`; technical conflicts escalate to `technical-architect`.
4. **Domain boundaries** — agents do not modify files outside their domain without explicit delegation from the user or a parent agent.

## Collaboration protocol (applies to every agent)

1. **Ask** before assuming. Specs are never complete.
2. **Present 2–4 options** with pros/cons for any non-trivial decision.
3. **The user decides.** Agents do not auto-pick architecture.
4. **Show before writing.** Diffs and code summaries before any Write/Edit call.
5. **Approve to write.** No file is created or modified without explicit user sign-off.

## Coding standards (enforced by `.claude/rules/`)

Path-scoped rules auto-apply when you edit files in matching paths. They cover Apex (classes/triggers/tests), LWC, Aura (don't write new), Visualforce (legacy maintenance), Flow, OmniStudio (with runtime detection), sObjects, and permission sets — encoding the practices from the canonical Salesforce references this template ships with. No SOQL/DML in loops, no hardcoded IDs, sharing always declared, single trigger per object, business logic out of triggers, bulk-aware tests, before-save flows for same-record updates, and more. See `.claude/rules/` for the full set.

## Slash commands

Run `/sf-help` after setup to see all skills. Headline commands for daily delivery:

**Project / onboarding:** `/sf-init` `/sf-start` `/sf-help` `/sf-project-stage-detect`

**Reviews:** `/sf-apex-review` `/sf-lwc-review` `/sf-flow-review` `/sf-code-review` `/sf-security-review` `/sf-governor-check` `/sf-soql-selectivity` `/sf-scan`

**Org ops:** `/sf-retrieve` `/sf-soql` `/sf-anon`

**Specialist surfaces:** `/sf-aura-migrate` `/sf-omnistudio-detect` `/sf-apex-debug`

**Planning & QA:** `/sf-create-stories` `/sf-test-plan` `/sf-apex-test-write`

**Release:** `/sf-deploy` `/sf-release-checklist`

## Reference material baked in

Rules and the `/sf-apex-review` skill are derived from:

- Salesforce Engineering — *Developer Practices Checklist* (2015)
- Salesforce Developer Wiki — *Apex Code Best Practices* (10 rules)
- SalesforceBen — *12 Salesforce Apex Best Practices*

Citations are inline in `.claude/rules/apex-classes.md`, `.claude/rules/apex-triggers.md`, and `.claude/rules/apex-tests.md`. The Headless 360 / MCP / OmniStudio runtime guidance pulls from the official Salesforce engineering blogs and `@salesforce/mcp` documentation; see the README for links.

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
.mcp.json.example — copy to .mcp.json to enable the Salesforce DX MCP server
code-analyzer.yml — Salesforce Code Analyzer v5 config (PMD/ESLint/Flow Scanner/SFGE/RetireJS)
force-app/    — your SFDX source (not provided by this template)
```

## Optional: Salesforce DX MCP server

Out of the box this template uses the `sf` CLI. To let agents act on the org without shelling out (deploy metadata, run tests, query schema), copy `.mcp.json.example` to `.mcp.json` and pick a persona-scoped toolset preset (apex-dev / lwc-dev / aura-migrate / mobile-dev / data-admin). See `.claude/docs/mcp-presets.md`.

## Permission model

`settings.json` auto-allows safe operations (`sf org display`, `git status`, scanner/PMD runs) and denies dangerous ones (`rm -rf`, `git push --force`, reading `.env`, deploying to production without dry-run). See `.claude/settings.json`.
