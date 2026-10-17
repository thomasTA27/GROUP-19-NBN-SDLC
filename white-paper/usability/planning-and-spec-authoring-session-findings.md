# Session findings: Planning and Spec Authoring

**Participant:** Mark Nguyen (P1), computer science student
**Facilitator:** Ujjawal Mittal
**Date:** 2026-10-15
**Module tested:** `white-paper/modules/planning-and-spec-authoring.md`
**Model used:** Claude Sonnet 5.5, low effort
**Task time:** approximately 60 minutes
**Adapted SUS score:** 5 out of 100

---

## The headline

**The module explains what each step achieves but not how to do it, and the
steps without a prompt are the ones that failed.**

Steps 1, 2, 4, 5, 6 and 7 each give a prompt to paste. Those worked. Step 3 says
"no prompt" and then asks for three judgements with no method, and the
participant could not perform it. Step 4's prompt contains a `[list]`
placeholder with no explanation of what goes in it, and he could not fill it.

Everywhere the module hands over a prompt, the reader proceeds. Everywhere it
asks for judgement without one, the reader stops. That is one fix, not four.

---

## The usability score

**5 out of 100.** The lowest possible is 0.

| Item | Response | Contribution |
| --- | --- | --- |
| 1 I would like to use this module frequently | 1 | 0 |
| 2 I found the module unnecessarily complex | 5 | 0 |
| 3 I thought the module was easy to use | 2 | 1 |
| 4 I would need the support of a technical person | 5 | 0 |
| 5 The various functions were well integrated | 1 | 0 |
| 6 There was too much inconsistency | 4 | 1 |
| 7 Most people would learn to use this quickly | 1 | 0 |
| 8 I found the module very cumbersome | 5 | 0 |
| 9 I felt very confident using the module | 1 | 0 |
| 10 I needed to learn a lot before getting going | 5 | 0 |
| | **Total** | **2** |

2 × 2.5 = 5.

**The responses are coherent, not careless.** He answered 5 to every negatively
worded item and 1 to almost every positive one, which is the expected pattern
from someone who found the document hard. He also discriminated: item 3 drew a 2
rather than a 1, and item 6 a 4 rather than a 5. Someone answering at random or
misreading the scale direction does not produce that.

The score matches the observed session. He could not perform step 3, could not
fill in step 4's placeholder, misread what step 4 was asking him to count, and
spent about an hour.

**How to read it.** This is an internal baseline. The wording is adapted from
"system" to "module", so it cannot be compared with the published software
average. It is a starting point for comparing our own modules against each
other, and the Implementation session will use the same adapted wording.

One participant. The score says this reader found the module very hard. It does
not establish how a different reader would score it.

---

## Findings

### 1. The module does not say which model to use

**Priority: costs time or weakens the spec**

Nothing in the module names a model or an effort level. The participant used
Sonnet 5.5 at low effort because that is what was in front of him.

This matters more than it looks. The module's cost table compares a $1.86 run
against a $12.80 run and attributes the difference to rewriting. If the two runs
used different models, part of that gap is the model, not the method. A reader
budgeting for this phase cannot use those numbers without knowing what produced
them.

**Proposed change:** state which model the evidence runs used, and say whether
the guidance assumes a particular model or effort level.

---

### 2. Step 3 cannot be performed as written

**Priority: blocks the task**

> Step 3: read what comes back. No prompt. Check three things: whether it
> invented a requirement nobody asked for; whether every criterion is testable,
> rather than saying the system "handles it as specified"; and whether every
> Ticket source matches the ticket and every Rule source matches the file it
> names.

The participant asked how to check the three things and could not proceed on his
own. The step names three checks and gives no method for any of them. It is also
the first step with no prompt, straight after two that have one, so the change in
format is unsignalled.

**Proposed change:** either give a prompt for the mechanical parts, or spell out
the method. For example: open the ticket beside the spec and read each criterion
labelled Ticket against it; open each file named in a Rule label and confirm the
rule is there; read each criterion aloud and ask whether a tester could write a
test from it without asking a question.

---

### 3. Step 4's marker count was read as a target

**Priority: blocks the task**

> Expect a lot. The evidence runs raised between 22 and 31 markers on small
> tickets, and roughly a fifth survived the filter.

The participant produced 29 acceptance criteria and set about reducing them. He
had matched his 29 against the module's "22 to 31" and concluded the step was
about criteria. It is about clarification markers, which are a different thing.

Two problems at once. The number anchors the reader, and the step does not make
clear which of the two things is being counted.

**Proposed change:** move the evidence figures out of the instruction. Say
plainly that step 4 reduces the clarification markers, not the acceptance
criteria, and that the criteria stay.

---

### 4. Step 4's `[list]` placeholder is unexplained

**Priority: blocks the task**

> "Reduce the clarification markers to these only: [list]."

The module never says what goes in `[list]`. The participant did not know what to
put there. Step 2's `[ticket]` placeholder is obvious from context. This one is
not, because the list is something the reader has to construct first by applying
the filter.

**Proposed change:** say what the list is. For example: "replace `[list]` with
the markers you decided are blocking, by number."

---

### 5. The evidence-run statistics read as noise

**Priority: costs time or weakens the spec**

The participant asked for these to be removed:

> Expect a lot. The evidence runs raised between 22 and 31 markers on small
> tickets, and roughly a fifth survived the filter.

> In the second run the spec grew from 168 to 346 lines and 25 to 38 assumptions
> across its later prompts, ending with 20 additions awaiting a decision.

Both report what happened when the team ran the module. Neither tells the reader
what to do. Mid-instruction they interrupt the task, and finding 3 shows the
first one actively misled him.

**Proposed change:** move both to the "Metrics for success" or "In practice"
sections, where a reader goes to learn what the phase costs rather than how to
perform it. The instruction steps should contain instructions only.

The same applies to similar sentences elsewhere in the steps. Worth a pass
through the whole "What to ask the AI" section with this in mind.

---

## What this means for the module

Three of the five findings are the same problem: a step states an outcome and
leaves the mechanics to the reader. The module was written by people who already
knew the mechanics, which is exactly what a usability test is for.

The fix is narrow. Give step 3 a method, explain step 4's placeholder, and move
the evidence figures out of the instruction steps. That is maybe an hour of
editing, and it addresses four of the five findings.

---

## Limitations

One participant, one session. This shows these problems exist. It cannot show
how common they are, or that nothing else is wrong.

The participant is a student rather than an experienced developer, so the result
speaks to the junior reader the module describes in its section on experience
levels. A senior developer may have supplied the missing mechanics from habit and
never noticed the gaps.

The model and effort level were not controlled. Sonnet 5.5 at low effort may
behave differently from whatever the evidence runs used.

---

## Submitted artifact, gate assessment and environment change

The [combined analysis](planning-session-2026-10-15/analysis.md) incorporates
William's cleaned data, this report and the artifact assessment. It records
source disagreements, independently checked calculations and remaining gaps.
William's cleaned record identifies Bao Nguyen Le as participant and Sajad as
facilitator, with William and Ujjawal taking notes; the original header above is
retained pending teammate confirmation. His 58-minute recorded window is not
yet verified as task-only time. The analysis links directly to this report;
its original version remains available in Git history through PR #61.

The tester's original specification is now preserved as
[notes-delete-spec.md](planning-session-2026-10-15/notes-delete-spec.md), unchanged
from the tester's fork commit. The
[assessment and provenance record](planning-session-2026-10-15/assessment.md)
scores the submitted artifact against all six Plan Approved criteria:
**1 met, 4 partly met, 1 not met; gate not passed**. Sajad Ali Akbari prepared
these ratings, which await teammate review and are not a named approver's sign-off.

Sajad reported that VM environment changes and latency led the team to move the
test to the participant's local clone and receive the result through his fork.
The assessment records this deviation and the missing timing/environment details.
The approximately 60-minute task-time figure above has not been reconciled with
setup or migration time.

The submission says the linked module pages were not read. Whether this refers
only to the AI, while the participant read them separately, still needs checking
against session records before making claims about adherence to the module.

## Still to record

- [ ] Confidence rating before and after, and the reason for any change
- [x] Gate scoring: all six criteria assessed in the linked record (human review pending)
- [ ] Token cost and duration from `/usage`
- [x] An unchanged copy of `notes-delete-spec.md`, linked above with provenance
- [ ] Human review of gate scoring and confirmation of module use and timing boundaries
