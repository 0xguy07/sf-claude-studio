#!/usr/bin/env bash
# Detect common gaps in the project layout and nudge toward fixes.
set -uo pipefail

# Fresh project? Suggest /start.
if [ ! -d "force-app" ] && [ ! -f "sfdx-project.json" ]; then
    echo "[gap] No SFDX project detected. Run /start to bootstrap, or 'sf project generate'."
fi

# Apex classes without matching test classes
if [ -d "force-app" ]; then
    while IFS= read -r cls; do
        base=$(basename "$cls" .cls)
        case "$base" in
            *Test|*_Test|Test_*) continue ;;
        esac
        if ! find force-app -type f \( -name "${base}Test.cls" -o -name "${base}_Test.cls" -o -name "Test_${base}.cls" \) 2>/dev/null | grep -q .; then
            echo "[gap] No test class found for ${base}.cls"
        fi
    done < <(find force-app -type f -name "*.cls" 2>/dev/null | head -200)
fi

exit 0
