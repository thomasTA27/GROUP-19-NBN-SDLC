/** @vitest-environment node */
// DIAGNOSTIC ONLY (disposable copy). Status codes of the erasure route for secret/header combinations.
import { appendFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { baseQuery } = vi.hoisted(() => {
  const baseQuery: Record<string, unknown> = {}
  baseQuery.get = vi.fn(async () => ({ size: 0, docs: [] }))
  baseQuery.startAfter = vi.fn(() => baseQuery)
  return { baseQuery }
})
vi.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    collection: () => ({ where: () => ({ orderBy: () => ({ limit: () => baseQuery }) }) }),
    batch: () => ({ delete: vi.fn(), commit: vi.fn() }),
  },
}))
import { GET } from '@/app/api/cron/erase-deleted-tasks/route'

afterEach(() => vi.unstubAllEnvs())
const call = async (secret: string | undefined, header: string | null) => {
  if (secret === undefined) vi.stubEnv('CRON_SECRET', undefined as unknown as string)
  else vi.stubEnv('CRON_SECRET', secret)
  const headers = new Headers()
  if (header !== null) headers.set('authorization', header)
  return (await GET(new Request('http://localhost/api/cron/erase-deleted-tasks', { headers }))).status
}

describe('trace', () => {
  it('status for each secret/header combination', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const good = 'abcdefghijklmnop1234'
    const out: Record<string, number> = {}
    out['secret unset, header "Bearer undefined"'] = await call(undefined, 'Bearer undefined')
    out['secret unset, no header'] = await call(undefined, null)
    out['secret empty'] = await call('', 'Bearer ')
    out['secret short'] = await call('short', 'Bearer short')
    out['secret with space'] = await call('abcdefghijklmnop 1234', 'Bearer abcdefghijklmnop 1234')
    out['valid secret, no header'] = await call(good, null)
    out['valid secret, header "Stryker was here!"'] = await call(good, 'Stryker was here!')
    out['valid secret, wrong header'] = await call(good, 'Bearer nope')
    out['valid secret, right header'] = await call(good, `Bearer ${good}`)
    appendFileSync('diag-trace.jsonl', JSON.stringify({ k: 'route-status', v: out }) + '\n')
    expect(out['valid secret, right header']).toBe(200)
  })
})
