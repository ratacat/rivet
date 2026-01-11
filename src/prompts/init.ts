// ABOUTME: Generates init prompt for Claude
// ABOUTME: Helps Claude discover and propose systems for a new project

import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Generate the init prompt for discovering project systems
 * This prompt guides Claude to analyze the codebase and propose a systems structure
 */
export function generateInitPrompt(): string {
  const lines: string[] = []

  lines.push('# Rivet Initialization')
  lines.push('')
  lines.push('This project needs a `.rivet/systems.yaml` file to define its architecture.')
  lines.push('')
  lines.push('## Your Task')
  lines.push('')
  lines.push('Analyze this codebase and propose a systems structure. Look for:')
  lines.push('')
  lines.push('1. **Package boundaries** - `package.json`, `Cargo.toml`, `go.mod`, etc.')
  lines.push('2. **Major directories** - `src/`, `lib/`, `pkg/`, `internal/`, etc.')
  lines.push('3. **Architectural layers** - API, services, data, utilities')
  lines.push('4. **Domain concepts** - what problem domain does this solve?')
  lines.push('')
  lines.push('## Discovering Relationships')
  lines.push('')
  lines.push('If TLDR is available, use it to discover call relationships between systems:')
  lines.push('')
  lines.push('```bash')
  lines.push('tldr calls .    # Shows cross-file call graph')
  lines.push('```')
  lines.push('')
  lines.push('Translate discovered relationships into `.rivet/relationships.yaml`:')
  lines.push('')
  lines.push('```yaml')
  lines.push('# Format: [FromSystem, relationship-type, ToSystem]')
  lines.push('relationships:')
  lines.push('  - [CLI, delegates-to, Parser]')
  lines.push('  - [Parser, uses, Schema]')
  lines.push('  - [API, calls, Database]')
  lines.push('```')
  lines.push('')
  lines.push('Common relationship types: `calls`, `delegates-to`, `depends-on`, `uses`, `wraps`, `validates-with`')
  lines.push('')
  lines.push('## Output')
  lines.push('')
  lines.push('After analyzing, run:')
  lines.push('')
  lines.push('```bash')
  lines.push('rivet init --name "<project>" --purpose "<one sentence>"')
  lines.push('```')
  lines.push('')
  lines.push('Then add systems:')
  lines.push('')
  lines.push('```bash')
  lines.push('rivet system add <Name> "<description>"')
  lines.push('rivet system edit <Name> +term <term> "<definition>"')
  lines.push('rivet system edit <Name> +boundary "<what\'s in/out of scope>"')
  lines.push('```')
  lines.push('')
  lines.push('## Template Reference')
  lines.push('')
  lines.push('Here is the full template with guidelines for each field:')
  lines.push('')
  lines.push('```yaml')

  // Read and include the template
  const templatePath = join(import.meta.dirname, '../templates/systems.yaml')
  const template = readFileSync(templatePath, 'utf-8')
  lines.push(template.trim())

  lines.push('```')
  lines.push('')

  return lines.join('\n')
}
