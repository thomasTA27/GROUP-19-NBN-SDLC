# ADR-0005: Separate edit, set-status and delete actions, each in a Firestore transaction

```
Status: Proposed
Decided-by: Sajad Ali Akbari (developer), decisions drafted by an AI assistant acting for him
Drafted-with: Claude Code:claude-opus-5-5
Security review: required
```

## Context

**Sources:**
- Step 2 decision ADR-E, in `design-and-context-engineering/design-notes.md` and `step2-options.md`
- `task-crud-spec.md`, as amended by SCR-1 to SCR-18

This ADR depends on ADR-0002, under which every write goes through the server.

**How claims are marked:** as in `step2-options.md`.

**What the spec requires:**
- **What an edit can include:** An edit can only include the title, description and due date. An edit that includes the status is refused, even with the current status (A16, AC-5.3, SCR-5).
- **What gets written:** Apart from the last-updated time, an edit changes only the fields the user changed, and a toggle changes only the status (A28, AC-5.2, AC-6.4, SCR-14).
- **Overlapping edits:** They merge field by field. The one the server receives last sets every field it changed, and no conflict warning is shown (A18, AC-5.5).
- **Deleted tasks:** Editing, toggling or deleting a deleted task is refused, and the stored record doesn't change (A30, AC-7.4).
- **Past due dates:** An edit that leaves a past due date unchanged is accepted (AC-2.6c).
- **Last-updated time:** Every successful edit, toggle and delete updates it (AC-8.7b).

**Facts that apply to every option:**
- **The documented form sends every field.** DESIGN.md's form pattern and the notes form submit every field (verified: `docs/DESIGN.md` "Forms", `CreateNoteForm.tsx`). `react-hook-form` can report which fields were edited (unverified; not used in the project).
- **Changes must be judged against what the form loaded,** not against what is stored now. Otherwise another tab's edit is overwritten, which breaks A18.
- **Transactions are new to the project.** No project code uses one (verified: no `runTransaction` in `frontend/src` or `backend/src`). Unit tests mock Firebase Admin (verified: `docs/TESTING.md`).

## Decision

Option E1:
- **Actions:** There are separate Server Actions for edit, set status and delete.
- **What the form sends:** The edit form sends only the fields the user changed, taken from the form library's record of edited fields.
- **Inside each transaction**, each action:
  1. Reads the task.
  2. Checks the owner, and that the task isn't deleted.
  3. Checks the due-date rules, if the due date changed.
  4. Writes only the fields it was sent, plus the last-updated time.
- **Toggling:** The toggle sends the target status ("set to completed"), not "flip".
- **Empty edits:** An edit with no changed fields is refused as an invalid request, and the Save button is disabled until something changes.

## Rationale

**Why E1** (`design-notes.md`): "AC-7.4 must hold strictly, which rules out E2." "Transactions are new to the project but worth it for data integrity."

### Rejected options

**E2: the browser sends only the changed fields; each action reads, then writes, with no transaction**

*The option, stated fairly:*
- It has the least code.
- It matches the notes action, which does a single write (verified: `notes.actions.ts`).
- The owner check isn't affected, because a task's owner never changes.
- Against it: an edit that overlaps a delete can change a deleted task.

*Reason in `design-notes.md`:* "AC-7.4 must hold strictly, which rules out E2."

**E3: the browser sends the whole form plus the values it loaded; the server works out the changes inside a transaction**

*The option, stated fairly:*
- The form keeps the documented pattern, so it doesn't need to track which fields changed.
- It protects data integrity in the same way as E1.

*Reason in `design-notes.md`:* "E3 doubles every request and leaves direct requests unclear."

**Toggle as "flip" instead of "set to a status"**

*The option, stated fairly:*
- The request doesn't need to name a status.
- Sent from an out-of-date screen, it unticks a task already completed in another tab, the opposite of what the user clicked.

`design-notes.md` records the choice of "set to completed" but no reason for it.

**Alternatives for an edit with no changed fields: accept it with a new last-updated time, or accept it with nothing written**

`design-notes.md` records the choice to refuse it but no reason for it.

## Consequences

**Transactions:**
- Transactions are new to the project, so there is more code, and the tests need a mocked transaction. How well the existing mocks handle this is unverified.
- How Admin SDK transactions retry when two writes compete is unverified.
- Every write reads the task first inside its transaction, so each write also costs a read (billing unverified).

**The edit form:**
- It departs from DESIGN.md's form pattern, which submits every field (verified). It has to track which fields changed, using a form-library feature the project hasn't used before (unverified).

**Empty edits:** Refusing an edit with no changes is behaviour the spec doesn't state, and no criterion tests it. AC-8.7b doesn't say whether an edit with no changes counts as successful.

**Toggling:** "Set to a status" makes a repeated request harmless.

**Security review:** Required, for the ownership and deleted-task checks in every action.
