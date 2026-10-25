# Backend

## Overview

The backend is a **Firebase Cloud Functions v2** app using the **Express fat-lambda** pattern — a single Cloud Function (`api`) that delegates all routing to an Express app. One function to deploy, one app to test, and local development behaves exactly like production.

## Structure

```
backend/
├── src/
│   ├── index.ts              Cloud Functions entry point (exports `api`)
│   ├── app.ts                Express app factory — createApp()
│   ├── routes/
│   │   ├── index.ts          Route registry
│   │   └── health.ts         GET /api/health
│   ├── middleware/
│   │   ├── auth.ts           Firebase ID token verification → req.user
│   │   └── errorHandler.ts   Global error handler (RFC 9457 responses)
│   └── lib/
│       ├── firebase.ts       Admin SDK singleton (sole entry point)
│       ├── errors.ts         HttpError — the single error type
│       └── zodConverter.ts   Typed Firestore converter with schema versioning
└── tests/
    ├── unit/                 supertest tests (mocked Firebase)
    │   └── conventions.test.ts  Enforces the two backend rules in CI
    └── setup.ts              Vitest setup + Firebase mocks
```

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |

Add new routes with the `/add-route` Claude Code skill.

## Authentication

All routes under `/api/` (except `/api/health`) require a valid Firebase ID token:

```
Authorization: Bearer {firebase-id-token}
```

The auth middleware verifies the token and attaches the user to the request:

```typescript
const { user } = req as AuthenticatedRequest
// user.uid, user.email, user.claims
```

## Error Handling

One error type — `HttpError` from `src/lib/errors.ts`. Always pass errors to `next()`; the global `errorHandler` turns them into RFC 9457 Problem Details responses and never leaks internals:

```typescript
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await adminDb.collection('items').doc(req.params.id ?? '').get()
    if (!doc.exists) return next(HttpError.notFound('Item', req.params.id))
    res.json({ item: doc.data() })
  } catch (error) {
    next(error)  // ← unknown errors become a generic 500
  }
})
```

Available helpers: `HttpError.badRequest()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`, `.internal()`.

## Conventions (enforced in CI)

`tests/unit/conventions.test.ts` fails the build if:

1. Any file other than `src/lib/firebase.ts` imports `firebase-admin` at runtime
2. Any `src/` file contains `console.log`

## Local Development

```bash
# Watch and recompile TypeScript
pnpm --filter backend run dev
```

There's no local emulator — the backend talks to the real Firebase project configured in `backend/.env` (generated from the root `.env`).

## Deployment

```bash
pnpm --filter backend build
npx firebase-tools deploy --only functions
```

The function is deployed to `australia-southeast1`. Change the region in `src/index.ts`.
