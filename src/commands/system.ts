// ABOUTME: rivet system <subcommand> - manage systems
// ABOUTME: Add, show, edit, list, link, deprecate systems

// Subcommands:
//   rivet system add <name> <description>
//   rivet system show <name>
//   rivet system list [--status <status>]
//   rivet system edit [<system>] [<field>] [+|-]<value>
//   rivet system link <system> --depends-on|--used-by <other>
//   rivet system deprecate <system> [--replaced-by <new>]

// Edit fields (from schema):
//   description  - string (replace)
//   requirement  - list (+add / -remove)
//   decision     - list (+add / -remove)
//   term         - list (+add / -remove) - locked code identifiers
//   status       - enum: active | deprecated | replacing:<system>
//   depends_on   - list (+add / -remove)
//   used_by      - list (+add / -remove)
//   differs_from - list (+add / -remove)

// Examples:
//   rivet system add Router "handles URL routing"
//   rivet system edit Router +requirement "must support nested routes"
//   rivet system edit Router +term createRouter
//   rivet system deprecate OldRouter --replaced-by Router
