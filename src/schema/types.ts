// ABOUTME: TypeScript types for rivet.yaml structure
// ABOUTME: Defines the shape of projects, systems, and terms

/**
 * Schema rules:
 * - description required, max ~100 words
 * - requirements are atomic single sentences (the WHAT)
 * - decisions are single statements capturing rationale (the WHY)
 * - project terms = simple key-value for project-wide domain terms
 * - system terms = domain language, NOT method names (TLDR handles those)
 * - status transitions: active → deprecated → deleted from file
 * - boundaries define what's in-scope vs out-of-scope
 * - calls/called_by can be auto-generated from TLDR static analysis
 */

export type SystemStatus = 'active' | 'deprecated' | `replacing:${string}`

/** A deprecated term pointing to its replacement */
export interface DeprecatedTerm {
  /** The new term to use instead */
  use: string
  /** Why this term was deprecated */
  reason: string
}

/** A system - cohesive bundle of code forming a single mental model */
export interface System {
  description: string
  status?: SystemStatus
  replaces?: string
  /** Atomic statements - the WHAT */
  requirements?: string[]
  /** Design rationale - the WHY */
  decisions?: string[]
  /** Terms specific to this system - domain language or meaningful code symbols */
  terms?: Record<string, string | null>
  /** Old terms that have been replaced - maps old term to replacement info */
  'deprecated-terms'?: Record<string, DeprecatedTerm>
  /** What's in-scope vs out-of-scope for this system */
  boundaries?: string[]
  /** Compile-time dependencies - what this needs to exist */
  depends_on?: string[]
  /** Compile-time reverse dependencies - what needs this */
  used_by?: string[]
  /** Runtime - systems this invokes (can be auto-generated from TLDR) */
  calls?: string[]
  /** Runtime - systems that invoke this (can be auto-generated from TLDR) */
  called_by?: string[]
}

export interface Project {
  name: string
  purpose: string
  /** Development ethos - guiding principles for how this project is built */
  principles?: string[]
  /** Project-wide terms - domain language or meaningful code symbols */
  terms?: Record<string, string>
  /** Old terms that have been replaced - maps old term to replacement info */
  'deprecated-terms'?: Record<string, DeprecatedTerm>
  /** Project-wide design rationale - the WHY */
  decisions?: string[]
  /** Project-wide atomic statements - the WHAT */
  requirements?: string[]
}

export interface LayoutRule {
  [path: string]: string  // path -> description
}

export interface Layout {
  name: string
  description: string
  rules: LayoutRule
}

export interface RivetFile {
  project: Project
  systems?: Record<string, System>
  layout?: string | Layout | null
}
