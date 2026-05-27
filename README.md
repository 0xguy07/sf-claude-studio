<p align="center">
  <h1 align="center">sf-claude-studio</h1>
  <p align="center">
    Turn a single Claude Code session into a full Salesforce delivery studio.
    <br />
    14 agents. 23 skills. 7 hooks. 10 path-scoped rule sets. Best practices baked in.
    <br />
    Works with the Salesforce CLI; optional Salesforce DX MCP server integration.
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href=".claude/agents"><img src="https://img.shields.io/badge/agents-14-blueviolet" alt="14 Agents"></a>
  <a href=".claude/skills"><img src="https://img.shields.io/badge/skills-23-green" alt="23 Skills"></a>
  <a href=".claude/hooks"><img src="https://img.shields.io/badge/hooks-7-orange" alt="7 Hooks"></a>
  <a href=".claude/rules"><img src="https://img.shields.io/badge/rules-10-red" alt="10 Rules"></a>
  <a href="https://docs.anthropic.com/en/docs/claude-code"><img src="https://img.shields.io/badge/built%20for-Claude%20Code-f5f5f5?logo=anthropic" alt="Built for Claude Code"></a>
</p>

---

## Why this exists

Salesforce delivery looks easy until it isn't. Triggers stack up, SOQL leaks into loops, sharing rules drift, hardcoded IDs sneak into Apex, and the test class clears 75% coverage without proving anything. A single chat session won't catch any of that — it'll happily write the bug for you.

`sf-claude-studio` gives Claude Code the structure of a real SF delivery team: an architect who guards the solution, leads who own each domain (Apex, LWC, integration, data, QA, DevOps, security), and path-scoped rules that auto-fire the moment you edit `classes/`, `triggers/`, `lwc/`, or a flow. Every common Apex anti-pattern — bulkification, hardcoded IDs, sharing declarations, trigger handlers, governor-limit checks — is encoded as enforceable guidance, sourced from three canonical references and cited in the rules themselves.

You still make every call. The studio asks the questions, holds the standard, and refuses to let bad patterns through.

---

## What's included

| Category   | Count | Description                                                                                          |
|------------|------:|------------------------------------------------------------------------------------------------------|
| **Agents** |    14 | Architects, leads, and surface specialists across Apex, LWC, Aura, VF, OmniStudio, integration, data, QA, DevOps, security |
| **Skills** |    23 | Slash commands all prefixed `/sf-*`. See full catalog below.                                          |
| **Hooks**  |     7 | Auto-validation: hardcoded IDs, SOQL/DML in loops, missing `with sharing`, `SeeAllData=true`, naming  |
| **Rules**  |    10 | Path-scoped standards for Apex classes/triggers/tests, LWC, Aura, Visualforce, Flow, OmniStudio, sObjects, permission sets |
| **Templates** | 10 | User story, solution design, ADR, trigger-handler, LWC skeleton, deployment plan, release notes, test plan, retro, runbook |

## Studio hierarchy

```
Tier 1 — Architects (Opus)
  solution-architect    technical-architect    delivery-lead

Tier 2 — Department Leads (Sonnet)
  apex-lead       lwc-lead         integration-lead    data-lead
  qa-lead         devops-lead      security-lead

Surface specialists (Sonnet)
  aura-migrator   visualforce-maintainer    omnistudio-builder    apex-debugger
```

Future tiers (specialists like `flow-builder`, `soql-optimizer`, `apex-test-writer`, `sandbox-manager`) and cloud specialists (`sales-cloud`, `service-cloud`, `experience-cloud`, `nonprofit-cloud`) ship in later releases.

## Slash commands

**Onboarding & project**
`/sf-init` `/sf-start` `/sf-help` `/sf-project-stage-detect`

**Build & reviews**
`/sf-apex-review` `/sf-lwc-review` `/sf-flow-review` `/sf-code-review` `/sf-security-review` `/sf-governor-check` `/sf-soql-selectivity` `/sf-scan`

**Org operations**
`/sf-retrieve` `/sf-soql` `/sf-anon`

**Specialist surfaces**
`/sf-aura-migrate` `/sf-omnistudio-detect` `/sf-apex-debug`

**Stories & QA**
`/sf-create-stories` `/sf-test-plan` `/sf-apex-test-write`

**Release**
`/sf-deploy` `/sf-release-checklist`

## Getting started

### Prerequisites

- [Git](https://git-scm.com/)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — `npm install -g @anthropic-ai/claude-code`
- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) — `sf` (v2+)
- *Recommended:* `jq` (hook validation), Python 3 (JSON checks), [PMD](https://pmd.github.io/) or [SF Code Analyzer](https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/) for `/sf-apex-review`

All hooks fail gracefully if optional tools are missing — nothing breaks, you just lose validation.

### Setup

```bash
# Use as a template for a new SF project
git clone https://github.com/0xguy07/sf-claude-studio.git my-sf-project
cd my-sf-project
rm -rf .git && git init   # detach from this template
sf project generate --name my-sf-project --output-dir .

# Open Claude Code
claude
```

Then run `/sf-start` — it asks where you are (greenfield, existing org, mid-sprint, brownfield) and routes you to the right next step.

## Optional: Salesforce DX MCP integration

The studio works fine using the `sf` CLI alone. For agents that need to actually act on an org (deploy metadata, run tests, query schema) without exiting to a shell, the [Salesforce DX MCP Server](https://www.npmjs.com/package/@salesforce/mcp) is supported as an opt-in:

```bash
cp .mcp.json.example .mcp.json
# pick a persona-scoped toolset preset (apex-dev / lwc-dev / aura-migrate / mobile-dev / data-admin)
```

See `.claude/docs/mcp-presets.md` for the preset reference and known limits.

## Reference material baked in

The Apex rules and the `/sf-apex-review` skill encode practices from three canonical references:

- [Salesforce Engineering — Developer Practices Checklist (2015)](https://developer.salesforce.com/blogs/engineering/2015/05/developer-practices-checklist)
- [Salesforce Developer Wiki — Apex Code Best Practices](https://developer.salesforce.com/ja/wiki/apex_code_best_practices)
- [SalesforceBen — 12 Salesforce Apex Best Practices](https://www.salesforceben.com/12-salesforce-apex-best-practices/)

Citations are inline in `.claude/rules/apex-classes.md`, `.claude/rules/apex-triggers.md`, and `.claude/rules/apex-tests.md`.

The Headless 360 / MCP / OmniStudio runtime guidance is informed by:

- [What Salesforce Headless 360 Means For Developers](https://developer.salesforce.com/blogs/2026/05/headless-360-what-it-means-for-developers)
- [`@salesforce/mcp` on npm](https://www.npmjs.com/package/@salesforce/mcp)
- [Salesforce Code Analyzer v5](https://developer.salesforce.com/docs/platform/salesforce-code-analyzer/guide/code-analyzer.html)
- [OmniStudio Deployments Roadmap](https://developer.salesforce.com/blogs/2026/02/omnistudio-deployments-made-easier-whats-coming-on-the-salesforce-roadmap)

## Inspiration

The shape of this template — three-tier studio hierarchy, agents-skills-hooks-rules layout, collaboration protocol — is adapted from [donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios). All Salesforce-specific content is original.

## License

MIT — see [LICENSE](LICENSE).
