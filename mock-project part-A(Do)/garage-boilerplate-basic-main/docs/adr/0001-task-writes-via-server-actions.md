# ADR-0001: All task writes go through Server Actions; rules deny every client write

```
Status: Proposed
Decided-by: William Lor (dev)
Drafted-with: Claude Code:claude-opus-5-5
Date: 2026-09-27
Spec: task-crud-spec.md (D1, A24, AC2, AC17, Security rules)
```

## Context

The `notes` template in `firebase/firestore.rules` lets an owner create and update their own documents from the client SDK. It uses a `hasOnly` field allowlist to do so. The tasks spec needs four writes: create, edit, status change and soft delete.

D1 already says that creates go through a Server Action. Letting clients write directly would allow them to skip Zod validation. It would also let them clear `deletedAt` to restore a task, or write a `status` other than `pending` or `completed`.

## Decision

The `tasks` rules are `allow create, update, delete: if false`. Every write goes through `createTask`, `updateTask`, `setTaskStatus` or `deleteTask`, which use the Admin SDK. Validation lives only in the shared Zod schemas.

## Rationale: options rejected

- **Owner client writes guarded by rules (the `notes` pattern).** This would repeat title, description, date and status validation in the rules language, and the two copies would drift apart. It also conflicts with D1. The rules would additionally have to stop clients clearing `deletedAt`, which the current `notes` rule allows.
- **Hybrid: Server Actions for create, edit and delete, plus a client update for `status` only.** This gives two write paths to reason about and test. The toggle needs to feel instant but does not need to work offline, and an optimistic UI gives that (ADR-0005).

## Consequences

- Rules protect only the client-SDK path. The Admin SDK bypasses them, so the Server Action code is the only guard on server writes. The decider judged that a second layer is not needed at this project's scope. ADR-0002 (one shared ownership check), the Server Action unit tests and the `security-reviewer` pass cover this.
- This departs from the `notes` template and from the `hasOnly` allowlist in spec convention C5. It has been raised with Planning as SCR-2.
- Task writes cannot be made offline.
- The `/firebase-collection` skill's owner-only rules template still opens client `create` and `update`. That is correct for collections like `notes`, but it contradicts this decision. Whoever implements tasks must not copy the skill's write rules for `tasks`, and must follow `.claude/rules/tasks.md` instead. The skill's hard-delete rule was corrected to soft delete during Design, but no Server-Action-only variant was added.
- This decision touches authorisation. Under the governance touchpoint, it needs a second, security-aware reviewer before it moves to Accepted.
