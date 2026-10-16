# Implementation — facilitator sheet

Facilitator only. Keep outside the participant repository. Based on the team's implementation usability test plan; this sheet does not replace plan review.

## Session record

- Date/time:
- Participant (Ben or confirmed replacement):
- Facilitator (planned: Ujjawal Mittal):
- Test-plan reviewer/date/outcome:
- Repository branch and full starting commit:
- Module version/commit tested:
- Claude model/version and access checked:
- Recording agreed: yes / no. Recording location, if agreed:
- Approved input spec version, independent approver and approval date: PENDING
- Input origin: planning participant / approved fallback:

Do not run this phase until its input spec has independent Gate 1 approval.

## Before starting

Confirm the app, Claude, context files and remote control work. Keep facilitator records out of view. Confirm the approved notes-delete-spec.md is available. Record the PR Caveats heading decision and any setup changes since the snapshot. Use the same agreed ten-item usability questionnaire as planning.

Known baseline at preparation: 11 tests, typecheck, lint and build passed. Implementation setup PR CI passed lint/typecheck and frontend/backend tests; Security Scan failed and remediation was deferred. Copy the actual baseline record and latest statuses into the session evidence. Do not describe all checks as passing. The participant still performs Step 0; facilitator preparation does not replace that task.

## Script and timing

| Session minute | Action |
| --- | --- |
| 0–3 | Say: “We are testing the module, not you. You may think aloud, but you do not have to.” Ask permission before recording. Ask confidence question below. |
| 3–5 | Hand over START-HERE.md, approved spec and module without explaining the steps. |
| 5–20 | Observe Step 0. At minute 20 record its stopping point and unfinished controls. Do not bypass a required stop to reach coding. |
| 20–45 | Observe work-package planning and loop where module prerequisites permit. Stop task work at minute 45 even if unfinished. |
| 45–50 | Repeat confidence question; collect the ten usability ratings. |
| 50–60 | Debrief: stuck points, wording and suggested changes; ask what each checklist item (a)–(g) requires. Read/discuss the checklist; do not execute it as a separate test. |

Confidence (1–5): “How confident are you that you could take this specification and produce a change you would be willing to sign off?”

- Before:
- After:
- Reason for change:

If asked to explain a module step, say “What do you think it means?” and log the question. Fix tooling failures and exclude logged lost time. Answer spec-change requests briefly and factually as Gate 1 owner; record decisions. Do not write or coach the participant's commit message. Work packages are capped at two files. Observe whether the participant notices the module's Claude/plain-path guidance without coaching.

## Observation log

| Phase / round | Start | Finish | Tooling time excluded | Result / exact quote |
| --- | --- | --- | --- | --- |
| Step 0 | | | | |
| Work-package plan | | | | |
| Loop round 1 | | | | |
| Loop round 2 | | | | |
| Exit condition / stopping point | | | | |

Add rows as needed. Classify each loop round as corrective (wrong output) or hardening (review gap in otherwise correct output).

- Corrective rounds:
- Hardening rounds:

| Time / step | Error type | Exact instruction involved | Observed behaviour / assistance |
| --- | --- | --- | --- |
| | | | |

Error types: wrong order; skipped step; misread instruction; asked for help; accepted unchecked AI output. Log tooling incidents separately.

| Spec-change request | Answer / decision | Answered by / time |
| --- | --- | --- |
| | | |

## Task-success scoring

Mark met / partly met / not met, with evidence. Six met is a pass; unfinished work is still a valid observation.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Agent opened from project folder | | |
| Baseline run; known failures recorded | | |
| Controls confirmed; missing controls noted | | |
| Work package names acceptance criteria and what must not change | | |
| Change satisfies that criterion without additional scope | | |
| Commit message handwritten, agent marked it, findings recorded | | |

## Checklist comprehension — debrief only

| Item | Participant's explanation | Ambiguity / wording involved |
| --- | --- | --- |
| (a) | | |
| (b) | | |
| (c) | | |
| (d) | | |
| (e) | | |
| (f) | | |
| (g) | | |

## Ratings and evidence

- Task stopping point / unfinished work:
- Ten questionnaire ratings (each 1–5), in order:
- Adapted SUS score: sum of (odd-item rating − 1) and (5 − even-item rating), multiplied by 2.5:
- Report as an internal baseline; do not compare with the published software average.
- Claude usage, tokens, cost and duration as available; unavailable values marked unavailable:
- Evidence locations: approved spec, Step 0 outputs, controls/known failures, work-package plan, diff, commit message, agent findings, implementation-session.md, permitted recording and usage:

| Finding / step or checklist item | Evidence | Priority | Proposed change |
| --- | --- | --- | --- |
| | | | |

Priority: blocks task; costs time or weakens change; preference. Report limited module coverage and one participant; comparisons with planning are approximate because participants, durations and coverage differ.
