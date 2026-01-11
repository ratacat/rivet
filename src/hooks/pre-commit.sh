#!/bin/bash
# ABOUTME: Pre-commit hook to output drift check prompt
# ABOUTME: Reminds AI to verify changes against systems.yaml before commit

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
    rivet prompt drift-check
fi

exit 0
