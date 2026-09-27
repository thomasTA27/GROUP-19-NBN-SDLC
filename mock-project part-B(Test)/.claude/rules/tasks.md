---
paths:
  - "frontend/src/features/tasks/**"
  - "frontend/src/app/**/tasks/**"
  - "firebase/firestore.rules"
---

# Tasks feature rules (from ADR-0002 to ADR-0006)

- Never let the browser write to `tasks` or give admins access to them: no create, update or delete rule for `tasks` in `firebase/firestore.rules`, no `isAdmin()` or `hasCustomClaim()` in any `tasks` rule, and no task writes with the Firestore client SDK. Every task write is a Server Action. See docs/adr/0002-task-data-routes.md.
- Never create a task without `deletedAt: null`, and never query `tasks` without `where('deletedAt', '==', null)`. Security rules are not filters, so a query that could return a deleted task fails completely. See docs/adr/0004-task-list-query.md.
- Never write to an existing task outside a Firestore transaction that first reads it and checks that the owner matches and `deletedAt` is null. See docs/adr/0005-task-writes.md.
- Never format a task's due date on the server, including in a Server Component. Pass the Timestamp to a Client Component that formats it, so it shows in the viewer's timezone. See docs/adr/0003-due-date-storage.md.
- Never show or return a Firestore, Zod or other library error message for tasks (`error.message`, or a Zod check without a custom message). Use the rule-and-limit messages in the tasks schema and the fixed failure wording. See docs/adr/0006-task-errors.md.
