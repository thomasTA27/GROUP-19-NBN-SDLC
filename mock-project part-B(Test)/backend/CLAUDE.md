# Backend — Claude Instructions

Loaded automatically when editing files in `backend/`. Supplements root `CLAUDE.md`.

---

## Structure

A single Cloud Function (`api`) runs one Express app — the "fat lambda" pattern.

```
backend/src/
├── index.ts                  # Cloud Function entry — exports `api` via onRequest()
├── app.ts                    # Express app factory — createApp()
├── lib/
│   ├── firebase.ts           # Firebase Admin singleton — sole entry point for the Admin SDK
│   ├── errors.ts             # HttpError — the single error type (RFC 9457 responses)
│   └── zodConverter.ts       # Typed Firestore converter with _schemaVersion + lazy migration
├── middleware/
│   ├── auth.ts               # Token verification → attaches req.user
│   └── errorHandler.ts       # Renders every error as { type, title, status, detail }
└── routes/
    ├── index.ts              # Route registry — mount new routers here
    └── health.ts             # GET /api/health — public, no auth
```

Two rules, enforced by `tests/unit/conventions.test.ts` in CI:

1. **Firebase Admin is imported only via `lib/firebase.ts`** — never from `firebase-admin` directly (type-only imports are fine)
2. **No `console.log` in `src/`** — use `console.error`/`console.warn` for real logging

---

## Route Handler Pattern

```typescript
import { Router, type Router as ExpressRouter } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { AuthenticatedRequest } from '../middleware/auth'
import { HttpError } from '../lib/errors'
import { adminDb } from '../lib/firebase'

const router: ExpressRouter = Router()

const createItemSchema = z
  .object({
    title: z.string().min(1).max(200),
  })
  .strict()

// GET /api/items/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest
    const { id } = req.params

    const doc = await adminDb.collection('items').doc(id ?? '').get()
    if (!doc.exists) {
      return next(HttpError.notFound('Item', id))
    }
    if (doc.data()?.uid !== user.uid) {
      return next(HttpError.forbidden())
    }

    res.json({ item: doc.data() })
  } catch (err) {
    next(err)
  }
})

// POST /api/items
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest

    const parsed = createItemSchema.safeParse(req.body)
    if (!parsed.success) {
      return next(HttpError.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input'))
    }

    const ref = adminDb.collection('items').doc()
    await ref.set({ ...parsed.data, uid: user.uid, _schemaVersion: 1 })

    res.status(201).json({ id: ref.id })
  } catch (err) {
    next(err)
  }
})

export { router as itemsRouter }
```

**Rules:**
- Access the authed user via `(req as AuthenticatedRequest).user` — `{ uid, email, claims }`
- Always validate `req.body` with Zod (`.strict()` to reject unknown fields) before use
- Errors go through `next(...)` — never `res.status(500).json(...)` inline
- Use the `HttpError` static helpers: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `internal`
- New documents include `_schemaVersion: 1`

---

## Error Handling

One error type: `HttpError` (`lib/errors.ts`). The `errorHandler` middleware renders it as an RFC 9457 Problem Details response; anything that isn't an `HttpError` becomes a generic 500 (internals never leak to the client).

```typescript
next(HttpError.notFound('User', uid))   // → 404
next(HttpError.forbidden())             // → 403
next(HttpError.badRequest('Bad input')) // → 400
```

**Response format:**
```json
{
  "type": "https://httpstatuses.io/404",
  "title": "Not Found",
  "status": 404,
  "detail": "User 'abc123' not found"
}
```

---

## Auth Middleware

`createApp()` wires the auth middleware for everything under `/api` except `/api/health`. It expects `Authorization: Bearer <Firebase ID token>` and attaches the user:

```typescript
const { user } = req as AuthenticatedRequest
// user.uid    — Firebase UID
// user.email  — email (may be undefined)
// user.claims — full decoded token claims
```

Token verification is injectable for tests: `createApp({ verifyToken: mockVerifyToken })`. Public endpoints must be registered before the auth middleware in `app.ts`.

---

## Firestore Zod Converter

Use `createZodConverter()` for typed collection access with schema validation and lazy migration:

```typescript
import { z } from 'zod'
import { createZodConverter } from '../lib/zodConverter'
import { adminDb } from '../lib/firebase'

const userSchema = z.object({
  uid: z.string(),
  email: z.string(),
  role: z.enum(['user', 'admin']),
  _schemaVersion: z.literal(1),
})
type User = z.infer<typeof userSchema>

const userConverter = createZodConverter(userSchema, 1)

// Typed read:
const ref = adminDb.collection('users').doc(uid).withConverter(userConverter)
const snap = await ref.get()
const user = snap.data() // User | undefined — fully typed
```

---

## Testing

**Unit tests** — `tests/unit/` — inject `mockVerifyToken` via `createApp()`:

```typescript
import { createApp } from '../../../src/app'
import { mockVerifyToken, mockUser } from '../../setup'
import { vi } from 'vitest'

const app = createApp({ verifyToken: mockVerifyToken })

// Simulate authenticated request:
vi.mocked(mockVerifyToken).mockResolvedValue(mockUser)

// Simulate unauthenticated:
vi.mocked(mockVerifyToken).mockRejectedValue(new Error('invalid'))
```

`tests/setup.ts` also mocks `src/lib/firebase` so the Admin SDK never initializes in unit tests.

---

## Registering a New Route

1. Create `src/routes/{name}.ts` — export `{name}Router`
2. Import and mount in `src/routes/index.ts`:
   ```typescript
   import { {name}Router } from './{name}'
   router.use('/{name}', {name}Router)
   ```
3. Write unit tests in `tests/unit/routes/{name}.test.ts`
4. Use the `/add-route` skill to scaffold the boilerplate

---

## Firebase Admin SDK

Only import from `lib/firebase` — never directly from `firebase-admin`:

```typescript
import { adminDb, adminAuth } from '../lib/firebase'
```

The conventions test fails CI if any other file imports `firebase-admin` at runtime.
