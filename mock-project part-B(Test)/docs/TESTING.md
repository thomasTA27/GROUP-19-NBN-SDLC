# Testing

## Test Layers

| Layer | Command | Tool | Firebase | Description |
|-------|---------|------|----------|-------------|
| Frontend unit | `pnpm run test:component` | Vitest + Testing Library | Mocked | Utils, hooks, components |
| Backend unit | `pnpm run test` | Vitest + supertest | Mocked | Route handlers, middleware |
| All | `pnpm run test:all` | — | — | Runs all layers |

There's no local emulator, so there's no integration-test layer against a real Firestore — all tests mock Firebase and never make real network calls.

## Running Tests

```bash
# Run all tests
pnpm run test:all

# Watch mode (frontend)
pnpm --filter frontend run test:watch

# Watch mode (backend)
pnpm --filter backend run test:watch

# Coverage
pnpm --filter frontend run test:coverage
pnpm --filter backend run test:coverage
```

## What to Test

### Frontend

- **Always test:** utility functions in `src/lib/`, Zod validation schemas, custom hooks
- **Skip:** shadcn `src/components/ui/` components (not hand-authored)
- **Skip:** `src/app/` page files (test via integration or E2E)
- Firebase is always mocked via `tests/setup.ts` — never call real Firebase in unit tests

### Backend

- **Unit tests:** Each route handler tested with supertest; Firebase Admin is mocked
- Every new route created via `/add-route` skill must have at minimum: 200/201 happy path + 401 without token

## Mocking Firebase

**Frontend** (`frontend/tests/setup.ts`):
```typescript
vi.mock('@/lib/firebase/client', () => ({ auth: ..., db: {} }))
vi.mock('@/lib/firebase/admin', () => ({ adminAuth: { verifySessionCookie: vi.fn() }, ... }))
```

### Mocking `adminDb` and `runTransaction` (Server Actions)

Server Actions that write inside a transaction (the tasks `updateTask`, `setTaskStatus` and `deleteTask`) need a mock of `adminDb.runTransaction`. It must provide:

- `adminDb.collection(name)` returning an object with `doc(id)`, which returns a reference. The real Admin SDK's `doc()` does not throw for `.`, `..`, `__name__` or over-long IDs (checked against `firebase-admin`), so the mock doesn't either. The tasks request schemas refuse the IDs Firestore reserves (`.`, `..`, `__x__`, over 1,500 bytes) before the database is called, so test those at the schema or action level and assert `collection` and `runTransaction` are never called. A live Firestore rejection of an ID has not been checked; to cover an unexpected read failure, make `tx.get` reject and expect the fixed failure result.
- `adminDb.runTransaction(callback)`, which calls `callback(tx)` and returns its result. Reject or run the callback twice to test failures and SDK retries.
- `tx.get(ref)` resolving `{ exists, data: () => ... }`, and `tx.update(ref, fields)`. Assert `tx.get` is called before `tx.update` with `mock.invocationCallOrder`.

Create the mocks with `vi.hoisted` so they exist when `vi.mock` runs, and mock `requireAuth` the same way:

```typescript
const { collection, doc, requireAuth, runTransaction, tx } = vi.hoisted(() => {
  const doc = vi.fn(() => ({ path: 'tasks/ref' }))
  const tx = { get: vi.fn(), update: vi.fn() }
  return {
    collection: vi.fn(() => ({ doc })),
    doc,
    requireAuth: vi.fn(),
    runTransaction: vi.fn(async (callback: (t: typeof tx) => Promise<unknown>) => callback(tx)),
    tx,
  }
})
vi.mock('@/lib/firebase/admin', () => ({ adminDb: { collection, runTransaction }, adminAuth: {} }))
vi.mock('@/actions/auth.actions', () => ({ requireAuth }))

tx.get.mockResolvedValue({ exists: true, data: () => ({ uid: 'user-1', deletedAt: null }) })
```

See `frontend/tests/unit/features/tasks/actions/tasks.actions.test.ts` for the full version. The `Timestamp` from `firebase-admin/firestore` needs no mock; use fake timers to fix `Timestamp.now()`.

### Testing a route handler (the erasure route)

A Next.js route handler such as `frontend/src/app/api/cron/erase-deleted-tasks/route.ts` is tested like a function: import `GET`, call it with a `Request` and read the `Response`. Four things differ from a component test:

1. The frontend default test environment is `jsdom` (`frontend/vitest.config.ts`), so a route test needs the docblock `/** @vitest-environment node */` at the top of the file.
2. `frontend/tests/setup.ts` mocks `@/lib/firebase/admin` with an empty `adminDb`, so a route test mocks that module again in its own file with the calls it needs (the `vi.hoisted` pattern above).
3. Set the secret with `vi.stubEnv('CRON_SECRET', '<fake value>')` using an obviously fake value, and fix the clock with fake timers (`vi.useFakeTimers()` and `vi.setSystemTime(...)`) so the cutoff is exact.
4. `pnpm run test:component` runs the frontend tests, route tests included. `pnpm run test` runs the backend suite only.

See `frontend/tests/unit/app/api/cron/erase-deleted-tasks/route.test.ts` for a worked example. For the direct-request access points (P2) and the erasure schedule (P6), see the `tasks` collection in `docs/FIRESTORE-SCHEMA.md`.

**Backend** (`backend/tests/setup.ts`) mocks `src/lib/firebase` so the Admin SDK never initializes, and exports reusable auth mocks. Auth is injected per-app, not patched globally:

```typescript
import { createApp } from '../../../src/app'
import { mockVerifyToken, mockUser } from '../../setup'

const app = createApp({ verifyToken: mockVerifyToken })

// Authenticated request:
vi.mocked(mockVerifyToken).mockResolvedValue(mockUser)

// Unauthenticated request:
vi.mocked(mockVerifyToken).mockRejectedValue(new Error('invalid'))
```
