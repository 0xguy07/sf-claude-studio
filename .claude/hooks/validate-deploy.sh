#!/usr/bin/env bash
# Warn on `sf project deploy start` without prior validate, especially against production.
set -uo pipefail

input=$(cat 2>/dev/null || echo "")
cmd=$(echo "$input" | grep -o '"command":"[^"]*"' | head -1 | sed 's/.*"command":"\(.*\)"/\1/')

case "$cmd" in
    *"sf project deploy start"*) ;;
    *) exit 0 ;;
esac

# Catch obvious production targets in the command string
if echo "$cmd" | grep -Eqi 'target-org[= ][^ ]*(prod|production|live)'; then
    echo "[validate-deploy] STOP: this looks like a production deploy. Confirm explicitly with the user." >&2
fi

# Test level discipline
if echo "$cmd" | grep -q 'NoTestRun'; then
    echo "[validate-deploy] WARN: --test-level NoTestRun skips validation. Use RunSpecifiedTests or RunLocalTests." >&2
fi

# Suggest validate first
if ! echo "$cmd" | grep -q -- '--dry-run\|validate'; then
    echo "[validate-deploy] tip: run \`sf project deploy validate\` first to catch failures without committing." >&2
fi

exit 0
