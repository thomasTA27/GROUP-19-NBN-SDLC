#!/usr/bin/env node
/**
 * First-time local setup: pnpm install + env template.
 * Run from repo root: pnpm run bootstrap
 */
'use strict'

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const root = path.resolve(__dirname, '..')
process.chdir(root)

const warn = (m) => console.warn(`\n\x1b[33m${m}\x1b[0m`)
const err = (m) => console.error(`\n\x1b[31m${m}\x1b[0m`)

function runPnpm(args) {
  const r = spawnSync('pnpm', args, {
    stdio: 'inherit',
    cwd: root,
    shell: process.platform === 'win32',
  })
  if (r.error) {
    err(`Failed to run pnpm: ${r.error.message}`)
    process.exit(1)
  }
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1)
}

function copyEnvIfMissing(relExample, relTarget) {
  const src = path.join(root, relExample)
  const dest = path.join(root, relTarget)
  if (!fs.existsSync(src)) {
    console.log(`  (skip) ${relExample} not found`)
    return
  }
  if (fs.existsSync(dest)) {
    console.log(`  (keep) ${relTarget} already exists`)
    return
  }
  fs.copyFileSync(src, dest)
  console.log(`  (new)  ${relTarget} ← ${relExample}`)
}

function checkFirebaserc() {
  const fp = path.join(root, '.firebaserc')
  if (!fs.existsSync(fp)) return
  let data
  try {
    data = JSON.parse(fs.readFileSync(fp, 'utf8'))
  } catch {
    return
  }
  const def = data?.projects?.default
  if (typeof def === 'string' && (def.includes('REPLACE_WITH') || def.trim() === '')) {
    warn(
      '.firebaserc still uses a template project id. Set projects.default to your real Firebase project id (same as NEXT_PUBLIC_FIREBASE_PROJECT_ID).',
    )
  }
}

console.log('\n=== Garage boilerplate: bootstrap (first-time local setup) ===\n')

console.log('Installing dependencies…\n')
runPnpm(['install'])

console.log('\nEnvironment file (only create if missing)…')
copyEnvIfMissing('.env.example', '.env')

console.log('\nGenerating package env files from .env…')
{
  const r = spawnSync('node', ['scripts/sync-env.js'], {
    stdio: 'inherit',
    cwd: root,
    shell: process.platform === 'win32',
  })
  if ((r.status ?? 1) !== 0) process.exit(r.status ?? 1)
}

checkFirebaserc()

console.log(`
┌─────────────────────────────────────────────────────────────────
│ Next steps (you do these once per Firebase project)
└─────────────────────────────────────────────────────────────────

  All env values live in ONE file: the root .env
  (frontend/.env.local and backend/.env are generated — never edit them)

  1. Create a free Firebase project: https://console.firebase.google.com
     (Spark plan is fine — no billing required)
  2. Enable Authentication (Email/Password, or your chosen sign-in method)
     and Firestore Database.
  3. Fill in .env:
       - NEXT_PUBLIC_FIREBASE_PROJECT_ID (same id in .firebaserc → "default")
       - FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 (Project settings → Service accounts)
       - NEXT_PUBLIC_FIREBASE_* (Project settings → Your apps → web app config)
       - NEXT_PUBLIC_APP_NAME
  4. Re-run: pnpm run env:sync   (or just start dev — it syncs automatically)
  5. pnpm run dev  →  http://localhost:3000

  Reference for every variable: docs/ENV-VARS.md
`)
