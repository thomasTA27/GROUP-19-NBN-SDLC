#!/usr/bin/env node
/**
 * Validates that no {{placeholder}} patterns remain unreplaced in tracked files.
 *
 * A placeholder is: {{word}} or {{kebab-case}} or {{snake_case}}
 * — a single identifier with no spaces, commas, or GitHub Actions $ prefix.
 *
 * Excluded:
 *   - GitHub Actions expressions: ${{ ... }} and {{ secrets.X }}
 *   - JSX object spreads: value={{ key1, key2 }} (contains space/comma)
 *   - .github/ directory (uses {{ }} legitimately for Actions)
 *
 * Run via: pnpm run validate
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Matches {{single-word}} or {{kebab-case}} or {{snake_case}} only
// Does NOT match {{ multi word }}, ${{ }}, or {{ key, val }}
const PLACEHOLDER_REGEX = /\{\{([a-zA-Z][a-zA-Z0-9_-]*)\}\}/g

const CHECKED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml']

const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  '.firebase',
  '/lib/',
  'dist/',
  '.git/',
  '.github/',           // GitHub Actions uses {{ }} legitimately
  'scripts/validate-placeholders.js',
]

function shouldSkip(filePath) {
  // Normalise to forward slashes for cross-platform matching
  const normalised = filePath.replace(/\\/g, '/')
  return SKIP_PATTERNS.some(p => normalised.includes(p))
}

function getTrackedFiles() {
  try {
    const output = execSync('git ls-files', { encoding: 'utf8' })
    return output.trim().split('\n').filter(Boolean)
  } catch {
    return []
  }
}

function checkFile(filePath) {
  if (shouldSkip(filePath)) return []
  const ext = path.extname(filePath)
  const isEnvExample = filePath.endsWith('.env.example')
  if (!CHECKED_EXTENSIONS.includes(ext) && !isEnvExample) return []

  let content
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch {
    return []
  }

  const matches = []
  let match
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    // Skip lines that are GitHub Actions expressions (${{ }})
    if (line.includes('${{')) return
    PLACEHOLDER_REGEX.lastIndex = 0
    while ((match = PLACEHOLDER_REGEX.exec(line)) !== null) {
      matches.push({ file: filePath, line: i + 1, placeholder: match[0] })
    }
  })
  return matches
}

const files = getTrackedFiles()
const allIssues = files.flatMap(checkFile)

if (allIssues.length === 0) {
  console.log('✅ No unreplaced placeholders found.')
  process.exit(0)
} else {
  console.error('❌ Found unreplaced {{placeholder}} values:\n')
  allIssues.forEach(({ file, line, placeholder }) => {
    console.error(`  ${file}:${line}  →  ${placeholder}`)
  })
  console.error(`\n${allIssues.length} placeholder(s) must be replaced before committing.`)
  process.exit(1)
}
