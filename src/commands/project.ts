// ABOUTME: rivet project <subcommand> - manage project-level config
// ABOUTME: Edit project name, purpose, principles, terms, decisions, requirements

import { readRivetFile, writeRivetFile, findRivetFile } from '../parser/yaml.js'
import { execSync } from 'child_process'
import { stringify } from 'yaml'

const USAGE = `
rivet project - Manage project-level configuration

Subcommands:
  show                              Show project details
  edit <field> [+|-]<value>         Edit a project field

Edit fields:
  name <text>              Replace project name
  purpose <text>           Replace project purpose
  +principle <text>        Add a guiding principle
  -principle <text>        Remove a principle
  +term <name> <def>       Add a project-wide term
  -term <name>             Remove a term
  +decision <text>         Add a project-level decision
  -decision <text>         Remove a decision
  +requirement <text>      Add a project-level requirement
  -requirement <text>      Remove a requirement

Examples:
  rivet project show
  rivet project edit name "My Project"
  rivet project edit +principle "Simplicity over cleverness"
  rivet project edit +term workspace "A collection of projects"
  rivet project edit +decision "Monorepo - shared tooling across packages"
  rivet project edit +requirement "All APIs must respond within 200ms p99"
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

export async function runProject(args: string[]): Promise<void> {
  const subcommand = args[0]

  if (!subcommand || subcommand === '-h' || subcommand === '--help') {
    console.log(USAGE)
    return
  }

  switch (subcommand) {
    case 'show':
      await projectShow()
      break
    case 'edit':
      await projectEdit(args.slice(1))
      break
    default:
      throw new Error(`Unknown subcommand: ${subcommand}`)
  }
}

async function projectShow(): Promise<void> {
  const data = readRivetFile()
  console.log('project:')
  console.log(stringify(data.project, { lineWidth: 0 }).trim())
}

async function projectEdit(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.log('Editable fields:')
    console.log('  name <text>              - Replace project name')
    console.log('  purpose <text>           - Replace project purpose')
    console.log('  +principle <text>        - Add guiding principle')
    console.log('  -principle <text>        - Remove principle')
    console.log('  +term <name> <def>       - Add project-wide term')
    console.log('  -term <name>             - Remove term')
    console.log('  +decision <text>         - Add project-level decision')
    console.log('  -decision <text>         - Remove decision')
    console.log('  +requirement <text>      - Add project-level requirement')
    console.log('  -requirement <text>      - Remove requirement')
    return
  }

  const data = readRivetFile()
  const project = data.project
  const field = args[0]
  const value = args.slice(1).join(' ')

  if (field === 'name') {
    project.name = value
  } else if (field === 'purpose') {
    project.purpose = value
  } else if (field === '+principle') {
    project.principles = project.principles ?? []
    project.principles.push(value)
  } else if (field === '-principle') {
    project.principles = project.principles?.filter(p => p !== value)
  } else if (field === '+term') {
    const termName = args[1]
    const termDef = args.slice(2).join(' ')
    if (!termName || !termDef) {
      throw new Error('Usage: rivet project edit +term <name> <definition>')
    }
    project.terms = project.terms ?? {}
    project.terms[termName] = termDef
  } else if (field === '-term') {
    const termName = args[1]
    if (project.terms) {
      delete project.terms[termName]
    }
  } else if (field === '+decision') {
    project.decisions = project.decisions ?? []
    project.decisions.push(value)
  } else if (field === '-decision') {
    project.decisions = project.decisions?.filter(d => d !== value)
  } else if (field === '+requirement') {
    project.requirements = project.requirements ?? []
    project.requirements.push(value)
  } else if (field === '-requirement') {
    project.requirements = project.requirements?.filter(r => r !== value)
  } else {
    throw new Error(`Unknown field: ${field}`)
  }

  writeRivetFile(data)
  gitCommit(`rivet: project edit ${field}`)
  console.log('Updated project')
}
