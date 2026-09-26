/**
 * Convention tests — enforce the two backend rules that silently drift:
 *
 *   1. Firebase Admin is imported ONLY via src/lib/firebase.ts
 *      (single initialization point; tests can mock one module)
 *   2. No console.log in src/ (use console.error/warn for real logging)
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

const SRC = path.resolve(__dirname, '../../src')

function getFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return getFiles(full)
    return entry.name.endsWith('.ts') ? [full] : []
  })
}

const allFiles = getFiles(SRC)

describe('Backend conventions', () => {
  it('only src/lib/firebase.ts imports firebase-admin (type-only imports are fine)', () => {
    const violations = allFiles
      .filter((file) => !file.endsWith(path.join('lib', 'firebase.ts')))
      .filter((file) =>
        /import\s+(?!type\b)[^;]*from\s+['"]firebase-admin/.test(fs.readFileSync(file, 'utf-8')),
      )
      .map((file) => path.relative(SRC, file))

    expect(
      violations,
      `Import { adminDb, adminAuth } from lib/firebase instead: ${violations.join(', ')}`,
    ).toEqual([])
  })

  it('no console.log in src/ files', () => {
    const violations = allFiles
      .filter((file) => /console\.log\s*\(/.test(fs.readFileSync(file, 'utf-8')))
      .map((file) => path.relative(SRC, file))

    expect(violations, `Remove console.log before merging: ${violations.join(', ')}`).toEqual([])
  })
})
