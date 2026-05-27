#!/usr/bin/env bash
# Run on Claude Code session start. Shows orientation: branch, default org, recent commits.
set -uo pipefail

echo "── sf-claude-studio session ──"

if git rev-parse --git-dir >/dev/null 2>&1; then
    branch=$(git rev-parse --abbrev-ref HEAD)
    echo "branch: $branch"
    echo "recent commits:"
    git log --oneline -5 2>/dev/null | sed 's/^/  /'
fi

if command -v sf >/dev/null 2>&1; then
    org=$(sf config get target-org --json 2>/dev/null \
        | grep -o '"value": *"[^"]*"' | head -1 \
        | sed 's/.*"value": *"\([^"]*\)"/\1/')
    if [ -n "${org:-}" ]; then
        echo "default sf org: $org"
    else
        echo "default sf org: (none configured — \`sf config set target-org=...\`)"
    fi
fi

exit 0
