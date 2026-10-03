import { createHash, timingSafeEqual } from 'node:crypto'
import { Timestamp } from 'firebase-admin/firestore'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase/admin'

// ADR-0001: the one place a task record is permanently erased (AC-7.3, AC-7.7).
//
// This route deliberately departs from .claude/rules/tasks.md, which does not load for this path:
// - Rule 2 (always query tasks with deletedAt == null): this job has to select DELETED tasks.
// - Rule 3 (write only in an owner-checked transaction): this job has no user, and it hard-deletes.
// The guard instead is the cron secret, the 720-hour cutoff, and the per-document re-check below.
// Rule 5 still applies: no raw error text ever leaves this route.

const RETENTION_HOURS = 720 // 30 days (R6)
// deletedAt is written by Timestamp.now() in the Server Action, so it carries the clock of whichever
// Vercel instance served the delete, while the cutoff comes from the instance running this job. If
// those clocks differ, a record can look older than it is. The margin is taken off the cutoff, so it
// only ever delays erasure: AC-7.7 holds for any skew up to 5 minutes, and 5 minutes is tiny against
// the 72 hours of slack (erased by 792 hours at the latest).
const CLOCK_SKEW_MARGIN_MS = 5 * 60 * 1000
// 16 is a floor I chose, not a documented requirement. Vercel's own guidance may suggest a similar
// floor, but that is unverified.
const MIN_SECRET_LENGTH = 16
const PAGE_SIZE = 200 // well under Firestore's 500 writes per batch
// Time budget for one run. The Hobby function time limit is unverified (ADR-0001), so this is a
// conservative guess, not a documented limit. A run that stops here reports done: false.
const TIME_BUDGET_MS = 8_000

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

// Hashing both sides first gives timingSafeEqual equal-length inputs, so the length of the secret
// cannot leak through the comparison.
function hasValidAuthorization(header: string | null, secret: string): boolean {
  return timingSafeEqual(sha256(header ?? ''), sha256(`Bearer ${secret}`))
}

// Every response goes through here, so none can miss Cache-Control: no-store.
function respond(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

function unauthorized(): Response {
  return respond({ error: 'Unauthorized' }, 401)
}

// A secret with surrounding whitespace could never match: Headers strips that padding from the
// incoming value, so erasure would silently stop. Refuse it, and anything shorter than the floor.
function isValidSecret(secret: string | undefined): secret is string {
  return secret !== undefined && secret.length >= MIN_SECRET_LENGTH && secret === secret.trim()
}

// AC-7.8: never erase a task that is not deleted. Firestore range filters are expected to skip
// null and missing fields, but that is unchecked, so every returned document is checked again here.
// Anything that is not a Timestamp strictly older than the cutoff is skipped.
function isExpired(doc: QueryDocumentSnapshot, cutoffMs: number): boolean {
  const deletedAt: unknown = doc.data().deletedAt
  return deletedAt instanceof Timestamp && deletedAt.toMillis() < cutoffMs
}

export async function GET(request: Request): Promise<Response> {
  // Read at request time and fail closed: with no valid secret set, every request is refused.
  const secret = process.env.CRON_SECRET
  if (!isValidSecret(secret)) {
    console.error('Erase deleted tasks refused: CRON_SECRET is missing or invalid')
    return unauthorized()
  }
  if (!hasValidAuthorization(request.headers.get('authorization'), secret)) {
    return unauthorized()
  }

  try {
    const startedAt = Date.now()
    const cutoffMs = startedAt - RETENTION_HOURS * 60 * 60 * 1000 - CLOCK_SKEW_MARGIN_MS
    const cutoff = Timestamp.fromMillis(cutoffMs)

    const baseQuery = adminDb
      .collection('tasks')
      .where('deletedAt', '<', cutoff)
      .orderBy('deletedAt')
      .limit(PAGE_SIZE)

    let erased = 0
    let skipped = 0
    let done = false
    let stopped: 'no-more-pages' | 'time-budget' = 'time-budget'
    let last: QueryDocumentSnapshot | undefined

    for (;;) {
      // The cursor is the last document of the previous page, skipped or not, so a skipped
      // document can never bring the same page back.
      const page = await (last ? baseQuery.startAfter(last) : baseQuery).get()
      const batch = adminDb.batch()
      let inBatch = 0
      for (const doc of page.docs) {
        if (isExpired(doc, cutoffMs)) {
          batch.delete(doc.ref)
          inBatch += 1
        } else {
          skipped += 1
        }
      }
      if (inBatch > 0) {
        await batch.commit()
        erased += inBatch
      }

      if (page.size < PAGE_SIZE) {
        done = true
        stopped = 'no-more-pages'
        break
      }
      if (Date.now() - startedAt >= TIME_BUDGET_MS) break
      last = page.docs[page.docs.length - 1]
    }

    // Counts only: no document ids and no task data.
    return respond({ erased, skipped, done, stopped })
  } catch (error) {
    console.error('Erase deleted tasks failed:', error)
    return respond({ error: 'Erasure failed' }, 500)
  }
}
