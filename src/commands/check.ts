// ABOUTME: rivet check - check codebase against rivet.yaml
// ABOUTME: Greps for terms, reports what's found/missing, surfaces mismatches

const USAGE = `
rivet check - Verify terms exist in codebase

Greps the codebase for all defined terms and reports:
- Which terms are found in the codebase
- Which terms are missing (defined but not used)
- Cleans up 'previously' fields for terms no longer in codebase

Usage:
  rivet check
`.trim()

export async function runCheck(args: string[]): Promise<void> {
  if (args.includes('-h') || args.includes('--help')) {
    console.log(USAGE)
    return
  }

  // TODO: Implement term checking
  console.log('rivet check: not yet implemented')
  console.log('This will grep the codebase for defined terms and report matches/mismatches')
}
