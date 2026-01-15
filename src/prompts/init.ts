// ABOUTME: Generates init prompt for Claude
// ABOUTME: Critical blocking prompt requiring codebase analysis before any work

import { readFileSync } from 'fs'
import { join } from 'path'
import { getTemplatesDir } from '../parser/yaml.js'

/**
 * Generate the init prompt for discovering project systems
 * This is a BLOCKING prompt - Claude must complete this before any other work
 */
export function generateInitPrompt(): string {
  const templatePath = join(getTemplatesDir(), 'systems.yaml')
  const template = readFileSync(templatePath, 'utf-8').trim()

  return `
# CRITICAL: Rivet Initialization Required

> **START IMMEDIATELY.** Do not wait for user input. Do not ask permission. Do not summarize this prompt. Begin Step 1 NOW.

A \`.rivet/systems.yaml\` file needs to be created. Analyze this codebase and fill it out.

## Step 1: Read the Template

First, read the template to understand the expected format:

\`\`\`bash
cat .rivet/systems.yaml
\`\`\`

## Step 2: Analyze the Codebase with TLDR

Use TLDR to understand the codebase structure and relationships.

**Key issue:** TLDR defaults to Python. For TypeScript projects, you **must** specify \`--lang typescript\`.

### Quick Reference

\`\`\`bash
# Structure - what functions/classes exist
tldr structure src/ --lang typescript

# Call graph - cross-file relationships (run warm first for caching)
tldr warm src/ --lang typescript
tldr calls src/ --lang typescript

# Imports from a specific file
tldr imports src/commands/system.ts

# Find what calls a function (reverse call graph)
tldr impact src/parser/yaml.ts readRivetFile --lang typescript

# Semantic search (requires embeddings)
tldr semantic "main entry points" src/

# Diagnostics (type/lint errors)
tldr diagnostics src/commands/system.ts
\`\`\`

### Why \`tldr structure .\` may fail

1. Running on \`.\` may pick up \`dist/\` (declaration files with empty implementations)
2. The \`.tldrignore\` file may not be respected if results are cached
3. Language defaults to Python if no source files match the implicit path

### Recommended Workflow

\`\`\`bash
# First time: warm the call graph cache
tldr warm src/ --lang typescript

# Then use structure and calls
tldr structure src/ --lang typescript
tldr calls src/ --lang typescript
\`\`\`

From this analysis, identify:
- **Systems**: Cohesive bundles of code (~5% of codebase each)
- **Boundaries**: What each system IS and ISN'T responsible for
- **Relationships**: How systems call/depend on each other

## Step 3: Fill Out systems.yaml

Edit \`.rivet/systems.yaml\` following the template rules EXACTLY:

**You MUST follow these rules from the template:**

1. **DOMAIN TERMS ONLY** - Project/system terms are domain language, NOT method names
2. **BOUNDARIES OVER LISTS** - Define what a system IS and ISN'T responsible for

**Required fields:**
- \`project.name\` and \`project.purpose\` - what this project does
- \`systems\` - each major component with:
  - \`description\`: What it does (user perspective, ~100 words max)
  - \`boundaries\`: What's in/out of scope (REQUIRED)
  - \`relationships\`: How this system relates to others

**DO NOT fill out during init (these come from deep-harvest):**
- \`terms\` - captured via deep-harvest from old transcripts
- \`requirements\` - captured via deep-harvest after reviewing history
- \`decisions\` - captured as architectural choices emerge

A system is something you'd draw as a box in an architecture diagram.

**Good system names**: CLI, Parser, API, Auth, Database
**Bad system names**: RedisCache, ZodValidator, ExpressMiddleware (implementation details)

## Step 4: Define Relationships

Relationships describe how systems interact. Each relationship is a tuple: \`[type, target_system]\`

### Relationship Types

| Type | Meaning | Example |
|------|---------|---------|
| \`calls\` | Runtime invocation - A calls functions in B | CLI calls Commands at runtime |
| \`called_by\` | Inverse of calls - B is called by A | Commands are called_by CLI |
| \`depends_on\` | Compile-time dependency - A needs B to exist | Parser depends_on Schema types |
| \`used_by\` | Inverse of depends_on - B is used by A | Schema is used_by Parser |

### How to Discover Relationships

1. **From TLDR call graph**: \`tldr calls src/\` shows function-level calls - aggregate these to system level
2. **From imports**: If SystemA imports from SystemB, that's likely a \`depends_on\` relationship
3. **From architecture**: Think about data flow and control flow between boxes in your mental diagram

### Relationship Guidelines

- **Prefer forward relationships**: Use \`calls\` and \`depends_on\` over \`called_by\` and \`used_by\`
- **One direction per edge**: Don't add both \`calls\` and \`called_by\` for the same pair
- **Be selective**: Only capture meaningful architectural relationships, not every function call
- **Runtime vs compile-time**: \`calls\` is runtime behavior, \`depends_on\` is compile-time structure

### Example

\`\`\`yaml
systems:
  CLI:
    description: Command-line interface that parses arguments and routes to handlers.
    boundaries:
      - "Argument parsing only - business logic lives in Commands"
    relationships:
      - [calls, Commands]
      - [depends_on, Schema]

  Commands:
    description: Individual command implementations with business logic.
    boundaries:
      - "Command logic only - argument parsing handled by CLI"
    relationships:
      - [calls, Parser]
      - [depends_on, Schema]

  Parser:
    description: Reads and writes the configuration file.
    boundaries:
      - "File I/O only - no business logic"
    relationships:
      - [depends_on, Schema]

  Schema:
    description: Type definitions for the configuration structure.
    boundaries:
      - "Type definitions only - no runtime logic"
    relationships: []
\`\`\`

## Step 5: Verify

After editing, verify the file is valid:

\`\`\`bash
rivet system list
\`\`\`

## Step 6: Deep Harvest

Once systems are defined, mine old transcripts for terms, decisions, and requirements:

\`\`\`bash
rivet prompt deep-harvest
\`\`\`

This outputs a prompt that guides you through reviewing:
- Old Claude Code transcripts in \`~/.claude/projects/\`
- README and documentation
- Commit messages and PR descriptions

Extract domain terms, architectural decisions, and requirements that should be locked down.

## Template Reference

The template below shows all available fields and guidelines:

\`\`\`yaml
${template}
\`\`\`

---

**Remember**: Complete this initialization NOW before any other work. The user is waiting for you to set up Rivet so the project has proper architectural documentation.
`.trim()
}
