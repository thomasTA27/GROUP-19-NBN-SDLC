// Builds the inventory of every Survived and NoCoverage mutant from the Stryker JSON report.
// Reads:   testing-and-qa/reports/mutation.json and the (unmutated) source files it names.
// Writes:  testing-and-qa/reports/survivors-inventory.json and survivors-inventory.md
// Run from the mock project folder:  node testing-and-qa/reports/generate-inventory.mjs
// It changes no source file and does not classify anything.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..', '..')
const frontend = join(projectRoot, 'frontend')
const report = JSON.parse(readFileSync(join(here, 'mutation.json'), 'utf8'))

const tests = new Map()
for (const [file, entry] of Object.entries(report.testFiles ?? {})) {
  for (const t of entry.tests ?? []) tests.set(t.id, { id: t.id, name: t.name, file })
}

// Stryker locations are 1-based lines and 1-based columns; end is exclusive.
function slice(lines, loc) {
  const { start, end } = loc
  if (start.line === end.line) return (lines[start.line - 1] ?? '').slice(start.column - 1, end.column - 1)
  const out = [(lines[start.line - 1] ?? '').slice(start.column - 1)]
  for (let l = start.line + 1; l < end.line; l++) out.push(lines[l - 1] ?? '')
  out.push((lines[end.line - 1] ?? '').slice(0, end.column - 1))
  return out.join('\n')
}

const items = []
const counts = {}
for (const [path, fileResult] of Object.entries(report.files)) {
  const lines = readFileSync(join(frontend, path), 'utf8').replace(/\r\n/g, '\n').split('\n')
  for (const m of fileResult.mutants) {
    counts[m.status] = (counts[m.status] ?? 0) + 1
    if (m.status !== 'Survived' && m.status !== 'NoCoverage') continue
    items.push({
      id: m.id,
      status: m.status,
      file: `frontend/${path}`,
      mutator: m.mutatorName,
      location: m.location,
      lineText: (lines[m.location.start.line - 1] ?? '').trim(),
      original: slice(lines, m.location),
      replacement: m.replacement ?? null,
      static: m.static ?? false,
      coveredByCount: (m.coveredBy ?? []).length,
      coveredBy: (m.coveredBy ?? []).map((id) => tests.get(id) ?? { id }),
      testsCompleted: m.testsCompleted ?? null,
      description: m.description ?? null,
    })
  }
}
items.sort((a, b) => a.file.localeCompare(b.file) || a.location.start.line - b.location.start.line || a.location.start.column - b.location.start.column)

const summary = {
  source: 'testing-and-qa/reports/mutation.json',
  schemaVersion: report.schemaVersion,
  statusCounts: counts,
  inventoryCount: items.length,
}
writeFileSync(join(here, 'survivors-inventory.json'), JSON.stringify({ summary, mutants: items }, null, 2) + '\n')

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, '\\n').replace(/`/g, "'")
const cut = (s, n = 90) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const md = [
  '# Survived and NoCoverage mutants (inventory, not classified)',
  '',
  `Generated from \`${summary.source}\` by \`testing-and-qa/reports/generate-inventory.mjs\`. Status counts in the report: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ')}. Listed here: ${items.length}.`,
  '',
  'Location is `line:column` start to end (1-based, end exclusive). "Covering tests" is the number of tests that executed the mutated code (0 for NoCoverage). The full test names are in `survivors-inventory.json`.',
  '',
  '| ID | Status | File | Location | Mutator | Original | Replacement | Covering tests |',
  '|---|---|---|---|---|---|---|---|',
  ...items.map((m) => {
    const l = m.location
    return `| ${m.id} | ${m.status} | ${m.file.replace('frontend/src/', '')} | ${l.start.line}:${l.start.column}-${l.end.line}:${l.end.column} | ${m.mutator} | \`${esc(cut(m.original))}\` | \`${esc(cut(m.replacement ?? ''))}\` | ${m.coveredByCount} |`
  }),
  '',
]
writeFileSync(join(here, 'survivors-inventory.md'), md.join('\n'))
console.log(JSON.stringify(summary))
