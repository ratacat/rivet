// ABOUTME: rivet term <subcommand> - manage project-wide glossary terms
// ABOUTME: Concepts, jargon, conventions that apply across the entire codebase

// Subcommands:
//   rivet term define <term> <definition>   - add a new glossary term
//   rivet term rename <old> <new>           - rename a term (adds 'previously' field)
//   rivet term delete <term>                - remove a term from glossary
//   rivet term list                         - show all glossary terms

// DIFFERENCE FROM 'rivet lock':
//   - 'term' = project-wide glossary (concepts, jargon, conventions)
//   - 'lock' = code identifiers locked to a specific system (Router.createRouter)

// The 'previously' field on renamed terms is temporary - removed once the old
// term is purged from the codebase.
