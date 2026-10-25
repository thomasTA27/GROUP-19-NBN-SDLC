# Planning and spec authoring — facilitator sheet

Facilitator only. Keep outside the participant repository. Based on the team's planning usability test plan; this sheet does not replace plan review.

## Session record

- Date/time:
- Participant (Leon or confirmed replacement):
- Facilitator (planned: Ujjawal Mittal):
- Test-plan reviewer/date/outcome:
- Repository branch and full starting commit:
- Module version/commit tested:
- Claude model/version and access checked:
- Independent Gate 1 approver:
- Recording agreed: yes / no. Recording location, if agreed:
- Environment departures or known failures:

## Before starting

Confirm the app and Claude work, context files are present, remote control works, and the participant can open START-HERE.md. Keep facilitator records out of view. Record any setup changes since the VM snapshot. Use the same agreed ten-item usability questionnaire in both sessions; have it ready before the test.

## Script and timing

| Session minute | Action |
| --- | --- |
| 0–5 | Say: “We are testing the module, not you. You may think aloud, but you do not have to.” Ask permission before recording. Ask the confidence question below. |
| 5–10 | Hand over START-HERE.md, the module and the ticket below without explaining their steps. |
| 10–55 | Observe the task. Record timings, questions and errors. Stop at minute 55 even if unfinished. |
| 55–60 | Repeat confidence question; collect the ten usability ratings. |
| 60–75 | Debrief: where did you get stuck, what wording caused it, and what would you change? Ask “What changed your confidence answer?” |

Ticket: “Users want to be able to remove a note they have created. Add a delete option to notes.”

Confidence (1–5): “How confident are you that you could write a specification for this ticket that a reviewer would approve without changes?”

- Before:
- After:
- Reason for change:

If asked to explain a module step, say “What do you think it means?” and log the question. Answer product-owner questions factually and briefly only when the participant raises them; record the answer and who gave it. Do not suggest missing requirements. Fix tooling failures and log excluded time. The participant stops at readiness for independent approval; do not start implementation.

## Observation log

| Step | Start | Finish | Tooling time excluded | Observation / exact quote |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |

| Time / step | Error type | Exact instruction involved | Observed behaviour / assistance |
| --- | --- | --- | --- |
| | | | |

Error types: wrong order; skipped step; misread instruction; asked for help; accepted unchecked AI output. Log tooling incidents separately from module errors.

| Product-owner question | Answer / decision | Answered by / time |
| --- | --- | --- |
| | | |

## After the session — gate scoring

Mark each met / partly met / not met, with a spec reference. Six met is a task-success pass. Scoring does not itself constitute independent approval.

| Gate criterion | Result | Evidence |
| --- | --- | --- |
| Every acceptance criterion is testable | | |
| Clarification markers resolved; answers and sources recorded | | |
| Assumptions visible, numbered and linked to criteria | | |
| Requirements trace to ticket, design or recorded decisions | | |
| Out of scope stated | | |
| Spec matches project conventions | | |

- Task stopping point / unfinished work:
- Spec saved as notes-delete-spec.md; evidence copy location:
- Independent approval: pending / approved / returned for revision:
- Approver, date, reviewed spec version and reasons:

## Ratings and evidence

- Ten questionnaire ratings (each 1–5), in order:
- Adapted SUS score: sum of (odd-item rating − 1) and (5 − even-item rating), multiplied by 2.5:
- Report as an internal baseline; do not compare with the published software average.
- Claude usage, tokens, cost and duration as available; unavailable values marked unavailable:
- Evidence locations (spec, session notes, permitted recording, usage):

| Finding / step and wording | Evidence | Priority | Proposed change |
| --- | --- | --- | --- |
| | | | |

Priority: blocks task; costs time or weakens spec; preference. Report this as one participant's findings, not evidence of general usability.
