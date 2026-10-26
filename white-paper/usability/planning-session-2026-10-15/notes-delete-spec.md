# Spec: delete a note

**Status:** Draft for Gate 1 review. Not approved.
**Date:** 2026-10-15
**Scope of this document:** planning and specification only. No application source or tests were changed.

**Ticket:**

> Users want to be able to remove a note they have created. Add a delete option to notes.

## 1. How to read this document

Every criterion names its source:

| Source | Meaning |
|---|---|
| Ticket | The ticket text says it. |
| Rule | A project rule requires it. The file is named. |
| Precedent | Another feature in this repo does it that way. |
| Decision | The spec author chose it. It is recorded as an assumption in section 4. |
| Resolved (Qn) | The user answered question n during spec authoring (Q9, Q9c, Q10). |
| A*n* | The criterion depends on assumption n in section 4. |

Criterion numbers keep gaps where criteria were cut (section 8). They are kept so earlier references stay valid.

## 2. Open items that block approval

1. **[NEEDS CLARIFICATION: how should the deleted-notes view read its data?]** A client subscription like `NotesList` cannot read deleted notes, because `firebase/firestore.rules` line 62 and `docs/SECURITY.md` require `notDeleted()` on reads. Recommended: a Server Component reads through `adminDb`. That needs no rule change and is the pattern in `docs/ARCHITECTURE.md` and `docs/FRONTEND.md`, but it loses live updates. The alternative is relaxing the read rule for the owner, which contradicts the documented convention and ships to production on merge (`docs/CI-CD.md`). See Flag 1.
2. **Unverified: the list query against `notDeleted()`.** The notes list queries `where('uid','==',uid)` with no `deletedAt` constraint. Whether Firestore accepts that query once some notes have `deletedAt`, and whether a deleted note then leaves the list, has not been tested. Criterion 30 covers it.
3. **Unverified: `sonner` action support.** `frontend/package.json` declares `sonner ^2.0.3`, but `node_modules` is not installed in this checkout, so toast actions could not be checked. See Flag 2.

## 3. Acceptance criteria

### Behaviour

1. A signed-in user can delete a note they created. *Ticket.*
2. A user can delete only their own notes. *Ticket. Rule: `docs/FIRESTORE-SCHEMA.md` and `firebase/firestore.rules` define notes as owner-only. The Server Action enforces it through 16, because the Admin SDK bypasses Firestore rules.*
3. Deleting sets `deletedAt` to a `Timestamp` on the note. The note is never hard-deleted. *Rule: root `CLAUDE.md`, `docs/SECURITY.md`, `firebase/firestore.rules` (`delete: if false`).*
4. A deleted note no longer appears in the user's list, and a restored note returns to it. *Ticket and Rule (`firebase/firestore.rules` `notDeleted()`, `docs/SECURITY.md`) for the removal. Resolved (Q9) for the return. Verified by 30.*
5. The note disappears from the list without a page reload. *A1.*
6. Deleting the last note shows the "No notes yet" empty state. *Rule: `docs/DESIGN.md`.*
7. The delete option is on each note in the list. *A2.*
8. Deleting is immediate, with no confirmation. *A3.*
9. A user can undo or restore a deleted note, and it returns to their list. *Resolved (Q9).*
9a. A `restoreNote` Server Action in `frontend/src/features/notes/actions/notes.actions.ts` follows the same rules as delete: `'use server'`, `requireAuth()` first, a Zod-validated note id, an owner check, and it returns `ActionResult<T>` and never throws. *Resolved (Q9) that restore exists. Rule: `frontend/CLAUDE.md`, `docs/SECURITY.md` for how. The name `restoreNote` is the author's.*
9b. Restoring puts the note back into a state that `notDeleted()` accepts and that the list shows. *Resolved (Q9). The exact representation (`null` or a removed field) is left to the plan, after criterion 30 shows how the list query behaves.*
9c. A user restores a note in two ways: an undo prompt right after deleting, and a later restore. *Resolved (Q9c).*
9c-i. After a successful delete, the user is offered an undo. Using it restores the note. *Resolved (Q9c). The surface is unsettled (Flag 2). The prompt's duration is A12.*
9c-ii. A user can later see their deleted notes and restore one. *Resolved (Q9c). How the view reads its data is open item 1.*
9d. The deleted-notes view lists only the caller's deleted notes. It handles loading, error and empty states, and its empty-state copy is "No deleted notes". *Rule: `docs/SECURITY.md` (owner-only), `docs/DESIGN.md` (three states). The empty-state copy is A12.*
10. Deleting sets `updatedAt` to the same `Timestamp` as `deletedAt`. *Resolved (Q10). `createNote` already uses one `now` for its timestamps.*

### Server Action

13. The action lives in `frontend/src/features/notes/actions/`. *Rule: `frontend/CLAUDE.md`.*
14. It uses `'use server'`, calls `requireAuth()` first, and validates the note id with Zod before any DB call. *Rule: `frontend/CLAUDE.md`, root `CLAUDE.md`. The Codebase Map lists `idSchema` in `frontend/src/lib/validations/common.ts`. It was not opened, so confirm it fits before reusing it.*
15. It returns `ActionResult<T>` and never throws. *Rule: `frontend/CLAUDE.md`.*
16. It confirms the note exists and belongs to the caller before writing. *Rule: `docs/SECURITY.md` (the "per-user access control" layer). It is the only enforcement, because the Admin SDK bypasses Firestore rules.*
17. A missing or not-owned note returns "Note not found". Deleting an already-deleted note owned by the caller returns success and leaves `deletedAt` and `updatedAt` unchanged. Restoring a note that is not deleted returns success and changes nothing. *A6, A10.*

### Data

19. `_schemaVersion` stays at 1. *Rule: `docs/FIRESTORE-SCHEMA.md`.*
20. `uid` stays immutable. *Rule: `firebase/firestore.rules`.*

### UI

21. The delete control is a `<button>`, keyboard reachable, with an `aria-label` if it is icon-only. *Rule: `docs/DESIGN.md` (Accessibility).*
22. It uses the destructive button style and `lucide-react` icons sized with `size-*`. It is disabled while its request is pending. *Rule: `docs/DESIGN.md`. The pending state is A6.*
23. Toast copy:

    | Case | Toast |
    |---|---|
    | Delete success | "Note deleted", with an "Undo" action |
    | Undo or restore success | "Note restored" |
    | Delete failure | the action's error, falling back to "Failed to delete note" |
    | Restore failure | the action's error, falling back to "Failed to restore note" |

    *Resolved (Q9c) for the Undo action. Copy: A6, A7, A10, A12. Whether a toast can carry the action is Flag 2.*
24. The UI works on mobile and uses Tailwind only. *Rule: `docs/DESIGN.md`.*

### Process

25. A plan is stated and confirmed before coding. The action, the list component, the type and the schema doc are already more than 3 files. *Rule: `.claude/rules/development-workflow.md`.*
26. Work happens on a `feature/{kebab-case}` branch created from `main` via `/git-feature`, with Conventional Commits. *Rule: root `CLAUDE.md`, `docs/GIT-WORKFLOW.md`.*
27. Claude does not run `firebase deploy`, which needs user approval and is hook-blocked. Any rules change reaches production automatically when the PR merges to `main` through `deploy.yml`, and that merge also ships the frontend through Vercel. *Rule: root `CLAUDE.md`, `docs/SECURITY.md`, `docs/CI-CD.md`.*
28. Typecheck, lint and tests pass locally. CI must also pass lint, typecheck, unit tests and `pnpm audit` before merge. *Rule: `.claude/rules/development-workflow.md`, `docs/GIT-WORKFLOW.md`.*
29. Tests cover any new Zod schema or hook. The action itself is not required to have tests. *A8. Rule: `docs/TESTING.md`.*
30. A smoke test runs against a dev Firebase project (there is no emulator), with at least one soft-deleted note present:
    - The list loads without a permission error, shows the other notes, and omits the deleted one.
    - Undo right after a delete brings the note back.
    - A later restore from the deleted-notes view brings it back.
    - Another user's note cannot be deleted or restored.

    *Rule: `.github/pull_request_template.md` (manual smoke test), `docs/ARCHITECTURE.md` (no emulator). Resolved (Q9c) for the restore paths. This settles open item 2.*
32. TypeScript conventions apply: no `any`, `import type`, the `@/` alias, no imports from other features, `pnpm` only, no inline styles. *Rule: root `CLAUDE.md`, `frontend/CLAUDE.md`.*
33. There is no `console.log` in `src/`. *Rule: `.claude/skills/verify.md`.*
34. `pnpm run validate` passes before each commit, and the Lefthook `pre-commit` and `commit-msg` hooks are not bypassed. *Rule: `.claude/rules/development-workflow.md`, root `CLAUDE.md`.*
35. `/checkpoint create` runs before starting and after each milestone. *Rule: `.claude/rules/development-workflow.md`.*
36. `/verify` returns READY before a PR is opened, and the `security-reviewer` agent audits the staged changes first. *Rule: `.claude/skills/verify.md`, root `CLAUDE.md` (sub-agents).*
37. The PR is a draft against `main` and uses the template: Summary filled in, type `feat:`, Test plan ticked, Firestore changes ticked accurately, and env vars marked "No new env vars". Claude does not merge or close the PR or push to `main`. A human squash-merges it. *Rule: root `CLAUDE.md` (Agent Permissions), `docs/GIT-WORKFLOW.md`, `.github/pull_request_template.md`.*

## 4. Assumptions

| # | Assumption | Source | Used by |
|---|---|---|---|
| A1 | The list stays a realtime subscription. This covers the pattern only. Whether a deleted note leaves the list is verified by 30. | Precedent: `NotesList.tsx` uses `useCollection`; `docs/TUTORIAL-WALKTHROUGH.md` describes it as live | 5 |
| A2 | The delete control sits on each note in `NotesList`. | Precedent: the notes page renders only `PageHeader`, `CreateNoteForm` and `NotesList`; there is no detail route | 7 |
| A3 | There is no confirmation step. `docs/DESIGN.md` forbids `confirm()` and defines no confirmation pattern. With an undo prompt and a later restore, an accidental delete is recoverable in the UI, but only if Flag 2 resolves in favour of the undo prompt. | Decision | 8 |
| A4 | One note per action. | Ticket ("a note") | none (criterion 11 cut) |
| A5 | No purge job. Soft-deleted notes are retained. Clients cannot hard-delete in any case (`firestore.rules`). | Decision | none (criterion 12 cut) |
| A6 | A missing or not-owned note returns `{ success: false, error: 'Note not found' }`, with the same message for both. An already-deleted note owned by the caller returns success without overwriting `deletedAt`, covering a double-click or retry. The delete button is disabled while its request is pending. `backend/CLAUDE.md` separates 403 from 404, but that is the Express layer; `createNote` uses a single generic string, which this follows. | Decision | 17, 22, 23 |
| A7 | Success toast "Note deleted". Failure toast shows the action's error, falling back to "Failed to delete note". `CreateNoteForm.tsx` uses "Note created" and "Failed to create note"; this follows that over the generic fallback in `docs/DESIGN.md`. | Precedent | 23 |
| A8 | Tests cover new Zod schemas and hooks only. The repo has no notes tests and no action tests. `docs/TESTING.md` requires schema, hook and util tests and is silent on actions. | Precedent | 29 |
| A9 | `docs/TUTORIAL-WALKTHROUGH.md` is not edited. It already drifted from the repo: it describes a `CreateNoteForm.test.tsx` that does not exist, and its `NotesList` differs from the real one. | Decision | none (criterion 38 cut) |
| A10 | Restore behaves like delete: it sets `updatedAt` to the restore time, is idempotent for a note that is not deleted, uses "Note not found" for missing or not-owned notes, and its toast copy is "Note restored" and "Failed to restore note". `docs/FIRESTORE-SCHEMA.md` defines `updatedAt` as the last update time. Q10 covered delete only. | Decision | 17, 23 |
| A11 | The later restore has no expiry for as long as the note exists. | Decision | none (criterion 12 cut) |
| A12 | The labels "Undo" and "No deleted notes", and the undo prompt lasting for `sonner`'s default toast duration. The default duration is unverified. | Decision | 9d, 23 |

Four assumptions (A4, A5, A9, A11) have no criterion left after the cuts. They are kept as recorded decisions.

## 5. Flags: clashes with project rules

1. **A list of deleted notes cannot read deleted notes the normal way.** `firestore.rules` line 62 and `docs/SECURITY.md` require `notDeleted()` on reads, so a client subscription like `NotesList` is denied. Options: (a) a Server Component reads through `adminDb`, documented in `docs/ARCHITECTURE.md` and `docs/FRONTEND.md`, with no rule change but no live updates, and a way to refresh after a restore that the project docs do not cover (check the Next.js 16 docs, as `frontend/CLAUDE.md` requires); (b) relax the read rule for the owner, which contradicts the `notDeleted()` convention, forces the main list query to filter deleted notes itself, and deploys on merge. Recommended: (a). The choice needs approval. Open item 1.
2. **An Undo button inside a toast is not covered by the design rules.** `docs/DESIGN.md` documents only `toast.success`, `error`, `loading` and `dismiss`, and says "never use custom modal toasts". Whether `sonner` supports an action option, and whether it is keyboard accessible, is unverified. `.claude/rules/development-workflow.md` says to check library APIs before relying on them. If it fails, the undo surface needs another design.
3. **A3 depends on Flag 2.** See A3.
4. **`deletedAt` is narrower in the docs than the data needs.** Root `CLAUDE.md` says `deletedAt: Timestamp`. Restoring needs `null` or a removed field. `notDeleted()` accepts either, so no rule breaks.

## 6. Known gaps (not yet criteria)

An audit against the quality checks (necessary, appropriate, unambiguous, complete, singular, verifiable, traceable) found these gaps. They are listed here and not added as criteria, because adding them would be new scope for the spec owner to decide.

1. Restore updating `updatedAt` is in A10 but no criterion states it.
2. Unauthenticated users being rejected is only implied inside 14.
3. Restore ownership as visible behaviour. Criterion 2 covers delete only.
4. The deleted-notes view: ordering, loading and error copy, and whether it updates live or refreshes after a restore.
5. The undo window as a stated duration. It rests on A12, which is unverified.
6. Several deletes in a row: does each get its own undo prompt?

### Quality issues not yet fixed

No remaining criterion fails "verifiable". Remaining issues by failure type:

- **Not singular:** 3, 4, 9, 9a, 9c, 9c-i, 9c-ii, 9d, 14, 15, 16, 17, 21, 22, 23, 24, 26, 27, 28, 29, 30, 32, 34, 36, 37.
- **Implementation detail:** 3, 9a, 9b, 10, 13, 14, 15, 16, 19, 20, 21, 22, 24, 32, 33.
- **Not necessary (duplicate or negative):** 9, 9a, 9c, 16, 20, 27, 29.
- **Ambiguous:** 8, 9b, 9c-i, 9c-ii, 24, 35, 37.
- **Incomplete:** 2, 5, 9c-i, 9c-ii, 9d.
- **Source overstated:** 5, 9a, 9b, 10.

Criteria 13–24 are project constraints rather than behaviour. Criteria 25–37 are a definition of done. Splitting the spec into those three lists would clear most implementation-detail failures without removing anything.

## 7. Questions answered

| Q | Question | Answer |
|---|---|---|
| 9 | Can a user undo or restore a deleted note? | Yes. |
| 9c | How? | Both: an undo prompt and a later restore. |
| 10 | Should `updatedAt` change on delete? | Yes, set to the delete time. |

## 8. Cut criteria

These seven failed "verifiable" and were cut. Cutting a criterion from the spec does not remove the project rule behind it. Five still bind during the build.

| Cut | What it required | Still required by a project rule? |
|---|---|---|
| 9e | Page conventions for the deleted-notes view: `(dashboard)` route group, `requireAuth()`, `metadata`, `PageHeader`, and a `Sidebar` entry if top-level | Yes, if a page is built: `docs/FRONTEND.md`, `.claude/skills/new-page.md` |
| 11 | One note per action | No, a scope note (A4) |
| 12 | Retention, no restore expiry, undo-prompt lifetime | Partly: soft delete is still required by 3 |
| 18 | Add optional, nullable `deletedAt` to the `Note` type and the notes table in `docs/FIRESTORE-SCHEMA.md`; update its creation and deletion lines; confirm `firestore.rules` line 70 still allows `deletedAt` on update | Yes: `docs/FIRESTORE-SCHEMA.md`, `.claude/skills/evolve-schema.md` |
| 21a | Restore and undo controls are keyboard reachable `<button>` elements with an `aria-label` if icon-only | Yes: `docs/DESIGN.md` |
| 31 | Any index a changed or new query needs goes in `firebase/firestore.indexes.json` | Yes, if a query needs it: `.claude/skills/evolve-schema.md`, PR template |
| 38 | `docs/FIRESTORE-SCHEMA.md` updated in the same session; other docs, skills and the Codebase Map only if a documented pattern or core export changes | Yes: root `CLAUDE.md` (Harness integrity) |

## 9. Items nobody asked for

"Asked" means the ticket, the user's answers (Q9, Q9c, Q10), or a project rule.

**Behaviour**
- Deleting an already-deleted note returns success and changes nothing (A6, 17).
- Restoring a note that is not deleted returns success and changes nothing (A10, 17).
- A missing and a not-owned note get the same "Note not found" (A6, 17).
- Restore sets `updatedAt` to the restore time (A10).
- `updatedAt` and `deletedAt` get the identical `Timestamp` (10). Q10 said "the delete time".
- The delete button is disabled while its request is pending (22, A6).
- The list updates live without a reload (5, A1).
- The undo prompt is a toast with an action button (23, Flag 2).
- A dedicated deleted-notes view (9c-ii, 9d).
- A "Note restored" toast (23).
- The cross-user check and the restore steps in the smoke test (30).

**Decisions to leave things out**
- No confirmation step (A3), no purge job (A5), no restore expiry (A11), single-note delete only (A4).

**Copy and numbers**
- Strings: "Note deleted", "Note restored", "Failed to delete note", "Failed to restore note", "Note not found", "Undo", "No deleted notes".
- The only numeric value is the implied undo duration (`sonner`'s default, A12), which is unverified.

## 10. Supporting record

**Project context read:** root `CLAUDE.md`, `frontend/CLAUDE.md`, `backend/CLAUDE.md`, `.claude/rules/development-workflow.md`, `docs/ARCHITECTURE.md`, `FIRESTORE-SCHEMA.md`, `FRONTEND.md`, `SECURITY.md`, `TESTING.md`, `GUIDE.md`, `DESIGN.md`, `TUTORIAL-WALKTHROUGH.md`, `GIT-WORKFLOW.md`, `CI-CD.md`, `firebase/firestore.rules`, `frontend/src/types/firestore.ts`, `frontend/src/lib/firebase/firestore.ts`, `frontend/src/hooks/useFirestore.ts`, the notes feature (action and both components), the notes page, `.claude/skills/firebase-collection.md`, `evolve-schema.md`, `verify.md`, `.claude/agents/security-reviewer.md`, `.github/pull_request_template.md`, and `START-HERE.md`.

**Not read:** `docs/BACKEND.md`, `ENV-VARS.md`, `DEPLOY-TO-VERCEL.md`, the copy-paste guides, the other skills, `lefthook.yml`, and the two linked white-paper module pages (Planning and Spec Authoring, Plan Approved gate). This spec has not been checked against those module pages.

**Other findings:**
- The `firebase-collection` skill's owner-only rule template emits `allow delete: if isAuthenticated() && isOwner(...)` and has no `notDeleted()` on reads. It contradicts the soft-delete rule. Do not use it as a template for this change.
- The existing rules already allow `deletedAt` on a notes update (`firestore.rules` line 70), so a rules change is not assumed.

**Not done in this stage:** no checkpoint (`/checkpoint create`), no implementation plan, no verification of open items 2 and 3.
