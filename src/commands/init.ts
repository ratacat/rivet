// ABOUTME: rivet init - initialize Rivet in a project
// ABOUTME: Creates skeleton file if missing, outputs init prompt for setup

import { initRivetFile, rivetFileExists, readRivetFile } from '../parser/yaml.js'
import { generateInitPrompt, generateSessionStartPrompt } from '../prompts/index.js'
import { basename } from 'path'

const USAGE = `
rivet init - Initialize Rivet in a project

Usage:
  rivet init [options]

Behavior:
  - If .rivet/systems.yaml exists with systems defined: output session context
  - If .rivet/systems.yaml exists but empty: output init prompt
  - If no file: create skeleton file, then output init prompt

Options:
  -h, --help         Show this help
`.trim()

/**
 * Check if rivet file has meaningful content (systems defined)
 */
function hasSystemsDefined(): boolean {
  try {
    const data = readRivetFile()
    return !!(data.systems && Object.keys(data.systems).length > 0)
  } catch {
    return false
  }
}

export async function runInit(args: string[]): Promise<void> {
  // Parse args
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  if (rivetFileExists()) {
    // File exists - check if it has systems defined
    if (hasSystemsDefined()) {
      // Has systems - output session context
      const data = readRivetFile()
      console.log(generateSessionStartPrompt(data))
    } else {
      // Empty/skeleton - output init prompt to fill it out
      console.log(generateInitPrompt())
    }
    return
  }

  // No file exists - create skeleton and output init prompt
  const projectName = basename(process.cwd())
  initRivetFile(projectName, '')

  console.log(generateInitPrompt())
}
