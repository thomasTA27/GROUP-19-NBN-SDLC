# CLAUDE.md — Garage Boilerplate

This file provides full context for Claude Code. Read it before making any changes.
Client projects that fork this repo should update this file with their own project details.

---

## Project Overview

**Type:** Streamlined boilerplate for student capstone projects.
**Purpose:** Zero-friction foundation for Next.js + Firebase web applications. No Docker, no local emulator, no paid Firebase plan required — `pnpm install` plus a free Firebase project (Spark plan) is enough to run the app.

New to the repo? Read `docs/GUIDE.md` — it walks through building a feature end-to-end.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 — strict mode |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| UI components | Raw Tailwind (shadcn can be added per project) |
| Backend | Firebase Cloud Functions v2 (Express fat-lambda) |
| Database | Firestore |
| Auth | Firebase Authentication |
| Package manager | pnpm workspaces — **always use pnpm, never npm or yarn** |
| Testing | Vitest + Testing Library (frontend) · Vitest + supertest (backend) |
| Git hooks | Lefthook (commit-msg: Conventional Commits · pre-commit: lint + format) |
| CI/CD | GitHub Actions |

---

## Repository Structure

```
/
├── frontend/          Next.js 16 App Router (deploys to Vercel)
├── backend/           Cloud Functions v2 Express fat-lambda
├── firebase/          Firestore rules, indexes
├── docs/              Architecture and conventions docs (start with GUIDE.md)
├── scripts/           Utility scripts (bootstrap, validate-placeholders, migrations)
└── .claude/           Claude Code harness (agents, skills, MCP, settings, hooks)
```

**Nested instructions** are loaded automatically when editing files in a package:
- `frontend/CLAUDE.md` — Next.js 16, App Router, Server Components, auth flow, design reference
- `backend/CLAUDE.md` — Express fat-lambda, route pattern, error handling, testing

---

## Codebase Map — read this instead of exploring

Everything a feature build needs already exists below. **Do not survey the codebase before implementing** — consult this map, then Read only the files you will edit. A complete worked example (every file of a real feature, verified) is in `docs/TUTORIAL-WALKTHROUGH.md`.

### Frontend building blocks

| File | Exports | Use for |
|------|---------|---------|
| `frontend/src/actions/auth.actions.ts` | `requireAuth()` (redirects if unauthed, returns session with `.uid`), `getServerSession()`, `serverSignOut()` | First line of every Server Action / protected page |
| `frontend/src/lib/firebase/admin.ts` | `adminAuth`, `adminDb` (lazy, `server-only`) | All server-side Firebase |
| `frontend/src/lib/firebase/client.ts` | `getClientApp/Auth/Db()` | Browser SDK (Client Components only) |
| `frontend/src/lib/firebase/firestore.ts` | `getUsersCollection()`, `userDoc(uid)` — add new collections here as `get{X}Collection()` functions (`typedCollection` is module-private) | Typed collection access |
| `frontend/src/lib/firebase/auth.ts` | `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle`, `signOut`, `resetPassword`, `getIdToken` | Client sign-in flows |
| `frontend/src/hooks/useFirestore.ts` | `useCollection(ref, ...constraints)` → `{ data, loading, error }` (onSnapshot) | Realtime lists in Client Components |
| `frontend/src/hooks/useAuth.ts` | `useAuth()` → `{ user, profile, ... }` (AuthContext) | Current user in Client Components |
| `frontend/src/types/index.ts` | `ActionResult<T>` `{ success, error?, data? }` + re-exports of `types/auth.ts`, `types/firestore.ts` | Return type of every Server Action |
| `frontend/src/types/firestore.ts` | `UserProfile` — add new collection interfaces here (always with `_schemaVersion: 1`) | Collection types |
| `frontend/src/lib/validations/` | `loginSchema`, `signupSchema`, `registerSchema`, `resetPasswordSchema` (`auth.ts`) · `idSchema`, `paginationSchema` (`common.ts`) | Zod schemas — add feature schemas here or in the feature folder |
| `frontend/src/lib/utils.ts` | `cn()`, `formatDate`, `formatDatetime`, `truncate` | Class merging, formatting |
| `frontend/src/components/layout/` | `DashboardShell`, `Sidebar` (navItems array — add links here), `Navbar`, `PageHeader` | App shell |
| `frontend/src/components/shared/` | `ErrorBoundary`, `LoadingSpinner`, `FullPageSpinner`, `EmptyState { title, description?, icon?, action? }` | Loading/empty/error states |
| `frontend/src/app/api/auth/session/route.ts` | POST (token → `__session` cookie), DELETE | Already wired — don't touch for features |

### Backend building blocks

| File | Exports | Use for |
|------|---------|---------|
| `backend/src/app.ts` | `createApp({ verifyToken? })` | Composition; tests inject mock auth |
| `backend/src/middleware/auth.ts` | `AuthenticatedRequest` (`.user` = `AuthUser { uid, email, claims }`), `VerifyToken`, `verifyFirebaseToken` | Authed user in routes |
| `backend/src/lib/errors.ts` | `HttpError` + statics `badRequest/unauthorized/forbidden/notFound/conflict/internal` | All route errors, via `next(...)` |
| `backend/src/lib/firebase.ts` | `adminAuth`, `adminDb` | Sole Firebase Admin entry (CI-enforced) |
| `backend/src/lib/zodConverter.ts` | `createZodConverter(schema, version, migrate?)` | Typed Firestore reads with `_schemaVersion` |
| `backend/src/routes/index.ts` | `apiRouter` — mount new routers here | Route registry |
| `backend/tests/setup.ts` | `mockVerifyToken`, `mockUser` | Route unit tests (mocked Firebase Admin — no real Firebase calls) |

### Firestore rules helpers (`firebase/firestore.rules`)

`isAuthenticated()` · `isOwner(uid)` · `isAdmin()` (Firestore read) · `hasCustomClaim(claim)` (no read) · `notDeleted()`

### Existing routes/pages

Pages: `/` · `/auth/signin` · `/auth/signup` · `/dashboard` · `/profile` · `/settings` (route groups `(auth)`, `(dashboard)`). Backend: `GET /api/health` (public); everything else under `/api` requires `Authorization: Bearer <ID token>`.

---

## MCP Servers

Run `/mcp` in Claude Code to view and configure. Three servers are pre-configured:

| Server | Purpose | Setup |
|--------|---------|-------|
| **context7** | Up-to-date library docs (Next.js, Firebase, Tailwind, etc.) | No auth needed |
| **firebase** | 30+ Firebase tools — deploy rules, query Firestore, manage auth users | Run `firebase login` |
| **stitch** | Google Stitch design-to-code — fetch design tokens, screen code from Stitch projects | Set `STITCH_API_KEY` in `.env` |

**Usage tips:**
- Say "use context7" when asking about library APIs to get current docs
- Use the Firebase MCP to inspect Firestore data or deploy rules without leaving Claude Code
- Use the Stitch MCP to import UI designs: "fetch the design tokens from my Stitch project"

---

## Sub-agents

Sub-agents run in their own isolated context with a tailored system prompt. Claude delegates to them automatically, or you can invoke them by name:

| Agent | Description | Model |
|-------|-------------|-------|
| `doc-auditor` | Audits skills, docs, and CLAUDE.md for drift against the actual codebase. Use before a PR or after a major refactor. | Opus |
| `security-reviewer` | Audits staged changes for auth, input validation, Firestore rules, secret handling, and architecture violations. Use before opening a PR. | Opus |
| `test-writer` | Writes Vitest unit tests for a given file matching project conventions (supertest for backend, Testing Library for frontend). | Sonnet |

**Usage examples:**
- "Use the security-reviewer agent to audit my staged changes before I open this PR"
- "Use the doc-auditor agent to check if the skills are still accurate"
- "Use the test-writer agent to write tests for `backend/src/routes/health.ts`"

---

## Available Skills

Run these with `/skill-name` in Claude Code:

**Setup**

| Skill | Description |
|-------|-------------|
| `/bootstrap` | Full local setup: prerequisites → install → .env (walks you through creating a free Firebase project) → dev server → auth smoke test |

**Scaffolding**

| Skill | Description |
|-------|-------------|
| `/new-feature` | Scaffold a feature module (types, hook, Server Actions, component) |
| `/new-page` | Create a Next.js App Router page in the correct route group |
| `/new-component` | Create a React component (Server or Client) with typed props |
| `/firebase-collection` | Add a typed Firestore collection (type + rules + hook + docs) |
| `/add-auth-provider` | Add an OAuth provider (Firebase config + sign-in button) |
| `/add-route` | Add a Cloud Functions Express route with tests |
| `/evolve-schema` | Safely evolve a Firestore collection schema |
| `/add-env-var` | Add an env var consistently across packages and docs |

**Quality & verification**

| Skill | Description |
|-------|-------------|
| `/verify` | Full pipeline: lint → typecheck → test → console.log scan → READY/NOT READY verdict |
| `/checkpoint create\|verify\|list [name]` | Mark stable milestones, compare against them later |
| `/save-session [name]` | Save session state (8-section format) to `.claude/sessions/` |
| `/resume-session [name]` | Load a saved session and resume from exact stopping point |

**Git workflow**

| Skill | Description |
|-------|-------------|
| `/git-feature` | Create `feature/*` branch from `main` + draft PR back to `main` |
| `/git-hotfix` | Create `hotfix/*` branch from `main` + PR back to `main` |
| `/git-release` | Tag the current `main` as a milestone/submission checkpoint |

---

## Agent Permissions

**CAN do autonomously:**
- Create feature branches from `main` and commit/push to them
- Create draft PRs targeting `main`
- Read, edit, and create files within the repo
- Run `pnpm` commands (lint, typecheck, test, build)
- Use MCP tools (context7, firebase, stitch)

**CANNOT do without explicit user approval:**
- Merge or close PRs
- Push to `main` directly
- Delete branches
- Deploy to production (`firebase deploy`)
- Modify CI/CD workflow files

---

## Critical Conventions

### Package manager
Always use `pnpm`. Run commands as:
- `pnpm install` (not `npm install`)
- `pnpm --filter frontend add {package}`
- `pnpm --filter backend add {package}`
- `pnpm -r lint` (run across all packages)

### TypeScript
- Strict mode is on. **Never use `any`** — use `unknown` and narrow.
- `noUncheckedIndexedAccess` is on — array index access returns `T | undefined`.
- Use `type` imports: `import type { Foo } from '...'`
- The `@/` alias maps to `frontend/src/`. Always use it — never relative paths more than one level deep.

### React / Next.js
- **Server Components by default** — all files in `app/` are Server Components unless `'use client'` is at the top.
- Add `'use client'` only when you actually need: React hooks, event handlers, or browser APIs.
- Never import `firebase/auth` or `firebase/firestore` in a Server Component — these are client-only SDKs.
- For server-side Firebase, always use `@/lib/firebase/admin` (imports `server-only`).
- Server Actions return `ActionResult<T>`: `{ success: boolean, error?: string, data?: T }`.
- Use `sonner` (`toast` from `sonner`) for all user-facing notifications.

### Firestore
- Every collection has a typed collection export in `frontend/src/lib/firebase/firestore.ts`.
- Every collection has security rules in `firebase/firestore.rules`.
- Every collection is documented in `docs/FIRESTORE-SCHEMA.md`.
- Always call `requireAuth()` in Server Actions before any Firestore operation.
- Use the soft-delete pattern (add `deletedAt: Timestamp`) instead of hard deletes.

### Backend (Cloud Functions)
- All routes under `/api/` (except `/api/health`) are protected by the auth middleware — it verifies the Firebase ID token.
- Access the authenticated user via `(req as AuthenticatedRequest).user` — `{ uid, email, claims }`.
- Error handling: pass `HttpError` (from `src/lib/errors.ts`) to `next()` — never inline `res.status(500)`.
- Import Firebase Admin only from `src/lib/firebase.ts` — enforced by the conventions test.
- Unit tests use supertest + mocked Firebase Admin (no real Firebase calls).

### Git
- Branch from `main` for everything (`feature/*`, `hotfix/*`). Never commit directly to `main`.
- Commit messages must follow Conventional Commits — enforced by the `commit-msg` hook.
- Use `/git-feature`, `/git-hotfix`, `/git-release` skills for branch management.

### Harness integrity
- When you change a code pattern that is documented in `.claude/skills/` or `docs/`, update those files in the same session — never let them drift.
- When you add or move a core export (lib, hooks, middleware), update the **Codebase Map** section above in the same session — it is what keeps future sessions from re-exploring the repo. The `doc-auditor` agent checks it for drift.
- Skills and agents must discover files dynamically using `Glob` or `Grep` — never hardcode file lists or paths that will break when files move. (The Codebase Map is the one deliberate exception, maintained by the rule above.)

---

## What To Avoid

- `npm` or `yarn` — use `pnpm`
- `any` in TypeScript — use `unknown` + type narrowing
- `pages/` directory — this is App Router only
- `firebase/compat` — modular SDK only
- Firebase Cloud Storage — removed from this boilerplate; it requires the paid Blaze plan. Store file metadata in Firestore, or use a free third-party host, if a feature needs uploads.
- Docker / local Firebase emulators — not part of this setup; the app always talks to your real (free Spark-plan) Firebase project
- `NEXT_PUBLIC_` prefix on secret values (service account, API keys)
- Committing `.env.local` or `.env` — they are gitignored
- Committing directly to `main`
- Inline styles — use Tailwind classes
- CSS-in-JS (styled-components, emotion) — not part of this stack

---

## Environment Variables

**Single source of truth: the root `.env`** (template: `.env.example`). `pnpm run env:sync` (`scripts/sync-env.js`) generates `frontend/.env.local` and `backend/.env` from it — those files are generated output, never edit them directly. The sync runs automatically before `pnpm run dev`.

When adding a variable, use the `/add-env-var` skill — it updates `.env.example`, `scripts/sync-env.js`, and `docs/ENV-VARS.md` together. See `docs/ENV-VARS.md` for the full variable reference.

---

## Running the Project

```bash
pnpm install              # Install all workspace dependencies
pnpm run validate         # Check for unreplaced template placeholders
pnpm run dev              # Start the frontend dev server (talks to your real Firebase project)
pnpm run test             # Backend unit tests (mocked Firebase Admin)
pnpm run test:component   # Frontend unit tests
pnpm run test:all         # All tests
pnpm run lint             # ESLint across all packages
pnpm run typecheck        # TypeScript check across all packages
```

---

## Forking for a New Client Project

When forking this boilerplate for a new client:

1. **Update this file** — replace the overview section with client project details
2. **Replace `.firebaserc`** — set the client's Firebase project ID
3. **Update `.env.example`** — fill in `NEXT_PUBLIC_APP_NAME` default if the client has one
4. **Update the region** in `backend/src/index.ts` if not Australia
5. **Delete** `frontend/src/features/example-feature/` — it's a scaffold template only
6. **Update `docs/ARCHITECTURE.md`** with the client's actual system design
7. Run `pnpm run validate` — must return zero errors before first commit
