// DIAGNOSTIC ONLY (not part of the project's tests). Reviewed and corrected in the review session; see README.md "Script history".
//
// Applies one Stryker mutant (from the ORIGINAL mutation.json) to a disposable copy and runs the diagnostic
// tests in tests/diag (assertions of intended behaviour + traces). usage:
//   node diagprobe.mjs <workerDir> <project> <outFile> <id,id,...|base>
// Optional env: DIAG_EXPECT_TOTAL (default 44), DIAG_EXPECT_TRACES (default 9), DIAG_TIMEOUT (ms, default 240000).
//
// Each output line has a `verdict`:
//   assertion-fails  at least one diagnostic assertion failed, or a suite could not load, in a fresh result file
//   all-pass         exit 0, fresh readable result, the expected number of tests and trace records, nothing failed
//   timeout          killed by the time limit (never a pass)
//   invalid          anything else (spawn error, signal, missing/empty/unreadable result, parse error, a test count or
//                    trace count that is not the expected one, non-zero exit with no failure recorded)
// A missing result is never reported as a failed assertion and never as a pass.
import { readFileSync, writeFileSync, appendFileSync, rmSync, existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const [workerDir, project, outFile, idList] = process.argv.slice(2)
const report = JSON.parse(readFileSync(join(project, 'testing-and-qa/reports/mutation.json'), 'utf8'))
const byId = new Map()
for (const [file, fr] of Object.entries(report.files)) for (const m of fr.mutants) byId.set(String(m.id), { ...m, file })
const front = join(workerDir, 'frontend')
const resultPath = join(front, 'diag-result.json')
const tracePath = join(front, 'diag-trace.jsonl')
const expectTotal = Number(process.env.DIAG_EXPECT_TOTAL ?? 44)
const expectTraces = Number(process.env.DIAG_EXPECT_TRACES ?? 9)

function offset(text, line, col) {
  let o = 0
  for (let l = 1; l < line; l++) o = text.indexOf('\n', o) + 1
  return o + col - 1
}

for (const id of idList.split(',')) {
  const record = { id: id === 'base' ? 'base' : Number(id) }
  let path = null
  let original = null
  try {
    if (id !== 'base') {
      const m = byId.get(id)
      if (!m) { appendFileSync(outFile, JSON.stringify({ ...record, verdict: 'invalid', reason: 'unknown mutant id' }) + '\n'); continue }
      path = join(front, m.file)
      original = readFileSync(path, 'utf8')
      const crlf = original.includes('\r\n')
      const text = original.replace(/\r\n/g, '\n')
      const mutated = text.slice(0, offset(text, m.location.start.line, m.location.start.column)) + m.replacement + text.slice(offset(text, m.location.end.line, m.location.end.column))
      writeFileSync(path, crlf ? mutated.replace(/\n/g, '\r\n') : mutated)
    }

    rmSync(resultPath, { force: true })
    rmSync(tracePath, { force: true })
    if (existsSync(resultPath) || existsSync(tracePath)) { appendFileSync(outFile, JSON.stringify({ ...record, verdict: 'invalid', reason: 'could not remove previous output' }) + '\n'); continue }

    const started = Date.now()
    const res = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', 'tests/diag', '--reporter=json', '--outputFile=diag-result.json'], {
      cwd: front, encoding: 'utf8', timeout: Number(process.env.DIAG_TIMEOUT ?? 240000),
    })
    record.exit = res.status
    record.signal = res.signal
    record.spawnError = res.error ? String(res.error.code ?? res.error.message) : null
    record.seconds = Math.round((Date.now() - started) / 1000)

    let total = null, parseError = null
    const failed = []
    if (!existsSync(resultPath)) parseError = 'result file missing after the run'
    else if (statSync(resultPath).size === 0) parseError = 'result file empty after the run'
    else {
      try {
        const j = JSON.parse(readFileSync(resultPath, 'utf8'))
        total = j.numTotalTests
        for (const f of j.testResults) {
          for (const a of f.assertionResults) if (a.status === 'failed') failed.push(a.fullName)
          if (f.status === 'failed' && f.assertionResults.length === 0) failed.push('SUITE-LEVEL FAILURE: ' + f.name.replace(/\\/g, '/').split('/').pop())
        }
      } catch (e) { parseError = String(e) }
    }
    let traces = []
    let traceError = null
    if (existsSync(tracePath)) {
      try { traces = readFileSync(tracePath, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) } catch (e) { traceError = String(e) }
    }
    Object.assign(record, { total, failed, parseError, traceError, traceCount: traces.length, traces })

    let verdict
    if (record.spawnError === 'ETIMEDOUT') verdict = 'timeout'
    else if (record.spawnError || record.signal || parseError || traceError) verdict = 'invalid'
    else if (failed.length > 0) verdict = 'assertion-fails'
    else if (record.exit === 0 && total === expectTotal && traces.length === expectTraces) verdict = 'all-pass'
    else verdict = 'invalid'
    record.verdict = verdict
    if (verdict === 'invalid' && !parseError && !traceError && !record.spawnError && !record.signal) {
      record.reason = `exit ${record.exit}, ${total} tests (expected ${expectTotal}), ${traces.length} trace records (expected ${expectTraces}), none failed`
    }
    appendFileSync(outFile, JSON.stringify(record) + '\n')
  } finally {
    if (path !== null && original !== null) {
      writeFileSync(path, original)
      if (readFileSync(path, 'utf8') !== original) appendFileSync(outFile, JSON.stringify({ id: record.id, verdict: 'invalid', reason: 'FILE NOT RESTORED' }) + '\n')
    }
  }
}
