#!/usr/bin/env bash
# Status line for Claude Code. Shows: branch | default sf org alias | model
set -uo pipefail

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-git")

org_alias=""
if command -v sf >/dev/null 2>&1; then
  org_alias=$(sf config get target-org --json 2>/dev/null \
    | grep -o '"value": *"[^"]*"' \
    | head -1 \
    | sed 's/.*"value": *"\([^"]*\)"/\1/')
fi
[ -z "$org_alias" ] && org_alias="no-default-org"

model="${CLAUDE_MODEL:-claude}"

printf "  %s   %s    %s" "$branch" "$org_alias" "$model"
