# Usability test plan: Planning and Spec Authoring

**Author:** Ujjawal Mittal (BA and UX)
**Date:** 2026-10-09
**Status:** Draft. Awaiting teammate review.
**Module version tested:** `planning-and-spec-authoring.md` as merged in PR #52
**Participant:** Leon

---

## 1. Goal

Find out whether a developer who did not write the module can follow it on their
own and produce a specification that passes the Plan Approved gate. The session
tests the document, not the participant.

The module states which of its parts have never been tested: the seven-quality
checklist and the three fixes in step 7, the approver rule in step 8, and the
process for when Design sends the spec back. Those get the closest attention,
because this session is the first time anyone has used them.

---

## 2. Modules in scope

| Document | Path |
| --- | --- |
| Planning and Spec Authoring | `white-paper/modules/planning-and-spec-authoring.md` |
| Gate 1: Plan Approved | `white-paper/modules/plan-approved.md` |

Nothing else. Problems that belong to another module are recorded and passed to
its owner.

---

## 3. The task

The participant receives one vague ticket:

> Users want to be able to remove a note they have created. Add a delete option
> to notes.

The ticket does not say whether the user is asked to confirm, whether the note is
gone for good or recoverable, who is allowed to delete a note, what the user sees
afterwards, or what happens if the note has already been removed. The module is
supposed to surface those gaps through its own steps. If the participant never
finds them, that is a finding about the module.

He works in `mock-project part-B(Test)` with Claude Code and the module open
beside him. He stops when he believes the specification is ready for the gate.

### Why the ticket is about notes

The notes feature has one server action, `createNote`. There is no way to update
or delete a note, so the gap is real and nothing has to be built first.

Tasks were ruled out. The tasks feature already has `createTask`, `updateTask`,
`setTaskStatus` and `deleteTask`, so a ticket to add editing or deleting
describes work that already exists. More importantly, both evidence runs used
Task CRUD, and the module's "In practice" section lists what came out of them,
including the six blocking questions and the eight places the spec contradicted
the project. A participant given a task ticket can read the answers off the
module instead of finding them, which destroys the test.

An earlier draft used an overdue indicator on the task list. That was dropped
because the project has no due dates, so the ticket assumed a feature nobody had
built.

### Prerequisites

Step 1 of the module now says to stop if no context files exist. Both mock
projects hold `CLAUDE.md` and `AGENTS.md` at the root and in `frontend/` and
`backend/`, so this is satisfied. Confirm it again on the day, because a session
that stops at step 1 produces nothing.

Leon also needs the project running locally and Claude Code working. Sort that
out the day before, not in the session.

---

## 4. Success measures

**Task success.** Scored against the six criteria already written into the Plan
Approved gate. Each is marked met, partly met or not met by reading the
specification he produced. Six of six is a pass.

**Time per step.** Start and finish time for each of the module's eight steps. A
step that takes far longer than its length suggests usually means the wording is
unclear.

**Error count.** Counted by type:

| Type | Meaning |
| --- | --- |
| Wrong order | Performed a step before one it depends on |
| Skipped step | Did not perform a step at all |
| Misread instruction | Did the step, but not what it asked for |
| Asked for help | Could not proceed without the facilitator |
| Accepted unchecked | Took AI output without the check the module requires |

Each error is logged with the step number and the exact wording that caused it,
because the wording is what gets fixed.

**System Usability Scale.** The standard ten items at the end, scored the
published way: odd items lose one from the rating, even items are subtracted from
five, the results are added and multiplied by 2.5, giving 0 to 100 (Brooke,
1996).

The scale asks about "this system" and we are testing a document, so the word is
replaced with "module". That breaks comparison with the published average of
around 68, which came from software studies (Sauro, 2011). The score is therefore
reported as an internal baseline for comparing our own modules, not as evidence
of being above or below average.

**Confidence rating.** Asked before and after on a one to five scale:

> How confident are you that you could write a specification for this ticket that
> a reviewer would approve without changes?

The change matters more than either number. A module that works should raise
confidence. If it drops, the follow-up question separates the two causes: "What
changed your answer?"

---

## 5. Participant

Leon. One participant.

He did not write any part of the module, which is what makes him suitable, and he
can judge whether a specification is workable.

One participant is not a sample. This session finds defects that stop a competent
reader from using the module. It cannot show how common a defect is, or support a
claim that the module works for developers generally. The report will say so.

---

## 6. Format and length

Online with screen sharing, 75 minutes, recorded with his agreement.

| Minutes | Activity |
| --- | --- |
| 0 to 5 | Introduction, consent to record, confidence rating |
| 5 to 10 | Hand over the ticket and the module. No explanation of either |
| 10 to 55 | The task. Thinking aloud encouraged, not required |
| 55 to 60 | Confidence rating again, then the usability scale |
| 60 to 75 | Debrief. Where he felt stuck and what he would change |

If the task is unfinished at minute 55 it stops there. That is a result, not a
failed session, and the remaining time is better spent on the debrief.

---

## 7. Roles

| Role | Person | Does |
| --- | --- | --- |
| Facilitator | Ujjawal Mittal | Reads the script, keeps time, logs errors and timings |
| Participant | Leon | Performs the task |

The facilitator does not help. If he asks what a step means, the answer is "what
do you think it means?" and the question is logged as an error. Explaining the
module destroys the finding, because the module has to work without its author
present.

The exception is a tooling problem that is not about the module: the environment
failing to start, a crash, a missing dependency. Those are fixed and the lost
time is excluded.

Step 6 of the module says the product owner answers the blocking questions. There
is no product owner on a mock project, so the facilitator answers, factually and
briefly, as a stand-in. The module requires this to be recorded in the resolved
questions, so it is written down rather than left implied.

Step 8 says the approver should not be the person who wrote the spec. Leon writes
it, so he cannot approve it. The session stops at the point of sign-off and the
specification is taken to a Gate 1 approver afterwards.

---

## 8. What gets recorded

- Start and finish time for each of the eight steps
- Error log with step number, type and the wording that caused it
- The specification he produced, saved as a file
- Gate scoring across the six criteria
- Confidence before and after, with the reason for any change
- Usability scale responses and the calculated score
- Token cost and duration from `/usage`
- Direct quotes where he explains why something did not work

---

## 9. How findings are handled

Each finding names a line or step. "Step 4 does not say where the clarification
markers go" is actionable. "Step 4 is confusing" is not.

1. **Blocks the task.** Fixed before the module goes to the client.
2. **Costs time or weakens the specification.** Fixed if time allows.
3. **Preference.** Recorded only.

---

## 10. Teammate review

One teammate reviews this plan before the session runs, checking that the
measures can be observed in 75 minutes, that the ticket is vague enough to
exercise the module without being unfair, and that the script does not lead the
participant toward the answer.

**Reviewer:** _to be confirmed_
**Date:** _pending_
**Outcome:** _pending_

---

## 11. Open questions

1. May he read the Design module if his specification drifts into design
   decisions? Currently no, though that may itself be the finding.
2. The usability scale cannot be compared against published data. Is an internal
   baseline across six modules worth ten questions, or would five targeted
   questions give better evidence?
3. If the task is unfinished at 45 minutes, is the module at fault or the task
   too large for one session?
4. Step 4 tells the reader to expect 22 to 31 markers. If the participant raises
   eight, he may think he did it wrong and pad the list. The number may belong in
   the metrics section rather than the instruction.
5. The module's open question 3 asks whether a spec is buildable without asking
   its author. This session does not answer that. Only building from the spec
   does.

---

## References

Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan, B.
Thomas, I. L. McClelland and B. Weerdmeester (Eds.), *Usability Evaluation in
Industry*. Taylor and Francis.

Sauro, J. (2011). Measuring usability with the System Usability Scale (SUS).
MeasuringU. https://measuringu.com/sus/