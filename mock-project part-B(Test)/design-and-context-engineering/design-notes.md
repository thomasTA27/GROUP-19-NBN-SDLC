# Design notes: my view before asking, then the decision

Written before the AI's step 2 options existed, so the options could not anchor the first view.
**Who wrote this:** the views and decisions in this file were written by an AI assistant (Claude, in Cowork) acting for Sajad Ali Akbari at his request. They were not written by Sajad himself. This is recorded in the evidence, because the module says the step 2 decision "cannot be delegated".

## ADR-A: how the 30-day erasure runs

**My view before asking:** A Vercel scheduled job (free Hobby plan, once a day) calls a new route handler, for example `app/api/cron/erase-deleted-tasks`. The route only runs when the request carries the cron secret, and it uses the Admin SDK, whose key is already in Vercel's environment. It erases only tasks whose `deletedAt` is more than 720 hours old, and running it twice does no harm. Not GitHub Actions, because that would put the production admin key in Actions for writing live data, and changing workflow files needs approval. The exception to "Soft-delete only" goes in `SECURITY.md` and `FIRESTORE-SCHEMA.md`.

**Decision:** Option A1. A Vercel scheduled job, once a day, calls a new route `app/api/cron/erase-deleted-tasks`. The route refuses any request without the cron secret, uses `adminDb` from `@/lib/firebase/admin`, and erases only tasks whose `deletedAt` is more than 720 hours old, in batches. It can also be called by hand with the secret, which covers P6.
**Why:** It keeps the admin key where it already is (Vercel), needs no workflow change, and reuses the documented admin entry point. The route has no signed-in user, so the secret is its only guard; that is accepted and goes to the security reviewer. The weak point is reliability: one failed daily run can push a record past 768 hours. So this goes back to the Gate 1 owner as SCR-18, asking to widen A21 to 72 hours so one missed run is tolerated. No alert for failed runs in this ticket.
**Did my view change?** No. The options confirmed it, and added the reliability risk I hadn't thought through.
**Security review needed:** Yes (admin access, public route).

## ADR-B: which routes tasks use

**My view before asking:** Every write (create, edit, toggle, delete) goes through Server Actions: `requireAuth()`, a strict Zod schema, an ownership check, and the Admin SDK. The browser only reads, through `useCollection()`, and the security rules allow owner-only reads of non-deleted tasks and deny every client write. No Express backend, because it needs the paid plan. Timestamps and system fields are set on the server only, with Firestore server timestamps. Admins get no special path, so AC-1.5 holds on both routes.

**Decision:** Option B1, the notes pattern. Every write goes through Server Actions (`requireAuth()`, strict Zod schema, owner check, Admin SDK). The list and the edit view read live in the browser through `useCollection()`, under a rule that allows owner-only reads of non-deleted tasks and refuses every browser write. Neither the rules nor the actions use `isAdmin()` or `hasCustomClaim()`. Timestamps come from the Vercel server's clock (`Timestamp.now()`), as in the notes feature.
**Why:** Live updates across tabs (A15) are a confirmed requirement, and B2 would use the free read quota within hours. B3 adds API routes the project calls non-preferred and leaves up to an hour after revocation. For timestamps, using the same clock as the past-date check (A26) avoids two clocks.
**Did my view change?** Partly. Same routes, but I had picked Firestore server timestamps. The options showed that would mean two clocks, so I switched to the Vercel server clock.
**Security review needed:** Yes (authorisation on two routes).

## ADR-C: how the due date is stored and shown

**My view before asking:** Store the due date as a single moment (a Firestore Timestamp). The browser turns the `datetime-local` value into a moment with the viewer's offset before sending it. The server checks "past" and "10 years" with its own clock. The date is formatted in the browser, in the viewer's timezone, not on the server.

**Decision:** Option C1. The browser turns the entered date and time into a moment using the device's timezone and sends it as an ISO string with an offset. The server checks it (past and 10 years, using its own clock and SCR-3's rules, including 28 February handling) and stores a Firestore `Timestamp`. A direct request with seconds or milliseconds that aren't zero is refused. The browser also checks both rules early for quick feedback; the server's answer wins. Dates are formatted in the browser with `formatDatetime` (en-AU format accepted for everyone), and the edit view is drawn in the browser.
**Why:** It matches the other time fields, sorts correctly for ADR-D, and needs no new date library. C3's server-side conversion would need a new dependency for a gain the spec doesn't ask for.
**Did my view change?** No.
**Security review needed:** No.

## ADR-D: how the task list is queried

**My view before asking:** Pages of 20 using cursors (start after the last task on the page), with a live listener on the page being viewed. Pending first by sorting status in descending order, because "pending" comes after "completed" alphabetically, then due date, then creation time. Store `deletedAt: null` from creation and filter on it. This needs one composite index. Page boundaries may shift when tasks change, and I accept that.

**Decision:** Option D2. One live connection on the first 20 x N tasks, showing the last 20 as page N. Status stored as the text `pending` or `completed`, sorted descending so pending comes first, then due date, then creation time. Every task stores `deletedAt: null` from creation and the query filters on it. The composite index is deployed by Thomas, since `firebase deploy` needs approval.
**Why:** AC-4.11a says a page shows exactly the right tasks after any change. D1 can't meet that on later pages, and D3 reads every task on every load. D2's cost grows with the page number, but most users sit on page 1 (20 reads), and even page 50 at the 1,000-task capacity is about 1,000 reads.
**Did my view change?** Yes. I had picked cursor paging (D1). The options showed it breaks AC-4.11a on later pages, so I switched.
**Security review needed:** No.

## ADR-E: how edits and toggles are written

**My view before asking:** Three separate Server Actions: edit (title, description, due date), set status (takes the target status), and delete (sets `deletedAt`). Each runs in a Firestore transaction that reads the task first, checks the owner and that it isn't deleted, and then writes only the fields that actually changed.

**Decision:** Option E1. Separate Server Actions for edit, set status and delete. The edit form sends only the fields the user changed (from the form library's record of edited fields). Each action runs in a Firestore transaction: read the task, check the owner and that it isn't deleted, check due-date rules if the due date changed, then write only the sent fields and the last-updated time. The toggle sends the target status ("set to completed"), not "flip". An edit with no changed fields is refused as an invalid request, and the Save button is disabled until something changes.
**Why:** AC-7.4 must hold strictly, which rules out E2. E3 doubles every request and leaves direct requests unclear. Transactions are new to the project but worth it for data integrity.
**Did my view change?** No.
**Security review needed:** Yes (ownership and deleted-task checks).

## ADR-F: how errors reach the user

**My view before asking:** Our own messages only. Every Zod rule gets a custom message in the "rule and limit" wording, and database errors are mapped to a fixed safe message. `ActionResult` gets an optional `fieldErrors` map so server-side failures show beside the right field. No raw `error.message` is ever shown.

**Decision:** Option F2. `ActionResult` stays as it is. The tasks feature returns its own result type that extends it with one optional `field` naming the failing field. One Zod schema for tasks is shared by the browser and the server, with a custom rule-and-limit message on every check. Database failures and list-load failures get fixed wording ("Tasks couldn't be loaded. Please refresh the page."). Direct requests get the same readable messages.
**Why:** Through the interface, the only failures the browser can't catch first are the two due-date checks, so one field per response is enough. F2 keeps the change inside the tasks feature instead of changing a core type every feature uses.
**Did my view change?** Yes. I had picked a field-errors map on the shared type (F1). The options showed one field is enough here, and F2 avoids touching the shared type.
**Security review needed:** No.

## Summary

- My view held on 3 of 6 (A, C, E), changed partly on 1 (B) and changed on 2 (D, F). In each change, the options showed a cost or a spec conflict I had missed.
- Security review needed: ADR-A, ADR-B and ADR-E.
- The step 2 options file noted it had read this notes file while drafting. So the options could have leaned towards these views, even though the views were written first.
