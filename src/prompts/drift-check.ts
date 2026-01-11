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

  // Questions to answer
  lines.push('## Checklist')
  lines.push('')
  lines.push('Review your changes and answer:')
  lines.push('')
  lines.push('1. **Terminology**: Did you introduce any new domain terms? If so, should they be defined?')
  lines.push('   - Are proposed terms **specific enough**? Avoid generic words like "context", "data", "handler"')
  lines.push('   - Consider prefixing with project/system name if the term could collide (e.g., "rivet-prompt" not "prompt")')
  lines.push('2. **Deprecated terms**: Did you accidentally use any deprecated terms? Check and replace.')
  lines.push('3. **Boundaries**: Did any changes cross system boundaries that should be noted?')
  lines.push('4. **Decisions**: Did you make architectural decisions that should be recorded?')
  lines.push('5. **Requirements**: Did you discover implicit requirements that should be explicit?')
  lines.push('')
  lines.push('If any of the above apply, use the `rivet` CLI to update the project:')
  lines.push('')
  lines.push('```bash')
  lines.push('rivet project edit +term <name> "<definition>"')
  lines.push('rivet project edit +decision "<rationale>"')
  lines.push('rivet system edit <system> +term <name> "<definition>"')
  lines.push('rivet system edit <system> +decision "<rationale>"')
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}
