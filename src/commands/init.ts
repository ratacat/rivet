// ABOUTME: rivet init - initialize Rivet in a project
// ABOUTME: Creates .rivet/systems.yaml with project info

import { initRivetFile, rivetFileExists } from '../parser/yaml.js'
import { basename } from 'path'

const USAGE = `
rivet init - Initialize Rivet in a project

Usage:
  rivet init [options]

Options:
  --name <name>      Project name (defaults to directory name)
  --purpose <desc>   Project purpose/description
  --minimal          Create minimal template (no prompts)
  -h, --help         Show this help
`.trim()

export async function runInit(args: string[]): Promise<void> {
  // Parse args
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  // Check if already initialized
  if (rivetFileExists()) {
    throw new Error('.rivet/systems.yaml already exists in this project')
  }

  // Parse options
  let name = basename(process.cwd())
  let purpose = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      name = args[++i]
    } else if (args[i] === '--purpose' && args[i + 1]) {
      purpose = args[++i]
    }
  }

  // Create the file
  const filePath = initRivetFile(name, purpose || `${name} project`)

  console.log(`Created ${filePath}`)
  console.log('')
  console.log('Next steps:')
  console.log('  rivet system add <name> <description>  - Add a system')
  console.log('  rivet context                          - View your config')
}
