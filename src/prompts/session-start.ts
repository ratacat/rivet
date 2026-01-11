// ABOUTME: Generates session start prompt for Claude
// ABOUTME: Outputs locked terms, systems, and behavioral instructions

import type { RivetFile, DeprecatedTerm } from '../schema/types.js'

/**
 * Generate the session start prompt from rivet data
 * This prompt tells Claude about the project's locked language and systems
 */
export function generateSessionStartPrompt(data: RivetFile): string {
  const lines: string[] = []

  lines.push('# Rivet Context')
  lines.push('')
  lines.push(`**Project:** ${data.project.name}`)
  lines.push(`**Purpose:** ${data.project.purpose}`)
  lines.push('')

  // Project-level terms
  if (data.project.terms && Object.keys(data.project.terms).length > 0) {
    lines.push('## Project Terms')
    lines.push('')
    lines.push('These terms are **defined** for this project. Use them consistently:')
    lines.push('')
    for (const [term, definition] of Object.entries(data.project.terms)) {
      lines.push(`- **${term}**: ${definition}`)
    }
    lines.push('')
  }

  // Collect all deprecated terms (project + systems)
  const allDeprecated: Array<{ old: string; info: DeprecatedTerm; scope?: string }> = []

  if (data.project['deprecated-terms']) {
    for (const [old, info] of Object.entries(data.project['deprecated-terms'])) {
      allDeprecated.push({ old, info })
    }
  }

  if (data.systems) {
    for (const [sysName, system] of Object.entries(data.systems)) {
      if (system['deprecated-terms']) {
        for (const [old, info] of Object.entries(system['deprecated-terms'])) {
          allDeprecated.push({ old, info, scope: sysName })
        }
      }
    }
  }

  if (allDeprecated.length > 0) {
    lines.push('## Deprecated Terms')
    lines.push('')
    lines.push('These terms have been replaced. **Do not use them**:')
    lines.push('')
    for (const { old, info, scope } of allDeprecated) {
      const scopeStr = scope ? ` (${scope})` : ''
      lines.push(`- ~~${old}~~${scopeStr} → use **${info.use}**`)
      lines.push(`  - ${info.reason}`)
    }
    lines.push('')
  }

  // Project-level decisions
  if (data.project.decisions && data.project.decisions.length > 0) {
    lines.push('## Project Decisions')
    lines.push('')
    lines.push('These architectural decisions apply project-wide:')
    lines.push('')
    for (const decision of data.project.decisions) {
      lines.push(`- ${decision}`)
    }
    lines.push('')
  }

  // Project-level requirements
  if (data.project.requirements && data.project.requirements.length > 0) {
    lines.push('## Project Requirements')
    lines.push('')
    for (const req of data.project.requirements) {
      lines.push(`- ${req}`)
    }
    lines.push('')
  }

  // Systems
  if (data.systems && Object.keys(data.systems).length > 0) {
    lines.push('## Systems')
    lines.push('')

    for (const [name, system] of Object.entries(data.systems)) {
      if (system.status === 'deprecated') continue // Skip deprecated systems

      lines.push(`### ${name}`)
      lines.push('')
      lines.push(system.description)
      lines.push('')

      // System terms
      if (system.terms && Object.keys(system.terms).length > 0) {
        lines.push('**Terms:**')
        for (const [term, def] of Object.entries(system.terms)) {
          if (def) {
            lines.push(`- **${term}**: ${def}`)
          } else {
            lines.push(`- **${term}**`)
          }
        }
        lines.push('')
      }

      // System boundaries
      if (system.boundaries && system.boundaries.length > 0) {
        lines.push('**Boundaries:**')
        for (const boundary of system.boundaries) {
          lines.push(`- ${boundary}`)
        }
        lines.push('')
      }
    }
  }

  // Behavioral instructions
  lines.push('## Instructions')
  lines.push('')
  lines.push('- Use the defined terms consistently throughout this session')
  lines.push('- Respect system boundaries when making changes')
  lines.push('- If you notice new domain terms emerging, note them for potential capture')
  lines.push('- Before ending the session, consider if any new terms or decisions should be defined')
  lines.push('')

  return lines.join('\n')
}
