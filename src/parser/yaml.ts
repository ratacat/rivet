// ABOUTME: Read and write rivet.yaml files
// ABOUTME: Handles parsing, validation, and serialization

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { parse, stringify } from 'yaml'
import { join, dirname } from 'path'
import type { RivetFile } from '../schema/types.js'

const RIVET_FILENAME = 'rivet.yaml'

export class RivetFileNotFoundError extends Error {
  constructor(searchPath: string) {
    super(`No rivet.yaml found in ${searchPath} or any parent directory`)
    this.name = 'RivetFileNotFoundError'
  }
}

export class RivetParseError extends Error {
  constructor(path: string, cause: unknown) {
    super(`Failed to parse ${path}: ${cause instanceof Error ? cause.message : String(cause)}`)
    this.name = 'RivetParseError'
  }
}

/**
 * Find rivet.yaml by searching current directory and ancestors
 * @param startDir - Directory to start searching from (defaults to cwd)
 * @returns Path to rivet.yaml if found
 * @throws RivetFileNotFoundError if not found
 */
export function findRivetFile(startDir: string = process.cwd()): string {
  let dir = startDir

  while (true) {
    const candidate = join(dir, RIVET_FILENAME)
    if (existsSync(candidate)) {
      return candidate
    }

    const parent = dirname(dir)
    if (parent === dir) {
      // Reached filesystem root
      throw new RivetFileNotFoundError(startDir)
    }
    dir = parent
  }
}

/**
 * Read and parse rivet.yaml
 * @param path - Path to rivet.yaml (auto-discovers if not provided)
 * @returns Parsed RivetFile
 */
export function readRivetFile(path?: string): RivetFile {
  const filePath = path ?? findRivetFile()

  try {
    const content = readFileSync(filePath, 'utf-8')
    const data = parse(content) as RivetFile
    return data
  } catch (err) {
    if (err instanceof RivetFileNotFoundError) throw err
    throw new RivetParseError(filePath, err)
  }
}

/**
 * Write RivetFile to disk
 * @param data - The RivetFile to write
 * @param path - Path to write to (auto-discovers existing file if not provided)
 */
export function writeRivetFile(data: RivetFile, path?: string): string {
  const filePath = path ?? findRivetFile()

  const content = stringify(data, {
    lineWidth: 0, // Don't wrap lines
    nullStr: '~', // Use ~ for null values
  })

  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

/**
 * Create a new rivet.yaml file
 * @param projectName - Name of the project
 * @param purpose - Purpose of the project
 * @param path - Where to create the file (defaults to cwd)
 */
export function initRivetFile(
  projectName: string,
  purpose: string,
  path: string = process.cwd()
): string {
  const filePath = join(path, RIVET_FILENAME)

  if (existsSync(filePath)) {
    throw new Error(`${RIVET_FILENAME} already exists at ${filePath}`)
  }

  const data: RivetFile = {
    project: {
      name: projectName,
      purpose: purpose,
    },
    systems: {},
  }

  const content = stringify(data, {
    lineWidth: 0,
    nullStr: '~',
  })

  writeFileSync(filePath, content, 'utf-8')
  return filePath
}

/**
 * Check if rivet.yaml exists in current directory or ancestors
 */
export function rivetFileExists(startDir: string = process.cwd()): boolean {
  try {
    findRivetFile(startDir)
    return true
  } catch {
    return false
  }
}
