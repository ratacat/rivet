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

interface HookEntry {
  matcher: string
  hooks: Array<{ type: string; command: string }>
}

interface ClaudeSettings {
  hooks?: {
    SessionStart?: HookEntry[]
    UserPromptSubmit?: HookEntry[]
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
  const sessionHookDest = join(hooksDir, 'session-inject.sh')
  const promptHookDest = join(hooksDir, 'prompt-inject.sh')

  console.log('Installing Rivet...')
  if (dryRun) {
    console.log('(dry run - no changes will be made)\n')
  }

  // Step 1: Install TLDR
  if (!skipTldr) {
    installTldr(dryRun)
  }

  // Step 2: Copy hook scripts
  const templatesDir = getTemplatesDir()
  const hooksSourceDir = join(dirname(templatesDir), 'hooks')

  console.log('\n📁 Hooks')

  // Session hook - runs once at session start for context
  const sessionHookSource = join(hooksSourceDir, 'session-inject.sh')
  if (!existsSync(sessionHookSource)) {
    throw new Error(`Hook source not found: ${sessionHookSource}`)
  }
  console.log('   session-inject.sh: Injects context at session start')
  if (!dryRun) {
    mkdirSync(hooksDir, { recursive: true })
    copyFileSync(sessionHookSource, sessionHookDest)
    const { chmodSync } = await import('fs')
    chmodSync(sessionHookDest, 0o755)
  }

  // Prompt hook - quick check on each prompt, only outputs if init needed
  const promptHookSource = join(hooksSourceDir, 'prompt-inject.sh')
  if (!existsSync(promptHookSource)) {
    throw new Error(`Hook source not found: ${promptHookSource}`)
  }
  console.log('   prompt-inject.sh: Forces init if needed (fast exit otherwise)')
  if (!dryRun) {
    copyFileSync(promptHookSource, promptHookDest)
    const { chmodSync } = await import('fs')
    chmodSync(promptHookDest, 0o755)
  }
  console.log('   ✓ Hooks installed')

  // Step 3: Update settings.json
  console.log('\n⚙️  Claude Code Settings')

  if (!existsSync(settingsPath)) {
    throw new Error(`Claude Code settings not found: ${settingsPath}\nIs Claude Code installed?`)
  }

  const settings: ClaudeSettings = JSON.parse(readFileSync(settingsPath, 'utf-8'))

  if (!settings.hooks) {
    settings.hooks = {}
  }

  let settingsChanged = false

  // Add SessionStart hook
  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = []
  }
  const sessionHookInstalled = settings.hooks.SessionStart.some(entry =>
    entry.hooks?.some(h => h.command?.includes('rivet') && h.command?.includes('session-inject'))
  )
  if (!sessionHookInstalled) {
    settings.hooks.SessionStart.push({
      matcher: '',
      hooks: [{ type: 'command', command: sessionHookDest }]
    })
    settingsChanged = true
    console.log('   ✓ SessionStart hook added')
  } else {
    console.log('   ✓ SessionStart hook already configured')
  }

  // Add UserPromptSubmit hook
  if (!settings.hooks.UserPromptSubmit) {
    settings.hooks.UserPromptSubmit = []
  }
  const promptHookInstalled = settings.hooks.UserPromptSubmit.some(entry =>
    entry.hooks?.some(h => h.command?.includes('rivet') && h.command?.includes('prompt-inject'))
  )
  if (!promptHookInstalled) {
    settings.hooks.UserPromptSubmit.push({
      matcher: '',
      hooks: [{ type: 'command', command: promptHookDest }]
    })
    settingsChanged = true
    console.log('   ✓ UserPromptSubmit hook added')
  } else {
    console.log('   ✓ UserPromptSubmit hook already configured')
  }

  if (settingsChanged && !dryRun) {
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  }

  // Summary
  console.log('\n' + '─'.repeat(50))
  console.log('✅ Rivet installed successfully!\n')
  console.log('What happens next:')
  console.log('  1. Restart Claude Code')
  console.log('  2. SessionStart injects context once per session')
  console.log('  3. UserPromptSubmit forces init if .rivet/systems.yaml missing')
  console.log('  4. Once initialized, context flows automatically')
}
