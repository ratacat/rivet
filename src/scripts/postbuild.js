#!/usr/bin/env node
// ABOUTME: Post-build script to prepare CLI for npm publish
// ABOUTME: Adds shebang to compiled JS and sets executable permissions

import { readFileSync, writeFileSync, chmodSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectRoot = join(__dirname, '..', '..')
const binPath = join(projectRoot, 'dist', 'bin', 'rivet.js')

const shebang = '#!/usr/bin/env node\n'
let content = readFileSync(binPath, 'utf8')

if (content.startsWith('#!')) {
  const firstNewline = content.indexOf('\n')
  content = content.slice(firstNewline + 1)
}

writeFileSync(binPath, shebang + content)
console.log('Added shebang to dist/bin/rivet.js')

chmodSync(binPath, 0o755)
console.log('Set executable permissions on dist/bin/rivet.js')
