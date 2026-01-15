// ABOUTME: rivet system <subcommand> - manage systems
// ABOUTME: Add, show, edit, list, link, deprecate systems

import { readRivetFile, writeRivetFile, findRivetFile } from '../parser/yaml.js'
import { execSync } from 'child_process'
import { stringify } from 'yaml'
import type { System, SystemStatus, RelationType, Relationship } from '../schema/types.js'

const USAGE = `
rivet system - Manage systems

Subcommands:
  add <name> <description>              Add a new system
  show <name>                           Show details of one system
  list [--status <status>]              List all systems
  edit <system> <field> [+|-]<value>    Edit a system field
  link <system> <type> <target>         Add relationship tuple
  deprecate <system> [--replaced-by <new>]      Mark deprecated

Edit fields:
  description    string (replace)
  +requirement   add to requirements list
  -requirement   remove from requirements list
  +decision      add to decisions list
  +term <name> [context]  add locked term with optional context
  -term <name>   remove term
  status         set status (active, deprecated, replacing:<system>)
  +relationship <type> <target>  add relationship tuple
  -relationship <type> <target>  remove relationship tuple

Relationship types: calls, called_by, depends_on, used_by

Examples:
  rivet system add Router "handles URL routing"
  rivet system edit Router +requirement "must support nested routes"
  rivet system edit Router +term createRouter "factory function"
  rivet system link Router calls Commands
  rivet system deprecate OldRouter --replaced-by Router
`.trim()

function gitCommit(message: string): void {
  const filePath = findRivetFile()
  try {
    execSync(`git add "${filePath}" && git commit -m "${message}"`, {
      stdio: 'pipe',
    })
  } catch {
    // Not a git repo or commit failed - that's ok
  }
}

export async function runSystem(args: string[]): Promise<void> {
  const subcommand = args[0]

  if (!subcommand || subcommand === '-h' || subcommand === '--help') {
    console.log(USAGE)
    return
  }

  switch (subcommand) {
    case 'add':
      await systemAdd(args.slice(1))
      break
    case 'show':
      await systemShow(args.slice(1))
      break
    case 'list':
      await systemList(args.slice(1))
      break
    case 'edit':
      await systemEdit(args.slice(1))
      break
    case 'link':
      await systemLink(args.slice(1))
      break
    case 'deprecate':
      await systemDeprecate(args.slice(1))
      break
    default:
      throw new Error(`Unknown subcommand: ${subcommand}`)
  }
}

async function systemAdd(args: string[]): Promise<void> {
  const name = args[0]
  const description = args[1]

  if (!name || !description) {
    throw new Error('Usage: rivet system add <name> <description>')
  }

  const data = readRivetFile()

  if (!data.systems) {
    data.systems = {}
  }

  if (data.systems[name]) {
    throw new Error(`System "${name}" already exists`)
  }

  data.systems[name] = {
    description,
  }

  writeRivetFile(data)
  gitCommit(`rivet: system add ${name}`)
  console.log(`Added system: ${name}`)
}

async function systemShow(args: string[]): Promise<void> {
  const name = args[0]

  if (!name) {
    throw new Error('Usage: rivet system show <name>')
  }

  const data = readRivetFile()
  const system = data.systems?.[name]

  if (!system) {
    throw new Error(`System "${name}" not found`)
  }

  console.log(`${name}:`)
  console.log(stringify(system, { lineWidth: 0 }).trim())
}

async function systemList(args: string[]): Promise<void> {
  const data = readRivetFile()

  // Parse --status filter
  let statusFilter: string | undefined
  const statusIdx = args.indexOf('--status')
  if (statusIdx !== -1 && args[statusIdx + 1]) {
    statusFilter = args[statusIdx + 1]
  }

  if (!data.systems || Object.keys(data.systems).length === 0) {
    console.log('No systems defined')
    return
  }

  for (const [name, system] of Object.entries(data.systems)) {
    const status = system.status ?? 'active'

    if (statusFilter && status !== statusFilter) {
      continue
    }

    const statusStr = status === 'active' ? '' : ` [${status}]`
    console.log(`${name}${statusStr}`)
    console.log(`  ${system.description}`)
  }
}

async function systemEdit(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.log('Editable fields:')
    console.log('  description <text>        - Replace description')
    console.log('  +requirement <text>       - Add requirement')
    console.log('  -requirement <text>       - Remove requirement')
    console.log('  +decision <text>          - Add decision')
    console.log('  -decision <text>          - Remove decision')
    console.log('  +term <name> [context]    - Add locked term')
    console.log('  -term <name>              - Remove term')
    console.log('  term-deprecate <old> --to <new> --reason "..."  - Deprecate a term')
    console.log('  status <value>            - Set status')
    console.log('  +relationship <type> <target>  - Add relationship tuple')
    console.log('  -relationship <type> <target>  - Remove relationship tuple')
    console.log('  +boundary <text>          - Add boundary')
    console.log('  -boundary <text>          - Remove boundary')
    return
  }

  const systemName = args[0]
  const data = readRivetFile()

  if (!data.systems?.[systemName]) {
    throw new Error(`System "${systemName}" not found`)
  }

  if (args.length === 1) {
    // Just show the system
    console.log(stringify(data.systems[systemName], { lineWidth: 0 }))
    return
  }

  const system = data.systems[systemName]
  const field = args[1]
  const value = args.slice(2).join(' ')

  // Handle different field types
  if (field === 'description') {
    system.description = value
  } else if (field === '+requirement') {
    system.requirements = system.requirements ?? []
    system.requirements.push(value)
  } else if (field === '-requirement') {
    system.requirements = system.requirements?.filter(r => r !== value)
  } else if (field === '+decision') {
    system.decisions = system.decisions ?? []
    system.decisions.push(value)
  } else if (field === '-decision') {
    system.decisions = system.decisions?.filter(d => d !== value)
  } else if (field === '+term') {
    const termName = args[2]
    const termContext = args.slice(3).join(' ') || null
    system.terms = system.terms ?? {}
    system.terms[termName] = termContext
  } else if (field === '-term') {
    const termName = args[2]
    if (system.terms) {
      delete system.terms[termName]
    }
  } else if (field === 'term-deprecate') {
    // Parse: term-deprecate <old> --to <new> --reason "..."
    const oldTerm = args[2]
    const restArgs = args.slice(3)
    const toIdx = restArgs.indexOf('--to')
    const reasonIdx = restArgs.indexOf('--reason')

    if (!oldTerm || toIdx === -1 || reasonIdx === -1) {
      throw new Error('Usage: rivet system edit <system> term-deprecate <old> --to <new> --reason "..."')
    }

    const newTerm = restArgs[toIdx + 1]
    const reason = restArgs.slice(reasonIdx + 1).join(' ')

    if (!newTerm || !reason) {
      throw new Error('Usage: rivet system edit <system> term-deprecate <old> --to <new> --reason "..."')
    }

    // Old term must exist
    if (!system.terms?.[oldTerm]) {
      throw new Error(`Term "${oldTerm}" not found in system "${systemName}"`)
    }

    // Remove from terms
    delete system.terms[oldTerm]

    // Add to deprecated-terms
    if (!system['deprecated-terms']) {
      system['deprecated-terms'] = {}
    }

    system['deprecated-terms'][oldTerm] = {
      use: newTerm,
      reason: reason,
    }
  } else if (field === 'status') {
    system.status = value as SystemStatus
  } else if (field === '+relationship') {
    const relType = args[2] as RelationType
    const target = args[3]
    if (!relType || !target) {
      throw new Error('Usage: rivet system edit <system> +relationship <type> <target>')
    }
    const validTypes: RelationType[] = ['calls', 'called_by', 'depends_on', 'used_by']
    if (!validTypes.includes(relType)) {
      throw new Error(`Invalid relationship type: ${relType}. Valid types: ${validTypes.join(', ')}`)
    }
    system.relationships = system.relationships ?? []
    const exists = system.relationships.some(([t, s]) => t === relType && s === target)
    if (!exists) {
      system.relationships.push([relType, target])
    }
  } else if (field === '-relationship') {
    const relType = args[2] as RelationType
    const target = args[3]
    if (!relType || !target) {
      throw new Error('Usage: rivet system edit <system> -relationship <type> <target>')
    }
    system.relationships = system.relationships?.filter(([t, s]) => !(t === relType && s === target))
  } else if (field === '+boundary') {
    system.boundaries = system.boundaries ?? []
    system.boundaries.push(value)
  } else if (field === '-boundary') {
    system.boundaries = system.boundaries?.filter((b: string) => b !== value)
  } else {
    throw new Error(`Unknown field: ${field}`)
  }

  writeRivetFile(data)
  gitCommit(`rivet: system edit ${systemName} ${field}`)
  console.log(`Updated ${systemName}`)
}

async function systemLink(args: string[]): Promise<void> {
  const systemName = args[0]
  const relType = args[1] as RelationType
  const target = args[2]

  if (!systemName || !relType || !target) {
    throw new Error('Usage: rivet system link <system> <type> <target>\nTypes: calls, called_by, depends_on, used_by')
  }

  const validTypes: RelationType[] = ['calls', 'called_by', 'depends_on', 'used_by']
  if (!validTypes.includes(relType)) {
    throw new Error(`Invalid relationship type: ${relType}. Valid types: ${validTypes.join(', ')}`)
  }

  const data = readRivetFile()

  if (!data.systems?.[systemName]) {
    throw new Error(`System "${systemName}" not found`)
  }

  const system = data.systems[systemName]
  system.relationships = system.relationships ?? []

  const exists = system.relationships.some(([t, s]) => t === relType && s === target)
  if (!exists) {
    system.relationships.push([relType, target])
  }

  writeRivetFile(data)
  gitCommit(`rivet: system link ${systemName} ${relType} ${target}`)
  console.log(`Added relationship: ${systemName} ${relType} ${target}`)
}

async function systemDeprecate(args: string[]): Promise<void> {
  const systemName = args[0]

  if (!systemName) {
    throw new Error('Usage: rivet system deprecate <system> [--replaced-by <new>]')
  }

  const data = readRivetFile()

  if (!data.systems?.[systemName]) {
    throw new Error(`System "${systemName}" not found`)
  }

  const system = data.systems[systemName]

  // Check for --replaced-by
  const replacedByIdx = args.indexOf('--replaced-by')
  if (replacedByIdx !== -1 && args[replacedByIdx + 1]) {
    const replacement = args[replacedByIdx + 1]
    system.status = `replacing:${replacement}`
    system.replaces = undefined // Clear any old replaces field
  } else {
    system.status = 'deprecated'
  }

  writeRivetFile(data)
  gitCommit(`rivet: system deprecate ${systemName}`)
  console.log(`Deprecated ${systemName}`)
}
