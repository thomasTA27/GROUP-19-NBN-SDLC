# Task CRUD — Acceptance Criteria

**Product:** Simple Task Dashboard
**Status:** Draft for team review. All six open questions are answered (see Resolved questions). The assumptions still need the product owner's confirmation, starting with "Additions to confirm".
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
  - **[Assumes A#]**: depends on a numbered decision in the Assumptions table. Every decision this spec makes itself, including behaviour that no ticket, answer or rule states, is in that table, so the product owner can confirm it in one place. If an assumption is rejected, every criterion in its "Used by" column has to be revisited.
- The six questions only the product owner could answer have all been answered. They're recorded in Resolved questions (R1–R6), and no `NEEDS CLARIFICATION` markers remain.
- Each criterion states one rule, with a pass/fail result that two testers would agree on. Where neither the ticket nor an answer gives a number (a length limit, a time limit, a screen width), an assumption supplies one, instead of words like "fast" or "works".
- IDs are stable between revisions. A criterion split into several keeps its number with a letter (AC-2.1a, AC-2.1b). A new criterion takes the next free number in its section. A removed criterion stays as a one-line note saying where its content went.
- Criteria that need special test access name the prerequisite they depend on (P1–P8 below).
- Delivery requirements (D1–D5, at the end) are checked by review before merge, not by testing the running app.
- This spec covers behaviour (what and why), not implementation.

## Terms

- **Task**: a to-do item belonging to one user.
- **Task fields**: the four a user sets (title, description, due date, status) and the five the app sets, called **system fields** (owner, creation time, last-updated time, deletion time, schema version). A task has no other fields.
- **Owner**: the user who created the task.
- **Status**: *pending* or *completed*. There are no others (R5).
- **Toggle**: the action the checkbox performs, switching a task between pending and completed. A toggle can also be sent as a direct request.
- **Task list**: the user's list of tasks, across all of its pages.
- **Read**: fetching a task, or any list or search of tasks. A read "of" a task includes any list or search that would return it.
- **Field rule**: any of AC-2.1a to AC-2.6d, which decide whether a submission is accepted or refused.
- **Character**: one Unicode code point (A27). The emoji 👍 counts as 1, the flag 🇦🇺 as 2, and each line break as 1.
- **Whitespace**: any Unicode whitespace character, including spaces, tabs, line breaks and non-breaking spaces (A2).
- **Past**: a due date and time earlier than the start of the current minute, by the server's clock (A26).
- **Deleted task**: a task its owner has deleted. From the owner's point of view it is gone. Its record is kept as a record only for 30 days after it was deleted, then erased automatically (R6).
- **Erased**: permanently removed from storage. The record no longer exists.
- **Credentials**: what a request carries to prove who is signed in: the 14-day session used by pages and in-app actions, or the 1-hour sign-in token used by other direct requests (docs/ARCHITECTURE.md, docs/SECURITY.md).
- **Direct request**: a request sent straight to any point where the app reads or writes task data, without going through the interface.
- **Refused**: the request has no effect (no task is created, changed or erased), and the requester gets an error, with no task data, rather than a success response.

## Test prerequisites

Some criteria can't be checked through the interface alone. Testers need:

- **P1** At least two test accounts, plus one with the admin role (set as described in docs/SECURITY.md), to check that users, admins included, can't reach each other's tasks.
- **P2** A way to send direct requests, both with a test account's credentials and with none, to every point where the feature reads or writes task data. The implementation must list these points.
- **P3** Read access to stored task records, including deleted ones. The owner can't see a deleted task, so the interface can't show that its record was kept or erased.
- **P4** A way to make a save or a load fail on demand, and to slow loading down enough to see it: for example, going offline, or using the browser's network throttling.
- **P5** A way to revoke a test account's session, as described in docs/SECURITY.md "Revoking sessions".
- **P6** A way to check automatic erasure without waiting 30 days: on a test project, move a deleted record's deletion time further into the past, then let the erasure run. The implementation must document how often the erasure runs.
- **P7** A way to get expired credentials without a long wait: for example, a session created with a lifetime of a few minutes on the test project, or a sign-in token saved more than an hour earlier.
- **P8** A test device whose clock is synchronised to network time, for checking stored times (A34).

## Resolved questions

Answered by the product owner, Sajad Ali Akbari, on 2026-09-27. These are team decisions, not client decisions: the feature is the product owner's own proposal.

| ID | Question | Answer | Decided by | Used by |
|---|---|---|---|---|
| R1 | Was AC-1.5. Can admins view or manage other users' tasks, or only the owner? | Only the owner can view or manage a task. Admins have no access to other users' tasks. | Sajad Ali Akbari, product owner (team decision) | AC-1.5, AC-7.3, AC-7.6 |
| R2 | Was AC-2.1. Which of title, description and due date are required? | Title and due date are required. Description is optional. | Sajad Ali Akbari, product owner (team decision) | AC-2.1a, AC-2.1b, AC-2.1c, AC-2.2a, AC-4.3, A9 |
| R3 | Was AC-2.4. Is the due date a calendar date only, or a date and time? | Date and time. | Sajad Ali Akbari, product owner (team decision) | AC-2.4, AC-2.5, AC-4.3, A5 |
| R4 | Was AC-2.6. Can a task be created or edited with a due date in the past? | A new task cannot be created with a due date in the past. When editing, an existing due date that has already passed can be kept, but it cannot be changed to a different date in the past. | Sajad Ali Akbari, product owner (team decision) | AC-2.6a, AC-2.6b, AC-2.6c, AC-6.7, A26 |
| R5 | Was AC-3.2. Does every new task start as pending? | Every new task starts as pending, and stays pending until the user ticks it completed. There is no other status. | Sajad Ali Akbari, product owner (team decision) | AC-3.2a, AC-3.2b, AC-3.2c, AC-5.3, A16, A32 |
| R6 | Was AC-7.6. What is the kept record of a deleted task for, and is restoring a task in this ticket's scope? | Kept as a record only, for 30 days after deletion, then permanently erased automatically. The automatic erasure is part of this ticket. Restoring or reviewing deleted tasks is out of scope and will be a later feature. | Sajad Ali Akbari, product owner (team decision) | AC-7.2, AC-7.3, AC-7.6, AC-7.7, AC-7.8, §9, D1, D4, D5, A20, A21, A25 |

### How the answers are applied

These readings go slightly beyond the literal answers. The product owner should confirm them.

- **R4:** because the due date is a date and time (R3), "a different date in the past" is read as any change to the stored due date and time that lands in the past. A change of time alone counts. Which clock decides "past", and how precisely, is assumption A26.
- **R5:** "stays pending until the user ticks it" is read as: nothing but a toggle changes a task's status, and an edit that would change it is refused (AC-5.3, A16).
- **R6:** "30 days" is read as 720 hours from the deletion time; how soon after that the erasure must happen is assumption A21. "Reviewing deleted tasks" is read as viewing them, one at a time or as a list, which is out of scope (§9).

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
| A1 | A title can be at most 200 characters. *Source: Precedent. This is the notes title limit in docs/FIRESTORE-SCHEMA.md.* | AC-2.2a |
| A2 | Whitespace means any Unicode whitespace character, including spaces, tabs, line breaks and non-breaking spaces. A title made only of whitespace counts as empty. Leading and trailing whitespace is removed when a title is saved, whether it comes from the interface or a direct request, and length limits apply after it's removed. *Source: Decision. This departs from the notes precedent, which accepts a title made only of spaces. That's an omission in tutorial code, not a documented rule.* | AC-2.2a, AC-2.2b, AC-2.2c |
| A3 | A description can be at most 10,000 characters. *Source: Precedent. This is the notes body limit in docs/FIRESTORE-SCHEMA.md.* | AC-2.3a |
| A4 | The description is plain text: anything that looks like markup or formatting is shown exactly as typed. Line breaks the user types are kept and shown. *Source: Decision. This departs from the notes precedent, whose list doesn't keep line breaks. That's an omission, not a documented rule.* | AC-2.3b, AC-2.3c |
| A5 | A due date is a single moment, entered and shown as a date and time to the minute, in the timezone of the device displaying it. *Source: Resolved R3 for date and time. Minute precision is Precedent: the project's `formatDatetime` helper (frontend/src/lib/utils.ts) shows hours and minutes. Showing it in the viewer's timezone is a Decision. The project has no timezone rule, and its date helpers format in the timezone of wherever the code runs, which for server-rendered pages is the server's, so they don't provide this behaviour by themselves.* | AC-2.4, AC-2.5 |
| A6 | There is no latest allowed due date: any due date and time up to and including 23:59 UTC on 31 December 9999, the last minute with a four-digit year, is accepted. *Source: Decision.* | AC-2.6d |
| A7 | A user can have more than one task with the same title. *Source: Decision. No collection in the project requires unique values, but that's silence, not a precedent.* | AC-2.7 |
| A8 | Each list item shows the task's title, full description (if it has one) and due date and time, as well as its checkbox. A separate detail view for a task is out of scope (§9), so the edit view is the only other place a single task is shown. *Source: Precedent. The notes list shows each note's title and body in full (docs/GUIDE.md). The project also has an unused truncate helper and supports detail pages (/new-page skill), so this is a choice, not a rule.* | AC-4.3, AC-7.1, §9 |
| A9 | Tasks are listed by due date and time, soonest first. Tasks with the same due date and time are listed by creation time, oldest first. *Source: Decision; the notes list sets no order. There's no rule for tasks without a due date, because R2 makes the due date required.* | AC-4.4 |
| A10 | Completed tasks appear in the same list as pending ones, in the same order. *Source: Ticket, for visibility: completed tasks must be in the list so their checkbox can be unticked. Mixing them in rather than grouping them separately is a Decision; grouping would also meet the ticket.* | AC-4.4 |
| A11 | Overdue tasks are not marked; marking them is out of scope (§9). *Source: Ticket, which doesn't mention it. Marking would be a new feature.* | §9 |
| A12 | The list shows at most 20 tasks per page, and the user can move between pages. *Source: Precedent. `paginationSchema` (frontend/src/lib/validations/common.ts, listed in CLAUDE.md "Codebase Map") defaults to 20 per page, with a maximum of 100. The notes list doesn't page, but it's tutorial code with no stated reason, so the documented building block takes priority. Paging also keeps each page load to a bounded number of reads on the free Firebase plan.* | AC-4.7a, AC-4.7b |
| A13 | The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar. *Source: Precedent. docs/GUIDE.md step 4, the /new-page skill checklist, and the notes feature (/notes plus a sidebar link).* | AC-4.8 |
| A14 | List updates must appear within 3 seconds of the user's action (clicking save, confirming a delete, or clicking a checkbox), measured on the test environment's connection with no network throttling. *Source: Decision. The project sets no performance targets.* | AC-4.11a, AC-4.11b |
| A15 | The list updates live: the user's own changes, and changes they make in another tab or on another device, appear without a reload. *Source: Precedent. The notes list updates live (docs/GUIDE.md, docs/ARCHITECTURE.md). The project doesn't require it: the /new-feature and /firebase-collection skills ask whether each feature needs realtime updates.* | AC-4.11a, AC-4.11b |
| A16 | Status changes only through a toggle. An edit that would change the status is refused. *Source: Resolved R5 for completing a task: it stays pending until the user ticks it. For un-completing, a Decision kept consistent with R5; the ticket names the checkbox for both directions.* | AC-5.3 |
| A17 | A completed task can be edited in the same way as a pending one. *Source: Ticket, which places no restriction on editing.* | AC-5.4 |
| A18 | When two edits to the same task overlap, the one the server receives last sets every field it changed, and a field changed only by the other edit keeps that edit's value. No conflict warning is shown. *Source: Decision. Conflict detection would be a new feature; merging field by field matches A28.* | AC-5.5 |
| A19 | No completion time is recorded or shown; that is out of scope (§9). *Source: Ticket, which doesn't mention it. It would be a new feature.* | §9 |
| A20 | Deleting a task needs an in-page confirmation step, because a deleted task can't be restored and is erased for good after 30 days (R6). Revisit this when the planned restore feature arrives. *Source: Decision, with its premise confirmed by Resolved R6. The project has no confirmation pattern to reuse, and docs/DESIGN.md "Notifications" rules out the browser's built-in confirm dialog and modal toasts, so this needs a new in-page pattern.* | AC-7.5 |
| A21 | Automatic erasure happens within 24 hours after a deleted task's 30 days end: a record is erased no earlier than 720 hours and no later than 744 hours after its deletion time. *Source: Decision. R6 sets the 30 days but not how soon after they end. 24 hours allows the erasure to run once a day.* | AC-7.7 |
| A22 | A successful delete shows a success message. *Source: Decision. The project's only success-message precedent is for create (the notes form and docs/DESIGN.md "Forms"), and nothing in the app deletes yet.* | AC-8.2b |
| A23 | The narrowest supported screen width is 320px and the widest is 1920px. *Source: Rule for the breakpoints between them (docs/DESIGN.md "Responsive breakpoints", mobile-first). The two endpoints are a Decision: 320px is a conservative minimum phone width, and 1920px a common desktop width. docs/DESIGN.md "Spacing" suggests a 1280px page width, but the app's layout (frontend/src/components/layout/DashboardShell.tsx) doesn't cap content width, so the widest width needs its own check.* | AC-8.3 |
| A24 | The accessibility standard is the rules in docs/DESIGN.md "Accessibility". No external standard is required. *Source: Rule. docs/DESIGN.md "Accessibility"; no external standard is named anywhere in the project.* | AC-8.4c |
| A25 | Everything listed in section 9 is out of scope. *Source: Ticket, which mentions none of them. Viewing and restoring deleted tasks are out of scope by Resolved R6, and planned as a later feature.* | §9 |
| A26 | A due date is in the past if it is earlier than the start of the current minute, by the server's clock when the save is received. For example, at 10:30:45 a due time of 10:30 is accepted and 10:29 is refused. *Source: Decision. R4 doesn't say which clock decides or how precisely. The server's clock is used because a device's clock can be wrong or changed, following the project Rule "Never trust the browser" (docs/GUIDE.md).* | AC-2.6a, AC-2.6b, AC-2.6c |
| A27 | A character is one Unicode code point: 👍 counts as 1, the flag 🇦🇺 as 2, and each line break as 1. *Source: Decision. The notes precedent's limits count UTF-16 code units, where 👍 counts as 2; code points are closer to what a person types.* | AC-2.2a, AC-2.3a |
| A28 | An edit changes only the fields the user changed, and a toggle changes only the status. *Source: Decision. It's what an edit and a toggle mean, but the ticket doesn't state it.* | AC-5.2, AC-6.4 |
| A29 | The interface never shows an unsaved change as saved: once an action has failed, what the user sees matches what's stored. *Source: Decision, consistent with the notes precedent, whose list shows only stored data.* | AC-6.5, AC-8.1b |
| A30 | A deleted task can't be changed in any way. Attempts are refused, and when one comes from the interface, the message says the task no longer exists. *Source: Decision. The ticket only says deleting is soft. The notes precedent doesn't enforce this: its rules still let an owner update a deleted note.* | AC-7.4 |
| A31 | System fields are set by the app. A direct request that sets one to a value other than the one the app would set is refused. *Source: Decision. docs/SECURITY.md's field allowlist rejects unknown fields but says nothing about the values of known ones.* | AC-2.10b |
| A32 | A create request may leave the status out, and the task is created pending. *Source: Decision. R5 says every task starts pending, but not what a create request has to say.* | AC-3.2b |
| A33 | Capacity is tested at 1,000 tasks: a user who has 1,000 tasks can create another and page through all of them. This stands in for "no limit on the number of tasks", which can't be tested. *Source: Decision.* | AC-4.7c |
| A34 | Stored times are checked against a test device whose clock is synchronised to network time, with a tolerance of 5 seconds either way. *Source: Decision. Without a tolerance, a small clock difference between the device and the server would fail a correct system.* | AC-7.2, AC-8.7a, AC-8.7b |
| A35 | A successful toggle shows no success message; the checkbox change is the confirmation. *Source: Decision. The project has no precedent for toggles.* | AC-8.2c |
| A36 | An error message states the rule that was broken, including its limit where it has one. A generic message such as "Invalid title" doesn't meet this. *Source: Decision, following the notes precedent's "Title is required" (docs/GUIDE.md).* | AC-2.8 |
| A37 | Test coverage means: for each field rule, at least one accepted and one refused case, plus the values on each side of every limit (for example, 200 and 201 characters); for a hook, its loading, loaded and error results. *Source: Decision. docs/TESTING.md says what to test, not how thoroughly.* | D2a, D2b |
| A38 | Each checkbox's accessible name includes its task's title, so a screen-reader user can tell which task it completes. *Source: Decision, applying the docs/DESIGN.md "Accessibility" rule that every input has a label.* | AC-8.4b |

## Additions to confirm

These assumptions add a number, a limit, or a feature or rule that neither the ticket nor the product owner asked for. The product owner should confirm or remove each one. Removing one means revising the criteria in its "Used by" column.

**Numbers and limits**

- **A1**: a title limit of 200 characters.
- **A3**: a description limit of 10,000 characters.
- **A5**: due times to the minute, with no seconds.
- **A6**: a latest due date of 23:59 UTC on 31 December 9999.
- **A12**: 20 tasks per page.
- **A14**: list updates within 3 seconds.
- **A21**: erasure within 24 hours after the 30 days end.
- **A23**: supported screen widths of 320px to 1920px.
- **A26**: "past" judged to the minute, by the server's clock.
- **A27**: characters counted as Unicode code points, which sets what the title and description limits mean.
- **A33**: capacity tested at 1,000 tasks.
- **A34**: a 5-second tolerance when checking stored times.

**Features and rules**

- **A2**: trimming whitespace from titles, and treating a whitespace-only title as empty.
- **A4**: keeping line breaks in descriptions, and showing markup as typed.
- **A12**: paging itself.
- **A15**: live updates, including across the user's other tabs and devices.
- **A20**: a confirmation step before deleting.
- **A22**: a success message after deleting.
- **A36**: error messages that state the exact limit broken.
- **A37**: a test-coverage bar (both sides of every limit).

---

## 1. Access and ownership

- **AC-1.1** While signed out, opening the task list redirects to the sign-in page, and a direct request to read, create, edit, complete or delete a task is refused. (P2) [Ticket: "users log in"; Project: docs/ARCHITECTURE.md, protected pages redirect to sign-in]
- **AC-1.2** When users A and B both have tasks, A's task list contains none of B's tasks. (P1) [Ticket: "their own"]
- **AC-1.3** Signed in as A, a direct request to read (see Terms), edit, complete or delete one of B's tasks is refused at every point listed under P2. Afterwards, B's task is unchanged. (P1, P2, P3) [Ticket: "their own"; Project: docs/SECURITY.md, "assume the client is untrusted"]
- **AC-1.4a** Signed in as A, a direct request to create a task with B as its owner is refused. (P1, P2) [Project: docs/SECURITY.md, owner-only access; docs/TUTORIAL-WALKTHROUGH.md, creating a record as another user is refused]
- **AC-1.4b** Signed in as A, a direct request to change the owner of one of A's own tasks is refused. (P1, P2) [Project: docs/SECURITY.md, the owner field is immutable]
- **AC-1.5** Signed in as a user with the admin role, a direct request to read, edit, complete or delete another user's task is refused at every point listed under P2, exactly as for any other user (AC-1.3). (P1, P2, P3) [Resolved R1]
- **AC-1.6a** A request carrying expired credentials (see Terms) is treated as signed out: opening the task list redirects to the sign-in page, and any task action or direct request is refused. (P7) [Project: docs/SECURITY.md "Authentication": invalid or expired tokens are always refused]
- **AC-1.6b** After a user's session is revoked, opening the task list with that session redirects to the sign-in page, and in-app task actions made with it are refused. This doesn't cover sign-in tokens issued before the revocation, which stay valid until they expire (up to 1 hour, docs/SECURITY.md). (P5) [Project: docs/SECURITY.md "Authentication": every in-app action checks the session for revocation]

## 2. Task fields

These rules apply both when creating and when editing a task. AC-2.1a to AC-2.6d are the field rules (see Terms).

- **AC-2.1a** The title is required: a submission with an empty title is refused. [Resolved R2]
- **AC-2.1b** The due date is required: a submission with no due date is refused. [Resolved R2]
- **AC-2.1c** The description is optional: a submission with an empty description is accepted. [Resolved R2]
- **AC-2.2a** A title of 1 to 200 characters (see Terms) is accepted, and one of 201 characters is refused. Length is counted after leading and trailing whitespace is removed (AC-2.2c). [Resolved R2] [Assumes A1, A2, A27]
- **AC-2.2b** A title made only of whitespace counts as empty, so AC-2.1a refuses it. [Assumes A2]
- **AC-2.2c** Leading and trailing whitespace is removed from the title when it is saved, whether the title comes from the interface or a direct request. [Assumes A2]
- **AC-2.3a** A description of up to 10,000 characters (see Terms) is accepted, and one of 10,001 characters is refused. [Assumes A3, A27]
- **AC-2.3b** The description is plain text: anything in it that looks like markup or formatting, such as `<b>bold</b>` or `**bold**`, is shown exactly as typed. [Assumes A4]
- **AC-2.3c** Line breaks typed in the description are shown as line breaks. [Assumes A4]
- **AC-2.4** The due date is a date and a time, entered and shown to the minute. [Resolved R3] [Assumes A5]
- **AC-2.5** A saved due date is shown as the same moment in the timezone of whichever device displays it. On a device in the timezone it was entered in, that's the date and time the user entered. For example, 5:00 pm entered in Perth (UTC+8) shows as 5:00 pm on a device set to Perth time, and as 9:00 am on a device set to UTC. [Resolved R3] [Assumes A5]
- **AC-2.6a** A new task's due date must not be in the past (see Terms): a past one is refused, and any other is accepted, up to the limit in AC-2.6d. [Resolved R4] [Assumes A26]
- **AC-2.6b** An edit that changes a task's due date to a different date and time in the past is refused, including a change to the time alone. [Resolved R4] [Assumes A26]
- **AC-2.6c** An edit to a task whose due date has already passed is accepted when it leaves the due date unchanged, provided it meets the other field rules. [Resolved R4] [Assumes A26]
- **AC-2.6d** The latest accepted due date is 23:59 UTC on 31 December 9999; any later one is refused. [Assumes A6]

  *Example for AC-2.6a to AC-2.6c,* with the server's clock at 10:30:45 UTC on 5 March 2027: creating a task due 10:30 UTC that day is accepted, and one due 10:29 UTC is refused. For a task due 09:00 UTC on 1 March 2027, an edit to its title alone is accepted, but changing its due date to 09:00 UTC on 2 March 2027 is refused.
- **AC-2.7** A user can save a task with the same title as another of their tasks. [Assumes A7]
- **AC-2.8** When a submission breaks a field rule, each invalid field shows an error message beside or below it that states the rule broken, including the limit where the rule has one (for example, "Title must be 200 characters or fewer" or "Due date can't be in the past"). Valid fields show no error. [Project: docs/DESIGN.md, "Forms": field-level error messages] [Assumes A36]
- **AC-2.9** Every field rule is also enforced on direct requests: a direct request to create or edit a task that breaks one is refused. (P2) [Project: docs/GUIDE.md golden rule 1, "Never trust the browser"; frontend/CLAUDE.md, input is validated before any database operation; docs/SECURITY.md "Input Validation"]
- **AC-2.10a** A direct request to create or edit a task that includes any field not in the task fields (see Terms) is refused. (P2) [Project: docs/SECURITY.md "Field allowlists" and "Input Validation": unknown fields are rejected]
- **AC-2.10b** A direct request that sets a system field other than the owner (creation time, last-updated time, deletion time or schema version) to anything other than the value the app would set is refused. For example, a create request with a creation time in 1990, or with a deletion time, is refused. The owner is covered by AC-1.4a and AC-1.4b. (P2) [Assumes A31]

## 3. Create

- **AC-3.1** When a signed-in user submits valid fields, a new task appears in their task list showing the values as saved: the title without leading or trailing whitespace (AC-2.2c), and every other field exactly as entered. [Ticket]
- **AC-3.2a** Every new task starts as pending: it appears with its checkbox unticked, and its stored status is pending. (P3) [Resolved R5]
- **AC-3.2b** A direct request to create a task with the status completed is refused. One that leaves the status out creates a pending task. (P2, P3) [Resolved R5] [Assumes A32]
- **AC-3.2c** A task's status is only ever pending or completed: a direct request that sets any other value is refused. (P2) [Resolved R5]

## 4. Read

- **AC-4.1** The task list contains every non-deleted task the user owns. [Ticket]
- **AC-4.2** Each list item shows the task's title and a checkbox. The checkbox is ticked if the task is completed and unticked if it is pending. [Ticket: "the checkbox in the task list"]
- **AC-4.3** Each list item also shows the task's full description, if it has one, and its due date and time. [Resolved R2, R3] [Assumes A8]
- **AC-4.4** All tasks, pending and completed alike, are listed by due date and time, soonest first. Tasks with the same due date and time are listed by creation time, oldest first. [Assumes A9, A10]
- **AC-4.5** *Removed: AC-4.4 now covers completed tasks.*
- **AC-4.6** *Moved to section 9: marking overdue tasks is out of scope.*
- **AC-4.7a** Each page of the list shows at most 20 tasks, in the order set by AC-4.4. For example, with 21 tasks, the first page shows 20 and the second shows 1. [Assumes A12]
- **AC-4.7b** When the user has more than 20 tasks, they can move to the next and previous pages. [Assumes A12]
- **AC-4.7c** A user who has 1,000 tasks can create another and page through all of them. [Assumes A33]
- **AC-4.8** The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar. [Assumes A13]
- **AC-4.9** When the user has no non-deleted tasks, the list area shows an empty-state message (for example, "No tasks yet") and no task items. [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.10a** While tasks are loading, a loading indicator is shown. (P4) [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.10b** If tasks fail to load, an error message is shown, and the empty-state message from AC-4.9 is not. (P4) [Project: docs/DESIGN.md, "State Patterns"]
- **AC-4.11a** After a successful create, edit, toggle or delete, within 3 seconds of the user's action (clicking save, confirming a delete, or clicking a checkbox), the page of the list open on that screen shows exactly the tasks that belong on it after the change, without a page reload. [Assumes A14, A15]
- **AC-4.11b** Within 3 seconds of that same action, the same user's other open tabs and devices show the change in the same way, without a reload. [Assumes A14, A15]

## 5. Update

- **AC-5.1** A user can change the title, description and due date of their own task, within the field rules in section 2. [Ticket]
- **AC-5.2** After an edit is saved, each of the task's title, description, due date and status that the user didn't change has the same value as before the edit. [Assumes A28]
- **AC-5.3** A task's status changes only through a toggle (see Terms). An edit that would change the status is refused, whether it comes from the interface or a direct request. (P2) [Resolved R5] [Assumes A16]
- **AC-5.4** A completed task can be edited in the same way as a pending one. [Assumes A17]
- **AC-5.5** When two edits to the same task overlap (for example, from two tabs), the edit the server receives last sets every field it changed, and a field changed only by the other edit keeps that edit's value. No conflict warning is shown. [Assumes A18]

## 6. Mark complete

- **AC-6.1** Ticking the checkbox of a pending task changes its status to completed. [Ticket]
- **AC-6.2** Unticking the checkbox of a completed task changes its status to pending. [Ticket]
- **AC-6.3** After a successful toggle, the new status is still shown after the user reloads the page, and after they sign out and back in. [Ticket]
- **AC-6.4** After a toggle, the task's title, description and due date are the same as before. [Assumes A28]
- **AC-6.5** When a toggle fails, from the moment the error message (AC-8.1a) appears, the checkbox shows the task's stored status, which is the status it had before the toggle. (P4) [Assumes A29]
- **AC-6.6** *Moved to section 9: recording or showing a completion time is out of scope.*
- **AC-6.7** A task whose due date has passed can still be ticked and unticked; AC-2.6a to AC-2.6d only limit changing the due date. [Resolved R4]

## 7. Delete

- **AC-7.1** After a user deletes their own task, it isn't in their task list, no single-task view shows it (the edit view is the only one, A8), and a direct request by the owner to read it (see Terms) is refused. (P2) [Ticket] [Assumes A8]
- **AC-7.2** After deletion, and until it is erased (AC-7.7), the stored record still exists with the same title, description, due date, status, owner and creation time it had before deletion, plus a deletion time (the ticket's `deletedAt`) within 5 seconds of when the user confirmed the delete, by a clock synchronised to network time. (P3, P8) [Ticket] [Resolved R6] [Assumes A34]
- **AC-7.3** No user, including the task's owner and admins, can permanently erase a task, whether from the interface or by direct request. The attempt is refused and the stored record still exists afterwards. The only way a task record is erased is the automatic erasure in AC-7.7. (P1, P2, P3) [Ticket: "not a hard delete"; Project: docs/SECURITY.md, "Soft-delete only"; Resolved R1, R6]
- **AC-7.4** Attempts to edit, complete or delete a deleted task are refused, both from an outdated screen, such as a second tab still showing the task, and by direct request. Afterwards the stored record, including its deletion time, is unchanged. When the attempt comes from the interface, the error message says the task no longer exists. (P2, P3) [Assumes A30]
- **AC-7.5** Deleting a task requires the user to confirm. If they cancel, the task is unchanged and stays in the list. [Assumes A20]
- **AC-7.6** No one, including the owner and admins, can restore a deleted task: a request that would clear its deletion time, from the interface or by direct request, is refused. (P1, P2, P3) [Resolved R1, R6]
- **AC-7.7** A deleted task's record still exists until 30 days (720 hours) after its deletion time, and has been erased automatically by 24 hours after that (744 hours after its deletion time). No user action is needed. (P3, P6) [Resolved R6] [Assumes A21]
- **AC-7.8** The automatic erasure never changes or erases a task that isn't deleted, however old it is. (P3, P6) [Resolved R6]
- **AC-7.9** A user can delete any of their own non-deleted tasks from the task list. [Ticket]

## 8. All actions

- **AC-8.1a** When a create, edit, toggle or delete fails, an error message is shown and no success message is shown. (P4) [Project: docs/DESIGN.md, "Forms" and "Notifications"; frontend/CLAUDE.md, every action reports success or failure]
- **AC-8.1b** When a create, edit or delete fails, from the moment the error message appears, the task list matches the stored tasks: a failed create adds no item, a failed edit leaves the old values, and a failed delete removes no item. (P4) [Assumes A29]
- **AC-8.2a** When a create or an edit succeeds, a success message is shown. [Project: docs/DESIGN.md, "Forms"]
- **AC-8.2b** When a delete succeeds, a success message is shown. [Assumes A22]
- **AC-8.2c** When a toggle succeeds, no success message is shown; the checkbox change is the confirmation. [Assumes A35]
- **AC-8.3** At 320px and 1920px wide, and at each layout breakpoint in docs/DESIGN.md between them (640, 768, 1024 and 1280px), every action in sections 3–7 can be completed without scrolling the page sideways. [Project: docs/DESIGN.md, mobile-first layout] [Assumes A23]
- **AC-8.4a** Every action in sections 3–7 can be completed using only the keyboard. [Project: docs/DESIGN.md, "Accessibility"]
- **AC-8.4b** Each task's checkbox has an accessible name that includes the task's title. [Project: docs/DESIGN.md, "Accessibility": every input has a label] [Assumes A38]
- **AC-8.4c** The feature meets every rule in docs/DESIGN.md "Accessibility": semantic elements, visible keyboard focus, no clickable elements that aren't buttons or links, alt text on images, a label on every input, and an accessible name on every icon-only button. [Project: docs/DESIGN.md, "Accessibility"] [Assumes A24]
- **AC-8.5** Error messages shown in the interface, and error responses from the app's own server code, contain none of the following: stack traces; file, directory or database paths; error text or codes produced by the database or a library; server names or addresses. The database's own standard permission-denied response to a direct request is allowed. (P2, P4) [Project: docs/SECURITY.md "Error Handling"; backend/CLAUDE.md "Error Handling"]
- **AC-8.6** Every stored task record carries a schema version, set to 1 when the task is created, so that later changes to the task's shape can migrate old records. (P3) [Project: docs/FIRESTORE-SCHEMA.md "Schema versioning": every document must include it]
- **AC-8.7a** Every stored task record holds its creation time, within 5 seconds of when the user saved the new task, by a clock synchronised to network time. It never changes afterwards. (P3, P8) [Project: the /firebase-collection and /new-feature skill templates, and every collection in docs/FIRESTORE-SCHEMA.md] [Assumes A34]
- **AC-8.7b** Every stored task record holds its last-updated time. After each successful create, edit, toggle and delete, it is within 5 seconds of the user's action, by a clock synchronised to network time. (P3, P8) [Project: the /firebase-collection and /new-feature skill templates, and every collection in docs/FIRESTORE-SCHEMA.md] [Assumes A34]

## 9. Scope

Out of scope for this ticket: search or filtering; priorities, tags or categories; reminders or notifications as a due date approaches; marking overdue tasks; recording or showing when a task was completed; a separate page or view for a single task's details; recurring tasks; subtasks; sharing tasks with other users; completing or deleting several tasks at once; and viewing deleted tasks (one at a time or as a list) or restoring them, which is planned as a later feature. [Resolved R6] [Assumes A8, A11, A19, A25]

## Delivery requirements

Checked by review before the change is merged.

- **D1** The tasks collection is documented in docs/FIRESTORE-SCHEMA.md: each field, its type and limits, who can access it, and the 30-day retention and automatic erasure of deleted tasks. [Project: CLAUDE.md "Firestore": every collection is documented; docs/GUIDE.md golden rule 3] [Resolved R6]
- **D2a** Automated unit tests cover every field rule: for each, at least one accepted and one refused case, plus the values on each side of every limit (for example, 200 and 201 characters). [Project: docs/TESTING.md "What to Test"] [Assumes A37]
- **D2b** Every hook that loads tasks has unit tests covering its loading, loaded and error results. [Project: docs/TESTING.md "What to Test"] [Assumes A37]
- **D2c** Any backend endpoint added for tasks has at least a success test and a test that it refuses a request without credentials. [Project: docs/TESTING.md "What to Test"]
- **D3** *Removed: branch protection already requires CI to pass on every PR (docs/GIT-WORKFLOW.md).*
- **D4** docs/SECURITY.md and docs/FIRESTORE-SCHEMA.md record the automatic 30-day erasure of deleted tasks as a justified exception to "Soft-delete only", citing R6. [Project: .claude/agents/security-reviewer.md, "no hard deletes unless explicitly justified"] [Resolved R6]
- **D5** The automatic erasure needs no paid plan or billing account from Firebase or any other service. See "Conflicts with the ticket and project rules", item 2. [Project: CLAUDE.md, "no paid Firebase plan required"; README.md, "free-tier only"] [Resolved R6]

---

## Ticket coverage

| Ticket says | Covered by |
|---|---|
| Users log in (product context) | AC-1.1, AC-1.6a, AC-1.6b |
| Create, read, update, delete **their own** tasks | §1, §3, §4, §5, §7 |
| Each with a title, description and due date | §2 |
| Deleting is a soft delete (`deletedAt`), not a hard delete | AC-7.1 – AC-7.4, AC-7.9; refined by R6 in AC-7.6 – AC-7.8 |
| Checkbox in the task list toggles between pending and completed | §6, AC-4.2 |

## What was cut and why

Features left out of this ticket are listed in section 9. This section records content removed from the spec itself while it was refined, and why.

| What was cut | Why | Where it is now |
|---|---|---|
| 23 of the 29 open questions raised when the criteria were made testable | On instruction, only the six questions that needed the product owner were kept. The rest became decisions, so every criterion could be tested. | Assumptions A1–A25. The six kept questions are R1–R6. |
| Wording with no agreed pass/fail result, such as "never", "anywhere", "works", "phone-sized" and "looks like a success". This included "the checkbox never shows a status that hasn't been saved", which contradicted its own criterion. | Two testers couldn't agree on a result. | Rewritten as pass/fail checks, for example AC-6.5, AC-7.1 and AC-8.3. |
| The WCAG reference in A23 | It contradicted A24, which requires no external accessibility standard. | A23 now gives its own reason for 320px. |
| "No paging" (the earlier A12) | It contradicted the project's `paginationSchema` building block. | Paging at 20 per page: A12, AC-4.7a and AC-4.7b. |
| Rules for date-only due dates (A5, AC-2.5) | R3: the due date is a date and time. | Removed. |
| The ordering rule for tasks without a due date (A9, AC-4.4) | R2: the due date is required. | Removed. |
| Keeping deleted tasks indefinitely (the earlier A21) | R6: deleted tasks are erased automatically after 30 days. | AC-7.7, with the erasure window in A21. |
| "Restoring stays out of scope unless AC-7.6 brings it in" (A20, A25, section 9) | R6 settled it: restoring is out of scope and planned as a later feature. | Section 9. |
| AC-4.5: completed tasks appear in the same list, in the same order | Already implied by AC-4.1 and AC-4.4. | AC-4.4. |
| AC-4.6 (no overdue marking) and AC-6.6 (no completion time shown) | They stated the absence of features nobody asked for, which is scope, not behaviour. | Section 9 (A11, A19). |
| "There is no separate detail view" (AC-4.3) | A design restriction that no user outcome depends on. | Section 9 (A8). |
| "There is no limit on the number of tasks a user can have" (AC-4.7) | It can't be tested. | A 1,000-task capacity check: AC-4.7c, A33. |
| "The edit view has no status control" (AC-5.3) | It described the design. The rule it served, that an edit can't change status, stays. | AC-5.3. |
| AC-4.1's "and nothing else" | It repeated two other checks. | AC-1.2 (other users' tasks) and AC-7.1 (deleted tasks). |
| AC-1.5's "their task list contains only their own tasks" | It repeated another check. | AC-1.2. |
| AC-3.1's "it doesn't appear in any other user's list" | It repeated another check. | AC-1.2. |
| AC-5.1's "the list shows the new values" | It repeated another check. | AC-4.11a. |
| AC-5.4's "stays completed after the edit" | It repeated another check. | AC-5.2. |
| The viewing part of AC-7.6 | It repeated other checks. | AC-1.3, AC-1.5 and AC-7.1. AC-7.6 now covers restoring only. |
| D3: CI must pass before merge | Branch protection already requires it on every PR (docs/GIT-WORKFLOW.md). | Enforced by the repository, not this spec. |
| Source claims the project doesn't support: AC-4.11 citing live lists as a project rule, AC-6.5 citing another criterion as its project source, and the [Ticket] tags on AC-5.2, AC-6.4 and AC-7.4 | Each overstated where the requirement came from. | Relabelled: AC-4.11a and AC-4.11b cite A14 and A15; AC-5.2, AC-6.4, AC-6.5 and AC-7.4 cite decisions A28 to A30. |

## Sign-off

Approved at Gate 1 by Sajad Ali Akbari (product owner), [date]
