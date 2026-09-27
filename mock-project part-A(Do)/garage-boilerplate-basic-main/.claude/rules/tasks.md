---
paths:
  - "frontend/src/features/tasks/**"
  - "firebase/firestore.rules"
---

# Tasks feature rules (from ADR-0001 to ADR-0004 and spec D5)

- Never write to `tasks` with the Firestore client SDK, and never open a create, update or delete rule for `tasks`. Use the Server Actions `createTask`, `updateTask`, `setTaskStatus` and `deleteTask` instead. See docs/adr/0001-task-writes-via-server-actions.md.
- Never check a task's ownership or deleted state outside `adminDb.runTransaction()`, and never write that check inline. Call the shared `getOwnedActiveTask` helper. See docs/adr/0002-transactional-ownership-check.md.
- Never sort tasks with Firestore `orderBy('dueDate')`, because it puts `null` due dates first. Sort in the client with the sort helper. See docs/adr/0003-sort-tasks-in-client.md.
- Never create a task without `deletedAt: null`, and never query `tasks` without `where('deletedAt', '==', null)`. This is a query filter, not a security rule change: the `tasks` read rule stays `notDeleted()`, as the spec's Security rules section defines it. See docs/adr/0004-deleted-at-required-null.md.
- Never convert `dueDate` to a Firestore `Timestamp`. Store it as a `YYYY-MM-DD` string or `null`, because a `Timestamp` shifts the date across time zones (spec D5).
