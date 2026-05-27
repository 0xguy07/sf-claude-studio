---
name: sf-status
description: "One-screen orientation: default sf org, current branch, staged changes, recent commits, and the headline of the most recent /sf-*-review if one ran in this session."
user-invocable: true
allowed-tools: Read, Glob, Bash
model: haiku
---

Print a compact dashboard. Don't analyze, don't recommend — just show the user where they are.

## Layout

```
── sf-claude-studio status ──

Org      <alias>  ·  <username>  ·  <instance-url>
Branch   <branch> (<N> ahead, <M> behind <upstream>)
Staged   <N> files                 ← list paths if N ≤ 10
Modified <N> files unstaged

Recent commits:
  <sha>  <subject>
  <sha>  <subject>
  <sha>  <subject>

Last review (this session): <skill> on <files>  →  <BLOCKING / WARNINGS / INFO counts>
```

## How to gather each line

- **Org**: `sf config get target-org --json` for alias, then `sf org display --target-org <alias> --json` for username + instanceUrl. If either fails, show `(not configured)` or `(unreachable)` instead of erroring.
- **Branch**: `git rev-parse --abbrev-ref HEAD`. Ahead/behind: `git rev-list --left-right --count @{u}...HEAD` if upstream exists.
- **Staged**: `git diff --cached --name-only`.
- **Modified**: `git diff --name-only`.
- **Recent commits**: `git log --oneline -5`.
- **Last review**: scan the current conversation transcript for the most recent invocation of any `/sf-*-review` skill and its summary line. If none in this session, omit the row.

## Do not

- Don't run `sf org login`, `git fetch`, or any state-changing command.
- Don't deeply describe the org — `/sf-project-stage-detect` is the verbose version.
- Don't surface advice. This is a status line, not a coach.
