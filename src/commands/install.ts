// ABOUTME: rivet install - install rivet hooks and dependencies into Claude Code
// ABOUTME: Installs TLDR, copies hook scripts, and updates settings.json

import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { homedir } from 'os'
import { getTemplatesDir } from '../parser/yaml.js'

const USAGE = `
rivet install - Install rivet hooks into Claude Code

Usage:
  rivet install [options]

This command:
  1. Installs TLDR (llm-tldr) for codebase analysis
  2. Copies session-inject.sh to ~/.claude/hooks/rivet/
  3. Adds SessionStart hook to ~/.claude/settings.json

Options:
  -h, --help         Show this help
  --dry-run          Show what would be done without making changes
  --skip-tldr        Skip TLDR installation
`.trim()

/**
 * Check if a command exists in PATH
 */
function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

/**
 * Install TLDR (llm-tldr) via pip
 */
function installTldr(dryRun: boolean): void {
  console.log('\n📦 TLDR (llm-tldr)')
  console.log('   Code analysis tool for understanding codebase structure.')
  console.log('   Used by rivet init to discover systems and relationships.')

  if (commandExists('tldr')) {
    try {
      const version = execSync('tldr --version 2>&1', { encoding: 'utf-8' }).trim()
      console.log(`   ✓ Already installed (${version})`)
      return
    } catch {
      // Version check failed, but command exists
      console.log('   ✓ Already installed')
      return
    }
  }

  console.log('   Installing via pip...')
  if (!dryRun) {
    try {
      execSync('pip install llm-tldr', { stdio: 'inherit' })
      console.log('   ✓ Installed successfully')
    } catch (err) {
      console.error('   ✗ Failed to install. Try manually: pip install llm-tldr')
      throw err
    }
  }
}

interface ClaudeSettings {
  hooks?: {
    SessionStart?: Array<{
      matcher: string
      hooks: Array<{ type: string; command: string }>
    }>
    [key: string]: unknown
  }
  [key: string]: unknown
}

export async function runInstall(args: string[]): Promise<void> {
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  const dryRun = args.includes('--dry-run')
  const skipTldr = args.includes('--skip-tldr')
  const home = homedir()
  const claudeDir = join(home, '.claude')
  const hooksDir = join(claudeDir, 'hooks', 'rivet')
  const settingsPath = join(claudeDir, 'settings.json')
  const hookDest = join(hooksDir, 'session-inject.sh')

  console.log('Installing Rivet...')
  if (dryRun) {
    console.log('(dry run - no changes will be made)\n')
  }

  // Step 1: Install TLDR
  if (!skipTldr) {
    installTldr(dryRun)
  }

  // Step 2: Copy hook script
  console.log('\n📁 Session Hook')
  console.log('   Injects rivet context at the start of each Claude Code session.')

  const templatesDir = getTemplatesDir()
  const hooksSourceDir = join(dirname(templatesDir), 'hooks')
  const hookSource = join(hooksSourceDir, 'session-inject.sh')

  if (!existsSync(hookSource)) {
    throw new Error(`Hook source not found: ${hookSource}`)
  }

  console.log(`   Copying to ${hookDest}`)
  if (!dryRun) {
    mkdirSync(hooksDir, { recursive: true })
    copyFileSync(hookSource, hookDest)
    const { chmodSync } = await import('fs')
    chmodSync(hookDest, 0o755)
  }
  console.log('   ✓ Hook installed')

  // Step 3: Update settings.json
  console.log('\n⚙️  Claude Code Settings')
  console.log('   Adding SessionStart hook to trigger rivet on each session.')

  if (!existsSync(settingsPath)) {
    throw new Error(`Claude Code settings not found: ${settingsPath}\nIs Claude Code installed?`)
  }

  const settings: ClaudeSettings = JSON.parse(readFileSync(settingsPath, 'utf-8'))

  if (!settings.hooks) {
    settings.hooks = {}
  }
  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = []
  }

  const alreadyInstalled = settings.hooks.SessionStart.some(entry =>
    entry.hooks?.some(h => h.command?.includes('rivet') && h.command?.includes('session-inject'))
  )

  if (alreadyInstalled) {
    console.log('   ✓ Already configured')
  } else {
    const newHook = {
      matcher: '',
      hooks: [
        {
          type: 'command',
          command: hookDest
        }
      ]
    }

    settings.hooks.SessionStart.push(newHook)

    if (!dryRun) {
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    }
    console.log('   ✓ Hook added to settings.json')
  }

  // Summary
  console.log('\n' + '─'.repeat(50))
  console.log('✅ Rivet installed successfully!\n')
  console.log('What happens next:')
  console.log('  1. Restart Claude Code')
  console.log('  2. On session start, rivet will check for .rivet/systems.yaml')
  console.log('  3. If missing, you\'ll be guided through initialization')
  console.log('  4. Once set up, session context is injected automatically')
}
