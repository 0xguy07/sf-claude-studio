---
name: sf-doctor
description: "Run a preflight health check on the project. Reports pass/fail per check across sf CLI, default org, .claude/ structure, hooks, scanners, MCP config, and gitignore hygiene. Surfaces 'why isn't this working' before you spend time debugging it."
user-invocable: true
allowed-tools: Read, Glob, Bash
model: haiku
---

You are running a one-shot diagnostic. Don't speculate, don't propose fixes mid-stream. Run every check, capture the result, then output a clean dashboard at the end. The user is asking "is my setup OK?" — give them a yes/no per item plus the headline if not.

## Phase 1: Run every check

For each check below: capture pass / warn / fail and a one-line detail. Run them all even if early ones fail — the user wants the full picture.

### Tooling

1. **`sf` CLI installed** — `sf --version` exits 0 and prints a version.
2. **`sf` CLI v2+** — extracted version major number ≥ 2.
3. **`node --version`** — present (LWC tooling needs it). v18+ ideal.
4. **`git` repo** — `git rev-parse --git-dir` exits 0.
5. **`jq` installed** — optional but used by some hooks. Warn if missing.
6. **Python 3** — optional, used by Flow Scanner. Warn if missing.

### Org + auth

7. **Default `sf` target-org configured** — `sf config get target-org` returns a non-empty value.
8. **Default org reachable** — `sf org display --target-org <alias> --json` exits 0 within 10s. Warn (not fail) on timeout — could be offline.
9. **Token not expired** — if `sf org display` returns an `instanceUrl` and `accessToken` field, pass. If it returns `INVALID_SESSION_ID` or similar, fail with "run `sf org login web`".

### Project structure

10. **`sfdx-project.json` present** — at the project root.
11. **`force-app/` directory present** — populated or empty is fine.
12. **`.claude/` directory present** — `.claude/agents/`, `.claude/skills/`, `.claude/hooks/`, `.claude/rules/` all populated.
13. **`.claude/settings.json` valid JSON** — `python3 -m json.tool .claude/settings.json` exits 0.
14. **CLAUDE.md present** at the project root.

### Hooks

15. **All hooks executable** — every `.sh` file under `.claude/hooks/` has the `+x` bit. List any that don't.
16. **Hook scripts pass shellcheck** (if shellcheck is installed) — informational only, don't fail.
17. **`validate-commit.sh` smoke test** — feed a synthetic input, confirm exit 0. (Don't actually scan files.)

### Quality tooling

18. **`sf scanner` or `sf code-analyzer` plugin installed** — `sf plugins list` contains either name. Warn if neither.
19. **`code-analyzer.yml` present and parseable** — at the project root.

### MCP (optional)

20. **`.mcp.json.example` present** in repo (template hygiene).
21. **`.mcp.json` either absent (default) or valid JSON** — never both broken and missing.
22. **`.mcp.json` is gitignored** if present — confirm `git check-ignore .mcp.json` exits 0.

### Counts (informational)

23. Count agents under `.claude/agents/*.md`.
24. Count skills under `.claude/skills/*/SKILL.md`.
25. Count rules under `.claude/rules/*.md`.
26. Count hooks under `.claude/hooks/*.sh`.

## Phase 2: Output

Print a single-screen dashboard, grouped by section, using:

```
✓  passing check
⚠  warning (non-fatal)
✗  failing check  ← what to do
```

End with a one-line summary: `N passed · M warnings · K failures`. If failures exist, list the recommended fix per failure as a numbered list at the bottom.

## Phase 3: Don't auto-fix

Do not run `sf plugins install`, `chmod +x`, `sf org login`, or any other state-changing command. The user invokes `/sf-doctor` to find out what's wrong, not to have it silently fixed. Tell them what to do; let them run it.

## Bash skeleton (use as a starting point)

```bash
PASS=0; WARN=0; FAIL=0
ok()   { echo "✓  $1"; PASS=$((PASS+1)); }
warn() { echo "⚠  $1${2:+ — $2}"; WARN=$((WARN+1)); }
fail() { echo "✗  $1${2:+ — $2}"; FAIL=$((FAIL+1)); }

# Tooling
command -v sf >/dev/null 2>&1 && ok "sf CLI installed ($(sf --version 2>/dev/null | head -1))" || fail "sf CLI installed" "install: https://developer.salesforce.com/tools/salesforcecli"
# ... and so on for every check ...

echo
echo "── Summary ──"
echo "$PASS passed · $WARN warnings · $FAIL failures"
```

Adapt this skeleton; don't paste it verbatim.
