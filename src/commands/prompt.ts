// ABOUTME: rivet prompt <type> - output prompts for AI consumption
// ABOUTME: Generates context-aware prompts from systems.yaml data

import { readRivetFile, rivetFileExists } from '../parser/yaml.js'
import {
  generateInitPrompt,
  generateSessionStartPrompt,
  generateSessionHarvestPrompt,
  generateDeepHarvestPrompt,
} from '../prompts/index.js'

const USAGE = `
rivet prompt - Output prompts for AI consumption

Usage:
  rivet prompt <type>

Types:
  session-start      Context prompt for session start (default)
  session-harvest    Per-session maintenance before commit
  deep-harvest       One-time mining of old transcripts
  init               Setup prompt when no systems.yaml exists

Examples:
  rivet prompt                  # defaults to session-start
  rivet prompt session-start    # explicit session start
  rivet prompt session-harvest  # per-session maintenance
  rivet prompt deep-harvest     # mine old transcripts
`.trim()

export async function runPrompt(args: string[]): Promise<void> {
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  const promptType = args[0] || 'session-start'

  // Handle init prompt separately - doesn't need systems.yaml
  if (promptType === 'init') {
    if (rivetFileExists()) {
      // File exists, nothing to output
      return
    }
    console.log(generateInitPrompt())
    return
  }

  // All other prompts require systems.yaml
  if (!rivetFileExists()) {
    console.log(generateInitPrompt())
    return
  }

  const data = readRivetFile()

  switch (promptType) {
    case 'session-start':
      console.log(generateSessionStartPrompt(data))
      break

    case 'session-harvest':
      console.log(generateSessionHarvestPrompt(data))
      break

    case 'deep-harvest':
      console.log(generateDeepHarvestPrompt(data))
      break

    default:
      throw new Error(`Unknown prompt type: ${promptType}. Use: session-start, session-harvest, deep-harvest, init`)
  }
}
