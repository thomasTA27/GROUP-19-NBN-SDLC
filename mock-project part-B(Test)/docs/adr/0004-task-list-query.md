# ADR-0004: Page the task list with one live query over the first 20 × N tasks

```
Status: Proposed
Decided-by: Sajad Ali Akbari (developer), decisions drafted by an AI assistant acting for him
Drafted-with: Claude Code:claude-opus-5-5
Security review: not required
```

## Context

**Sources:**
- Step 2 decision ADR-D, in `design-and-context-engineering/design-notes.md` and `step2-options.md`
- `task-crud-spec.md`, as amended by SCR-1 to SCR-18

This ADR depends on ADR-0002, which keeps a live connection in the browser for reads.

**How claims are marked:** as in `step2-options.md`.

**What the spec requires:**
- **Paging:** 20 tasks per page, with next and previous (A12, AC-4.7a, AC-4.7b).
- **Capacity:** The list must work at 1,000 tasks (AC-4.7c).
- **Live updates:** Within 3 seconds, the page open on screen, and the same user's other tabs and devices, show exactly the tasks that belong on it after any change (A14, A15, AC-4.11a, AC-4.11b).
- **Order:** Pending tasks come first, then by due date and time, then by creation time (A9, A10, AC-4.4).
- **Deleted tasks:** The read rule hides deleted tasks (`docs/SECURITY.md`).

**Facts that apply to every option:**
- **The live list hook can't change page as it is.** `useCollection()` starts its live connection once for each collection it's given, so changing the query to move to another page doesn't restart it (verified: `useFirestore.ts:52`).
- **Indexes are deployed by hand.** No indexes exist yet (verified: `firestore.indexes.json`). `deploy.yml` deploys rules only, and indexes are deployed by hand (verified: `docs/CI-CD.md`). `firebase deploy` needs explicit approval (verified: CLAUDE.md "Agent Permissions").
- **Every task needs `deletedAt: null` from the start.**
  - Filtering on `deletedAt == null` doesn't match records that have no `deletedAt` at all (unverified).
  - Firestore refuses a whole list query if any record it could return is one the read rule would block (unverified).
- **Sorting by status.** "pending" sorts after "completed" (checked in local Node 22.23.2). Firestore's text order is unverified.

## Decision

Option D2:
- **The query:** One live connection on the first 20 × N tasks, showing the last 20 of them as page N.
- **Status:** Stored as the text `pending` or `completed`.
- **Sort order:** Status descending, so pending tasks come first, then due date, then creation time.
- **Deleted tasks:** Every task stores `deletedAt: null` from creation, and the query filters on it.
- **The index:** The composite index is deployed by Thomas, since `firebase deploy` needs approval.

## Rationale

**Why D2** (`design-notes.md`):
- "AC-4.11a says a page shows exactly the right tasks after any change."
- "D2's cost grows with the page number, but most users sit on page 1 (20 reads), and even page 50 at the 1,000-task capacity is about 1,000 reads."

### Rejected options

**D1: page by page from a bookmark, with a live connection on the page being viewed**

*The option, stated fairly:*
- Opening any page costs about 20 reads, however deep it is (unverified billing). That makes it the cheapest option for later pages.
- Page 1 is always exact.

*Reason in `design-notes.md`:*
- "D1 can't meet that on later pages", meaning AC-4.11a's exactness.
- The first view had picked D1. "The options showed it breaks AC-4.11a on later pages, so I switched."

**D3: one live connection on all the user's non-deleted tasks; the browser sorts them and splits them into pages**

*The option, stated fairly:*
- Every page is exact after any change.
- The query only filters on two exact matches, and whether it needs a composite index is unverified.
- The way status is stored doesn't matter to the query.

*Reason in `design-notes.md`:* "D3 reads every task on every load."

**Storing status as true/false instead of text**

`step2-options.md` raised this as a question, not as a separate option. `design-notes.md` records the choice of text but no reason for it.

## Consequences

**Read cost grows with the page:**
- Opening page N reads 20 × N tasks (unverified billing), and each change costs one read (unverified).
- On a deep page, the browser holds up to 20 × N tasks. At the 1,000-task capacity, that's 1,000.

**The live list hook has to change:**
- `useCollection()` has to restart its query when the page changes, or the list has to be rebuilt for each page (verified: `useFirestore.ts:52`).
- `useCollection()` is a shared hook listed in the CLAUDE.md Codebase Map. If its signature changes, the map has to be updated in the same change (verified: CLAUDE.md "Harness integrity").

**The first composite index in the project:**
- It covers owner, `deletedAt`, status, due date and creation time (exact index unverified).
- It is deployed by hand by Thomas, with approval (verified that deployment is manual and needs approval).
- The query won't run until the index exists (unverified).

**The `deletedAt` filter:** Every new task has to store `deletedAt: null`, a system field set by the app (A31). This relies on the unverified query behaviour described in Context.

**Status order:** Storing status as text relies on Firestore's text order putting "pending" after "completed" (unverified).
