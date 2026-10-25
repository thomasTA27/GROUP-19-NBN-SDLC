# Plan: a "Due this week" filter on the task list

```
Status: Plan only. No code written.
Date: 2026-09-27
Drafted-with: Claude Code:claude-opus-5-5
Condition: .claude/rules/tasks.md not loaded (renamed to tasks.md.off). Neither that file nor step3-behaviour-with-rule.md was read.
```

**Sources read:** `task-crud-spec.md` (§9 and the Assumptions table), `docs/adr/0001` to `0006`, `docs/FIRESTORE-SCHEMA.md` (tasks section), `frontend/src/hooks/useFirestore.ts`, `frontend/src/lib/utils.ts`, `firebase/firestore.indexes.json`. Searched without reading in full: `firebase/firestore.rules`, `docs/SECURITY.md`, `docs/DESIGN.md`, `frontend/CLAUDE.md`, `docs/FRONTEND.md`, `task-crud-spec-change-requests.md`.

**How claims are marked:** as in the ADRs. "Verified" means checked in this repo today. "Unverified" means it has to be checked before it is relied on.

---

## 1. Blockers: resolve these before any design or build

1. **The spec rules filtering out.** §9 says: "Out of scope for this ticket: search or filtering; …" (verified: `task-crud-spec.md:312`).
   - This needs a spec change request (SCR-19) or a new ticket, answered by the product owner (Sajad Ali Akbari), before anything is built.
   - Building it now would add a feature the accepted spec excludes.
2. **The task list doesn't exist yet.**
   - There is no task code in `frontend/src` (verified: no matches for "task").
   - There are no `tasks` rules in `firebase/firestore.rules` (verified), and no indexes (verified: `firestore.indexes.json` is empty).
   - ADR-0001 to ADR-0006 are all `Proposed`.
   - The filter changes the ADR-0004 list query, so it lands after the list is built, or as part of it once SCR-19 is answered.

## 2. Questions for the product owner (to go in SCR-19)

"This week" has no definition in the spec. Each question has a proposed answer to confirm or change.

| # | Question | Proposed answer | Why it matters |
|---|----------|-----------------|----------------|
| Q1 | Calendar week or the next 7 days? | Calendar week, Monday 00:00 to the next Monday 00:00. | Today is Sunday 27 September 2026. Under a Monday-start week, today's filter shows only today's remaining tasks and overdue tasks from earlier in the week. Users may expect "the week ahead", which is a different feature ("due in the next 7 days"). |
| Q2 | Whose timezone decides the week? | The viewing device's, matching A5 and AC-2.5. | Two devices in different timezones can show the same user different tasks near a week boundary. |
| Q3 | Are tasks due earlier this week, and still pending, included? | Yes, because they are due this week. They aren't marked as overdue (A11). | Excluding them would turn this into a "due from now on" filter. |
| Q4 | Are completed tasks included? | Yes, listed below pending tasks, as in A10 and AC-4.4. | A "pending only" filter is a second, separate filter. |
| Q5 | Do paging and order stay the same? | Yes: 20 per page (A12), in the AC-4.4 order. | Decides the query design in section 3. |
| Q6 | Does the filter persist? | In the URL only (`/tasks?due=this-week`), so reload and the back button keep it. It isn't saved per user. The default is "All tasks". | Saving it per user would need a stored field and a write path. |
| Q7 | Does the filtered view update live? | Yes. AC-4.11a and AC-4.11b apply to it: a task whose due date moves into or out of the week appears or disappears within 3 seconds. When Monday 00:00 passes with the page open, the list moves to the new week without a reload. | Decides the rollover work in step 4 of section 4. |

SCR-19 would also:
- Edit §9 to say that filters other than "due this week" are out of scope.
- Add new acceptance criteria (drafted after the answers), for example:
  - A task due at Monday 00:00 local is shown.
  - A task due at the next Monday 00:00 is not shown.
  - The filtered view pages at 20 per page.
  - Live updates work in the filtered view.

## 3. Query design options

**Starting point (ADR-0004, option D2):** one live query with these parts:
- Filters: `uid ==` and `deletedAt == null`.
- Order: `status` descending, then `dueDate`, then `createdAt`.
- Limit: 20 × N, showing the last 20 as page N.

**W1: add a `dueDate` range to the same query** *(recommended if the ordering check below passes)*
- How it works:
  - Add `dueDate >= weekStart` and `dueDate < weekEnd`, as Timestamps computed in the browser.
  - Paging, order and live updates work exactly as in D2. Reads are limited to tasks due this week.
- **Risk (unverified):** Firestore's ordering rules when a query has a range filter.
  - Older Firestore docs said the first `orderBy` must be the range field. That would put `dueDate` before `status` and break "pending first" (AC-4.4).
  - Check the current docs (context7) before choosing W1.
- **Index:** it needs a second composite index. The exact field order is unverified; Firestore's missing-index error names it.
  - Thomas deploys it by hand, with approval, as in ADR-0004 and CLAUDE.md "Agent Permissions".

**W2: two live queries, one for pending and one for completed** *(fallback if W1's ordering isn't supported)*
- How it works:
  - Each query filters on `status ==` plus the `dueDate` range, and is ordered by `dueDate`, then `createdAt`.
  - Because `status` becomes an equality filter, the ordering problem goes away.
  - Page N reads 20 × N from each query, joins them with pending first, and shows the right slice.
- **Costs:**
  - Up to twice D2's reads.
  - Two live connections.
  - More complex paging code.

**W3: filter in the browser over the page that's already loaded** *(rejected)*
- Page 1 of "all tasks", once filtered, shows fewer than 20 tasks and misses matching tasks from later pages. That breaks AC-4.7a in the filtered view.

**W4: load every task due this week and sort and page them in the browser** *(last resort)*
- This works like ADR-0004's rejected D3, but only for one week.
- It needs the simplest index.
- Every load reads every task due this week: up to 1,000 at the A33 capacity, the same as D2's worst case.

## 4. Build steps (after SCR-19 is answered and the base list is built)

Paths assume the tasks feature follows the notes layout (`frontend/src/features/tasks/{actions,components}`).

1. **Week-range helper.** Add a pure function, `getWeekRange(now)` → `{ start, end }`, local to the feature (for example `features/tasks/lib/week.ts`).
   - It stays out of `lib/utils.ts` unless another feature needs it, so the Codebase Map doesn't change.
   - Use local-time calendar arithmetic:
     - Go to local midnight, then step back to Monday.
     - Get `end` by adding 7 calendar days, not 7 × 24 hours.
     - Weeks with a clock change then last 167 or 169 hours and still end at Monday 00:00 local time.
   - Use the device clock. This is unlike A26, which uses the server's clock for "past". It's acceptable for a read-only filter, because a wrong device clock only changes what that user sees, never what is stored.

2. **Make `useCollection()` restart its query when the constraints change.**
   - Today it restarts only when the collection changes (verified: `useFirestore.ts:52`).
   - ADR-0004 already needs this fix for paging. The filter reuses the same fix, so there is only one change to the shared hook.
   - If the hook's signature changes, update the CLAUDE.md Codebase Map in the same change ("Harness integrity").

3. **One query builder for the tasks feature.** It takes `{ page, filter, weekRange }` and returns the constraint list.
   - With the filter on, it adds the range constraints (W1) or switches to the two queries (W2).
   - It always keeps `uid ==` and `deletedAt == null`.

4. **Week rollover.**
   - While the filter is on, set a timer for `end` that recalculates the range.
   - Also recalculate when the tab becomes visible again (`visibilitychange`), because a sleeping laptop misses timers.

5. **Filter state in the URL.**
   - Read `?due=this-week` with `useSearchParams` in the client list component.
   - Treat any other value as "All tasks", because a URL can't be trusted.
   - Changing the filter goes back to page 1.
   - Next.js 16 may require a Suspense boundary around `useSearchParams` (unverified: check context7).

6. **UI.**
   - **Control:** a two-option control above the list, "All tasks" and "Due this week".
     - `docs/DESIGN.md` has no filter or toggle pattern (verified by search), so this is new.
     - Use buttons with `aria-pressed`, which are keyboard reachable and have `focus-visible:` styles (DESIGN.md "Accessibility").
     - It must fit a 320px screen (A23).
   - **Date range:** show it beside the control, formatted in the browser with `formatDate` (for example "28 Sep 2026 – 4 Oct 2026").
   - **Empty state:** `<EmptyState title="No tasks due this week" />`, with an action back to "All tasks". It is separate from the "no tasks at all" state.
   - **Errors:** use ADR-0006's fixed wording. A missing index is the most likely new failure, and Firestore's raw error includes an index-creation link, which must never be shown (AC-8.5).

7. **Security rules: no change.**
   - The filtered query still includes `uid ==` and `deletedAt == null`, so it meets the "rules are not filters" condition (ADR-0004).
   - Add a rules test: the filtered query succeeds, and the same query without either equality filter is refused.
   - No Server Action or write path changes, so security review is likely not required. The PR should say this and why.

8. **Index.**
   - Add the new index to `firestore.indexes.json`.
   - Thomas deploys it by hand, with approval, before the frontend change reaches `main`. The frontend deploys on every push to `main` (verified: `docs/CI-CD.md`, as cited in ADR-0001), and the query fails until the index exists (unverified).

9. **Docs.**
   - **ADR-0007:** the week definition and the W1 or W2 choice, with the rejected options.
   - **The spec, through SCR-19:** the §9 edit and the new acceptance criteria.
   - **`docs/FIRESTORE-SCHEMA.md`:** note that the week filter also depends on `deletedAt: null`.
   - **`docs/DESIGN.md`:** the filter control, if it is meant to be reused.

## 5. Tests

- **`getWeekRange` unit tests (Vitest)**, each run under a fixed `TZ`:
  - Exactly Monday 00:00. Sunday 23:59. Today, Sunday 27 September 2026, where the week is 21 to 28 September.
  - The week clocks go forward in `Australia/Sydney`: 28 September to 5 October 2026. It lasts 167 hours. The date comes from the IANA database; unverified here.
  - The week clocks go back: 29 March to 5 April 2027. It lasts 169 hours.
  - `Australia/Perth` (no clock changes). A week that crosses the new year: 28 December 2026 to 4 January 2027.
  - Changing `process.env.TZ` while tests run is unverified on Windows, which is the dev machine. A fallback is a separate Vitest run per timezone.
- **Query builder:** with the filter on, both range constraints are present and both equality constraints are kept.
- **Component tests (Testing Library):**
  - The control updates the URL and goes back to page 1.
  - `aria-pressed` reflects the current filter.
  - The empty-state wording is correct.
  - The error state never shows raw Firestore text.
- **Acceptance on the test project:**
  - Boundary tasks: due Monday 00:00 is shown, due Sunday 23:59 is shown, due the next Monday 00:00 is not.
  - Moving a due date into and out of the week updates two open tabs within 3 seconds.
  - Filtered paging works at 1,000 tasks.
  - With the index missing, the error shows ADR-0006's wording.

## 6. Order of work

1. Raise SCR-19 and wait for answers to Q1 to Q7. Nothing below starts before then.
2. Check W1's ordering in the Firestore docs, then write ADR-0007.
3. Build the base task list (ADR-0002 to ADR-0006), including the `useCollection()` restart fix.
4. Build and test the helper, then the query builder, then the UI. `/checkpoint create` after each.
5. Add the index file, and ask Thomas to deploy the index.
6. Run `/verify`, then open a draft PR noting that no security review is needed and why.

## 7. Open risks

- **W1's ordering (unverified).** If it's unsupported, W2 roughly doubles reads and makes paging more complex.
- **Week definition.** It may not match what users expect, especially on Sundays (Q1).
- **Timezone.** A device with the wrong timezone or clock sees the wrong week. This is accepted for a read-only view.
- **Index before deploy.** If the index isn't deployed before the frontend change reaches `main`, the filtered view fails in production.

---

Cost: _pending: paste the `/cost` output here_
