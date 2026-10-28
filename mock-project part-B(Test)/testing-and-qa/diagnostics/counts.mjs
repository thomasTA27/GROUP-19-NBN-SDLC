import { readFileSync } from 'node:fs'
const SP = process.argv[2]
const proj = process.argv[3]
const l = JSON.parse(readFileSync(`${SP}/vlist.json`, 'utf8'))
console.log('list entries', l.length, Object.keys(l[0]).join(','))
const by = {}
for (const t of l) {
  const f = t.file.split('\\').join('/').replace(/.*\/frontend\//, '')
  ;(by[f] = by[f] || []).push(t.name)
}
const r = JSON.parse(readFileSync(`${proj}/testing-and-qa/reports/mutation.json`, 'utf8'))
let tot = 0
for (const [f, names] of Object.entries(by)) {
  const rep = r.testFiles[f]
  const u = new Set(names).size
  tot += names.length
  console.log(f.padEnd(72), 'listed', names.length, 'unique', u, 'inJSON', rep ? rep.tests.length : '-')
  if (rep && rep.tests.length !== names.length) {
    const cnt = {}
    names.forEach((n) => (cnt[n] = (cnt[n] || 0) + 1))
    for (const [n, c] of Object.entries(cnt)) if (c > 1) console.log('   DUP x' + c + ': ' + n.slice(0, 150))
    const jn = rep.tests.map((t) => t.name)
    const jc = {}
    jn.forEach((n) => (jc[n] = (jc[n] || 0) + 1))
    console.log('   json names unique', new Set(jn).size, 'json duplicates', Object.values(jc).filter((c) => c > 1).length)
  }
}
console.log('total listed', tot)
