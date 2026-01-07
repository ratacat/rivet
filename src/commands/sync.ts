// ABOUTME: rivet sync - batch multiple operations in one command
// ABOUTME: Each operation gets its own commit for granular undo

// Usage:
//   rivet sync --add Router "handles routing" --deprecate OldRouter
//   rivet sync --add Foo "desc" --require Foo "must do X" --symbol Foo createFoo

// Flags:
//   --add <name> <description>
//   --deprecate <name> [--replaced-by <new>]
//   --require <system> <statement>
//   --symbol <system> <symbol>
//   --link <system> --depends-on|--used-by <other>

// Behavior:
//   1. Parse all operations from flags
//   2. For each operation in sequence:
//      a. Make the change to rivet.yaml
//      b. git add rivet.yaml
//      c. git commit -m "rivet: <operation>"
//   3. Return success

// One tool use, multiple commits
// Each commit individually revertable with git revert
