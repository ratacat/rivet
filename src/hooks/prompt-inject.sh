#!/bin/bash
# ABOUTME: UserPromptSubmit hook for rivet initialization
# ABOUTME: Quick check - only outputs if init needed, otherwise exits silently

# Fast exit if rivet not installed
command -v rivet &> /dev/null || exit 0

# Fast exit if .rivet/systems.yaml exists with systems
if [ -f ".rivet/systems.yaml" ]; then
    # Check if systems section has content (not just empty)
    if grep -q "^systems:" .rivet/systems.yaml 2>/dev/null; then
        # Has systems key - check if it has actual entries
        if grep -A1 "^systems:" .rivet/systems.yaml | grep -q "^  [A-Z]" 2>/dev/null; then
            # Systems defined, exit silently
            exit 0
        fi
    fi
fi

# Init needed - output the init prompt
rivet prompt init
