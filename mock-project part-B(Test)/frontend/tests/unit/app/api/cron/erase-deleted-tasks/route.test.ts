/** @vitest-environment node */
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'

// A fake adminDb that records every call. Every method that could write is a spy, so the tests can
// prove the route only ever calls batch.delete and batch.commit.
const fake = vi.hoisted(() => {
  const query = {
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    create: vi.fn(),
    add: vi.fn(),
  }
  const batch = {
    delete: vi.fn(),
    commit: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    create: vi.fn(),
  }
  const collection = vi.fn(() => query)
  const newBatch = vi.fn(() => batch)
  return { query, batch, collection, newBatch }
})

vi.mock('@/lib/firebase/admin', () => ({
  adminDb: { collection: fake.collection, batch: fake.newBatch },
  adminAuth: {},
}))

import { GET } from '@/app/api/cron/erase-deleted-tasks/route'

const TEST_SECRET = 'test-only-fake-secret-value'
const URL_PATH = '/api/cron/erase-deleted-tasks'
const HOURS_720_MS = 720 * 60 * 60 * 1000
const NOW = new Date('2027-03-05T10:30:45.000Z')
// The route's cutoff is now minus 720 hours minus a 5 minute clock-skew margin. Neither constant is
// exported, so these tests repeat the numbers on purpose and should change when the route's change.
const SKEW_MARGIN_MS = 5 * 60 * 1000
const CUTOFF_MS = NOW.getTime() - HOURS_720_MS - SKEW_MARGIN_MS
// A deletedAt that is this old (in ms) at the fixed clock.
const ageOf = (ms: number) => Timestamp.fromMillis(NOW.getTime() - ms)
const CUTOFF_AGE_MS = HOURS_720_MS + SKEW_MARGIN_MS

const MISSING = Symbol('missing')

type FakeDoc = { id: string; ref: { path: string }; data: () => Record<string, unknown> }

function makeDoc(id: string, deletedAt: unknown): FakeDoc {
  return {
    id,
    ref: { path: `tasks/${id}` },
    data: () => (deletedAt === MISSING ? {} : { deletedAt }),
  }
}

const expired = (id: string) => makeDoc(id, Timestamp.fromMillis(CUTOFF_MS - 1))

function page(docs: FakeDoc[]) {
  return { docs, size: docs.length }
}

function request(authorization?: string): Request {
  const headers = new Headers()
  if (authorization !== undefined) headers.set('authorization', authorization)
  return new Request(`https://example.test${URL_PATH}`, { headers })
}

const authorized = () => request(`Bearer ${TEST_SECRET}`)

async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>
}

// The number the route passed to limit(): the page size under test.
function pageSize(): number {
  const size = fake.query.limit.mock.calls[0]?.[0]
  expect(Number.isInteger(size)).toBe(true)
  return size as number
}

// Runs the route once against an empty database to read the page size it passes to limit(), then
// clears every recorded call so the real test starts clean.
async function learnPageSize(): Promise<number> {
  await GET(authorized())
  const size = pageSize()
  for (const fn of [
    fake.query.where,
    fake.query.orderBy,
    fake.query.limit,
    fake.query.startAfter,
    fake.query.get,
    fake.collection,
    fake.newBatch,
    fake.batch.delete,
    fake.batch.commit,
  ]) {
    fn.mockClear()
  }
  return size
}

const deletedIds = () =>
  fake.batch.delete.mock.calls.map((call) => (call[0] as { path: string }).path)

function expectNoDatabaseCall() {
  expect(fake.collection).not.toHaveBeenCalled()
  expect(fake.newBatch).not.toHaveBeenCalled()
  expect(fake.query.get).not.toHaveBeenCalled()
  expect(fake.batch.delete).not.toHaveBeenCalled()
  expect(fake.batch.commit).not.toHaveBeenCalled()
}

let errorSpy: MockInstance<typeof console.error>

beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  vi.stubEnv('CRON_SECRET', TEST_SECRET)
  for (const fn of [
    ...Object.values(fake.query),
    ...Object.values(fake.batch),
    fake.collection,
    fake.newBatch,
  ]) {
    fn.mockClear()
  }
  // Set here, not when the fake is built, because restoreAllMocks clears return values.
  for (const chained of [
    fake.query.where,
    fake.query.orderBy,
    fake.query.limit,
    fake.query.startAfter,
  ]) {
    chained.mockReset().mockReturnValue(fake.query)
  }
  fake.collection.mockReset().mockReturnValue(fake.query)
  fake.newBatch.mockReset().mockReturnValue(fake.batch)
  fake.query.get.mockReset().mockResolvedValue(page([]))
  fake.batch.commit.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('authorization', () => {
  it.each([
    ['no header', undefined],
    ['a wrong secret', 'Bearer wrong-secret'],
    ['Bearer alone', 'Bearer '],
    ['Bearer undefined', 'Bearer undefined'],
    ['the right secret in the wrong case of Bearer', `bearer ${TEST_SECRET}`],
    ['the right secret in upper case Bearer', `BEARER ${TEST_SECRET}`],
    ['a different scheme with the right secret', `Basic ${TEST_SECRET}`],
    ['the bare secret with no scheme', TEST_SECRET],
    ['a prefix of the right secret', `Bearer ${TEST_SECRET.slice(0, -1)}`],
    ['a longer secret', `Bearer ${TEST_SECRET}x`],
  ])('refuses %s with 401 and makes no database call', async (_name, header) => {
    const response = await GET(request(header))
    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toEqual({ error: 'Unauthorized' })
    expectNoDatabaseCall()
  })

  it('accepts the right secret', async () => {
    const response = await GET(authorized())
    expect(response.status).toBe(200)
    expect(fake.collection).toHaveBeenCalledWith('tasks')
  })

  describe.each([
    ['unset', undefined],
    ['empty', ''],
    ['only spaces', '   '],
    ['only whitespace characters', ' \t\n '],
    ['15 characters', 'fake-secret-123'],
    ['a short value', 'x'],
    ['16+ characters with a trailing space', `${TEST_SECRET} `],
    ['16+ characters with a leading space', ` ${TEST_SECRET}`],
    ['16+ characters with a trailing newline', `${TEST_SECRET}\n`],
  ])('when CRON_SECRET is %s', (_name, value) => {
    beforeEach(() => vi.stubEnv('CRON_SECRET', value))

    it.each([
      ['no header', undefined],
      ['Bearer alone', 'Bearer '],
      ['Bearer undefined', 'Bearer undefined'],
      ['Bearer with the empty string value', 'Bearer'],
      ['Bearer with anything', 'Bearer anything-at-all'],
      // Headers strips padding, so for the padded secrets this is the exact header a caller would send.
      ['a header that matches the stubbed value', `Bearer ${value ?? ''}`],
      ['a header that matches the stubbed value, trimmed', `Bearer ${(value ?? '').trim()}`],
    ])(
      'refuses every request (%s) with 401, makes no database call and logs once',
      async (_n, header) => {
        const response = await GET(request(header))
        expect(response.status).toBe(401)
        expect(await bodyOf(response)).toEqual({ error: 'Unauthorized' })
        expectNoDatabaseCall()
        // Exactly one fixed line: no secret, no length, no header.
        expect(errorSpy.mock.calls).toEqual([
          ['Erase deleted tasks refused: CRON_SECRET is missing or invalid'],
        ])
        const logged = JSON.stringify(errorSpy.mock.calls)
        expect(logged).not.toContain('anything-at-all')
        expect(logged).not.toMatch(/Bearer/i)
        if (value !== undefined && value.trim() !== '') {
          expect(logged).not.toContain(value.trim())
        }
      }
    )
  })

  describe('a valid secret', () => {
    it('accepts exactly 16 characters with the matching header', async () => {
      vi.stubEnv('CRON_SECRET', 'fake-secret-1234')
      expect('fake-secret-1234').toHaveLength(16)
      const response = await GET(request('Bearer fake-secret-1234'))
      expect(response.status).toBe(200)
      expect(fake.collection).toHaveBeenCalledWith('tasks')
      expect(errorSpy).not.toHaveBeenCalled()
    })

    it('refuses a 16 character secret when the header carries 15 of them', async () => {
      vi.stubEnv('CRON_SECRET', 'fake-secret-1234')
      const response = await GET(request('Bearer fake-secret-123'))
      expect(response.status).toBe(401)
      expect(errorSpy).not.toHaveBeenCalled()
      expectNoDatabaseCall()
    })

    it('allows a single space inside the secret (only surrounding whitespace is refused)', async () => {
      vi.stubEnv('CRON_SECRET', 'fake secret 1234')
      expect('fake secret 1234').toHaveLength(16)
      const response = await GET(request('Bearer fake secret 1234'))
      expect(response.status).toBe(200)
      expect(fake.collection).toHaveBeenCalledWith('tasks')
    })
  })

  it('has a generic 401 body that contains neither the secret nor the header value', async () => {
    const header = 'Bearer header-value-for-this-test'
    const response = await GET(request(header))
    const text = await response.text()
    expect(response.status).toBe(401)
    expect(text).not.toContain(TEST_SECRET)
    expect(text).not.toContain('header-value-for-this-test')
    expect(JSON.parse(text)).toEqual({ error: 'Unauthorized' })
  })
})

describe('the query', () => {
  it('is exactly tasks, where deletedAt < now - 720 hours - 5 minutes, orderBy deletedAt, limit(page size)', async () => {
    await GET(authorized())

    expect(fake.collection).toHaveBeenCalledTimes(1)
    expect(fake.collection).toHaveBeenCalledWith('tasks')
    expect(fake.query.where).toHaveBeenCalledTimes(1)
    const [field, op, value] = fake.query.where.mock.calls[0] as [string, string, unknown]
    expect(field).toBe('deletedAt')
    expect(op).toBe('<')
    expect(value).toBeInstanceOf(Timestamp)
    expect((value as Timestamp).toMillis()).toBe(CUTOFF_MS)
    expect(fake.query.orderBy).toHaveBeenCalledTimes(1)
    expect(fake.query.orderBy.mock.calls[0]).toEqual(['deletedAt'])
    expect(fake.query.limit).toHaveBeenCalledTimes(1)
    expect(pageSize()).toBeGreaterThan(0)
    expect(pageSize()).toBeLessThanOrEqual(200)
    expect(fake.query.startAfter).not.toHaveBeenCalled()
  })

  it('builds the query in order and fetches it last', async () => {
    await GET(authorized())
    const order = [
      fake.collection.mock.invocationCallOrder[0]!,
      fake.query.where.mock.invocationCallOrder[0]!,
      fake.query.orderBy.mock.invocationCallOrder[0]!,
      fake.query.limit.mock.invocationCallOrder[0]!,
      fake.query.get.mock.invocationCallOrder[0]!,
    ]
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('works out the cutoff from the clock when the request arrives', async () => {
    vi.setSystemTime(new Date('2030-01-01T00:00:00.000Z'))
    await GET(authorized())
    const value = fake.query.where.mock.calls[0]![2] as Timestamp
    expect(value.toMillis()).toBe(
      new Date('2030-01-01T00:00:00.000Z').getTime() - HOURS_720_MS - SKEW_MARGIN_MS
    )
  })
})

describe('erasing', () => {
  it('deletes an expired deleted task through batch.delete(ref) and commits the batch', async () => {
    const doc = expired('a')
    fake.query.get.mockResolvedValueOnce(page([doc]))

    const response = await GET(authorized())

    expect(response.status).toBe(200)
    expect(fake.batch.delete).toHaveBeenCalledTimes(1)
    expect(fake.batch.delete.mock.calls[0]![0]).toBe(doc.ref)
    expect(fake.batch.commit).toHaveBeenCalledTimes(1)
    expect(fake.batch.delete.mock.invocationCallOrder[0]!).toBeLessThan(
      fake.batch.commit.mock.invocationCallOrder[0]!
    )
  })

  it('never updates, sets, creates or adds anything', async () => {
    fake.query.get.mockResolvedValueOnce(page([expired('a'), makeDoc('b', null)]))
    await GET(authorized())
    for (const fn of [
      fake.query.update,
      fake.query.set,
      fake.query.create,
      fake.query.add,
      fake.batch.update,
      fake.batch.set,
      fake.batch.create,
    ]) {
      expect(fn).not.toHaveBeenCalled()
    }
  })

  it('commits nothing when every document in the page is skipped', async () => {
    fake.query.get.mockResolvedValueOnce(page([makeDoc('a', null)]))
    await GET(authorized())
    expect(fake.batch.delete).not.toHaveBeenCalled()
    expect(fake.batch.commit).not.toHaveBeenCalled()
  })

  describe('re-check before each delete (AC-7.8)', () => {
    it.each([
      ['null (not deleted)', null],
      ['a missing deletedAt', MISSING],
      ['undefined', undefined],
      ['a string', '2020-01-01T00:00:00.000Z'],
      ['a number', 1_000],
      ['a Date object', new Date('2020-01-01T00:00:00.000Z')],
      [
        'a Date-like object that is not a Timestamp',
        { seconds: 1, nanoseconds: 0, toMillis: (): number => 1, toDate: (): Date => new Date(1) },
      ],
      ['a Timestamp 720 hours minus 1 ms old', ageOf(HOURS_720_MS - 1)],
      ['a Timestamp exactly 720 hours old', ageOf(HOURS_720_MS)],
      ['a Timestamp 720 hours plus 1 ms old', ageOf(HOURS_720_MS + 1)],
      ['a Timestamp 720 hours plus 4 minutes old', ageOf(HOURS_720_MS + 4 * 60 * 1000)],
      ['a Timestamp exactly 720 hours plus 5 minutes old (the cutoff)', ageOf(CUTOFF_AGE_MS)],
      ['a Timestamp the cutoff plus 1 ms', Timestamp.fromMillis(CUTOFF_MS + 1)],
      ['a Timestamp from yesterday', Timestamp.fromMillis(NOW.getTime() - 24 * 60 * 60 * 1000)],
      ['a Timestamp in the future', Timestamp.fromMillis(NOW.getTime() + 60_000)],
    ])('does not delete a returned document with %s', async (_name, deletedAt) => {
      fake.query.get.mockResolvedValueOnce(page([makeDoc('a', deletedAt)]))
      const response = await GET(authorized())
      expect(fake.batch.delete).not.toHaveBeenCalled()
      expect(fake.batch.commit).not.toHaveBeenCalled()
      expect(await bodyOf(response)).toMatchObject({ erased: 0, skipped: 1 })
    })

    it('deletes a Timestamp 720 hours plus 5 minutes plus 1 ms old', async () => {
      const doc = makeDoc('a', ageOf(CUTOFF_AGE_MS + 1))
      fake.query.get.mockResolvedValueOnce(page([doc]))
      const response = await GET(authorized())
      expect(fake.batch.delete).toHaveBeenCalledWith(doc.ref)
      expect(await bodyOf(response)).toMatchObject({ erased: 1, skipped: 0 })
    })

    it('deletes only the expired ones from a mixed page', async () => {
      fake.query.get.mockResolvedValueOnce(
        page([
          expired('old-1'),
          makeDoc('live', null),
          makeDoc('edge', Timestamp.fromMillis(CUTOFF_MS)),
          expired('old-2'),
        ])
      )
      await GET(authorized())
      expect(deletedIds()).toEqual(['tasks/old-1', 'tasks/old-2'])
    })
  })
})

describe('paging', () => {
  it('processes several pages in order, each starting after the last document of the previous page', async () => {
    const size = await learnPageSize()
    const one = Array.from({ length: size }, (_, i) => expired(`p1-${i}`))
    const two = Array.from({ length: size }, (_, i) => expired(`p2-${i}`))
    const three = [expired('p3-0'), expired('p3-1')]
    fake.query.get
      .mockResolvedValueOnce(page(one))
      .mockResolvedValueOnce(page(two))
      .mockResolvedValueOnce(page(three))

    const response = await GET(authorized())

    expect(fake.query.get).toHaveBeenCalledTimes(3)
    expect(fake.query.startAfter).toHaveBeenCalledTimes(2)
    expect(fake.query.startAfter.mock.calls[0]![0]).toBe(one[size - 1])
    expect(fake.query.startAfter.mock.calls[1]![0]).toBe(two[size - 1])
    expect(fake.batch.commit).toHaveBeenCalledTimes(3)
    expect(deletedIds()).toEqual([...one, ...two, ...three].map((d) => d.ref.path))
    expect(await bodyOf(response)).toEqual({
      erased: size * 2 + 2,
      skipped: 0,
      done: true,
      stopped: 'no-more-pages',
    })
  })

  it('uses a batch per page that stays within the Firestore limit of 500 writes', async () => {
    await GET(authorized())
    expect(pageSize()).toBeLessThanOrEqual(500)
  })

  it('stops on a page smaller than the page size without asking for another', async () => {
    fake.query.get.mockResolvedValueOnce(page([expired('a')]))
    const response = await GET(authorized())
    expect(fake.query.get).toHaveBeenCalledTimes(1)
    expect(fake.query.startAfter).not.toHaveBeenCalled()
    expect(await bodyOf(response)).toMatchObject({ done: true, stopped: 'no-more-pages' })
  })

  it('does not loop forever when a whole page is skipped', async () => {
    const size = await learnPageSize()

    // Without startAfter this fake returns the same full page of live tasks for ever. With it, the
    // cursor moves past the page and the next fetch is empty.
    const stuck = Array.from({ length: size }, (_, i) => makeDoc(`live-${i}`, null))
    let cursor: unknown
    fake.query.startAfter.mockImplementation((doc: unknown) => {
      cursor = doc
      return fake.query
    })
    fake.query.get.mockReset().mockImplementation(async () => {
      expect(fake.query.get.mock.calls.length).toBeLessThan(10)
      return cursor === undefined ? page(stuck) : page([])
    })

    const response = await GET(authorized())

    expect(fake.query.get).toHaveBeenCalledTimes(2)
    expect(fake.query.startAfter).toHaveBeenCalledTimes(1)
    expect(fake.query.startAfter.mock.calls[0]![0]).toBe(stuck[size - 1])
    expect(fake.batch.commit).not.toHaveBeenCalled()
    expect(await bodyOf(response)).toEqual({
      erased: 0,
      skipped: size,
      done: true,
      stopped: 'no-more-pages',
    })
  })

  it('stops with done false when the time budget is spent between pages', async () => {
    const size = await learnPageSize()

    const full = Array.from({ length: size }, (_, i) => expired(`t-${i}`))
    fake.query.get.mockReset().mockImplementation(async () => {
      // Ten minutes pass while this page is read, far beyond any sensible budget.
      vi.advanceTimersByTime(10 * 60 * 1000)
      if (fake.query.get.mock.calls.length > 20) {
        throw new Error('runaway: the route kept reading pages after the time budget')
      }
      return page(full)
    })

    const response = await GET(authorized())

    expect(fake.query.get).toHaveBeenCalledTimes(1)
    expect(fake.batch.commit).toHaveBeenCalledTimes(1)
    expect(await bodyOf(response)).toEqual({
      erased: size,
      skipped: 0,
      done: false,
      stopped: 'time-budget',
    })
  })
})

describe('the response', () => {
  it('says 200 with erased 0 and done true when there is nothing to erase', async () => {
    const response = await GET(authorized())
    expect(response.status).toBe(200)
    expect(await bodyOf(response)).toEqual({
      erased: 0,
      skipped: 0,
      done: true,
      stopped: 'no-more-pages',
    })
    expect(fake.batch.commit).not.toHaveBeenCalled()
  })

  it('has counts that match what was deleted and skipped, and no ids or task data', async () => {
    fake.query.get.mockResolvedValueOnce(
      page([
        expired('secret-id-1'),
        makeDoc('secret-id-2', null),
        expired('secret-id-3'),
        makeDoc('secret-id-4', MISSING),
      ])
    )
    const response = await GET(authorized())
    const text = await response.text()
    const body = JSON.parse(text) as Record<string, unknown>

    expect(body).toMatchObject({ erased: 2, skipped: 2 })
    expect(Object.keys(body).sort()).toEqual(['done', 'erased', 'skipped', 'stopped'])
    expect(deletedIds()).toHaveLength(2)
    expect(text).not.toContain('secret-id')
    expect(text).not.toContain('tasks/')
  })

  it('does no harm when it runs twice: the second run finds nothing to erase', async () => {
    fake.query.get.mockResolvedValueOnce(page([expired('a'), expired('b')]))

    const first = await bodyOf(await GET(authorized()))
    const second = await bodyOf(await GET(authorized()))

    expect(first).toMatchObject({ erased: 2, done: true })
    expect(second).toEqual({ erased: 0, skipped: 0, done: true, stopped: 'no-more-pages' })
    expect(fake.batch.delete).toHaveBeenCalledTimes(2)
    expect(fake.batch.commit).toHaveBeenCalledTimes(1)
  })
})

describe('database errors', () => {
  const RAW = 'PERMISSION_DENIED secret-detail'

  it.each([
    ['a rejected get', () => fake.query.get.mockRejectedValueOnce(new Error(RAW))],
    [
      'a rejected commit',
      () => {
        fake.query.get.mockResolvedValueOnce(page([expired('a')]))
        fake.batch.commit.mockRejectedValueOnce(new Error(RAW))
      },
    ],
  ])('returns a generic 500 and logs once for %s', async (_name, arrange) => {
    arrange()

    const response = await GET(authorized())
    const text = await response.text()

    expect(response.status).toBe(500)
    expect(JSON.parse(text)).toEqual({ error: 'Erasure failed' })
    expect(text).not.toContain('secret-detail')
    expect(text).not.toContain('PERMISSION_DENIED')
    expect(response.statusText).not.toContain('secret-detail')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0]![0]).toBe('Erase deleted tasks failed:')
    expect((errorSpy.mock.calls[0]![1] as Error).message).toBe(RAW)
  })

  it('does not log when the request is refused for a wrong secret', async () => {
    await GET(request('Bearer wrong-secret'))
    expect(errorSpy).not.toHaveBeenCalled()
  })
})

describe('frontend/vercel.json', () => {
  // Vitest runs from frontend/, the package root.
  const raw = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf-8')

  it('parses and has exactly one cron with the erasure path and the daily 16:00 UTC schedule', () => {
    const config = JSON.parse(raw) as { crons?: { path: string; schedule: string }[] }
    expect(Object.keys(config)).toEqual(['crons'])
    expect(config.crons).toHaveLength(1)
    expect(config.crons![0]).toEqual({ path: URL_PATH, schedule: '0 16 * * *' })
  })

  it('points at a real route folder under src/app/api', () => {
    const config = JSON.parse(raw) as { crons: { path: string }[] }
    const folder = resolve(process.cwd(), 'src/app', config.crons[0]!.path.replace(/^\//, ''))
    expect(statSync(folder).isDirectory()).toBe(true)
    expect(statSync(resolve(folder, 'route.ts')).isFile()).toBe(true)
  })
})

// ---------------------------------------------------------------------------------------------
// Correction 1: boundaries, partial failures, odd headers and secret placement.
// ---------------------------------------------------------------------------------------------

describe('the stop rule boundary', () => {
  it('asks for one more page after a full page of expired documents, then stops on the empty one', async () => {
    const size = await learnPageSize()
    const full = Array.from({ length: size }, (_, i) => expired(`full-${i}`))
    fake.query.get.mockResolvedValueOnce(page(full)).mockResolvedValueOnce(page([]))

    const response = await GET(authorized())

    expect(fake.query.get).toHaveBeenCalledTimes(2)
    expect(fake.batch.commit).toHaveBeenCalledTimes(1)
    expect(await bodyOf(response)).toEqual({
      erased: size,
      skipped: 0,
      done: true,
      stopped: 'no-more-pages',
    })
  })
})

describe('a failure after page 1 was committed', () => {
  const RAW = 'UNAVAILABLE secret-detail-page-2'

  it('returns the generic 500 and logs once when page 2 cannot be read; page 1 stays deleted', async () => {
    const size = await learnPageSize()
    const one = Array.from({ length: size }, (_, i) => expired(`p1-${i}`))
    fake.query.get.mockResolvedValueOnce(page(one)).mockRejectedValueOnce(new Error(RAW))

    const response = await GET(authorized())
    const text = await response.text()

    expect(response.status).toBe(500)
    expect(JSON.parse(text)).toEqual({ error: 'Erasure failed' })
    expect(text).not.toContain('secret-detail')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(fake.batch.commit).toHaveBeenCalledTimes(1)
    expect(deletedIds()).toEqual(one.map((d) => d.ref.path))
    expect(fake.query.get).toHaveBeenCalledTimes(2)
  })

  it('returns the generic 500 and logs once when the commit of page 2 rejects', async () => {
    const size = await learnPageSize()
    const one = Array.from({ length: size }, (_, i) => expired(`p1-${i}`))
    const two = [expired('p2-0'), expired('p2-1')]
    fake.query.get.mockResolvedValueOnce(page(one)).mockResolvedValueOnce(page(two))
    let committed = 0
    fake.batch.commit.mockReset().mockImplementation(async () => {
      if (fake.batch.commit.mock.calls.length === 2) throw new Error(RAW)
      committed += 1
    })

    const response = await GET(authorized())
    const text = await response.text()

    expect(response.status).toBe(500)
    expect(JSON.parse(text)).toEqual({ error: 'Erasure failed' })
    expect(text).not.toContain('secret-detail')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    // Page 2's documents were passed to delete, but only page 1's commit succeeded.
    expect(deletedIds()).toEqual([...one, ...two].map((d) => d.ref.path))
    expect(fake.batch.commit).toHaveBeenCalledTimes(2)
    expect(committed).toBe(1)
    expect(fake.query.get).toHaveBeenCalledTimes(2)
  })
})

describe('Authorization headers that must be refused', () => {
  // Whitespace inside the value is part of the value, so these are refused. (Whitespace around the
  // value is different: see the next describe.)
  it.each([
    ['two spaces after Bearer', `Bearer  ${TEST_SECRET}`],
    ['a tab after Bearer', `Bearer\t${TEST_SECRET}`],
    [
      'the right value repeated and joined by a comma',
      `Bearer ${TEST_SECRET}, Bearer ${TEST_SECRET}`,
    ],
    [
      'the right value repeated with no space after the comma',
      `Bearer ${TEST_SECRET},Bearer ${TEST_SECRET}`,
    ],
  ])('refuses %s', async (_name, header) => {
    const response = await GET(request(header))
    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toEqual({ error: 'Unauthorized' })
    expectNoDatabaseCall()
  })
})

describe('whitespace around the Authorization value', () => {
  // The Fetch spec and HTTP treat whitespace around a header value as padding, not part of the
  // value, and the Headers class strips it when the value is set. These tests record that Headers
  // behaviour. They are not a rule of the route. A newline inside a value cannot be set at all
  // (Headers throws a TypeError), so there is no row for it.
  it.each([
    ['a leading space', ` Bearer ${TEST_SECRET}`],
    ['a trailing space', `Bearer ${TEST_SECRET} `],
    ['a leading and a trailing space', ` Bearer ${TEST_SECRET} `],
  ])('still authenticates the right secret with %s', async (_name, header) => {
    const response = await GET(request(header))
    expect(response.status).toBe(200)
    expect(fake.query.get).toHaveBeenCalledTimes(1)
  })

  it('does not let the stripping hide a wrong value: padded wrong secret is 401', async () => {
    const response = await GET(request(' Bearer wrong-secret '))
    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toEqual({ error: 'Unauthorized' })
    expectNoDatabaseCall()
  })

  it('cannot set a newline inside the value: Headers throws', () => {
    expect(() => request(`Bearer ${TEST_SECRET}\nx`)).toThrow(TypeError)
  })
})

describe('the secret in the wrong place', () => {
  it.each([
    ['?secret=', `${URL_PATH}?secret=${TEST_SECRET}`],
    ['?CRON_SECRET=', `${URL_PATH}?CRON_SECRET=${TEST_SECRET}`],
    ['?authorization=', `${URL_PATH}?authorization=Bearer%20${TEST_SECRET}`],
  ])('is refused in the query string (%s) with no Authorization header', async (_name, path) => {
    const response = await GET(new Request(`https://example.test${path}`))
    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toEqual({ error: 'Unauthorized' })
    expectNoDatabaseCall()
  })

  it.each([
    ['x-cron-secret', TEST_SECRET],
    ['x-cron-secret', `Bearer ${TEST_SECRET}`],
    ['x-vercel-cron-secret', TEST_SECRET],
    ['x-vercel-cron-secret', `Bearer ${TEST_SECRET}`],
  ])('is refused in the %s header with no Authorization header', async (name, value) => {
    const response = await GET(
      new Request(`https://example.test${URL_PATH}`, { headers: { [name]: value } })
    )
    expect(response.status).toBe(401)
    expect(await bodyOf(response)).toEqual({ error: 'Unauthorized' })
    expectNoDatabaseCall()
  })
})

describe('the time budget boundary', () => {
  // 8 seconds is the route's TIME_BUDGET_MS. It is not exported, so this test repeats the number.
  // It is meant to change when that constant changes.
  const TIME_BUDGET_MS = 8_000

  async function runWithPageTaking(ms: number) {
    const size = await learnPageSize()
    const full = Array.from({ length: size }, (_, i) => expired(`b-${i}`))
    let calls = 0
    fake.query.get.mockReset().mockImplementation(async () => {
      calls += 1
      if (calls > 1) return page([])
      vi.advanceTimersByTime(ms)
      return page(full)
    })
    const response = await GET(authorized())
    return { size, body: await bodyOf(response) }
  }

  it('asks for another page when the first one took 7,999 ms', async () => {
    const { size, body } = await runWithPageTaking(TIME_BUDGET_MS - 1)
    expect(fake.query.get).toHaveBeenCalledTimes(2)
    expect(body).toEqual({ erased: size, skipped: 0, done: true, stopped: 'no-more-pages' })
  })

  it('stops with done false when the first page took exactly 8,000 ms', async () => {
    const { size, body } = await runWithPageTaking(TIME_BUDGET_MS)
    expect(fake.query.get).toHaveBeenCalledTimes(1)
    expect(body).toEqual({ erased: size, skipped: 0, done: false, stopped: 'time-budget' })
  })
})

describe('skipped documents and the paging cursor', () => {
  it('keeps paging past a skipped document in the middle of a full page', async () => {
    const size = await learnPageSize()
    const one = Array.from({ length: size }, (_, i) =>
      i === 5 ? makeDoc('live-mid', null) : expired(`p1-${i}`)
    )
    fake.query.get.mockResolvedValueOnce(page(one)).mockResolvedValueOnce(page([expired('p2-0')]))

    const response = await GET(authorized())

    expect(fake.query.get).toHaveBeenCalledTimes(2)
    expect(deletedIds()).not.toContain('tasks/live-mid')
    expect(deletedIds()).toHaveLength(size)
    expect(await bodyOf(response)).toEqual({
      erased: size,
      skipped: 1,
      done: true,
      stopped: 'no-more-pages',
    })
  })

  it('uses the last returned document as the cursor even when that document is skipped', async () => {
    const size = await learnPageSize()
    const lastSkipped = makeDoc('live-last', null)
    const one = [...Array.from({ length: size - 1 }, (_, i) => expired(`p1-${i}`)), lastSkipped]
    fake.query.get.mockResolvedValueOnce(page(one)).mockResolvedValueOnce(page([]))

    await GET(authorized())

    expect(fake.query.startAfter).toHaveBeenCalledTimes(1)
    expect(fake.query.startAfter.mock.calls[0]![0]).toBe(lastSkipped)
    expect(deletedIds()).not.toContain('tasks/live-last')
  })
})

describe('counts across pages', () => {
  it('adds deleted and skipped counts over two mixed pages and returns exactly four keys', async () => {
    const size = await learnPageSize()
    const one = Array.from({ length: size }, (_, i) =>
      i < 3 ? makeDoc(`live-${i}`, null) : expired(`p1-${i}`)
    )
    const two = [expired('p2-0'), makeDoc('edge', Timestamp.fromMillis(CUTOFF_MS)), expired('p2-2')]
    fake.query.get.mockResolvedValueOnce(page(one)).mockResolvedValueOnce(page(two))

    const response = await GET(authorized())
    const body = await bodyOf(response)

    expect(body).toEqual({
      erased: size - 3 + 2,
      skipped: 3 + 1,
      done: true,
      stopped: 'no-more-pages',
    })
    expect(Object.keys(body).sort()).toEqual(['done', 'erased', 'skipped', 'stopped'])
    expect(deletedIds()).toHaveLength(size - 3 + 2)
    expect(fake.batch.commit).toHaveBeenCalledTimes(2)
  })
})

describe('batches', () => {
  it('creates a new batch for each page that is processed', async () => {
    const size = await learnPageSize()
    const one = Array.from({ length: size }, (_, i) => expired(`p1-${i}`))
    const two = Array.from({ length: size }, (_, i) => expired(`p2-${i}`))
    const three = [expired('p3-0')]
    fake.query.get
      .mockResolvedValueOnce(page(one))
      .mockResolvedValueOnce(page(two))
      .mockResolvedValueOnce(page(three))

    await GET(authorized())

    expect(fake.newBatch).toHaveBeenCalledTimes(3)
    expect(fake.batch.commit).toHaveBeenCalledTimes(3)
    expect(fake.batch.delete).toHaveBeenCalledTimes(size * 2 + 1)
  })
})

describe('Cache-Control: no-store', () => {
  const NO_STORE = 'no-store'

  it('is on a 401 from a wrong secret', async () => {
    const response = await GET(request('Bearer wrong-secret'))
    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toBe(NO_STORE)
  })

  it('is on a 401 from an invalid secret', async () => {
    vi.stubEnv('CRON_SECRET', 'short')
    const response = await GET(request('Bearer short'))
    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toBe(NO_STORE)
  })

  it('is on a 200 with nothing to erase', async () => {
    const response = await GET(authorized())
    expect(response.status).toBe(200)
    expect(await bodyOf(response)).toMatchObject({ erased: 0 })
    expect(response.headers.get('cache-control')).toBe(NO_STORE)
  })

  it('is on a 200 with deletes', async () => {
    fake.query.get.mockResolvedValueOnce(page([expired('a')]))
    const response = await GET(authorized())
    expect(response.status).toBe(200)
    expect(await bodyOf(response)).toMatchObject({ erased: 1 })
    expect(response.headers.get('cache-control')).toBe(NO_STORE)
  })

  it('is on the 500', async () => {
    fake.query.get.mockRejectedValueOnce(new Error('PERMISSION_DENIED secret-detail'))
    const response = await GET(authorized())
    expect(response.status).toBe(500)
    expect(response.headers.get('cache-control')).toBe(NO_STORE)
  })
})
