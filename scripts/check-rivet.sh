#!/bin/bash
# ABOUTME: SessionStart hook to check for .rivet/systems.yaml
# ABOUTME: Outputs context for Claude to auto-invoke rivet-scan if needed

# Check if .rivet/systems.yaml exists in current directory or parents
find_rivet() {
    local dir="$PWD"
    while [ "$dir" != "/" ]; do
        if [ -f "$dir/.rivet/systems.yaml" ]; then
            return 0
        fi
        dir=$(dirname "$dir")
    done
    return 1
}

if find_rivet; then
    # Rivet is already initialized - no action needed
    exit 0
else
    # No .rivet/systems.yaml found - output context for Claude
    # This stdout becomes context that Claude reads
    cat << 'EOF'
[Rivet Plugin] No .rivet/systems.yaml found in this project.

To set up Rivet for this codebase, I should scan the project structure and propose systems. This will:
1. Analyze package boundaries (package.json, Cargo.toml, go.mod, etc.)
2. Identify major directories and modules
3. Propose a systems schema
4. Create .rivet/systems.yaml with the proposed structure

I'll use the rivet-scan skill to do this automatically.
EOF
    exit 0
fi
