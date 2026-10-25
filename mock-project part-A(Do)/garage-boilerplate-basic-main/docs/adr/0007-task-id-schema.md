# ADR-0007: A tasks-only `taskIdSchema` that rejects `/`

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (AC17, A37, Implementation constraints)
```

## Context

`taskId` comes from the client and is passed to `adminDb.collection('tasks').doc(taskId)`. Because `doc()` treats `/` as a path separator, a value such as `abc/comments/xyz` would point at a document in a subcollection, not at a task.

The shared `idSchema` in `frontend/src/lib/validations/common.ts` is only `z.string().min(1)`. It does not reject `/`, and nothing in `frontend/src` uses it yet.

## Decision

The tasks feature gets its own `taskIdSchema`. It builds on `idSchema` and adds a rule that rejects any value containing `/`. It lives in the tasks feature folder, and the shared `idSchema` is left unchanged. When the check fails, the action returns "Task not found." (ADR-0006).

## Rationale: options rejected

- **Add the `/` rule to `idSchema` itself.** Every future feature would get the rule automatically. But it changes shared code inside a feature ticket, and it means updating the Codebase Map in the root `CLAUDE.md` in the same change. The decider chose to keep this flexible.
- **Rely on the ownership check (ADR-0002) instead.** This would drop the "containing `/`" case from AC17, which would need a spec change request.

## Consequences

- Other features that take a document ID from the client need to add the same rule themselves.
- If a second feature needs this rule, it can be moved into `idSchema` later without changing how tasks behave.
- This decision touches authorisation, so it needs a second, security-aware reviewer before it is accepted.
