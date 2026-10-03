# Task CRUD: spec change requests from Design

Raised from: `design-step1-sort.md` (status: proposed), 2026-09-27.
For: Sajad Ali Akbari, Gate 1 owner of `task-crud-spec.md`.
Drafted with an AI assistant. To be checked by Sajad Ali Akbari.

Design does not edit the spec. Each request below needed a decision from the Gate 1 owner. SCR-1 to SCR-6 were answered on 2026-09-27 by an AI assistant acting for Sajad Ali Akbari at his request, and are recorded as his decisions.

Note: the Gate 1 owner is also the tester, so these requests are approved by the same person who raised them (see `design-step1-sort.md`).

---

## SCR-1: Does a redirect to sign-in count as "refused"?

**From:** step 1 item 4 (`design-step1-findings.md`)

**What the spec says**

- **Terms, "Refused":** "the request has no effect (no task is created, changed or erased), and the requester gets an error, with no task data, rather than a success response."
- **AC-1.1 (§1 Access and ownership):** "While signed out, opening the task list redirects to the sign-in page, and a direct request to read, create, edit, complete or delete a task is refused."
- **AC-1.6a (§1 Access and ownership):** "A request carrying expired credentials (see Terms) is treated as signed out: opening the task list redirects to the sign-in page, and any task action or direct request is refused."
- **AC-1.6b (§1 Access and ownership):** "After a user's session is revoked, opening the task list with that session redirects to the sign-in page, and in-app task actions made with it are refused."

**Problem**

The spec separates two outcomes. Opening a page "redirects to the sign-in page". Task actions and direct requests are "refused", which means the requester "gets an error".

The project's sign-in check doesn't return an error. When the session cookie is missing, expired or revoked, `getServerSession()` returns `null` and `requireAuth()` calls `redirect('/auth/signin')` (`frontend/src/actions/auth.actions.ts:14-38`; frontend/CLAUDE.md "Server Actions"). So a Server Action called in any of those states gets a redirect to the sign-in page, not an error.

That meets the first half of "Refused" (no effect, no task data) but not "gets an error". Two testers could disagree on whether AC-1.1, AC-1.6a and AC-1.6b pass. The backend API, if used, is not affected: it returns 401 (SECURITY.md "Authentication").

**Question for the Gate 1 owner**

For a Server Action called without valid credentials (signed out, or with an expired or revoked session), does a redirect to the sign-in page, with no effect and no task data, count as "refused" under AC-1.1, AC-1.6a and AC-1.6b? Or must the requester get an error response?

**Answer (Gate 1 owner, 2026-09-27):** Yes, a redirect counts as refused for in-app Server Actions, as long as nothing changes and no task data is returned. Direct requests to any other route (the database or an API) must still get an error. Update Terms "Refused" to say this, and AC-1.1, AC-1.6a and AC-1.6b to point to it.

**Status:** Answered

---

## SCR-2: Which admin mechanism does P1 mean?

**From:** step 1 item 15, P1 (`design-step1-findings.md`)

**What the spec says**

- **Test prerequisites, P1:** "At least two test accounts, plus one with the admin role (set as described in docs/SECURITY.md), to check that users, admins included, can't reach each other's tasks."
- **AC-1.5 (§1 Access and ownership):** "Signed in as a user with the admin role, a direct request to read, edit, complete or delete another user's task is refused at every point listed under P2, exactly as for any other user (AC-1.3)."

**Problem**

docs/SECURITY.md ("Firestore Security Rules › Helper functions") describes two separate admin mechanisms:

- a `role: 'admin'` field on the user's `users/{uid}` document, checked by `isAdmin()`
- an `admin` custom claim on the sign-in token, set with `adminAuth.setCustomUserClaims(uid, { admin: true })` and checked by `hasCustomClaim('admin')`

A test account can have either one, or both. P1 doesn't say which, so AC-1.5 could be checked with one mechanism and never with the other.

**Question for the Gate 1 owner**

Which admin mechanism does "the admin role" in P1 and AC-1.5 mean: the `role` field on `users/{uid}`, the `admin` custom claim, or both?

**Answer (Gate 1 owner, 2026-09-27):** Both. The admin test account has the `role: 'admin'` field and the `admin` custom claim, and AC-1.5 must hold with each one on its own and with both together. Update P1 to say this.

**Status:** Answered

---

## SCR-3: How is the 10-year limit measured?

**From:** step 1 item 18 (`design-step1-findings.md`)

**What the spec says**

- **A6 (Assumptions):** "A due date can be at most 10 years after the moment the task is saved, by the server's clock."
- **AC-2.6d (§2 Task fields):** "A due date more than 10 years after the moment the task is saved is refused, and one up to 10 years ahead is accepted. For example, saved on 5 March 2027, a due date on 5 March 2037 is accepted and one on 6 March 2037 is refused."
- **A5 (Assumptions):** "A due date is a single moment, entered and shown as a date and time to the minute, in the timezone of the device displaying it."

**Problem**

The rule measures from "the moment the task is saved", but its example uses dates with no times. Three things aren't defined:

- **Time of day.** Take a task saved at 10:30 UTC on 5 March 2027 with a due date of 23:00 UTC on 5 March 2037. The due date falls on the date the example accepts, but it is more than 10 years after the moment the task was saved.
- **Timezone.** A date boundary depends on the timezone. The limit uses the server's clock (A6), but users enter and see dates in their device's timezone (A5). For example, 06:00 on 6 March in Perth (UTC+8) is 22:00 on 5 March UTC.
- **29 February.** There is no 29 February in 2038. For a task saved on 29 February 2028, the last allowed date could be 28 February or 1 March 2038.

Two testers could reach different results for due dates near the limit.

**Question for the Gate 1 owner**

How is the 10-year limit measured?

- (a) To the same minute as the save, or to the end of that calendar day?
- (b) In which timezone's calendar?
- (c) For a task saved on 29 February, is the last allowed date 28 February or 1 March ten years later?

**Answer (Gate 1 owner, 2026-09-27):**
- (a) To the same minute as the save. The latest allowed due date is the save moment plus 10 calendar years.
- (b) Counted in UTC.
- (c) If that date doesn't exist (29 February), use the last day of that month, so 28 February.

Update A6 and rewrite the AC-2.6d example with times, for example: saved at 10:30 UTC on 5 March 2027, a due date of 10:30 UTC on 5 March 2037 is accepted and 10:31 UTC is refused.

**Status:** Answered

---

## SCR-4: Which characters count as whitespace?

**From:** step 1 item 19 (`design-step1-findings.md`)

**What the spec says**

- **Terms, "Whitespace":** "any Unicode whitespace character, including spaces, tabs, line breaks and non-breaking spaces (A2)."
- **A2 (Assumptions):** "Whitespace means any Unicode whitespace character, including spaces, tabs, line breaks and non-breaking spaces. A title made only of whitespace counts as empty. Leading and trailing whitespace is removed when a title is saved, whether it comes from the interface or a direct request, and length limits apply after it's removed."
- **AC-2.2b (§2 Task fields):** "A title made only of whitespace counts as empty, so AC-2.1a refuses it."
- **AC-2.2c (§2 Task fields):** "Leading and trailing whitespace is removed from the title when it is saved, whether the title comes from the interface or a direct request."

**Problem**

"Any Unicode whitespace character" has two common readings. Both cover the examples A2 lists, but they differ on two characters:

- JavaScript's `trim()`, which Zod's `.trim()` uses, removes U+FEFF (zero width no-break space) but not U+0085 (next line).
- Unicode's `White_Space` property includes U+0085 but not U+FEFF.

Checked in Node.js: `trim()` empties `"﻿"` but not `"\u0085"`, and `/\p{White_Space}/u` matches `"\u0085"` but not `"﻿"`.

So a title made only of U+FEFF is empty under one reading and 1 character long under the other. The same is true of U+0085. For titles containing these characters, two testers could reach different results on AC-2.2a, AC-2.2b and AC-2.2c.

**Question for the Gate 1 owner**

Which set does "any Unicode whitespace character" mean: the characters JavaScript's `trim()` removes, or Unicode's `White_Space` property?

**Answer (Gate 1 owner, 2026-09-27):** The characters JavaScript's `trim()` removes. That is what Zod's `.trim()` does, so the same rule applies in the browser and on the server with the project's normal validation. Update Terms "Whitespace" and A2 to say this.

**Status:** Answered

---

## SCR-5: Is an edit that resends the current status accepted?

**From:** step 1 item 10 (`design-step1-findings.md`)

**What the spec says**

- **AC-5.3 (§5 Update):** "A task's status changes only through a toggle (see Terms). An edit that would change the status is refused, whether it comes from the interface or a direct request."
- **A16 (Assumptions):** "Status changes only through a toggle. An edit that would change the status is refused."

**Problem**

The spec covers an edit that would change the status. It doesn't cover an edit that includes the status with the value it already has, for example a direct request that resends the whole task. AC-2.10a doesn't settle it either, because status is one of the task fields (Terms).

The project's documented validation refuses any field its schema doesn't list (`.strict()`: backend/CLAUDE.md "Route Handler Pattern", SECURITY.md "Input Validation"). The spec doesn't say whether this edit must be refused or accepted, so testers can't agree on the expected result.

**Question for the Gate 1 owner**

Is an edit that includes the task's current status, unchanged, accepted (with its other changes saved) or refused?

**Answer (Gate 1 owner, 2026-09-27):** Refused. An edit can only include title, description and due date. Any edit that includes status is refused, even with the current value, because status only changes through a toggle. Update AC-5.3 and A16.

**Status:** Answered

---

## SCR-6: A31 and AC-2.10b assume Firestore rules

**From:** step 1 item 25 (`design-step1-findings.md`)
**Depends on:** ADR-B (which routes tasks use)

**What the spec says**

- **A31 (Assumptions):** "System fields are set by the app. A direct request that sets one to a value other than the one the app would set is refused." Its source note reads: "docs/SECURITY.md's field allowlist rejects unknown fields but says nothing about the values of known ones."
- **AC-2.10b (§2 Task fields):** "A direct request that sets a system field other than the owner (creation time, last-updated time, deletion time or schema version) to anything other than the value the app would set is refused. For example, a create request with a creation time in 1990, or with a deletion time, is refused. The owner is covered by AC-1.4a and AC-1.4b."

**Problem**

The wording implies that a direct request may include system fields, and is accepted when their values match what the app would set. That's how a Firestore security rule checks a write when the browser writes to the database directly, for example `createdAt == request.time`.

Through a Server Action using the project's documented validation (`.strict()`), a request that includes any system field is refused whatever its value. There, the "value the app would set" case never comes up.

Which routes tasks use is still open in Design (ADR-B, step 1 item 16), so testers can't yet tell which behaviour AC-2.10b expects. The criterion also has no example of an accepted request that includes a system field.

**Question for the Gate 1 owner**

Should A31 and AC-2.10b refuse any direct request that includes a system field, whatever its value? Or only one whose value differs from what the app would set?

**Answer (Gate 1 owner, 2026-09-27):** Refuse any direct request that includes a system field, whatever its value. The app sets system fields itself and never accepts them from a request. Update A31 and AC-2.10b, and remove the "value the app would set" wording.

**Status:** Answered

---

# Raised by the step 2 consistency check

These come from `step2-consistency-check.md` (conflicts 1 to 11) and from ADR-A in `design-notes.md` (SCR-18). Several of them were introduced by the Gate 1 edits, which changed A6, A10 and A21 without updating every place that referred to them. Each was answered on 2026-09-27 by an AI assistant acting for Sajad Ali Akbari, the Gate 1 owner, at his request.

| SCR | Conflict | Answer | Status |
|---|---|---|---|
| SCR-7 | Terms "Deleted task" says the record is kept "only for 30 days", but A21 and AC-7.7 allow up to 32 days (conflict 1) | Reword Terms: the record is kept for 30 days after deletion as a record only, then erased automatically within the window in A21. | Answered |
| SCR-8 | A29 says the interface "never" shows an unsaved change, but AC-6.5 and AC-8.1b only apply from the moment an error appears (conflict 2) | Drop "never". A29 becomes: once an action has failed, from the moment the error message appears, what the user sees matches what's stored. | Answered |
| SCR-9 | The cut log says the removed AC-4.5 ("same list, same order") is implied by AC-4.4, and A9's first sentence still describes one order for the whole list, but Gate 1 put completed tasks below pending ones (conflict 3) | Update the cut log reason to "AC-4.4 now covers completed tasks, which are listed below pending ones (A10)". Reword A9 so its order applies within each group set by A10. | Answered |
| SCR-10 | The Gate 1 record says every assumption that adds a rule was reviewed, but A7, A9, A16, A18, A28 to A32, A35 and A38 are labelled "Decision" and aren't in either Gate 1 table (conflict 4) | Add them to Gate 1 decisions as reviewed. All confirmed as written, except A16 and A31, which change as answered in SCR-5 and SCR-6. | Answered |
| SCR-11 | A22 says the only success-message precedent is for create, but AC-8.2a cites DESIGN.md "Forms" as a project rule for create and edit (conflict 5) | DESIGN.md "Forms" is a general form pattern ending in `toast.success('Saved!')`, so it covers edits too. Fix A22's source note to say the precedent is for form saves (create and edit). | Answered |
| SCR-12 | "How to read this spec" says every spec decision is in the Assumptions table, but AC-8.5's allowance for the database's own permission-denied response has no assumption (conflict 6) | Add a new assumption A39 for that allowance (Source: Decision), point AC-8.5 to it, and add it to Gate 1 decisions as confirmed. | Answered |
| SCR-13 | Gate 1 confirms A1 and A3 because they "match the notes feature", but A27 counts characters differently from notes (conflict 7) | Change the Gate 1 reason for A1 and A3 to: "Same numbers as the notes feature. Characters are counted differently (A27)." | Answered |
| SCR-14 | A28 says a toggle changes only the status, but AC-8.7b says every toggle and edit also updates the last-updated time (conflict 8) | Add to A28: "apart from the last-updated time (AC-8.7b)". | Answered |
| SCR-15 | A30 says a deleted task can't be changed "in any way", but P6 asks testers to move a deleted record's deletion time (conflict 9) | Add to A30: direct changes to stored records on a test project, for test setup such as P6, are outside this rule. | Answered |
| SCR-16 | Conflicts item 2 and A21 say "a free scheduler runs at most once a day", but the only source is Vercel's Hobby limit, and GitHub Actions is named as another free option (conflict 10) | Reword both to say the window allows for Vercel Hobby's once-a-day schedule, and that any scheduler Design picks must meet it. Design picked Vercel (ADR-A). | Answered |
| SCR-17 | The cut log says no user outcome depends on "no detail view", but AC-7.1's check depends on it (conflict 11) | Change the cut log reason to: "A scope limit, not a behaviour, so it moved to §9 and A8. AC-7.1 relies on it." | Answered |
| SCR-18 | A21's 48-hour window can be broken by one failed daily run under ADR-A (Vercel Hobby, once a day, no retry) | Widen A21 and AC-7.7 to 72 hours after the 30 days end (720 to 792 hours after deletion), so one missed run is tolerated. Update Gate 1 decisions and Conflicts item 2 to match. | Answered |

---

## Raised from Implementation (Part B)

Raised by Implementation (Part B), 2026-10-02, for Sajad Ali Akbari, Gate 1 owner. Drafted by Claude (Cowork) acting for Sajad from a question the Claude Code planning session raised (`implementation/plan.md`). Answered by Sajad Ali Akbari himself in chat on 2026-10-02 (SCR-19).

---

## SCR-19: Can a phone-width user reach the Tasks link?

**From:** Implementation, plan review, work package 7 (tasks page and sidebar link)

**What the spec says**

- **A13:** "The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar."
- **AC-4.8:** "The task list is on its own page in the signed-in area, reached from a "Tasks" link in the sidebar."
- **AC-8.3:** "At 320px and 1920px wide, and at each layout breakpoint in docs/DESIGN.md between them (640, 768, 1024 and 1280px), every action in sections 3–7 can be completed without scrolling the page sideways."
- **A23:** "The narrowest supported screen width is 320px and the widest is 1920px."

**Problem**

The shared sidebar is hidden below 1024px: `frontend/src/components/layout/Sidebar.tsx` uses `hidden ... lg:flex`, and the app has no mobile menu. Between 320px and 1023px the sidebar, and so the "Tasks" link AC-4.8 requires, can't be reached. AC-8.3 says "every action in sections 3–7" can be completed at 320px, and AC-4.8 is in section 4. Two testers could disagree on whether opening the task list counts as an action in AC-8.3, and so whether AC-4.8 or AC-8.3 fails below 1024px for every page in the app, not only tasks.

**Question for the Gate 1 owner**

Is the missing mobile navigation a defect of this feature, to be fixed in this ticket, or does AC-4.8 only have to hold where the sidebar is shown (1024px and wider)?

**Options**

1. Narrow the criteria. AC-4.8 holds where the sidebar is shown (1024px and wider). AC-8.3 covers the actions on the tasks page itself, reached by its URL. A mobile menu becomes a separate ticket. Nothing in the shared layout changes.
2. Keep the criteria as written. This ticket adds a small mobile menu to the shared layout (`DashboardShell` / `Navbar` / `Sidebar`), which changes files every page uses and goes beyond the files the design notes list.

**Recommended by the planning session:** option 1.

**Answer (Gate 1 owner, Sajad Ali Akbari, in chat, 2026-10-02):** Option 1. AC-4.8 holds where the sidebar is shown (1024px and wider). AC-8.3 covers the actions on the tasks page itself, opened by its address below 1024px. A mobile menu is a separate ticket. Update A13, AC-4.8 and AC-8.3.

**Status:** Answered
