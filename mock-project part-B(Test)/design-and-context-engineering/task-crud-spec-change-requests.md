# Task CRUD: spec change requests from Design

Raised from: `design-step1-sort.md` (status: proposed), 2026-09-27.
For: Sajad Ali Akbari, Gate 1 owner of `task-crud-spec.md`.
Drafted with an AI assistant. To be checked by Sajad Ali Akbari.

Design does not edit the spec. Each request below needs a decision from the Gate 1 owner, and none of the questions is answered here.

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

**Status:** Open

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

**Status:** Open

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

**Status:** Open

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

**Status:** Open

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

**Status:** Open

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

**Status:** Open
