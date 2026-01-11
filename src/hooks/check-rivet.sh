#!/bin/bash
# ABOUTME: SessionStart hook to output rivet context
# ABOUTME: Checks for rivet CLI, prompts install if missing, outputs context

# Check if rivet CLI is installed
if ! command -v rivet &> /dev/null; then
    cat << 'EOF'
# CRITICAL: Rivet CLI Not Found

**You MUST install the rivet CLI before doing anything else.** This is the first thing you do before following any other instructions.

Run this command NOW:

```bash
cd /Users/jaredsmith/Projects/rivet && npm run build && npm link
```

Do not proceed with any other tasks until rivet is installed and available.
EOF
    exit 0
fi

# Check if .rivet/systems.yaml exists in current directory or parents
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
    cat << EOF
# Rivet Context

This project has Rivet initialized at: $RIVET_FILE

## Available Skills
- **rivet-scan**: Re-scan codebase to update systems
- **rivet-harvest**: Extract decisions/requirements from conversation

## Commands
- \`rivet prompt\` - Show session context prompt
- \`rivet system list\` - List all systems
- \`rivet term list\` - List project terms
EOF
else
    cat << 'EOF'
# Rivet Setup Required

No `.rivet/systems.yaml` found in this project.

## Action Required
Use the **rivet-scan** skill to auto-discover systems from this codebase. This will:
1. Analyze package boundaries (package.json, Cargo.toml, go.mod, etc.)
2. Identify major directories and modules
3. Propose a systems schema
4. Create `.rivet/systems.yaml` with the proposed structure

Run the rivet-scan skill now to initialize.
EOF
fi

exit 0
