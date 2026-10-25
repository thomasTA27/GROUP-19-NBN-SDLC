# Step 2 consistency check: does the spec contradict itself?

**Question:** Do any decisions, assumptions or out-of-scope notes in `task-crud-spec.md` contradict each other?

**Source:** `task-crud-spec.md` as approved at Gate 1. It has had no changes since commit `ba215cb`.

**Date:** 2026-09-27. Drafted with an AI assistant (Claude Code). This file quotes and explains conflicts. It doesn't propose changes.

## What was checked

- **Decisions:**
  - the Status line and "How to read this spec"
  - Resolved questions R1–R6 and "How the answers are applied"
  - "Conflicts with the ticket and project rules"
  - Gate 1 decisions
  - Test prerequisites
- **Assumptions:** A1–A38.
- **Out-of-scope notes:** §9 and "What was cut".
- **Criteria:** where a criterion carries a decision or assumption, it is quoted as part of that side.

The answers to SCR-1 to SCR-6 (`task-crud-spec-change-requests.md`) aren't written into the spec yet. Until they are, the spec text and the answers differ for these items:

- Terms "Refused"
- P1
- A2 and Terms "Whitespace"
- A6 and AC-2.6d
- A16 and AC-5.3
- A31 and AC-2.10b

Those differences are expected, so they aren't counted here. Item 12 covers the one that is also a conflict within the spec itself.

## Types of conflict

- **Contradiction:** as written, both sides can't be true.
- **Wording conflict:** both can hold under a narrower reading, but the words as written disagree.
- **Reasoning conflict:** the rule itself isn't contradicted, but the reason given for it conflicts with another part of the spec.

## Summary

11 conflicts are new, and 2 have already been raised elsewhere.

| # | Conflict | Type | Side A | Side B |
|---|---|---|---|---|
| 1 | How long a deleted task's record is kept | Contradiction | Terms "Deleted task" | A21, AC-7.7 |
| 2 | Whether the interface can show an unsaved change | Contradiction | A29 | AC-6.5, AC-8.1b, What was cut |
| 3 | Where completed tasks sit in the list | Contradiction | What was cut (AC-4.5), A9 | A10, AC-4.4, Gate 1 decisions |
| 4 | Which assumptions were reviewed at Gate 1 | Contradiction | Status line, Gate 1 decisions | A7, A9, A16, A18, A28–A32, A35, A38 |
| 5 | Where the success message after an edit comes from | Contradiction | A22 | AC-8.2a |
| 6 | Whether every spec decision is in the Assumptions table | Contradiction | How to read this spec | AC-8.5 |
| 7 | Whether the length limits match the notes feature | Wording conflict | A1, A3, Gate 1 decisions | A27 |
| 8 | What a toggle and an edit change | Wording conflict | A28 | AC-8.7b |
| 9 | Whether a deleted task can be changed at all | Wording conflict | A30, AC-7.4 | P6 |
| 10 | Why the erasure window is 48 hours | Reasoning conflict | Conflicts item 2, A21 | Conflicts item 2 |
| 11 | Why the "no detail view" rule was cut | Reasoning conflict | What was cut | AC-7.1 |
| 12 | The 10-year limit's example (already SCR-3) | Contradiction | A6 | AC-2.6d, What was cut |
| 13 | The building blocks behind paging and live updates (already step 1 item 20) | Reasoning conflict | A12 | A15 |

---

## New conflicts

### 1. How long a deleted task's record is kept

**Type:** Contradiction

**Side A: Terms, "Deleted task"**
> Its record is kept as a record only for 30 days after it was deleted, then erased automatically (R6).

**Side B: A21 and AC-7.7**
> Automatic erasure happens within 48 hours after a deleted task's 30 days end: a record is erased no earlier than 720 hours and no later than 768 hours after its deletion time.

> A deleted task's record still exists until 30 days (720 hours) after its deletion time, and has been erased automatically by 48 hours after that (768 hours after its deletion time).

**Why they conflict:**
- Terms says the record is kept "only for 30 days". A21 and AC-7.7 allow it to be kept for up to 32 days (768 hours).
- The R6 answer itself reads "Kept as a record only, for 30 days after deletion". There, "only" goes with "as a record": it states the purpose of keeping the record. Terms drops the comma, so "only" now limits the time.
- "How the answers are applied" reads R6 the same way A21 does: 30 days is 720 hours, and A21 sets how soon after that the erasure happens. That leaves the Terms line as the odd one out.

### 2. Whether the interface can show an unsaved change

**Type:** Contradiction

**Side A: A29**
> The interface never shows an unsaved change as saved: once an action has failed, what the user sees matches what's stored.

**Side B: AC-6.5 and AC-8.1b, which cite A29**
> When a toggle fails, from the moment the error message (AC-8.1a) appears, the checkbox shows the task's stored status, which is the status it had before the toggle.

> When a create, edit or delete fails, from the moment the error message appears, the task list matches the stored tasks

**The spec's own record: What was cut**
> This included "the checkbox never shows a status that hasn't been saved", which contradicted its own criterion.

> Rewritten as pass/fail checks, for example AC-6.5, AC-7.1 and AC-8.3.

**Why they conflict:**
- AC-6.5 and AC-8.1b set what the screen shows only from the moment an error appears. Before that, a checkbox can show a new status that hasn't been saved.
- A29's first clause says this never happens. Its second clause agrees with the criteria.
- The cut log removed the same "never" wording from a criterion because it contradicted that criterion. The wording is still in A29, which both criteria cite.

### 3. Where completed tasks sit in the list

**Type:** Contradiction in the record of cuts. A9 is also a wording conflict.

**Side A: What was cut, and A9**
> AC-4.5: completed tasks appear in the same list, in the same order

> Already implied by AC-4.1 and AC-4.4.

> Tasks are listed by due date and time, soonest first. Tasks with the same due date and time are listed by creation time, oldest first.

**Side B: A10, AC-4.4, and Gate 1 decisions**
> Completed tasks stay in the list, below all pending tasks. Within each group, the order in A9 applies.

> All pending tasks are listed before all completed tasks.

> For example, a completed task due yesterday appears after a pending task due next year.

> A10: completed tasks mixed in with pending ones

> to completed tasks listed below pending ones

**Why they conflict:**
- Gate 1 changed A10, so completed tasks are no longer "in the same order" as pending ones.
- The cut log still says the removed AC-4.5, which put them in the same order, is "already implied" by AC-4.4. The current AC-4.4 says the opposite.
- On its own, A9's first sentence still describes the old order for the whole list. A10 limits it to each group, but A9's text wasn't updated.

### 4. Which assumptions were reviewed at Gate 1

**Type:** Contradiction

**Side A: Status line, and Gate 1 decisions**
> every assumption that added a number or feature has a product owner decision (see Gate 1 decisions)

> Every assumption that added a number, a limit, or a feature or rule that neither the ticket nor the product owner had asked for was reviewed at Gate 1. Each is now either confirmed or changed.

**Side B: Assumptions labelled "Decision" that aren't in either Gate 1 table.** For example:

> Tasks are listed by due date and time, soonest first.

> Source: Decision; the notes list sets no order.

> A deleted task can't be changed in any way. Attempts are refused, and when one comes from the interface, the message says the task no longer exists.

> Source: Decision. The ticket only says deleting is soft.

> A successful toggle shows no success message; the checkbox change is the confirmation.

> Source: Decision. The project has no precedent for toggles.

**Why they conflict:**
- Both Gate 1 tables together list A1–A6, A10, A12, A14, A15, A20–A23, A26, A27 and A33–A37.
- These assumptions are labelled "Decision", in full or in part, and appear in neither table:
  - A7: duplicate titles allowed
  - A9: sort order
  - A16: the un-completing part
  - A18: the last edit received wins, with no warning
  - A28: an edit changes only the fields the user changed
  - A29: the screen matches what's stored after a failure
  - A30: deleted tasks can't be changed
  - A31: system fields
  - A32: status can be left out on create
  - A35: no message after a toggle
  - A38: the checkbox name includes the title
- At least A9, A30 and A35 add a rule that neither the ticket nor the product owner asked for. The gate record says every such assumption was reviewed.
- The spec doesn't say whether the others were judged not to add a rule, or were missed.
- A16 and A31 have since gone back to the owner as SCR-5 and SCR-6.

### 5. Where the success message after an edit comes from

**Type:** Contradiction, in the source labels

**Side A: A22**
> A successful delete shows a success message.

> The project's only success-message precedent is for create (the notes form and docs/DESIGN.md "Forms"), and nothing in the app deletes yet.

**Side B: AC-8.2a**
> When a create or an edit succeeds, a success message is shown. [Project: docs/DESIGN.md, "Forms"]

**Why they conflict:**
- A22 says DESIGN.md "Forms" is a precedent for create only. AC-8.2a cites the same section as a project requirement for create and edit.
- If "Forms" covers edits, A22's "only … for create" is wrong. If it doesn't, AC-8.2a's [Project] label overstates the source for edits, and a success message after an edit is a spec decision with no assumption number.
- DESIGN.md "Forms" shows a general form ending in `toast.success('Saved!')`, not one limited to creating (verified: `docs/DESIGN.md`).

### 6. Whether every spec decision is in the Assumptions table

**Type:** Contradiction

**Side A: How to read this spec**
> Every decision this spec makes itself, including behaviour that no ticket, answer or rule states, is in that table, so the product owner can confirm it in one place.

**Side B: AC-8.5**
> The database's own standard permission-denied response to a direct request is allowed.

> [Project: docs/SECURITY.md "Error Handling"; backend/CLAUDE.md "Error Handling"]

**Why they conflict:**
- Neither cited section mentions the database's permission-denied response.
- SECURITY.md "Error Handling" says "`HttpError` (`backend/src/lib/errors.ts`) is the only error type that reaches the client" (verified: `docs/SECURITY.md:160`).
- So the allowance is a decision the spec makes itself, and it has no entry in the Assumptions table.

### 7. Whether the length limits match the notes feature

**Type:** Wording conflict

**Side A: A1, and Gate 1 decisions (A1 and A3)**
> A title can be at most 200 characters.

> Source: Precedent. This is the notes title limit in docs/FIRESTORE-SCHEMA.md.

> A1: title limit of 200 characters

> Matches the notes feature.

**Side B: A27**
> A character is one Unicode code point: 👍 counts as 1, the flag 🇦🇺 as 2, and each line break as 1.

> The notes precedent's limits count UTF-16 code units, where 👍 counts as 2; code points are closer to what a person types.

**Why they conflict:**
- The numbers match the notes feature, but the way characters are counted doesn't.
- By A27's own account, a title of 200 👍 is 200 characters for tasks, so it's accepted. The same title is 400 units under the notes counting, so notes would refuse it.
- "Matches the notes feature", the Gate 1 reason for confirming A1 and A3, holds only for text without such characters.

### 8. What a toggle and an edit change

**Type:** Wording conflict

**Side A: A28**
> An edit changes only the fields the user changed, and a toggle changes only the status.

**Side B: AC-8.7b**
> Every stored task record holds its last-updated time. After each successful create, edit, toggle and delete, it is within 5 seconds of the user's action, by a clock synchronised to network time.

**Why they conflict:**
- Under AC-8.7b, every toggle and every edit also changes the last-updated time. So a toggle doesn't change "only the status".
- The criteria that cite A28 are narrower and agree with AC-8.7b:
  - AC-5.2: "each of the task's title, description, due date and status that the user didn't change has the same value as before the edit"
  - AC-6.4: "After a toggle, the task's title, description and due date are the same as before"
- It is A28's own wording that is too broad.

### 9. Whether a deleted task can be changed at all

**Type:** Wording conflict

**Side A: A30 and AC-7.4**
> A deleted task can't be changed in any way.

> Afterwards the stored record, including its deletion time, is unchanged.

**Side B: P6**
> on a test project, move a deleted record's deletion time further into the past, then let the erasure run.

**Why they conflict:**
- P6 requires changing the one field that A30 and AC-7.4 say can't change.
- AC-7.4 is about attempts to edit, complete or delete. But A30 says "in any way", and neither A30 nor P6 says that direct database access on a test project is outside A30.

### 10. Why the erasure window is 48 hours

**Type:** Reasoning conflict

**Side A: Conflicts item 2, and A21**
> Because a free scheduler runs at most once a day with loose timing, the erasure window is 48 hours, not 24

> but a free scheduler runs at most once a day and its start time can drift by up to an hour

**Side B: Conflicts item 2**
> Hobby allows scheduled jobs that run once a day, with the start time only accurate to the hour (Vercel "Usage & Pricing for Cron Jobs"). Other free schedulers, such as a scheduled GitHub Actions workflow, would also work.

> Choosing between a Vercel scheduled job, a GitHub Actions workflow or something else, and how it gets admin access to Firestore safely, is left to Design and Context Engineering.

**Why they conflict:**
- The only source the spec gives for "once a day" is Vercel's Hobby limit.
- The same item names GitHub Actions as another free option, gives no limit for it, and leaves the choice to Design.
- So "a free scheduler runs at most once a day" is stated for every free scheduler on evidence about one. A21's 48-hour limit doesn't contradict anything, but the reason given for it is broader than its source.

### 11. Why the "no detail view" rule was cut

**Type:** Reasoning conflict

**Side A: What was cut**
> "There is no separate detail view" (AC-4.3)

> A design restriction that no user outcome depends on.

**Side B: AC-7.1**
> After a user deletes their own task, it isn't in their task list, no single-task view shows it (the edit view is the only one, A8), and a direct request by the owner to read it (see Terms) is refused.

**Why they conflict:**
- The cut log says no user outcome depends on there being no detail view.
- AC-7.1's pass/fail check does depend on it: a tester has to know which single-task views exist to check that none shows a deleted task.
- The restriction now lives in A8 and §9 rather than in a criterion, so the rule survives. Only the reason for cutting it conflicts.

---

## Conflicts already raised elsewhere

### 12. The 10-year limit's example

**Type:** Contradiction. Raised as SCR-3, answered on 2026-09-27, not yet written into the spec.

**Side A: A6**
> A due date can be at most 10 years after the moment the task is saved, by the server's clock.

**Side B: AC-2.6d, and What was cut**
> For example, saved on 5 March 2027, a due date on 5 March 2037 is accepted and one on 6 March 2037 is refused.

> Rules for date-only due dates (A5, AC-2.5)

> R3: the due date is a date and time.

**Why they conflict:**
- A6 measures from a moment. The example uses dates with no times, so any time on 5 March 2037 looks accepted, even one more than 10 years after the moment of saving.
- The cut log says rules for date-only due dates were removed because of R3, but this example is still date-only.

### 13. The building blocks behind paging and live updates

**Type:** Reasoning conflict. Raised as step 1 item 20. The options are in `step2-options.md` under ADR-D.

**Side A: A12**
> The list shows at most 20 tasks per page, and the user can move between pages.

> The notes list doesn't page, but it's tutorial code with no stated reason, so the documented building block takes priority.

**Side B: A15**
> The list updates live: the user's own changes, and changes they make in another tab or on another device, appear without a reload.

**Why they conflict:**
- The two behaviours don't contradict each other. The building blocks each assumption cites do.
- A12 gives priority to `paginationSchema`, which pages by page number (verified: `frontend/src/lib/validations/common.ts:5-7`).
- A15 relies on the notes list's live connection, `useCollection()`. That starts its query only once for a given collection, so changing the page doesn't restart it (verified: `frontend/src/hooks/useFirestore.ts:52`).

---

## Checked and not counted

These looked like conflicts, but the spec itself reconciles them:

- **Erasure versus "not a hard delete".** Conflicts item 1 calls automatic erasure "a hard delete", yet treats R6 as "refining 'not a hard delete', not overriding it". The spec limits the ticket's rule to deletes a user makes, and AC-7.3 keeps every one of those soft.
- **A due time a few seconds in the past.** A26 accepts a due time of 10:30 when the clock reads 10:30:45, even though R4 says "A new task cannot be created with a due date in the past". Terms "Past" and the R4 reading in "How the answers are applied" define "past" to the minute.
- **Search.** Terms "Read" mentions "any list or search of tasks", and §9 puts search out of scope. The definition is a catch-all and doesn't require search to exist.
- **Backend endpoints.** D2c ("Any backend endpoint added for tasks") sits alongside the free-plan rule that Conflicts item 2 upholds. D2c applies only if such an endpoint is added.
- **The edit view.** §9 puts "a separate page or view for a single task's details" out of scope, and A8 keeps an edit view. The spec treats editing and viewing details as different things.
- **Cross-references.** Every "Used by" column for R1–R6 and A1–A38 matches the criteria that cite them.
