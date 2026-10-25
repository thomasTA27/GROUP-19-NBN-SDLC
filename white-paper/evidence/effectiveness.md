<!-- Repo only. This file is deliberately not listed in platform/src/data/lifecycle-map.ts,
     so the platform does not render it. -->

# Evidence of effectiveness

What the usability testing shows about whether the Planning and Spec
Authoring module works for a reader who did not write it.

Every figure below comes from the
[usability testing report](usability-testing.md). Read that for the method,
the data and the limits.

---

## What was tested

One session on 2026-10-15. A computer science student who did not write the
module followed [Planning and Spec Authoring](../modules/planning-and-spec-authoring.md)
on their own, using Claude Code, to write a specification for an underspecified
ticket. The facilitator did not explain the module.

## Results

| Measure | Result |
| --- | --- |
| Task success | **Gate not passed.** 1 of 6 criteria met, 4 partly met, 1 not met |
| Adapted SUS | **5 out of 100**, an internal baseline that cannot be compared with published scores |
| Steps with recorded difficulty | **5 of 8** |
| Facilitator help during numbered steps | **At least 2** |
| Recorded elapsed window | 58 minutes |
| Time per step, total errors, confidence, cost | **Not recorded** |

## What this shows

As first written, the module did not let a junior reader produce a
specification that passes the Plan Approved gate without help.

The failures had one pattern. Steps that gave a prompt the reader could paste
(steps 1 and 2) raised no issue. Steps that asked for judgement without a
method (step 3) or changed format without saying so (steps 3 and 6) are where
the participant stopped. Ten findings were logged: three block the task, two
cost time or weaken the specification, and five are not yet prioritised.

## What this does not show

- **That the module works.** The only measured result is a failed gate.
- **How common the problems are.** One participant, one module.
- **How an experienced developer would fare.** The participant was a student.
  A senior reader may fill the gaps from habit.
- **That the revisions fix anything.** They have not been retested.

Four of the five planned measures are incomplete, so the evidence is mainly
the task result, the score and the findings.

## What changed afterwards

Revisions addressing the findings were prepared on 2026-10-17. They are
recorded finding by finding in the
[revision log](../usability/planning-module-revision-log.md), which also states
the remaining limits. No participant has tested the revised module.

## Sources

| Document | What it covers |
| --- | --- |
| [Usability testing report](usability-testing.md) | Method, results, findings, limitations |
| [Results analysis](../usability/planning-session-2026-10-15/analysis.md) | Measures and what is missing |
| [Specification assessment](../usability/planning-session-2026-10-15/assessment.md) | The six-criterion rating |
| [Findings data](../usability/csv/planning-and-spec-authoring/findings.csv) | The ten findings |
| [Revision log](../usability/planning-module-revision-log.md) | Changes made after testing |
