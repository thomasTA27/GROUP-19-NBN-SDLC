# Session findings: Planning and Spec Authoring

**Participant:** Mark Nguyen (P1), computer science student
**Facilitator:** Ujjawal Mittal
**Date:** 2026-10-15
**Module tested:** `white-paper/modules/planning-and-spec-authoring.md`
**Model used:** Claude Sonnet 5.5, low effort
**Task time:** approximately 60 minutes

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

