# Task CRUD — Acceptance Criteria

**Product:** Simple Task Dashboard
**Status:** Draft. Not ready to build until the open questions below are answered.
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
- Anything that neither source settles is marked `[NEEDS CLARIFICATION: …]`. Nothing has been assumed in its place. A criterion with a marker can't be signed off until the question is answered.
- This spec covers behaviour (what and why), not implementation.

## Terms

- **Task**: a to-do item belonging to one user, with a title, description, due date and status.
- **Owner**: the user who created the task.
- **Status**: *pending* or *completed*. The ticket names no others.
- **Deleted task**: a task its owner has deleted. From the owner's point of view it is gone. The record itself is kept and marked with the time it was deleted.

---

## 1. Access and ownership

- **AC-1.1** Someone who isn't signed in can't view, create or change any task. Trying to open the task list sends them to sign in. [Ticket: "users log in"; Project: docs/ARCHITECTURE.md, protected pages redirect to sign-in]
- **AC-1.2** A signed-in user sees only their own tasks. Other users' tasks never appear to them. [Ticket]
- **AC-1.3** A user can't read, edit, complete or delete another user's task, even by bypassing the interface and sending requests to the app directly. The attempt is refused and the other user's task is unchanged. [Ticket: "their own"; Project: docs/SECURITY.md, "assume the client is untrusted"]
- **AC-1.4** A task permanently belongs to the user who created it. A user can't create a task on someone else's behalf, and no one can change a task's owner afterwards. [Project: docs/SECURITY.md, owner field is immutable; docs/TUTORIAL-WALKTHROUGH.md, creating a record as another user is refused]
- **AC-1.5** Admin access: [NEEDS CLARIFICATION: The app already has an admin role, and admins can read every user's profile. Can admins view or manage other users' tasks, or can only a task's owner see it?]

## 2. Task fields

These rules apply both when creating and when editing a task.

- **AC-2.1** A task has a title, a description and a due date. [Ticket] Required fields: [NEEDS CLARIFICATION: The ticket says each task has a title, description and due date. Are all three required, or can the description and/or due date be left blank?]
- **AC-2.2** Title length: [NEEDS CLARIFICATION: What are the minimum and maximum title lengths, and does a title made only of spaces count as empty? For reference, the existing notes feature allows 1–200 characters.]
- **AC-2.3** Description length and format: [NEEDS CLARIFICATION: What is the maximum description length, and do line breaks the user types have to be kept when the description is shown? For reference, the notes feature allows up to 10,000 characters.]
- **AC-2.4** Due date precision: [NEEDS CLARIFICATION: Is the due date a calendar date only, or a date and time?]
- **AC-2.5** Due date timezone: [NEEDS CLARIFICATION: Which timezone is the due date entered and shown in: each user's local timezone, or one fixed timezone for the whole app?]
- **AC-2.6** Due date range: [NEEDS CLARIFICATION: Can a task be created or edited with a due date in the past? Is there a latest allowed date?]
- **AC-2.7** Duplicate titles: [NEEDS CLARIFICATION: Can a user have two tasks with the same title?]
- **AC-2.8** If a user submits a task that breaks any field rule, the task isn't saved and the user is shown which field is invalid and why. [Project: docs/DESIGN.md, "Forms": field-level error messages]

## 3. Create

- **AC-3.1** A signed-in user can create a task by entering its fields. When they submit valid fields, the task is saved as theirs and appears in their task list. [Ticket]
- **AC-3.2** Starting status: [NEEDS CLARIFICATION: Does every new task start as pending, or can the user create a task that is already completed?]

## 4. Read

- **AC-4.1** A signed-in user's task list shows every task they own that hasn't been deleted. [Ticket]
- **AC-4.2** Each task in the list shows its title and a checkbox for its status: ticked means completed, unticked means pending. [Ticket: "the checkbox in the task list"]
- **AC-4.3** Other fields in the list: [NEEDS CLARIFICATION: Does each list item also show the description and due date? If not, how does the user see a task's full details: a separate detail view, an expandable item, or only the edit view?]
- **AC-4.4** List order: [NEEDS CLARIFICATION: In what order are tasks listed: by due date, creation date, title, or an order the user chooses? If the due date is optional (AC-2.1), where do tasks without one appear?]
- **AC-4.5** Completed tasks in the list: [NEEDS CLARIFICATION: Are completed tasks listed together with pending ones, grouped separately, or hidden with an option to show them?]
- **AC-4.6** Overdue tasks: [NEEDS CLARIFICATION: Should the list mark a pending task as overdue once its due date has passed?]
- **AC-4.7** List size: [NEEDS CLARIFICATION: Is there a maximum number of tasks per user? Should a long list be split into pages, or always shown in full?]
- **AC-4.8** Location: [NEEDS CLARIFICATION: Is the task list the main content of the existing dashboard page, or a separate page in the navigation?]
- **AC-4.9** A user with no tasks, or only deleted ones, sees a message saying they have no tasks yet instead of a blank area. [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.10** While tasks are loading, the user sees a loading indicator. If tasks fail to load, the user sees an error message. A failed load must never look like an empty list. [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.11** After the user creates, edits, completes or deletes a task, the list shows the change without a page reload. [Project: docs/ARCHITECTURE.md, the app's lists update live] Changes from elsewhere: [NEEDS CLARIFICATION: If the same user has the app open in another tab or on another device, do changes made there have to appear without a reload?]

## 5. Update

- **AC-5.1** A user can change the title, description and due date of their own task. When they save valid changes, the task is updated and the list shows the new values. [Ticket]
- **AC-5.2** Saving an edit changes only the fields the user edited. For example, changing the title leaves the description, due date and status as they were. [Ticket]
- **AC-5.3** Status in the edit view: [NEEDS CLARIFICATION: Can status also be changed while editing a task, or only with the checkbox in the list?]
- **AC-5.4** Editing completed tasks: [NEEDS CLARIFICATION: Can a completed task be edited, or must it be set back to pending first?]
- **AC-5.5** Simultaneous edits: [NEEDS CLARIFICATION: If the same task is edited in two places at once (for example, two tabs), is it acceptable for the last save to win, or should the second save warn that the task has changed?]

## 6. Mark complete

- **AC-6.1** Ticking the checkbox of a pending task marks it completed. [Ticket]
- **AC-6.2** Unticking the checkbox of a completed task marks it pending again. [Ticket]
- **AC-6.3** The status change is saved: it is still there after the user reloads the page, or signs out and back in. [Ticket]
- **AC-6.4** Toggling changes only the status. The title, description and due date stay the same. [Ticket]
- **AC-6.5** If a toggle fails to save, the checkbox goes back to the task's saved status and the user is told the change wasn't saved. The checkbox never shows a status that hasn't been saved. [Project: see AC-8.1]
- **AC-6.6** Completion time: [NEEDS CLARIFICATION: Should the app record when a task was completed, and show that time to the user?]

## 7. Delete

- **AC-7.1** A user can delete their own task. Once deleted, it no longer appears anywhere the user sees tasks, and they can't view, edit or complete it. [Ticket]
- **AC-7.2** Deleting doesn't erase the task's record. The record is kept and marked with the time it was deleted (the ticket's `deletedAt`). [Ticket]
- **AC-7.3** No user can permanently erase a task, even by sending requests to the app directly instead of using the interface. [Ticket: "not a hard delete"; Project: docs/SECURITY.md, "Soft-delete only"]
- **AC-7.4** A deleted task can't be changed. If the user acts on it from an outdated screen, such as a second tab that still shows it, the action is refused and they are told the task no longer exists. [Ticket: a deleted task is gone as far as its owner is concerned]
- **AC-7.5** Confirmation: [NEEDS CLARIFICATION: Does the user have to confirm before a task is deleted?]
- **AC-7.6** Purpose of keeping deleted tasks: [NEEDS CLARIFICATION: What is the kept record for: letting the user undo or restore the task, recovery by an admin, or record-keeping only? If users can restore tasks, is that in this ticket's scope, and how long can a task be restored for?]
- **AC-7.7** Retention: [NEEDS CLARIFICATION: Are deleted tasks ever erased for good, for example after a set period or when the user closes their account, or are they kept indefinitely?]

## 8. All actions

- **AC-8.1** When creating, editing, completing or deleting a task fails, the user is told it failed, and what they see matches what is actually saved. A failure never looks like a success. [Project: docs/DESIGN.md, "Forms" and "Notifications"; frontend/CLAUDE.md, every action reports success or failure]
- **AC-8.2** When a task is created or an edit is saved, the user sees a confirmation. [Project: docs/DESIGN.md, "Forms"] Deletes and toggles: [NEEDS CLARIFICATION: Should deleting a task, and completing or un-completing it, also show a confirmation message, or is it enough that the task disappears or the checkbox changes?]
- **AC-8.3** Every task screen works on a phone-sized screen as well as on a desktop. [Project: docs/DESIGN.md, mobile-first layout]
- **AC-8.4** Every task action can be done with the keyboard alone, and every control is labelled for assistive technology. For example, each checkbox identifies which task it belongs to. [Project: docs/DESIGN.md, "Accessibility"]

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
