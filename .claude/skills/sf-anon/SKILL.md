---
name: sf-anon
description: "Execute anonymous Apex against the target org. Used for one-off data fixes, diagnostics, and scripts. Always shows the script and asks for confirmation before running."
argument-hint: "[--file <path>] | [--target-org <alias>]"
user-invocable: true
allowed-tools: Read, Glob, Bash, Write, AskUserQuestion
model: sonnet
agent: apex-lead
---

## Phase 1: Identify the script

If the user passed `--file`, read it. Otherwise, prompt for inline Apex.

If the script is being written for this session, write it to `scripts/apex/<descriptive-name>.apex` first — keeps it under version control.

## Phase 2: Read it back to the user

**Always show the script** before running. Highlight:
- DML statements (count and target object)
- SOQL count
- Callouts
- Any irreversible operation (`delete`, `Database.executeBatch` of a destructive class)

## Phase 3: Confirm target org

Refuse to run against `production` without an extra explicit confirmation step. Ask `Are you absolutely sure?` and require a "yes" plus the org alias typed back.

## Phase 4: Run

```
sf apex run --file scripts/apex/<name>.apex --target-org <alias>
```

## Phase 5: Capture output

Pretty-print the result. If the script produced a debug log id, offer to fetch the log via `sf apex get log`.

## Phase 6: Document

If the script fixed a one-off issue, suggest documenting it in `docs/runbooks/` using the runbook template.
