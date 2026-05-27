# sf-claude-studio — Tools the Studio Expects

The studio runs on top of three tool layers, in order from required to optional.

## Required

### `sf` CLI v2+

The Salesforce CLI is the primary mechanism by which the studio acts on an org. Every skill that touches an org (`/sf-deploy`, `/sf-retrieve`, `/sf-soql`, `/sf-anon`, `/sf-apex-debug`) shells out to `sf`.

```bash
# Verify
sf --version

# Install
npm install -g @salesforce/cli
```

Pre-allowlisted commands in `.claude/settings.json`:

```
sf org display*       sf data query*        sf apex run*
sf org list*          sf apex get log*      sf apex run test*
sf org open*          sf apex list log*     sf scanner*
sf project deploy validate*                  sf code-analyzer*
sf project deploy preview*
sf project deploy report*
```

Production-target deploys require explicit user re-confirmation (see `.claude/hooks/validate-deploy.sh`).

### Claude Code

The studio is a folder of markdown that Claude Code injects as context. Without Claude Code there's no runtime — but `.claude/` itself is harmless static config.

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

### `git`

Used by hooks (staged-file scanning, branch protection, session-start orientation) and most skills. Any modern version works.

## Strongly recommended

### Salesforce Code Analyzer v5

Aggregates PMD, ESLint, RetireJS, Flow Scanner, and Salesforce Graph Engine. Configured via `code-analyzer.yml` at the project root.

```bash
sf plugins install @salesforce/plugin-code-analyzer

# Or the older v4:
sf plugins install @salesforce/sfdx-scanner
```

`/sf-scan` wraps it with sensible defaults (severity threshold, target paths, output formatting).

### `node` 18+ and `npm`

Required for LWC tooling (Jest tests via `npm test`, eslint, etc.). Pre-allowlisted: `npm test*`, `npm run test*`, `npm run lint*`.

## Optional

### Salesforce DX MCP Server (`@salesforce/mcp`)

When you want agents to act on the org *without* shelling out — `deploy_metadata`, `retrieve_metadata`, `run_apex_test`, `run_soql_query` — opt in by copying `.mcp.json.example` to `.mcp.json` and choosing a persona-scoped toolset preset.

```bash
# Verify it'll spawn
npx -y @salesforce/mcp --help
```

Five preset toolsets (see `.claude/docs/mcp-presets.md`):

| Preset | Toolsets |
|-|-|
| `apex-dev` | orgs, data, metadata, testing, other |
| `lwc-dev` | orgs, data, metadata, testing, lwc-experts, other |
| `aura-migrate` | orgs, metadata, aura-experts, lwc-experts, other |
| `mobile-dev` | orgs, data, metadata, testing, lwc-experts, mobile, other |
| `data-admin` | orgs, data, users, metadata |

MCP is **additive**, not a replacement. The `sf` CLI permission allowlist still applies. If `.mcp.json` is absent (the default), the studio runs in CLI-only mode.

Known limits as of Spring '26:

- `run_soql_query` is read-only. Writes go through `sf data` CLI commands.
- OAuth token refresh is CLI-mediated. If `sf` tokens expire, MCP fails — surface that error.
- Every MCP call counts against the daily API limit (100k for EE).
- DX MCP is still developer preview in v0.30.x. Pin a version in `.mcp.json` for stability.

### `jq` and Python 3

Used by some hooks for JSON parsing and the Flow Scanner engine respectively. Hooks fail gracefully if missing — you just lose that validation.

### `shellcheck`

Optional but recommended if you fork and modify the bash hooks. `/sf-doctor` reports presence informationally.

## Permission denylist (always blocked)

These are blocked in `.claude/settings.json` regardless of any allowlist:

- `rm -rf *`
- `git push --force*`, `git push -f *`, `git reset --hard*`, `git clean -f*`
- `sudo *`, `chmod 777*`
- `sf project deploy start*--target-org*production*` — explicit production deploys
- `sf org delete*`, `sf org logout*`
- Any read of `**/.env*` files

Adjust per project — but the defaults are conservative on purpose.

## Diagnosing tool problems

Run `/sf-doctor` for a one-shot health check. It reports pass/fail per tool, surfaces missing executables, and points at the install command for anything broken.
