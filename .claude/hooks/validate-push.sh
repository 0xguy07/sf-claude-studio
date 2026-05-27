#!/usr/bin/env bash
# Warn before pushing to protected branches.
set -uo pipefail

input=$(cat 2>/dev/null || echo "")
cmd=$(echo "$input" | grep -o '"command":"[^"]*"' | head -1 | sed 's/.*"command":"\(.*\)"/\1/')

case "$cmd" in
    *"git push"*) ;;
    *) exit 0 ;;
esac

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
case "$branch" in
    main|master|release/*|production)
        echo "[validate-push] About to push protected branch '$branch' — confirm with the user." >&2
        ;;
esac

exit 0
