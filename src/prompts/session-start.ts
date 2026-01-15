// ABOUTME: Generates session start prompt for Claude
// ABOUTME: Outputs locked terms, systems, and behavioral instructions

import type { RivetFile, DeprecatedTerm, System, Relationship } from '../schema/types.js'

/**
 * Format project terms as markdown list
 */
function formatProjectTerms(terms: Record<string, string>): string {
  const entries = Object.entries(terms)
  if (entries.length === 0) return ''

  const termList = entries
    .map(([term, definition]) => `- **${term}**: ${definition}`)
    .join('\n')

  return `
## Project Terms

These terms are **defined** for this project. Use them consistently:

${termList}
`
}

/**
 * Collect all deprecated terms from project and systems
 */
function collectDeprecatedTerms(data: RivetFile): Array<{ old: string; info: DeprecatedTerm; scope?: string }> {
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

  return allDeprecated
}

/**
 * Format deprecated terms as markdown
 */
function formatDeprecatedTerms(deprecated: Array<{ old: string; info: DeprecatedTerm; scope?: string }>): string {
  if (deprecated.length === 0) return ''

  const termList = deprecated
    .map(({ old, info, scope }) => {
      const scopeStr = scope ? ` (${scope})` : ''
      return `- ~~${old}~~${scopeStr} → use **${info.use}**\n  - ${info.reason}`
    })
    .join('\n')

  return `
## Deprecated Terms

These terms have been replaced. **Do not use them**:

${termList}
`
}

/**
 * Format project decisions as markdown
 */
function formatProjectDecisions(decisions: string[]): string {
  if (decisions.length === 0) return ''

  const decisionList = decisions.map(d => `- ${d}`).join('\n')

  return `
## Project Decisions

These architectural decisions apply project-wide:

${decisionList}
`
}

/**
 * Format project requirements as markdown
 */
function formatProjectRequirements(requirements: string[]): string {
  if (requirements.length === 0) return ''

  const reqList = requirements.map(r => `- ${r}`).join('\n')

  return `
## Project Requirements

${reqList}
`
}

/**
 * Format a single system's relationships
 */
function formatRelationships(relationships: Relationship[]): string {
  if (relationships.length === 0) return ''

  const relList = relationships
    .map(([type, target]) => `- ${type} → ${target}`)
    .join('\n')

  return `**Relationships:**
${relList}
`
}

/**
 * Format a single system as markdown
 */
function formatSystem(name: string, system: System): string {
  const parts: string[] = []

  parts.push(`### ${name}`)
  parts.push('')
  parts.push(system.description)
  parts.push('')

  // System terms
  if (system.terms && Object.keys(system.terms).length > 0) {
    const termList = Object.entries(system.terms)
      .map(([term, def]) => def ? `- **${term}**: ${def}` : `- **${term}**`)
      .join('\n')
    parts.push(`**Terms:**\n${termList}`)
    parts.push('')
  }

  // System boundaries
  if (system.boundaries && system.boundaries.length > 0) {
    const boundaryList = system.boundaries.map(b => `- ${b}`).join('\n')
    parts.push(`**Boundaries:**\n${boundaryList}`)
    parts.push('')
  }

  // System relationships
  if (system.relationships && system.relationships.length > 0) {
    parts.push(formatRelationships(system.relationships))
  }

  return parts.join('\n')
}

/**
 * Format all systems as markdown
 */
function formatSystems(systems: Record<string, System>): string {
  const activeSystems = Object.entries(systems)
    .filter(([_, sys]) => sys.status !== 'deprecated')

  if (activeSystems.length === 0) return ''

  const systemsMarkdown = activeSystems
    .map(([name, system]) => formatSystem(name, system))
    .join('\n')

  return `
## Systems

${systemsMarkdown}
`
}

/**
 * Generate the session start prompt from rivet data
 * This prompt tells Claude about the project's locked language and systems
 */
export function generateSessionStartPrompt(data: RivetFile): string {
  const deprecatedTerms = collectDeprecatedTerms(data)

  const projectTermsSection = data.project.terms && Object.keys(data.project.terms).length > 0
    ? formatProjectTerms(data.project.terms)
    : ''

  const deprecatedSection = formatDeprecatedTerms(deprecatedTerms)

  const decisionsSection = data.project.decisions && data.project.decisions.length > 0
    ? formatProjectDecisions(data.project.decisions)
    : ''

  const requirementsSection = data.project.requirements && data.project.requirements.length > 0
    ? formatProjectRequirements(data.project.requirements)
    : ''

  const systemsSection = data.systems && Object.keys(data.systems).length > 0
    ? formatSystems(data.systems)
    : ''

  return `
# Rivet Context

**Project:** ${data.project.name}
**Purpose:** ${data.project.purpose}
${projectTermsSection}${deprecatedSection}${decisionsSection}${requirementsSection}${systemsSection}
## Instructions

- Use the defined terms consistently throughout this session
- Respect system boundaries when making changes
- If you notice new domain terms emerging, note them for potential capture
- Before ending the session, consider if any new terms or decisions should be defined
- If the user seems confused about terminology or uses a similar but incorrect term, infer what they mean and gently reinforce the correct term in your response. If particularly unclear, ask: "Did you mean [System], which [description] and [relationships]?"
`.trim()
}
