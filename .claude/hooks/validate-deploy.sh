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

# Extract the explicit --target-org / -o value, if any.
target=$(echo "$cmd" | grep -oE '(--target-org|-o)[= ][^ ]+' | head -1 | sed -E 's/(--target-org|-o)[= ]//')

# No explicit target → the deploy hits the default org silently. Warn.
if [ -z "$target" ]; then
    echo "[validate-deploy] WARN: no --target-org specified — this deploys to the default org. Pass --target-org explicitly." >&2
fi

# Protected-org check: STOP if the target matches any alias/username listed
# in .claude/protected-orgs (blank lines and #-comments ignored).
protected_file=".claude/protected-orgs"
if [ -n "$target" ] && [ -f "$protected_file" ]; then
    while IFS= read -r line; do
        line=$(echo "$line" | sed 's/#.*//' | tr -d '[:space:]')
        [ -z "$line" ] && continue
        if [ "$target" = "$line" ]; then
            echo "[validate-deploy] STOP: '$target' is in .claude/protected-orgs. Confirm explicitly with the user before deploying." >&2
            break
        fi
    done < "$protected_file"
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
