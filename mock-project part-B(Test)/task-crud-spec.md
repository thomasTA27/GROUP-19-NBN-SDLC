# Task CRUD — Acceptance Criteria

**Product:** Simple Task Dashboard
**Status:** Draft for team review. All six open questions are answered (see Resolved questions). The assumptions still need the product owner's confirmation.
**Date:** 2026-09-27

## Ticket

> A user can create, read, update and delete their own tasks, each with a title, description and due date. Deleting is a soft delete (deletedAt), not a hard delete. A user can mark a task complete: the checkbox in the task list toggles it between pending and completed.

**Product context:** the Simple Task Dashboard is a small web app where users log in and manage their own to-do tasks.

## Purpose

Signed-in users need a private place to record what they have to do and by when, keep those records current, tick tasks off as they finish them, and remove tasks they no longer want.

## How to read this spec

- Every criterion has an ID and a source in brackets:
  - **[Ticket]**: stated in, or directly implied by, the ticket or product context.
  - **[Project: file]**: a requirement the project places on every feature, in its docs, rules or templates. The cited file is where it's stated. These are existing decisions, not new ones.
  - **[Resolved R#]**: follows a product-owner answer recorded in Resolved questions.
  - **[Assumes A#]**: depends on a numbered decision in the Assumptions table. If an assumption is rejected, every criterion in its "Used by" column has to be revisited.
- The six questions only the product owner could answer have all been answered. They're recorded in Resolved questions (R1–R6), and no `NEEDS CLARIFICATION` markers remain.
- Every criterion has a pass/fail result that two testers would agree on. Where neither the ticket nor an answer gives a number (a length limit, a time limit, a screen width), an assumption supplies one, instead of words like "fast" or "works".
- Criteria that need special test access name the prerequisite they depend on (P1–P6 below).
- Delivery requirements (D1–D5, at the end) are checked by review before merge, not by testing the running app.
- This spec covers behaviour (what and why), not implementation.

## Terms

- **Task**: a to-do item belonging to one user, with a title, an optional description, a due date and time, and a status.
- **Owner**: the user who created the task.
- **Status**: *pending* or *completed*. There are no others (R5).
- **Task list**: the user's list of tasks, across all of its pages.
- **Past**: a due date and time earlier than the start of the current minute, by the server's clock (A26).
- **Deleted task**: a task its owner has deleted. From the owner's point of view it is gone. Its record is kept as a record only for 30 days after it was deleted, then erased automatically (R6).
- **Erased**: permanently removed from storage. The record no longer exists.
- **Direct request**: a request sent straight to any point where the app reads or writes task data, without going through the interface.
- **Refused**: no task is created and no stored task changes, and the requester gets an error rather than a success response.

## Test prerequisites

Some criteria can't be checked through the interface alone. Testers need:

- **P1** At least two test accounts, plus one with the admin role (set as described in docs/SECURITY.md), to check that users, admins included, can't reach each other's tasks.
- **P2** A way to send direct requests, both with a test account's credentials and with none, to every point where the feature reads or writes task data. The implementation must list these points.
- **P3** Read access to stored task records, including deleted ones. The owner can't see a deleted task, so the interface can't show that its record was kept or erased.
- **P4** A way to make a save fail on demand (for example, by going offline), to check failure behaviour.
- **P5** A way to revoke a test account's session, as described in docs/SECURITY.md "Revoking sessions".
- **P6** A way to check automatic erasure without waiting 30 days: on a test project, move a deleted record's deletion time further into the past, then let the erasure run. The implementation must document how often the erasure runs.

## Resolved questions

Answered by the product owner, Sajad Ali Akbari, on 2026-09-27. These are team decisions, not client decisions: the feature is the product owner's own proposal.

| ID | Question | Answer | Decided by | Used by |
|---|---|---|---|---|
| R1 | Was AC-1.5. Can admins view or manage other users' tasks, or only the owner? | Only the owner can view or manage a task. Admins have no access to other users' tasks. | Sajad Ali Akbari, product owner (team decision) | AC-1.5, AC-7.3, AC-7.6 |
| R2 | Was AC-2.1. Which of title, description and due date are required? | Title and due date are required. Description is optional. | Sajad Ali Akbari, product owner (team decision) | AC-2.1, AC-2.2, AC-2.3, AC-4.3, A9 |
| R3 | Was AC-2.4. Is the due date a calendar date only, or a date and time? | Date and time. | Sajad Ali Akbari, product owner (team decision) | AC-2.4, AC-2.5, AC-4.3, A5 |
| R4 | Was AC-2.6. Can a task be created or edited with a due date in the past? | A new task cannot be created with a due date in the past. When editing, an existing due date that has already passed can be kept, but it cannot be changed to a different date in the past. | Sajad Ali Akbari, product owner (team decision) | AC-2.6, AC-6.7, A26 |
| R5 | Was AC-3.2. Does every new task start as pending? | Every new task starts as pending, and stays pending until the user ticks it completed. There is no other status. | Sajad Ali Akbari, product owner (team decision) | AC-3.2, A16 |
| R6 | Was AC-7.6. What is the kept record of a deleted task for, and is restoring a task in this ticket's scope? | Kept as a record only, for 30 days after deletion, then permanently erased automatically. The automatic erasure is part of this ticket. Restoring or reviewing deleted tasks is out of scope and will be a later feature. | Sajad Ali Akbari, product owner (team decision) | AC-7.2, AC-7.3, AC-7.6, AC-7.7, AC-7.8, §9, D1, D4, D5, A20, A21, A25 |

### How the answers are applied

These readings go slightly beyond the literal answers. The product owner should confirm them.

- **R4:** because the due date is a date and time (R3), "a different date in the past" is read as any change to the stored due date and time that lands in the past. A change of time alone counts. Which clock decides "past", and how precisely, is assumption A26.
- **R5:** "stays pending until the user ticks it" is read as: nothing but the checkbox changes a task's status, and an edit can't (A16).
- **R6:** "30 days" is read as 720 hours from the deletion time. How soon after that the erasure must happen is assumption A21.

### Conflicts with the ticket and project rules

1. **R6 conflicts with the ticket's "not a hard delete" and with the project's soft-delete rule.** The rule appears in docs/SECURITY.md "Soft-delete only", docs/FIRESTORE-SCHEMA.md ("Hard-delete is disabled") and CLAUDE.md ("Use the soft-delete pattern … instead of hard deletes"). Permanently erasing a record after 30 days is a hard delete. The spec handles it this way:
   - Every user-initiated delete stays soft. No user, including the owner and admins, can erase a task from the interface or by direct request (AC-7.3), so the ticket and the rule still hold for every user action.
   - The only permanent erasure is the automatic one, and only for deleted tasks whose 30 days have passed (AC-7.7, AC-7.8). The spec records it as an explicit, justified exception, which is what the project's security-reviewer agent asks for ("no hard deletes unless explicitly justified"). D4 requires the exception to be written into docs/SECURITY.md and docs/FIRESTORE-SCHEMA.md, so it isn't a silent departure.
   - The product owner wrote the ticket, so R6 is treated as refining "not a hard delete", not overriding it.
   - The owner-only rules template in the /firebase-collection skill allows owners to hard-delete. That contradicts docs/SECURITY.md and would fail AC-7.3, so it must not be used as-is for tasks.
2. **R6 conflicts with the project's free-plan rule.** CLAUDE.md says "no paid Firebase plan required", and README.md says "free-tier only". Automatic erasure needs something that runs on a schedule. The project's only server-side code, the Cloud Functions backend, needs the paid Blaze plan (docs/ARCHITECTURE.md, docs/CI-CD.md). The spec keeps the free-plan rule as delivery requirement D5 and doesn't choose a mechanism. If the team would rather use the backend, that's a decision to move to the Blaze plan, and D5 changes.
3. **R1–R5 conflict with no project rule.** R1 matches the notes feature, which is owner-only. The project's admin helper (docs/SECURITY.md) is used for user profiles, and the spec doesn't extend it to tasks. R2 matches the notes feature, where the title is required and the body can be empty.

## Assumptions

Decisions made so every criterion can be tested. Each source is labelled:

- **Rule**: the project requires it of every feature.
- **Precedent**: existing code or a documented building block does it, but nothing requires it.
- **Ticket**: follows from the ticket's wording.
- **Resolved**: follows a product-owner answer (R1–R6).
- **Decision**: the project has no basis for it.

Where a rule or precedent exists, the assumption follows it unless its source note says why not. Each one should be confirmed or overridden by the product owner.

| ID | Assumption | Used by |
|---|---|---|
| A1 | A title can be at most 200 characters. *Source: Precedent. This is the notes title limit in docs/FIRESTORE-SCHEMA.md.* | AC-2.2 |
| A2 | A title made only of spaces counts as empty. Leading and trailing spaces are removed when a title is saved, and length limits apply after they're removed. *Source: Decision. This departs from the notes precedent, which accepts a title made only of spaces. That's an omission in tutorial code, not a documented rule.* | AC-2.2 |
| A3 | A description can be at most 10,000 characters. *Source: Precedent. This is the notes body limit in docs/FIRESTORE-SCHEMA.md.* | AC-2.3 |
| A4 | The description is plain text with no formatting. Line breaks the user types are kept and shown. *Source: Decision. This departs from the notes precedent, whose list doesn't keep line breaks. That's an omission, not a documented rule.* | AC-2.3 |
| A5 | A due date is a single moment, entered and shown as a date and time to the minute, in the timezone of the device displaying it. *Source: Resolved R3 for date and time. Minute precision is Precedent: the project's `formatDatetime` helper (frontend/src/lib/utils.ts) shows hours and minutes. Showing it in the viewer's timezone is a Decision. The project has no timezone rule, and its date helpers format in the timezone of wherever the code runs, which for server-rendered pages is the server's, so they don't provide this behaviour by themselves.* | AC-2.4, AC-2.5 |
| A6 | There is no latest allowed due date: any due date and time up to and including 23:59 UTC on 31 December 9999, the last minute with a four-digit year, is accepted. *Source: Decision.* | AC-2.6 |
| A7 | A user can have more than one task with the same title. *Source: Decision. No collection in the project requires unique values, but that's silence, not a precedent.* | AC-2.7 |
| A8 | Each list item shows the task's title, full description (if it has one) and due date and time, as well as its checkbox. There is no separate detail view. The edit view is the only other place a single task is shown. *Source: Precedent. The notes list shows each note's title and body in full (docs/GUIDE.md). The project also has an unused truncate helper and supports detail pages (/new-page skill), so this is a choice, not a rule.* | AC-4.3, AC-7.1 |
| A9 | Tasks are listed by due date and time, soonest first. Tasks with the same due date and time are listed by creation time, oldest first. *Source: Decision; the notes list sets no order. The earlier rule for tasks without a due date is gone, because R2 makes the due date required.* | AC-4.4 |
| A10 | Completed tasks appear in the same list as pending ones, in the same order. *Source: Ticket, for visibility: completed tasks must be in the list so their checkbox can be unticked. Mixing them in rather than grouping them separately is a Decision; grouping would also meet the ticket.* | AC-4.5 |
| A11 | Overdue tasks are not marked. *Source: Ticket, which doesn't mention it. Marking would be a new feature.* | AC-4.6 |
| A12 | The list shows 20 tasks per page, and the user can move between pages. There is no limit on the number of tasks per user. *Source: Precedent. `paginationSchema` (frontend/src/lib/validations/common.ts, listed in CLAUDE.md "Codebase Map") defaults to 20 per page, with a maximum of 100. The notes list doesn't page, but it's tutorial code with no stated reason, so the documented building block takes priority. Paging also keeps each page load to a bounded number of reads on the free Firebase plan.* | AC-4.1, AC-4.7 |
| A13 | The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar. *Source: Precedent. docs/GUIDE.md step 4, the /new-page skill checklist, and the notes feature (/notes plus a sidebar link).* | AC-4.8 |
| A14 | List updates must appear within 3 seconds, measured on the test environment's connection with no network throttling. *Source: Decision. The project sets no performance targets.* | AC-4.11 |
| A15 | The list updates live: the user's own changes, and changes they make in another tab or on another device, appear without a reload. *Source: Precedent. The notes list updates live (docs/GUIDE.md, docs/ARCHITECTURE.md). The project doesn't require it: the /new-feature and /firebase-collection skills ask whether each feature needs realtime updates.* | AC-4.11 |
| A16 | Status can only be changed with the checkbox in the list. The edit view has no status control. *Source: Resolved R5 for completing a task: it stays pending until the user ticks it. For un-completing, a Decision kept consistent with R5; the ticket names the checkbox for both directions.* | AC-5.3 |
| A17 | A completed task can be edited in the same way as a pending one. *Source: Ticket, which places no restriction on editing.* | AC-5.4 |
| A18 | When the same task is edited in two places at once, the later save wins and no conflict warning is shown. *Source: Decision. Conflict detection would be a new feature.* | AC-5.5 |
| A19 | No completion time is recorded or shown. *Source: Ticket, which doesn't mention it. It would be a new feature.* | AC-6.6 |
| A20 | Deleting a task needs an in-page confirmation step, because a deleted task can't be restored and is erased for good after 30 days (R6). Revisit this when the planned restore feature arrives. *Source: Decision, with its premise confirmed by Resolved R6. The project has no confirmation pattern to reuse, and docs/DESIGN.md "Notifications" rules out the browser's built-in confirm dialog and modal toasts, so this needs a new in-page pattern.* | AC-7.5 |
| A21 | Automatic erasure happens within 24 hours after a deleted task's 30 days end: a record is erased no earlier than 720 hours and no later than 744 hours after its deletion time. *Source: Decision. R6 sets the 30 days but not how soon after they end. 24 hours allows the erasure to run once a day.* | AC-7.7 |
| A22 | A successful delete shows a success message. A successful toggle doesn't; the checkbox change is the confirmation. *Source: Decision. The project's only success-message precedent is for create (the notes form and docs/DESIGN.md "Forms"), and nothing in the app deletes or toggles yet.* | AC-8.2 |
| A23 | The narrowest supported screen width is 320px and the widest is 1920px. *Source: Rule for the breakpoints between them (docs/DESIGN.md "Responsive breakpoints", mobile-first). The two endpoints are a Decision: 320px is a conservative minimum phone width, and 1920px a common desktop width. docs/DESIGN.md "Spacing" suggests a 1280px page width, but the app's layout (frontend/src/components/layout/DashboardShell.tsx) doesn't cap content width, so the widest width needs its own check.* | AC-8.3 |
| A24 | The accessibility standard is the rules in docs/DESIGN.md "Accessibility". No external standard is required. *Source: Rule. docs/DESIGN.md "Accessibility"; no external standard is named anywhere in the project.* | AC-8.4 |
| A25 | Everything listed in section 9 is out of scope. *Source: Ticket, which mentions none of them. Viewing, reviewing and restoring deleted tasks are out of scope by Resolved R6, and planned as a later feature.* | §9 |
| A26 | A due date is in the past if it is earlier than the start of the current minute, by the server's clock when the save is received. For example, at 10:30:45 a due time of 10:30 is accepted and 10:29 is refused. *Source: Decision. R4 doesn't say which clock decides or how precisely. The server's clock is used because a device's clock can be wrong or changed, following the project Rule "Never trust the browser" (docs/GUIDE.md).* | AC-2.6 |

---

## 1. Access and ownership

- **AC-1.1** While signed out, opening the task list redirects to the sign-in page, and a direct request to read, create, edit, complete or delete a task is refused. (P2) [Ticket: "users log in"; Project: docs/ARCHITECTURE.md, protected pages redirect to sign-in]
- **AC-1.2** When users A and B both have tasks, A's task list contains A's non-deleted tasks and none of B's. (P1) [Ticket]
- **AC-1.3** Signed in as A, a direct request to read, edit, complete or delete one of B's tasks is refused at every point listed under P2. Afterwards, B's task is unchanged. (P1, P2, P3) [Ticket: "their own"; Project: docs/SECURITY.md, "assume the client is untrusted"]
- **AC-1.4** Signed in as A, a direct request to create a task with B as its owner is refused, and so is a direct request to change the owner of one of A's own tasks. (P1, P2) [Project: docs/SECURITY.md, owner field is immutable; docs/TUTORIAL-WALKTHROUGH.md, creating a record as another user is refused]
- **AC-1.5** A user with the admin role has no special access to tasks. Their task list contains only their own tasks, and a direct request from them to read, edit, complete or delete another user's task is refused at every point listed under P2. Afterwards, the other user's task is unchanged. (P1, P2, P3) [Resolved R1]
- **AC-1.6** When a user's session has expired or been revoked, the app treats them as signed out: opening the task list redirects to the sign-in page, and any task action or direct request made with that session is refused. (P5) [Project: docs/SECURITY.md "Authentication": every action checks the session for expiry and revocation]

## 2. Task fields

These rules apply both when creating and when editing a task.

- **AC-2.1** Title and due date are required; the description is optional. A submission with an empty title (see AC-2.2) or no due date is refused, with the error described in AC-2.8. A submission with an empty description is accepted. [Ticket] [Resolved R2]
- **AC-2.2** A title of 1 to 200 characters is accepted. An empty title, and one of 201 characters, are refused. A title made only of spaces counts as empty. Leading and trailing spaces are removed when the title is saved, and the length is counted after they're removed. [Resolved R2] [Assumes A1, A2]
- **AC-2.3** A description of up to 10,000 characters is accepted, including an empty one, and one of 10,001 characters is refused. The description is plain text, and a description saved with line breaks is displayed with the same line breaks. [Resolved R2] [Assumes A3, A4]
- **AC-2.4** The due date is a date and a time, entered and shown to the minute. [Resolved R3] [Assumes A5]
- **AC-2.5** A saved due date is displayed back to the user as the same date and time they entered, on the device they entered it from. On a device set to a different timezone, it shows the same moment in that device's timezone. For example, 5:00 pm entered on a device in Perth (UTC+8) shows as 9:00 am on a device set to UTC. [Ticket] [Resolved R3] [Assumes A5]
- **AC-2.6** Due dates and "past" (see Terms):
  - Creating a task with a due date in the past is refused.
  - Editing a task and changing its due date to a different date and time in the past is refused.
  - Editing a task whose due date has already passed, while leaving the due date unchanged, is accepted.
  - Any due date and time that isn't in the past is accepted, up to and including 23:59 UTC on 31 December 9999. Later ones are refused.

  For example, with the server's clock at 10:30:45 UTC on 5 March 2027: creating a task due 10:30 UTC that day is accepted, and one due 10:29 UTC is refused. For a task due 09:00 UTC on 1 March 2027, saving an edit to its title is accepted, but changing its due date to 09:00 UTC on 2 March 2027 is refused. [Resolved R4] [Assumes A6, A26]
- **AC-2.7** A user can save a task with the same title as another of their tasks. [Assumes A7]
- **AC-2.8** When a submission breaks any field rule, it is refused. Each invalid field shows an error message with that field naming the rule broken (for example, "Title is required"). Valid fields show no error. [Project: docs/DESIGN.md, "Forms": field-level error messages]
- **AC-2.9** Every field rule in this section is also enforced on direct requests: a direct request to create or edit a task that breaks any of them is refused. (P2) [Project: docs/GUIDE.md golden rule 1, "Never trust the browser"; frontend/CLAUDE.md, input is validated before any database operation; docs/SECURITY.md "Input Validation"]
- **AC-2.10** A direct request to create or edit a task that includes any field this spec doesn't define for tasks is refused. (P2) [Project: docs/SECURITY.md "Field allowlists" and "Input Validation": unknown fields are rejected]

## 3. Create

- **AC-3.1** When a signed-in user submits valid fields, a new task appears in their task list with the values they entered. It doesn't appear in any other user's list. (P1) [Ticket]
- **AC-3.2** Every new task is created with status pending: it appears with its checkbox unticked, and its stored status is pending. A direct request to create a task with any other status is refused. Status is only ever pending or completed, and a direct request that sets any other value is refused. (P2, P3) [Resolved R5]

## 4. Read

- **AC-4.1** The task list contains every non-deleted task the user owns, and nothing else. Each task appears on exactly one page (see AC-4.7). [Ticket] [Assumes A12]
- **AC-4.2** Each list item shows the task's title and a checkbox. The checkbox is ticked if the task is completed and unticked if it is pending. [Ticket: "the checkbox in the task list"]
- **AC-4.3** Each list item also shows the task's full description, if it has one, and its due date and time. There is no separate detail view. [Resolved R2, R3] [Assumes A8]
- **AC-4.4** Tasks are listed by due date and time, soonest first. Tasks with the same due date and time are listed by creation time, oldest first. [Assumes A9]
- **AC-4.5** Completed tasks appear in the same list as pending tasks, in the order set by AC-4.4. [Assumes A10]
- **AC-4.6** A pending task whose due date has passed is shown the same way as any other pending task, with no overdue marking. [Assumes A11]
- **AC-4.7** The list shows 20 tasks per page, in the order set by AC-4.4. When the user has more than 20 tasks, they can move to the next and previous pages; for example, with 21 tasks, the first page shows 20 and the second shows 1. There is no limit on the number of tasks a user can have. [Assumes A12]
- **AC-4.8** The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar. [Assumes A13]
- **AC-4.9** When the user has no non-deleted tasks, the list area shows an empty-state message (for example, "No tasks yet") and no task items. [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.10** While tasks are loading, a loading indicator is shown. If loading fails, an error message is shown and the empty-state message from AC-4.9 is not. (P4) [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.11** Within 3 seconds of a create, edit, toggle or delete succeeding, the list shows the change, without a page reload or any other action by the user. This applies on the screen where the change was made, and in the same user's other tabs and devices. [Assumes A14, A15]

## 5. Update

- **AC-5.1** A user can change the title, description and due date of their own task, within the rules in section 2. After a valid edit is saved, the list shows the new values (see AC-4.11). [Ticket]
- **AC-5.2** After an edit is saved, each of the task's title, description, due date and status that the user didn't change has the same value as before the edit. [Ticket]
- **AC-5.3** Status can only be changed with the checkbox in the list. The edit view has no status control. [Assumes A16]
- **AC-5.4** A completed task can be edited in the same way as a pending one, and stays completed after the edit (see AC-5.2). [Assumes A17]
- **AC-5.5** When the same task is edited in two places at once (for example, two tabs), the stored task ends up with the values from the later save, and no conflict warning is shown. [Assumes A18]

## 6. Mark complete

- **AC-6.1** Ticking the checkbox of a pending task changes its status to completed. [Ticket]
- **AC-6.2** Unticking the checkbox of a completed task changes its status to pending. [Ticket]
- **AC-6.3** After a successful toggle, the new status is still shown after the user reloads the page, and after they sign out and back in. [Ticket]
- **AC-6.4** After a toggle, the task's title, description and due date are the same as before. [Ticket]
- **AC-6.5** If a toggle fails, an error message is shown. From the moment it appears, the checkbox shows the status the task had before the toggle. (P4) [Project: see AC-8.1]
- **AC-6.6** No completion time is shown. [Assumes A19]
- **AC-6.7** A task whose due date has passed can still be ticked and unticked. AC-2.6 only limits changing the due date. [Resolved R4]

## 7. Delete

- **AC-7.1** After a user deletes their own task, it isn't in their task list, no single-task view shows it (see AC-4.3), and a direct request by the owner to read it is refused. (P2) [Ticket] [Assumes A8]
- **AC-7.2** After deletion, and until it is erased (AC-7.7), the stored record still exists with the same title, description, due date, status, owner and creation time it had before deletion, plus a deletion time (the ticket's `deletedAt`). That time is no earlier than when the delete was requested and no later than when the success response was received. (P3) [Ticket] [Resolved R6]
- **AC-7.3** No user, including the task's owner and admins, can permanently erase a task, whether from the interface or by direct request. The attempt is refused and the stored record still exists afterwards. The only way a task record is erased is the automatic erasure in AC-7.7. (P1, P2, P3) [Ticket: "not a hard delete"; Project: docs/SECURITY.md, "Soft-delete only"; Resolved R1, R6]
- **AC-7.4** Attempts to edit, complete or delete a deleted task are refused. This applies both from an outdated screen, such as a second tab still showing the task, and by direct request. Afterwards the stored record, including its deletion time, is unchanged. When the attempt comes from the interface, the error message says the task no longer exists. (P2, P3) [Ticket: a deleted task is gone as far as its owner is concerned]
- **AC-7.5** Deleting a task requires the user to confirm. If they cancel, the task is unchanged and stays in the list. [Assumes A20]
- **AC-7.6** A deleted task is kept as a record only. The app gives no one, including the owner and admins, a way to view, review or restore it, either in the interface or among the points listed under P2. (P1, P2) [Resolved R1, R6]
- **AC-7.7** A deleted task's record still exists until 30 days (720 hours) after its deletion time, and has been erased automatically by 24 hours after that (744 hours after its deletion time). No user action is needed. (P3, P6) [Resolved R6] [Assumes A21]
- **AC-7.8** The automatic erasure never changes or erases a task that isn't deleted, however old it is. (P3, P6) [Resolved R6]

## 8. All actions

- **AC-8.1** When a create, edit, toggle or delete fails, an error message is shown and no success message is shown. From the moment the error appears, the task list matches the stored tasks: a failed create adds no item, a failed edit shows the old values, and a failed delete removes no item. (P4) [Project: docs/DESIGN.md, "Forms" and "Notifications"; frontend/CLAUDE.md, every action reports success or failure]
- **AC-8.2** When a create, an edit or a delete succeeds, a success message is shown. A successful toggle shows no success message; the checkbox change is the confirmation. [Project: docs/DESIGN.md, "Forms"] [Assumes A22]
- **AC-8.3** At 320px and 1920px wide, and at each layout breakpoint in docs/DESIGN.md between them (640, 768, 1024 and 1280px), every action in sections 3–7 can be completed without scrolling the page sideways. [Project: docs/DESIGN.md, mobile-first layout] [Assumes A23]
- **AC-8.4** Every action in sections 3–7 can be completed using only the keyboard. Every interactive control has an accessible name, and each checkbox's accessible name includes its task's title. The feature meets every rule in docs/DESIGN.md "Accessibility". [Project: docs/DESIGN.md, "Accessibility"] [Assumes A24]
- **AC-8.5** No error message shown to the user, or returned to a direct request, contains internal details such as stack traces, database paths or raw server error text. (P2, P4) [Project: docs/SECURITY.md "Error Handling"; backend/CLAUDE.md "Error Handling"]
- **AC-8.6** Every stored task record carries a schema version, set to 1 when the task is created, so that later changes to the task's shape can migrate old records. (P3) [Project: docs/FIRESTORE-SCHEMA.md "Schema versioning": every document must include it]
- **AC-8.7** Every stored task record holds its creation time and its last-updated time. The creation time never changes. The last-updated time is set by every successful create, edit, toggle and delete. (P3) [Project: the /firebase-collection and /new-feature skill templates, and every collection in docs/FIRESTORE-SCHEMA.md]

## 9. Scope

Out of scope for this ticket: search or filtering; priorities, tags or categories; reminders or notifications as a due date approaches; recurring tasks; subtasks; sharing tasks with other users; completing or deleting several tasks at once; and viewing, reviewing or restoring deleted tasks, which is planned as a later feature. [Resolved R6] [Assumes A25]

## Delivery requirements

Checked by review before the change is merged.

- **D1** The tasks collection is documented in docs/FIRESTORE-SCHEMA.md: each field, its type and limits, who can access it, and the 30-day retention and automatic erasure of deleted tasks. [Project: CLAUDE.md "Firestore": every collection is documented; docs/GUIDE.md golden rule 3] [Resolved R6]
- **D2** Automated unit tests cover every field rule in section 2 and any hook that loads tasks. Any backend endpoint added for tasks has at least a success test and a test that it refuses a request without credentials. [Project: docs/TESTING.md "What to Test"]
- **D3** Before merge, CI passes: lint, typecheck, all unit tests, and the dependency audit with no high or critical vulnerabilities. [Project: docs/GIT-WORKFLOW.md "Protected Branch"; docs/SECURITY.md "Dependency Scanning"]
- **D4** docs/SECURITY.md and docs/FIRESTORE-SCHEMA.md record the automatic 30-day erasure of deleted tasks as a justified exception to "Soft-delete only", citing R6. [Project: .claude/agents/security-reviewer.md, "no hard deletes unless explicitly justified"] [Resolved R6]
- **D5** The automatic erasure works without the paid Firebase Blaze plan. See "Conflicts with the ticket and project rules", item 2. [Project: CLAUDE.md, "no paid Firebase plan required"; README.md, "free-tier only"] [Resolved R6]

---

## Ticket coverage

| Ticket says | Covered by |
|---|---|
| Users log in (product context) | AC-1.1, AC-1.6 |
| Create, read, update, delete **their own** tasks | §1, §3, §4, §5, §7 |
| Each with a title, description and due date | §2 |
| Deleting is a soft delete (`deletedAt`), not a hard delete | AC-7.1 – AC-7.4; refined by R6 in AC-7.6 – AC-7.8 |
| Checkbox in the task list toggles between pending and completed | §6, AC-4.2 |
