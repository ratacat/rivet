# Rivet Instructions for AI Agents

**Do not edit `.rivet/systems.yaml` directly.** Use the CLI commands below.

## Workflow

### Every Session
1. **Session start**: `rivet prompt` loads project context (terms, systems, boundaries)
2. **During work**: Use locked terms consistently, respect system boundaries
3. **Before commit**: `rivet prompt session-harvest` captures emerging terms/decisions + verifies alignment

### One-Time Setup
- **Deep harvest**: `rivet prompt deep-harvest` mines old transcripts for requirements/decisions

## Quick Reference

```bash
# Prompts
rivet prompt                    # Session start context
rivet prompt session-harvest    # Per-session maintenance
rivet prompt deep-harvest       # One-time mining of old transcripts

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

## Style Rules

### Terms
- **Scope matters**: Terms must be specific enough to avoid collisions with common words
- **Prefix when needed**: Use `rivet-prompt` not `prompt` if the word is generic
- **Domain language**: Terms are vocabulary users/stakeholders use, NOT method names
- **Code symbols allowed**: When a symbol name carries semantic weight (e.g., `RivetFile`)

**Good**: `harvest`, `rivet-prompt`, `RivetFile`, `system-boundary`
**Bad**: `prompt`, `context`, `createTerm`, `validateInput`

### Systems
- **Name by WHAT, not HOW**: Systems describe responsibility, not implementation
- **~5% of codebase**: Large enough to matter, small enough to be coherent
- **Architecture boxes**: If you'd draw it as a box in a diagram, it's a system

**Good**: `CLI`, `Parser`, `Prompts`, `Auth`, `Router`
**Bad**: `ZodValidator`, `YAMLHandler`, `ExpressMiddleware`, `HelperUtils`

### Boundaries
- **Define scope**: State what a system IS and ISN'T responsible for
- **Prevent scope creep**: Explicit exclusions are as important as inclusions
- **Not exhaustive lists**: Don't enumerate every function

**Good**: `"Authentication only - authorization handled by Permissions"`
**Bad**: `"Handles login(), logout(), refreshToken(), validateSession()"`

### Requirements
- **Atomic**: Each requirement is a single testable statement
- **The WHAT**: Describes what must happen, not why or how

**Good**: `"Must validate JWT tokens on every request"`
**Bad**: `"Handle user auth and session management efficiently"`

### Decisions
- **The WHY**: Captures rationale behind choices, not what the code does
- **Single statement**: Keep it simple - just the decision made

**Good**: `"JWT over sessions - need stateless scaling across regions"`
**Bad**: `"Uses JWT tokens for authentication"`
