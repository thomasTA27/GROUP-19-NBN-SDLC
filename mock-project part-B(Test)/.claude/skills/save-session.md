---
description: Save current session state to a file so it can be resumed in a future conversation. Use before ending a session mid-task or before a context compaction.
argument-hint: "[session-name]"
---

# Skill: /save-session

Save the current working session to `.claude/sessions/` so it can be resumed later.

## Instructions

1. If a session name was provided as `$ARGUMENTS`, use it. Otherwise generate one from the current date and the primary task: `YYYY-MM-DD-<task-slug>`.

2. Create `.claude/sessions/` if it doesn't exist.

3. Write the session file to `.claude/sessions/<session-name>.md` with ALL eight sections below.

4. Confirm: "Session saved to `.claude/sessions/<name>.md`. Resume with `/resume-session <name>`."

---

## Session file format

```markdown
# Session: <name>
**Date:** <YYYY-MM-DD>
**Branch:** <current git branch>

---

## 1. What We Are Building

<One paragraph describing the goal, scope, and why it matters.>

---

## 2. What WORKED (with evidence)

<Bullet list of approaches that succeeded. Include file names, command output, test results as evidence. Be specific — "used X and it worked because Y".>

---

## 3. What Did NOT Work ⚠️ (most critical — prevents retrying failed paths)

<Bullet list of approaches that FAILED and why. Future sessions MUST NOT retry these.>

---

## 4. What Has NOT Been Tried Yet

<Bullet list of ideas or approaches that remain unexplored.>

---

## 5. Current State of Files

<List the key files touched this session and their current state. Note any files left in an incomplete or broken state.>

| File | State |
|------|-------|
| `frontend/src/...` | complete |
| `backend/src/...` | in progress — missing validation |

---

## 6. Decisions Made

<Bullet list of architectural or technical decisions made this session and the reasoning.>

---

## 7. Blockers & Open Questions

<Anything unresolved. Include error messages verbatim if relevant.>

---

## 8. Exact Next Step

<One sentence: the FIRST action the next session should take. Be precise — include file name and what to do.>
```

---

## Notes

- Section 3 ("What Did NOT Work") is the most valuable section. A future session that skips it will waste time retrying the same failed approaches.
- Keep each section concise — this file is loaded into context at session start.
- `.claude/sessions/` is gitignored by default (add it if not already present).
