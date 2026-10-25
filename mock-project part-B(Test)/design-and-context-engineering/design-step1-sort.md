# Step 1 sort: what happens to each of the 27 items

Source: `design-step1-findings.md`.
**Status: confirmed, 2026-09-27.** Drafted and confirmed by an AI assistant (Claude, in Cowork) acting for Sajad Ali Akbari at his request.

The module's checklist (b) says every item must end as an ADR, "follows convention" or a spec change request (SCR). Two more outcomes were needed, and both are gaps in the module:

- **Decided in Planning:** the spec already settled it at Gate 1, so Design has nothing to choose.
- **Context fix:** an existing context file is wrong. The module has no outcome for this.

Related items are grouped so each ADR covers one real decision. The 27 items become 6 ADRs, 6 SCRs, 1 context fix and 6 items with no new decision. A few items feed both an ADR and an SCR.

## ADRs (go through step 2)

| ADR | Decision to make | Items |
|---|---|---|
| ADR-A | How the 30-day erasure runs: which free scheduler, how it gets admin access to Firestore, how that access is guarded, and how the exception to "Soft-delete only" is recorded | 1, 2, 24 |
| ADR-B | Which routes tasks use: where writes go, where reads go, how owner-only (and no admin access) is enforced on each, and where timestamps and system fields are set | 16, 9, 8, 27 |
| ADR-C | How the due date is stored, converted and shown: what gets stored, where the viewer's timezone is applied, and where the past-date and 10-year checks run | 17, 18 |
| ADR-D | How the task list is queried: paging with live updates, sort order with pending first, the index it needs, and storing `deletedAt: null` | 20, 21 |
| ADR-E | How changes are written: edit vs status toggle, sending only changed fields, transactions, and blocking writes to deleted tasks | 10, 22, 23, 7 |
| ADR-F | How errors reach the user: safe messages instead of database or library text, and server-side errors shown beside the right field | 5, 11 |

## Spec change requests (back to the Gate 1 owner)

| SCR | What the spec needs to settle | Item |
|---|---|---|
| SCR-1 | Does a redirect to sign-in count as "refused" for a signed-out Server Action call? | 4 |
| SCR-2 | Which admin mechanism P1 means: `users/{uid}.role` or the `admin` custom claim | 15 (P1) |
| SCR-3 | Calendar rules for the 10-year limit: 29 February, and which timezone's date boundary applies | 18 |
| SCR-4 | Which whitespace set "any Unicode whitespace" means: JavaScript's `trim()` or Unicode's White_Space list | 19 |
| SCR-5 | Is an edit that sends the current status unchanged accepted or refused? | 10 |
| SCR-6 | Reword A31 and AC-2.10b so they don't assume Firestore rules, once ADR-B decides the routes | 25 |

Note: the Gate 1 owner is also the tester, so these SCRs are approved by the same person who raised them.

## Context fix (step 3)

| Fix | Item |
|---|---|
| The `/firebase-collection` skill's rules template allows hard delete and leaves `notDeleted()` out of the read rule, which contradicts `SECURITY.md`. Decide in step 3 whether to fix the skill or add a rule saying never to use it as-is for tasks. | 3 |

## No new decision

| Item | Outcome | Why |
|---|---|---|
| 6 | Decided in Planning (A27) | The spec already chose code points. Implementation just can't use plain `z.string().max()`. Candidate rule for step 3. |
| 12 | Implementation detail | An in-page confirmation within DESIGN.md's limits (no `confirm()`, no modals, no component libraries). Not architecture-significant. |
| 13 | Decided in Planning (A22, A35) | Messages after delete and toggle are already specified. |
| 14 | Decided in Planning (A14, A23, A38) | Targets confirmed at Gate 1. |
| 15 (P6, P7) | Testing setup | How to backdate a deletion and get short-lived credentials belongs to Testing. P6 depends on ADR-A. |
| 26 | Implementation detail | Keeping line breaks is a CSS style choice. |

## Other notes for the evidence

- Item 2 overstates `SECURITY.md`: it says the admin key is allowed in GitHub Actions "for CI/CD only, not for writing to production data". The file only says "Store as a GitHub Actions secret for CI/CD". Candidate rule for step 3, and a check for ADR-A.
