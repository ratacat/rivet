// ABOUTME: rivet init - initialize Rivet in a project
// ABOUTME: Outputs init prompt if no file, creates file when --name provided

import { initRivetFile, rivetFileExists } from '../parser/yaml.js'
import { generateInitPrompt } from '../prompts/index.js'
import { basename } from 'path'

const USAGE = `
rivet init - Initialize Rivet in a project

Usage:
  rivet init [options]

Behavior:
  - If .rivet/systems.yaml exists: silent exit
  - If no file and no --name: output init prompt to guide setup
  - If no file and --name provided: create the file

Options:
  --name <name>      Project name (required to create file)
  --purpose <desc>   Project purpose/description
  -h, --help         Show this help
`.trim()

export async function runInit(args: string[]): Promise<void> {
  // Parse args
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  // If already initialized, silent exit
  if (rivetFileExists()) {
    return
  }

  // Parse options
  let name: string | null = null
  let purpose = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) {
      name = args[++i]
    } else if (args[i] === '--purpose' && args[i + 1]) {
      purpose = args[++i]
    }
  }

  // If no --name provided, output the init prompt
  if (!name) {
    console.log(generateInitPrompt())
    return
  }

  // Create the file
  const filePath = initRivetFile(name, purpose || `${name} project`)

  console.log(`Created ${filePath}`)
  console.log('')
  console.log('Next steps:')
  console.log('  rivet system add <name> <description>  - Add a system')
  console.log('  rivet prompt session-start             - View context prompt')
  console.log('')
  console.log('Optional: Add drift-check to your pre-commit hook:')
  console.log('  rivet prompt drift-check')
}
