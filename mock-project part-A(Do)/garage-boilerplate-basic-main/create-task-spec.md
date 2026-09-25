# Create a Task: Acceptance Criteria

## Source ticket

> Create a task — a user can add a task with a title, description and due date.

Product context: the Simple Task Dashboard is a small web app where users log in and manage their own to-do tasks.

## What the ticket states

1. A user can add (create) a task.
2. A task has a **title**, a **description** and a **due date**.
3. Users log in to the app (product context).
4. Users manage **their own** tasks (product context).

Every criterion below traces back to one of these facts, to a product decision (D), to a project convention (C), or to a stated assumption (A).

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

## Project conventions this spec follows

These come from the repository's `CLAUDE.md` files and `docs/`. They are requirements, not choices.

| ID | Convention | Source |
|----|------------|--------|
| C1 | Every Server Action calls `requireAuth()` first, validates its input with Zod `safeParse`, returns `ActionResult<T>` (`{ success, error?, data? }`) and never throws. | `frontend/CLAUDE.md` → Server Actions |
| C2 | Signed-out users are redirected to `/auth/signin`: by `proxy.ts` for page requests (with `?redirect=<path>`), and by `requireAuth()` inside Server Actions. | `ARCHITECTURE.md`, `SECURITY.md` |
| C3 | A new collection is added in four places: a TypeScript type (with `_schemaVersion: 1`), a typed collection export in `lib/firebase/firestore.ts`, security rules, and an entry in `docs/FIRESTORE-SCHEMA.md`. | `GUIDE.md` golden rule 3, root `CLAUDE.md` |
| C4 | Every document stores `uid` (the owner, taken from the session, never from client input), `createdAt` and `updatedAt` (`Timestamp`), and `_schemaVersion: 1`. | `FIRESTORE-SCHEMA.md`, `GUIDE.md` Step 2 |
| C5 | Security rules: owner-only reads guarded by `notDeleted()`, a `hasOnly` field allowlist, `uid` is immutable, and `delete: if false` (soft-delete only). | `SECURITY.md` → Firestore Security Rules |
| C6 | Forms use react-hook-form + Zod. Each error is shown under its field. The submit button is `disabled` while `isSubmitting`. Values are only cleared after a successful submit. | `DESIGN.md` → Forms |
| C7 | All user feedback uses `sonner` toasts. Never `alert()` or `confirm()`. | `DESIGN.md` → Notifications |
| C8 | Any component that loads data handles the loading (`LoadingSpinner`), empty (`EmptyState`) and error (inline `text-red-600` message) states. Lists update live through `useCollection()`. | `DESIGN.md` → State Patterns, `ARCHITECTURE.md` |
| C9 | Accessibility: every input has a `<label htmlFor>`, everything is keyboard-operable with visible `focus-visible` styles, only semantic `<button>`s are used, and errors use `aria-invalid`, `aria-describedby` and `role="alert"`. | `DESIGN.md` → Accessibility, `TUTORIAL-WALKTHROUGH.md` Change 5 |
| C10 | Dates are displayed with `formatDate()` from `@/lib/utils` (`en-AU`, for example "5 Mar 2027"). | root `CLAUDE.md` Codebase Map |
| C11 | Zod schemas, hooks and utilities always get Vitest unit tests. Components are tested with Testing Library + `user-event`. Firebase is always mocked. `app/` page files are not unit-tested. | `TESTING.md` |
| C12 | Feature code lives in `frontend/src/features/tasks/`, does not import from other features, and uses the `@/` alias. | `FRONTEND.md`, `frontend/CLAUDE.md` |
| C13 | Adding a core export (such as a collection accessor) updates the Codebase Map in the root `CLAUDE.md` in the same change. | root `CLAUDE.md` → Harness integrity |
| C14 | Work happens on a `feature/*` branch with Conventional Commits. Typecheck, lint, tests and build must pass. Deploying Firestore rules needs explicit approval. | root `CLAUDE.md`, `GIT-WORKFLOW.md` |

## Data model: `tasks` collection

**Path:** `/tasks/{taskId}` · **Access:** owner-only (C5)

| Field | Type | Required | Rule |
|-------|------|----------|------|
| `uid` | `string` | Yes | Owner's Firebase Auth UID, set from the session (C4). |
| `title` | `string` | Yes | Trimmed, 1–100 characters, single line (D2, A7). |
| `description` | `string` | Yes | Trimmed, 0–2,000 characters. Stored as `''` when left empty (D3, A9). |
| `dueDate` | `string \| null` | Yes | Calendar date `YYYY-MM-DD`, or `null` when not set (D4, D5, A12). |
| `status` | `'pending'` | Yes | Always `'pending'` on create, set by the server (D7). Other values belong to later tickets. |
| `createdAt` | `Timestamp` | Yes | Set by the server (C4). |
| `updatedAt` | `Timestamp` | Yes | Equal to `createdAt` on create (C4). |
| `_schemaVersion` | `1` | Yes | C3, C4. |

Optional fields are stored as present-but-empty (`''` / `null`) rather than being left out. This matches `UserProfile` (`displayName: string | null`) and keeps the `hasAll` / `hasOnly` rule allowlist exact.

`dueDate` is a string rather than a `Timestamp` because Firestore has no date-only type. A `Timestamp` would move the date across midnight for users in other time zones. `docs/FIRESTORE-SCHEMA.md` must record this as a deliberate exception to the `Timestamp` convention.

## Assumptions

The ticket, the decisions and the conventions do not cover the points below. A reviewer should correct any that are wrong. IDs are kept from the previous draft so they stay traceable. Missing IDs were settled by a decision or convention (see [Changes from the previous draft](#changes-from-the-previous-draft)).

| ID | Assumption | Used by |
|----|------------|---------|
| A2 | After a successful create, the form closes and the success toast reads "Task created". | AC1 |
| A3 | The list is sorted by due date, earliest first. Tasks with the same due date are sorted by `createdAt`, oldest first. Tasks with no due date come last, also sorted by `createdAt`. Sorting happens in the client, because a Firestore `orderBy('dueDate')` would put `null` values first. | AC1, AC6 |
| A7 | Leading and trailing whitespace is trimmed from the title. After trimming, the title is 1–100 characters. A title made only of whitespace counts as empty. Any Unicode is allowed, including emoji. Line breaks are not allowed. | AC4 |
| A8 | Duplicate titles are allowed. | AC4 |
| A9 | The description is plain text, at most 2,000 characters after trimming. Line breaks inside it are kept and shown. A description made only of whitespace is stored as `''`. No Markdown or rich text. | AC5 |
| A10 | All user text is rendered as React text nodes, which escapes it. `dangerouslySetInnerHTML` is never used for task fields. | AC4, AC5 |
| A12 | The due date is entered with the browser's native `<input type="date">`, which produces `YYYY-MM-DD`. It is stored exactly as entered and shown as the same calendar date in every time zone. | AC6 |
| A13 | The latest allowed due date is 31 Dec 2099. There is no earliest limit (D6). | AC6 |
| A15 | Browser-side validation errors are shown under the field they belong to (C6). If server-side validation fails, the Server Action's first error message is shown as an error toast (C1, C7). | AC4–AC7 |
| A17 | When a save fails, the error toast reads "Task could not be saved. Please try again." | AC8 |
| A19 | There is no limit on the number of tasks per user. | AC1 |
| A20 | **Cancel** closes the form, throws away what was entered and creates no task, with no confirmation prompt (C7 forbids `confirm()`). | AC9 |
| A21 | The accessibility target is WCAG 2.1 level AA. | Non-functional |
| A22 | Under normal load, a task appears in the list within 2 seconds of clicking **Create**. | Non-functional |
| A23 | Only title, description, due date and the starting status are in scope. | Out of scope |
| A24 | All task writes go through the Server Action, which uses the Admin SDK and so bypasses security rules. Rules deny every client-SDK create, update and delete on `tasks`, so the Server Action's validation cannot be bypassed. This is stricter than the `notes` template, which allows owner creates. | AC2, AC7 |
| A25 | When the user has no tasks, the `EmptyState` ("No tasks yet") is shown with the [+ Add Task] control below it. | AC1, AC10 |
| A26 | Opening the form moves keyboard focus to the title field. Closing it (Create or Cancel) returns focus to the [+ Add Task] control. | AC9, Non-functional |
| A27 | Character limits count JavaScript string length (UTF-16 code units, the same count Zod's `.max()` uses). Some emoji therefore count as 2 characters. | AC4, AC5 |

## Acceptance criteria

### AC1: A logged-in user can create a task

- **Given** a logged-in user is on `/dashboard` and has clicked **[+ Add Task]** at the bottom of their task list (D8)
- **When** they enter a valid title (and optionally a description and a due date) and click **Create**
- **Then** `createTask` is called and it saves one `tasks` document with the fields in the [data model](#data-model-tasks-collection): trimmed title and description, `dueDate` as picked or `null`, `status: 'pending'`, `uid` from the session, `createdAt`/`updatedAt` and `_schemaVersion: 1` (C1, C4, D7)
- **And** the form closes, the toast "Task created" is shown, and the task appears in the list without a page reload, in the position given by A3 (A2, C7, C8)
- **And** the task shows its title, its description (if any), its due date (or "No due date") and a **Pending** status badge (the "Pending" badge style in `DESIGN.md`)
- **And** the task is still there after a page reload, and after signing out and back in
- **And** creating the task works however many tasks the user already has (A19).

### AC2: A created task belongs only to its creator

- **Given** user X creates a task
- **Then** the task is saved with `uid` = X's UID from the session. Any `uid` sent in the input is rejected, not used (C4, AC7)
- **And** the task appears in X's list and not in any other user's list
- **And** if user Y reads X's task by its ID through the Firestore client SDK, the read is denied by security rules (`permission-denied`) (C5)
- **And** any create, update or delete on `tasks` through the Firestore client SDK is denied for every user, including the owner (A24, C5).

### AC3: A user who is not logged in cannot create a task

- **Given** a user is not logged in
- **When** they open `/dashboard`
- **Then** they are redirected to `/auth/signin?redirect=%2Fdashboard`, and the task list and [+ Add Task] control never render (C2).

- **Given** a logged-in user has the form open and their session has expired or been revoked
- **When** they click **Create**
- **Then** `requireAuth()` redirects them to `/auth/signin`, no task is created, and what they entered is not kept (C1, C2).

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

- **Given** `createTask` is called directly (bypassing the form) with input that breaks any rule in AC4–AC6, or that contains extra keys (for example `uid`, `status` or `createdAt`)
- **When** it runs
- **Then** it returns `{ success: false, error: <message for the first rule broken> }`, writes nothing, and does not throw (C1). Extra keys are rejected by a `.strict()` schema (`SECURITY.md` → Input Validation).

- The browser and the Server Action use **the same Zod schema**, so they apply the same rules and produce the same messages.

### AC8: A failed save and double-clicking Create

- **Given** a logged-in user submits a valid task
- **When** the save fails: the Firestore write throws, or the call to the Server Action itself fails (for example the network is down)
- **Then** "Task created" is not shown and no task appears in the list
- **And** the toast "Task could not be saved. Please try again." is shown, the form stays open with everything entered, and clicking **Create** again retries the save (A17, C6, C7)
- **And** the Server Action catches the Firestore error and returns `{ success: false, error }` instead of throwing (C1).

- **Given** a logged-in user has filled in a valid task
- **When** they double-click **Create**
- **Then** the button is disabled from the first click until the Server Action responds, and exactly one task is created (C6).

### AC9: Cancelling

- **Given** a logged-in user has entered data in the form
- **When** they click **Cancel**
- **Then** the form closes with no prompt, no task is created, focus returns to [+ Add Task], and opening the form again shows empty fields (A20, A26).

### AC10: The task list shows loading, empty and error states

- **Given** a logged-in user opens `/dashboard`
- **While** their tasks are loading, a `LoadingSpinner` is shown in the list area (C8)
- **When** they have no tasks, the `EmptyState` "No tasks yet" is shown with [+ Add Task] below it (A25)
- **When** the subscription fails, an inline error message is shown in the list area, and the rest of the dashboard still renders (C8).

## Non-functional

- **Accessibility:** the form and list meet WCAG 2.1 level AA (A21). Every field has a visible `<label htmlFor>`. The whole flow (open, fill, create, cancel) works with the keyboard alone and has visible focus styles. Errors are linked to their fields with `aria-describedby` and announced with `role="alert"`. The [+ Add Task] control is a `<button>` (C9, A26).
- **Performance:** under normal load, a task appears in the list within 2 seconds of clicking **Create** (A22).
- **Security:** the Server Action's first line is `requireAuth()`, and `uid` comes only from the session (C1, C4). Client writes to `tasks` are denied by rules (A24). No task field is rendered as HTML (A10).

## Implementation constraints

These follow from the conventions and decisions. They are listed so the build and review can check them.

- **Feature module** in `frontend/src/features/tasks/` (C12): the Server Action `actions/tasks.actions.ts` exporting `createTask(input: unknown): Promise<ActionResult<string>>` (returns the new task ID), the shared Zod schema, the create-form and list Client Components, and the sort helper.
- **Collection** (C3): a `Task` interface in `frontend/src/types/firestore.ts`, `getTasksCollection()` / `taskDoc(id)` in `frontend/src/lib/firebase/firestore.ts`, a `match /tasks/{taskId}` block in `firebase/firestore.rules`, and a `tasks` section in `docs/FIRESTORE-SCHEMA.md`.
- **Rules** (C5, A24): `allow read: if isAuthenticated() && isOwner(resource.data.uid) && notDeleted();` and `allow create, update, delete: if false;`.
- **List query:** `useCollection(getTasksCollection(), where('uid', '==', user.uid))`, sorted in the client (A3). No composite index is needed.
- **Dashboard:** `frontend/src/app/(dashboard)/dashboard/page.tsx` stays a Server Component and renders the task list Client Component. `/dashboard` is already protected in `proxy.ts`.
- **No backend changes** (D1).

## Testing (C11)

- **Zod schema unit tests** at each boundary. Title: empty, whitespace-only, 1, 100 and 101 characters after trimming, a line break, emoji. Description: empty, 2,000 and 2,001 characters, line breaks. Due date: `null`, today, a past date, `2099-12-31`, `2100-01-01`, `2027-02-30`, a non-date string. Unknown keys.
- **Sort helper unit tests:** order by due date, ties broken by `createdAt`, `null` due dates last.
- **Date display unit test:** a `YYYY-MM-DD` value shows the same calendar date when the test runs in a time zone behind UTC (for example `TZ=America/Los_Angeles`).
- **Create form component tests** (Testing Library + `user-event`, with the Server Action and `sonner` mocked, as in `TUTORIAL-WALKTHROUGH.md`):
  - invalid input blocks the call and shows field errors
  - a valid submit calls `createTask` with trimmed values, shows "Task created" and closes the form
  - `success: false` and a rejected call both show the failure toast and keep the values
  - the button is disabled while submitting
  - Cancel clears the form and closes it
- **Security rules:** checked by hand against the dev Firebase project, using the REST method in the `TUTORIAL-WALKTHROUGH.md` appendix. Expected results: owner read allowed, another user's read denied, signed-out read denied, client create/update denied, hard delete denied.

## Definition of done (C3, C13, C14)

- [ ] Work is on a `feature/*` branch, with Conventional Commit messages.
- [ ] `Task` type, `getTasksCollection()`, rules and the `docs/FIRESTORE-SCHEMA.md` entry are all added (including the note on why `dueDate` is a string).
- [ ] The root `CLAUDE.md` Codebase Map lists `getTasksCollection()` / `taskDoc()` and the `Task` type.
- [ ] `pnpm run typecheck`, `pnpm run lint`, `pnpm run test:all` and `pnpm run build` pass (`/verify` reports READY).
- [ ] The `security-reviewer` agent has reviewed the staged changes.
- [ ] The rules are deployed to the dev Firebase project (with explicit approval) and the manual rules checks pass.

## Out of scope

- Editing, deleting (soft-delete) and changing the status of tasks. These are later tickets, which will relax the `update` rule and add `deletedAt`.
- Fields other than title, description, due date and status, such as priority, tags and reminders (A23).
- A backend `/api/tasks` route (D1).
- Changes to the dashboard's existing metric cards.

## Changes from the previous draft

- **Q1–Q6 resolved** as D2–D7. Their either/or branches were removed from the criteria.
- **Moved from HTTP to Server Actions (D1):** the 401, 400 and 404 status codes are replaced by redirects, `ActionResult` returns and security-rule denials (AC2, AC3, AC7).
- **Assumptions replaced by decisions or conventions:** A1 → D8. A4 → C5. A5, A6 → C1, C2. A11 → C10 (the date format changed from DD/MM/YYYY to `formatDate()` output). A14, A16, A18 → C1, C6.
- **Assumptions revised:** A2 (toast via sonner), A3 (client-side sort), A12 (stored as a `YYYY-MM-DD` string), A15 (server errors shown as a toast).
- **Assumptions added:** A24–A27.
- **Sections added because the conventions require them:** data model, AC10 (loading, empty and error states), implementation constraints, testing, definition of done.
