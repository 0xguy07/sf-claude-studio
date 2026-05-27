#!/usr/bin/env bash
# PostToolUse for Write|Edit. Lightweight checks on metadata files just written/edited.
set -uo pipefail

input=$(cat 2>/dev/null || echo "")
file=$(echo "$input" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/.*"file_path":"\(.*\)"/\1/')
[ -z "${file:-}" ] && exit 0
[ -f "$file" ] || exit 0

case "$file" in
    *force-app/*/objects/*/fields/*.field-meta.xml|*src/objects/*/fields/*.field-meta.xml)
        if ! grep -q '<description>' "$file"; then
            echo "[validate-metadata] WARN: $file missing <description> — see rules/sobjects.md" >&2
        fi
        ;;
    *force-app/*/permissionsets/*|*src/permissionsets/*)
        if grep -Eq '<modifyAllData>true</modifyAllData>|<viewAllData>true</viewAllData>' "$file"; then
            echo "[validate-metadata] WARN: $file grants Modify/View All Data — justify in description (rules/permissionsets.md)" >&2
        fi
        ;;
    *flow-meta.xml)
        if ! grep -q '<description>' "$file"; then
            echo "[validate-metadata] WARN: $file missing <description> — see rules/flows.md" >&2
        fi
        ;;
esac

exit 0
