# Step 3 conflict check: `.claude/rules/tasks.md` against the existing context files

**Compared:** the five rules in `.claude/rules/tasks.md` (paths: `frontend/src/features/tasks/**`, `frontend/src/app/**/tasks/**`, `firebase/firestore.rules`) against:
- `CLAUDE.md`
- `frontend/CLAUDE.md`
- `backend/CLAUDE.md`
- `frontend/AGENTS.md`
- the only other file in `.claude/rules/`, `development-workflow.md`

None of those files has changed since the step 1 comparison. This file was drafted with an AI assistant (Claude Code), on 2026-09-27. It lists what it found and proposes no changes.

**Types used:**
- **Duplicate:** says the same thing as an existing rule.
- **Contradiction:** an agent can't follow both.
  - "By example" means the existing text is a code example, not a stated rule.
  - "Indirect" means the listed file points to another file that contradicts the rule.
- **Overlap:** covers the same ground and is compatible, but an agent needs both in view to get it right.

## Summary

- **Duplicates:** none exact. Rule 1 is a stricter version of frontend/CLAUDE.md's "preferred mutation pattern".
- **Contradictions:** 4.
  - **Direct, 1:** rule 4 against frontend/CLAUDE.md's "Never add `'use client'`" rule.
  - **Indirect, 2:** rule 1 through the tutorial walkthrough, and rule 5 through DESIGN.md.
  - **By example, 1:** rule 3 against frontend/CLAUDE.md's Server Action example.
- **Overlaps:** 7, all compatible.
- **No overlap:** `frontend/AGENTS.md`, and `backend/CLAUDE.md` in practice.

## Findings

| # | tasks.md rule | Existing text | Type | What happens |
|---|---|---|---|---|
| 1 | Rule 4: "Never format a task's due date on the server, including in a Server Component. Pass the Timestamp to a Client Component that formats it" | frontend/CLAUDE.md "Server vs Client Components": "**Never add `'use client'` to:** Files that only fetch data and render HTML" | Contradiction (direct) | A component that only formats and shows a due date "only renders HTML". frontend/CLAUDE.md says it must stay a Server Component, while rule 4 says it must be a Client Component. Both are "Never" rules, so an agent can't follow both. The list and the edit form use hooks and a form, so they need `'use client'` anyway. The clash is limited to display-only pieces. |
| 2 | Rule 4 | CLAUDE.md "React / Next.js": "**Server Components by default**" and "Add `'use client'` only when you actually need: React hooks, event handlers, or browser APIs." frontend/CLAUDE.md lists the same reasons. | Overlap (tension) | Rule 4 is an exception to the default. Neither CLAUDE.md file lists "needs the viewer's timezone" as a reason for `'use client'`. |
| 3 | Rule 1: "Never let the browser write to `tasks` … no create, update or delete rule for `tasks`" | CLAUDE.md Codebase Map: "A complete worked example (every file of a real feature, verified) is in `docs/TUTORIAL-WALKTHROUGH.md`". `development-workflow.md` step 0 makes the same point. | Contradiction (indirect) | Both files send an agent to the walkthrough for "standard feature work". The walkthrough's notes rules let the owner create and update from the browser (`docs/TUTORIAL-WALKTHROUGH.md:102-108`). Copying that pattern for tasks breaks rule 1. |
| 4 | Rule 5: "Never show or return a Firestore, Zod or other library error message for tasks (`error.message` …)" | frontend/CLAUDE.md "Design System": "See `docs/DESIGN.md` for the full design reference", including "Loading/error/empty state patterns" | Contradiction (indirect) | DESIGN.md's error state displays `error.message`, and `useCollection()` passes Firestore's raw error through. Following the referenced pattern for the task list shows exactly the text rule 5 forbids. |
| 5 | Rule 3: "Never write to an existing task outside a Firestore transaction that first reads it and checks that the owner matches and `deletedAt` is null" | frontend/CLAUDE.md "Server Actions" example: `await adminDb.collection('users').doc(session.uid).update(parsed.data)` | Contradiction (by example) | The only write example in the context files is a plain `update` with no transaction and no read first. It is for profiles, not tasks, but an agent copying it for tasks breaks rule 3. |
| 6 | Rule 5 | frontend/CLAUDE.md "Server Actions" example: `return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' }` | Overlap (compatible only with custom messages) | The pattern passes on whatever message the schema holds. It satisfies rule 5 only if every check in the tasks schema has a custom message. The `'Invalid input'` fallback is the app's own wording, so it's allowed. |
| 7 | Rule 3 | frontend/CLAUDE.md "Server Actions": "Never throw from a Server Action — return `{ success: false, error: '...' }`" | Overlap (interaction) | A failed owner or `deletedAt` check inside the transaction still has to come back as an `ActionResult`, not as an uncaught error. |
| 8 | Rule 3 | CLAUDE.md "Firestore": "Always call `requireAuth()` in Server Actions before any Firestore operation." frontend/CLAUDE.md: "Always call `requireAuth()` first" and "Always validate with Zod before any database operation". | Overlap (compatible) | The steps run in order: `requireAuth()`, then Zod, then the transaction. Rule 3 adds a step and doesn't repeat these, so it isn't a duplicate. |
| 9 | Rule 1: "Every task write is a Server Action." | frontend/CLAUDE.md "Next.js 16": "Server Actions are stable and the preferred mutation pattern" | Overlap (stricter duplicate) | frontend/CLAUDE.md prefers Server Actions, and rule 1 makes them the only way to write tasks. No conflict. |
| 10 | Rule 1: "no `isAdmin()` or `hasCustomClaim()` in any `tasks` rule" | CLAUDE.md Codebase Map, "Firestore rules helpers": "`isAdmin()` (Firestore read) · `hasCustomClaim(claim)` (no read)" | Overlap (narrowing) | The map lists the admin helpers as available, and rule 1 bans them for tasks. The map doesn't require using them, so both can hold. |
| 11 | Rule 2: "Never create a task without `deletedAt: null`" | CLAUDE.md "Firestore": "Use the soft-delete pattern (add `deletedAt: Timestamp`) instead of hard deletes." | Overlap (tension) | They are compatible, because the field is `null` until the task is deleted and a `Timestamp` after. But CLAUDE.md's "add `deletedAt: Timestamp`" suggests adding the field at deletion, typed as a `Timestamp` only. An agent reading only CLAUDE.md might leave the field out when creating a task. |
| 12 | Rule 2: "Security rules are not filters, so a query that could return a deleted task fails completely." | CLAUDE.md Codebase Map lists `notDeleted()` among the rules helpers | Overlap (compatible) | Rule 2's reason depends on the `tasks` read rule using `notDeleted()`. |
| 13 | Rule 5 | backend/CLAUDE.md "Error Handling": anything that isn't an `HttpError` "becomes a generic 500 (internals never leak to the client)" | Overlap in intent only | This is the same principle for the Express backend. Rule 5's paths don't cover `backend/`, and ADR-0002 uses no backend, so there's no practical overlap. |

## No overlap

- **`frontend/AGENTS.md`:** It holds one instruction, to read `node_modules/next/dist/docs/` before writing Next.js code, because this version has breaking changes. None of the five rules touches it.
- **`backend/CLAUDE.md`:** Apart from the shared intent in finding 13, its rules cover the Express backend, which the tasks rules' paths don't include.
- **`development-workflow.md`:** Apart from the walkthrough pointer in finding 3, its rules are about working practice: research first, verifying, planning, context management and commits. None of the five rules touches them.

## Outside the comparison, noticed while checking

These aren't conflicts with the listed files, but they affect whether the rules can be followed as written.

- **Rules 2 and 3 now cover every query of and write to tasks.** The draft limited them to queries from the browser and to Server Actions.
  - The erasure job (ADR-0001) queries tasks whose `deletedAt` is more than 720 hours old, and deletes them without a user.
  - If any of its code sits under `frontend/src/features/tasks/`, rule 2 forbids its query, because it doesn't filter on `deletedAt == null`. Rule 3 forbids its delete, because the task is deleted and has no owner check.
  - The route folder itself, `app/api/cron/erase-deleted-tasks/`, isn't matched by the paths.
- **Rule 4 says "Pass the Timestamp to a Client Component".** If a Server Component passes a Firestore `Timestamp` object as a prop, React may refuse it, because only plain objects can cross from server to client (unverified; `node_modules` isn't installed to check).
  - Under ADR-0002, the list and the edit view read in the browser, so their Timestamps don't normally come from a Server Component.
- **Rule 1 still contradicts `.claude/skills/firebase-collection.md`.** Its template allows owner create, update and delete (lines 60-65). That file isn't in this comparison, and the context fix is still open (`design-step1-sort.md`, item 3).
