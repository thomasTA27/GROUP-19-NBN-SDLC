# Task CRUD — Acceptance Criteria

**Product:** Simple Task Dashboard
**Status:** Draft. Not ready to build or test until the open questions below are answered.
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
  - **[Assumes A#]**: depends on a numbered decision in the Assumptions table. If an assumption is rejected, every criterion in its "Used by" column has to be revisited.
- Six decisions only the product owner can make are marked `[NEEDS CLARIFICATION: …]`. Nothing is assumed in their place. A criterion with a marker is blocked: it can't be built or tested until the question is answered.
- Every criterion has a pass/fail result that two testers would agree on. Where the ticket gives no number (a length limit, a time limit, a screen width), an assumption supplies one, instead of words like "fast" or "works".
- Criteria that need special test access name the prerequisite they depend on (P1–P5 below).
- Delivery requirements (D1–D3, at the end) are checked by review before merge, not by testing the running app.
- This spec covers behaviour (what and why), not implementation.

## Terms

- **Task**: a to-do item belonging to one user, with a title, description, due date and status.
- **Owner**: the user who created the task.
- **Status**: *pending* or *completed*. The ticket names no others.
- **Task list**: the user's list of tasks, across all of its pages.
- **Deleted task**: a task its owner has deleted. From the owner's point of view it is gone. The record itself is kept and marked with the time it was deleted.
- **Direct request**: a request sent straight to any point where the app reads or writes task data, without going through the interface.
- **Refused**: no task is created and no stored task changes, and the requester gets an error rather than a success response.

## Test prerequisites

Some criteria can't be checked through the interface alone. Testers need:

- **P1** At least two test accounts, to check that users can't reach each other's tasks.
- **P2** A way to send direct requests, both with a test account's credentials and with none, to every point where the feature reads or writes task data. The implementation must list these points.
- **P3** Read access to stored task records, including deleted ones. The owner can't see a deleted task, so the interface can't show that its record was kept.
- **P4** A way to make a save fail on demand (for example, by going offline), to check failure behaviour.
- **P5** A way to revoke a test account's session, as described in docs/SECURITY.md "Revoking sessions".

## Assumptions

Decisions made so every criterion can be tested. Each source is labelled:

- **Rule**: the project requires it of every feature.
- **Precedent**: existing code or a documented building block does it, but nothing requires it.
- **Ticket**: follows from the ticket's wording.
- **Decision**: the project has no basis for it.

Where a rule or precedent exists, the assumption follows it unless its source note says why not. Each one should be confirmed or overridden by the product owner.

| ID | Assumption | Used by |
|---|---|---|
| A1 | A title can be at most 200 characters. Whether it can be empty is open question AC-2.1. *Source: Precedent. This is the notes title limit in docs/FIRESTORE-SCHEMA.md.* | AC-2.2 |
| A2 | A title made only of spaces counts as empty. Leading and trailing spaces are removed when a title is saved. *Source: Decision. This departs from the notes precedent, which accepts a title made only of spaces. That's an omission in tutorial code, not a documented rule.* | AC-2.2 |
| A3 | A description can be at most 10,000 characters. *Source: Precedent. This is the notes body limit in docs/FIRESTORE-SCHEMA.md.* | AC-2.3 |
| A4 | The description is plain text with no formatting. Line breaks the user types are kept and shown. *Source: Decision. This departs from the notes precedent, whose list doesn't keep line breaks. That's an omission, not a documented rule.* | AC-2.3 |
| A5 | A date-only due date is a calendar date and shows as the same date on every device, whatever the device's timezone. A date-and-time due date is shown in the timezone of the device displaying it. Which of the two applies is open question AC-2.4. *Source: Decision. The project has no timezone rule. Its date helpers (frontend/src/lib/utils.ts) format dates in the timezone of wherever the code runs, which for server-rendered pages is the server's. They don't provide this behaviour by themselves.* | AC-2.5 |
| A6 | There is no latest allowed due date: any date up to and including 31 December 9999, the last date with a four-digit year, is accepted. *Source: Decision.* | AC-2.6 |
| A7 | A user can have more than one task with the same title. *Source: Decision. No collection in the project requires unique values, but that's silence, not a precedent.* | AC-2.7 |
| A8 | Each list item shows the task's title, full description and due date, as well as its checkbox. There is no separate detail view. The edit view is the only other place a single task is shown. *Source: Precedent. The notes list shows each note's title and body in full (docs/GUIDE.md). The project also has an unused truncate helper and supports detail pages (/new-page skill), so this is a choice, not a rule.* | AC-4.3, AC-7.1 |
| A9 | Tasks are listed by due date, soonest first. Tasks with the same due date are listed by creation time, oldest first. If the due date is optional (AC-2.1), tasks without one come after all tasks with one, oldest first. *Source: Decision. The notes list sets no order.* | AC-4.4 |
| A10 | Completed tasks appear in the same list as pending ones, in the same order. *Source: Ticket, for visibility: completed tasks must be in the list so their checkbox can be unticked. Mixing them in rather than grouping them separately is a Decision; grouping would also meet the ticket.* | AC-4.5 |
| A11 | Overdue tasks are not marked. *Source: Ticket, which doesn't mention it. Marking would be a new feature.* | AC-4.6 |
| A12 | The list shows 20 tasks per page, and the user can move between pages. There is no limit on the number of tasks per user. *Source: Precedent. `paginationSchema` (frontend/src/lib/validations/common.ts, listed in CLAUDE.md "Codebase Map") defaults to 20 per page, with a maximum of 100. The notes list doesn't page, but it's tutorial code with no stated reason, so the documented building block takes priority. Paging also keeps each page load to a bounded number of reads on the free Firebase plan.* | AC-4.1, AC-4.7 |
| A13 | The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar. *Source: Precedent. docs/GUIDE.md step 4, the /new-page skill checklist, and the notes feature (/notes plus a sidebar link).* | AC-4.8 |
| A14 | List updates must appear within 3 seconds, measured on the test environment's connection with no network throttling. *Source: Decision. The project sets no performance targets.* | AC-4.11 |
| A15 | The list updates live: the user's own changes, and changes they make in another tab or on another device, appear without a reload. *Source: Precedent. The notes list updates live (docs/GUIDE.md, docs/ARCHITECTURE.md). The project doesn't require it: the /new-feature and /firebase-collection skills ask whether each feature needs realtime updates.* | AC-4.11 |
| A16 | Status can only be changed with the checkbox in the list. The edit view has no status control. *Source: Decision. The ticket names the checkbox as a way to change status but doesn't say it's the only one.* | AC-5.3 |
| A17 | A completed task can be edited in the same way as a pending one. *Source: Ticket, which places no restriction on editing.* | AC-5.4 |
| A18 | When the same task is edited in two places at once, the later save wins and no conflict warning is shown. *Source: Decision. Conflict detection would be a new feature.* | AC-5.5 |
| A19 | No completion time is recorded or shown. *Source: Ticket, which doesn't mention it. It would be a new feature.* | AC-6.6 |
| A20 | Deleting a task needs an in-page confirmation step, because the user can't undo a delete (restore is out of scope, see A25). Revisit this if the answer to AC-7.6 makes restoring tasks part of this ticket. *Source: Decision. The project has no confirmation pattern to reuse, and docs/DESIGN.md "Notifications" rules out the browser's built-in confirm dialog and modal toasts, so this needs a new in-page pattern.* | AC-7.5 |
| A21 | Deleted task records are kept indefinitely. This ticket adds no way, automatic or manual, to erase them. *Source: Rule for soft delete (docs/SECURITY.md "Soft-delete only"; docs/FIRESTORE-SCHEMA.md). Keeping records indefinitely is Precedent: the project has no purge mechanism and no account deletion. Note: the owner-only rules template in the /firebase-collection skill allows hard deletes, which contradicts docs/SECURITY.md. This spec follows docs/SECURITY.md (AC-7.3).* | AC-7.7 |
| A22 | A successful delete shows a success message. A successful toggle doesn't; the checkbox change is the confirmation. *Source: Decision. The project's only success-message precedent is for create (the notes form and docs/DESIGN.md "Forms"), and nothing in the app deletes or toggles yet.* | AC-8.2 |
| A23 | The narrowest supported screen width is 320px and the widest is 1920px. *Source: Rule for the breakpoints between them (docs/DESIGN.md "Responsive breakpoints", mobile-first). The two endpoints are a Decision: 320px is a conservative minimum phone width, and 1920px a common desktop width. docs/DESIGN.md "Spacing" suggests a 1280px page width, but the app's layout (frontend/src/components/layout/DashboardShell.tsx) doesn't cap content width, so the widest width needs its own check.* | AC-8.3 |
| A24 | The accessibility standard is the rules in docs/DESIGN.md "Accessibility". No external standard is required. *Source: Rule. docs/DESIGN.md "Accessibility"; no external standard is named anywhere in the project.* | AC-8.4 |
| A25 | Everything listed in section 9 is out of scope. Restoring deleted tasks stays out of scope unless the answer to AC-7.6 brings it in. *Source: Ticket, which mentions none of them; confirmed out of scope at spec review.* | §9, A20 |

---

## 1. Access and ownership

- **AC-1.1** While signed out, opening the task list redirects to the sign-in page, and a direct request to read, create, edit, complete or delete a task is refused. (P2) [Ticket: "users log in"; Project: docs/ARCHITECTURE.md, protected pages redirect to sign-in]
- **AC-1.2** When users A and B both have tasks, A's task list contains A's non-deleted tasks and none of B's. (P1) [Ticket]
- **AC-1.3** Signed in as A, a direct request to read, edit, complete or delete one of B's tasks is refused at every point listed under P2. Afterwards, B's task is unchanged. (P1, P2, P3) [Ticket: "their own"; Project: docs/SECURITY.md, "assume the client is untrusted"]
- **AC-1.4** Signed in as A, a direct request to create a task with B as its owner is refused, and so is a direct request to change the owner of one of A's own tasks. (P1, P2) [Project: docs/SECURITY.md, owner field is immutable; docs/TUTORIAL-WALKTHROUGH.md, creating a record as another user is refused]
- **AC-1.5** Admin access: [NEEDS CLARIFICATION: Can admins view or manage other users' tasks, or can only a task's owner see them?]
- **AC-1.6** When a user's session has expired or been revoked, the app treats them as signed out: opening the task list redirects to the sign-in page, and any task action or direct request made with that session is refused. (P5) [Project: docs/SECURITY.md "Authentication": every action checks the session for expiry and revocation]

## 2. Task fields

These rules apply both when creating and when editing a task.

- **AC-2.1** A task has a title, a description and a due date. [Ticket] Submitting a required field empty is refused, with the error described in AC-2.8. Required fields: [NEEDS CLARIFICATION: Which of title, description and due date are required?]
- **AC-2.2** A title of up to 200 characters is accepted, and one of 201 characters is refused. A title made only of spaces counts as empty (see AC-2.1), and leading and trailing spaces are removed when the title is saved. [Assumes A1, A2]
- **AC-2.3** A description of up to 10,000 characters is accepted, and one of 10,001 characters is refused. The description is plain text, and a description saved with line breaks is displayed with the same line breaks. [Assumes A3, A4]
- **AC-2.4** Due date precision: [NEEDS CLARIFICATION: Is the due date a calendar date only, or a date and time?]
- **AC-2.5** A saved due date is displayed back to the user as the same date (and time, if AC-2.4 includes time) that they entered, on the device they entered it from. On a device set to a different timezone, a date-only due date shows the same date, and a date-and-time due date shows the same moment in that device's timezone. [Ticket] [Assumes A5]
- **AC-2.6** Any due date up to and including 31 December 9999 is accepted. [Assumes A6] Past due dates: [NEEDS CLARIFICATION: Can a task be created or edited with a due date in the past?]
- **AC-2.7** A user can save a task with the same title as another of their tasks. [Assumes A7]
- **AC-2.8** When a submission breaks any field rule, it is refused. Each invalid field shows an error message with that field naming the rule broken (for example, "Title is required"). Valid fields show no error. [Project: docs/DESIGN.md, "Forms": field-level error messages]
- **AC-2.9** Every field rule in this section is also enforced on direct requests: a direct request to create or edit a task that breaks any of them is refused. (P2) [Project: docs/GUIDE.md golden rule 1, "Never trust the browser"; frontend/CLAUDE.md, input is validated before any database operation; docs/SECURITY.md "Input Validation"]
- **AC-2.10** A direct request to create or edit a task that includes any field this spec doesn't define for tasks is refused. (P2) [Project: docs/SECURITY.md "Field allowlists" and "Input Validation": unknown fields are rejected]

## 3. Create

- **AC-3.1** When a signed-in user submits valid fields, a new task appears in their task list with the values they entered. It doesn't appear in any other user's list. (P1) [Ticket]
- **AC-3.2** Starting status: [NEEDS CLARIFICATION: Does every new task start as pending?]

## 4. Read

- **AC-4.1** The task list contains every non-deleted task the user owns, and nothing else. Each task appears on exactly one page (see AC-4.7). [Ticket] [Assumes A12]
- **AC-4.2** Each list item shows the task's title and a checkbox. The checkbox is ticked if the task is completed and unticked if it is pending. [Ticket: "the checkbox in the task list"]
- **AC-4.3** Each list item also shows the task's full description and its due date. There is no separate detail view. [Assumes A8]
- **AC-4.4** Tasks are listed by due date, soonest first. Tasks with the same due date are listed by creation time, oldest first. If the due date is optional (AC-2.1), tasks without one come after all tasks with one, oldest first. [Assumes A9]
- **AC-4.5** Completed tasks appear in the same list as pending tasks, in the order set by AC-4.4. [Assumes A10]
- **AC-4.6** A pending task whose due date has passed is shown the same way as any other pending task, with no overdue marking. [Assumes A11]
- **AC-4.7** The list shows 20 tasks per page, in the order set by AC-4.4. When the user has more than 20 tasks, they can move to the next and previous pages; for example, with 21 tasks, the first page shows 20 and the second shows 1. There is no limit on the number of tasks a user can have. [Assumes A12]
- **AC-4.8** The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar. [Assumes A13]
- **AC-4.9** When the user has no non-deleted tasks, the list area shows an empty-state message (for example, "No tasks yet") and no task items. [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.10** While tasks are loading, a loading indicator is shown. If loading fails, an error message is shown and the empty-state message from AC-4.9 is not. (P4) [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.11** Within 3 seconds of a create, edit, toggle or delete succeeding, the list shows the change, without a page reload or any other action by the user. This applies on the screen where the change was made, and in the same user's other tabs and devices. [Assumes A14, A15]

## 5. Update

- **AC-5.1** A user can change the title, description and due date of their own task. After a valid edit is saved, the list shows the new values (see AC-4.11). [Ticket]
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

## 7. Delete

- **AC-7.1** After a user deletes their own task, it isn't in their task list, no single-task view shows it (see AC-4.3), and a direct request by the owner to read it is refused. (P2) [Ticket] [Assumes A8]
- **AC-7.2** After deletion, the stored record still exists with the same title, description, due date, status, owner and creation time it had before deletion, plus a deletion time (the ticket's `deletedAt`). That time is no earlier than when the delete was requested and no later than when the success response was received. (P3) [Ticket]
- **AC-7.3** A direct request from a task's owner to permanently erase it is refused, and the stored record still exists afterwards. (P2, P3) [Ticket: "not a hard delete"; Project: docs/SECURITY.md, "Soft-delete only"]
- **AC-7.4** Attempts to edit, complete or delete a deleted task are refused. This applies both from an outdated screen, such as a second tab still showing the task, and by direct request. Afterwards the stored record, including its deletion time, is unchanged. When the attempt comes from the interface, the error message says the task no longer exists. (P2, P3) [Ticket: a deleted task is gone as far as its owner is concerned]
- **AC-7.5** Deleting a task requires the user to confirm. If they cancel, the task is unchanged and stays in the list. [Assumes A20]
- **AC-7.6** Purpose of keeping deleted tasks: [NEEDS CLARIFICATION: What is the kept record for: letting the user restore the task, recovery by an admin, or record-keeping only? Is restoring a task in this ticket's scope?]
- **AC-7.7** None of the points listed under P2 offers a way to erase a deleted task's record, and this ticket adds no automatic erasure. (P2) [Assumes A21]

## 8. All actions

- **AC-8.1** When a create, edit, toggle or delete fails, an error message is shown and no success message is shown. From the moment the error appears, the task list matches the stored tasks: a failed create adds no item, a failed edit shows the old values, and a failed delete removes no item. (P4) [Project: docs/DESIGN.md, "Forms" and "Notifications"; frontend/CLAUDE.md, every action reports success or failure]
- **AC-8.2** When a create, an edit or a delete succeeds, a success message is shown. A successful toggle shows no success message; the checkbox change is the confirmation. [Project: docs/DESIGN.md, "Forms"] [Assumes A22]
- **AC-8.3** At 320px and 1920px wide, and at each layout breakpoint in docs/DESIGN.md between them (640, 768, 1024 and 1280px), every action in sections 3–7 can be completed without scrolling the page sideways. [Project: docs/DESIGN.md, mobile-first layout] [Assumes A23]
- **AC-8.4** Every action in sections 3–7 can be completed using only the keyboard. Every interactive control has an accessible name, and each checkbox's accessible name includes its task's title. The feature meets every rule in docs/DESIGN.md "Accessibility". [Project: docs/DESIGN.md, "Accessibility"] [Assumes A24]
- **AC-8.5** No error message shown to the user, or returned to a direct request, contains internal details such as stack traces, database paths or raw server error text. (P2, P4) [Project: docs/SECURITY.md "Error Handling"; backend/CLAUDE.md "Error Handling"]
- **AC-8.6** Every stored task record carries a schema version, set to 1 when the task is created, so that later changes to the task's shape can migrate old records. (P3) [Project: docs/FIRESTORE-SCHEMA.md "Schema versioning": every document must include it]
- **AC-8.7** Every stored task record holds its creation time and its last-updated time. The creation time never changes. The last-updated time is set by every successful create, edit, toggle and delete. (P3) [Project: the /firebase-collection and /new-feature skill templates, and every collection in docs/FIRESTORE-SCHEMA.md]

## 9. Scope

Out of scope for this ticket: search or filtering; priorities, tags or categories; reminders or notifications as a due date approaches; recurring tasks; subtasks; sharing tasks with other users; completing or deleting several tasks at once; and restoring deleted tasks, unless the answer to AC-7.6 brings it into scope. [Assumes A25]

## Delivery requirements

Checked by review before the change is merged.

- **D1** The tasks collection is documented in docs/FIRESTORE-SCHEMA.md: each field, its type and limits, and who can access it. [Project: CLAUDE.md "Firestore": every collection is documented; docs/GUIDE.md golden rule 3]
- **D2** Automated unit tests cover every field rule in section 2 and any hook that loads tasks. Any backend endpoint added for tasks has at least a success test and a test that it refuses a request without credentials. [Project: docs/TESTING.md "What to Test"]
- **D3** Before merge, CI passes: lint, typecheck, all unit tests, and the dependency audit with no high or critical vulnerabilities. [Project: docs/GIT-WORKFLOW.md "Protected Branch"; docs/SECURITY.md "Dependency Scanning"]

---

## Ticket coverage

| Ticket says | Covered by |
|---|---|
| Users log in (product context) | AC-1.1, AC-1.6 |
| Create, read, update, delete **their own** tasks | §1, §3, §4, §5, §7 |
| Each with a title, description and due date | §2 |
| Deleting is a soft delete (`deletedAt`), not a hard delete | AC-7.1 – AC-7.4 |
| Checkbox in the task list toggles between pending and completed | §6, AC-4.2 |
