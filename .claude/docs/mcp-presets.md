# MCP Toolset Presets

The Salesforce DX MCP server (`@salesforce/mcp`) ships 60+ tools grouped into toolsets. Loading `--toolsets all` consumes context and confuses agents that don't need a particular surface. Use a persona-scoped preset instead.

To switch presets: edit `.mcp.json` and restart Claude Code.

## Presets

### `apex-dev` — Apex backend work
```
--toolsets orgs,data,metadata,testing,other
```
- `orgs` — list/create/open authorized orgs and scratch orgs
- `data` — `run_soql_query` (read-only)
- `metadata` — `deploy_metadata`, `retrieve_metadata`
- `testing` — `run_apex_test`, `run_agent_test`
- `other` — Code Analyzer (PMD, ESLint, Graph Engine, Flow Scanner, RetireJS)

### `lwc-dev` — Lightning Web Component work
```
--toolsets orgs,data,metadata,testing,lwc-experts,other
```
Adds `lwc-experts` (20+ tools: scaffolding, Jest tests, a11y, SLDS2, security, Figma→LWC).

### `aura-migrate` — Legacy Aura → LWC migration
```
--toolsets orgs,metadata,aura-experts,lwc-experts,other
```
Adds `aura-experts` (4 GA tools, full PRD → blueprint → enhance → transition → verify pipeline via `orchestrate_aura_migration`).

### `mobile-dev` — Mobile Publisher / mobile LWC
```
--toolsets orgs,data,metadata,testing,lwc-experts,mobile,other
```
Adds `mobile` / `mobile-core` (barcode, biometrics, location, offline analysis).

### `data-admin` — Read-heavy data operations
```
--toolsets orgs,data,users,metadata
```
Adds `users` (`assign_permission_set`); excludes testing/`other` since this preset isn't for code work.

## Known limits (as of Spring '26)

- **No record CRUD via MCP.** `run_soql_query` is read-only. Writes go through `sf data` CLI commands or anonymous Apex (`sf apex run --file`).
- **OAuth tokens are CLI-mediated.** If `sf` tokens expire, the MCP server fails — surface that in your error handling.
- **API limits apply.** Every MCP call counts against the daily API limit (100k for EE). An agent running 50 queries in a session is consuming real org budget.
- **DX MCP is still labeled developer preview** in v0.30.x. Pin a version in `.mcp.json` if stability matters more than recency.

## Choosing between MCP and `sf` CLI

This template ships permissions for both. They are complementary, not exclusive:

| Use the MCP server when… | Use the `sf` CLI when… |
|-|-|
| You want the agent to read schema/data without exiting to a shell | You're writing data, running tests, or deploying |
| You want results parsed into structured tool output | You want raw `sf` exit codes and JSON for scripting |
| You want governance (sharing/FLS) enforced automatically | You're scripting in CI |

For most v0.1 workflows in this template, the `sf` CLI is sufficient. MCP is the upgrade path when you want agents acting more autonomously inside the org's trust boundary.
