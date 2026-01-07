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

Some principles we're trying to hold:

**Passive.** You shouldn't have to think about Rivet. It's there when you need it.

**Zero maintenance.** If it requires upkeep to stay useful, we've failed.

**Incapable of cruft.** This is the hard one. Give an AI any leash and it runs with it—generating too much of something until it loses meaning. Rivet is structurally small. Discrete units. Only things that cause confusion deserve entries.

---

Here's what it looks like:

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

    requirements:
      - "Must support nested routes"
      - "Must handle auth redirects"

    decisions:
      - "Async-first for high-concurrency workloads"

    terms:
      createRouter: "factory function - use instead of new Router()"
      useRouter: "React hook for router context"
```

---

```bash
rivet init
rivet system add Router "Handles URL routing"
rivet system edit Router +requirement "Must support nested routes"
rivet system edit Router +term createRouter "factory function"
rivet context
```

Every command auto-commits. Don't like something? `git revert`.

---

**Commands**

`rivet system add|show|list|edit|link|deprecate`

`rivet term define|rename|delete|list`

`rivet context` · `rivet sync` · `rivet check` · `rivet harvest`

---

MIT License
