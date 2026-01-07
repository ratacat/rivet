# Rivet

> "Language is the liquid we're all dissolved in."
> — Modest Mouse

---

In the age of AI, the purpose of words in code is changing.

It used to be that naming conventions only mattered for humans reading your code—your future self, your teammates, the next maintainer. But now there's another reader: the AI. And the linguistic layer of a codebase is suddenly much more important than it was.

The tooling hasn't caught up yet.

---

Rivet is a passive, zero-maintenance tool for AI-driven development that strengthens the connection between your linguistic layer and your implementation layer.

It operates by scanning and extracting decisions, requirements, and terminology from your transcripts with your coding agent. There's a huge amount of valuable material in those conversations—architecture decisions, naming conventions, requirements you've articulated—that consistently gets wasted. Every time you have to repeat yourself to an AI, every time you re-explain a decision or clarify a term, that's an opportunity for better tooling.

A rivet is a permanent fastener. It holds two layers together without needing attention. It either holds or it doesn't. That's what this does. Once something is riveted, it doesn't drift. It means what you said it means.

---

## The feeling

You're three weeks into a project with your coding agent. You've had dozens of conversations. You've explained the architecture multiple times. You've made decisions, changed your mind, made new decisions.

And then you ask it to add a feature to the Router.

It creates a new Router. A second one. `RouterV2`. Or worse, `NewRouter`. It's not malicious—it just doesn't remember that you already have a Router, that you've been iterating on it, that it has requirements and history and a reason for being the way it is.

So you explain again. You say "no, the existing Router, the one in `src/routing/`." And it apologizes and fixes it. But now there's a weird import somewhere. A dependency that doesn't make sense. Something got tangled.

You find yourself repeating the same context. The same terminology. The same architectural decisions. It feels like talking to yourself, or like talking to someone with amnesia who's very good at coding but can't hold onto the bigger picture.

This is the problem Rivet exists to solve.

---

## What Rivet tracks

Rivet is small. It's seamless. It provides a living architecture of what currently exists—not documentation, not aspiration, just what is.

**Systems** — The major components in your codebase. Things with clear boundaries that you'd draw as boxes in an architecture diagram. A system is a cohesive bundle of code that forms a single mental model.

**Requirements** — What a system must do. Atomic statements. The WHAT.

**Decisions** — Why a system is the way it is. Design rationale. The WHY.

**Terms** — Locked vocabulary for a system. The function names, class names, identifiers that shouldn't drift. Each term can have optional context about when to use it.

**Glossary** — Project-wide terms not tied to any system. Concepts, jargon, conventions that have specific meaning in your codebase.

---

## Commands

`rivet system add|show|list|edit|link|deprecate`

`rivet term define|rename|delete|list`

`rivet context` · `rivet sync` · `rivet check` · `rivet harvest`

---

MIT License
