# Step 2 options: ADR-A to ADR-F

**Sources:**
- `design-step1-sort.md`, the ADR table
- `task-crud-spec.md`, approved at Gate 1
- `task-crud-spec-change-requests.md`, SCR-1 to SCR-6, all answered on 2026-09-27

The SCR answers aren't written into `task-crud-spec.md` yet (the file has no uncommitted changes), so this file cites the answers directly.

**Status: options only. No option is recommended.** The options under each ADR are in no order of preference. This file was drafted with an AI assistant (Claude Code).

**Disclosure:** `design-notes.md` was already in this folder and was read while this file was being prepared. It holds the "view before asking" for each ADR. Reviewers should check whether the options lean towards or away from those views.

## How claims are marked

- **(verified: `path`)**: checked in this repository's files.
- **(checked in local Node 22.23.2)**: run on the author's machine, not found in project files. The version of Node that Vercel uses was not checked.
- **(unverified)**: not checked in project files. Checklist (c) says to check these against official docs before relying on them.

Statements that follow from reasoning alone, such as arithmetic, carry no mark.

## Dependencies between the ADRs

- **ADR-B:** ADR-D and ADR-E assume its answer.
  - ADR-D assumes the list reads through the browser's live connection. That holds for options B1 and B3, but not B2.
  - ADR-E assumes every write goes through the server, which all ADR-B options do.
- **ADR-C and ADR-F:** if the browser also checks due dates against its own clock (ADR-C), the two can disagree near the limit. ADR-F decides how a disagreement is shown.

---

## ADR-A: How the 30-day erasure runs

### Already settled

These are not options:

- **Window:** A deleted task is erased no earlier than 720 hours and no later than 768 hours after its deletion time. No user action is needed (AC-7.7, A21).
- **Scope:** The erasure never changes or erases a task that isn't deleted (AC-7.8).
- **Cost:** No paid plan or billing account from any service is allowed (D5). This rules out:
  - Scheduled Cloud Functions, because Cloud Functions need the Blaze plan (verified: `docs/ARCHITECTURE.md`, `docs/CI-CD.md`).
  - Firestore's automatic expiry (TTL), which needs billing according to the spec's Conflicts §2 (unverified).
- **Documentation:** The exception to "Soft-delete only" is recorded in `docs/SECURITY.md` and `docs/FIRESTORE-SCHEMA.md` (D4). This is the same under every option.
- **Testing:** Testers need a way to run the erasure on demand (P6).

### Facts that apply to every option

- **One admin key, already in two places.** The key that gives admin access to Firestore (the service account key) is stored once as `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`. It is already set in Vercel's environment and as a GitHub Actions secret (verified: `docs/CI-CD.md` "Vercel Setup" and "GitHub Actions Secrets Required").
- **What GitHub Actions uses it for today.** In Actions, only `deploy.yml` uses the key, to deploy security rules, in the `production` environment (verified: `.github/workflows/deploy.yml`).
- **What SECURITY.md says.** It says only "Store as a GitHub Actions secret for CI/CD" (verified: `docs/SECURITY.md` "Firebase Service Account"). Whether a scheduled job that writes to live data counts as CI/CD is a matter of reading, not a stated rule. Step 1 overstated this point (see `design-step1-sort.md`).
- **One missed daily run can be enough to break the limit.** With one run a day, a record that becomes due just after a run waits about 24 hours. If the next run fails or is skipped, it waits about 48 hours, which can go past 768 hours.

### Option A1: A Vercel scheduled job calls a new route in the Next.js app

**How it works:**
- A Vercel scheduled job calls a new route once a day, for example `/api/cron/erase-deleted-tasks`. The job is set up in a new `vercel.json` (none exists; verified).
- The route checks a shared secret.
- It then uses `adminDb` from `@/lib/firebase/admin` to erase tasks whose deletion time is more than 720 hours old.

**Security:**
- Admin access uses the key that is already in Vercel (verified).
- The route is a public URL. Its only guard is the secret check inside it. There is no `requireAuth()`, because no user is signed in.
- `proxy.ts` doesn't cover `/api/` routes (verified: `frontend/src/proxy.ts`), so nothing else sits in front of the route.
- Vercel sends the secret in an `Authorization` header when `CRON_SECRET` is set (unverified).
- If the secret check fails open, anyone could trigger a run. The run still only erases records past 720 hours, so the harm is extra runs against the free quota, not early erasure.

**Cost on free plans:**
- Vercel's free Hobby plan allows scheduled jobs at most once a day (unverified; the spec states this, citing Vercel's docs).
- The Hobby plan limits how long a function can run (unverified). This caps how many records one run can erase.
- Firestore's free daily delete quota applies (unverified).

**Reliability against the 48-hour window:**
- There is one run a day, and its start time is accurate only to the hour (unverified, per the spec).
- One failed run can push a record past 768 hours (see the facts above).
- Vercel doesn't retry a failed scheduled run (unverified).
- For P6, testers can call the route with the secret.

**Fit with conventions:**
- It uses the documented admin entry point, `@/lib/firebase/admin`.
- It adds a second route alongside `api/auth/session`, which is the only route in frontend/CLAUDE.md "File Organization" (verified).
- It performs a data operation without `requireAuth()`, although CLAUDE.md "Firestore" requires it before every Firestore operation (verified).
- The new secret goes through `/add-env-var` (verified: CLAUDE.md "Environment Variables").
- The job ships with the frontend, which deploys on every push to `main` (verified: `docs/CI-CD.md`).

### Option A2: A scheduled GitHub Actions workflow runs an erasure script

**How it works:**
- A new workflow runs on a schedule. It can also be started by hand, using the `workflow_dispatch` trigger that `deploy.yml` already uses (verified).
- It runs a Node script that erases the records with `firebase-admin`, using the Actions secret. The script could live in `scripts/`, which CLAUDE.md describes as holding "migrations" among other things (verified).

**Security:**
- There is no public endpoint.
- The admin key in Actions gains a second use: writing to live data, not just deploying rules (verified: today only `deploy.yml` uses it).
- Anyone who can edit workflows on `main` can already run code with this secret through `deploy.yml`. So the option adds a scheduled use of the key rather than giving access to more people.
- Whether the `production` environment has protection rules is set in GitHub, not in the repo (unverified).

**Cost on free plans:**
- Actions minutes are free for public repositories, and private repositories get a monthly allowance (unverified).
- This file doesn't establish whether the repository is public or private.

**Reliability against the 48-hour window:**
- A schedule can run as often as every 5 minutes (unverified).
- GitHub can delay scheduled runs at busy times (unverified).
- In public repositories, scheduled workflows are turned off after 60 days without repository activity (unverified).
- Running more than once a day leaves room for failed runs within the window.
- For P6, testers can start the workflow by hand.

**Fit with conventions:**
- Changing CI/CD workflow files needs explicit approval (verified: CLAUDE.md "Agent Permissions").
- The script has to set up `firebase-admin` itself, which adds a third admin entry point. It can't reuse the existing two:
  - The frontend's `admin.ts` imports `server-only` (verified), which may throw outside Next.js (unverified).
  - The backend only allows admin imports through `lib/firebase.ts`, and CI enforces this with a test (verified: backend/CLAUDE.md).
- `firebase-admin` isn't a dependency at the repository root (verified: `package.json`).

### Option A3: A scheduled GitHub Actions workflow calls the Vercel route

**How it works:** The route is the same as in A1, but a scheduled workflow sends the request with the secret instead of Vercel's scheduler.

**Security:**
- The admin key stays in Vercel only. Actions holds only the route secret, which is a new Actions secret.
- The route is public and guarded by the secret, as in A1.

**Cost on free plans:** A short request uses Actions minutes (unverified allowance). Each call also runs a Vercel function on the Hobby plan (unverified limits).

**Reliability against the 48-hour window:**
- It can run more often than once a day (unverified, as in A2). Vercel's once-a-day limit doesn't apply.
- Both GitHub and Vercel must be working for a run to succeed.
- For P6, testers can start the workflow by hand or call the route directly.

**Fit with conventions:** It brings in A1's new route and data operation without `requireAuth()`, and A2's workflow change that needs approval.

### Questions to decide ADR-A

1. Is a public route guarded only by a shared secret acceptable for a job with admin access (A1, A3)?
2. Is using the existing admin key in GitHub Actions to write live data acceptable, given that SECURITY.md only says "for CI/CD" (A2)?
3. Is one run a day acceptable, knowing one failed run can break the 768-hour limit? Or do you need several runs a day?
4. Is the repository public or private? That affects Actions minutes and the 60-day schedule rule (unverified).
5. Is a new workflow file acceptable under CLAUDE.md's approval rule, and who approves it?
6. Where should the erasure code live, and may it add an admin entry point outside `@/lib/firebase/admin` and `backend/src/lib/firebase.ts`?
7. How will a failed or skipped run be noticed? None of the options includes an alert.

---

## ADR-B: Which routes tasks use

### Already settled

These are not options:

- **The browser can't write tasks directly to Firestore.**
  - AC-2.2c trims every title, whichever route it arrives by. Security rules can only accept or refuse a write, not change it (unverified).
  - The SCR-6 answer refuses any request that includes a system field. A task created from the browser would have to include the owner and the timestamps.
  - So every option below refuses all task writes from the browser.
- **No Express backend.** Cloud Functions need the Blaze plan (verified: `docs/ARCHITECTURE.md`, `docs/CI-CD.md`), and CLAUDE.md requires no paid plan.
- **SCR-1 answer:** A Server Action that redirects to sign-in counts as refusing. Direct requests to the database or to an API must still get an error.
- **SCR-2 answer:** AC-1.5 must hold for an admin with the `role` field, with the custom claim, and with both. So neither the task rules nor the server code may use `isAdmin()` or `hasCustomClaim()`.
- **SCR-6 answer:** System fields are set on the server only.

### Option B1: Writes through Server Actions, list read live in the browser (the notes pattern)

**How it works:**
- Create, edit, toggle and delete are Server Actions. Each one calls `requireAuth()`, validates with Zod, checks the owner and writes with the Admin SDK. This is the notes pattern (verified: `features/notes/actions/notes.actions.ts`).
- The list reads through `useCollection()`, under an owner-only read rule that hides deleted records (verified: `NotesList.tsx`, `firestore.rules:62`).
- The rules refuse every write from the browser.

**Security (owner-only, no admin access under AC-1.5):**
- There are two routes to guard: security rules for reads, and the action code for writes.
- The project's docs treat the Admin SDK route as guarded by `requireAuth()`, not by rules (verified: `docs/ARCHITECTURE.md` "Three paths to the data"). This file doesn't verify that the Admin SDK ignores rules.
- Admins have to be excluded on each route separately. The read rule leaves out the admin helpers, and the actions compare the task's owner with `session.uid` only.

**Field rules on every route (AC-2.9, AC-2.2c):**
- All writes pass through the server's Zod validation.
- Direct writes to Firestore get the database's own permission-denied response. AC-8.5 allows that response, and it counts as an error under SCR-1.

**Live updates (A15):** Yes. `useCollection()` keeps a live connection (onSnapshot), so changes from other tabs and devices appear without a reload (verified: `useFirestore.ts`).

**Fit with conventions:**
- It matches ARCHITECTURE.md's request patterns: live data in the browser, and changes through Server Actions.
- It departs from the notes rules, which let the browser create and update notes (verified: `firestore.rules:64-70`).

### Option B2: Reads and writes both go through the server; the browser has no Firestore access to tasks

**How it works:**
- Server Components and Server Actions read and write with the Admin SDK.
- The browser has no access to tasks. Firestore's catch-all rule already refuses anything not explicitly allowed (verified: `firestore.rules:76-78`).

**Security (owner-only, no admin access under AC-1.5):**
- There is one route to guard: the server code.
- Admins are excluded in one place.
- Direct requests to Firestore get permission-denied.

**Field rules on every route (AC-2.9, AC-2.2c):** Yes, as in B1.

**Live updates (A15):**
- The server doesn't push changes to the browser. To show changes from other tabs and devices within 3 seconds (AC-4.11b), each open tab has to ask again about every 3 seconds, or A15 has to change.
- Asking every 3 seconds for a page of 20 tasks costs about 400 reads a minute per open tab, if Firestore bills one read per document returned (unverified).
- The free plan's daily read quota is 50,000 (unverified). At that rate, one open tab would use it up in about 2 hours.

**Fit with conventions:**
- Reading on the server fits "Server Components by default" (CLAUDE.md).
- It departs from ARCHITECTURE.md's live-data-in-the-browser pattern, which is the precedent A15 cites.
- `paginationSchema` (page number and limit; verified: `common.ts`) could be used here. Page-number paging skips records, and skipped records are billed as reads (unverified).

### Option B3: Writes through new Next.js API routes that check the sign-in token; list read live in the browser

**How it works:**
- Routes such as `app/api/tasks/...` check the Firebase sign-in token with `adminAuth.verifyIdToken`. The backend's middleware does the same (verified: `backend/src/middleware/auth.ts:19`), and the frontend uses the same `firebase-admin` major version (verified: both `package.json` files).
- The browser sends the token using the existing `getIdToken()` (verified: `lib/firebase/auth.ts:58`).
- Reads work as in B1.

**Security (owner-only, no admin access under AC-1.5):**
- Two routes to guard, as in B1.
- Direct requests get a proper HTTP error (400, 401 or 403) rather than a redirect.
- Sign-in tokens stay valid for up to 1 hour after a session is revoked (verified: `docs/SECURITY.md`).
  - Server Actions check for revocation on every call (verified: `auth.actions.ts:21`).
  - `verifyIdToken` checks only if its revocation option is turned on (unverified).

**Field rules on every route (AC-2.9, AC-2.2c):** Yes, as in B1.

**Live updates (A15):** Yes, as in B1.

**Fit with conventions:**
- frontend/CLAUDE.md calls Server Actions "the preferred mutation pattern" (verified).
- The frontend has no `HttpError` or error handler of its own (verified: `HttpError` exists only in `backend/src/lib/errors.ts`). The backend's standard error format (RFC 9457) would have to be rebuilt or copied.
- D2c's endpoint tests (a success case, and a refusal without credentials) would apply to these routes.

### A choice under every option: where the timestamps come from (item 27)

- **(i) The Vercel server's clock.** Use `Timestamp.now()` from `firebase-admin`, as the notes feature does (verified: `notes.actions.ts:25`). This is the same clock that decides whether a due date is in the past (A26).
- **(ii) Firestore's own server timestamp.** The browser version, `serverTimestamp()`, is used in `AuthProvider.tsx:34` (verified). The Admin SDK version isn't used anywhere in the project (unverified). With this choice, stored times come from the database's clock while due-date checks use Vercel's, so two clocks are involved.

### Questions to decide ADR-B

1. Are live updates across tabs and devices (A15) worth guarding two routes (B1, B3)? Or is guarding a single route (B2) worth the read cost of asking again every 3 seconds, or changing A15?
2. Should direct write requests get a redirect, as Server Actions give (SCR-1 accepts this), or an HTTP error (B3)?
3. Does the edit view load its task through the browser's live connection or through the server?
4. Under B3, is it acceptable that task writes can keep working for up to 1 hour after a session is revoked?
5. Should timestamps come from the Vercel server's clock or from Firestore's server timestamp?

---

## ADR-C: How the due date is stored, converted and shown

### Already settled

These are not options:

- **Precision:** A due date is a date and time, to the minute (R3, A5).
- **Display:** It is shown in the viewer's device timezone (AC-2.5).
- **"Past":** A due date is in the past if it is before the start of the current minute, by the server's clock when the save arrives (A26).
- **10-year limit (SCR-3 answer):**
  - It is the save moment plus 10 calendar years, to the minute, counted in UTC.
  - If that date doesn't exist (29 February), the limit is the last day of that month.

### Facts that apply to every option

- **The browser input has no timezone.** A `datetime-local` input gives a date and time with no timezone (unverified).
- **JavaScript treats such a string as local time.** `new Date("2027-03-05T17:00")` gave 06:00 UTC on a UTC+11 machine (checked in local Node 22.23.2). Browsers are assumed to behave the same (unverified).
- **Plain JavaScript gets 29 February wrong for this rule.** Adding 10 years to 29 February 2028 with `setUTCFullYear` gives 1 March 2038 (checked in local Node 22.23.2). SCR-3 requires 28 February 2038, so every option needs its own end-of-month handling.
- **The project's date helper formats wherever it runs.** `formatDatetime` sets no timezone and always uses the `en-AU` format (verified: `utils.ts:16-24`), so it uses the timezone of whatever is running it.
  - `useCollection()` loads data only in the browser, after the page appears (verified: `useFirestore.ts:29-49`). So the live list is always formatted in the viewer's timezone.
  - Anything rendered on the server uses the server's timezone. What Vercel's server timezone is has not been checked (unverified).
- **There is no timezone library to hand.** Node 22 has no built-in `Temporal` (checked in local Node 22.23.2), and no timezone library is installed (verified: `frontend/package.json`).

### Option C1: Store a Firestore Timestamp; the browser converts the entered time to a moment

**How it works:**
- The browser turns the entered date and time into a single moment, using the device's timezone.
- It sends that moment to the action as an ISO date string with a timezone offset.
- The server checks it against the past and 10-year rules using its own clock, then stores it as a Firestore `Timestamp`.

**Timezone correctness (AC-2.5):**
- The result is right as long as the device's timezone is right when the date is entered.
- Some local times don't exist on the day clocks go forward. How the browser handles those is decided by its date parsing rules (unverified).

**Where the checks run (A26, A6):** The server decides. The browser can check early using its own clock.

**Sorting:** Firestore sorts `Timestamp` values in time order (unverified). This works for the list query in ADR-D.

**Fit with the project's date helpers:**
- `createdAt` and `updatedAt` already use the `Timestamp` type (verified: `docs/FIRESTORE-SCHEMA.md`).
- `formatDatetime` works in the browser, with its fixed `en-AU` format.

### Option C2: Store an ISO 8601 UTC string in one fixed format, such as `2027-03-05T10:30Z`

**How it works:** Conversion is the same as in C1. The value is stored as a string, not a `Timestamp`.

**Timezone correctness (AC-2.5):** Same as C1.

**Where the checks run (A26, A6):** Same as C1. The server has to parse the string before it can check it.

**Sorting:**
- Sorting the strings gives time order only if every value has exactly the same format (UTC, same length, 4-digit year). The 10-year limit keeps the year to 4 digits.
- A wrongly formatted value would sort out of order, so the validation has to enforce the exact format.
- Firestore compares strings byte by byte in UTF-8 (unverified).

**Fit with the project's date helpers:**
- It differs from the `Timestamp` type the other time fields use.
- Testers can read it as-is in the Firebase console (P3).
- `formatDatetime` accepts a string (verified: its parameter is `Date | string`).

### Option C3: Store a Firestore Timestamp; the server converts from the entered time and the viewer's named timezone

**How it works:**
- The browser sends the date and time as typed, plus its named timezone from `Intl`, for example `Australia/Perth`.
- The server converts that to a moment, checks it and stores it.

**Timezone correctness (AC-2.5):**
- Conversion happens in one place, on the server.
- Times that don't exist, or occur twice when clocks change, are handled explicitly in server code.
- Node can't convert a date and time in a named timezone to a moment without help: `Temporal` isn't available (checked in local Node 22.23.2). That needs a new dependency (none installed; verified) or hand-written code built on `Intl` (unverified approach).
- The timezone comes from the browser, but it only affects the sender's own task.

**Where the checks run (A26, A6):** On the server, which has the time exactly as the user typed it.

**Sorting:** Same as C1.

**Fit with the project's date helpers:** It stores the same type as C1, but adds a dependency or custom conversion code on the server.

### Choices under every option

- **Seconds in a direct request.** If a direct request sends a due date with seconds or milliseconds, the server could cut it to the minute, refuse it, or store it as sent. AC-2.4's "to the minute" doesn't say which.
- **Early checks in the browser.** The form could also check the past and 10-year rules using the device's clock, which gives instant feedback. Near a minute or limit boundary it can disagree with the server (see ADR-F).

### Questions to decide ADR-C

1. Where should the entered time be converted to a moment: in the browser (C1, C2) or on the server (C3)?
2. Should the due date be stored as a `Timestamp`, like the other time fields, or as a fixed-format ISO string?
3. What should happen to seconds or milliseconds in a direct request: cut, refuse or store?
4. Should the browser also check the past and 10-year rules against its own clock?
5. Is a new date library acceptable (C3)?
6. Must the edit view be drawn in the browser so its dates show in the viewer's timezone? Or does the server need to know the viewer's timezone?
7. `formatDatetime` always uses the `en-AU` format. Is that the display format for every viewer? A5 settles the timezone but not the format.

---

## ADR-D: How the task list is queried

### Already settled

These are not options:

- **Paging:** 20 tasks per page, with next and previous (A12, AC-4.7a, AC-4.7b).
- **Live updates:** Changes appear in this tab and the user's other tabs within 3 seconds (A15, AC-4.11a, AC-4.11b). This assumes ADR-B keeps a live connection in the browser (B1 or B3). Under B2, this ADR has to be redone.
- **Order:** Pending tasks come first, then by due date, then by creation time (AC-4.4).
- **Capacity:** The list must work at 1,000 tasks (AC-4.7c).
- **Deleted tasks:** The read rule hides deleted tasks (`docs/SECURITY.md`).

### Facts that apply to every option

- **The live list hook can't change page as it is.** `useCollection()` starts its live connection once for each collection it's given. Changing the query to move to another page doesn't restart it (verified: `useFirestore.ts:52`). Every option needs the hook changed or the list rebuilt for each page.
- **Deploying an index is manual and needs approval.** No indexes are defined yet (`firestore.indexes.json` is empty; verified).
  - `deploy.yml` deploys rules only. Indexes need a manual deploy command (verified: `docs/CI-CD.md`, `deploy.yml`).
  - `firebase deploy` needs explicit approval (verified: CLAUDE.md "Agent Permissions").
- **Every task needs `deletedAt: null` from the start.**
  - The rule helper `notDeleted()` treats a missing deletion time and an empty one the same (verified: `firestore.rules:32-34`).
  - A query can only leave deleted tasks out by matching a stored value. Filtering on `deletedAt == null` doesn't match records that have no `deletedAt` at all (unverified).
  - Firestore refuses a whole list query if any record it could return is one the read rule would block (unverified).
  - So every option stores `deletedAt: null` when a task is created and filters on it.
  - The notes list filters by owner only (verified: `NotesList.tsx`). Whether that still works once a note is deleted is unverified, because the app never deletes notes.
- **Sorting by status.**
  - Stored as the text "pending" or "completed", sorting in descending order puts pending first ("pending" sorts after "completed"; checked in local Node 22.23.2; Firestore's text order is unverified).
  - A true/false `completed` field would sort in ascending order (unverified). It would also change the field that Terms calls "status".

### Option D1: Page by page from a bookmark, with a live connection on the page being viewed

**How it works:**
- The query selects tasks where the owner matches and `deletedAt` is `null`, sorted by status (descending), due date and creation time, 20 at a time.
- The next page starts after the last task on the current page (`startAfter`).
- The previous page uses a saved list of bookmarks, or reads backwards with `endBefore`/`limitToLast` (unverified; not used in the project).

**Paging with live updates (AC-4.11a):**
- Page 1 is always exact.
- A later page starts after the last task of the page before, as it was when the page was opened. If a task on an earlier page changes, that page's boundaries don't move. For example, unticking a completed task on page 2 moves it to page 1, but page 1's last task doesn't move down to page 2. So a later page can show a task that now belongs on another page, or miss one.

**Read cost on the free plan:** About 20 reads to open a page, plus one read for each task that changes while the page is open (unverified billing).

**Pending first (AC-4.4):** Handled in the query, by sorting status in descending order.

**Index and `deletedAt` filter:**
- It needs a composite index across owner, `deletedAt`, status, due date and creation time (exact index unverified).
- It filters on `deletedAt == null`.

### Option D2: One live connection on the first 20 × N tasks; the page shows the last 20 of them

**How it works:** It uses the same query as D1, but with no bookmarks. It loads the first 20 × N tasks and shows the last 20 of them as page N.

**Paging with live updates (AC-4.11a):**
- Every page is exact after any change, because it is worked out again from the start of the list.
- Going back a page just loads fewer tasks.

**Read cost on the free plan:**
- Opening page N reads 20 × N tasks. For example, page 50 of 1,000 tasks is about 1,000 reads (unverified billing). The cost grows with the page number.
- Each change costs one read (unverified).

**Pending first (AC-4.4):** Same as D1.

**Index and `deletedAt` filter:** Same as D1.

### Option D3: One live connection on all the user's non-deleted tasks; the browser sorts them and splits them into pages

**How it works:** The query selects the user's tasks where `deletedAt` is `null`. The browser sorts them by status, due date and creation time, and splits them into pages of 20.

**Paging with live updates (AC-4.11a):** Every page is exact, as in D2.

**Read cost on the free plan:**
- Every time the list loads, it reads every non-deleted task. At the 1,000-task capacity (AC-4.7c), that's 1,000 reads per load. About 50 loads a day would use the free plan's 50,000 daily reads (unverified quota).
- A12 gives a reason for paging: it "keeps each page load to a bounded number of reads". That reason no longer holds. AC-4.7a and AC-4.7b are still met, because only 20 tasks are shown per page.

**Pending first (AC-4.4):** Handled in the browser, so the way status is stored doesn't matter to the query.

**Index and `deletedAt` filter:**
- The query only filters on two exact matches. Whether that needs a composite index is unverified.
- It still filters on `deletedAt == null`.

### Questions to decide ADR-D

1. Must pages after the first be exact after every change (D2, D3)? Or may their boundaries be out of date until the user changes page (D1)? This depends on how strictly AC-4.11a and AC-4.11b are read.
2. What read cost per list load is acceptable on the free plan, both at a typical number of tasks and at 1,000?
3. Is A12's reason, bounded reads, a requirement? Or is showing 20 per page (AC-4.7a, AC-4.7b) all that's required?
4. Should status be stored as the text "pending" or "completed", or some other way?
5. Who deploys the composite index, given that deploying it is manual and needs approval?
6. Do you confirm storing `deletedAt: null` on every new task? Every option needs it, if the unverified behaviour of the query holds.

---

## ADR-E: How changes are written

### Already settled

These are not options:

- **What an edit can include (SCR-5 answer):** An edit may include only title, description and due date. Any edit that includes status is refused, even if the status is unchanged.
- **How status changes:** Status changes only through a toggle (AC-5.3).
- **What changes get written:** An edit changes only the fields the user changed, and a toggle changes only the status (A28).
- **Overlapping edits:** They merge field by field. The one the server receives last sets every field it changed, and no conflict warning is shown (A18, AC-5.5).
- **Deleted tasks:** Editing, toggling or deleting a deleted task is refused, and the stored record doesn't change (AC-7.4).
- **Past due dates:** An edit that leaves a past due date unchanged is accepted (AC-2.6c).
- **Where writes go:** All writes go through the server under every ADR-B option.

### Facts that apply to every option

- **The documented form sends every field.** DESIGN.md's form pattern, and the notes form, submit every field in the form (verified: `docs/DESIGN.md` "Forms", `CreateNoteForm.tsx`). The form library, `react-hook-form`, can report which fields were edited (`dirtyFields`; unverified, not used in the project).
- **Changes must be judged against what the form loaded.** Suppose another tab changes the description after this form loaded. If the server compares the submitted form with the stored task, this form's old description looks like a change and overwrites the other edit, which breaks A18. So "changed fields" has to be judged against what the form loaded, not against what is stored now.
- **Transactions would be new to the project.** A transaction makes the read, the check and the write happen as one step. No project code uses one (verified: no `runTransaction` in `frontend/src` or `backend/src`). Unit tests mock Firebase Admin (verified: `docs/TESTING.md`).
- **Without a transaction, AC-7.4 can fail.** An edit that reads the task just before it's deleted, and writes just after, changes a deleted task. The risk exists only in the time between the read and the write.
- **"Set status" and "flip status" behave differently on an out-of-date screen.** A flip sent from an out-of-date screen (the task was already completed in another tab) unticks the task, which is the opposite of what the user clicked (AC-6.1, AC-6.2). Sending "set to completed" twice does no harm.

### Option E1: The browser sends only the changed fields; each action runs in a transaction

**How it works:**
- There are separate actions for edit, set status and delete.
- The edit form sends only the fields the user changed.
- Each action, inside a transaction:
  1. Reads the task.
  2. Checks the owner, and that the task isn't deleted.
  3. Checks the due-date rules, if the due date changed.
  4. Writes the fields it was sent, plus the last-updated time.

**Data integrity (AC-7.4, overlapping edits and deletes):** The check and the write happen together, so a delete can't slip in between. How Admin SDK transactions retry when two writes compete is unverified.

**Sending only changed fields (A28):** Yes. The browser works out which fields changed, so A18's field-by-field merge holds.

**Keeping the toggle separate from the edit (AC-5.3):** Yes. Toggling has its own action, and the edit's schema has no status.

**Complexity:**
- Transactions are new to the project.
- Tests need a mocked transaction (how well the mocks handle this is unverified).
- The form has to track which fields changed.

### Option E2: The browser sends only the changed fields; each action reads, then writes, with no transaction

**How it works:** The actions are the same as in E1. Each one reads the task, checks it, then updates the fields it was sent.

**Data integrity (AC-7.4, overlapping edits and deletes):**
- An edit that overlaps a delete can change a deleted task, which breaks AC-7.4 in that case.
- The owner check isn't affected, because a task's owner never changes (AC-1.4b).

**Sending only changed fields (A28):** Yes, as in E1.

**Keeping the toggle separate from the edit (AC-5.3):** Yes, as in E1.

**Complexity:** There is no transaction. It matches the notes action, which does a single write (verified: `notes.actions.ts`). The form still has to track which fields changed.

### Option E3: The browser sends the whole form plus the values it loaded; the server works out the changes inside a transaction

**How it works:** The form sends its current values and the values it started with. The server compares them to find the changed fields, then carries on as in E1.

**Data integrity (AC-7.4, overlapping edits and deletes):** Same as E1.

**Sending only changed fields (A28):** Yes. The server works out the changes from the values the form loaded, not from what is stored now.

**Keeping the toggle separate from the edit (AC-5.3):** Yes, as in E1.

**Complexity:**
- The form keeps the documented pattern, so it doesn't need to track changes.
- Each request is about twice the size, and the server must validate both sets of values.
- A direct request also has to send the loaded values. The spec doesn't say what a request without them means.

### Questions to decide ADR-E

1. Must AC-7.4 hold strictly (E1, E3)? Or is it acceptable that, for the brief moment between reading and writing, an edit could change a task that was just deleted (E2)?
2. Who works out which fields changed: the browser (E1, E2) or the server, from the values the form loaded (E3)?
3. Should the toggle send "set to completed/pending" or "flip"?
4. Is adding transactions, which are new to the project, worth the extra code and testing?
5. Under E3, what happens to a direct request that doesn't include the loaded values?
6. What happens to an edit with no changed fields? It could be accepted with a new last-updated time, accepted with nothing written, or refused. AC-8.7b says every successful edit updates the last-updated time, but not whether an edit with no changes counts as successful.

---

## ADR-F: How errors reach the user

### Already settled

These are not options:

- **What error messages must not show (AC-8.5):** No stack traces, paths, database or library text, or server names. The database's own permission-denied response to a direct request is allowed.
- **Field errors (AC-2.8, A36):** Each invalid field shows an error beside it that states the rule and its limit.
- **Failure messages (AC-8.1a):** A failure shows an error message and no success message.
- **Notifications:** Use the `sonner` library for notifications (`docs/DESIGN.md` "Notifications").
- **Sign-in redirects (SCR-1 answer):** A Server Action's redirect to sign-in counts as refusing.

### Facts that apply to every option

- **Every action shares one result type.** It has three fields: `success`, `error?` and `data?` (`ActionResult`; verified: `types/index.ts:5-9`). The notes and sign-in actions use it (verified).
- **The documented pattern passes library text through.** It returns `parsed.error.errors[0]?.message` (verified: `notes.actions.ts:19`, frontend/CLAUDE.md). That is Zod's own default text unless a custom message is given, and only the first error is returned.
- **The documented error display shows raw database text.** DESIGN.md's error state displays `error.message` (verified). `useCollection()` passes Firestore's raw error through (verified: `useFirestore.ts:45-47`). The notes list doesn't show errors at all (verified: `NotesList.tsx`).
- **Some field failures only show up on the server.** The past-date and 10-year checks use the server's clock (A26, A6), so they can pass in the browser and fail on the server. Every other field rule can run the same way in both places if the Zod schema is shared.
- **The form library can mark a field as invalid from code.** In `react-hook-form` this is `setError` (unverified; not used in the project).
- **Two things are needed whichever option is chosen:**
  - A custom message on every Zod check (A36).
  - Fixed wording for database failures and for errors from the live list hook.
  The options differ only in how a failure found on the server reaches the right field.

### Option F1: Add an optional map of field errors to the shared `ActionResult` type

**How it works:**
- A new optional `fieldErrors` field maps each field name to its message.
- Task actions fill it from Zod's results and from the server-clock checks. Forms show each message beside its field.
- `error` keeps a general message for the pop-up notification.

**Keeping database and library text out (AC-8.5):**
- Messages come from the app's own Zod messages, and database failures are replaced with fixed wording.
- Any check that is missing a custom message would still let Zod's default text through.

**Showing server-side failures beside the right field (AC-2.8):** Every failing field can be reported in one response.

**Rule-and-limit wording (A36):** The wording lives in the Zod schemas. The browser and server show the same wording if they share the schema.

**Changes to `ActionResult`:**
- The field is new and optional, so existing actions don't change (verified: the notes and sign-in actions use only `success`, `error` and `data`).
- Every future action can use it.
- The Codebase Map in CLAUDE.md lists `ActionResult`, so it has to be updated in the same change (verified: CLAUDE.md "Harness integrity").

### Option F2: Keep `ActionResult`; tasks use their own result type that names one failing field

**How it works:** The tasks feature adds its own result type in its types file, for example `features/tasks/types.ts` (verified: the folder layout in frontend/CLAUDE.md "File Organization"). It extends `ActionResult` with a single `field?: 'title' | 'description' | 'dueDate'`.

**Keeping database and library text out (AC-8.5):** Same as F1.

**Showing server-side failures beside the right field (AC-2.8):**
- One field is reported per response, which matches the documented first-error pattern.
- Through the interface, the browser catches every other field rule first. The only failures found only on the server are due-date checks, so one field may be enough.
- A direct request gets one error at a time.

**Rule-and-limit wording (A36):** Same as F1.

**Changes to `ActionResult`:** None. Tasks return a different shape from other features.

### Option F3: Actions return error codes, and the browser turns codes into messages

**How it works:** Actions return a code and a field, for example `{ code: 'DUE_DATE_PAST', field: 'dueDate' }`. One table in the browser holds the rule-and-limit wording for every code.

**Keeping database and library text out (AC-8.5):**
- The server never sends readable text, so library text can't reach the user through an action.
- Direct requests get the app's own codes. AC-8.5 rules out codes from the database or a library, not from the app.

**Showing server-side failures beside the right field (AC-2.8):** Each failure comes with its field, and one response can report one or several.

**Rule-and-limit wording (A36):**
- The wording lives in one table, which has to stay in step with the limits in the schema (for example, 200 characters).
- The form's own checks in the browser also have to produce codes, or have their own wording.

**Changes to `ActionResult`:**
- It needs a code and a field, added either to the shared type or to a tasks-only type.
- Either way, it departs from the plain `error?: string` that other features use.

### Questions to decide ADR-F

1. Should the shared `ActionResult` type change (F1, and possibly F3)? Or stay as it is, with a tasks-only type (F2)?
2. Must one server response be able to report several failing fields, or is one enough?
3. Where should the rule-and-limit wording live: in the Zod schemas (F1, F2) or in a table of messages (F3)?
4. Should the browser and server share one Zod schema for tasks? The notes feature defines two separate ones (verified: `notes.actions.ts` and `CreateNoteForm.tsx`).
5. What fixed message is shown when the live list fails to load (AC-4.10b)?
6. Should direct requests receive readable messages or codes?
