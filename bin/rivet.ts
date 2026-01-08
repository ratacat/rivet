#!/usr/bin/env -S npx tsx
// ABOUTME: CLI entry point for Rivet
// ABOUTME: Parses args and routes to command handlers

import { runInit } from '../src/commands/init.js'
import { runContext } from '../src/commands/context.js'
import { runSystem } from '../src/commands/system.js'
import { runTerm } from '../src/commands/term.js'
import { runCheck } from '../src/commands/check.js'
import { runSync } from '../src/commands/sync.js'

const VERSION = '0.0.1'

const USAGE = `
rivet - lock your language

Usage:
  rivet <command> [options]

Commands:
  init                   Initialize .rivet/systems.yaml in current directory
  context [system...]    Output context for AI consumption
  system <subcommand>    Manage systems (add, show, list, edit, link, deprecate)
  term <subcommand>      Manage glossary terms (define, rename, delete, list)
  check                  Verify terms exist in codebase
  sync [operations...]   Batch multiple operations

Options:
  -h, --help             Show this help
  -v, --version          Show version

Examples:
  rivet init
  rivet system add Router "handles URL routing"
  rivet system edit Router +requirement "must support nested routes"
  rivet term define vibe_coding "AI handles implementation"
  rivet context Router
`.trim()

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  // Handle global flags
  if (!command || command === '-h' || command === '--help') {
    console.log(USAGE)
    process.exit(0)
  }

  if (command === '-v' || command === '--version') {
    console.log(`rivet ${VERSION}`)
    process.exit(0)
  }

  const subArgs = args.slice(1)

  try {
    switch (command) {
      case 'init':
        await runInit(subArgs)
        break

      case 'context':
        await runContext(subArgs)
        break

      case 'system':
        await runSystem(subArgs)
        break

      case 'term':
        await runTerm(subArgs)
        break

      case 'check':
        await runCheck(subArgs)
        break

      case 'sync':
        await runSync(subArgs)
        break

      default:
        console.error(`Unknown command: ${command}`)
        console.error('Run "rivet --help" for usage')
        process.exit(1)
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`)
    } else {
      console.error('An unexpected error occurred')
    }
    process.exit(1)
  }
}

main()
