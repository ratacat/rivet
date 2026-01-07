#!/usr/bin/env -S npx tsx
// ABOUTME: CLI entry point for Rivet
// ABOUTME: Parses args and routes to command handlers

const args = process.argv.slice(2)
const command = args[0]

// TODO: implement command routing
console.log(`rivet: command="${command || '(none)'}", args=${JSON.stringify(args.slice(1))}`)
