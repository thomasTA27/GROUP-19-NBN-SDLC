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

---

<!-- Add new collection schemas below -->
