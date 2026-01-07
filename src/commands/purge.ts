// ABOUTME: rivet purge <old-term> <new-term> - rename a term across codebase
// ABOUTME: Uses ripgrep to find occurrences, provides AI with replacement instructions

// Usage:
//   rivet purge OldRouter Router
//   rivet purge getUserId fetchUserId

// Workflow:
//   1. Find all occurrences of old-term using ripgrep
//   2. Generate replacement instructions for AI
//   3. Update rivet.yaml terms list
//   4. Log the purge operation
