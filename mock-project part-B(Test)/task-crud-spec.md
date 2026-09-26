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
  - **[Project: file]**: a rule this app already applies to every feature, documented in the cited file. These are existing decisions, not new ones.
- Anything that neither source settles is marked `[NEEDS CLARIFICATION: …]`. Nothing has been assumed in its place. A criterion with a marker is blocked: it can't be built or tested until the question is answered.
- Every criterion has a pass/fail result that two testers would agree on. Where a number is missing (a length limit, a time limit, a screen width), the criterion shows where the number goes as a placeholder in *italics* and asks for it, instead of using words like "fast" or "works".
- Criteria that need special test access name the prerequisite they depend on (P1–P4 below).
- This spec covers behaviour (what and why), not implementation.

## Terms

- **Task**: a to-do item belonging to one user, with a title, description, due date and status.
- **Owner**: the user who created the task.
- **Status**: *pending* or *completed*. The ticket names no others.
- **Deleted task**: a task its owner has deleted. From the owner's point of view it is gone. The record itself is kept and marked with the time it was deleted.
- **Direct request**: a request sent straight to any point where the app reads or writes task data, without going through the interface.
- **Refused**: no task is created and no stored task changes, and the requester gets an error rather than a success response.

## Test prerequisites

Some criteria can't be checked through the interface alone. Testers need:

- **P1** At least two test accounts, to check that users can't reach each other's tasks.
- **P2** A way to send direct requests, both with a test account's credentials and with none, to every point where the feature reads or writes task data. The implementation must list these points.
- **P3** Read access to stored task records, including deleted ones. The owner can't see a deleted task, so the interface can't show that its record was kept.
- **P4** A way to make a save fail on demand (for example, by going offline), to check failure behaviour.

---

## 1. Access and ownership

- **AC-1.1** While signed out, opening the task list redirects to the sign-in page, and a direct request to read, create, edit, complete or delete a task is refused. (P2) [Ticket: "users log in"; Project: docs/ARCHITECTURE.md, protected pages redirect to sign-in]
- **AC-1.2** When users A and B both have tasks, A's task list contains A's non-deleted tasks and none of B's. (P1) [Ticket]
- **AC-1.3** Signed in as A, a direct request to read, edit, complete or delete one of B's tasks is refused at every point listed under P2. Afterwards, B's task is unchanged. (P1, P2, P3) [Ticket: "their own"; Project: docs/SECURITY.md, "assume the client is untrusted"]
- **AC-1.4** Signed in as A, a direct request to create a task with B as its owner is refused, and so is a direct request to change the owner of one of A's own tasks. (P1, P2) [Project: docs/SECURITY.md, owner field is immutable; docs/TUTORIAL-WALKTHROUGH.md, creating a record as another user is refused]
- **AC-1.5** Admin access: [NEEDS CLARIFICATION: The app already has an admin role, and admins can read every user's profile. Can admins view or manage other users' tasks, or can only a task's owner see it?]

## 2. Task fields

These rules apply both when creating and when editing a task.

- **AC-2.1** A task has a title, a description and a due date. [Ticket] Submitting a required field empty is refused, with the error described in AC-2.8. Required fields: [NEEDS CLARIFICATION: The ticket says each task has a title, description and due date. Are all three required, or can the description and/or due date be left blank?]
- **AC-2.2** A title of *min* to *max* characters is accepted, and titles of *min* − 1 and *max* + 1 characters are refused. [NEEDS CLARIFICATION: What are *min* and *max*? Does a title made only of spaces count as empty? For reference, the existing notes feature allows 1–200 characters.]
- **AC-2.3** A description of up to *max* characters is accepted, and one of *max* + 1 characters is refused. [NEEDS CLARIFICATION: What is *max*? For reference, the notes feature allows up to 10,000 characters.] Line breaks: [NEEDS CLARIFICATION: Do line breaks the user types have to be kept? If so, a description saved with line breaks is displayed with the same line breaks.]
- **AC-2.4** Due date precision: [NEEDS CLARIFICATION: Is the due date a calendar date only, or a date and time?]
- **AC-2.5** A saved due date is displayed back to the user as the same date (and time, if AC-2.4 includes time) that they entered, on the device they entered it from. [Ticket] Timezone: [NEEDS CLARIFICATION: Which timezone is the due date entered and shown in: each user's local timezone, or one fixed timezone for the whole app?]
- **AC-2.6** Due date range: [NEEDS CLARIFICATION: Can a task be created or edited with a due date in the past? Is there a latest allowed date?]
- **AC-2.7** Duplicate titles: [NEEDS CLARIFICATION: Can a user have two tasks with the same title?]
- **AC-2.8** When a submission breaks any field rule, it is refused. Each invalid field shows an error message with that field naming the rule broken (for example, "Title is required"). Valid fields show no error. [Project: docs/DESIGN.md, "Forms": field-level error messages]

## 3. Create

- **AC-3.1** When a signed-in user submits valid fields, a new task appears in their task list with the values they entered. It doesn't appear in any other user's list. (P1) [Ticket]
- **AC-3.2** Starting status: [NEEDS CLARIFICATION: Does every new task start as pending, or can the user create a task that is already completed?]

## 4. Read

- **AC-4.1** The task list contains every non-deleted task the user owns (subject to AC-4.7), and nothing else. [Ticket]
- **AC-4.2** Each list item shows the task's title and a checkbox. The checkbox is ticked if the task is completed and unticked if it is pending. [Ticket: "the checkbox in the task list"]
- **AC-4.3** Other fields in the list: [NEEDS CLARIFICATION: Does each list item also show the description and due date? If not, how does the user see a task's full details: a separate detail view, an expandable item, or only the edit view?]
- **AC-4.4** List order: [NEEDS CLARIFICATION: In what order are tasks listed: by due date, creation date, title, or an order the user chooses? Which task comes first when two share the same sort value? If the due date is optional (AC-2.1), where do tasks without one appear?]
- **AC-4.5** Completed tasks in the list: [NEEDS CLARIFICATION: Are completed tasks listed together with pending ones, grouped separately, or hidden with an option to show them?]
- **AC-4.6** Overdue tasks: [NEEDS CLARIFICATION: Should the list mark a pending task as overdue once its due date has passed? If so, from what moment: the start of the day after the due date, or the due time itself (see AC-2.4)?]
- **AC-4.7** List size: [NEEDS CLARIFICATION: Is there a maximum number of tasks per user? Should a long list be split into pages, and if so, how many tasks per page?]
- **AC-4.8** Location: [NEEDS CLARIFICATION: Is the task list the main content of the existing dashboard page, or a separate page in the navigation?]
- **AC-4.9** When the user has no non-deleted tasks, the list area shows an empty-state message (for example, "No tasks yet") and no task items. [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.10** While tasks are loading, a loading indicator is shown. If loading fails, an error message is shown and the empty-state message from AC-4.9 is not. (P4) [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.11** Within *N* seconds of the user's own create, edit, toggle or delete succeeding, the list shows the change, without a page reload or any other action by the user. [Project: docs/ARCHITECTURE.md, the app's lists update live] [NEEDS CLARIFICATION: What is *N*?] Changes from elsewhere: [NEEDS CLARIFICATION: If the same user has the app open in another tab or on another device, do changes made there have to appear without a reload? If so, within how many seconds?]

## 5. Update

- **AC-5.1** A user can change the title, description and due date of their own task. After a valid edit is saved, the list shows the new values (see AC-4.11). [Ticket]
- **AC-5.2** After an edit is saved, every field the user didn't change, including status, has the same value as before the edit. [Ticket]
- **AC-5.3** Status in the edit view: [NEEDS CLARIFICATION: Can status also be changed while editing a task, or only with the checkbox in the list?]
- **AC-5.4** Editing completed tasks: [NEEDS CLARIFICATION: Can a completed task be edited, or must it be set back to pending first?]
- **AC-5.5** Simultaneous edits: [NEEDS CLARIFICATION: If the same task is edited in two places at once (for example, two tabs), is it acceptable for the last save to win, or should the second save be refused with a message that the task has changed?]

## 6. Mark complete

- **AC-6.1** Ticking the checkbox of a pending task changes its status to completed. [Ticket]
- **AC-6.2** Unticking the checkbox of a completed task changes its status to pending. [Ticket]
- **AC-6.3** After a successful toggle, the new status is still shown after the user reloads the page, and after they sign out and back in. [Ticket]
- **AC-6.4** After a toggle, the task's title, description and due date are the same as before. [Ticket]
- **AC-6.5** If a toggle fails, an error message is shown. From the moment it appears, the checkbox shows the status the task had before the toggle. (P4) [Project: see AC-8.1]
- **AC-6.6** Completion time: [NEEDS CLARIFICATION: Should the app record when a task was completed, and show that time to the user?]

## 7. Delete

- **AC-7.1** After a user deletes their own task, it isn't in their task list, no single-task view shows it (see AC-4.3), and a direct request by the owner to read it is refused. (P2) [Ticket]
- **AC-7.2** After deletion, the stored record still exists with every field value it had before deletion, plus a deletion time (the ticket's `deletedAt`). That time is no earlier than when the delete was requested and no later than when the success response was received. (P3) [Ticket]
- **AC-7.3** A direct request from a task's owner to permanently erase it is refused, and the stored record still exists afterwards. (P2, P3) [Ticket: "not a hard delete"; Project: docs/SECURITY.md, "Soft-delete only"]
- **AC-7.4** Attempts to edit, complete or delete a deleted task are refused. This applies both from an outdated screen, such as a second tab still showing the task, and by direct request. Afterwards the stored record, including its deletion time, is unchanged. When the attempt comes from the interface, the error message says the task no longer exists. (P2, P3) [Ticket: a deleted task is gone as far as its owner is concerned]
- **AC-7.5** Confirmation: [NEEDS CLARIFICATION: Does the user have to confirm before a task is deleted?]
- **AC-7.6** Purpose of keeping deleted tasks: [NEEDS CLARIFICATION: What is the kept record for: letting the user undo or restore the task, recovery by an admin, or record-keeping only? If users can restore tasks, is that in this ticket's scope, and how long can a task be restored for?]
- **AC-7.7** Retention: [NEEDS CLARIFICATION: Are deleted tasks ever erased for good, for example after a set period or when the user closes their account, or are they kept indefinitely?]

## 8. All actions

- **AC-8.1** When a create, edit, toggle or delete fails, an error message is shown and no success message is shown. From the moment the error appears, the task list matches the stored tasks: a failed create adds no item, a failed edit shows the old values, and a failed delete removes no item. (P4) [Project: docs/DESIGN.md, "Forms" and "Notifications"; frontend/CLAUDE.md, every action reports success or failure]
- **AC-8.2** When a create or an edit succeeds, a success message is shown. [Project: docs/DESIGN.md, "Forms"] Deletes and toggles: [NEEDS CLARIFICATION: Should deleting a task, and completing or un-completing it, also show a success message, or is it enough that the task disappears or the checkbox changes?]
- **AC-8.3** At the narrowest and widest supported screen widths, and at each layout breakpoint in docs/DESIGN.md between them, every action in sections 3–7 can be completed without scrolling the page sideways. [Project: docs/DESIGN.md, mobile-first layout] [NEEDS CLARIFICATION: What are the narrowest and widest screen widths that must be supported? docs/DESIGN.md defines breakpoints from 640px to 1280px, but no minimum supported width.]
- **AC-8.4** Every action in sections 3–7 can be completed using only the keyboard. Every interactive control has an accessible name, and each checkbox's accessible name includes its task's title. [Project: docs/DESIGN.md, "Accessibility"] Standard: [NEEDS CLARIFICATION: Must the feature meet a named accessibility standard, such as WCAG 2.2 level AA? Without one, accessibility can only be checked against the rules in this criterion.]

## 9. Scope

[NEEDS CLARIFICATION: The ticket doesn't mention any of the following. Confirm that each is out of scope for this ticket: search or filtering; priorities, tags or categories; reminders or notifications as a due date approaches; recurring tasks; subtasks; sharing tasks with other users; completing or deleting several tasks at once; restoring deleted tasks (see AC-7.6).]

---

## Ticket coverage

| Ticket says | Covered by |
|---|---|
| Users log in (product context) | AC-1.1 |
| Create, read, update, delete **their own** tasks | §1, §3, §4, §5, §7 |
| Each with a title, description and due date | §2 |
| Deleting is a soft delete (`deletedAt`), not a hard delete | AC-7.1 – AC-7.4 |
| Checkbox in the task list toggles between pending and completed | §6, AC-4.2 |
