// ABOUTME: Basic tests for YAML parsing
import { describe, it, expect } from 'vitest'
import { parse, stringify } from 'yaml'

describe('yaml parser', () => {
  it('parses basic yaml', () => {
    const yaml = `
name: test
systems:
  Router:
    description: handles routing
`
    const result = parse(yaml)
    expect(result.name).toBe('test')
    expect(result.systems.Router.description).toBe('handles routing')
  })

  it('stringifies to yaml', () => {
    const obj = { name: 'test', value: 42 }
    const yaml = stringify(obj)
    expect(yaml).toContain('name: test')
    expect(yaml).toContain('value: 42')
  })
})
