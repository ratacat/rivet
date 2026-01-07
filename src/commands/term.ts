// ABOUTME: rivet term <subcommand> - manage project-wide glossary terms
// ABOUTME: Concepts, jargon, conventions that apply across the entire codebase

import { readRivetFile, writeRivetFile, findRivetFile } from '../parser/yaml.js'
import { execSync } from 'child_process'

const USAGE = `
rivet term - Manage project-wide glossary terms

Subcommands:
  define <term> <definition>   Add a new glossary term
  rename <old> <new>           Rename a term (adds 'previously' field)
  delete <term>                Remove a term from glossary
  list                         Show all glossary terms

NOTE: System-specific terms are managed via 'rivet system edit +term'
Glossary terms are project-wide concepts not tied to any specific system.

Examples:
  rivet term define vibe_coding "AI handles implementation while human guides"
  rivet term rename vibe_coding ai_assisted_development
  rivet term delete old_concept
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

  if (!data.project.glossary) {
    data.project.glossary = {}
  }

  if (data.project.glossary[term]) {
    throw new Error(`Term "${term}" already exists. Use 'rivet term rename' to change it.`)
  }

  data.project.glossary[term] = {
    definition,
  }

  writeRivetFile(data)
  gitCommit(`rivet: term define ${term}`)
  console.log(`Defined: ${term}`)
}

async function termRename(args: string[]): Promise<void> {
  const oldName = args[0]
  const newName = args[1]

  if (!oldName || !newName) {
    throw new Error('Usage: rivet term rename <old> <new>')
  }

  const data = readRivetFile()

  if (!data.project.glossary?.[oldName]) {
    throw new Error(`Term "${oldName}" not found`)
  }

  if (data.project.glossary[newName]) {
    throw new Error(`Term "${newName}" already exists`)
  }

  // Copy the term with new name and add 'previously' field
  const oldTerm = data.project.glossary[oldName]
  data.project.glossary[newName] = {
    ...oldTerm,
    previously: oldName,
  }

  // Delete old term
  delete data.project.glossary[oldName]

  writeRivetFile(data)
  gitCommit(`rivet: term rename ${oldName} → ${newName}`)
  console.log(`Renamed: ${oldName} → ${newName}`)
  console.log(`Note: 'previously' field will be removed by 'rivet check' once old term is purged from codebase`)
}

async function termDelete(args: string[]): Promise<void> {
  const term = args[0]

  if (!term) {
    throw new Error('Usage: rivet term delete <term>')
  }

  const data = readRivetFile()

  if (!data.project.glossary?.[term]) {
    throw new Error(`Term "${term}" not found`)
  }

  delete data.project.glossary[term]

  writeRivetFile(data)
  gitCommit(`rivet: term delete ${term}`)
  console.log(`Deleted: ${term}`)
}

async function termList(): Promise<void> {
  const data = readRivetFile()

  if (!data.project.glossary || Object.keys(data.project.glossary).length === 0) {
    console.log('No glossary terms defined')
    return
  }

  for (const [term, entry] of Object.entries(data.project.glossary)) {
    const prev = entry.previously ? ` (previously: ${entry.previously})` : ''
    console.log(`${term}${prev}`)
    console.log(`  ${entry.definition}`)
  }
}
