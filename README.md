# Rivet

**Lock your language to your code.**

A rivet is a permanent fastener. It locks two layers together without requiring ongoing attention. It either holds or it doesn't. No maintenance. No drift. No cruft.

Rivet does the same thing for your codebase: it locks the **linguistic layer** (requirements, decisions, terminology) to the **code layer** (implementation). Once fastened, words mean what you said they mean.

---

## Why This Matters Now

In the age of AI-assisted development, words are first-class citizens.

Previously, naming only mattered for humans: "What happens when someone else reads this code?" Now there's a new reader—the AI. And AIs take language literally in ways humans don't.

The scope has expanded. Your terminology now determines whether an AI hallucinates, drifts, or stays grounded. Rivet gives you control over that.

---

## Design Principles

| Principle | What It Means |
|-----------|---------------|
| **Passive** | Works without intervention. You shouldn't notice it's there. |
| **Zero Maintenance** | Set it and forget it. If it needs upkeep, we've failed. |
| **Incapable of Cruft** | Structurally prevents accumulation. Discrete units, not prose. |

Rivet is not documentation. It's disambiguation. Only things that cause confusion deserve entries. Smaller is better.

---

## What It Looks Like

```yaml
# rivet.yaml
project:
  name: MyApp
  purpose: "E-commerce platform for handmade goods"

  glossary:
    vibe_coding:
      definition: "AI handles implementation while human guides direction"

systems:
  Router:
    description: "Handles URL routing and navigation"
    status: active

    requirements:
      - "Must support nested routes"
      - "Must handle auth redirects"

    decisions:
      - "Async-first for high-concurrency workloads"

    terms:
      createRouter: "factory function - use instead of new Router()"
      useRouter: "React hook for accessing router in components"
```

---

## Quick Start

```bash
# Initialize in your project
rivet init

# Add a system
rivet system add Router "Handles URL routing"

# Add requirements and decisions
rivet system edit Router +requirement "Must support nested routes"
rivet system edit Router +decision "Async-first for scale"

# Lock terminology
rivet system edit Router +term createRouter "factory function"

# Output context for AI
rivet context
```

Every command auto-commits. Don't like a change? `git revert`.

---

## The Rivet Metaphor

> "Language is the liquid we're all dissolved in."

Companies like SpaceX control vocabulary—no new acronym without approval. Not bureaucracy; recognition that shared meaning enables shared work.

Rivet brings that discipline to your codebase. Lock the terms that matter. Let the rest stay fluid.

---

## Commands

**Systems:** `rivet system add|show|list|edit|link|deprecate`

**Glossary:** `rivet term define|rename|delete|list`

**Context:** `rivet context [system...]` — output for AI consumption

**Batch:** `rivet sync [--flags...]` — capture entire session in one command

**Utilities:** `rivet check` · `rivet purge` · `rivet harvest`

---

## License

MIT
