# Usability test plan: Implementation

**Author:** Ujjawal Mittal (BA and UX)
**Date:** 2026-10-10
**Status:** Draft. Awaiting teammate review.
**Participant:** _to be confirmed_ (computer science student)

Uses the same measures as the Planning and Spec Authoring test plan, so the two
sessions can be compared.

---

## 1. Goal

Find out whether a developer who did not write the module can follow it on their
own and produce a change they would be willing to sign off. The session tests the
document, not the participant.

---

## 2. Modules in scope

| Document | Path |
| --- | --- |
| Implementation | `white-paper/modules/implementation.md` |

Checklist item (f) needs the risk tiers in `white-paper/governance/research.md`.
That file is read during the session but is not being tested. Whether the participant can
find and apply the tier is a finding about the Implementation module.

Problems belonging to another module are passed to its owner.

---

## 3. The task

**The specification.** The participant builds from the notes delete
specification produced in the Planning session, which runs first. Chaining the two is
deliberate. The Planning module asks whether a specification is buildable without
asking its author, and this session answers it.

If the Planning session does not run in time, a short specification is prepared instead
and approved at Gate 1.

**Why notes.** Both evidence runs used Task CRUD, and both evidence files publish
what came out of them. Given a task, the participant could read the answers rather than find
them. Notes has one server action, `createNote`, so the gap is real and nothing
is published.

**What he does.** The module takes far longer than one session, so this covers
two parts of it properly rather than all of it badly:

- Step 0, baseline and controls, including recording the model version
- Step 1, a work package plan, capped at two files
- Steps 1 to 3 as a loop until the exit condition is met, including writing the
  commit message by hand and having the agent mark it

Step 0 is in because the module's final takeaway says preparation matters more
than prompting. Leaving it out would test everything except the claim the module
rests on. It also holds the warning about opening the agent from the project
folder rather than a parent, a mistake this team has already made once.

**What he does not do.** The verification checklist, items (a) to (g), is read
but not run. The participant is asked in the debrief what each item requires, which tests
whether it reads clearly. Items (d), (f) and (g) could not be run anyway: they
need scanners, a second reviewer and documentation to audit.

### Known problems to sort out first

Two things in the module will trip the participant up. We already know about both, so we
should decide what to do before the session rather than during it.

**1. The module tells him to write into a section that does not exist.**

Five steps say to put things in "the PR caveats". Our pull request template has
no caveats heading. It has a section for what the change does, one for where it
lives, and a checklist. Nothing else.

So the participant will reach the end and have nowhere to put his notes.

We can either add the heading before the session, or leave it as it is and watch
what they do. Both are fine. What is not fine is working it out in front of him.

**2. The prompts are written for the wrong tool.**

The module's prompts use `#file:` and `@workspace /tests`. Those are GitHub
Copilot. Our mock project runs Claude Code.

Line 90 of the module does tell the reader to use plain file paths on the
command line. The question is whether the participant notices that line. We leave this one
alone, because finding out is the point.

**3. Check the setup the day before.**

The Planning specification is approved. The project runs on the
participant's machine with
dependencies installed. Claude Code works.

Worth doing properly. When William ran this phase, he started with no
dependencies installed and no local environment. Sorting that out could easily
take the whole hour.

---

## 4. Success measures

The same five as the Planning plan. Two needed adapting, and each is named.

**Task success.** Scored on six things the module requires:

| | What is checked |
| --- | --- |
| 1 | The agent was opened from the project folder, not a parent |
| 2 | The baseline was run and what failed was recorded as known |
| 3 | The controls were confirmed working, and anything missing was noted |
| 4 | The work package names its acceptance criteria and what it must not change |
| 5 | The change satisfies that criterion and nothing more |
| 6 | The commit message was written by hand, marked by the agent, and the findings recorded |

Six of six is a pass.

**Time per step.** Planning has eight steps in order. Implementation does not, so
time is recorded per phase: Step 0, the work package plan, each loop round, and
the exit condition. Rounds are counted by type. The module separates corrective
rounds, where the output was wrong, from hardening rounds, where it was right and
review found a gap. Both are recorded, because the module says not to confuse
them.

**Error count.** Counted by the same five types:

| Type | Meaning |
| --- | --- |
| Wrong order | Performed a step before one it depends on |
| Skipped step | Did not perform a step at all |
| Misread instruction | Did the step, but not what it asked for |
| Asked for help | Could not proceed without the facilitator |
| Accepted unchecked | Took AI output without the check the module requires |

Each error is logged with the step and the exact wording that caused it.

**System Usability Scale.** The standard ten items at the end, scored the
published way: odd items lose one from the rating, even items are subtracted from
five, the results are added and multiplied by 2.5, giving 0 to 100 (Brooke,
1996).

As in the Planning session, "this system" is replaced with "this module". That
breaks comparison with the published average of around 68 (Sauro, 2011), so the
score is an internal baseline. Both sessions use the same wording, so their
scores compare with each other.

The questionnaire is a Google Form, so the participant answers on their own
device rather than out loud. The wording follows
`module-usability-questionnaire.md` exactly.

Form: https://docs.google.com/forms/d/e/1FAIpQLScbc7qNL2pHHCsJg3qQIkwRQdhmg9F57VlsaaytUabxe6zQTA/viewform

**Confidence rating.** Asked before and after on a one to five scale:

> How confident are you that you could take this specification and produce a
> change you would be willing to sign off?

The change matters more than either number. The follow-up is "What changed your
answer?"

---

## 5. Participant

One participant: a computer science student on the same degree as the team.

They did not write any part of the module, and they have enough background to
work through a change and judge whether it is ready.

**Read the result as a junior developer's.** The original plan named an
experienced developer, who did not take part. A student is closer to the junior
reader the module describes in its section on experience levels. This matters
more here than in Planning, because the module leans on judgement a student may
not have yet: deciding when the loop is finished, and telling a corrective round
from a hardening one. Difficulty with those is worth recording, but it may be
the reader rather than the writing.

One participant is not a sample. This session finds defects that stop a
competent reader from using the module. It cannot show how common a defect is,
or support a claim that the module works for developers generally.

The two sessions use different participants, so they compare the modules only
roughly. A measure that differs sharply between them may be the person rather
than the document.

---

## 6. Format and length

Online with screen sharing, 60 minutes, recorded with his agreement.

| Minutes | Activity |
| --- | --- |
| 0 to 3 | Introduction, consent to record, confidence rating |
| 3 to 5 | Hand over the specification and the module. No explanation of either |
| 5 to 20 | Step 0 |
| 20 to 45 | Step 1 and the loop |
| 45 to 50 | Confidence rating again, then the usability scale |
| 50 to 60 | Debrief, including what the checklist items require |

Each phase is timeboxed. If Step 0 is unfinished at minute 20 it stops there,
because how long Step 0 takes is itself worth knowing. The module does not say,
and a team budgeting for this phase would want to.

He may well not finish. The evidence run took about 222 active minutes for nine
work packages, roughly 25 minutes each, by the person who wrote the module. Where
the participant stops is a result, not a failure.

**On comparing the two sessions.** The measures are identical. The coverage is
not: this session covers part of a large module, where Planning covers the
whole of a smaller one. The report says so rather than presenting the scores as like for
like.

---

## 7. Roles

| Role | Person | Does |
| --- | --- | --- |
| Facilitator | Ujjawal Mittal | Reads the script, keeps time, logs errors and timings |
| Participant | _to be confirmed_ | Performs the task |

The facilitator does not help. If the participant asks what a step means, the answer is "what
do you think it means?" and the question is logged as an error. Explaining the
module destroys the finding, because it has to work without its author present.

The exception is a tooling problem that is not about the module: the environment
failing to start, a crash, a missing dependency. Those are fixed and the lost
time is excluded.

The participant writes the commit message themselves. The facilitator does not read it.

If the module raises a spec change request, the facilitator answers as the Gate 1
owner, briefly and factually, and the answer is recorded.

---

## 8. What gets recorded

- Time per phase, and the count of corrective and hardening rounds
- Error log with the step, type and the wording that caused it
- The Step 0 baseline output, what failed, and any control found missing
- The work package plan, the diff, the commit message and the agent's findings
- The six task success items, marked met, partly met or not met
- What the participant said each checklist item requires
- Confidence before and after, with the reason for any change
- Usability scale responses and the calculated score
- Token cost and duration from `/usage`
- Direct quotes where he explains why something did not work

---

## 9. How findings are handled

Each finding names a step or checklist item. "Checklist (c) does not say how many
mutations to run" is actionable. "The checklist is confusing" is not.

1. **Blocks the task.** Fixed before the module goes to the client.
2. **Costs time or weakens the change.** Fixed if time allows.
3. **Preference.** Recorded only.

---

## 10. Teammate review

One teammate reviews this plan before the session runs, checking that the
measures can be observed in 60 minutes, that the scoped-down task still exercises
the module, and that the script does not lead the participant.

**Reviewer:** _to be confirmed_
**Date:** _pending_
**Outcome:** _pending_

---

## 11. Open questions

1. Should the PR template gain a caveats heading before the session, or is the
   participant's reaction to its absence the more useful finding?
2. Chaining the sessions means a problem in the Planning specification
   becomes a problem here. That is accepted, because separating them would lose the
   answer to Planning's open question 3. Worth revisiting if that
   specification turns out badly.
3. The prompts are written for Copilot and the project runs Claude Code. Is the
   gap a finding, or should the module carry both forms?
4. The verification checklist is read but never run. Testing whether the checks
   work needs a second session.
5. Step 0 is timeboxed at 15 minutes. If it usually takes longer, the module
   should say so.
6. At 60 minutes against Planning's 75, the two sessions cover different amounts
   of their modules. Acceptable, or should they match?

---

## References

Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan, B.
Thomas, I. L. McClelland and B. Weerdmeester (Eds.), *Usability Evaluation in
Industry*. Taylor and Francis.

Sauro, J. (2011). Measuring usability with the System Usability Scale (SUS).
MeasuringU. https://measuringu.com/sus/