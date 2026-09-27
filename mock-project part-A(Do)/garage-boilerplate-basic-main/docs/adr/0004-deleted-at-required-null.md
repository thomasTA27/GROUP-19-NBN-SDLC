# ADR-0004: Every task stores `deletedAt`, as `null` until it is soft-deleted

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (Data model, Security rules, D10, A39)
```

## Context

The root `CLAUDE.md` says to "add `deletedAt: Timestamp`" when a document is deleted. The `notDeleted()` rule helper treats a missing `deletedAt` the same as `null`. The task read rule uses `notDeleted()`.

Rules are not filters. A client query is denied unless its own filters prove that every result passes the rule.

## Decision

`createTask` always writes `deletedAt: null`. The field only ever changes once, from `null` to a server `Timestamp`, when `deleteTask` runs. The list query filters `where('deletedAt', '==', null)`.

## Rationale: options rejected

- **Leave `deletedAt` out until delete, as `notDeleted()` allows.** Firestore cannot query for a missing field. Without a `deletedAt` filter, the list query could return deleted tasks, so the rules would deny the whole query.

## Consequences

- The `Task` type has `deletedAt: Timestamp | null`, and the field is always present.
- Any `tasks` document created without `deletedAt` would never appear in the list. A39 assumes no such documents exist. If any do, adding the field has to go through `/evolve-schema` instead.
- This tightens the project's soft-delete convention for this collection only.
