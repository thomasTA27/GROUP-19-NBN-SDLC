# Building With This Boilerplate — A Beginner's Guide

This guide takes you from a fresh clone to shipping your first feature. No prior experience with this stack is assumed — follow it top to bottom.

**What you'll build along the way:** a "notes" feature — users can create and see their own notes, stored in Firestore, with everything secured properly.

---

## 1. Understand what you're working with

The app has two halves plus a shared Firebase project:

- **`frontend/`** — a Next.js website. Pages live in `frontend/src/app/`. Most pages render on the server (fast, secure); interactive parts run in the browser.
- **`backend/`** — an Express API deployed as one Firebase Cloud Function. You only need it for logic that shouldn't live in the frontend (webhooks, heavy processing, third-party API calls with secrets). Many features never touch it.
- **Firebase** — handles sign-in (Auth) and the database (Firestore). There's no local emulator — dev, staging, and production all talk to real Firebase projects (use a separate free project for local dev so you're not testing against production data).

See the diagrams in [ARCHITECTURE.md](ARCHITECTURE.md) for how these connect.

**The three golden rules** (everything else follows from these):

1. **Never trust the browser.** Every data access is checked server-side — Firestore security rules, `requireAuth()` in Server Actions, or the API's auth middleware.
2. **Server Components by default.** Only add `'use client'` to a file when it needs clicks, typing, or live updates.
3. **One collection, four places.** Every Firestore collection gets: a TypeScript type, a typed collection export, security rules, and a schema doc entry. The `/firebase-collection` skill does all four for you.

---

## 2. Set up your machine

Install once:

| Tool | How |
|------|-----|
| Node.js 22 | [nodejs.org](https://nodejs.org) |
| pnpm | `npm install -g pnpm` |

Then from the repo root:

```bash
pnpm run bootstrap
```

This installs dependencies, creates the root `.env` from the template, and generates the per-package env files.

> **Or let Claude do all of it:** open the project in Claude Code and run **`/bootstrap`**. It checks prerequisites, walks you through creating a free Firebase project, handles the known failure modes, and finishes with a verified sign-up → session → dashboard smoke test.

### Connect a Firebase project

**All env values live in one file: the root `.env`.** (`frontend/.env.local` and `backend/.env` are generated from it — never edit those.)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) — the free **Spark plan** is enough, no billing required
2. Enable **Authentication** (Email/Password + Google) and create a **Firestore** database
3. Project settings → **Your apps** → add a **Web app** → copy each `firebaseConfig` value into `.env` (the variable names match: `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.)
4. Project settings → **Service accounts** → generate a private key → base64-encode it (macOS: `base64 -i service-account.json | tr -d '\n'`; Linux: `base64 -w 0 service-account.json`) → paste into `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` in `.env`
5. Set `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in `.env` and put the same id in `.firebaserc` (replacing the placeholder)

After changing anything in `.env`, run `pnpm run env:sync` (or just restart `pnpm run dev` — it syncs automatically).

### Run it

```bash
pnpm run dev
```

- App: [http://localhost:3000](http://localhost:3000)

Create an account via the sign-up page and check the Firebase console (Authentication → Users, and Firestore Database) — you'll see your user and their `users/{uid}` Firestore document appear. That round trip is the whole stack working.

---

## 3. The development loop

Every feature follows the same rhythm:

```
branch → build → verify → PR
```

1. **Branch** — never work directly on `main`. Use the `/git-feature` skill in Claude Code, or manually: `git checkout main && git pull && git checkout -b feature/my-feature`
2. **Build** — use the scaffolding skills (below) so new code lands in the right shape
3. **Verify** — run `/verify` in Claude Code, or manually: `pnpm run typecheck && pnpm run lint && pnpm run test:all`
4. **PR** — commits must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat: add notes list`); the commit hook rejects anything else

---

## 4. Walkthrough: build the "notes" feature

Every step below — including the security rules — was verified against a real Firebase project, not just written and assumed correct. See [TUTORIAL-WALKTHROUGH.md](TUTORIAL-WALKTHROUGH.md) for the exact results (allow/deny cases, HTTP status codes, test commands).

**Prefer pure copy-paste, no explanation, no AI?** [COPY-PASTE-FEATURE.md](COPY-PASTE-FEATURE.md) has the same feature broken into exact file paths and full file contents — nothing to interpret, no skills mentioned. (Setting up the app itself, the same way: [COPY-PASTE-SETUP.md](COPY-PASTE-SETUP.md).)

### Step 1 — Define the data (type + rules + docs)

In Claude Code, run `/firebase-collection` and answer the prompts (collection `notes`, owner-only access). Or manually:

**`frontend/src/types/firestore.ts`** — add the type:

```typescript
export interface Note {
  id: string
  uid: string            // owner's user id — used by security rules
  title: string
  body: string
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1      // every document carries this — see /evolve-schema
}
```

**`frontend/src/lib/firebase/firestore.ts`** — add the typed collection:

```typescript
export function getNotesCollection() {
  return typedCollection<Note>('notes')
}
```

**`firebase/firestore.rules`** — allow users to touch only their own notes:

```
match /notes/{noteId} {
  allow read:   if isAuthenticated() && isOwner(resource.data.uid);
  allow create: if isAuthenticated() && isOwner(request.resource.data.uid);
  allow update: if isAuthenticated() && isOwner(resource.data.uid)
                && request.resource.data.uid == resource.data.uid;
  allow delete: if false;  // soft-delete only — set deletedAt instead
}
```

**`docs/FIRESTORE-SCHEMA.md`** — document the fields so the next person (or the next Claude session) knows the shape.

### Step 2 — Write the mutation (Server Action)

Server Actions are functions that run on the server but are called like normal functions from your components. Create `frontend/src/features/notes/actions/notes.actions.ts`:

```typescript
'use server'

import { z } from 'zod'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import { Timestamp } from 'firebase-admin/firestore'
import type { ActionResult } from '@/types'

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10_000),
})

export async function createNote(input: unknown): Promise<ActionResult<string>> {
  const session = await requireAuth()               // 1. who is asking? (redirects if nobody)

  const parsed = createNoteSchema.safeParse(input)  // 2. is the input sane?
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  try {                                             // 3. write, and never throw at the caller
    const now = Timestamp.now()
    const ref = await adminDb.collection('notes').add({
      ...parsed.data,
      uid: session.uid,
      createdAt: now,
      updatedAt: now,
      _schemaVersion: 1,
    })
    return { success: true, data: ref.id }
  } catch {
    return { success: false, error: 'Failed to create note' }
  }
}
```

That three-beat structure — `requireAuth()`, Zod parse, `ActionResult` return — is the pattern for **every** Server Action.

### Step 3 — Build the form (calls the mutation)

Server Actions are called like normal async functions from a Client Component. `frontend/src/features/notes/components/CreateNoteForm.tsx` (new file) — react-hook-form + zod, the same pattern used by the sign-up form:

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createNote } from '@/features/notes/actions/notes.actions'

const createNoteFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().max(10_000),
})

type CreateNoteFormInput = z.infer<typeof createNoteFormSchema>

export function CreateNoteForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteFormInput>({
    resolver: zodResolver(createNoteFormSchema),
  })

  const onSubmit = async (data: CreateNoteFormInput) => {
    const result = await createNote(data)
    if (result.success) {
      toast.success('Note created')
      reset()
    } else {
      toast.error(result.error ?? 'Failed to create note')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <input
          id="title"
          type="text"
          aria-invalid={!!errors.title}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Note title"
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-red-500" role="alert">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="body" className="text-sm font-medium">Body</label>
        <textarea
          id="body"
          rows={3}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="Write something..."
          {...register('body')}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isSubmitting ? 'Saving…' : 'Add note'}
      </button>
    </form>
  )
}
```

No manual refresh needed after submit — the list below is a live `onSnapshot` subscription, so the new note appears the moment the write lands.

### Step 4 — Show the data (page + live list)

Run `/new-page` for the page shell, then add a Client Component for the live list.

**`frontend/src/app/(dashboard)/notes/page.tsx`** — the page (a Server Component):

```typescript
import type { Metadata } from 'next'
import { requireAuth } from '@/actions/auth.actions'
import { PageHeader } from '@/components/layout/PageHeader'
import { CreateNoteForm } from '@/features/notes/components/CreateNoteForm'
import { NotesList } from '@/features/notes/components/NotesList'

export const metadata: Metadata = { title: 'Notes' }

export default async function NotesPage() {
  await requireAuth()
  return (
    <div className="space-y-6">
      <PageHeader title="Notes" description="Your personal notes" />
      <CreateNoteForm />
      <NotesList />
    </div>
  )
}
```

**`frontend/src/features/notes/components/NotesList.tsx`** — the live list (a Client Component, because it subscribes to updates):

```typescript
'use client'

import { where } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { useAuth } from '@/hooks/useAuth'
import { getNotesCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export function NotesList() {
  const { user } = useAuth()
  const { data: notes, loading } = useCollection(getNotesCollection(), where('uid', '==', user?.uid ?? ''))

  if (loading) return <LoadingSpinner />
  if (notes.length === 0) return <EmptyState title="No notes yet" />

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border p-4">
          <h3 className="font-medium">{note.title}</h3>
          <p className="text-sm text-zinc-500">{note.body}</p>
        </li>
      ))}
    </ul>
  )
}
```

Add a link to the page in `frontend/src/components/layout/Sidebar.tsx`, and you have a working feature: rules-protected data, a validated mutation, a form, and a live-updating UI.

### Step 5 — (Optional) add an API endpoint

Only needed when logic shouldn't run in the frontend. Run `/add-route` and Claude scaffolds `backend/src/routes/notes.ts`, mounts it, and writes the tests. The full code, if you're doing it by hand, is in [COPY-PASTE-FEATURE.md § Files 10–12](COPY-PASTE-FEATURE.md). The pattern is documented in [BACKEND.md](BACKEND.md).

### Step 6 — Verify and ship

```
/verify          ← in Claude Code: lint, typecheck, tests, console.log scan
```

Or manually: `pnpm run typecheck && pnpm run lint && pnpm run test:all`.

Then commit (`feat: add notes feature`) and open a PR to `main`. Before the PR, it's worth asking Claude to run the **security-reviewer** agent over your staged changes.

---

## 5. Where things go — cheat sheet

| I want to… | Put it in… | Skill |
|-----------|-----------|-------|
| Add a page | `frontend/src/app/(dashboard)/…` or `(auth)/…` | `/new-page` |
| Add a business feature | `frontend/src/features/{name}/` | `/new-feature` |
| Add a reusable component | `frontend/src/components/shared/` | `/new-component` |
| Add a database collection | types + firestore.ts + rules + schema doc | `/firebase-collection` |
| Change a collection's fields | (guided migration) | `/evolve-schema` |
| Add an API endpoint | `backend/src/routes/` | `/add-route` |
| Add a config value | `.env.example` + `docs/ENV-VARS.md` | `/add-env-var` |
| Add Google/GitHub/Apple sign-in | `frontend/src/lib/firebase/auth.ts` + button | `/add-auth-provider` |

---

## 6. Common pitfalls

| Symptom | Cause & fix |
|---------|-------------|
| `auth/invalid-api-key` on startup | `NEXT_PUBLIC_FIREBASE_*` values are empty in the root `.env`. Paste them from the Firebase web app config, then **restart** the dev server (it re-syncs env automatically). |
| "Firebase web config is incomplete" on Vercel | A `NEXT_PUBLIC_FIREBASE_*` env var is missing in Vercel's project settings. Add it (same name as your root `.env`), then redeploy — Vercel doesn't retroactively apply new env vars to existing deployments. |
| Changed an env var, nothing happened | Edit the root `.env` (not the generated files), then restart `pnpm run dev` — `NEXT_PUBLIC_*` values are baked in at startup. |
| Edited `frontend/.env.local` or `backend/.env` and it got overwritten | Those files are generated. Make the change in the root `.env` instead. |
| "Missing or insufficient permissions" from Firestore | Your security rules don't allow the read/write. Add rules for the collection in `firebase/firestore.rules`, then deploy them: `npx firebase-tools deploy --only firestore:rules`. |
| `Invalid project id: REPLACE_WITH_...` | Set your real project id in `.firebaserc`. |
| Imported `firebase/firestore` in a page and it crashed | Client SDK in a Server Component. Use `@/lib/firebase/admin` on the server, or move the code into a `'use client'` component. |
| Hook/`useState` error in a page | The file needs `'use client'` at the top — or better, move the interactive part into its own small Client Component. |
| Commit rejected | The message isn't Conventional Commits format. Use `feat: …`, `fix: …`, `docs: …` etc. |

More troubleshooting lives in the [README](../README.md#troubleshooting).

---

## 7. Shipping it

Local dev talks to your Firebase project already — going live just means putting the frontend somewhere public. Deploy to [Vercel](https://vercel.com) (free, no billing account needed): sign in with GitHub, **Add New Project**, import this repo, set **Root Directory** to `frontend`, then add the environment variables listed in [CI-CD.md § Vercel Setup](CI-CD.md#vercel-setup-frontend) — Vercel doesn't read your root `.env` file, so each variable has to be added manually under the same name it has there.

## 8. Going further

- [TUTORIAL-WALKTHROUGH.md](TUTORIAL-WALKTHROUGH.md) — this guide executed end-to-end, with every code change and verification result
- [COPY-PASTE-SETUP.md](COPY-PASTE-SETUP.md) — Part 1, pure copy-paste, no AI: install, connect Firebase, run
- [COPY-PASTE-FEATURE.md](COPY-PASTE-FEATURE.md) — Part 2, pure copy-paste, no AI: build the feature, branch, commit, PR
- [garage-boilerplate-guide.pptx](garage-boilerplate-guide.pptx) — slide deck covering the whole system, including how the AI tooling fits in
- [notes-feature-tutorial.pptx](notes-feature-tutorial.pptx) — this walkthrough as a slide deck, one step per slide
- [ARCHITECTURE.md](ARCHITECTURE.md) — diagrams and the reasoning behind the design
- [FRONTEND.md](FRONTEND.md) / [BACKEND.md](BACKEND.md) — per-package conventions
- [DESIGN.md](DESIGN.md) — colors, typography, component patterns
- [SECURITY.md](SECURITY.md) — the full security model, layer by layer
- [TESTING.md](TESTING.md) — what to test and how
- [GIT-WORKFLOW.md](GIT-WORKFLOW.md) — branches, merges, releases
- [CI-CD.md](CI-CD.md) — deployment in full: Vercel, Firestore rules, the optional backend
