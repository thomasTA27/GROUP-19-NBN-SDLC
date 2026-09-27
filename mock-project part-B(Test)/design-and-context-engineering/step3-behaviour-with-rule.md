# Step 3 behaviour check: planning a "due this week" filter with `tasks.md` loaded

**Task:** plan how to add a filter to the task list that shows only tasks due this week, without writing code. This file was drafted with an AI assistant (Claude Code), on 2026-09-27. It ran in the same session as `step3-load-check.md`, so `.claude/rules/tasks.md` was already in context. `frontend/CLAUDE.md` loaded when the agent first read a file under `frontend/` (`src/hooks/useFirestore.ts`).

## Summary

- **Not buildable yet.** The task list doesn't exist (there's no `frontend/src/features/tasks/`), and `task-crud-spec.md` §9 puts "search or filtering" out of scope for the Task CRUD ticket. The filter needs its own ticket, acceptance criteria and product owner decisions, and has to follow the Task CRUD build.
- **Recommended design:** a second live query, used only while the filter is on. It fetches the owner's non-deleted tasks due between the start and end of the viewer's current week. The browser sorts the results in the list's order and splits them into pages of 20.
- **The week is worked out in the browser,** in the viewer's timezone, like the due date display (rule 4, ADR-0003).
- **No security rules change and no Server Action.** The filter only reads.
- **One new composite index,** deployed by hand with approval.
- **About 9 files,** so building waits for this plan to be confirmed (`development-workflow.md`).

## Decisions needed before building

| # | Question | Recommendation | Why |
|---|---|---|---|
| Q1 | Which day does a week start on? | Monday | ISO 8601 and the Australian convention. The app formats dates as `en-AU`. |
| Q2 | Whose timezone decides "this week"? | The viewing device's | Matches how due dates are shown (A5, AC-2.5). Near midnight on Sunday, two devices in different timezones can show different tasks. |
| Q3 | Are tasks due earlier this week, and already passed, included? | Yes, the whole calendar week | "This week" reads as the calendar week. Marking overdue tasks stays out of scope (A11). |
| Q4 | Are completed tasks included? | Yes, below pending ones, as in the full list | Keeps AC-4.4's order and lets users untick them. |
| Q5 | Does the filtered view page at 20? | Yes, as in AC-4.7a and AC-4.7b | One paging rule for both views. |
| Q6 | Does the filter survive a reload? | Yes, kept in the page URL | Reload and the back button keep it. The URL can only ever show the viewer's own tasks. |
| Q7 | What does an empty week show? | "No tasks due this week", with a button to show all tasks | `docs/DESIGN.md` "State Patterns". AC-4.9 only covers a user with no tasks at all. |
| Q8 | Does the control show which dates the week covers? | Yes, for example "28 Sep – 4 Oct" | Users can see which days count without guessing the week's start. |

## How the filter would work

### The query

- **Filter off:** the list uses the Task CRUD query unchanged (ADR-0004: the first 20 × N tasks).
- **Filter on:** one live query in the browser for tasks where the owner is the signed-in user, `deletedAt` is null, and the due date is on or after the start of the week and before the start of the next week, ordered by due date.
- **Sorting and paging happen in the browser.** The results are sorted pending first, then by due date, then by creation time (AC-4.4), and split into pages of 20.
- **Every query keeps the owner filter and `where('deletedAt', '==', null)`.** Rule 2 requires it, and without both the read rule refuses the whole query, because security rules are not filters (ADR-0004).

### Why this query

| Option | Verdict |
|---|---|
| **W1: one live query for the week, sorted and paged in the browser** | Recommended. Every page stays exact after any change (AC-4.11a), and the query orders by the field it filters on. Reads equal the number of tasks due this week, which is usually small. |
| W2: filter ADR-0004's loaded list in the browser | Wrong results. That query only loads the first 20 × N tasks, so tasks due this week that sort later are missed. Every completed task sorts after every pending one. |
| W3: add the date range to ADR-0004's query, still sorted by status first | Firebase's docs disagree on whether it's allowed. "Order and limit data" says that with a range filter "your first ordering must be on the same field". "Multiple range fields" allows it, but says Firestore then reads every index entry that matches the equality filters (both checked 2026-09-27). |
| W4: two queries, pending and completed, each with the date range and a 20 × N limit | Keeps ADR-0004's read limit, but doubles the live connections and makes paging join two lists. Worth it only if W1's worst case isn't acceptable. |

**W1's worst case:** a user with all 1,000 test tasks (A33) due this week reads 1,000 tasks on each load. That's the same as ADR-0004's cost for page 50.

**W1 needs its own ADR.** ADR-0004 rejected loading every task for the full list (D3). The difference here is that one week's tasks is a smaller, bounded set.

### Working out "this week"

- **In the browser only.** A Client Component works out the week from the device's clock and timezone, and turns both ends into Timestamps for the query. Vercel's server timezone is unverified (ADR-0003), so a week worked out on the server could be a day off for some viewers.
- **Half-open range:** from Monday 00:00 up to, but not including, the next Monday 00:00. A task due Sunday 23:59 is in, and one due Monday 00:00 belongs to next week.
- **Count calendar days, not hours.** The end is 7 calendar days later at local midnight, not 168 hours later. In Sydney, the week of 28 September 2026 has 167 hours, because clocks go forward on Sunday 4 October (checked in local Node).
- **Rollover:** if the page is open when the week ends, the range moves on at the next Monday 00:00, and again whenever the tab becomes visible, since browsers slow down timers in background tabs. A new range means a new query.
- **No new date library.** ADR-0003 found none installed, and the built-in date methods are enough to find local midnight.

### The interface

- **A two-option control above the list:** "All tasks" and "Due this week", showing the week's dates (Q8). It's either buttons that expose their pressed state or a labelled radio group, following `docs/DESIGN.md` "Accessibility".
- **Changing the filter goes back to page 1.**
- **Loading, empty and error states** follow `docs/DESIGN.md` "State Patterns", with two exceptions:
  - The empty state says "No tasks due this week" (Q7).
  - A failed load shows ADR-0006's fixed wording, "Tasks couldn't be loaded. Please refresh the page.", and never `error.message` (rule 5). This matters more for a new query: until the new index is deployed, Firestore refuses the query with a technical message about the missing index.
- **The page stays a Server Component.** The control and the list are Client Components, because they use hooks and event handlers (`frontend/CLAUDE.md`).

### Security rules

- **No change to `firebase/firestore.rules`.** The filter doesn't write, so rule 1 isn't affected.
- **The planned read rule already allows this query.** ADR-0002's rule allows owner-only reads of non-deleted tasks, and the query filters on those same two fields. That read rule isn't written yet (see `step3-load-check.md`).
- **No `isAdmin()` or `hasCustomClaim()`** anywhere (rule 1).

## Files

The Task CRUD ticket builds these first: the task list component, its query hook, the tasks collection function and type, the tasks read rule, and ADR-0004's index.

| File | Change |
|---|---|
| `frontend/src/features/tasks/hooks/useCurrentWeek.ts` | New. Works out this week's start and end in the browser, and moves them on at rollover. |
| The task list's query hook (from Task CRUD) | Adds the W1 query while the filter is on, then sorts and pages its results. |
| The task list component (from Task CRUD) | Reads the filter from the URL, passes it to the hook, resets to page 1, and shows the filtered empty state. |
| `frontend/src/features/tasks/components/DueFilter.tsx` | New. The two-option control. |
| `firebase/firestore.indexes.json` | Adds a composite index on owner, `deletedAt` and due date. |
| `docs/adr/0007-task-week-filter.md` | New. Records W1 over W2 to W4, and the answers to Q1 to Q8. |
| `docs/FIRESTORE-SCHEMA.md` | Adds the week query and its index to the `tasks` section. |
| `frontend/tests/unit/features/tasks/` | The tests below. |
| The spec | New acceptance criteria for the filter, through Planning and Gate 1. |

If the Task CRUD ticket hasn't already changed `useCollection()` to restart when its query changes, `frontend/src/hooks/useFirestore.ts` becomes a tenth file. The CLAUDE.md Codebase Map then has to be updated in the same change (CLAUDE.md "Harness integrity").

## Tests

- **Week range, in more than one timezone:** Monday 00:00, Sunday 23:59, a week that crosses a month end and a year end, and the Sydney week of 28 September 2026. How to set the timezone for a Vitest run still has to be checked.
- **Rollover:** with fake timers, crossing Monday 00:00 changes the range and restarts the query.
- **Query hook** (`renderHook`, mocked client SDK): with the filter on, the query has the owner filter, the `deletedAt` filter and both ends of the range. It also covers the loading, loaded and error results (A37).
- **List:** pending before completed within the week, 21 tasks due this week make two pages, the empty state, and a failed load that shows ADR-0006's wording, not the error's message.
- **On a test project (P1, P2):**
  - User A's filtered list has none of user B's tasks.
  - The query runs under the real read rule.
  - Before the index is deployed, the page shows the fixed failure wording.
- **Two devices in two timezones:** near midnight on Sunday, a task is in one device's week and not the other's (Q2).

## Order of work

1. **Planning:** a new ticket, acceptance criteria, product owner answers to Q1 to Q8, and Gate 1.
2. **Wait for Task CRUD** to merge.
3. **Branch:** `feat/task-week-filter`, following the repo-root `../CLAUDE.md`. The mock project's `CLAUDE.md` would say `feature/task-week-filter`, so this needs confirming (see `step3-load-check.md`).
4. **Write ADR-0007.**
5. **Build and test** in the order of the Files table. Verify with `pnpm run typecheck`, `pnpm run lint` and `pnpm run test`. The `/verify` skill isn't loaded in this setup.
6. **Index:** add it to `firestore.indexes.json`. Thomas deploys it by hand, with approval (ADR-0004). The agent doesn't run `firebase deploy` or change `deploy.yml`.
7. **Before the PR:** run the `security-reviewer` agent.

## Rules that shaped this plan

| Plan decision | Rule | Source |
|---|---|---|
| Every filter query filters on the owner and on `deletedAt` being null | Rule 2: never query `tasks` without `where('deletedAt', '==', null)`, because security rules are not filters | `.claude/rules/tasks.md` (ADR-0004) |
| No rules change, no write, no Server Action, no admin helpers | Rule 1 | `.claude/rules/tasks.md` (ADR-0002) |
| The week is worked out in the browser | Rule 4's reason, the viewer's timezone, applied to working out a range as well as to formatting | `.claude/rules/tasks.md` (ADR-0003) |
| Fixed failure wording, never `error.message` | Rule 5 | `.claude/rules/tasks.md` (ADR-0006) |
| No transaction step | Rule 3 doesn't apply, because the filter doesn't write | `.claude/rules/tasks.md` |
| The page stays a Server Component; the control and list are Client Components | "Server vs Client Components" | `frontend/CLAUDE.md` |
| Check `node_modules/next/dist/docs/` before relying on how Next.js 16 reads the URL | "Next.js 16" | `frontend/CLAUDE.md` |
| Tests in `frontend/tests/unit/`, `renderHook` for hooks, no page tests | "Testing" | `frontend/CLAUDE.md` |
| The index is deployed by hand, with approval | "Agent Permissions" | `CLAUDE.md`, and ADR-0004 |
| Update the Codebase Map if `useCollection()` changes | "Harness integrity" | `CLAUDE.md` |
| Plan and confirm before building | "Planning for non-trivial tasks" (more than 3 files) | `.claude/rules/development-workflow.md` |
| Check Firebase's docs before relying on a query limit | Step 0. context7 isn't loaded, so the docs were fetched directly | `.claude/rules/development-workflow.md` |
| Needs its own ticket | §9 Scope: "search or filtering" is out of scope | `task-crud-spec.md` |

## Notes on the rules

- **Rule 4's wording is narrower than its reason.** It says never *format* a due date on the server. Working out "this week" on the server has the same timezone problem, but the rule doesn't say so. This plan followed ADR-0003's reason, not the rule's wording. An agent that follows only the wording could work out the week in a Server Component.
- **Rule 2 was applied as written.** It is why the plan rejects any query that drops the `deletedAt` filter.
- **Rule 5 matters more for a new query.** The most likely failure is the missing-index error while the index waits to be deployed.
- **The existing examples point the wrong way for errors.** `NotesList.tsx` ignores `error`, and `docs/DESIGN.md`'s error state shows `error.message` (`step3-conflict-check.md`, finding 4).

## Risks and unverified points

- **`useCollection()` may restart on every render, not never.** Its effect depends only on `collectionRef` (`useFirestore.ts:53`), but `typedCollection()` makes a new reference on every call (`firestore.ts:9-11`), and `NotesList` calls it while rendering. If so, the effect runs again after every render, which doesn't match ADR-0004's reading that the hook never restarts. This is unverified and should be checked before Task CRUD builds on the hook. The filter needs a hook that restarts exactly when the query changes. Firestore's `queryEqual` looks like the tool for that, but its type in `node_modules` still has to be checked.
- **ADR-0004's index probably can't serve the week query,** because status sits between `deletedAt` and the due date in it (unverified).
- **Local midnight in some timezones:** in timezones where clocks change at midnight, how the browser resolves that midnight is unverified.
- **Vercel's server timezone** doesn't matter to this plan, as long as nothing about the week runs on the server.
