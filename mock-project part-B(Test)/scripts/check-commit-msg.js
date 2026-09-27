#!/usr/bin/env node
/**
 * Validates commit messages follow Conventional Commits.
 * Called by Lefthook commit-msg hook.
 *
 * Usage: node scripts/check-commit-msg.js <commit-msg-file>
 */
const fs = require('fs')

const msgFile = process.argv[2]
if (!msgFile) {
  console.error('Usage: node scripts/check-commit-msg.js <commit-msg-file>')
  process.exit(1)
}

const msg = fs.readFileSync(msgFile, 'utf8').trim()
const pattern = /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(.+\))?: .{1,100}/

if (!pattern.test(msg)) {
  console.error('\n❌ Commit message does not follow Conventional Commits.\n')
  console.error('  Format: type(scope): description')
  console.error('  Types:  feat | fix | docs | style | refactor | test | chore | build | ci | perf | revert')
  console.error('\n  Examples:')
  console.error('    feat: add invoice PDF export')
  console.error('    fix(auth): handle token expiry on refresh')
  console.error('    docs: update Firestore schema')
  console.error('    chore: upgrade firebase-admin to v13\n')
  process.exit(1)
}

process.exit(0)
