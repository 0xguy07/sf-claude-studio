#!/usr/bin/env bash
# Run on session stop. Records branch + git status snapshot to .claude/sessions/.
set -uo pipefail

ts=$(date +%Y-%m-%dT%H-%M-%S)
mkdir -p .claude/sessions 2>/dev/null || exit 0

if git rev-parse --git-dir >/dev/null 2>&1; then
    {
        echo "session: $ts"
        echo "branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
        echo "--- git status ---"
        git status --short
        echo "--- last 3 commits ---"
        git log --oneline -3 2>/dev/null
    } > ".claude/sessions/session-${ts}.log"
fi

exit 0
