# Rivet Instructions for AI Agents

**Do not edit `.rivet/systems.yaml` directly.** Use the CLI commands below.

## Workflow

### Every Session
1. **Session start**: `rivet prompt` loads project context (terms, systems, boundaries)
2. **During work**: Use locked terms consistently, respect system boundaries
3. **Before commit**: `rivet prompt drift-check` verifies alignment + session harvest

### One-Time Setup
- **Initial harvest**: `rivet prompt harvest` mines project history for requirements/decisions

## Quick Reference

```bash
# Prompts
rivet prompt                    # Session start context
rivet prompt drift-check        # Verification + session harvest
rivet prompt harvest            # Initial harvest (one-time)

# Batch operations (preferred)
rivet sync \
  --term-define <name> "<definition>" \
  --system-decide <system> "<rationale>" \
  --system-require <system> "<constraint>"

# Individual commands
rivet project edit +term <name> "<definition>"
rivet project edit +decision "<rationale>"
rivet system add <Name> "<description>"
rivet system edit <Name> +term <name> "<definition>"
rivet system edit <Name> +decision "<rationale>"
rivet system edit <Name> +boundary "<scope>"

# Deprecate terms
rivet term deprecate <old> --to <new> --reason "..."
rivet system edit <Name> term-deprecate <old> --to <new> --reason "..."
```

## Why CLI Commands?

- **Atomic commits**: Each command creates a git commit
- **Batching**: Use `rivet sync` to group related changes
- **Validation**: Commands validate input before writing
- **Auditability**: Clear record of what changed and when
