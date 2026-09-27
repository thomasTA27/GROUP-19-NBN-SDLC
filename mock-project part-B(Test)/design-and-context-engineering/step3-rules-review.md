# Step 3 review: from the draft rules to `.claude/rules/tasks.md`

Reviewed on 2026-09-27 by an AI assistant acting for Sajad Ali Akbari, against the module's rules of thumb. Source: `step3-rules-draft.md`.

## What changed from the draft

| Draft rule | Kept? | Change and why |
|---|---|---|
| 1 (browser writes, admin helpers, Server Actions) | Kept, narrowed | Cut the second sentence describing how a Server Action works, because `frontend/CLAUDE.md` already says it and an agent can infer it. Kept the admin part, because nothing in the code says tasks must exclude admins. |
| 2 (`deletedAt: null`) | Kept | Replaced the reason with the verified one: security rules are not filters. |
| 3 (transaction, no status in edits, set not flip) | Kept, narrowed | Kept only the transaction behaviour, so the rule has one checkable behaviour. "No status in an edit" is enforced by the strict schema and its tests (SCR-5, D2a). "Set, not flip" is visible in the action's signature. |
| 4 (no server-side date formatting) | Kept, reworded | Says what to do instead (pass the Timestamp to a Client Component). The clash with frontend/CLAUDE.md's "never add 'use client' to files that only fetch data and render HTML" is accepted: the due date is a documented exception from ADR-0003, and the list and edit view need `'use client'` anyway. |
| 5 (errors) | Kept, narrowed | Cut "never add fields to the shared ActionResult", because the tasks result type is visible in the code and a changed shared type would show up in review. |

## Rules of thumb check

| Rule of thumb | Result |
|---|---|
| Only what the agent couldn't infer from the code | Yes. Each rule goes against a nearby precedent (see the draft's "Why each rule is needed"). |
| Lead with what never to do | Yes, all five start with "Never". |
| One checkable behaviour per rule | Mostly. Rule 1 still covers three related things in `firestore.rules` and the client SDK; they can be checked against the same diff. |
| Scoped with paths, short | Yes. Three paths, five rules. |
| No duplicates or contradictions | Four clashes with existing files, see below. |
| Each rule points to its ADR | Yes. |

## Left out on purpose

- ADR-0001 (erasure job): the route's own code shows the secret check and the 720-hour filter.
- ADR-0004's reason for not using cursors: the strongest candidate left out. The query code shows `limit(20 * N)` but not why. Recorded here, and in ADR-0004, instead of using a sixth rule.

## Clashes with existing context files, and what happens to each

| Clash | Decision |
|---|---|
| The `/firebase-collection` skill template allows hard delete and has no `notDeleted()` (step 1 item 3) | Fix the skill's template to match `docs/SECURITY.md` in this design PR. It's wrong for every future feature, not just tasks. |
| DESIGN.md "Forms" and the frontend/CLAUDE.md Server Action example (submit every field, no transaction) | Leave as they are. They are examples, not rules, and the tasks rule is scoped to tasks files. |
| frontend/CLAUDE.md "never add 'use client'" vs rule 4 | Accepted as a documented exception (ADR-0003). |
| DESIGN.md error state and the Server Action example show library text | Leave as they are for other features. Rule 5 overrides them for tasks only. Raised as a follow-up: the project-wide examples break AC-8.5-style rules for any feature. |

The module's own rule-conflict prompt is still run next, as written, to see what it finds on its own.
