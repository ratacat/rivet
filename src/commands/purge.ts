// ABOUTME: rivet purge <term> - remove a term from the codebase
// ABOUTME: Low-level utility, AI decides what to do with each occurrence

// Usage:
//   rivet purge oldFunctionName
//   rivet purge deprecatedClassName

// Workflow:
//   1. Use ripgrep to find all occurrences of the term
//   2. Present findings to AI
//   3. AI decides for each occurrence: delete, rename, refactor
//   4. Not about .rivet/systems.yaml - about cleaning up actual code

// This is a low-level utility. For renaming glossary terms, use 'rivet term rename'.
