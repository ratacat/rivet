# Rivet

<p align="center"><em>"Language is the liquid we're all dissolved in."</em><br>— Modest Mouse</p>

The work of language in programming is rapidly changing.

It used to be that language only mattered for humans reading your code. Today, with the rise of semi-intelligent AI systems, the linguistic layer of software is suddenly much more involved.

The tooling hasn't caught up yet.

---

Rivet aims to be a seamless, low-maintenance tool that strengthens the connection between your linguistic layer and your implementation layer.

It operates by scanning and extracting decisions, requirements, and terminology from your transcripts with your coding agent. There's a huge amount of valuable material in those conversations—architecture decisions, naming conventions, requirements you've articulated—that consistently gets wasted. Every time you have to repeat yourself to an AI, every time you re-explain a decision or clarify a term, that's an opportunity for better tooling.

A rivet is a permanent fastener. It holds two layers together without needing attention. It either holds or it doesn't. That's what this does. Once something is riveted, it doesn't drift. It means what you said it means.

---

```yaml
# rivet.yaml
project:
  name: MyApp
  purpose: "E-commerce platform for handmade goods"

  glossary:
    vibe_coding:
      definition: "AI handles implementation while human guides direction"
    premature_reification:
      definition: "When casual language gets formalized before agreement"

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

    depends_on:
      - Config
```

---

## Commands

`rivet system add|show|list|edit|link|deprecate`

`rivet term define|rename|delete|list`

`rivet context` · `rivet sync` · `rivet check` · `rivet harvest`

---

MIT License
