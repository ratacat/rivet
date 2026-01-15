// ABOUTME: Generates deep-harvest prompt for Claude
// ABOUTME: One-time extraction of terms, decisions, requirements from old transcripts

import type { RivetFile } from '../schema/types.js'

/**
 * Collect all existing terms from project and systems
 */
function collectExistingTerms(data: RivetFile): string[] {
  const existingTerms: string[] = []

  if (data.project.terms) {
    existingTerms.push(...Object.keys(data.project.terms))
  }

  if (data.systems) {
    for (const system of Object.values(data.systems)) {
      if (system.terms) {
        existingTerms.push(...Object.keys(system.terms))
      }
    }
  }

  return existingTerms
}

/**
 * Format existing terms section
 */
function formatExistingTerms(terms: string[]): string {
  if (terms.length === 0) return ''

  return `
## Already Defined

These terms are already locked (don't re-propose):

\`${terms.join('`, `')}\`
`
}

/**
 * Format existing systems section
 */
function formatExistingSystems(data: RivetFile): string {
  if (!data.systems || Object.keys(data.systems).length === 0) return ''

  const systemList = Object.entries(data.systems)
    .map(([name, system]) => `- **${name}**: ${system.description}`)
    .join('\n')

  return `
## Existing Systems

${systemList}
`
}

/**
 * Generate the deep-harvest prompt from rivet data
 * One-time extraction from old transcripts when first setting up Rivet
 */
export function generateDeepHarvestPrompt(data: RivetFile): string {
  const existingTerms = collectExistingTerms(data)
  const termsSection = formatExistingTerms(existingTerms)
  const systemsSection = formatExistingSystems(data)

  return `
# Deep Harvest

Systems have been defined. Now mine old transcripts and project history for architectural knowledge.

## Sources to Review

Look through these for requirements, decisions, and domain terms:

1. **Claude Code transcripts** - \`~/.claude/projects/\` contains JSONL files with past conversations
   - Find this project's folder and read the largest/most recent transcript files
   - Focus on discussions about architecture, naming, and design choices
2. **README and documentation** - stated requirements and design decisions
3. **Commit messages** - rationale for changes
4. **Code comments** - inline decisions and constraints
5. **PR descriptions** - why changes were made

## What to Extract

1. **New domain terms** - words or phrases used consistently with specific meaning
   - Are they scoped enough? Avoid generic words like "context", "handler", "data"
   - Consider prefixing with project/system name if needed

2. **Decisions made** - architectural choices with rationale
   - Capture the WHY, not just the WHAT
   - Example: "Redis for sessions - need sub-ms latency" not "Uses Redis"

3. **Requirements discovered** - constraints that emerged
   - Should be atomic and testable
   - Example: "Must validate JWT on every request"

4. **System boundaries** - clarifications about what's in/out of scope

5. **New systems** - cohesive code bundles that deserve their own entry
${termsSection}${systemsSection}
## Output Format

**Do not edit .rivet/systems.yaml directly** - use CLI commands.

Batch multiple operations together using \`rivet sync\`:

\`\`\`bash
rivet sync \\
  --system-require CLI "must parse arguments before routing" \\
  --system-decide CLI "uses subcommand pattern for extensibility" \\
  --term-define rivet-prompt "CLI command that outputs AI prompts"
\`\`\`

Or run individual commands:

\`\`\`bash
rivet project edit +term <name> "<definition>"
rivet project edit +decision "<rationale>"
rivet system edit <Name> +requirement "<constraint>"
rivet system edit <Name> +boundary "<scope clarification>"
\`\`\`

## Guidelines

- **Batch related changes** - use \`rivet sync\` to group operations
- **Newer sources are more authoritative** than older ones
- **Ask before running** - propose the commands, let the user approve
- **Quality over quantity** - only extract things worth locking down
- **Prefer system-level** for things specific to one system
- **Prefer project-level** for cross-cutting concerns
`.trim()
}
