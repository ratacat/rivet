// ABOUTME: TypeScript types for rivet.yaml structure
// ABOUTME: Defines the shape of projects, systems, and layouts

export type SystemType = 'system' | 'concept'

export type SystemStatus = 'active' | 'deprecated' | `replacing:${string}`

export interface System {
  type: SystemType
  description: string
  status: SystemStatus
  replaces?: string
  requirements: string[]
  symbols: string[]
  depends_on: string[]
  used_by: string[]
  differs_from?: string[]
}

export interface Project {
  name: string
  purpose: string
  design_values: string[]
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
  systems: Record<string, System>
  layout?: string | Layout | null
}
