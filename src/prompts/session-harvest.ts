// ABOUTME: Generates session-harvest prompt for Claude
// ABOUTME: Per-session maintenance capturing terms, decisions, requirements, and system changes

import type { RivetFile, DeprecatedTerm } from '../schema/types.js'

/**
 * Collect all defined terms from project and systems
 */
function collectAllTerms(data: RivetFile): string[] {
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

  return allTerms
}

/**
 * Collect all deprecated terms from project and systems
 */
function collectDeprecatedTerms(data: RivetFile): Array<{ old: string; info: DeprecatedTerm }> {
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

  return allDeprecated
}

/**
 * Format defined terms section
 */
function formatDefinedTerms(terms: string[]): string {
  if (terms.length === 0) return ''

  return `
## Defined Terms

These terms are defined. Check that you used them consistently:

\`${terms.join('`, `')}\`

Also watch for symbols or words that are similar to these terms - if something seems like it might be an accidental variation or collision, surface it to the user.
`
}

/**
 * Format deprecated terms section
 */
function formatDeprecatedTerms(deprecated: Array<{ old: string; info: DeprecatedTerm }>): string {
  if (deprecated.length === 0) return ''

  const termList = deprecated
    .map(({ old, info }) => `- ~~${old}~~ → use **${info.use}**`)
    .join('\n')

  return `
## Deprecated Terms

Check that you did NOT use any of these deprecated terms:

${termList}
`
}

/**
 * Format system boundaries section
 */
function formatSystemBoundaries(data: RivetFile): string {
  if (!data.systems) return ''

  const systemsWithBoundaries = Object.entries(data.systems)
    .filter(([_, sys]) => sys.boundaries && sys.boundaries.length > 0)

  if (systemsWithBoundaries.length === 0) return ''

  const boundariesMarkdown = systemsWithBoundaries
    .map(([name, system]) => {
      const boundaryList = system.boundaries!.map(b => `- ${b}`).join('\n')
      return `**${name}:**\n${boundaryList}`
    })
    .join('\n\n')

  return `
## System Boundaries

Verify changes respect these boundaries:

${boundariesMarkdown}
`
}

/**
 * Generate a session-harvest prompt from rivet data
 * Per-session maintenance that captures emerging terms, decisions, requirements, and system changes
 */
export function generateSessionHarvestPrompt(data: RivetFile): string {
  const allTerms = collectAllTerms(data)
  const deprecatedTerms = collectDeprecatedTerms(data)

  const termsSection = formatDefinedTerms(allTerms)
  const deprecatedSection = formatDeprecatedTerms(deprecatedTerms)
  const boundariesSection = formatSystemBoundaries(data)

  return `
# Session Harvest

Before completing this session, capture what emerged and verify alignment with the defined architecture.
${termsSection}${deprecatedSection}${boundariesSection}
## Verification

1. **Deprecated terms**: Did you accidentally use any deprecated terms? Fix before committing.
2. **Boundaries**: Did changes respect system boundaries?

## What Emerged

What emerged this session that should be captured?

1. **New, changed, or deprecated terms**: Domain language used consistently with specific meaning
   - Specific enough? Avoid "context", "data", "handler"
   - Scoped? Consider "rivet-prompt" not "prompt"
2. **Decisions made**: Architectural choices with rationale (the WHY)
3. **Requirements discovered**: Constraints that should be explicit
4. **Boundary clarifications**: What's in/out of scope for a system

### Certainty levels

**High certainty** - make the change automatically via CLI and report it:
\`\`\`
rivet project edit +term <name> "<definition>"
\`\`\`
Then note: "Rivet: added term <name>"

**Lower certainty** - prompt the user for clarification before making changes.

Always report rivet changes made in a single line at the end of your response.
`.trim()
}
