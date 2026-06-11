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

# Nudge if the newest metadata snapshot for the default org is >30 days old.
# Silent when there's no org, no snapshots dir, or a recent snapshot exists.
if [ -n "${org:-}" ] && [ -d "snapshots/$org" ]; then
    newest=$(ls -1 "snapshots/$org" 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | sort | tail -1)
    if [ -n "$newest" ]; then
        # Convert YYYY-MM-DD to an epoch-day count without relying on GNU date.
        snap_epoch=$(date -j -f %Y-%m-%d "$newest" +%s 2>/dev/null || date -d "$newest" +%s 2>/dev/null || echo 0)
        if [ "$snap_epoch" -gt 0 ]; then
            age=$(( ($(date +%s) - snap_epoch) / 86400 ))
            if [ "$age" -gt 30 ]; then
                echo "snapshot: newest for $org is $newest (${age}d old) — run /sf-snapshot"
            fi
        fi
    fi
fi

exit 0
