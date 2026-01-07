// ABOUTME: TypeScript types for rivet.yaml structure
// ABOUTME: Defines the shape of projects, systems, and glossary

export type SystemStatus = 'active' | 'deprecated' | `replacing:${string}`

/** A glossary term - project-wide concept, jargon, or convention */
export interface GlossaryTerm {
  definition: string
  /** Temporary field for renamed terms - removed once old term purged from codebase */
  previously?: string
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
  /** Locked terminology - map of term -> optional context (null if self-explanatory) */
  terms?: Record<string, string | null>
  depends_on?: string[]
  used_by?: string[]
  /** Disambiguation - things this is NOT */
  differs_from?: string[]
}

export interface Project {
  name: string
  purpose: string
  /** Project-wide glossary - concepts not tied to any specific system */
  glossary?: Record<string, GlossaryTerm>
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
