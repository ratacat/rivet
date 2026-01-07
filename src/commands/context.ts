// ABOUTME: rivet context [system...] - output context for AI consumption
// ABOUTME: Dumps project info, systems, requirements, relationships

import { readRivetFile } from '../parser/yaml.js'
import { stringify } from 'yaml'
import type { System, RivetFile } from '../schema/types.js'

const USAGE = `
rivet context - Output context for AI consumption

Usage:
  rivet context [system...]

Examples:
  rivet context              # all systems
  rivet context Router       # just Router
  rivet context Router Config # multiple systems

Options:
  -h, --help                 Show this help
`.trim()

export async function runContext(args: string[]): Promise<void> {
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  const data = readRivetFile()
  const systemNames = args.filter(a => !a.startsWith('-'))

  // If specific systems requested, filter to just those
  let output: RivetFile

  if (systemNames.length > 0) {
    const filteredSystems: Record<string, System> = {}

    for (const name of systemNames) {
      if (data.systems?.[name]) {
        filteredSystems[name] = data.systems[name]
      } else {
        console.error(`Warning: System "${name}" not found`)
      }
    }

    output = {
      project: data.project,
      systems: filteredSystems,
    }
  } else {
    output = data
  }

  // Output as YAML for easy AI consumption
  console.log(stringify(output, { lineWidth: 0 }))
}
