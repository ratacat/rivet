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
# Rivet Initialization

> **Start immediately.** Tell the user what you're doing, then begin Step 1.

**Say this first:**
> "Setting up Rivet for this project. I'll use TLDR to run static analysis on your codebase, auto-detect the major systems and their relationships, and create a \`.rivet/systems.yaml\` file. This takes a minute - I'll keep you posted as I go."

Then proceed through the steps below. **Every 3-4 tool calls, give a brief status update** so the user knows what's happening (e.g., "Found 4 systems so far, now analyzing relationships..." or "Mapping the call graph between modules...").

---

## Step 1: Read the Template

First, read the template to understand the expected format:

\`\`\`bash
cat .rivet/systems.yaml
\`\`\`

## Step 2: Analyze the Codebase with TLDR

TLDR performs static analysis to understand code structure and relationships.

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

## Step 7: Completion Output

When you're done, give the user a summary:

1. **Codebase Analysis**: Describe the systems you detected and how they relate to each other. Give a brief architectural overview.

2. **What You Created**: Explain that you just created \`.rivet/systems.yaml\` - the interface between their linguistic scaffolding (decisions, requirements, terminology) and the actual code.

3. **How It Works**: This file gets reviewed and updated during coding sessions. As you work, new terms, decisions, and requirements can be captured automatically.

4. **User Control**: The decisions, requirements, and terminology sections are safe to edit directly if they want, or they can ask you to add, modify, or remove entries.

5. **About Terminology**: Explain that terms lock down domain language. When a term is deprecated, it maps to a replacement term with a reason - this helps maintain consistency even as vocabulary evolves. Old terms show up as warnings during code reviews.

**Example completion message:**
> "Done! I've created \`.rivet/systems.yaml\` with X systems: [brief list]. The CLI system handles argument parsing and routes to commands, which depend on the Parser for file I/O...
>
> This file is your project's linguistic scaffolding - it connects your architectural decisions to the code. As we work together, I'll capture new terms and decisions here. You can edit it directly or just ask me to update it.
>
> Terms you define become locked vocabulary. If you later rename something, deprecating the old term keeps a record and warns if the old name gets used."

Now address whatever the user originally asked about.
`.trim()
}
