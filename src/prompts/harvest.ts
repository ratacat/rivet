// ABOUTME: Generates initial harvest prompt for Claude
// ABOUTME: One-time extraction of terms, decisions, requirements from project history

import type { RivetFile } from '../schema/types.js'

/**
 * Generate the initial harvest prompt from rivet data
 * This is for one-time extraction when first setting up Rivet on a project
 */
export function generateHarvestPrompt(data: RivetFile): string {
  const lines: string[] = []

  lines.push('# Rivet Initial Harvest')
  lines.push('')
  lines.push('Systems have been defined. Now mine the project history for architectural knowledge.')
  lines.push('')
  lines.push('## Sources to Review')
  lines.push('')
  lines.push('Look through these for requirements, decisions, and domain terms:')
  lines.push('')
  lines.push('1. **Recent conversation history** - discussions that led to current architecture')
  lines.push('2. **README and documentation** - stated requirements and design decisions')
  lines.push('3. **Commit messages** - rationale for changes')
  lines.push('4. **Code comments** - inline decisions and constraints')
  lines.push('5. **PR descriptions** - why changes were made')
  lines.push('')
  lines.push('## What to Extract')
  lines.push('')
  lines.push('1. **New domain terms** - words or phrases used consistently with specific meaning')
  lines.push('   - Are they scoped enough? Avoid generic words like "context", "handler", "data"')
  lines.push('   - Consider prefixing with project/system name if needed')
  lines.push('')
  lines.push('2. **Decisions made** - architectural choices with rationale')
  lines.push('   - Capture the WHY, not just the WHAT')
  lines.push('   - Example: "Redis for sessions - need sub-ms latency" not "Uses Redis"')
  lines.push('')
  lines.push('3. **Requirements discovered** - constraints that emerged')
  lines.push('   - Should be atomic and testable')
  lines.push('   - Example: "Must validate JWT on every request"')
  lines.push('')
  lines.push('4. **System boundaries** - clarifications about what\'s in/out of scope')
  lines.push('')
  lines.push('5. **New systems** - cohesive code bundles that deserve their own entry')
  lines.push('')

  // Show existing terms so Claude knows what's already defined
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

  if (existingTerms.length > 0) {
    lines.push('## Already Defined')
    lines.push('')
    lines.push('These terms are already locked (don\'t re-propose):')
    lines.push('')
    lines.push(`\`${existingTerms.join('`, `')}\``)
    lines.push('')
  }

  // Show existing systems
  if (data.systems && Object.keys(data.systems).length > 0) {
    lines.push('## Existing Systems')
    lines.push('')
    for (const [name, system] of Object.entries(data.systems)) {
      lines.push(`- **${name}**: ${system.description}`)
    }
    lines.push('')
  }

  lines.push('## Output Format')
  lines.push('')
  lines.push('**Do not edit .rivet/systems.yaml directly** - use CLI commands.')
  lines.push('')
  lines.push('Batch multiple operations together using `rivet sync`:')
  lines.push('')
  lines.push('```bash')
  lines.push('rivet sync \\')
  lines.push('  --system-require CLI "must parse arguments before routing" \\')
  lines.push('  --system-decide CLI "uses subcommand pattern for extensibility" \\')
  lines.push('  --term-define rivet-prompt "CLI command that outputs AI prompts"')
  lines.push('```')
  lines.push('')
  lines.push('Or run individual commands:')
  lines.push('')
  lines.push('```bash')
  lines.push('rivet project edit +term <name> "<definition>"')
  lines.push('rivet project edit +decision "<rationale>"')
  lines.push('rivet system edit <Name> +requirement "<constraint>"')
  lines.push('rivet system edit <Name> +boundary "<scope clarification>"')
  lines.push('```')
  lines.push('')
  lines.push('## Guidelines')
  lines.push('')
  lines.push('- **Batch related changes** - use `rivet sync` to group operations')
  lines.push('- **Newer sources are more authoritative** than older ones')
  lines.push('- **Ask before running** - propose the commands, let the user approve')
  lines.push('- **Quality over quantity** - only extract things worth locking down')
  lines.push('- **Prefer system-level** for things specific to one system')
  lines.push('- **Prefer project-level** for cross-cutting concerns')
  lines.push('')

  return lines.join('\n')
}
