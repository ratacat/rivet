#!/bin/bash
# ABOUTME: Pre-commit hook to output session-harvest prompt
# ABOUTME: Reminds AI to capture emerging terms/decisions before commit

# Check if rivet CLI is installed
if ! command -v rivet &> /dev/null; then
    exit 0
fi

# Check if .rivet/systems.yaml exists
find_rivet() {
    local dir="$PWD"
    while [ "$dir" != "/" ]; do
        if [ -f "$dir/.rivet/systems.yaml" ]; then
            echo "$dir/.rivet/systems.yaml"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    return 1
}

RIVET_FILE=$(find_rivet)

if [ -n "$RIVET_FILE" ]; then
    rivet prompt session-harvest
fi

exit 0
