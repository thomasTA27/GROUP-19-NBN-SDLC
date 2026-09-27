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

<!-- Add new collection schemas below -->

## `tasks` collection

**Path:** `/tasks/{taskId}`
**Access:** Owner-only read of tasks that are not deleted. **All writes go through Server Actions** (`createTask`, `updateTask`, `setTaskStatus`, `deleteTask`). Security rules deny every client-SDK create, update and delete. See `docs/adr/0001-task-writes-via-server-actions.md`.

| Field            | Type                         | Required | Description                                                                 |
| ---------------- | ---------------------------- | -------- | --------------------------------------------------------------------------- |
| `uid`            | `string`                     | Yes      | Owner's Firebase Auth UID, taken from the session. Immutable                |
| `title`          | `string`                     | Yes      | Trimmed, 1–100 chars, single line                                           |
| `description`    | `string`                     | Yes      | Trimmed, ≤2 000 chars, `''` when empty                                      |
| `dueDate`        | `string \| null`             | Yes      | Calendar date `YYYY-MM-DD`, or `null` when not set. **Not a `Timestamp`**, see below |
| `status`         | `'pending' \| 'completed'`   | Yes      | `'pending'` on create. Changed only by `setTaskStatus`                      |
| `createdAt`      | `Timestamp`                  | Yes      | Creation time (server)                                                      |
| `updatedAt`      | `Timestamp`                  | Yes      | Last update, status change or delete (server)                               |
| `deletedAt`      | `Timestamp \| null`          | Yes      | `null` until soft-deleted, then set once. See `docs/adr/0004-deleted-at-required-null.md` |
| `_schemaVersion` | `1`                          | Yes      | Schema version for lazy migration                                           |

**Why `dueDate` is a string:** this is a deliberate exception to the `Timestamp` convention. The due date is date-only (spec D5), and Firestore has no date-only type. A `Timestamp` would move the date across midnight for users in other time zones.

**Deletion:** Soft delete only. `deleteTask` sets `deletedAt` and `updatedAt`. The list query must filter `where('uid', '==', uid)` and `where('deletedAt', '==', null)`, or the security rules deny it.
