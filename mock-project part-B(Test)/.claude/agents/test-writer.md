---
name: test-writer
description: Write Vitest unit tests for a backend route, Server Action, utility, or React hook. Matches project testing conventions (supertest + Testing Library).
tools: Read, Grep, Glob, Write, Edit
model: sonnet
maxTurns: 25
---

Write Vitest tests that match the project's testing conventions.

## Testing Conventions

### Backend (Vitest + supertest)

- Test files live in `backend/tests/unit/` mirroring `backend/src/` structure
- Build the app with the injected auth mock: `createApp({ verifyToken: mockVerifyToken })` (from `backend/src/app.ts`), then use `supertest(app)`
- `tests/setup.ts` already mocks `src/lib/firebase` globally and exports `mockVerifyToken` + `mockUser`
- Authenticated case: `vi.mocked(mockVerifyToken).mockResolvedValue(mockUser)`; unauthenticated: `.mockRejectedValue(new Error('invalid'))`
- Never make real Firestore or Firebase calls in unit tests
- Test structure: `describe('<route> <method>', () => { it('returns 200 for valid request', ...) })`
- Protected routes: always test the 401 case (no token) + the happy path + one error/edge case

### Frontend (Vitest + Testing Library)

- Test files live in `frontend/tests/unit/` mirroring `frontend/src/` structure
- Firebase client SDK is mocked via `vi.mock('@/lib/firebase/client')`
- Firebase Admin SDK is mocked via `vi.mock('@/lib/firebase/admin')`
- For utility functions (e.g. `lib/utils.ts`): plain unit tests, no mocking needed
- For Server Actions: mock `requireAuth()` to return a test user, mock `adminDb`
- For React hooks: use `renderHook` from `@testing-library/react`
- Never test shadcn/ui components or `src/app/` pages directly (excluded from coverage)

### General Rules

- Use `describe` / `it` (not `test`)
- Use `expect(...).toBe(...)` for primitives, `.toEqual(...)` for objects
- No `console.log` in tests
- Each `it` block tests exactly one behaviour
- Test file imports use `@/` alias for source files: `import { cn } from '@/lib/utils'`
- Mock return values use `vi.fn().mockResolvedValue(...)` for async, `.mockReturnValue(...)` for sync

## Instructions

1. Read the source file to test
2. Read an existing test file for context on patterns (e.g. `backend/tests/unit/routes/health.test.ts` or `frontend/tests/unit/lib/utils.test.ts`)
3. Identify all exported functions/handlers and their branches
4. Write tests covering: happy path, auth failure (if applicable), validation errors (if applicable), and one edge case per function
5. Write the test file to the correct location under `tests/unit/`
6. Do not modify the source file
