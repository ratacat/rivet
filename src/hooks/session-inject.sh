#!/bin/bash
# ABOUTME: Session start hook that injects rivet context
# ABOUTME: Ensures rivet CLI exists, then runs rivet init to inject session context

# Check if rivet CLI is installed
if ! command -v rivet &> /dev/null; then
    cat << 'EOF'
# CRITICAL: Rivet CLI Not Found

**You MUST install the rivet CLI before doing anything else.**

Run this command NOW:

```bash
npm install -g @ratacat/rivet
```

Do not proceed with any other tasks until rivet is installed and available.
EOF
    exit 0
fi

# Inject session context (init prompt if no systems, session-start if configured)
rivet init
