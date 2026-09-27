# Gate: Plan Approved

*Sits between Planning and Spec Authoring, and Design and Context Engineering.
Nothing moves to the next phase until this gate passes.*

## What this gate is

A blocking checkpoint. No work happens in it — a named person reads the spec and
either approves it or sends it back.

The point is cost. Catching a wrong approach here takes minutes. Catching the same
mistake after the code exists takes hours, and the reviewer is under pressure to
approve rather than restart.

## Who approves

**One named person**, and their name is recorded with the date.

| Who | When |
|---|---|
| Tech lead or senior developer | Default. They check the approach is buildable and matches how the codebase works. |
| Product owner | When the spec changes what the product does, not just how it is built. |
| Both | When a clarification question touched customer data, network configuration, or anything with a regulatory angle. |

The approver must not be the person who wrote the spec. That is the whole point of
a gate.

**Who this is at NBN is not yet known.** Needs client input.

## What gets checked

Six things. If any fail, the spec goes back.

**1. Every criterion is testable.** No requirement that says the system "handles
it as specified" or "behaves appropriately". A tester must be able to write a test
from it without asking what it means.

**2. No unresolved clarification markers.** Every `[NEEDS CLARIFICATION]` has an
answer, and the answer is recorded with who gave it.

**3. Assumptions are visible and numbered.** Anything the AI decided rather than
asked about is listed, with the criteria that depend on it. The approver reads
these hardest — this is where invented requirements hide.

**4. Nothing was invented.** Every requirement traces back to the ticket, the
design, or a recorded decision. If nobody asked for it, it comes out.

**5. Out of scope is stated.** What the feature deliberately does not do, written
down, so it does not get added back later.

**6. The spec matches the project's conventions.** The AI read the project's
context files and the spec does not contradict them.

Criteria 1 and 4 come from the ISO/IEC/IEEE 29148 characteristics used in the
Planning module. The rest came out of testing the module on a real feature.

## What happens when it fails

The spec goes back to the author with the failing item named. It does not go
forward with a note saying "fix this later" — that is how a gate stops being a
gate.

A failure here is cheap and expected. In our own evidence run, the first draft
failed on criterion 1: three of nine acceptance criteria were not testable.

## What AI tooling supports this review

**Claude Code plan mode** is the closest thing to this gate implemented in a tool.
Claude reads files and explores but does not edit source until a plan is approved.
It is a permission boundary rather than a convention — the edit tools are blocked
until approval, so a developer cannot skip it by accident.

When the plan is ready, the approver can approve and let Claude work
automatically, approve but review each edit, or keep planning with feedback. That
third option is the one that matters here: a gate has to allow "no, do it
differently" as an outcome.

**GitHub Spec Kit** treats its checklists as unit tests for the specification —
no clarification markers remaining, requirements testable and unambiguous, success
criteria measurable. That is the same idea as this gate, run by the tool rather
than a person.

**The limit of both.** Tooling can check that markers are resolved and criteria
are phrased testably. It cannot check whether the spec describes the right thing.
That is what the human is for, and it is why this gate is a person and not a
script.

## Sources

**1. Claude Code — Choose a permission mode**
https://code.claude.com/docs/en/permission-modes
*Vendor documentation.* Source for plan mode as an enforced approval step, and
for the approve/revise options available at the gate.

**2. GitHub — Spec Kit: Specification-Driven Development**
https://github.com/github/spec-kit/blob/main/spec-driven.md
*Vendor documentation, open source.* Source for specification checklists as
"unit tests for the specification".

**3. ISO/IEC/IEEE 29148:2018 — Requirements engineering**
https://www.iso.org/standard/72089.html
*Standards body.* The quality characteristics behind criteria 1 and 4. Note the
full standard is paywalled and not held by RMIT — see the Planning module for the
access caveat.

**4. Our own evidence run**
[white-paper/evidence/planning-and-spec-authoring.md](../../evidence/planning-and-spec-authoring.md)
Criteria 2, 3, 5 and 6 came from running the Planning module on a real feature and
recording what the gate would have needed to catch.

## Open questions

- Whether approval is recorded in the ticket, the repo, or both. A spec in Jira
  has no commit to attach a sign-off to.