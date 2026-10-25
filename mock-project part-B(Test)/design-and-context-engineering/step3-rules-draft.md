# Step 3 draft: proposed rules for `.claude/rules/tasks.md`

**Status: proposal only.** `.claude/rules/tasks.md` has not been created. This file was drafted with an AI assistant (Claude Code), from `docs/adr/0001` to `0006`.

**Before adopting:**
- **The ADRs aren't accepted yet.** All six are still Proposed. The module says rules are drafted "from accepted ADRs" (`white-paper/modules/design-and-context-engineering.md`, AI-Assisted Workflow step 3). So these rules should wait until the ADRs they cite are accepted.
- **Four rules contradict existing context files.** See "Conflicts with existing context files" below. Checklist (e) says to resolve these first, because when two rules disagree, "you can't predict which one the agent follows".

## Proposed file

```markdown
---
paths:
  - "frontend/src/features/tasks/**"
  - "frontend/src/app/**/tasks/**"
  - "firebase/firestore.rules"
---

# Tasks feature rules (from ADR-0002 to ADR-0006)

- Never write to `tasks` from the browser, never open a create, update or delete rule for `tasks`, and never use `isAdmin()` or `hasCustomClaim()` for tasks, in the rules or in actions. Every task write is a Server Action that calls `requireAuth()`, validates with Zod and checks the owner before writing with the Admin SDK. See docs/adr/0002-task-data-routes.md.
- Never create a task without `deletedAt: null`, and never query `tasks` from the browser without `where('deletedAt', '==', null)`. Firestore refuses the whole query if it could return a task the read rule blocks. See docs/adr/0004-task-list-query.md.
- Never let a task Server Action write outside a Firestore transaction that first reads the task and checks the owner and that `deletedAt` is null. Never let an edit include `status` or fields the user didn't change, and never make the toggle a flip: the set-status action takes the target status. See docs/adr/0005-task-writes.md.
- Never format or render a task's due date on the server, including in a Server Component. `formatDatetime` uses the timezone of wherever it runs, so due dates are formatted in the browser to show in the viewer's timezone, and the task list and edit view are Client Components. See docs/adr/0003-due-date-storage.md.
- Never show a Firestore, Zod or other library `error.message` to the user, never leave a check in the task Zod schema without a custom rule-and-limit message, and never add fields to the shared `ActionResult` for tasks. Task actions return the tasks result type, which adds one `field`; database and list-load failures use fixed wording. See docs/adr/0006-task-errors.md.
```

## Scope (`paths`)

- **`frontend/src/features/tasks/**`:** the feature folder, holding actions, hooks, components and types (frontend/CLAUDE.md "File Organization").
- **`frontend/src/app/**/tasks/**`:** the tasks page and edit view under `app/(dashboard)/tasks/`.
  - The glob avoids writing the `(dashboard)` parentheses.
  - It doesn't match the erasure route, `app/api/cron/erase-deleted-tasks/`, because that folder isn't named `tasks`. Rules 2 and 3 are worded so they wouldn't apply to that route anyway.
- **`firebase/firestore.rules`:** for rule 1.
  - The rules then also load when someone edits the `notes` or `users` rules. Every rule names `tasks`, so they shouldn't affect those collections.
- **Claim marks:**
  - The `paths:` format follows Part A's `.claude/rules/tasks.md` (verified).
  - How Claude Code matches these globs, and when it loads the file, is unverified.

## Why each rule is needed

| # | ADR | Why an agent can't infer it from the code |
|---|---|---|
| 1 | ADR-0002 | The code points the other way. The `notes` rules let the browser create and update notes (`firestore.rules:64-70`). The `/firebase-collection` skill's template allows owner create, update and delete (`.claude/skills/firebase-collection.md:60-65`). The `users` rules give admins read access with `isAdmin()` (`firestore.rules:43`). The "no admin access" rule comes from R1 and SCR-2, not from any code. |
| 2 | ADR-0004 | The `notes` feature never stores or filters `deletedAt`. `createNote` writes no `deletedAt` (`notes.actions.ts`), and `NotesList` queries by owner only (`NotesList.tsx`). An agent copying notes would leave it out. |
| 3 | ADR-0005 | The precedents write without a transaction. `createNote` does a single `add` with no transaction, frontend/CLAUDE.md's Server Action example does a plain `update`, and DESIGN.md's form pattern submits every field. The rules on "no status in an edit" and "set, not flip" come from SCR-5 and ADR-0005, not from code. |
| 4 | ADR-0003 | The project's defaults push date formatting onto the server. CLAUDE.md says "Server Components by default", and `formatDatetime` sets no timezone (`utils.ts:16-24`). So the natural move renders dates in the server's timezone. |
| 5 | ADR-0006 | The documented patterns show library text. DESIGN.md's error state displays `error.message`, and frontend/CLAUDE.md's Server Action example and `createNote` return Zod's first message. `useCollection()` passes Firestore's raw error through (`useFirestore.ts:45-47`). |

## Conflicts with existing context files (checklist (e))

| Rule | Conflicts with | What disagrees |
|---|---|---|
| 1 | `.claude/skills/firebase-collection.md`, security rules template (lines 60-65) | The skill's template allows owner create, update and delete, and its read rule has no `notDeleted()`. This is the context fix already recorded for step 3 in `design-step1-sort.md` (item 3). |
| 3 | `docs/DESIGN.md` "Forms"; frontend/CLAUDE.md "Server Actions" example | The form pattern submits every field, and the action example does a plain `update` with no transaction. Both are examples rather than stated rules, but an agent following them breaks rule 3. |
| 4 | frontend/CLAUDE.md "Never add `'use client'` to: Files that only fetch data and render HTML" | This is a "Never" rule against a "Never" rule. A component that only displays a due date would be a Server Component under frontend/CLAUDE.md, but must render in the browser under rule 4. The list and edit form need `'use client'` anyway, because they use hooks and a form, so the clash is limited to display-only pieces. |
| 5 | `docs/DESIGN.md` "State Patterns › Error"; frontend/CLAUDE.md "Server Actions" example | Both show a library's own error text: `error.message`, and `parsed.error.errors[0]?.message`. |

Rule 2 conflicts with nothing. CLAUDE.md's soft-delete convention ("add `deletedAt: Timestamp`") fits a task that stores `null` until it's deleted.

## Considered and left out

- **ADR-0001 (the erasure job):** The route's own code will show the secret check, the 720-hour filter and the batching. `docs/SECURITY.md` will record the exception to "Soft-delete only" (D4), and rule 1 already forbids a browser delete rule.
- **ADR-0002 (timestamps from `Timestamp.now()`):** This is visible in the task actions, and it matches the `notes` precedent (`notes.actions.ts:25`).
- **ADR-0003 (the 28 February limit, and refusing seconds):** Both live in the shared validation schema, and D2a's boundary tests cover them.
- **ADR-0004 (paging with `limit(20 × N)`, not cursors):** This is visible in the query code, but the reason isn't: cursors break AC-4.11a on later pages. It is the strongest candidate left out. It would need a sixth rule, or to replace one of the five.
- **ADR-0004 (who deploys the index):** This is a process step, not a coding rule.
- **ADR-0006 (one Zod schema shared by the browser and the server):** This is visible in the code, because both sides import the same schema.
