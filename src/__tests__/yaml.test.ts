// ABOUTME: Tests for .rivet/systems.yaml parsing and serialization
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
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
    it('creates a new .rivet/systems.yaml', () => {
      const filePath = initRivetFile('TestProject', 'A test project', tempDir)

      expect(filePath).toBe(join(tempDir, '.rivet', 'systems.yaml'))

      const content = readFileSync(filePath, 'utf-8')
      expect(content).toContain('name: "TestProject"')
      expect(content).toContain('purpose: "A test project"')
      // Should include template guidance
      expect(content).toContain('GENERATION GUIDE FOR AI')
    })

    it('throws if .rivet/systems.yaml already exists', () => {
      initRivetFile('TestProject', 'A test project', tempDir)

      expect(() => initRivetFile('Another', 'Another project', tempDir)).toThrow(
        '.rivet/systems.yaml already exists'
      )
    })
  })

  describe('readRivetFile', () => {
    it('reads and parses .rivet/systems.yaml', () => {
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
      const rivetDir = join(tempDir, '.rivet')
      mkdirSync(rivetDir, { recursive: true })
      writeFileSync(join(rivetDir, 'systems.yaml'), yaml)

      const data = readRivetFile(join(rivetDir, 'systems.yaml'))

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
    it('writes .rivet/systems.yaml preserving structure', () => {
      const data: RivetFile = {
        project: {
          name: 'TestProject',
          purpose: 'A test project',
          terms: {
            vibe_coding: 'AI handles implementation',
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

      const rivetDir = join(tempDir, '.rivet')
      mkdirSync(rivetDir, { recursive: true })
      const filePath = join(rivetDir, 'systems.yaml')
      writeFileSync(filePath, '') // Create empty file first
      writeRivetFile(data, filePath)

      const content = readFileSync(filePath, 'utf-8')
      expect(content).toContain('name: TestProject')
      expect(content).toContain('vibe_coding')
      expect(content).toContain('createRouter: factory function')
    })
  })

  describe('rivetFileExists', () => {
    it('returns true when .rivet/systems.yaml exists', () => {
      initRivetFile('Test', 'Test', tempDir)
      expect(rivetFileExists(tempDir)).toBe(true)
    })

    it('returns false when .rivet/systems.yaml does not exist', () => {
      expect(rivetFileExists(tempDir)).toBe(false)
    })
  })

  describe('findRivetFile', () => {
    it('finds .rivet/systems.yaml in parent directory', () => {
      initRivetFile('Test', 'Test', tempDir)

      const subDir = join(tempDir, 'src', 'commands')
      mkdirSync(subDir, { recursive: true })

      const found = findRivetFile(subDir)
      expect(found).toBe(join(tempDir, '.rivet', 'systems.yaml'))
    })
  })
})
