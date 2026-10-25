# Implementation Part B: plan

**Builds:** `task-crud-spec.md` (Gate 1, amended by SCR-1 to SCR-19) against ADR-0001 to ADR-0006 (all Proposed) and `.claude/rules/tasks.md`.
**Drafted by:** Claude Code (claude-opus-5-5) on 2026-10-02.
**Approved:** with changes, by Cowork acting for Sajad Ali Akbari, on 2026-10-02 (see "Review notes" at the end).
**Status:** approved, not started.

## Settled before building

- **Editing is inline.** The list item turns into the edit form. There is no edit page, because spec A8 and §9 make the edit view the only other place a task is shown, and nothing makes it a page.
- **Narrow screens (SCR-19).**
  - AC-4.8 holds where the sidebar is shown (1024px and wider).
  - AC-8.3 covers the actions on the tasks page itself, opened by its address below 1024px.
  - No mobile menu, and no change to the shared layout.
- **Erasure schedule.** `frontend/vercel.json` is approved, with a daily run at 16:00 UTC.
- **Nothing is deployed in this PR, and `CRON_SECRET` isn't set anywhere.** See "Deploy steps for later".
- **Tester tools are left to the Testing phase.** That covers P1, P5, P6, P7 and seeding 1,000 tasks. Implementation only lists the P2 access points and documents the P6 frequency.
- **Where P2 and P6 are documented:** the `tasks` section of `docs/FIRESTORE-SCHEMA.md`, with a pointer in `docs/TESTING.md`.

## Decisions that fill gaps (accepted)

1. **Next page:** the list query reads 20×N+1 tasks, so "Next" only shows when another page exists. This is one extra read, an ADR-0004 deviation that Sajad approved (WP6).
2. **One refusal message:** a missing task, another user's task and a deleted task all get "This task no longer exists." This meets AC-7.4's wording, and the reply doesn't reveal whether another user's task exists.
3. **No optimistic tick:** the checkbox shows the stored status and is disabled while saving, so AC-6.5 and A29 hold by construction.
4. **Erasure filter:** erasure selects `deletedAt < now − 720h`. WP11a also re-checks every document in code before deleting it.
5. **The erasure route fails closed:** it refuses every request when `CRON_SECRET` is unset or empty.
6. **No raw Zod text:** every Zod problem without its own message, such as a wrong type or a body that isn't an object, gets the fixed text "Invalid request". This applies rule 5.
7. **Page number in the URL** (`?page=N`), parsed with `paginationSchema`. If a change empties the open page, it shows "No tasks on this page" and a Previous button.

Also decided: the shared `useCollection()` is fixed to restart exactly when its query changes (ADR-0004's correction). Its signature and return shape stay the same.

## Dependencies

None of the packages adds a dependency.
- Already installed: `react-hook-form`, `@hookform/resolvers`, `zod` 3.25, `sonner` and `lucide-react`.
- Time logic uses plain `Date`, and the secret check uses `node:crypto`.
- `pnpm install` isn't needed, which matters because of run-log finding F1.

## Work packages, in build order

- [ ] **WP1: Data model, rules, index, static rules test**
  - **Satisfies:**
    - the rules side of AC-1.2, 1.3, 1.4a, 1.4b, 1.5 and 7.1
    - the browser side of AC-2.10a, 2.10b, 7.3 and 7.6
    - AC-8.6 (the type)
    - the index behind AC-4.4
    - part of D1
  - **Applies:** ADR-0002, ADR-0004; rules 1 and 2.
  - **Files:**
    - `frontend/src/types/firestore.ts`: add `Task` (`status: 'pending' | 'completed'`, `deletedAt: Timestamp | null`, `_schemaVersion: 1`).
    - `frontend/src/lib/firebase/firestore.ts`: add `getTasksCollection()`.
    - `firebase/firestore.rules`: add a `tasks` block:
      - `allow read: if isAuthenticated() && isOwner(resource.data.uid) && notDeleted()`
      - `allow create, update: if false`
      - `allow delete: if false`
    - `firebase/firestore.indexes.json`: one composite index on uid ↑, deletedAt ↑, status ↓, dueDate ↑, createdAt ↑.
    - `CLAUDE.md` Codebase Map: update the `firestore.ts` and `types/firestore.ts` rows.
    - Create `frontend/tests/unit/firebase/tasks-rules.test.ts`.
  - **Tests:** a static test reads `firebase/firestore.rules` in the Node environment and pulls out the `match /tasks/{taskId}` block. It asserts that:
    - the block exists
    - it has no `isAdmin()` and no `hasCustomClaim()`
    - every `allow` that names create, update, delete or write ends in `if false`
    - the read rule uses `isOwner` and `notDeleted()`

    Rules behaviour itself can't be unit-tested without an emulator (`docs/TESTING.md`), so Testing covers it with P1 and P2.
  - **Must not change:**
    - the `users` and `notes` rules, the rule helpers, and the default deny
    - no `isAdmin()` or `hasCustomClaim()` in the `tasks` rules
    - no `firebase deploy`
  - **New dependency:** none.

- [ ] **WP2: Shared field rules and due-date helpers**
  - **Satisfies:**
    - the logic of AC-2.1a–c, 2.2a–c, 2.3a, 2.4, 2.6a–d, 2.9, 2.10a, 2.10b, 3.2b, 3.2c and 5.3
    - AC-2.8's wording (A36)
    - the "refuse `deletedAt`" side of AC-7.6
    - AC-8.5 for messages
    - D2a
  - **Applies:** ADR-0003, ADR-0005 (an empty edit is refused), ADR-0006; rule 5. The server checks use UTC moments, not calendar ranges in the viewer's timezone, so rule 4 still holds.
  - **Files:**
    - Create `frontend/src/features/tasks/types.ts`: `TaskField`, and `TaskActionResult`, which extends `ActionResult` with `field?`.
    - Create `frontend/src/features/tasks/lib/due-date.ts`, with:
      - `startOfMinute`
      - `latestAllowedDueDate`, which turns 29 February into 28 February
      - a past/10-year check that takes an injected "now"
      - helpers that convert between a `datetime-local` value and an ISO string with an offset
    - Create `frontend/src/features/tasks/schemas.ts`:
      - each field rule is defined once and reused by the create, edit, set-status and delete request schemas (all `.strict()`) and by the form schemas
      - every check has a custom message, plus a schema-level error map
      - the fixed texts are defined here: task gone, save failed, load failed
  - **Tests:**
    - `frontend/tests/unit/features/tasks/schemas.test.ts`:
      - **Title:** empty or only whitespace (space, tab, line break, NBSP) is refused. 1 and 200 code points are accepted, and 201 is refused. 200 × 👍 is accepted. 199 characters + 🇦🇺 (201 code points) is refused. Whitespace is trimmed before counting.
      - **Description:** empty or missing is accepted. 10,000 is accepted, and 10,001 is refused. Markup is kept as typed, and so are line breaks.
      - **Due date:** missing, malformed, no offset, non-zero seconds and non-zero milliseconds are each refused.
      - **Status on create:** missing → pending. `completed` and `done` are refused.
      - **Edit:** any `status` is refused, and so is an empty edit.
      - **Set status:** `done` is refused.
      - **System and unknown fields:** every system field, and an unknown field, is refused on create and on edit, whatever the value.
      - **Id:** empty, or containing `/`, is refused.
      - **Wording:** no message equals Zod's default text.
    - `frontend/tests/unit/features/tasks/lib/due-date.test.ts`:
      - at 10:30:45, a due time of 10:30 is accepted and 10:29 is refused
      - saved 2027-03-05 10:30 → 2037-03-05 10:30 accepted, 10:31 refused
      - saved 2028-02-29 → 2038-02-28 accepted, the next minute refused
      - local value → ISO → local value gives back the same moment
  - **Must not change:** `ActionResult` in `types/index.ts`, `lib/validations/*`, the notes schemas, `formatDatetime`.
  - **New dependency:** none.

- [ ] **WP3: Make `useCollection()` restart exactly when its query changes**
  - **Satisfies:** what AC-4.7b and AC-4.11a need from the hook; D2b (this hook loads tasks).
  - **Applies:** ADR-0004 (its correction), ADR-0002.
  - **Files:**
    - `frontend/src/hooks/useFirestore.ts`:
      - compare queries with `queryEqual`
      - set `loading` back to true on restart
      - clear `error` after a later success
    - `CLAUDE.md` Codebase Map: add "restarts when the query changes" to the `useFirestore.ts` row.
  - **Tests:** `frontend/tests/unit/hooks/useFirestore.test.ts` (with `firebase/firestore` mocked):
    - loading, then loaded; error
    - restarts when the constraints change
    - doesn't restart on a re-render with an equal query
    - unsubscribes on unmount
  - **Must not change:**
    - the signature `useCollection(ref, ...constraints)` and the `{ data, loading, error }` shape
    - any notes file

    Side effect: `NotesList` stops resubscribing after every render.
  - **New dependency:** none.

- [ ] **WP4: `createTask` Server Action**
  - **Satisfies:**
    - the action side of AC-1.1 and AC-1.4a
    - AC-2.2c, 2.6a, 2.6d, 2.7, 2.9, 2.10a and 2.10b
    - the stored values in AC-3.1
    - AC-3.2a–c, 8.5, 8.6, 8.7a and 8.7b
    - D2c for actions
  - **Applies:** ADR-0002, 0003, 0006; rules 1, 2, 5.
  - **Files:** create `frontend/src/features/tasks/actions/tasks.actions.ts`. Steps:
    1. Call `requireAuth()` outside any `try`, so the redirect propagates.
    2. Parse with the strict schema.
    3. Check the due date against `Timestamp.now()`.
    4. Call `add` with the uid from the session, `status: 'pending'`, `createdAt`/`updatedAt`, `deletedAt: null` and `_schemaVersion: 1`.
  - **Tests:** `frontend/tests/unit/features/tasks/actions/tasks.actions.test.ts` (with `@/lib/firebase/admin` and `requireAuth` mocked in the file):
    - signed out: the redirect propagates and the database is never called
    - the stored document has exactly the expected shape, and the title is trimmed
    - refusals return the right `field` and make no write
    - a database failure returns the fixed wording, never the raw text
    - **AC-2.7:** two tasks with the same title are both created. Two calls with an identical title both succeed and both call `add`, with no uniqueness check.
  - **Must not change:**
    - `auth.actions.ts`, `admin.ts`, the notes actions
    - no `serverTimestamp()` (ADR-0002 uses the Vercel clock)
    - no admin checks
  - **New dependency:** none.

- [ ] **WP5: `updateTask`, `setTaskStatus`, `deleteTask`, each in a transaction**
  - **Satisfies:**
    - AC-1.3, 1.4b, 1.5, 2.6b, 2.6c, 5.1–5.5, 6.1, 6.2, 6.4 and 6.7
    - the unchanged fields in AC-7.2
    - AC-7.3 (no erase action exists), 7.4, 7.6 and 8.7b
  - **Applies:** ADR-0002, 0005, 0006; rules 1, 3, 5.
  - **Files:**
    - `tasks.actions.ts`. One private helper runs `runTransaction`: `tx.get`, then checks the owner and `deletedAt == null`, then runs the action's write.
      - **Edit:** writes only the fields it was sent, plus `updatedAt`. The due date is checked only if it differs from the stored one.
      - **Set status:** writes `{ status, updatedAt }`.
      - **Delete:** writes `{ deletedAt, updatedAt }`.
    - `docs/TESTING.md`: add how to mock `adminDb` and `runTransaction`, because transactions are new to the project.
  - **Tests (extend the same file):**
    - every write goes through `runTransaction`, with `tx.get` before `tx.update`
    - another user's task, a deleted task and a missing task all return the same message, with no write
    - a kept past due date is accepted; changing to a different past time is refused, including a time-only change
    - set status writes only the status and `updatedAt`
    - delete writes only `deletedAt` and `updatedAt`
    - `createdAt` is never written, and nothing calls `.delete()`
  - **Must not change:** the create path. No write to an existing task outside a transaction.
  - **New dependency:** none.

- [ ] **WP6: `useTasks(page)` hook**
  - **Satisfies:**
    - AC-4.1, 4.4, 4.7a–c, 4.10a, 4.10b, 4.11a and 4.11b
    - the list side of AC-7.1
    - AC-8.5
    - D2b
  - **Applies:** ADR-0002, 0004, 0006; rules 2, 5.
  - **Files:**
    - Create `frontend/src/features/tasks/hooks/useTasks.ts`:
      - **query:** uid ==, `deletedAt == null`, status ↓, dueDate ↑, createdAt ↑, `limit(20N+1)`
      - **returns:** that page's tasks, `hasNext`, `loading`, and either the fixed load-failure text or no error
      - subscribes only once the user is known
    - `docs/adr/0004-task-list-query.md`: add a dated paragraph, "**Correction found in Implementation (2026-10-02):**", in the same style as the existing 2026-09-27 correction.
      - It records the +1 read, approved by Sajad.
      - It also records that `useCollection()` was fixed to restart exactly when its query changes.
      - Status stays Proposed.
  - **Tests:** `frontend/tests/unit/features/tasks/hooks/useTasks.test.ts`:
    - loading, loaded, error; the error is the fixed wording and never the raw message
    - the exact query constraints
    - page slicing and `hasNext`
    - restarts when the page changes
  - **Must not change:** `useCollection`'s signature. No client-SDK writes.
  - **New dependency:** none.

- [ ] **WP7: Tasks page, read-only list, sidebar link**
  - **First:** re-read A13, AC-4.8 and AC-8.3 in `task-crud-spec.md` (changed by SCR-19).
  - **Satisfies:**
    - the page redirect in AC-1.1
    - AC-2.3b, 2.3c, 2.4 (display), 2.5, 4.2 and 4.3
    - the paging controls of AC-4.7a and 4.7b
    - AC-4.8, where the sidebar is shown (1024px and wider)
    - AC-4.9, 4.10a and 4.10b
    - AC-8.3, on the tasks page itself, opened by its address below 1024px
    - AC-8.4b and 8.4c
  - **Applies:** ADR-0002, 0003, 0004, 0006; rules 4, 5.
  - **Files:**
    - Create `frontend/src/app/(dashboard)/tasks/page.tsx`: a Server Component with `requireAuth()` and `PageHeader`, and no date work.
    - Create `frontend/src/features/tasks/components/TaskList.tsx` (`'use client'`): reads `?page=`, shows the three states, Previous/Next.
    - Create `frontend/src/features/tasks/components/TaskItem.tsx`:
      - the description uses `whitespace-pre-wrap`
      - `formatDatetime(dueDate.toDate())` runs in the browser
      - the checkbox's accessible name includes the title
    - Edit `frontend/src/components/layout/Sidebar.tsx`: add a Tasks link with the `ListTodo` icon.
    - `CLAUDE.md`: add `/tasks` under "Existing routes/pages".
    - Check `node_modules/next/dist/docs` for `useSearchParams` and Suspense first.
  - **Tests:**
    - `frontend/tests/unit/features/tasks/components/TaskList.test.tsx`: spinner; the error shows the fixed wording and not the empty state; "No tasks yet"; paging buttons.
    - `frontend/tests/unit/features/tasks/components/TaskItem.test.tsx`: `<b>` is shown as text; line breaks are kept; checked state; the accessible name includes the title.
  - **Must not change:**
    - `DashboardShell`, `Navbar`, the dashboard layout, `proxy.ts`, the notes page, `EmptyState`, `LoadingSpinner`
    - no mobile menu (SCR-19)
  - **New dependency:** none.

- [ ] **WP8: Toggle and delete on each list item**
  - **Satisfies:**
    - AC-6.1, 6.2, 6.5 and 6.7
    - AC-7.4 (the interface message), 7.5 and 7.9
    - AC-8.1a and 8.1b for toggle and delete
    - AC-8.2b, 8.2c and 8.4a
  - **Applies:** ADR-0005 (set, not flip), ADR-0006; rules 1, 5; A20 (no `confirm()`, no modal toast).
  - **Files:**
    - `TaskItem.tsx`:
      - the checkbox sends the target status, is disabled with `aria-busy` while saving, and shows no toast on success
      - the delete confirmation is inline ("Delete task" / "Cancel"), with focus handled
    - `docs/DESIGN.md` (**required**): add the inline-confirmation pattern as a new reusable pattern.
  - **Tests (extend `TaskItem.test.tsx`):**
    - the action is called with the target status; no toast on success
    - on failure: an error toast, and the checkbox still shows the stored status
    - Cancel calls no action; Confirm calls `deleteTask` and shows a success toast
    - on failure: an error toast and no success toast
  - **Must not change:** the actions; the toast rules in DESIGN.md.
  - **New dependency:** none.

- [ ] **WP9: Create form**
  - **Satisfies:**
    - AC-2.1a–2.6a in the interface
    - AC-2.8 and 3.1
    - AC-8.1a and 8.1b for create
    - AC-8.2a and 8.4a
  - **Applies:** ADR-0003, 0006; rule 5.
  - **Files:**
    - Create `frontend/src/features/tasks/components/CreateTaskForm.tsx`:
      - a `datetime-local` input with `step=60`, converted to ISO on submit
      - a server-side `field` error is shown beside its field through `setError`
    - Add the form to `page.tsx`.
  - **Tests:** `frontend/tests/unit/features/tasks/components/CreateTaskForm.test.tsx`:
    - field errors appear under their fields
    - the form sends the ISO string and no status or system fields
    - a server-side due-date error appears beside the due date
    - success and failure toasts; the form keeps its values after a failure
  - **Must not change:** the notes form.
  - **New dependency:** none.

- [ ] **WP10: Inline edit form**
  - **Satisfies:**
    - AC-2.6b, 2.6c and 2.8
    - AC-5.1–5.4
    - AC-7.1 (the only edit view is inside the list item, so it disappears with the task)
    - AC-7.4 (the interface message)
    - AC-8.1a and 8.1b for edit; AC-8.2a
  - **Applies:** ADR-0003, 0005, 0006; rules 4, 5; spec A8 and §9.
  - **Files:**
    - Create `frontend/src/features/tasks/components/EditTaskForm.tsx`:
      - sends only `dirtyFields`
      - keeps Save disabled until something changes
      - runs the early due-date checks only when the due date changed
    - Edit `TaskItem.tsx` to open the form in place.
  - **Tests:** `frontend/tests/unit/features/tasks/components/EditTaskForm.test.tsx`:
    - only changed fields are sent, and status never is
    - an unchanged past due date can still be saved
    - changing to a past date shows the error
    - a failure leaves the old values
  - **Must not change:** the actions. No edit page or route.
  - **New dependency:** none.

- [ ] **WP11a: Erasure route, its test, and the schedule**
  - **Satisfies:** AC-7.3 (the only erasure), 7.7, 7.8 and 8.5; D2c; the code side of D4; D5.
  - **Applies:** ADR-0001. `.claude/rules/tasks.md` doesn't fit this route (see "Conflicts recorded for the evidence"), so the code stays out of `features/tasks/`.
  - **Files:**
    - Read the Next.js 16 route handler docs in `node_modules/next/dist/docs` first.
    - Create `frontend/src/app/api/cron/erase-deleted-tasks/route.ts`, a `GET` handler that:
      1. Refuses every request if `CRON_SECRET` is unset or empty.
      2. Compares the `Authorization` header with `Bearer ` + the secret, in constant time.
      3. Works out cutoff = now − 720 hours.
      4. Queries `where('deletedAt', '<', cutoff)`, ordered by `deletedAt`, in pages that start after the last returned document. Skipped documents can't come back, so the loop can't run forever.
      5. **Before each delete, re-checks in code that `deletedAt` is a `Timestamp` older than the cutoff, and skips the document otherwise.** Whether a range filter skips `null` is unchecked, so this protects AC-7.8 either way.
      6. Deletes the documents that pass, in a `WriteBatch`.
      7. Stops when a page returns fewer than the limit, or when a time budget is spent.
      8. Returns the counts.
      9. On failure, logs with `console.error` and returns a generic 500.
    - Create `frontend/vercel.json` with one cron: path `/api/cron/erase-deleted-tasks`, schedule `0 16 * * *` (daily, 16:00 UTC). It goes in `frontend/` because that is Vercel's Root Directory.
  - **Tests:** `frontend/tests/unit/app/api/cron/erase-deleted-tasks/route.test.ts`:
    - **Refusals:**
      - 401 with no header
      - 401 with a wrong secret
      - 401 when `CRON_SECRET` is unset or empty, even with `Bearer ` or `Bearer undefined`
    - **Query:** the filter is exactly `deletedAt < now − 720h` (fake timers).
    - **Re-check:**
      - an expired deleted task is erased
      - **a returned document with `deletedAt: null` is not deleted (change 2)**
      - a returned document exactly 720 hours old, or newer, is not deleted
    - **Paging:** several pages are processed, with no endless loop when skipped documents are present.
    - **Nothing to erase:** 200, with 0 erased.
    - **Database error:** a generic 500 with no raw text.
  - **Must not change:**
    - `.github/workflows/*`, `proxy.ts` (its matcher already skips `api/`), `admin.ts`, the session route
    - `delete: if false` in the tasks rules
    - nothing goes in `features/tasks/`
  - **Not done here:** nothing is deployed, and `CRON_SECRET` isn't set anywhere.
  - **New dependency:** none (`node:crypto` is built in).

- [ ] **WP11b: `CRON_SECRET` configuration**
  - **Satisfies:** D5 (no paid plan or billing account); supports AC-7.7.
  - **Applies:** ADR-0001; CLAUDE.md "Environment Variables"; the steps in `.claude/skills/add-env-var.md`, read and followed by hand because the skills don't load.
  - **Files:**
    - `.env.example`: add `CRON_SECRET=` with an **empty value**, and a comment saying:
      - it's server-only, any long random string works, and how to generate one
      - **no real or realistic secret and no double-brace placeholder text**, because `pnpm run validate` flags it
    - `scripts/sync-env.js`: route `CRON_SECRET` to `frontend/.env.local` (the server-only frontend lines), not to the backend.
    - `docs/ENV-VARS.md`: add a row (Secret: yes; Required: only where erasure should run).
    - `docs/SECURITY.md`:
      - server-only, never with a `NEXT_PUBLIC_` prefix
      - rotate it by changing it in Vercel and redeploying
      - if it leaks, the harm is extra runs only, not early erasure
      - the route refuses every request while it's unset
  - **Tests:** no new tests (configuration only). `pnpm run validate` must pass. The unset and empty cases are already tested in WP11a.
  - **Must not change:** the other variables, the `NEXT_PUBLIC_` pass-through, the backend `.env` lines.
  - **New dependency:** none.

- [ ] **WP11c: Docs and context for the erasure job**
  - **Satisfies:** the documentation side of D4 and D5; CLAUDE.md "Harness integrity".
  - **Applies:** ADR-0001.
  - **Files:**
    - `docs/CI-CD.md`:
      - add `CRON_SECRET` to the Vercel environment table
      - document the daily schedule in `frontend/vercel.json`
      - say the tasks composite index is deployed by hand
    - `docs/ARCHITECTURE.md`: add a fourth path to the data, the Vercel scheduler → a route handler, guarded by `CRON_SECRET`; add a "Scheduled job" request pattern.
    - `frontend/CLAUDE.md`: add `api/cron/erase-deleted-tasks/` to "File Organization".
    - `CLAUDE.md`:
      - add a Codebase Map row for the route
      - change the routes line: the cron route uses the secret, not an ID token
    - `docs/adr/0001-task-erasure-job.md`: a plain dated implementation note, "**Implementation note (2026-10-02):**". It records:
      - `frontend/vercel.json` and why it's there
      - the 16:00 UTC schedule
      - the route fails closed when the secret is unset
      - the in-code re-check of `deletedAt` before each delete
      - nothing deployed in this PR

      Status stays Proposed.
  - **Tests:** none (docs only). The `doc-auditor` agent checks for drift in WP12.
  - **Must not change:** `.claude/rules/tasks.md` (see "Conflicts recorded for the evidence").
  - **New dependency:** none.

- [ ] **WP12: P2 and P6 documentation, then the checks**
  - **Satisfies:** P2 (the access points are listed) and P6 (the frequency is documented), as the spec requires; D1 in full.
  - **Files:**
    - `docs/FIRESTORE-SCHEMA.md`, `tasks` section:
      - an "Access points (P2)" table
      - an "Erasure schedule (P6)" note
      - the index
      - a check that every field matches the code (D1)
    - `docs/TESTING.md`: a pointer to them.
  - **Checks:**
    - `pnpm run validate`, `lint`, `typecheck`, `test:component`, `test`
    - `pnpm audit --audit-level=high` compared with the run-log baseline
    - the `security-reviewer` agent (ADR-0001, 0002, 0005)
    - the `doc-auditor` agent (Codebase Map)
  - No commit or PR until asked.
  - **New dependency:** none.

## Criteria unit tests can't check

Unit tests mock Firebase, so anything that depends on the deployed rules, the index, real authentication, real timing or real layout needs a live check.

| Criteria | Prerequisites |
|---|---|
| AC-1.1 (the real redirect; direct requests to the actions and Firestore) | P2 |
| AC-1.2 | P1 |
| AC-1.3, AC-1.5 (role field, claim, both), AC-7.3, AC-7.6 | P1, P2, P3 |
| AC-1.4a, AC-1.4b (the Firestore side) | P1, P2 |
| AC-1.6a | P7 |
| AC-1.6b | P5 |
| AC-2.9, AC-2.10a, AC-2.10b, AC-3.2c, AC-7.1 | P2 |
| AC-3.2a, AC-8.6 | P3 |
| AC-3.2b, AC-7.4 | P2, P3 |
| AC-4.10a, AC-4.10b, AC-6.5, AC-8.1a, AC-8.1b | P4 |
| AC-8.5 | P2, P4 |
| AC-7.2, AC-8.7a, AC-8.7b | P3, P8 |
| AC-7.7, AC-7.8 | P3, P6 |
| AC-2.5 (device timezone), AC-3.1, AC-4.1, AC-4.4 (Firestore's real text and time order is still unchecked), AC-4.7a, AC-4.7b, AC-4.8 (1024px and wider), AC-4.11a, AC-4.11b (two tabs and devices, 3 s), AC-5.5, AC-6.3, AC-8.3 (tasks page by address below 1024px), AC-8.4a, AC-8.4c | None from P1–P8: a browser, a second device and the deployed index |
| AC-4.7c | **No P covers it.** Creating 1,000 tasks needs write access, and P3 is read-only. Left to the Testing phase. |

Before any live test, the rules and the index must be deployed to the test project, and `CRON_SECRET` must be set. See "Deploy steps for later".

## Where P2 and P6 are documented

In the `tasks` section of `docs/FIRESTORE-SCHEMA.md`, with a pointer in `docs/TESTING.md` (WP12).

**Access points (P2):**
1. The page `GET /tasks`. It redirects when signed out and holds no task data.
2. The Server Actions `createTask`, `updateTask`, `setTaskStatus` and `deleteTask`, called as `POST /tasks` with a `Next-Action` header. The doc will say how to copy the action IDs from DevTools, because they change with each build.
3. The Firestore `tasks` collection, through the client SDK or REST:
   - get, list/query and listen are owner-only and non-deleted
   - create, update and delete are always refused
4. `GET /api/cron/erase-deleted-tasks`, with `Authorization: Bearer <CRON_SECRET>`.

**Erasure schedule (P6):**
- Once a day at 16:00 UTC, set in `frontend/vercel.json`. On Hobby, the run can start anywhere within that hour.
- My understanding is that Vercel runs cron jobs only on production deployments. That needs checking before it's relied on. On the test project, testers call the route by hand with the secret.

## Context and doc files that change in the same work

| File | Change | WP |
|---|---|---|
| `CLAUDE.md` | Map rows for `firestore.ts`, `types/firestore.ts`, `useFirestore.ts` and the cron route; `/tasks` and the cron route in the routes line | 1, 3, 7, 11c |
| `frontend/CLAUDE.md` | File Organization: `api/cron/erase-deleted-tasks/` | 11c |
| `docs/FIRESTORE-SCHEMA.md` | P2 list, P6 schedule, index; check it matches the code (D1) | 12 |
| `docs/SECURITY.md` | How to handle and rotate `CRON_SECRET`. The D4 exception is already there. | 11b |
| `.env.example`, `scripts/sync-env.js`, `docs/ENV-VARS.md` | `CRON_SECRET` | 11b |
| `docs/CI-CD.md` | Vercel variables, the cron schedule, the hand-deployed tasks index | 11c |
| `docs/ARCHITECTURE.md` | The scheduler → route handler path, guarded by the secret | 11c |
| `docs/TESTING.md` | How to mock the admin SDK and transactions; pointer to P2 and P6 | 5, 12 |
| `docs/DESIGN.md` | The inline-confirmation pattern (required) | 8 |
| `docs/adr/0004-task-list-query.md` | "Correction found in Implementation (2026-10-02)"; status stays Proposed | 6 |
| `docs/adr/0001-task-erasure-job.md` | A plain dated implementation note; status stays Proposed | 11c |

These stay unchanged:
- `.claude/rules/tasks.md`: still accurate for its paths. See the conflicts below.
- `.claude/skills/firebase-collection.md`: already fixed in the design PR.
- The GUIDE, tutorial walkthrough and copy-paste feature docs: the `useCollection` signature doesn't change.
- `implementation/run-log.md`: the tester's log.

## Deploy steps for later (Thomas)

Nothing below is done in this PR.

1. **Tasks composite index:** deploy `firebase/firestore.indexes.json` with `npx firebase-tools deploy --only firestore:indexes`, which needs approval. The task list query fails until the index exists, so deploy it before, or at the same time as, the merge to `main`.
2. **Rules:** `deploy.yml` deploys `firebase/firestore.rules` automatically on push to `main`. The tasks rules go live at merge.
3. **`CRON_SECRET` in Vercel:** set it in Vercel's Production environment to a long random value. Until then, the route refuses every call and nothing is erased.
4. **The schedule:** it takes effect on the first production deployment that includes `frontend/vercel.json`.
5. **Test project:** before the Testing phase, deploy the rules and the index there too, and set `CRON_SECRET` in the root `.env` for local runs.

## Conflicts recorded for the evidence

These are recorded, not resolved. The rule isn't edited.

1. **Rules 2 and 3 in `.claude/rules/tasks.md` don't fit the erasure route.**
   - Rule 2 says never query `tasks` without `where('deletedAt', '==', null)`. The erasure route has to select deleted tasks.
   - Rule 3 says never write to an existing task outside a transaction that checks the owner and that `deletedAt` is null. The erasure route has to hard-delete deleted tasks, with no user and no owner.
2. **The route sits outside the rule's paths.** `frontend/src/app/api/cron/erase-deleted-tasks/` doesn't match any of the rule's `paths`, so the rule never loads while the route is being edited.
   - The route only follows ADR-0001 because its code is kept out of `features/tasks/`.
   - The same gap was noted in `design-and-context-engineering/step3-conflict-check.md` ("Outside the comparison").

## Problems that already exist (not fixed here)

- `frontend/tests/setup.ts` mocks `@/lib/firebase/client` as `auth/db/app`, but the file exports getter functions. The new tests mock what they need in each file, and `setup.ts` stays as it is.
- The `CLAUDE.md` "Existing routes/pages" line already leaves out `/notes`.
- The skills in `.claude/skills/` don't load (the GAP in the run log), so `/add-env-var` and `/verify` are followed by reading their `.md` files directly.
- `NotesList` builds a new collection reference on every render, so it resubscribes after every render. WP3's hook fix stops this without changing any notes file.

## Review notes (Cowork, acting for Sajad)

Recorded on 2026-10-02 by Cowork acting for Sajad Ali Akbari. The draft plan was approved with the answers, decisions and changes below, and this file includes them.

**Answers to the clarifying questions (from the spec and ADRs):**
- **Q1, inline editing: yes.** Spec A8 says "the edit view is the only other place a single task is shown", and §9 rules out a separate detail page or view. Nothing makes the edit view a page.
- **Q2, narrow screens:** this was a spec gap, now SCR-19 (below).
- **Q3, `frontend/vercel.json`:** approved. It's in scope and isn't a workflow file.
  - Use 16:00 UTC, since neither the spec nor ADR-0001 sets a time.
  - Nothing is deployed in this PR, and `CRON_SECRET` isn't set anywhere. Both go under "Deploy steps for later" for Thomas.
- **Q4, tester tools:** the tools for P1, P5, P6, P7 and seeding 1,000 tasks are left to the Testing phase. Only P2 (list the points) and P6 (document the frequency) are Implementation's job.
- **Q5, where P2 and P6 go:** option (a), the `tasks` section of `docs/FIRESTORE-SCHEMA.md`, with a pointer in `docs/TESTING.md`.

**SCR-19 decision (answered by Sajad):** AC-4.8 holds where the sidebar is shown (1024px and wider). AC-8.3 covers the actions on the tasks page itself, opened by its address below 1024px. No mobile menu, and no change to the shared layout. `task-crud-spec.md` was updated (A13, AC-4.8, AC-8.3), and those three are re-read before WP7.

**ADR-0004 decision:**
- The +1 read in WP6 is an ADR deviation that Sajad has approved.
- It's written as a dated paragraph titled "Correction found in Implementation" in `docs/adr/0004-task-list-query.md`, like the existing 2026-09-27 one. Status stays Proposed.
- The ADR-0001 note in WP11c is a plain dated implementation note.

**The 7 gap fills** in "Decisions that fill gaps" are accepted.

**Required changes to the draft plan (all applied above):**
1. **WP11 split** into WP11a (`route.ts`, its test, `frontend/vercel.json`), WP11b (`CRON_SECRET` in `.env.example`, `scripts/sync-env.js`, `docs/ENV-VARS.md` and `docs/SECURITY.md`) and WP11c (`docs/CI-CD.md`, `docs/ARCHITECTURE.md`, `frontend/CLAUDE.md`, `CLAUDE.md` and the ADR-0001 note).
2. **WP11a re-check before deleting.** Before each delete, re-check in code that the document's `deletedAt` is a Timestamp older than 720 hours. Whether a range filter skips `null` is unchecked, and this protects AC-7.8 either way. There's a test for it with a document whose `deletedAt` is `null`.
3. **WP4 AC-2.7 test:** a test that two tasks with the same title are both created.
4. **WP8 DESIGN.md:** the inline-confirmation pattern in `docs/DESIGN.md` is required, not optional.
5. **WP1 static rules test:** a small static test reads `firebase/firestore.rules` and asserts that the tasks block has no `isAdmin()` or `hasCustomClaim()`, and no `allow` create, update or delete that isn't `false`.
6. **WP11b `.env.example`:** `pnpm run validate` flags double-brace placeholder text, so `.env.example` gets an empty value, or a form without double braces. Never a real or realistic secret.
7. **Record two conflicts for the evidence:** rules 2 and 3 in `.claude/rules/tasks.md` don't fit the erasure route, which has to select deleted tasks and hard-delete them; and the route sits outside the rule's paths. The rule isn't edited.
