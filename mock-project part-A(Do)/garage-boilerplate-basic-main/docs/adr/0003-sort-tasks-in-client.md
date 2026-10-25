# ADR-0003: Sort the task list in the client

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (A3, AC6, AC11, List query)
```

## Context

A3 fixes the list order:

- by due date, earliest first;
- tasks with the same due date by `createdAt`, oldest first;
- tasks with no due date (`dueDate: null`) last, also by `createdAt`.

The list is loaded with `useCollection()`, using equality filters on `uid` and `deletedAt`. The repo has no convention for sorting either way.

## Decision

The query only filters. A sort helper in the tasks feature, covered by unit tests, sorts the results in the client.

## Rationale: options rejected

- **Firestore `orderBy('dueDate')`.** Firestore orders `null` before strings, so tasks with no due date would come first, not last. Combined with the two equality filters, it would probably also need a composite index.
- **Store a far-future placeholder date in place of `null`, so `orderBy` works.** This puts a fake value in the data and contradicts D4, which says the due date is optional and stored as `null`.

*Note: the decider picked client-side sorting straight away. These rejected options were drafted with the ADR, not presented beforehand as a separate set of options.*

## Consequences

- Every active task the user has is loaded and then sorted. This is fine at this project's scale, because A19 sets no limit and there is no pagination. The decision would need revisiting if pagination were added.
- The order has to be tested through the sort helper's unit tests, not the query.
