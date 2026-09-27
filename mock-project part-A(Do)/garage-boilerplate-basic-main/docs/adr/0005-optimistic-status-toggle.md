# ADR-0005: Optimistic status toggle that sends a target status

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (D11, A41, A42, A44, AC18, AC19)
Depends on: SCR-4 (resolution a)
```

## Context

The task list has a checkbox on each task that toggles it between pending and completed. The toggle should feel instant; it does not need to work offline.

`DESIGN.md` covers loading, empty and error states, but it has no pattern for optimistic updates. The spec disables the checkbox while a save is in progress (A42). It also keeps keyboard focus on the checkbox (AC18). A native `disabled` input probably cannot keep focus, so this is raised as SCR-4. That browser behaviour was not verified in this run.

## Decision

- `setTaskStatus(taskId, status)` takes the **target** status, `'pending'` or `'completed'`, not an instruction to flip. If the task already has that status, it returns success and writes nothing.
- The row shows the requested status straight away, using `useOptimistic` or local state. If the save fails, it goes back to the stored status from `useCollection()` and shows the failure toast.
- While a save is in progress, the checkbox is blocked with `aria-disabled="true"` and the click handler ignores clicks. Native `disabled` is not used, so focus stays on the checkbox. This follows the resolution proposed in SCR-4.

## Rationale: options rejected

- **Wait for the server before changing the checkbox.** This is simpler, but the checkbox would lag behind the click, and the decider wants the change to be instant.
- **A "flip" instruction instead of a target status.** A repeated or stale request would flip the task back by mistake.
- **Native `disabled` while saving.** It would probably lose keyboard focus, which conflicts with AC18.

## Consequences

- This adds optimistic-update code and needs tests for both the success and revert paths.
- A double click still results in only one write, because clicks are ignored while a save is pending (AC19).
- If Planning rejects SCR-4 resolution (a), this ADR has to be revised before it moves to Accepted.
