// ABOUTME: Tests for rivet.yaml parsing and serialization
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  readRivetFile,
  writeRivetFile,
  initRivetFile,
  findRivetFile,
  rivetFileExists,
  RivetFileNotFoundError,
} from '../parser/yaml.js'
import type { RivetFile } from '../schema/types.js'

describe('rivet yaml parser', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'rivet-test-'))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe('initRivetFile', () => {
    it('creates a new rivet.yaml', () => {
      const filePath = initRivetFile('TestProject', 'A test project', tempDir)

      expect(filePath).toBe(join(tempDir, 'rivet.yaml'))

      const content = readFileSync(filePath, 'utf-8')
      expect(content).toContain('name: TestProject')
      expect(content).toContain('purpose: A test project')
    })

    it('throws if rivet.yaml already exists', () => {
      initRivetFile('TestProject', 'A test project', tempDir)

      expect(() => initRivetFile('Another', 'Another project', tempDir)).toThrow(
        'rivet.yaml already exists'
      )
    })
  })

  describe('readRivetFile', () => {
    it('reads and parses rivet.yaml', () => {
      const yaml = `
project:
  name: TestProject
  purpose: A test project
systems:
  Router:
    description: handles routing
    requirements:
      - Must support nested routes
    decisions:
      - Async-first for scale
    terms:
      createRouter: factory function
      RouterProvider: ~
`
      writeFileSync(join(tempDir, 'rivet.yaml'), yaml)

      const data = readRivetFile(join(tempDir, 'rivet.yaml'))

      expect(data.project.name).toBe('TestProject')
      expect(data.systems?.Router.description).toBe('handles routing')
      expect(data.systems?.Router.requirements).toContain('Must support nested routes')
      expect(data.systems?.Router.decisions).toContain('Async-first for scale')
      expect(data.systems?.Router.terms?.createRouter).toBe('factory function')
      expect(data.systems?.Router.terms?.RouterProvider).toBeNull()
    })

    it('throws RivetFileNotFoundError when file not found', () => {
      expect(() => findRivetFile(tempDir)).toThrow(RivetFileNotFoundError)
    })
  })

  describe('writeRivetFile', () => {
    it('writes rivet.yaml preserving structure', () => {
      const data: RivetFile = {
        project: {
          name: 'TestProject',
          purpose: 'A test project',
          glossary: {
            vibe_coding: {
              definition: 'AI handles implementation',
            },
          },
        },
        systems: {
          Router: {
            description: 'handles routing',
            terms: {
              createRouter: 'factory function',
              RouterProvider: null,
            },
          },
        },
      }

      const filePath = join(tempDir, 'rivet.yaml')
      writeFileSync(filePath, '') // Create empty file first
      writeRivetFile(data, filePath)

      const content = readFileSync(filePath, 'utf-8')
      expect(content).toContain('name: TestProject')
      expect(content).toContain('vibe_coding')
      expect(content).toContain('createRouter: factory function')
    })
  })

  describe('rivetFileExists', () => {
    it('returns true when rivet.yaml exists', () => {
      initRivetFile('Test', 'Test', tempDir)
      expect(rivetFileExists(tempDir)).toBe(true)
    })

    it('returns false when rivet.yaml does not exist', () => {
      expect(rivetFileExists(tempDir)).toBe(false)
    })
  })

  describe('findRivetFile', () => {
    it('finds rivet.yaml in parent directory', () => {
      initRivetFile('Test', 'Test', tempDir)

      const subDir = join(tempDir, 'src', 'commands')
      require('fs').mkdirSync(subDir, { recursive: true })

      const found = findRivetFile(subDir)
      expect(found).toBe(join(tempDir, 'rivet.yaml'))
    })
  })
})
