# Task CRUD spec: where it departs from or extends project conventions

**Context:** This is a read-only review. There is nothing to implement and no changes are proposed. I compared `task-crud-spec.md` with root `CLAUDE.md`, `frontend/CLAUDE.md`, `backend/CLAUDE.md`, and the `docs/` files FIRESTORE-SCHEMA, SECURITY, ARCHITECTURE and DESIGN. Some findings depend on code that the conventions point to. For those I also checked `firebase/firestore.rules`, `firebase/firestore.indexes.json`, `frontend/src/hooks/useFirestore.ts`, `frontend/src/lib/validations/common.ts`, `frontend/src/lib/utils.ts` and `.claude/skills/firebase-collection.md`.

---

## A. Departures: the spec contradicts a documented convention

**1. Automatic permanent erasure of deleted tasks**
- **Spec:** R6, AC-7.7, AC-7.8, D1, D4, Conflicts §1
- **Convention:** SECURITY.md "Firestore Security Rules › Key principles" says "Soft-delete only". FIRESTORE-SCHEMA.md (`users`) says "Hard-delete is disabled". CLAUDE.md "Critical Conventions › Firestore" says "Use the soft-delete pattern … instead of hard deletes".
- **How it differs:** Deleted tasks are hard-deleted after 30 days. The spec admits this. The rule text `delete: if false` still holds, because an Admin SDK job bypasses rules. What the spec departs from is the principle.

**2. The erasure job is a fourth route to the data, with no documented guard**
- **Spec:** Conflicts §2, D5, A21, AC-7.7
- **Convention:**
  - ARCHITECTURE.md "System Overview" lists exactly three routes to the data, each with its own guard: security rules, `requireAuth()`, and the auth middleware. Its "Security Model" says the same.
  - CLAUDE.md "Firestore" says "Always call `requireAuth()` … before any Firestore operation".
- **How it differs:**
  - A scheduled job has no user, so none of the three guards applies.
  - **Vercel scheduled job:** needs a route handler under `app/api/` other than `auth/session`. frontend/CLAUDE.md "File Organization" lists only that one.
  - **GitHub Actions workflow:** changing CI/CD workflow files needs explicit approval (CLAUDE.md "Agent Permissions"). SECURITY.md "Firebase Service Account" allows the key in Actions for CI/CD only, not for writing to production data.
  - Either option adds a new secret, which falls under CLAUDE.md "Environment Variables".

**3. The `/firebase-collection` scaffold can't be used for tasks**
- **Spec:** Conflicts §1, last bullet; AC-7.3
- **Convention:** CLAUDE.md "Available Skills" names `/firebase-collection` as the way to add a collection.
- **How it differs:** The skill's rules template allows the owner to hard-delete (`firebase-collection.md:65`). Its read rule also leaves out `notDeleted()` (`:60`). The spec forbids using it as-is, so tasks can't follow the documented scaffolding path.

**4. The spec's "Refused" doesn't match what `requireAuth()` does**
- **Spec:** Terms, "Refused": the requester gets an error, not a success response. Used by AC-1.1 and AC-1.6a.
- **Convention:** frontend/CLAUDE.md "Server Actions" says `requireAuth() // redirects to /auth/signin if not authed`. The CLAUDE.md Codebase Map says the same.
- **How it differs:**
  - A signed-out or expired Server Action call gets a redirect, not an error. The spec doesn't say whether a redirect counts as "refused".
  - The backend route does match: it returns 401 (SECURITY.md "Authentication").

**5. The documented error patterns show library text that AC-8.5 forbids**
- **Spec:** AC-8.5, AC-4.10b, A36
- **Convention:**
  - DESIGN.md "State Patterns › Error" displays `error.message` as-is. `useCollection` passes the raw Firestore error through (`useFirestore.ts:45-47`).
  - frontend/CLAUDE.md "Server Actions", backend/CLAUDE.md "Route Handler Pattern" and SECURITY.md "Input Validation" all return `parsed.error.errors[0]?.message` to the client.
- **How it differs:** Following these patterns as written shows Firestore error text. With Zod's default messages, it also shows Zod's text. That breaks AC-8.5 ("no error text … produced by the database or a library"). Zod's default messages also aren't the rule-and-limit wording that A36 requires.

**6. Characters are counted as code points, not as the documented Zod check counts them**
- **Spec:** A27, Terms "Character", AC-2.2a, AC-2.3a
- **Convention:** backend/CLAUDE.md and SECURITY.md "Input Validation" use `z.string().min(1).max(200)`. That check counts `String.length`, which is UTF-16 code units. FIRESTORE-SCHEMA.md's "1–200 chars" for notes is enforced that way.
- **How it differs:** Counting code points means the documented validation style can't be used as-is, on either the client form schema or the server schema. The spec presents this as a departure only from the notes precedent. It is also a departure from the documented validation idiom.

---

## B. Extensions: the spec adds a rule or pattern the conventions don't have

**7. Deleted tasks can't be written to, and can't be restored**
- **Spec:** A30, AC-7.4, AC-7.6
- **Convention:** SECURITY.md documents the `notDeleted()` guard for read rules only. The notes update rule (`firestore.rules:68-70`) lets the owner edit a deleted note and write `deletedAt`, which means they can clear it.

**8. System fields have fixed values, not just fixed keys**
- **Spec:** A31, AC-2.10b
- **Convention:** SECURITY.md "Field allowlists" controls which keys can be written, not their values. "Immutable fields" covers only `uid` and `role`. The spec extends server-set or immutable treatment to `createdAt`, `updatedAt`, `deletedAt` and `_schemaVersion`.

**9. Every field rule must also hold on every direct route**
- **Spec:** AC-2.9, P2
- **Convention:** SECURITY.md lists field-level validation in Firestore rules under "Opt-In Security Hardening". For any route where the browser writes directly to Firestore, the spec turns that opt-in step into a requirement.

**10. Status is a two-value field that changes only through a separate toggle**
- **Spec:** Terms, R5, A16, A32, AC-3.2a–c, AC-5.3, §6
- **Convention:**
  - No documented collection has a field limited to a fixed set of values, and there is no documented operation that changes one field only.
  - The documented Server Action pattern is a single validated update.
  - AC-5.3's "an edit that would change the status" doesn't say what happens to an edit that includes the current status unchanged. The documented `.strict()` approach would refuse it either way.

**11. Server-only checks must still show their error beside the field**
- **Spec:** AC-2.8, with A6 and A26
- **Convention:**
  - `ActionResult<T>` (CLAUDE.md Codebase Map, frontend/CLAUDE.md) holds a single `error?: string`.
  - DESIGN.md "Forms" shows server failures with `toast.error(result.error)`. Its field errors come only from the client `zodResolver`.
- **How it differs:** The past-date check (A26) and the 10-year check (A6) use the server's clock. A due date can pass in the browser and fail on the server, and neither documented shape records which field failed.

**12. An in-page confirmation before deleting**
- **Spec:** A20, AC-7.5
- **Convention:** DESIGN.md has no dialog or confirmation pattern. "Notifications" forbids `confirm()` and custom modal toasts, and "What to Avoid" rules out component libraries. This is a new UI pattern, and AC-8.4a/c's keyboard rules apply to it.

**13. Feedback messages for actions that aren't form saves**
- **Spec:** A22 (a success message after deleting), A35 (no message after a toggle), AC-8.2b/c
- **Convention:** The only success message DESIGN.md "Forms" shows is after a form save.

**14. Targets the project doesn't set**
- **Spec:**
  - **A14:** list updates within 3 seconds.
  - **A23:** tested at 320px and 1920px wide. DESIGN.md defines only the breakpoints between 640 and 1280px.
  - **A38:** each checkbox's name includes its task's title. DESIGN.md requires a label but says nothing about what it contains.

**15. Test setup the documented flows don't provide**
- **P7:** The session lifetime is fixed at 14 days (SECURITY.md "Frontend session flow"). The Codebase Map says the session route is "Already wired — don't touch for features", so a short-lived session needs tooling outside that route.
- **P6:** Nothing documented backdates a deletion time or runs the erasure on demand. It has to run against a real project, because CLAUDE.md rules out emulators.
- **P1:** "The admin role as described in docs/SECURITY.md" could mean either of two mechanisms: `users/{uid}.role` (`isAdmin()`) or the `admin` custom claim (`hasCustomClaim`).

---

## C. Assumptions that are really technical decisions

The spec says it "covers behaviour … not implementation" (How to read this spec). The items below each fix or force an implementation choice.

**16. Which routes to the data tasks use**
- **Spec:** P2, AC-2.9, D2c, A2, A15
- **Decision forced:**
  - AC-2.2c trims the title "whether … from the interface or a direct request". Firestore rules can only allow or deny a write. They can't change it. So the browser can't be allowed to write tasks directly, even though notes allow it (`firestore.rules:64-70`).
  - A15's live list reads through the client SDK, so reads are guarded by rules. Writes then go through Server Actions, where the Admin SDK bypasses rules. AC-1.5 (admins can't see other users' tasks) therefore has to be enforced separately on each route.
  - D2c allows "any backend endpoint". Using the Express API needs the Blaze plan (ARCHITECTURE.md), which conflicts with CLAUDE.md's "no paid Firebase plan". D5 only applies that free-plan rule to erasure.

**17. How the due date is stored and displayed (A5)**
- **Decision forced:**
  - It is stored as a single instant, for example a Firestore `Timestamp`.
  - A `datetime-local` input gives a clock time with no timezone, so it has to be converted to an instant somewhere that knows the viewer's timezone. The spec doesn't say where.
  - `formatDatetime` formats in the timezone of wherever it runs, with a fixed `en-AU` locale (`utils.ts:16-23`). Server Components are the default (CLAUDE.md), and on Vercel they run with the server's timezone. So AC-2.5 decides whether dates are formatted in the browser or the server.
  - The spec doesn't say what happens when a direct request sends a due date with seconds. It could be cut to the minute, refused, or stored as sent.

**18. The server's clock decides date checks (A26, A6)**
- **Decision forced:**
  - The server is authoritative. The client form (DESIGN.md "Forms") checks against the device clock, so the two can disagree. That's the gap in item 11.
  - A6's "10 years ahead" has open calendar questions: how 29 February is handled, and which timezone's date boundary applies. AC-2.6d's example uses dates with no times.

**19. Which characters count as whitespace (A2)**
- **Decision forced:** JavaScript's `trim()`, and so Zod's `.trim()`, removes U+FEFF but not U+0085. Unicode's `White_Space` property does the opposite. "Any Unicode whitespace" is therefore a choice between the two sets.

**20. How paging works alongside live updates (A12 + A15)**
- **Spec:** AC-4.7a/b, AC-4.11a/b
- **Decision forced:**
  - `paginationSchema` uses a page number and a limit (`common.ts:5-7`), which means skipping records (offset paging). The browser Firestore SDK has no offset. Server-side offsets bill every skipped document as a read, which undercuts A12's "bounded reads" reason.
  - `useCollection` starts a new live query only when `collectionRef` changes (`useFirestore.ts:52`). Changing the page's query settings won't reload it.
  - AC-4.11a requires "exactly the tasks that belong on" each page after a change. With cursor-based pages, a change on one page shifts the boundaries of the later ones.
  - So the two building blocks A12 and A15 cite don't work together as documented, and the paging approach is an undocumented choice.

**21. The list order (A9 + A10, AC-4.4)**
- **Decision forced:**
  - How status is stored matters. Sorted alphabetically, `'completed'` comes before `'pending'`.
  - The list query needs the project's first composite index, because `firestore.indexes.json` is empty. Deploying it needs `firebase deploy`, which requires explicit approval (CLAUDE.md "Agent Permissions") and goes through CI (SECURITY.md "Deploying rules").
  - Firestore can't query for a missing field, but `notDeleted()` treats a missing `deletedAt` as not deleted. So tasks have to store `deletedAt: null` from creation, or the list can't filter out deleted ones.

**22. Edits send only the changed fields (A18 + A28)**
- **Spec:** AC-5.2, AC-5.5, AC-6.4, AC-2.6c
- **Decision forced:** DESIGN.md "Forms" submits every field. To send only changed ones, the form has to track which fields were edited, or the server has to compare against the stored task. AC-2.6c's "leaves the due date unchanged" needs the same comparison. The last save wins, with no version check.

**23. Whether edits read and write in one transaction**
- **Spec:** A30, AC-7.4, AC-2.6c
- **Decision forced:** Edits have to check the stored task first: is it deleted, and has the due date changed? Without a transaction, an edit that overlaps a delete can change a deleted task, which breaks AC-7.4's "the stored record is unchanged".

**24. The erasure window assumes a particular scheduler (A21)**
- **Spec:** AC-7.7, Conflicts §2
- **Decision forced:** The 48-hour limit comes from one scheduler's limits: Vercel Hobby runs jobs once a day, with the start time accurate only to the hour. Yet the spec leaves the choice of scheduler to Design.

**25. A31 is worded for Firestore rules**
- **Spec:** AC-2.10b
- **Decision forced:** "A value other than the one the app would set" is how a Firestore rule would check it, for example `createdAt == request.time`. A Server Action using the documented `.strict()` approach refuses any system field in the request, whatever its value. Which behaviour the tests see depends on item 16.

**26. How the description is displayed (A4)**
- **Spec:** AC-2.3b/c
- **Decision forced:** React shows markup as typed by default. Keeping line breaks needs a text style that preserves them, which DESIGN.md doesn't mention.

**27. Where timestamps come from (A34)**
- **Spec:** AC-8.7a/b, AC-7.2
- **Decision forced:** The spec doesn't say whether `createdAt`, `updatedAt` and `deletedAt` use Firestore's server timestamp or the Vercel server's clock. Either meets the 5-second tolerance.

---

## Checked and consistent (so not listed above)

- R1–R5 match the owner-only notes rules.
- A1 and A3 (the length limits) match FIRESTORE-SCHEMA.md's notes limits. Only the counting method departs (item 6).
- A13, AC-4.9, AC-4.10a, AC-8.6 and AC-8.7a/b follow the documented conventions.
- The spec's other convention citations match the files they cite.
