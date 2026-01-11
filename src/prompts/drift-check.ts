// ABOUTME: Generates drift check prompt for Claude
// ABOUTME: Checks if changes violate defined terms, systems, or boundaries

import type { RivetFile, DeprecatedTerm } from '../schema/types.js'

/**
 * Generate a drift check prompt from rivet data
 * This prompt asks Claude to verify changes against locked definitions
 */
export function generateDriftCheckPrompt(data: RivetFile): string {
  const lines: string[] = []

  lines.push('# Drift Check')
  lines.push('')
  lines.push('Before completing this session, verify that your changes align with the defined architecture.')
  lines.push('')

  // Collect all defined terms for reference
  const allTerms: string[] = []

  if (data.project.terms) {
    allTerms.push(...Object.keys(data.project.terms))
  }

  if (data.systems) {
    for (const system of Object.values(data.systems)) {
      if (system.terms) {
        allTerms.push(...Object.keys(system.terms))
      }
    }
  }

  if (allTerms.length > 0) {
    lines.push('## Defined Terms')
    lines.push('')
    lines.push('These terms are defined. Check that you have used them consistently:')
    lines.push('')
    lines.push(`\`${allTerms.join('`, `')}\``)
    lines.push('')
  }

  // Collect deprecated terms
  const allDeprecated: Array<{ old: string; info: DeprecatedTerm }> = []

  if (data.project['deprecated-terms']) {
    for (const [old, info] of Object.entries(data.project['deprecated-terms'])) {
      allDeprecated.push({ old, info })
    }
  }

  if (data.systems) {
    for (const system of Object.values(data.systems)) {
      if (system['deprecated-terms']) {
        for (const [old, info] of Object.entries(system['deprecated-terms'])) {
          allDeprecated.push({ old, info })
        }
      }
    }
  }

  if (allDeprecated.length > 0) {
    lines.push('## Deprecated Terms')
    lines.push('')
    lines.push('Check that you did NOT use any of these deprecated terms:')
    lines.push('')
    for (const { old, info } of allDeprecated) {
      lines.push(`- ~~${old}~~ → use **${info.use}**`)
    }
    lines.push('')
  }

  // System boundaries
  if (data.systems) {
    const systemsWithBoundaries = Object.entries(data.systems)
      .filter(([_, sys]) => sys.boundaries && sys.boundaries.length > 0)

    if (systemsWithBoundaries.length > 0) {
      lines.push('## System Boundaries')
      lines.push('')
      lines.push('Verify changes respect these boundaries:')
      lines.push('')

      for (const [name, system] of systemsWithBoundaries) {
        lines.push(`**${name}:**`)
        for (const boundary of system.boundaries!) {
          lines.push(`- ${boundary}`)
        }
        lines.push('')
      }
    }
  }

  // Verification checklist
  lines.push('## Verification')
  lines.push('')
  lines.push('1. **Deprecated terms**: Did you accidentally use any deprecated terms? Fix before committing.')
  lines.push('2. **Boundaries**: Did changes respect system boundaries?')
  lines.push('')

  // Session harvest
  lines.push('## Session Harvest')
  lines.push('')
  lines.push('What emerged this session that should be captured?')
  lines.push('')
  lines.push('1. **New terms**: Domain language used consistently with specific meaning')
  lines.push('   - Specific enough? Avoid "context", "data", "handler"')
  lines.push('   - Scoped? Consider "rivet-prompt" not "prompt"')
  lines.push('2. **Decisions made**: Architectural choices with rationale (the WHY)')
  lines.push('3. **Requirements discovered**: Constraints that should be explicit')
  lines.push('4. **Boundary clarifications**: What\'s in/out of scope for a system')
  lines.push('')
  lines.push('If any apply, batch them with `rivet sync`:')
  lines.push('')
  lines.push('```bash')
  lines.push('rivet sync \\')
  lines.push('  --term-define <name> "<definition>" \\')
  lines.push('  --system-decide <system> "<rationale>" \\')
  lines.push('  --system-require <system> "<constraint>"')
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}
