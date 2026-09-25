---
description: Load a previously saved session and resume work from where it left off. Use at the start of a new conversation to restore context from a prior session.
argument-hint: "[session-name]"
---

# Skill: /resume-session

Load a saved session file and resume work from the exact point it was left off.

## Instructions

1. If `$ARGUMENTS` is provided, look for `.claude/sessions/<arguments>.md`.
   If no argument, list all files in `.claude/sessions/` sorted by modification date and load the most recent.

2. Read the session file in full.

3. Output a structured briefing — do NOT start implementing yet:

```
## Resuming session: <name>

**Goal:** <from section 1>
**Branch:** <from file header>

### ⚠️ Do NOT retry these (failed last session):
<section 3 content>

### Current state:
<section 5 table>

### Open blockers:
<section 7 content>

### First action:
<section 8 — exact next step>
```

4. Ask: "Ready to continue? I'll start with: [section 8 content]"

5. Wait for confirmation before taking any action.

---

## Notes

- Always read section 3 (What Did NOT Work) before doing anything. Retrying known-failed approaches is the most common cause of wasted sessions.
- If the session file references a git branch, verify you're on the correct branch before starting.
- If `.claude/sessions/` is empty or doesn't exist, say: "No saved sessions found. Start a new session and use `/save-session` before ending it."
