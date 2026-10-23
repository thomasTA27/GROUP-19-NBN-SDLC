# Usability testing

How the module usability tests were run, what they found, and what changes
follow.

**Status:** Complete. One session, on the Planning and Spec Authoring module.

---

## 1. Method

### What was being tested

Whether a developer who did not write a white-paper module can follow it on
their own and produce the output it promises. The test measures the document,
not the participant.

### Design

One session was run on the Planning and Spec Authoring module on 2026-10-15.

| | Planning and Spec Authoring |
| --- | --- |
| Test plan | [`planning-and-spec-authoring-test-plan.md`](../usability/planning-and-spec-authoring-test-plan.md) |
| Facilitator sheet | [`planning-facilitator-sheet.md`](../usability/planning-facilitator-sheet.md) |
| Run | 2026-10-15 |

### Measures

Five were planned. The session was to record:

1. **Task success**, scored against the module's own exit criteria
2. **Time per step**
3. **Error count**, by type: wrong order, skipped step, misread instruction,
   asked for help, accepted AI output unchecked
4. **Adapted System Usability Scale**, ten items, 1 to 5
5. **Confidence rating**, before and after

### The usability questionnaire

Brooke's System Usability Scale, with one change: "system" is replaced with
"module". Scored the published way, odd items lose one from the rating, even
items are subtracted from five, the sum is multiplied by 2.5, giving 0 to 100.

**That change breaks comparison with the published average of around 68**, which
comes from software studies. The score is reported as an internal baseline for
this module only.

The questionnaire is at
[`module-usability-questionnaire.md`](../usability/module-usability-questionnaire.md)
and the scoring rules at
[`module-usability-scoring.md`](../usability/module-usability-scoring.md).

### Participants

One participant. A computer science student on the same degree as the team, who
did not write the module.

An experienced developer was approached and did not take part.
**The results therefore describe a junior reader**, which is closer to one of
the two audiences the modules address but not the other.

### Rules during the session

The facilitator did not explain the module. Questions were answered with "what
do you think it means?" and logged. The exception was the module's own step
requiring a product owner decision, where the facilitator answered briefly and
factually as a stand-in.

Tooling failures were fixed and the lost time excluded.

---

## 2. Results: Planning and Spec Authoring

### Session record

| Field | Value |
| --- | --- |
| Participant | Bao Nguyen Le (P1), computer science student, junior developer |
| Date | 2026-10-15, 15:41 to 16:39 |
| Recorded window | 58 minutes |
| Module tested | `white-paper/modules/planning-and-spec-authoring.md` |
| Model | Claude Sonnet 5.5, low effort, Claude Code on a subscription plan |
| Facilitator | Sajad Ali Akbari |
| Notes | William Lor |
| Report | Ujjawal Mittal |
| Output | [`notes-delete-spec.md`](../usability/planning-session-2026-10-15/notes-delete-spec.md) |

The ticket given was deliberately underspecified: "Users want to be able to
remove a note they have created. Add a delete option to notes."

### What was measured, and what was not

| Measure | Result |
| --- | --- |
| Task success | **Gate not passed.** 1 criterion met, 4 partly met, 1 not met |
| Adapted SUS | **5 out of 100** |
| Steps with recorded difficulty | **5 of 8**: steps 3, 4, 5, 6 and 7 |
| Facilitator help during numbered steps | **At least 2**: steps 4 and 6 |
| Recorded elapsed window | 58 minutes |
| Time per step | **Not recorded** for any of the eight steps |
| Total error events | **Not available.** The sources are step summaries, not an event log |
| Confidence before and after | **Not recorded** |
| Session tokens or cost | **Not available.** Usage percentages exist but cannot be isolated to this task |

Four of the five planned measures are therefore incomplete. This is a gap in the
session record, not a result. The analysis at
[`analysis.md`](../usability/planning-session-2026-10-15/analysis.md) sets out
what would be needed to recover each one.

### Task success

The specification was assessed against the six Plan Approved criteria by Sajad
Ali Akbari. Full reasoning is at
[`assessment.md`](../usability/planning-session-2026-10-15/assessment.md).

| Criterion | Rating |
| --- | --- |
| 1. Every criterion is testable | Partly met |
| 2. No unresolved clarification markers | Not met |
| 3. Assumptions are visible and numbered | Partly met |
| 4. Nothing was invented | Partly met |
| 5. Out of scope is stated | Met |
| 6. The spec matches the project's conventions | Partly met |

All six must be met to pass. The submitted document describes itself as "Draft
for Gate 1 review. Not approved", which is consistent with the rating.

This is a rubric assessment awaiting human review, not a named approver's
sign-off.

### Usability score

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

The arithmetic is verified from transcribed responses. An export from the
original response form has not been checked against them.

**How to read this.** An internal baseline, not a percentage, a pass mark or a
comparison against published norms. Ten responses from one participant cannot
establish how a different reader would score the module, and they do not by
themselves rule out misunderstanding of the items.

### Step by step

| Step | Has a prompt | Recorded category |
| --- | --- | --- |
| 1 Load the context | Yes | None recorded |
| 2 Draft the criteria | Yes | None recorded |
| 3 Read what comes back | **No** | **Blocked** |
| 4 Cut the markers down | Yes | **Blocked**, help recorded |
| 5 Check against the project | Yes | Struggled |
| 6 Answer the blocking questions | **Labelled "no prompt", then gives one** | Needed help |
| 7 Run the checklist | Yes | Struggled |
| 8 Sign off | Yes | Not recorded |

"None recorded" means no issue was noted, which is not independent evidence the
step worked.

### What the participant said

Drawn from William Lor's session notes. Wording differs in places between his
original and cleaned records, so these are reported as noted rather than
certified verbatim. Verify against the recording before quoting them outside
the team.

> "What model do I use?"

> "Quite unsure on how I can check for these things."

> "I assume the numbers are the markers?"

> "What are [answers] in the prompt?"

> "Do I open plan approved gate now?"

> "Hard to understand what is going wording wise."

> "Instructions are extremely vague."

The AI's own output at step 8 is worth recording too:

> "The project does not define what a requirements stage produces, so this list
> is my own."

---

## 3. Issues found

Ten distinct findings. Three block the task, two cost time or weaken the
specification, and five are not yet prioritised. Full detail is in
[`findings.csv`](../usability/csv/planning-and-spec-authoring/findings.csv).

### The pattern

**The module states what each step achieves but not how to do it, and the steps
without a usable prompt are the ones that failed.**

Steps 1 and 2 hand the reader a prompt and raised no issue. Step 3 says "no
prompt" and then asks for three judgements with no method. Step 6 says "no
prompt" and then supplies one anyway. Both are where the participant stopped.

Where a step gives a prompt the reader can paste, they proceed. Where it asks
for judgement without one, they stop. Several findings share that single cause.

### Blocking

**F2. Step 3 cannot be performed as written.** It names three checks and gives a
method for none of them. It is also the first step with no prompt, straight
after two that have one, and the change of format is unsignalled. The
participant could not proceed on his own.

**F3. The marker count was read as a target.** Step 4 says the evidence runs
raised "between 22 and 31 markers". The participant had produced 29 acceptance
criteria, matched his 29 against that range, and began reducing the criteria.
Step 4 reduces clarification markers, which are a different thing. The number
anchored him and the step did not distinguish the two.

**F4. Prompt placeholders are unexplained.** Step 4's `[list]` must be
constructed by the reader first, and the module never says what it holds. He
pasted the prompt without filling it, then entered arbitrary numbers after
clarification, so that output does not reflect a real filter. Step 6's
`[answers]` caused the same problem.

### Costs time or weakens the specification

**F1. The module does not say which model to use.** Nothing names a model or an
effort level. This matters beyond the session: the module's cost table compares
a $1.86 run against a $12.80 run and attributes the gap to rewriting. If those
runs used different models, part of the gap is the model.

**F5. The evidence-run statistics read as noise.** Sentences reporting what
happened in the team's own runs sit inside the instruction steps. They tell the
reader what happened rather than what to do, and F3 shows one of them actively
misled him.

### Not yet prioritised

**F6.** Observations record the AI mixing what to build with how to build it.
That boundary belongs to the design phase.

**F7.** No prompts for saving decisions. Saving needed a facilitator prompt.

**F8.** Step 7's output was too large to review. The participant skimmed it and
rewrote the prompt himself to cut criteria.

**F9.** At step 8 the AI could not find the stage's artifact list and invented
one. The module defines the list in its "Artifacts generated" table, but it is
not in the project's context files and the step 8 prompt does not supply it.

**F10.** Step 6 says "no prompt" and then gives one, the same unsignalled change
of format as step 3.

---

## 4. Changes made

### To the module

**None yet.** Revisions belong to a separate Module ticket and have not been
written or retested. No post-change improvement has been measured, and nothing
in this report establishes that the proposed changes would fix what was found.

The recommended revisions are:

| Finding | Recommended change |
| --- | --- |
| F2 | Give step 3 a concrete method, or a prompt for the mechanical parts |
| F3 | Move the marker figures out of the instruction. State that step 4 reduces markers, not acceptance criteria |
| F4, F10 | Say what each placeholder holds. Split step 6 into getting the answers from a person, then giving them to the AI |
| F5, F8 | Move evidence statistics to "Metrics for success". Make step 7's review manageable |
| F7, F9 | Add save and handoff instructions. Supply the artifact list to the agent |
| F6 | Clarify the boundary between requirements, project constraints and design decisions |
| F1 | Record the model and effort setting used in the evidence runs |

### To how the test was run

**The session moved off the prepared virtual machine partway through.**
Environment changes and latency prevented the participant from committing to the
team repository. The team stopped using the VM and asked him to clone the
session repository to his own machine, work locally, and submit through a fork.

No migration time was measured. The 58 minute window therefore covers an
environment change as well as the task, and none of it should be attributed to
module complexity alone. The local baseline, operating system, tool versions and
dependency state were not recorded, so the two environments cannot be shown to
be equivalent.

### To the test plans

The participant changed from the experienced developers originally named to
computer science students. Both test plans were updated to record this and to
state that the results describe a junior reader.

---

## 5. Limitations

**One participant, one module.** This shows these problems exist. It cannot show
how common they are, or that nothing else is wrong.

**Four of five measures are incomplete.** Per-step timings, total error events,
confidence ratings and session cost were not captured.

**The participant is a student, not an experienced developer.** A senior reader
may supply the missing mechanics from habit and never notice the gaps.

**The model and effort level were not controlled.** Sonnet 5.5 at low effort may
behave differently from whatever produced the module's evidence figures.

**The environment changed mid-session**, and the change is not measured.

**Quotations are drawn from notes, not a verified transcript.**

**No teammate review has been recorded** for the analysis or the gate
assessment, and no named approver has signed off the specification.

---

## Sources

| Document | Author |
| --- | --- |
| [Session findings](../usability/planning-and-spec-authoring-session-findings.md) | Ujjawal Mittal |
| [Cleaned session compilation](../usability/planning-spec-authoring-compiled-cleaned.md) and [CSV data](../usability/csv/planning-and-spec-authoring/) | William Lor |
| [Results analysis](../usability/planning-session-2026-10-15/analysis.md) | Sajad Ali Akbari |
| [Specification assessment](../usability/planning-session-2026-10-15/assessment.md) | Sajad Ali Akbari |
| [Submitted specification](../usability/planning-session-2026-10-15/notes-delete-spec.md) | Bao Nguyen Le |

These are several records of one session, not independent replications.