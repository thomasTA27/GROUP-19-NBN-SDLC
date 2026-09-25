---
description: Create or verify a checkpoint during a long implementation task. Use to mark stable milestones and compare against them later.
argument-hint: "[create|verify|list] [checkpoint-name]"
---

# Skill: /checkpoint

Create, verify, or list checkpoints during a long implementation task.

## Commands

### `/checkpoint create [name]`

Record the current state as a named checkpoint.

Steps:
1. Run `git diff --stat HEAD` to get a summary of changes
2. Run `pnpm run typecheck 2>&1 | tail -3` to capture typecheck status
3. Run `pnpm run test 2>&1 | tail -5` to capture test status
4. Append to `.claude/checkpoints.log`:

```
[<ISO timestamp>] CHECKPOINT: <name>
  Branch: <current branch>
  Files changed: <git diff --stat summary>
  TypeScript: <PASS / N errors>
  Tests: <PASS / N failed>
  Note: <optional — what was just completed>
---
```

Confirm: "Checkpoint '<name>' saved."

---

### `/checkpoint verify [name]`

Compare current state to a named checkpoint.

Steps:
1. Find the checkpoint entry in `.claude/checkpoints.log`
2. Run current `git diff --stat HEAD` and `pnpm run typecheck 2>&1 | tail -3`
3. Output comparison:

```
## Checkpoint Comparison: <name>

| Dimension | At checkpoint | Now |
|-----------|---------------|-----|
| Files changed | 3 files | 7 files |
| TypeScript | PASS | PASS |
| Tests | PASS | 2 failed |

Status: ⚠️ REGRESSION — tests passing at checkpoint are now failing
```

---

### `/checkpoint list`

Display all checkpoints from `.claude/checkpoints.log`, newest first:

```
Recent checkpoints:

1. 2026-03-28 14:22  auth-complete       TS: PASS  Tests: PASS
2. 2026-03-28 12:05  dashboard-scaffold  TS: PASS  Tests: PASS
3. 2026-03-28 10:17  session-start       TS: PASS  Tests: PASS
```

---

## When to use checkpoints

- `/checkpoint create session-start` — before beginning any multi-file task
- `/checkpoint create <feature>-done` — after completing a logical unit of work
- `/checkpoint verify <feature>-done` — before opening a PR to confirm nothing regressed
- `/checkpoint list` — orient yourself at the start of a resumed session

## Notes

- `.claude/checkpoints.log` is gitignored — it's local to your machine
- Checkpoints are advisory: they log state, they do not restore it
- If tests pass at a checkpoint and fail now, stop and fix before continuing
