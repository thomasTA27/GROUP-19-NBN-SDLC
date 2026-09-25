---
description: Add a new HTTP route to the Cloud Functions Express backend with auth middleware and unit tests. Use when adding a new API endpoint.
argument-hint: "[METHOD /path e.g. GET /users/:id]"
---

# Skill: /add-route

Add a new HTTP route to the Cloud Functions Express backend (`backend/` package).

## Step 1 — Gather requirements

Ask the user:
1. **Route path** (e.g., `/invoices`, `/users/:id/export`)
2. **HTTP method(s)** — GET, POST, PUT, PATCH, DELETE
3. **Auth required?** — all routes under `/api/` are protected by the auth middleware by default (only `/api/health` is public)
4. **What it does** — brief description of the business logic
5. **Firestore collections involved**

## Step 2 — Files to create/update

### Create `backend/src/routes/{route-name}.ts`

```typescript
import { Router, type Router as ExpressRouter } from 'express'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { AuthenticatedRequest } from '../middleware/auth'
import { HttpError } from '../lib/errors'
import { adminDb } from '../lib/firebase'

const router: ExpressRouter = Router()

const create{RouteName}Schema = z
  .object({
    // define input shape here
  })
  .strict()

/**
 * GET /api/{route-name}
 * Description of what this does.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest
    // ... business logic using adminDb, scoped to user.uid
    res.json({ data: [] })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/{route-name}
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req as AuthenticatedRequest

    const parsed = create{RouteName}Schema.safeParse(req.body)
    if (!parsed.success) {
      return next(HttpError.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input'))
    }

    const ref = adminDb.collection('{route-name}').doc()
    await ref.set({ ...parsed.data, uid: user.uid, _schemaVersion: 1 })

    res.status(201).json({ id: ref.id })
  } catch (err) {
    next(err)
  }
})

export { router as {routeName}Router }
```

### Update `backend/src/routes/index.ts`

```typescript
import { {routeName}Router } from './{route-name}'
router.use('/{route-name}', {routeName}Router)
```

### Create `backend/tests/unit/routes/{route-name}.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../../src/app'
import { mockVerifyToken, mockUser } from '../../setup'

const app = createApp({ verifyToken: mockVerifyToken })

describe('{RouteName} routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/{route-name}', () => {
    it('returns 401 without a token', async () => {
      vi.mocked(mockVerifyToken).mockRejectedValue(new Error('invalid'))
      const res = await request(app).get('/api/{route-name}')
      expect(res.status).toBe(401)
    })

    it('returns 200 for authenticated request', async () => {
      vi.mocked(mockVerifyToken).mockResolvedValue(mockUser)
      const res = await request(app)
        .get('/api/{route-name}')
        .set('Authorization', 'Bearer fake-token')
      expect(res.status).toBe(200)
    })
  })
})
```

## Checklist

- [ ] Router exported and mounted in `src/routes/index.ts`
- [ ] Uses `(req as AuthenticatedRequest).user` for the authed user
- [ ] `req.body` validated with Zod (`.strict()`) before use
- [ ] Errors propagated via `next(...)` using `HttpError` helpers — never inline `res.status(500)`
- [ ] Firebase Admin imported from `lib/firebase` (never `firebase-admin` directly — the conventions test enforces this)
- [ ] Documents include `_schemaVersion: 1` on creation
- [ ] Unit test created with at least: 200/201 happy path, 401 without token
