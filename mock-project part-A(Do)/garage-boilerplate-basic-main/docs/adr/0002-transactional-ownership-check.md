# ADR-0002: Ownership and not-deleted checks run in a transaction, through one shared helper

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (AC17, A37, Implementation constraints)
```

## Context

ADR-0001 sends every write through the Admin SDK, and the Admin SDK bypasses security rules. So `updateTask`, `setTaskStatus` and `deleteTask` have to check for themselves that:

- the task exists,
- it belongs to the session user, and
- it has not been deleted.

A task can also be deleted in another tab between that check and the write. The existing Server Action example in `frontend/CLAUDE.md` has no ownership check and no transaction, and `runTransaction` is not used anywhere in the repo.

## Decision

`updateTask`, `setTaskStatus` and `deleteTask` do their read, check and write inside `adminDb.runTransaction()`. The check lives in **one shared helper** in the tasks feature, for example `getOwnedActiveTask(tx, taskId, uid)`. The helper returns the task only if it exists, its `uid` matches the session and its `deletedAt` is `null`. Otherwise the action returns "Task not found." (ADR-0006).

## Rationale: options rejected

- **A plain read, check, then `update()`, with no transaction.** This is the simplest option, but it leaves a race: a task deleted in one tab can still be edited or toggled from another. The decider treats that as a data-integrity bug.
- **Read, check, then a conditional write with a `lastUpdateTime` precondition.** This would fail on *any* concurrent change, which breaks the last-write-wins behaviour for edits in A33. Whether the SDK supports this API was not verified in this run.
- **Checks written inline in each action.** This would give three copies of the most security-critical code, and they would drift.

## Consequences

- This is a new pattern in the repo, with no existing example to copy. Reviewers and the `security-reviewer` agent should focus on the helper.
- Transactions retry when there is contention. Unit tests have to mock `runTransaction`.
- Each change to an existing task costs one extra document read.
- This decision touches authorisation, so it needs a second, security-aware reviewer before it moves to Accepted.
