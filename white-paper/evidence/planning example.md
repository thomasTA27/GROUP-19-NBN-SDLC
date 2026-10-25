# Evidence — Module 1: Planning and Spec Authoring

> **EXAMPLE.** All names match the team, but every result and number below is invented to show the format. Replace with real pilot data.

| | |
|---|---|
| Pilot feature | Planned outage info on the service status API |
| Module followed | `white-paper/modules/planning-and-spec-authoring.md` |
| **Done by** | Ujjawal Mittal (BA/UX) |
| **Tested by** | Sajad Ali Akbari (Dev) |
| Dates | Do: 24–25 Sep 2026 · Test: 25 Sep 2026 |
| Planner card | [Module 1 - DO] / [Module 1 - TEST] |

---

## Part A — DO (Ujjawal)

### A1. Steps followed

| Module step | What I did | Followed as written? | If not, why |
|---|---|---|---|
| 1 Write intent | 4 sentences: NBN customers can see planned outages for their service before they happen | Yes | |
| 2 AI drafts spec | Claude drafted from the template | Yes | |
| 3 NEEDS CLARIFICATION | AI raised 4 markers | Yes | |
| 4 Resolve markers | Resolved 3 myself, 1 with Thomas (PM) | Partly | Module does not say who may decide — added to open questions |
| 5 Checklist | Ran section 5 checklist | Yes | |
| 6 Submit to Gate 1 | Sent to Thomas | Yes | |

### A2. AI log

| # | Prompt (short) | AI output | What I checked | Result | Why |
|---|---|---|---|---|---|
| 1 | Draft spec from intent + template | `spec/planned-outage-spec.md` v1 | Every requirement vs checklist | Modified | Merged 2 requirements that said the same thing |
| 2 | "List what you guessed" | 4 markers | Each marker is a real gap | Accepted | |
| 3 | Rewrite R3 to be testable | New R3 with acceptance criterion | Tester could run it | Accepted | |
| 4 | Add caching requirement | Suggested 5-min cache | Not in intent | Rejected | AI invented a business rule |

### A3. Metrics

| Time (min) | Tokens | AI accepted | AI modified | AI rejected |
|---|---|---|---|---|
| 70 | ~18k | 2 | 1 | 1 |

### A4. Output

`spec/planned-outage-spec.md` — PR #31

---

## Part B — TEST (Sajad)

### B1. What I tested and how

Read the spec as the developer who has to build it. For each requirement: can I code it without asking Ujjawal, and can I write a test from its acceptance criterion? Also checked for any rule the AI added that nobody asked for.

### B2. Test results

| # | Check | Pass / Fail | Notes |
|---|---|---|---|
| 1 | R1 list upcoming outages — buildable and testable | Pass | |
| 2 | R2 unknown service returns 404 — buildable and testable | Pass | |
| 3 | R3 exclude past outages — buildable and testable | Pass | |
| 4 | R4 show start and end time | Fail | Time zone not stated (UTC or AEST?) — issue #32 |
| 5 | No invented rules | Pass | Checked against intent, 0 found |
| 6 | Out-of-scope list present | Pass | |

### B3. Sign-off

- [x] I did not do Part A.
- [x] Result: **Pass with changes** — R4 fixed by Ujjawal (times in ISO 8601 with offset), re-checked 25 Sep
- Signed: Sajad Ali Akbari, 25 Sep 2026

---

## Part C — Verdict on the module

| Claim | Verdict | Evidence |
|---|---|---|
| C1 NEEDS CLARIFICATION stops invented rules | Supported | A2 row 4 rejected; B2 row 5 found 0 |
| C2 Spec buildable without asking the author | Partly | B2 row 4 — one question needed |
| C3 Faster without losing quality | Supported | 70 min; Gate 1 passed first time |

**Change needed in the module:** add "time zones and units stated" to the section 5 checklist; add "who may resolve a marker" to open questions.
