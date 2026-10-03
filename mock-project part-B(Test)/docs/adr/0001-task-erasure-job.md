# ADR-0001: Erase expired deleted tasks with a daily Vercel scheduled job

```
Status: Proposed
Decided-by: Sajad Ali Akbari (developer), decisions drafted by an AI assistant acting for him
Drafted-with: Claude Code:claude-opus-5-5
Security review: required
```

## Context

**Sources:**
- Step 2 decision ADR-A, in `design-and-context-engineering/design-notes.md` and `step2-options.md`
- `task-crud-spec.md`, as amended by SCR-1 to SCR-18

**How claims are marked:** as in `step2-options.md`. Four platform claims were checked against official docs on 2026-09-27 and are marked as verified.

**What the spec requires:**
- Deleted tasks are kept for 30 days as a record only, then erased automatically (R6).
- A record is erased no earlier than 720 hours and no later than 792 hours after its deletion time (A21 and AC-7.7, widened by SCR-18).
- The erasure never touches a task that isn't deleted (AC-7.8).
- No user can erase a task (AC-7.3).
- The erasure needs no paid plan or billing account (D5).
- Testers need a way to run it on demand (P6).
- The exception to "Soft-delete only" has to be recorded (D4).

**Ruled out by D5 before any options were drawn up:**
- Scheduled Cloud Functions, because Cloud Functions need the Blaze plan (verified: `docs/ARCHITECTURE.md`, `docs/CI-CD.md`).
- Firestore's automatic expiry (TTL), because TTL deletes need billing enabled (verified: Firebase docs, checked 2026-09-27).

**Facts that apply to every option:**
- **The admin key is already in two places.** The Firestore admin key, `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`, is already in Vercel's environment and in GitHub Actions secrets (verified: `docs/CI-CD.md`).
- **GitHub Actions uses it only to deploy rules.** In Actions, only `deploy.yml` uses it (verified: `.github/workflows/deploy.yml`).
- **The job has no signed-in user.** CLAUDE.md "Firestore" requires `requireAuth()` before any Firestore operation (verified), but a scheduled job has no signed-in user to check.

## Decision

Option A1:
- A Vercel scheduled job, once a day, calls a new route, `app/api/cron/erase-deleted-tasks`.
- The route refuses any request that doesn't carry the cron secret.
- It uses `adminDb` from `@/lib/firebase/admin`.
- It erases, in batches, only tasks whose `deletedAt` is more than 720 hours old.
- It can also be called by hand with the secret, which covers P6.
- No alert is added for failed runs in this ticket.
- The exception to "Soft-delete only" is recorded in `docs/SECURITY.md` and `docs/FIRESTORE-SCHEMA.md` (D4).

**Platform behaviour this relies on:**
- **How the secret arrives.** Vercel sends `CRON_SECRET` as `Authorization: Bearer <secret>` (verified: Vercel docs, checked 2026-09-27).
- **How often the job runs.** On the Hobby plan, a scheduled job runs at most once a day, anywhere within the hour (verified: Vercel docs, checked 2026-09-27).
- **What happens on failure.** Vercel doesn't retry a failed run, and delivery is best effort, so the job must be idempotent (verified: Vercel docs, checked 2026-09-27).
  - The design already makes a repeat run harmless: it erases only records past 720 hours, and "running it twice does no harm" (`design-notes.md`).
- **Nothing sits in front of the route.** `proxy.ts` doesn't cover `/api/` routes (verified: `frontend/src/proxy.ts`).
- **The schedule needs a new file.** It needs a new `vercel.json`, because none exists (verified).

## Rationale

**Why A1** (`design-notes.md`):
- "It keeps the admin key where it already is (Vercel), needs no workflow change, and reuses the documented admin entry point."
- "The route has no signed-in user, so the secret is its only guard; that is accepted and goes to the security reviewer."
- "The weak point is reliability: one failed daily run can push a record past 768 hours. So this goes back to the Gate 1 owner as SCR-18, asking to widen A21 to 72 hours so one missed run is tolerated."
  - SCR-18 has since been answered and applied.

### Rejected options

**A2: a scheduled GitHub Actions workflow runs an erasure script**

*The option, stated fairly:*
- There's no public endpoint to attack.
- The schedule can run more often than once a day (unverified), which leaves room for failed runs.
- The workflow can be started by hand with `workflow_dispatch`, which `deploy.yml` already uses (verified).
- Against it: the script needs its own `firebase-admin` setup, which adds a third admin entry point. Changing workflow files also needs explicit approval (verified: CLAUDE.md "Agent Permissions").

*Reason in `design-notes.md`:*
- "Not GitHub Actions, because that would put the production admin key in Actions for writing live data, and changing workflow files needs approval."
- A1 "keeps the admin key where it already is (Vercel), needs no workflow change".

**A3: a scheduled GitHub Actions workflow calls the Vercel route**

*The option, stated fairly:*
- The admin key stays in Vercel only. Actions holds only the route secret.
- It can run more often than once a day (unverified), which A1 can't.
- Against it: it needs both A1's new route and a new workflow, and both GitHub and Vercel must be working for a run to succeed.

*Reason in `design-notes.md`:*
- A1 "needs no workflow change", and "changing workflow files needs approval".
- The notes' admin-key reason doesn't apply to A3, because A3 keeps the key in Vercel.

## Consequences

**Security:**
- The route is a public URL, and the secret is its only guard. It performs a data operation without `requireAuth()`, which departs from CLAUDE.md "Firestore" (verified). The security reviewer has to accept this.
- If the secret check ever fails open, anyone could trigger runs. The harm is limited to extra runs against the free quota, not early erasure, because only records past 720 hours are erased.

**Reliability:**
- There is one run a day, anywhere within the hour, with no retry (verified). So there can be almost 25 hours between runs.
- The 72-hour window tolerates one missed run. Two missed runs in a row can push a record past 792 hours.
- No alert is added, so failed runs aren't reported.

**Capacity:**
- The Hobby plan limits how long a function can run (unverified), which caps how many records one run can erase.
- Firestore's free daily delete quota applies (unverified).

**New pieces:**
- A new `vercel.json`.
- A second route handler beside `api/auth/session`, the only route listed in frontend/CLAUDE.md "File Organization" (verified).
- A new secret, which has to be added through `/add-env-var` (verified: CLAUDE.md "Environment Variables").

**Deployment:** The job ships with the frontend, which deploys on every push to `main` (verified: `docs/CI-CD.md`).

**Documentation:** `docs/SECURITY.md` and `docs/FIRESTORE-SCHEMA.md` have to record the exception to "Soft-delete only" (D4).

**Implementation note (2026-10-03):** The route is `frontend/src/app/api/cron/erase-deleted-tasks/route.ts`, and `frontend/vercel.json` defines the daily schedule at 16:00 UTC (`0 16 * * *`). The route fails closed when `CRON_SECRET` is unset, shorter than 16 characters or has a character other than ASCII letters (A-Z, a-z), digits and - _ . ~. It re-checks each document's `deletedAt` in code before every delete, and it uses a 5 minute clock skew margin on the 720 hour cutoff. It pages through the results and stops after a time budget, so a large backlog finishes over several daily runs. There is no HEAD or method guard beyond the secret. The exception to rules 2 and 3, and to the last sentence of rule 1, of `.claude/rules/tasks.md` is recorded in the route's header comment. Nothing is deployed by the pull request that adds it. These points are still unverified: how Firestore range filters treat null (the in-code re-check covers it), `startAfter` on a deleted snapshot, the Hobby function time limit, whether Vercel sends GET requests and runs crons on preview deployments, and the `deletedAt` single-field index (`firebase/firestore.indexes.json` has no field override or exemption touching `deletedAt`, but the automatic index has not been checked on a live project).
