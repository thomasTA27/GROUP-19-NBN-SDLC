# Task CRUD: spec change requests from Design

Raised by: William Lor (dev), Design stage, 2026-09-27.
For: the Gate 1 owner of `task-crud-spec.md`.

Design does not edit the spec. Each item below needs a decision from Planning.

| SCR | Status | Conflict (both sides quoted) | Proposed resolution | Blocks |
|---|---|---|---|---|
| SCR-1 | **Withdrawn** | Design first wanted `dueDate` stored as a Timestamp with a time. That contradicts D5 ("date only"). The decider withdrew it: the product owner may want to keep due dates simple. | None. D5 stands. | None |
| SCR-2 | Open | C5 (line 48): "a `hasOnly` field allowlist … They are requirements, not choices." ↔ Security rules (line 90): `allow create, update, delete: if false;`, so no allowlist exists. | None attached. Planning decides the wording. ADR-0001 records why no write rule is opened. | None |
| SCR-3 | Open | Data model (line 81): present-but-empty fields "keep the `hasAll` / `hasOnly` rule allowlist exact" ↔ Security rules (line 90): there are no write rules, so there is no allowlist to keep exact. | Replace the stale reason with "keeps the `Task` type and Zod schemas exact". Keep the `deletedAt` query reason. | None |
| SCR-4 | Open | A42 (line 138): "the checkbox is **disabled** until `setTaskStatus` responds" ↔ AC18 (line 387): "keyboard focus **stays on the checkbox**". A native `disabled` input probably cannot keep focus. This browser behaviour is not yet verified. | Block the checkbox with `aria-disabled="true"` and ignore clicks while saving, in place of `disabled`. | ADR-0005 |

## Raised and dismissed

- **A32 vs A44 (no-op saves).** Saving an edit with no changes writes a new `updatedAt` (A32, AC12). Setting the status the task already has writes nothing (A44, AC19). The decider judged the difference intentional: the status no-op protects against stale or repeated requests, while saving an edit is a deliberate save. Not raised.
