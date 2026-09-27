# ADR-0002: Task writes go through Server Actions; the browser only reads, live

```
Status: Proposed
Decided-by: Sajad Ali Akbari (developer), decisions drafted by an AI assistant acting for him
Drafted-with: Claude Code:claude-opus-5-5
Security review: required
```

## Context

**Sources:**
- Step 2 decision ADR-B, in `design-and-context-engineering/design-notes.md` and `step2-options.md`
- `task-crud-spec.md`, as amended by SCR-1 to SCR-18

**How claims are marked:** as in `step2-options.md`.

**What the spec requires:**
- **Access:**
  - Users reach only their own tasks (AC-1.2, AC-1.3).
  - Admins get no access to other users' tasks (R1, AC-1.5). This must hold for an admin with the `role` field, with the custom claim, and with both (SCR-2).
- **Validation:**
  - Every field rule holds on direct requests (AC-2.9).
  - Titles are trimmed on every route (AC-2.2c).
  - Any request that includes a system field is refused (A31, AC-2.10b, SCR-6).
- **Live updates:** The list updates live across tabs and devices (A15, AC-4.11a, AC-4.11b).
- **Timestamps:**
  - Stored times must be within 5 seconds of the user's action (AC-8.7a, AC-8.7b, A34).
  - "Past" is judged by the server's clock (A26).
- **Refusals (SCR-1):** A Server Action's redirect to sign-in counts as refused. Requests to any other route must get an error.

**Already settled before the options:**
- **The browser can't write tasks directly.**
  - Trimming (AC-2.2c) can't happen in security rules, which can only accept or refuse a write (unverified).
  - A task created from the browser would have to carry system fields, which SCR-6 refuses.
- **There is no Express backend,** because Cloud Functions need the Blaze plan (verified: `docs/ARCHITECTURE.md`, `docs/CI-CD.md`).

## Decision

Option B1, the notes pattern:
- **Writes:** Every write goes through Server Actions: `requireAuth()`, a strict Zod schema, an owner check, then the Admin SDK.
- **Reads:** The list and the edit view read live in the browser through `useCollection()`. The security rules allow owner-only reads of non-deleted tasks and refuse every write from the browser.
- **Admins:** Neither the rules nor the actions use `isAdmin()` or `hasCustomClaim()`.
- **Timestamps:** They come from the Vercel server's clock (`Timestamp.now()`), as in the notes feature (verified: `notes.actions.ts:25`).

## Rationale

**Why B1** (`design-notes.md`): "Live updates across tabs (A15) are a confirmed requirement". For timestamps, "using the same clock as the past-date check (A26) avoids two clocks."

### Rejected options

**B2: reads and writes both go through the server; the browser has no access to tasks**

*The option, stated fairly:*
- There's only one route to guard, so admins are excluded in one place.
- Reading on the server fits "Server Components by default" (CLAUDE.md).
- Against it: the server doesn't push changes. To show other tabs' changes within 3 seconds, each open tab would have to ask again about every 3 seconds.

*Reason in `design-notes.md`:*
- "Live updates across tabs (A15) are a confirmed requirement, and B2 would use the free read quota within hours."
- The free read-quota figure behind this is unverified (see `step2-options.md`).

**B3: writes through new Next.js API routes that check the sign-in token; reads as in B1**

*The option, stated fairly:*
- Direct requests get a proper HTTP error (400, 401 or 403) rather than a redirect.
- Live reads work as in B1.

*Reason in `design-notes.md`:*
- "B3 adds API routes the project calls non-preferred and leaves up to an hour after revocation."
- The one-hour gap: sign-in tokens stay valid for up to 1 hour after a session is revoked (verified: `docs/SECURITY.md`). Whether `verifyIdToken` can check for revocation depends on an option that is unverified.

**Timestamp choice (ii): Firestore's own server timestamp**

*The option, stated fairly:*
- Stored times come from the database's clock, not the web server's.
- The browser version, `serverTimestamp()`, is used in `AuthProvider.tsx:34` (verified). The Admin SDK version isn't used anywhere in the project (unverified).

*Reason in `design-notes.md`:*
- "For timestamps, using the same clock as the past-date check (A26) avoids two clocks."
- The first view had picked server timestamps. "The options showed that would mean two clocks, so I switched to the Vercel server clock."

## Consequences

**Two routes to guard:**
- Security rules guard reads, and action code guards writes. Admins have to be excluded separately on each.
- The project's docs treat the Admin SDK route as guarded by `requireAuth()`, not by rules (verified: `docs/ARCHITECTURE.md`). This ADR doesn't verify that the Admin SDK ignores rules.

**Rules:** The task rules differ from the notes rules, which let the browser create and update notes (verified: `firestore.rules:64-70`).

**How refusals look:**
- A direct write to Firestore gets the database's own permission-denied response, which A39 and AC-8.5 allow.
- A Server Action called without valid credentials redirects to sign-in, which SCR-1 accepts.

**Timestamps:** They depend on the Vercel server's clock being within AC-8.7a/b's 5-second tolerance (unverified).

**The edit view:** `useCollection()` takes a collection plus query constraints (verified: `useFirestore.ts:25-28`). So reading one task live in the edit view needs a query that selects that task, or a new hook for a single document.

**Security review:** Required, for authorisation on both routes.
