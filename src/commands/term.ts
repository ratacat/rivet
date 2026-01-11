// ABOUTME: rivet term <subcommand> - manage project-wide terms
// ABOUTME: Domain language and meaningful code symbols that apply project-wide

import { readRivetFile, writeRivetFile, findRivetFile } from '../parser/yaml.js'
import { execSync } from 'child_process'

const USAGE = `
rivet term - Manage project-wide terms

Subcommands:
  define <term> <definition>                    Add a new term
  deprecate <old> --to <new> --reason "..."     Deprecate a term
  rename <old> <new>                            Rename a term
  delete <term>                                 Remove a term
  list                                          Show all terms

NOTE: System-specific terms are managed via 'rivet system edit +term'
Project terms are domain language or meaningful code symbols.

Examples:
  rivet term define rivet-prompt "CLI command that outputs AI prompts"
  rivet term deprecate rivet-context --to rivet-prompt --reason "Renamed for clarity"
  rivet term rename old_term new_term
  rivet term list
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

export async function runTerm(args: string[]): Promise<void> {
  const subcommand = args[0]

  if (!subcommand || subcommand === '-h' || subcommand === '--help') {
    console.log(USAGE)
    return
  }

  switch (subcommand) {
    case 'define':
      await termDefine(args.slice(1))
      break
    case 'deprecate':
      await termDeprecate(args.slice(1))
      break
    case 'rename':
      await termRename(args.slice(1))
      break
    case 'delete':
      await termDelete(args.slice(1))
      break
    case 'list':
      await termList()
      break
    default:
      throw new Error(`Unknown subcommand: ${subcommand}`)
  }
}

async function termDefine(args: string[]): Promise<void> {
  const term = args[0]
  const definition = args.slice(1).join(' ')

  if (!term || !definition) {
    throw new Error('Usage: rivet term define <term> <definition>')
  }

  const data = readRivetFile()

  if (!data.project.terms) {
    data.project.terms = {}
  }

  if (data.project.terms[term]) {
    throw new Error(`Term "${term}" already exists. Use 'rivet term rename' to change it.`)
  }

  data.project.terms[term] = definition

  writeRivetFile(data)
  gitCommit(`rivet: term define ${term}`)
  console.log(`Defined: ${term}`)
}

async function termDeprecate(args: string[]): Promise<void> {
  // Parse: <old> --to <new> --reason "..."
  const oldTerm = args[0]

  const toIdx = args.indexOf('--to')
  const reasonIdx = args.indexOf('--reason')

  if (!oldTerm || toIdx === -1 || reasonIdx === -1) {
    throw new Error('Usage: rivet term deprecate <old> --to <new> --reason "..."')
  }

  const newTerm = args[toIdx + 1]
  const reason = args.slice(reasonIdx + 1).join(' ')

  if (!newTerm || !reason) {
    throw new Error('Usage: rivet term deprecate <old> --to <new> --reason "..."')
  }

  const data = readRivetFile()

  // Old term must exist in terms
  if (!data.project.terms?.[oldTerm]) {
    throw new Error(`Term "${oldTerm}" not found in project terms`)
  }

  // New term should exist (warn if not)
  if (!data.project.terms[newTerm]) {
    console.log(`Warning: "${newTerm}" is not defined. Consider defining it first.`)
  }

  // Remove from terms
  delete data.project.terms[oldTerm]

  // Add to deprecated-terms
  if (!data.project['deprecated-terms']) {
    data.project['deprecated-terms'] = {}
  }

  data.project['deprecated-terms'][oldTerm] = {
    use: newTerm,
    reason: reason,
  }

  writeRivetFile(data)
  gitCommit(`rivet: term deprecate ${oldTerm} → ${newTerm}`)
  console.log(`Deprecated: ${oldTerm} → ${newTerm}`)
}

async function termRename(args: string[]): Promise<void> {
  const oldName = args[0]
  const newName = args[1]

  if (!oldName || !newName) {
    throw new Error('Usage: rivet term rename <old> <new>')
  }

  const data = readRivetFile()

  if (!data.project.terms?.[oldName]) {
    throw new Error(`Term "${oldName}" not found`)
  }

  if (data.project.terms[newName]) {
    throw new Error(`Term "${newName}" already exists`)
  }

  // Copy the definition to new name
  data.project.terms[newName] = data.project.terms[oldName]

  // Delete old term
  delete data.project.terms[oldName]

  writeRivetFile(data)
  gitCommit(`rivet: term rename ${oldName} → ${newName}`)
  console.log(`Renamed: ${oldName} → ${newName}`)
}

async function termDelete(args: string[]): Promise<void> {
  const term = args[0]

  if (!term) {
    throw new Error('Usage: rivet term delete <term>')
  }

  const data = readRivetFile()

  if (!data.project.terms?.[term]) {
    throw new Error(`Term "${term}" not found`)
  }

  delete data.project.terms[term]

  writeRivetFile(data)
  gitCommit(`rivet: term delete ${term}`)
  console.log(`Deleted: ${term}`)
}

async function termList(): Promise<void> {
  const data = readRivetFile()

  if (!data.project.terms || Object.keys(data.project.terms).length === 0) {
    console.log('No glossary terms defined')
    return
  }

  for (const [term, definition] of Object.entries(data.project.terms)) {
    console.log(`${term}`)
    console.log(`  ${definition}`)
  }
}
