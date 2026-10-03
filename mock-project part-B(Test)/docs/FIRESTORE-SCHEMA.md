# Firestore Schema

## Overview

All collections use the typed collection pattern — see `frontend/src/lib/firebase/firestore.ts`.
Security rules are in `firebase/firestore.rules`.

## Schema versioning

Every document in every collection **must** include a `_schemaVersion` field:

\`\`\`typescript
_schemaVersion: 1 // increment when doing a breaking schema change
\`\`\`

This enables **lazy migration** — when a document is read, check `_schemaVersion` and migrate on the fly if it's behind current.

**Rules:**

- `_schemaVersion` is always `1` on creation
- Non-breaking changes (adding optional fields with defaults) keep the same version
- Breaking changes (rename, remove, type change) increment the version and require a migration function
- Never remove `_schemaVersion` from a schema

---

## `users` collection

**Path:** `/users/{userId}`
**Access:** Owner-only (user can read/write their own document; admins can read all)

| Field            | Type                | Required | Description                                  |
| ---------------- | ------------------- | -------- | -------------------------------------------- |
| `uid`            | `string`            | Yes      | Firebase Auth UID (same as document ID)      |
| `email`          | `string`            | Yes      | User's email address                         |
| `displayName`    | `string \| null`    | Yes      | Display name from Auth or profile            |
| `photoURL`       | `string \| null`    | Yes      | Profile photo URL                            |
| `role`           | `'user' \| 'admin'` | Yes      | User role — immutable by user after creation |
| `createdAt`      | `Timestamp`         | Yes      | When the document was created                |
| `updatedAt`      | `Timestamp`         | Yes      | When the document was last updated           |
| `_schemaVersion` | `1`                 | Yes      | Schema version for lazy migration            |

**Creation:** Auto-created by `AuthProvider` on first sign-in via `syncUserProfile()`.
**Deletion:** Hard-delete is disabled in security rules. Use `deletedAt` field for soft-delete.

---

## `notes` collection

**Path:** `/notes/{noteId}`
**Access:** Owner-only

| Field            | Type        | Required | Description                       |
| ---------------- | ----------- | -------- | --------------------------------- |
| `uid`            | `string`    | Yes      | Owner's Firebase Auth UID         |
| `title`          | `string`    | Yes      | Note title (1–200 chars)          |
| `body`           | `string`    | Yes      | Note body (≤10 000 chars)         |
| `createdAt`      | `Timestamp` | Yes      | Creation time                     |
| `updatedAt`      | `Timestamp` | Yes      | Last update time                  |
| `_schemaVersion` | `1`         | Yes      | Schema version for lazy migration |

---

## `tasks` collection

**Path:** `/tasks/{taskId}`
**Access:** Owner-only (the owner reads their own non-deleted tasks in the browser; every write goes through Server Actions, and the security rules refuse all browser writes; admins have no access to other users' tasks — spec R1, `docs/adr/0002-task-data-routes.md`)

| Field            | Type                        | Required | Description                                                         |
| ---------------- | --------------------------- | -------- | ------------------------------------------------------------------- |
| `uid`            | `string`                    | Yes      | Owner's Firebase Auth UID (set by the server; never changes)        |
| `title`          | `string`                    | Yes      | Task title (1–200 chars, after leading/trailing whitespace is trimmed) |
| `description`    | `string`                    | Yes      | Task description (≤10 000 chars; may be empty)                      |
| `dueDate`        | `Timestamp`                 | Yes      | Due date and time, to the minute (see Limits)                       |
| `status`         | `'pending' \| 'completed'`  | Yes      | `pending` on creation; changes only through the set-status action   |
| `createdAt`      | `Timestamp`                 | Yes      | Creation time; never changes                                        |
| `updatedAt`      | `Timestamp`                 | Yes      | Last update time (every create, edit, status change and delete)     |
| `deletedAt`      | `Timestamp \| null`         | Yes      | `null` from creation; set when the owner deletes the task           |
| `_schemaVersion` | `1`                         | Yes      | Schema version for lazy migration                                   |

**Limits:** Characters are Unicode code points, so 👍 counts as 1 (spec A27). Whitespace is what JavaScript's `trim()` removes (A2). A due date can't be set in the past, meaning before the start of the current minute by the server's clock; an unchanged past due date can be kept when editing (A26, AC-2.6c). A due date can be at most 10 calendar years after the save moment, to the minute, counted in UTC, with 28 February used when 29 February doesn't exist (A6). A due date with non-zero seconds or milliseconds is refused (`docs/adr/0003-due-date-storage.md`).
**Creation:** Through a Server Action only. The server sets `uid`, `createdAt`, `updatedAt`, `deletedAt` (`null`) and `_schemaVersion`, and a request that includes any of them is refused (A31). `status` starts as `pending`.
**Why `deletedAt` is stored as `null`:** The task list query filters on `where('deletedAt', '==', null)`. A task stored without the field may not match that filter (unverified; Testing checks it), so every task stores `null` from creation (`docs/adr/0004-task-list-query.md`).
**Deletion:** Soft-delete: the owner's delete sets `deletedAt` and `updatedAt`. A deleted task can't be edited, completed, deleted again or restored (A30, AC-7.4, AC-7.6). Hard-delete is disabled in security rules, and no user, including the owner and admins, can erase a task (AC-7.3).
**Retention:** A deleted task is kept as a record for 30 days, then erased automatically, no earlier than 720 hours and no later than 792 hours after its `deletedAt` (spec R6, A21, AC-7.7). A daily Vercel scheduled job does the erasure and never touches a task that isn't deleted (AC-7.8). This is the only hard delete of tasks, recorded as a justified exception to "Soft-delete only" in `docs/SECURITY.md` (`docs/adr/0001-task-erasure-job.md`).
**Index:** The task list query needs one composite index on `tasks` (collection scope), defined in `firebase/firestore.indexes.json`:

| Position | Field       | Order      |
| -------- | ----------- | ---------- |
| 1        | `uid`       | Ascending  |
| 2        | `deletedAt` | Ascending  |
| 3        | `status`    | Descending |
| 4        | `dueDate`   | Ascending  |
| 5        | `createdAt` | Ascending  |

**Index query:** The `useTasks` hook (`frontend/src/features/tasks/hooks/useTasks.ts`, `docs/adr/0004-task-list-query.md`) runs one live query on `tasks`: `where('uid', '==', <the signed-in user's uid>)`, `where('deletedAt', '==', null)`, `orderBy('status', 'desc')`, `orderBy('dueDate', 'asc')`, `orderBy('createdAt', 'asc')` and `limit(20 * page + 1)`. Page N reads up to 20 * N + 1 tasks, and the extra one only shows whether a next page exists.
**Index deployment:** The index is deployed by hand with `npx firebase-tools deploy --only firestore:indexes`, because `deploy.yml` deploys the rules only (`docs/CI-CD.md`, "Manual Deployment"). The task list query fails until the index exists (ADR-0004 marks that failure as unverified on a live project), so deploy the index to the test project before testing.
**Erasure query index:** The erasure route queries only `deletedAt` (`where('deletedAt', '<', cutoff)` with `orderBy('deletedAt')`), so it needs no composite index. It relies on Firestore's automatic single-field index, and `firebase/firestore.indexes.json` has an empty `fieldOverrides` list, so nothing there touches `deletedAt`. That the automatic index serves this query has not been checked on a live project (unverified).

**Access points (P2):** These are all the places where the feature reads or writes task data. A tester can send a direct request to each one, once with a signed-in test account's credentials and once with none. The Express backend is not an access point: `backend/src/routes/index.ts` mounts no routers, and `backend/src` has no tasks code.

| Access point | What it does | Guard | How to send a direct request |
| ------------ | ------------ | ----- | ---------------------------- |
| The page `GET /tasks` (route group `(dashboard)`) | Renders the page shell. It holds no task data; the list is loaded in the browser through the Firestore row below. | `requireAuth()` redirects to `/auth/signin` when signed out. | Open `/tasks` with no `__session` cookie and expect a redirect. With a valid cookie the page loads, still with no task data in it. |
| The Server Actions `createTask`, `updateTask`, `setTaskStatus` and `deleteTask` (`frontend/src/features/tasks/actions/tasks.actions.ts`) | Create, edit, set the status of, and soft-delete the signed-in user's own tasks. These are the only task writes. | `requireAuth()` is the first call in each action. A request without a valid session cookie is redirected to `/auth/signin`, which the spec counts as refused for a Server Action (SCR-1). After that, a strict Zod schema and an owner check inside a transaction apply (see the refusals below). | Called as `POST /tasks` with a `Next-Action` header. To get a request to copy, open the browser DevTools Network tab, perform the action in the app, then copy the `POST /tasks` request (for example with Copy as cURL). It carries the `__session` cookie and the `Next-Action` header. The action ID changes with each build, so copy it fresh. Remove the cookie to test signed out, and change the body to test other inputs. |
| The Firestore `tasks` collection, through the client SDK or the Firestore REST API | The task list's live listener reads it (`useTasks`). Nothing in the app writes to it from the browser. | `firebase/firestore.rules`, `match /tasks/{taskId}`: get, list or query and listen are allowed only to the signed-in owner of a non-deleted task (`isAuthenticated() && isOwner(resource.data.uid) && notDeleted()`). `allow create, update: if false` and `allow delete: if false`, so every write is refused for everyone, admins included. | REST base URL: `https://firestore.googleapis.com/v1/projects/<PROJECT_ID>/databases/(default)/documents/tasks`. Signed in: send `Authorization: Bearer <ID token>` with a `GET` on `.../tasks/<TASK_ID>` for one task, or a `POST` to `.../documents:runQuery` for a query. Signed out: send the same request with no `Authorization` header. To test writes, send a `PATCH` or `DELETE` to a task document or a `POST` to the collection URL. All writes should be refused, and so should any read of another user's task or of a deleted task. A plain list of the whole collection is also expected to be refused, because it could return other users' tasks (ADR-0004). The expected refusal is the database's own permission-denied response, which A39 allows. This has not been checked against a live project here. |
| `GET /api/cron/erase-deleted-tasks` | Permanently erases tasks whose `deletedAt` is old enough (see the erasure schedule below). It returns counts only. | No user is involved. The `Authorization` header must equal `Bearer <CRON_SECRET>`, compared in constant time. The route returns 401 without it, and 401 while `CRON_SECRET` is unset or invalid, so it refuses every request until a valid secret is set. | `curl -i https://<app URL>/api/cron/erase-deleted-tasks` should return 401. With the secret: `curl -i -H "Authorization: Bearer <CRON_SECRET>" https://<app URL>/api/cron/erase-deleted-tasks`. A valid call really erases expired tasks, so use it on a test project only. `HEAD` is expected to behave like `GET` (Next derives it from the `GET` export, per the code review; not run here). |

**Server Action refusals:** Every action refuses an `id` that contains `/`, is `.` or `..`, looks like `__x__` or is over 1,500 bytes, before the database is called. A database failure returns a fixed message, never library text.

| Action | Refused when |
| ------ | ------------ |
| `createTask` | The body has any field other than title, description, due date and status, including any system field (`uid`, `createdAt`, `updatedAt`, `deletedAt`, `_schemaVersion`), whatever its value. The title is missing, only whitespace, or over 200 characters. The description is over 10,000 characters. The due date is missing, is not an ISO 8601 string with a timezone offset, is not to the minute, is in the past, or is more than 10 years ahead. The status is anything other than `pending`. The owner always comes from the session. |
| `updateTask` | The body has any field other than `id`, title, description and due date, so `status` and every system field are refused even with the current value. None of title, description and due date is sent. A sent field breaks the rules above. The due date differs from the stored one and is in the past or more than 10 years ahead. The task is missing, belongs to another user or is deleted, which all return "This task no longer exists." |
| `setTaskStatus` | The body has any field other than `id` and `status`, or the status is not `pending` or `completed`. The task is missing, belongs to another user or is deleted, with the same message as above. |
| `deleteTask` | The body has any field other than `id`. The task is missing, belongs to another user or is already deleted, with the same message as above. It only sets `deletedAt` and `updatedAt`; no action erases or restores a task. |

**Erasure schedule (P6):** The erasure runs once a day at 16:00 UTC (`0 16 * * *`, set in `frontend/vercel.json`). Per ADR-0001, on the Hobby plan a run can start anywhere within that hour, and a failed run is not retried.
**Erasure window:** The route erases a task when its `deletedAt` is more than 720 hours old. It also takes a 5 minute clock skew margin off the cutoff, so a task is never erased before 720 hours and 5 minutes. While daily runs happen, it is erased by 792 hours at the latest (A21, AC-7.7). Per ADR-0001, one missed run is tolerated and two in a row may not be. A run also stops after a time budget and reports `done: false`, so a large backlog can take more than one run. The time budget is a guess in the route, not a documented Vercel limit (unverified).
**Checking erasure on a test project:** Don't wait 30 days. Follow these steps:

1. Create two tasks and delete both in the app, so each has a `deletedAt`. Also keep one task that is not deleted.
2. Edit the stored records directly (test setup only, which A30 allows on a test project). Set `deletedAt` on one deleted task to 721 hours before now and on the other to 719 hours before now.
3. Call the route by hand: `curl -H "Authorization: Bearer <CRON_SECRET>" https://<test app URL>/api/cron/erase-deleted-tasks`.
4. Read the response. It holds counts only: `erased`, `skipped`, `done` and `stopped`. `stopped` is `no-more-pages` when the run reached the end and `time-budget` when it stopped early. `skipped` counts documents the query returned that the route's own re-check refused to delete.
5. Check the stored records. The task at 721 hours must be gone, the task at 719 hours must survive, and the task that is not deleted must be untouched (AC-7.8).
6. Call the route again. It should erase nothing more, because running it twice is harmless.

**Why testers call it by hand:** Whether Vercel runs scheduled jobs on non-production deployments is unverified (ADR-0001), so a test project can't rely on the schedule. Put the secret in the command only as the placeholder `<CRON_SECRET>`.

---

<!-- Add new collection schemas below -->
