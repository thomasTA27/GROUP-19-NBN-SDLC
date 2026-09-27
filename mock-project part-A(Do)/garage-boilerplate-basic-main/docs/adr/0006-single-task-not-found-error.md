# ADR-0006: One "Task not found." error for every failed task lookup

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (A37, AC17)
```

## Context

`updateTask`, `setTaskStatus` and `deleteTask` can fail to find a usable task for four reasons:

- the ID is invalid;
- the task does not exist;
- the task belongs to another user;
- the task is already deleted.

The backend distinguishes these cases with `HttpError.notFound` and `HttpError.forbidden`. Server Actions have no convention for this.

## Decision

All four cases return the same result: `{ success: false, error: 'Task not found.' }`.

The decider gave two reasons:

- it keeps the implementation simpler;
- it does not tell a caller whether another user's task exists.

## Rationale: options rejected

- **A different message for each case.** This would be easier to debug, but a caller could then find out which task IDs exist and who owns them.

## Consequences

- Debugging which of the four cases happened has to rely on server-side logs, not on the error message.
- The UI handles all four cases the same way: an error toast, and the form or confirmation closes (A37).
- This decision touches authorisation, so a second, security-aware reviewer must review it before it moves to Accepted.
