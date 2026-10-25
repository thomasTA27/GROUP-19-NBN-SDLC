# ADR-0006: Tasks return their own result type that names one failing field

```
Status: Proposed
Decided-by: Sajad Ali Akbari (developer), decisions drafted by an AI assistant acting for him
Drafted-with: Claude Code:claude-opus-5-5
Security review: not required
```

## Context

**Sources:**
- Step 2 decision ADR-F, in `design-and-context-engineering/design-notes.md` and `step2-options.md`
- `task-crud-spec.md`, as amended by SCR-1 to SCR-18

This ADR works with ADR-0003, where the browser's early due-date checks can disagree with the server's.

**How claims are marked:** as in `step2-options.md`.

**What the spec requires:**
- **What errors must not show:** No stack traces, paths, database or library text, or server names. The database's own permission-denied response to a direct request is allowed (AC-8.5, A39).
- **Field errors:** Each invalid field shows an error beside it that states the rule and its limit (AC-2.8, A36).
- **Failures:** A failure shows an error message and no success message (AC-8.1a).
- **List loading:** A load failure shows an error message (AC-4.10b).
- **Notifications:** Use `sonner` for notifications (`docs/DESIGN.md` "Notifications").
- **Sign-in redirects:** A Server Action's redirect to sign-in counts as refused (SCR-1).

**Facts that apply to every option:**
- **Every action shares one result type.** `ActionResult` has three fields: `success`, `error?` and `data?` (verified: `frontend/src/types/index.ts:5-9`).
- **The documented pattern passes library text through.** It returns `parsed.error.errors[0]?.message`, which is Zod's own default text unless a custom message is given (verified: `notes.actions.ts:19`, frontend/CLAUDE.md).
- **The documented error display shows raw database text.** DESIGN.md's error state displays `error.message` (verified). `useCollection()` passes Firestore's raw error through (verified: `useFirestore.ts:45-47`).
- **Two checks only show up on the server.** The past-date and 10-year checks use the server's clock (A26, A6), so they can pass in the browser and fail on the server.
- **The form library can mark a field as invalid from code.** In `react-hook-form` this is `setError` (unverified; not used in the project).

## Decision

Option F2:
- **The shared type:** `ActionResult` stays as it is.
- **The tasks type:** The tasks feature returns its own result type, which extends `ActionResult` with one optional `field` naming the failing field.
- **One shared schema:** The browser and the server share one Zod schema for tasks, with a custom rule-and-limit message on every check.
- **Fixed wording:** Database failures and list-load failures get fixed wording: "Tasks couldn't be loaded. Please refresh the page."
- **Direct requests:** They get the same readable messages.

## Rationale

**Why F2** (`design-notes.md`):
- "Through the interface, the only failures the browser can't catch first are the two due-date checks, so one field per response is enough."
- "F2 keeps the change inside the tasks feature instead of changing a core type every feature uses."

### Rejected options

**F1: add an optional map of field errors to the shared `ActionResult` type**

*The option, stated fairly:*
- One response can report every failing field.
- The new field is optional, so existing actions don't change (verified).
- Every future feature could use it.

*Reason in `design-notes.md`:*
- "one field per response is enough", and F2 "keeps the change inside the tasks feature instead of changing a core type every feature uses."
- The first view had picked F1. "The options showed one field is enough here, and F2 avoids touching the shared type."

**F3: actions return error codes, and the browser turns codes into messages**

*The option, stated fairly:*
- The server never sends readable text, so library text can't reach the user through an action.
- All the wording lives in one table.
- It can report one or several failing fields.
- The codes could go on a tasks-only type, which leaves `ActionResult` unchanged.

*Reason in `design-notes.md`:*
- None specific to F3.
- The decision that "direct requests get the same readable messages" rules out F3's codes, but no reason for that choice is recorded.
- The notes' shared-type reason doesn't apply if F3's codes go on a tasks-only type.

**Two separate Zod schemas, one for the browser and one for the server, as the notes feature has**

`design-notes.md` records the choice of one shared schema but no reason for it. The notes feature defines two separate schemas (verified: `notes.actions.ts`, `CreateNoteForm.tsx`).

## Consequences

**A different result shape:** Tasks return a different shape from every other feature, although `ActionResult` itself doesn't change.

**One failing field per response:** A direct request with several invalid fields learns about them one at a time.

**Custom messages everywhere:** Every Zod check needs a custom rule-and-limit message. Any check left without one would let Zod's default text through, which AC-8.5 forbids.

**Departures from documented patterns:**
- Components must never show `useCollection()`'s raw `error.message`. That departs from DESIGN.md's error-state example (verified).
- One Zod schema shared by the browser and server departs from the notes feature, which has two (verified).

**Server-only failures:** A server-only due-date failure comes back with the field `dueDate`, and the form has to show it beside that field. Doing that from code relies on `setError` (unverified).
