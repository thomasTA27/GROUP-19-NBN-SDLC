import { readFileSync, writeFileSync } from 'node:fs'
const SP = process.argv[2]
const R = process.argv[3]
const rd = (f) => readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
const base = rd(`${SP}/dv2-base.jsonl`)[0]
const all = [...rd(`${SP}/dv2-w2.jsonl`), ...rd(`${SP}/dv2-w3.jsonl`), ...rd(`${SP}/dv2-w4.jsonl`)].sort((a, b) => a.id - b.id)
writeFileSync(`${SP}/dv2-all.json`, JSON.stringify({ base, all }))
const bt = Object.fromEntries(base.traces.map((t) => [t.k, JSON.stringify(t.v)]))
const old = rd(`${R}/diag-probe-70.first-run.jsonl`)
const ob = rd(`${R}/diag-baseline-original.first-run.jsonl`)[0]
const obt = Object.fromEntries(ob.traces.map((t) => [t.k, JSON.stringify(t.v)]))
let dv = 0, dt = 0
for (const r of all) {
  const o = old.find((x) => String(x.id) === String(r.id))
  const oldFail = o.failed.filter((f) => !/cwd\.test/.test(f)).length > 0
  const newFail = r.verdict === 'assertion-fails'
  if (oldFail !== newFail) { dv++; console.log('VERDICT DIFFERS', r.id, oldFail, newFail) }
  const nd = r.traces.filter((t) => JSON.stringify(t.v) !== bt[t.k]).map((t) => t.k).sort().join(',')
  const od = o.traces.filter((t) => obt[t.k] !== undefined && JSON.stringify(t.v) !== obt[t.k]).map((t) => t.k).sort().join(',')
  if (nd !== od) { dt++; console.log('TRACE-DIFF SET DIFFERS', r.id, 'old:', od || '-', 'new:', nd || '-') }
}
console.log('assertion-verdict differences', dv, '| trace-difference-set differences', dt)
console.log('assertion-fails ids:', all.filter((r) => r.verdict === 'assertion-fails').map((r) => r.id).join(','))
console.log('base traces equal first-run base (except the later-added one):', base.traces.every((t) => t.k === 'empty-due-date' || JSON.stringify(t.v) === obt[t.k]))
