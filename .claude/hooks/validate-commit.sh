#!/usr/bin/env bash
# PreToolUse hook for Bash. Fires on every Bash call; only acts on `git commit`.
# Scans staged Apex for: hardcoded SF IDs, SOQL/DML in for loops, missing sharing
# declaration, SeeAllData=true. Warns (exit 0) — non-blocking by design.
# Compatible with macOS bash 3.2.
set -uo pipefail

# Read the Bash command from stdin (Claude Code hook contract)
input=$(cat 2>/dev/null || true)
cmd=$(printf '%s' "$input" | grep -o '"command":"[^"]*"' | head -1 | sed 's/.*"command":"\(.*\)"/\1/')
cmd="${cmd:-}"

case "$cmd" in
    *"git commit"*) ;;
    *) exit 0 ;;
esac

if ! git rev-parse --git-dir >/dev/null 2>&1; then exit 0; fi

staged=$(git diff --cached --name-only --diff-filter=AM 2>/dev/null | grep -E '\.(cls|trigger)$' || true)
[ -z "$staged" ] && exit 0

violations=0
warn() {
    echo "[validate-commit] WARN: $1" >&2
    violations=$((violations + 1))
}

while IFS= read -r f; do
    [ -z "$f" ] && continue
    [ -f "$f" ] || continue

    # Hardcoded 15- or 18-char SF Id literal — single-quoted alphanumeric run.
    if grep -nEq "'[0-9a-zA-Z]{15}('|[0-9a-zA-Z]{3}')" "$f"; then
        warn "$f: hardcoded SF Id literal"
    fi

    # SOQL inside for loop
    awk_out=$(awk '
        /for[[:space:]]*\(/ { in_for=1; depth=1; next }
        in_for && /\{/      { depth++ }
        in_for && /\}/      { depth--; if (depth<=0) in_for=0 }
        in_for && /\[[[:space:]]*SELECT/ { print "soql"; exit }
    ' "$f")
    [ "$awk_out" = "soql" ] && warn "$f: SOQL inside for loop"

    # DML inside for loop
    awk_out=$(awk '
        /for[[:space:]]*\(/ { in_for=1; depth=1; next }
        in_for && /\{/      { depth++ }
        in_for && /\}/      { depth--; if (depth<=0) in_for=0 }
        in_for && /^[[:space:]]*(insert|update|upsert|delete)[[:space:]]/ { print "dml"; exit }
    ' "$f")
    [ "$awk_out" = "dml" ] && warn "$f: DML inside for loop"

    # Class without sharing declaration
    case "$f" in
        *.cls)
            if grep -Eq '^[[:space:]]*(public|global)[[:space:]]+(virtual[[:space:]]+|abstract[[:space:]]+)?class[[:space:]]' "$f"; then
                if ! grep -Eq '(with sharing|without sharing|inherited sharing)' "$f"; then
                    warn "$f: class missing 'with sharing'/'without sharing'/'inherited sharing'"
                fi
            fi
            ;;
    esac

    # SeeAllData=true
    if grep -Eq 'SeeAllData[[:space:]]*=[[:space:]]*true' "$f"; then
        warn "$f: SeeAllData=true — generate test data instead"
    fi
done <<< "$staged"

if [ "$violations" -gt 0 ]; then
    echo "[validate-commit] $violations Apex best-practice warning(s) — see .claude/rules/apex-*.md" >&2
fi

exit 0
