# Task CRUD: Acceptance Criteria

## Source ticket

> A user can create, read, update and delete their own tasks, each with a title, description and due date. Deleting is a soft delete (`deletedAt`), not a hard delete. A user can mark a task complete: the checkbox in the task list toggles it between pending and completed.

Product context: the Simple Task Dashboard is a small web app where users log in and manage their own to-do tasks.

## What the ticket states

1. Users log in to the app (product context).
2. Users manage **their own** tasks (product context).
3. A user can **read** (see) their own tasks.
4. A user can **update** (edit) their own tasks.
5. A user can **delete** their own tasks, and deleting sets `deletedAt` instead of removing the document.
6. A user can **toggle** a task between **pending** and **completed** with the checkbox in the task list.

Every criterion below traces back to the source ticket, to one of these facts, to a product decision (D), to a project convention (C), or to a stated assumption (A).

## Product decisions

These were confirmed by the product owner and are no longer open.

| ID | Decision |
|----|----------|
| D1 | Tasks are created through a **Server Action**. No backend (Express) route is added. |
| D2 | The title is **required**. |
| D3 | The description is **optional**. |
| D4 | The due date is **optional**. |
| D5 | The due date is a **date only** (no time). |
| D6 | Due dates in the **past are allowed**. |
| D7 | A new task starts with status **`pending`**. |
| D8 | Tasks are created from an **[+ Add Task]** control at the **bottom of the task list on the dashboard** (`/dashboard`). There is no separate `/tasks` page. |
| D9 | A user can read, update and delete **only their own** tasks. |
| D10 | Deleting a task is a **soft delete**: the Server Action sets `deletedAt`, and the document is never removed. |
| D11 | Marking a task complete is **in scope**. Each task in the list has a **checkbox** that toggles its status between `pending` (unchecked) and `completed` (checked), in both directions. |

## Project conventions this spec follows

These come from the repository's `CLAUDE.md` files and `docs/`. They are requirements, not choices.

| ID | Convention | Source |
|----|------------|--------|
| C1 | Every Server Action calls `requireAuth()` first, validates its input with Zod `safeParse`, returns `ActionResult<T>` (`{ success, error?, data? }`) and never throws. | `frontend/CLAUDE.md` → Server Actions |
| C2 | Signed-out users are redirected to `/auth/signin`: by `proxy.ts` for page requests (with `?redirect=<path>`), and by `requireAuth()` inside Server Actions. | `ARCHITECTURE.md`, `SECURITY.md` |
| C3 | A new collection is added in four places: a TypeScript type (with `_schemaVersion: 1`), a typed collection export in `lib/firebase/firestore.ts`, security rules, and an entry in `docs/FIRESTORE-SCHEMA.md`. | `GUIDE.md` golden rule 3, root `CLAUDE.md` |
| C4 | Every document stores `uid` (the owner, taken from the session, never from client input), `createdAt` and `updatedAt` (`Timestamp`), and `_schemaVersion: 1`. | `FIRESTORE-SCHEMA.md`, `GUIDE.md` Step 2 |
| C5 | Security rules: owner-only reads guarded by `notDeleted()`, a `hasOnly` field allowlist, `uid` is immutable, and `delete: if false` (soft-delete only: set `deletedAt: Timestamp` instead of deleting). | `SECURITY.md` → Firestore Security Rules, root `CLAUDE.md` → Firestore |
| C6 | Forms use react-hook-form + Zod. Each error is shown under its field. The submit button is `disabled` while `isSubmitting`. Values are only cleared after a successful submit. | `DESIGN.md` → Forms |
| C7 | All user feedback uses `sonner` toasts. Never `alert()`, `confirm()` or custom modal toasts. | `DESIGN.md` → Notifications |
| C8 | Any component that loads data handles the loading (`LoadingSpinner`), empty (`EmptyState`) and error (inline `text-red-600` message) states. Lists update live through `useCollection()`. | `DESIGN.md` → State Patterns, `ARCHITECTURE.md` |
| C9 | Accessibility: every input has a `<label htmlFor>`, everything is keyboard-operable with visible `focus-visible` styles, only semantic `<button>`s are used, icon-only buttons have an `aria-label`, and errors use `aria-invalid`, `aria-describedby` and `role="alert"`. | `DESIGN.md` → Accessibility, `TUTORIAL-WALKTHROUGH.md` Change 5 |
| C10 | Dates are displayed with `formatDate()` from `@/lib/utils` (`en-AU`, for example "5 Mar 2027"). | root `CLAUDE.md` Codebase Map |
| C11 | Zod schemas, hooks and utilities always get Vitest unit tests. Components are tested with Testing Library + `user-event`. Firebase is always mocked. `app/` page files are not unit-tested. | `TESTING.md` |
| C12 | Feature code lives in `frontend/src/features/tasks/`, does not import from other features, and uses the `@/` alias. | `FRONTEND.md`, `frontend/CLAUDE.md` |
| C13 | Adding a core export (such as a collection accessor) updates the Codebase Map in the root `CLAUDE.md` in the same change. | root `CLAUDE.md` → Harness integrity |
| C14 | Work happens on a `feature/*` branch with Conventional Commits. Typecheck, lint, tests and build must pass. Deploying Firestore rules needs explicit approval. | root `CLAUDE.md`, `GIT-WORKFLOW.md` |
| C15 | Destructive actions use the destructive (`bg-red-600`) button style. | `DESIGN.md` → Buttons |
| C16 | Status badges use the `DESIGN.md` pill styles: **Pending** uses the Warning (yellow) style and **Completed** uses the Success (green) style. | `DESIGN.md` → Badges / Pills |

## Data model: `tasks` collection

**Path:** `/tasks/{taskId}` · **Access:** owner-only (C5, D9)

| Field | Type | Required | Rule | Can change after create? |
|-------|------|----------|------|--------------------------|
| `uid` | `string` | Yes | Owner's Firebase Auth UID, set from the session (C4). | No |
| `title` | `string` | Yes | Trimmed, 1–100 characters, single line (D2, A7). | Yes, by `updateTask` |
| `description` | `string` | Yes | Trimmed, 0–2,000 characters. Stored as `''` when left empty (D3, A9). | Yes, by `updateTask` |
| `dueDate` | `string \| null` | Yes | Calendar date `YYYY-MM-DD`, or `null` when not set (D4, D5, A12). | Yes, by `updateTask` |
| `status` | `'pending' \| 'completed'` | Yes | Always `'pending'` on create, set by the server (D7). Changed only by `setTaskStatus`, never by `updateTask` (D11, A28). | Yes, by `setTaskStatus` |
| `createdAt` | `Timestamp` | Yes | Set by the server (C4). | No |
| `updatedAt` | `Timestamp` | Yes | Equal to `createdAt` on create. Set to the server time on every update, every status change and on delete (C4). | Yes, by the server |
| `deletedAt` | `Timestamp \| null` | Yes | `null` on create. Set once to the server time by `deleteTask` and never set back to `null` (C5, D10, A35). | Once, `null` → `Timestamp` |
| `_schemaVersion` | `1` | Yes | C3, C4, A39. | No |

A task is **active** while `deletedAt` is `null` and **deleted** once it holds a `Timestamp`. Deleted tasks stay in Firestore but are never shown, edited, toggled or deleted again (AC15, AC17). "Active" is about deletion only: a completed task that has not been deleted is still active.

There is no `completedAt` field. When a task was completed is not tracked (A40).

Optional fields are stored as present-but-empty (`''` / `null`) rather than being left out. This matches `UserProfile` (`displayName: string | null`) and keeps the `hasAll` / `hasOnly` rule allowlist exact. For `deletedAt` it also lets the list query filter on `deletedAt == null` (see [Security rules](#security-rules)): Firestore cannot query for a missing field.

`dueDate` is a string rather than a `Timestamp` because Firestore has no date-only type. A `Timestamp` would move the date across midnight for users in other time zones. `docs/FIRESTORE-SCHEMA.md` must record this as a deliberate exception to the `Timestamp` convention.

## Security rules

```
match /tasks/{taskId} {
  allow read: if isAuthenticated() && isOwner(resource.data.uid) && notDeleted();
  allow create, update, delete: if false;  // all writes go through Server Actions (Admin SDK); soft-delete only
}
```

- **Read** is allowed only to the signed-in owner of a task that has not been deleted. `notDeleted()` is what hides soft-deleted tasks: once a task has a `deletedAt` value, even its owner can no longer read it through the client SDK (AC11).
- **Create, update and delete stay denied** for every client-SDK request, including the owner's. Every write goes through a Server Action that uses the Admin SDK: `createTask`, `updateTask`, `setTaskStatus` and `deleteTask` (A24). No client ever needs to write directly, so no write rule is opened. Allowing client writes would let a client skip the Server Action's validation, write any `title`, clear `deletedAt` to restore a task, or write a `status` other than `pending` or `completed`.
- **Because the Admin SDK bypasses rules**, the ownership and not-deleted checks the rules would normally make must be made inside `updateTask`, `setTaskStatus` and `deleteTask` (AC17). This is the most security-critical part of the feature.
- **Rules are not filters.** A client query is denied as a whole if any document it could return fails the read rule. The list query must therefore filter on both `uid == user.uid` and `deletedAt == null`, so Firestore can prove every result passes `isOwner()` and `notDeleted()`. Both are equality filters, so no composite index is needed.

## Assumptions

The ticket, the decisions and the conventions do not cover the points below. A reviewer should correct any that are wrong.

| ID | Assumption | Used by |
|----|------------|---------|
| A2 | After a successful create, the form closes and the success toast reads "Task created". | AC1 |
| A3 | The list is sorted by due date, earliest first. Tasks with the same due date are sorted by `createdAt`, oldest first. Tasks with no due date come last, also sorted by `createdAt`. Sorting happens in the client, because a Firestore `orderBy('dueDate')` would put `null` values first. Editing a task's due date moves it to its new position. | AC1, AC6, AC11, AC12 |
| A7 | Leading and trailing whitespace is trimmed from the title. After trimming, the title is 1–100 characters. A title made only of whitespace counts as empty. Any Unicode is allowed, including emoji. Line breaks are not allowed. | AC4, AC13 |
| A8 | Duplicate titles are allowed. | AC4, AC13 |
| A9 | The description is plain text, at most 2,000 characters after trimming. Line breaks inside it are kept and shown. A description made only of whitespace is stored as `''`. No Markdown or rich text. | AC5, AC13 |
| A10 | All user text is rendered as React text nodes, which escapes it. `dangerouslySetInnerHTML` is never used for task fields. | AC4, AC5, AC11 |
| A12 | The due date is entered with the browser's native `<input type="date">`, which produces `YYYY-MM-DD`. It is stored exactly as entered and shown as the same calendar date in every time zone. | AC6, AC13 |
| A13 | The latest allowed due date is 31 Dec 2099. There is no earliest limit (D6). | AC6, AC13 |
| A15 | Browser-side validation errors are shown under the field they belong to (C6). If server-side validation fails, the Server Action's first error message is shown as an error toast (C1, C7). | AC4–AC7, AC13 |
| A17 | When a save fails (create or update), the error toast reads "Task could not be saved. Please try again." | AC8, AC14 |
| A19 | There is no limit on the number of tasks per user. | AC1 |
| A20 | **Cancel** closes the form, throws away what was entered and saves nothing, with no confirmation prompt (C7 forbids `confirm()`). This applies to the create form and the edit form. | AC9, AC14 |
| A21 | The accessibility target is WCAG 2.1 level AA. | Non-functional |
| A22 | Under normal load, a created, edited, toggled or deleted task is shown in its new state in the list within 2 seconds of clicking **Create**, **Save**, the checkbox or the confirming **Delete**. The checkbox itself changes at once (A42). | Non-functional |
| A23 | The only task fields in scope are title, description, due date and status (`pending` or `completed`, changed with the checkbox as in D11 and A28). | Out of scope |
| A24 | All task writes (create, update, status change and delete) go through Server Actions, following D1. They use the Admin SDK and so bypass security rules. Rules deny every client-SDK create, update and delete on `tasks`, so the Server Actions' validation and ownership checks cannot be bypassed. This is stricter than the `notes` template, which allows owner creates and updates. | AC2, AC7, AC17 |
| A25 | When the user has no active tasks, the `EmptyState` ("No tasks yet") is shown with the [+ Add Task] control below it. This includes a user whose tasks have all been deleted. | AC1, AC10, AC15 |
| A26 | Opening the create form moves keyboard focus to the title field. Closing it (Create or Cancel) returns focus to the [+ Add Task] control. | AC9, Non-functional |
| A27 | Character limits count JavaScript string length (UTF-16 code units, the same count Zod's `.max()` uses). Some emoji therefore count as 2 characters. | AC4, AC5 |
| A28 | The edit form (`updateTask`) covers title, description and due date only. Status is changed only by the checkbox, through its own Server Action `setTaskStatus` (D11). `updateTask` rejects a `status` key like any other extra key, and saving an edit never changes a task's status. The only statuses are `pending` and `completed`. | AC12, AC13, AC18 |
| A29 | Reading means the task list on `/dashboard`. There is no separate task detail page (consistent with D8). The list shows each task's full description. | AC11 |
| A30 | Each task in the list has a status checkbox at the start of the row, then an **Edit** button and a **Delete** button. Icon-only buttons have the `aria-label` "Edit task: {title}" and "Delete task: {title}" (C9). | AC12, AC15, AC18 |
| A31 | **Edit** replaces that task's row with the same form used for create, pre-filled with the task's current values, with **Save** and **Cancel** buttons. Opening it moves focus to the title field. Closing it (Save or Cancel) returns focus to that task's **Edit** button. Only one form (create or edit) is open at a time: while one is open, [+ Add Task] and every other task's **Edit** button are disabled. | AC12, AC14 |
| A32 | A successful update shows the toast "Task updated". Saving with no changes is allowed: it rewrites the same values and sets a new `updatedAt`. | AC12 |
| A33 | Concurrent edits (for example in two tabs) are last-write-wins. There is no conflict warning. | AC12 |
| A34 | **Delete** asks for confirmation inline, in the task's row: the text "Delete this task?" with a destructive **Delete** button (C15) and a **Keep** button. No `confirm()` and no modal (C7). Focus moves to **Keep**, so pressing Enter by mistake does not delete. **Keep** or Escape closes the confirmation and returns focus to the task's **Delete** button. | AC16 |
| A35 | A successful delete shows the toast "Task deleted". There is no undo, restore or trash view, and deleted tasks are kept in Firestore indefinitely (no purge). | AC15, Out of scope |
| A36 | A failed delete shows the toast "Task could not be deleted. Please try again." and the task stays in the list. | AC16 |
| A37 | `updateTask`, `setTaskStatus` and `deleteTask` return the same result, `{ success: false, error: 'Task not found.' }`, when the task ID is invalid, the task does not exist, it belongs to another user, or it is already deleted. Using one message means a caller cannot learn whether another user's task exists. The UI shows it as an error toast and closes the form or confirmation (or reverts the checkbox), since the live list already no longer shows the task. | AC17, AC19 |
| A38 | After a delete, focus moves to the next task's **Edit** button, or the previous task's if it was the last one, or to [+ Add Task] if no tasks are left. | AC15, Non-functional |
| A39 | This spec assumes no `tasks` documents exist yet, so `deletedAt` and the `'completed'` status are part of `_schemaVersion: 1`. If any have already been created, adding `deletedAt` and the `'completed'` status must go through `/evolve-schema` as version 2 instead. | Data model |
| A40 | There is no `completedAt` field and no completion history. Only the current status is stored. | Data model, Out of scope |
| A41 | The checkbox is a native `<input type="checkbox">` with a visually hidden (`sr-only`) `<label htmlFor>` reading "Mark “{title}” as completed". Checked means `completed`, unchecked means `pending`. It is operated with a click or the Space key (C9). | AC18, Non-functional |
| A42 | Toggling is optimistic: the checkbox, badge and title style change as soon as it is clicked, and the checkbox is disabled until `setTaskStatus` responds. There is no success toast, because the changed checkbox and badge are the feedback. If the save fails, the checkbox, badge and title style go back to the stored status and the toast "Task could not be updated. Please try again." is shown. | AC18, AC19 |
| A43 | Completed tasks stay in the list, in the same position A3 gives them (completing a task does not move it). They show the **Completed** badge (C16) and their title with a line through it in muted text (`line-through text-zinc-500`). There is no filter to hide completed tasks. | AC11, AC18 |
| A44 | `setTaskStatus` takes the **target** status (`'pending'` or `'completed'`), not a "flip" instruction. A repeated or stale request therefore cannot flip a task back by mistake. If the task already has the target status, it returns success and writes nothing. | AC18, AC19 |
| A45 | Completed tasks can still be edited and deleted, and can be toggled back to pending. While a task's row shows the edit form, it has no checkbox. While it shows the delete confirmation, its checkbox is disabled. | AC12, AC15, AC18 |

## Acceptance criteria

AC1–AC10 cover create and the shared list states. AC11 covers read, AC12–AC14 update, AC15–AC16 delete, AC17 ownership for every change to an existing task, and AC18–AC19 marking a task complete.

### AC1: A logged-in user can create a task

- **Given** a logged-in user is on `/dashboard` and has clicked **[+ Add Task]** at the bottom of their task list (D8)
- **When** they enter a valid title (and optionally a description and a due date) and click **Create**
- **Then** `createTask` is called and it saves one `tasks` document with the fields in the [data model](#data-model-tasks-collection): trimmed title and description, `dueDate` as picked or `null`, `status: 'pending'`, `deletedAt: null`, `uid` from the session, `createdAt`/`updatedAt` and `_schemaVersion: 1` (C1, C4, D7)
- **And** the form closes, the toast "Task created" is shown, and the task appears in the list without a page reload, in the position given by A3 (A2, C7, C8)
- **And** the task shows an unchecked status checkbox, its title, its description (if any), its due date (or "No due date") and a **Pending** status badge (C16)
- **And** the task is still there after a page reload, and after signing out and back in
- **And** creating the task works however many tasks the user already has (A19).

### AC2: A task belongs only to its creator

- **Given** user X creates a task
- **Then** the task is saved with `uid` = X's UID from the session. Any `uid` sent in the input is rejected, not used (C4, AC7)
- **And** the task appears in X's list and not in any other user's list
- **And** if user Y reads X's task by its ID through the Firestore client SDK, the read is denied by security rules (`permission-denied`) (C5)
- **And** any create, update or delete on `tasks` through the Firestore client SDK is denied for every user, including the owner (A24, C5).

### AC3: A user who is not logged in cannot create, change or delete tasks

- **Given** a user is not logged in
- **When** they open `/dashboard`
- **Then** they are redirected to `/auth/signin?redirect=%2Fdashboard`, and the task list, [+ Add Task], status checkboxes, **Edit** and **Delete** controls never render (C2).

- **Given** a logged-in user has the create form open, the edit form open, or the delete confirmation showing, and their session has expired or been revoked
- **When** they click **Create**, **Save** or the confirming **Delete**
- **Then** `requireAuth()` redirects them to `/auth/signin`, nothing is created, changed or deleted, and what they entered is not kept (C1, C2).

- **Given** a logged-in user's session has expired or been revoked
- **When** they click a task's status checkbox
- **Then** `requireAuth()` redirects them to `/auth/signin` and the task's status is not changed (C1, C2).

### AC4: Title (D2)

- **Given** a logged-in user is creating a task and all other fields are valid
- **When** they submit a title of 1–100 characters after trimming, including emoji or other Unicode (A7, A27)
- **Then** the task is created with the title trimmed.

- **When** the title is empty or only whitespace
- **Then** no task is created and "Title is required." is shown under the title field.

- **When** the title is longer than 100 characters after trimming
- **Then** no task is created and "Title must be 100 characters or fewer." is shown under the title field.

- **When** the title contains a line break (possible only by pasting, or by calling the Server Action directly)
- **Then** no task is created and "Title must be a single line." is shown.

- **When** the title contains HTML such as `<b>hi</b>`
- **Then** the task is created and the title is displayed literally as `<b>hi</b>` (A10).

- **When** the title is the same as one of the user's existing tasks
- **Then** the task is created and both tasks appear in the list (A8).

### AC5: Description (D3)

- **Given** a logged-in user is creating a task and all other fields are valid
- **When** they leave the description empty or enter only whitespace
- **Then** the task is created with `description: ''` and the list shows no description.

- **When** they enter up to 2,000 characters after trimming, including line breaks
- **Then** the task is created with the description trimmed, and the line breaks are visible in the list (A9).

- **When** the description is longer than 2,000 characters after trimming
- **Then** no task is created and "Description must be 2,000 characters or fewer." is shown under the description field.

- **When** the description contains Markdown or HTML
- **Then** it is stored and displayed literally, with no formatting applied and no script run (A9, A10).

### AC6: Due date (D4, D5, D6)

- **Given** a logged-in user is creating a task and all other fields are valid
- **When** they pick a date with the date picker
- **Then** the task is created with `dueDate` set to that `YYYY-MM-DD` value, and the list shows the same calendar date formatted with `formatDate()` (for example "5 Mar 2027") (A12, C10)
- **And** a user in any time zone, including one behind UTC, sees the same calendar date they picked. The date must not shift by a day.

- **When** they leave the due date empty
- **Then** the task is created with `dueDate: null`, shows "No due date", and sorts after every task that has a due date (A3).

- **When** they pick today's date or a past date
- **Then** the task is created (D6).

- **When** they pick a date after 31 Dec 2099
- **Then** no task is created and "Due date must be on or before 31 Dec 2099." is shown under the due date field (A13).

- **When** the Server Action receives a `dueDate` that is not a real `YYYY-MM-DD` calendar date (for example `2027-02-30` or `tomorrow`)
- **Then** no task is created and it returns `{ success: false, error: 'Due date must be a valid date.' }`.

### AC7: Invalid input is rejected in the browser and by the Server Action

- **Given** a logged-in user fills in the form with one or more fields that break the rules in AC4–AC6
- **When** they click **Create**
- **Then** the Server Action is not called, no task is created, and each invalid field shows its error under the field with `aria-invalid="true"` and `role="alert"` (C6, C9)
- **And** everything the user entered stays in the form (C6).

- **Given** `createTask` is called directly (bypassing the form) with input that breaks any rule in AC4–AC6, or that contains extra keys (for example `uid`, `status`, `deletedAt` or `createdAt`)
- **When** it runs
- **Then** it returns `{ success: false, error: <message for the first rule broken> }`, writes nothing, and does not throw (C1). Extra keys are rejected by a `.strict()` schema (`SECURITY.md` → Input Validation).

- The browser and the Server Actions use **the same Zod schema**, so they apply the same rules and produce the same messages. `updateTask` uses this schema too (AC13).

### AC8: A failed save and double-clicking Create

- **Given** a logged-in user submits a valid task
- **When** the save fails: the Firestore write throws, or the call to the Server Action itself fails (for example the network is down)
- **Then** "Task created" is not shown and no task appears in the list
- **And** the toast "Task could not be saved. Please try again." is shown, the form stays open with everything entered, and clicking **Create** again retries the save (A17, C6, C7)
- **And** the Server Action catches the Firestore error and returns `{ success: false, error }` instead of throwing (C1).

- **Given** a logged-in user has filled in a valid task
- **When** they double-click **Create**
- **Then** the button is disabled from the first click until the Server Action responds, and exactly one task is created (C6).

### AC9: Cancelling a create

- **Given** a logged-in user has entered data in the create form
- **When** they click **Cancel**
- **Then** the form closes with no prompt, no task is created, focus returns to [+ Add Task], and opening the form again shows empty fields (A20, A26).

### AC10: The task list shows loading, empty and error states

- **Given** a logged-in user opens `/dashboard`
- **While** their tasks are loading, a `LoadingSpinner` is shown in the list area (C8)
- **When** they have no active tasks, the `EmptyState` "No tasks yet" is shown with [+ Add Task] below it (A25)
- **When** the subscription fails, an inline error message is shown in the list area, and the rest of the dashboard still renders (C8).

### AC11: A user sees their own active tasks (read)

- **Given** a logged-in user opens `/dashboard`
- **Then** the list shows every task where `uid` is their UID and `deletedAt` is `null`, and no other tasks: not other users' tasks, and not their own deleted tasks (D9, D10)
- **And** each task shows a status checkbox (checked when `completed`), its title, its full description (with line breaks, if any), its due date formatted with `formatDate()` (or "No due date"), a **Pending** or **Completed** status badge, and **Edit** and **Delete** buttons (A29, A30, A43, C10, C16)
- **And** completed tasks are shown in the list, not hidden, with their title struck through in muted text (A43)
- **And** the tasks are in the order given by A3
- **And** the list updates live, without a page reload, when a task is created, edited, toggled or deleted, including from another tab or device signed in as the same user (C8)
- **And** all task text is shown literally, never as HTML (A10).

- **Given** user X has a deleted task
- **When** X reads it by its ID through the Firestore client SDK
- **Then** the read is denied by security rules (`permission-denied`), even though X owns it (C5, `notDeleted()`).

### AC12: A logged-in user can edit their task (update)

- **Given** a logged-in user has an active task and clicks its **Edit** button
- **Then** that task's row is replaced by the task form, pre-filled with its current title, description and due date (an empty date field when `dueDate` is `null`), and focus moves to the title field (A31)
- **When** they change any of the three fields to valid values and click **Save**
- **Then** `updateTask(taskId, input)` is called and it updates that one document: trimmed title and description, `dueDate` as picked or `null`, and `updatedAt` set to the server time (C1, C4)
- **And** `uid`, `status`, `createdAt`, `deletedAt` and `_schemaVersion` are unchanged, and no other document is written. Editing a completed task leaves it completed (A28, A45)
- **And** the form closes, the toast "Task updated" is shown, focus returns to the task's **Edit** button, and the list shows the new values without a page reload, moved to the position given by A3 if the due date changed (A3, A31, A32, C7, C8)
- **And** the changes are still there after a page reload.

- **When** they clear a due date that was set
- **Then** the task is saved with `dueDate: null`, shows "No due date", and moves after every task that has a due date (A3).

- **When** they click **Save** without changing anything
- **Then** the save succeeds, "Task updated" is shown and only `updatedAt` changes (A32).

- **Given** the same task is being edited in two tabs
- **When** both are saved
- **Then** the last save wins, with no warning (A33).

### AC13: Edits follow the same rules as create

- **Given** a logged-in user is editing a task
- **When** they enter a title, description or due date that breaks a rule in AC4–AC6
- **Then** the same message as for create is shown under that field, `updateTask` is not called, nothing is saved, and everything they entered stays in the form (A15, C6, C9)
- **And** every value AC4–AC6 accepts for create (emoji, duplicate titles, line breaks in the description, past dates, `null` due date) is also accepted for edit.

- **Given** `updateTask` is called directly (bypassing the form) with input that breaks any rule in AC4–AC6, or that contains extra keys (for example `uid`, `status`, `deletedAt`, `createdAt` or `updatedAt`)
- **When** it runs
- **Then** it returns `{ success: false, error: <message for the first rule broken> }`, writes nothing, and does not throw. It uses the same `.strict()` schema as `createTask` (AC7, A28).

### AC14: A failed edit, double-clicking Save, and cancelling an edit

- **Given** a logged-in user saves a valid edit
- **When** the save fails: the Firestore write throws, or the call to the Server Action itself fails
- **Then** "Task updated" is not shown and the list still shows the old values
- **And** the toast "Task could not be saved. Please try again." is shown, the form stays open with everything entered, and clicking **Save** again retries (A17, C6, C7)
- **And** `updateTask` catches the Firestore error and returns `{ success: false, error }` instead of throwing (C1).

- **When** they double-click **Save**
- **Then** the button is disabled from the first click until the Server Action responds, and the document is written once (C6).

- **Given** a logged-in user has changed fields in the edit form
- **When** they click **Cancel**
- **Then** the form closes with no prompt, nothing is saved, the task shows its unchanged values, and focus returns to its **Edit** button (A20, A31)
- **And** opening **Edit** again shows the task's saved values, not the discarded ones.

### AC15: A logged-in user can delete their task (soft delete)

- **Given** a logged-in user has an active task, has clicked its **Delete** button, and the confirmation is showing (AC16)
- **When** they click the confirming **Delete**
- **Then** `deleteTask(taskId)` is called and it updates that one document: `deletedAt` and `updatedAt` are both set to the server time (D10, C5)
- **And** the document is **not** removed from Firestore, and `uid`, `title`, `description`, `dueDate`, `status`, `createdAt` and `_schemaVersion` are unchanged
- **And** the toast "Task deleted" is shown, the task disappears from the list without a page reload, and focus moves as described in A38 (A35, C7, C8)
- **And** the task does not come back after a page reload, or after signing out and back in
- **And** if it was the user's last active task, the `EmptyState` "No tasks yet" is shown (A25).

### AC16: Confirming a delete, a failed delete, and double-clicking Delete

- **Given** a logged-in user clicks a task's **Delete** button
- **Then** nothing is deleted yet. The row shows "Delete this task?" with a destructive **Delete** button and a **Keep** button, and focus moves to **Keep** (A34, C7, C15).

- **When** they click **Keep** or press Escape
- **Then** the confirmation closes, nothing is deleted, and focus returns to the task's **Delete** button (A34).

- **When** they click the confirming **Delete** and the write fails (the Firestore write throws, or the call to the Server Action itself fails)
- **Then** "Task deleted" is not shown, the task stays in the list, and the toast "Task could not be deleted. Please try again." is shown (A36, C7)
- **And** `deleteTask` catches the Firestore error and returns `{ success: false, error }` instead of throwing (C1).

- **When** they double-click the confirming **Delete**
- **Then** the button is disabled from the first click until the Server Action responds, and the document is written once.

### AC17: Users cannot edit, toggle or delete tasks they do not own, or deleted tasks

- **Given** `updateTask`, `setTaskStatus` or `deleteTask` is called with a task ID that
  - belongs to another user, or
  - does not exist, or
  - is already deleted, or
  - is not a valid document ID (empty, not a string, or containing `/`)
- **When** it runs
- **Then** it returns `{ success: false, error: 'Task not found.' }`, writes nothing, and does not throw (A37, C1, D9).

- The ownership and not-deleted checks happen **on the server**, inside `updateTask`, `setTaskStatus` and `deleteTask`, against the document as stored. They never trust a `uid` or state sent by the client. The check and the write run in one Firestore transaction, so a task deleted in another tab between the check and the write cannot be edited, toggled or deleted again (A24, [Security rules](#security-rules)).

- **Given** a logged-in user has the edit form or the delete confirmation open for a task that is deleted in another tab
- **When** they click **Save** or the confirming **Delete**
- **Then** the toast "Task not found." is shown and the form or confirmation closes. The task is already gone from the live list (A37).

- **Given** a logged-in user clicks the checkbox of a task that was deleted in another tab, before the list has updated
- **Then** the toast "Task not found." is shown and the checkbox reverts. The task then disappears from the live list (A37, A42).

- **Given** a user tries to restore a deleted task, or change its `uid`, `status` or `createdAt`, by writing through the Firestore client SDK
- **Then** the write is denied by security rules (`permission-denied`) (A24, C5).

### AC18: A logged-in user can mark a task completed, and back to pending

- **Given** a logged-in user has an active task with status `pending` (its checkbox is unchecked)
- **When** they click its checkbox, or focus it and press Space
- **Then** the checkbox becomes checked, the badge changes to **Completed** and the title is struck through at once, and the checkbox is disabled until the save finishes (A41, A42, A43, C16)
- **And** `setTaskStatus(taskId, 'completed')` is called and it updates that one document: `status: 'completed'` and `updatedAt` set to the server time (D11, C1, C4)
- **And** `uid`, `title`, `description`, `dueDate`, `createdAt`, `deletedAt` and `_schemaVersion` are unchanged, and no other document is written
- **And** no toast is shown, the task stays in the same place in the list, and keyboard focus stays on the checkbox (A42, A43)
- **And** the task is still completed after a page reload, and after signing out and back in.

- **Given** a logged-in user has an active task with status `completed` (its checkbox is checked)
- **When** they click its checkbox, or focus it and press Space
- **Then** the checkbox becomes unchecked, the badge changes back to **Pending**, the strikethrough is removed, and `setTaskStatus(taskId, 'pending')` saves `status: 'pending'` and a new `updatedAt`, with everything else unchanged (D11).

- **Given** a task is completed
- **Then** it can still be edited and deleted like any other task, and editing it leaves it completed (A45, AC12, AC15).

- **Given** the same task is open in two tabs, and the user completes it in one
- **Then** the other tab's checkbox, badge and title style update live, without a page reload (C8).

### AC19: Invalid, failed and repeated status changes

- **Given** `setTaskStatus` is called directly (bypassing the checkbox) with a status other than `'pending'` or `'completed'` (for example `'done'`, `''` or `null`)
- **When** it runs
- **Then** it returns `{ success: false, error: 'Status must be pending or completed.' }`, writes nothing, and does not throw (C1).

- **Given** `setTaskStatus` is called with the status the task already has
- **When** it runs
- **Then** it returns `{ success: true }` and writes nothing, not even `updatedAt` (A44).

- **Given** a logged-in user clicks a task's checkbox
- **When** the save fails: the Firestore write throws, or the call to the Server Action itself fails
- **Then** the checkbox, badge and title style go back to the stored status, the checkbox is enabled again, and the toast "Task could not be updated. Please try again." is shown (A42, C7)
- **And** `setTaskStatus` catches the Firestore error and returns `{ success: false, error }` instead of throwing (C1).

- **Given** a logged-in user double-clicks a task's checkbox
- **Then** only the first click takes effect, because the checkbox is disabled until `setTaskStatus` responds, and the document is written once (A42).

- **Given** a task's row is showing the edit form or the delete confirmation
- **Then** its status cannot be changed from that row: the edit form has no checkbox, and during the delete confirmation the checkbox is disabled (A45).

## Non-functional

- **Accessibility:** the forms, list, status checkboxes and delete confirmation meet WCAG 2.1 level AA (A21). Every field and checkbox has a `<label htmlFor>` (visually hidden for the checkbox). The whole flow (open, fill, create, edit, save, cancel, toggle, delete, keep) works with the keyboard alone and has visible focus styles. Errors are linked to their fields with `aria-describedby` and announced with `role="alert"`. [+ Add Task], **Edit**, **Delete** and **Keep** are `<button>`s, and icon-only buttons have an `aria-label` naming the task. Completed status is shown by the checked checkbox and the **Completed** badge text, never by strikethrough or colour alone (C9, A26, A30, A31, A34, A38, A41, A43).
- **Performance:** under normal load, a created, edited, toggled or deleted task is shown in its new state within 2 seconds of the user's confirming click. The checkbox changes at once (A22, A42).
- **Security:** each Server Action's first line is `requireAuth()`, and `uid` comes only from the session (C1, C4). `updateTask`, `setTaskStatus` and `deleteTask` check ownership and `deletedAt` on the server, in a transaction (AC17). Client writes to `tasks` are denied by rules (A24). No task field is rendered as HTML (A10).

## Implementation constraints

These follow from the conventions and decisions. They are listed so the build and review can check them.

- **Feature module** in `frontend/src/features/tasks/` (C12): the Server Actions in `actions/tasks.actions.ts`, the shared Zod schemas, the task form (used for create and edit), the list and task row Client Components (with the status checkbox and the inline delete confirmation), and the sort helper.
- **Server Actions** (C1, A24):
  - `createTask(input: unknown): Promise<ActionResult<string>>` returns the new task ID and stores `deletedAt: null`.
  - `updateTask(taskId: unknown, input: unknown): Promise<ActionResult>` validates `input` with the same `.strict()` schema as `createTask`. The input always carries all three fields (title, description, due date), so an update is a full replacement of them, never a partial patch.
  - `setTaskStatus(taskId: unknown, status: unknown): Promise<ActionResult>` validates `status` with `z.enum(['pending', 'completed'])` (message "Status must be pending or completed.") and sets `status` and `updatedAt`. It writes nothing when the task already has that status (A44).
  - `deleteTask(taskId: unknown): Promise<ActionResult>` sets `deletedAt` and `updatedAt`. It never calls Firestore `delete()`.
  - `taskId` is validated with a schema built on `idSchema` from `@/lib/validations/common` that also rejects `/`, so it cannot address a document outside `/tasks`. A failed ID check returns "Task not found." (A37).
  - `updateTask`, `setTaskStatus` and `deleteTask` read and write inside `adminDb.runTransaction()`: read the task, return "Task not found." unless it exists, `uid` matches the session and `deletedAt` is `null`, then write. Timestamps use the server time (`FieldValue.serverTimestamp()`).
- **Collection** (C3): a `Task` interface in `frontend/src/types/firestore.ts` (including `status: 'pending' | 'completed'` and `deletedAt: Timestamp | null`), `getTasksCollection()` / `taskDoc(id)` in `frontend/src/lib/firebase/firestore.ts`, a `match /tasks/{taskId}` block in `firebase/firestore.rules`, and a `tasks` section in `docs/FIRESTORE-SCHEMA.md`.
- **Rules** (C5, A24): exactly as in [Security rules](#security-rules). `update` is **not** relaxed.
- **List query:** `useCollection(getTasksCollection(), where('uid', '==', user.uid), where('deletedAt', '==', null))`, sorted in the client (A3). Both filters are required for the rules to allow the query. No composite index is needed.
- **Checkbox state:** the task row shows the requested status while `setTaskStatus` is running and goes back to the stored status (from `useCollection()`) if it fails, for example with React's `useOptimistic` or local state (A42).
- **Dashboard:** `frontend/src/app/(dashboard)/dashboard/page.tsx` stays a Server Component and renders the task list Client Component. `/dashboard` is already protected in `proxy.ts`.
- **No backend changes** (D1).

## Testing (C11)

- **Zod schema unit tests** at each boundary. Title: empty, whitespace-only, 1, 100 and 101 characters after trimming, a line break, emoji. Description: empty, 2,000 and 2,001 characters, line breaks. Due date: `null`, today, a past date, `2099-12-31`, `2100-01-01`, `2027-02-30`, a non-date string. Unknown keys, including `status` and `deletedAt`. Task ID: a valid ID, empty string, non-string, an ID containing `/`. Status: `'pending'` and `'completed'` accepted; `'done'`, `''`, `null` and `'Completed'` rejected.
- **Sort helper unit tests:** order by due date, ties broken by `createdAt`, `null` due dates last.
- **Date display unit test:** a `YYYY-MM-DD` value shows the same calendar date when the test runs in a time zone behind UTC (for example `TZ=America/Los_Angeles`).
- **Server Action unit tests** (with `requireAuth()` and `@/lib/firebase/admin` mocked):
  - `createTask` writes `deletedAt: null` and `status: 'pending'`.
  - `updateTask` on the owner's active task writes only `title`, `description`, `dueDate` and `updatedAt`.
  - `deleteTask` on the owner's active task writes only `deletedAt` and `updatedAt`, and never calls `delete()`.
  - `setTaskStatus` on the owner's active task writes only `status` and `updatedAt`, in both directions; with the status the task already has, it returns success and writes nothing; with an invalid status it returns "Status must be pending or completed." and writes nothing.
  - For all three: another user's task, a missing task, a deleted task and an invalid ID each return "Task not found." and write nothing.
  - For all three: a thrown Firestore error returns `success: false` and does not throw.
- **Task form component tests** (Testing Library + `user-event`, with the Server Actions and `sonner` mocked, as in `TUTORIAL-WALKTHROUGH.md`):
  - create: invalid input blocks the call and shows field errors; a valid submit calls `createTask` with trimmed values, shows "Task created" and closes the form; `success: false` and a rejected call both show the failure toast and keep the values; the button is disabled while submitting; Cancel clears the form and closes it
  - edit: the form opens pre-filled (including an empty date for `null`); a valid save calls `updateTask` with the task ID and trimmed values and shows "Task updated"; invalid input blocks the call; failure keeps the values and shows the failure toast; Cancel discards the changes
- **Task row component tests:** **Delete** shows the confirmation and does not call `deleteTask`; **Keep** and Escape close it without calling `deleteTask`; the confirming **Delete** calls `deleteTask` with the task ID and shows "Task deleted"; failure shows "Task could not be deleted. Please try again."; the button is disabled while deleting.
- **Status checkbox component tests:** the checkbox is checked for a `completed` task and unchecked for a `pending` one, with the matching badge; clicking it (and pressing Space) calls `setTaskStatus` with the task ID and the opposite status, and updates the checkbox, badge and strikethrough at once; it is disabled until the call resolves; `success: false` and a rejected call both revert it and show "Task could not be updated. Please try again."; no toast is shown on success; it has an accessible name that includes the task title.
- **Security rules:** checked by hand against the dev Firebase project, using the REST method in the `TUTORIAL-WALKTHROUGH.md` appendix. Expected results:
  - owner read of an active task allowed; owner read of a deleted task denied
  - another user's read denied; signed-out read denied
  - client create, update (including setting or clearing `deletedAt`, and changing `status`) and hard delete all denied
  - the dashboard list query (`uid` and `deletedAt == null` filters) allowed; the same query without the `deletedAt` filter denied.

## Definition of done (C3, C13, C14)

- [ ] Work is on a `feature/*` branch, with Conventional Commit messages.
- [ ] `Task` type, `getTasksCollection()`, rules and the `docs/FIRESTORE-SCHEMA.md` entry are all added (including the note on why `dueDate` is a string, the two `status` values, and that `deletedAt` is `null` until a soft delete).
- [ ] The root `CLAUDE.md` Codebase Map lists `getTasksCollection()` / `taskDoc()` and the `Task` type.
- [ ] `pnpm run typecheck`, `pnpm run lint`, `pnpm run test:all` and `pnpm run build` pass (`/verify` reports READY).
- [ ] The `security-reviewer` agent has reviewed the staged changes, with the ownership checks in `updateTask`, `setTaskStatus` and `deleteTask` called out for review.
- [ ] The rules are deployed to the dev Firebase project (with explicit approval) and the manual rules checks pass.

## Out of scope

- Statuses other than `pending` and `completed`, such as "in progress" or "archived" (A28).
- Recording when a task was completed, or a completion history (A40).
- Filtering, hiding or separately sorting completed tasks (A43).
- Undo, restoring deleted tasks, a trash view, and purging soft-deleted documents (A35).
- Bulk edit, bulk complete or bulk delete.
- Fields other than title, description, due date and status, such as priority, tags and reminders (A23).
- A task detail page (A29).
- A backend `/api/tasks` route (D1).
- Changes to the dashboard's existing metric cards.
