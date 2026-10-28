# Gate 1: Plan Approved

*The exit gate of Planning and Spec Authoring. A feature's Design and Context
Engineering work starts only from a spec version that has passed it.*

## What this gate is

A blocking checkpoint. No new work happens in it. A named approver reads the
spec and either approves it or sends it back.

We place the gate here because a wrong requirement caught now costs a revision
of the spec. Caught after the code exists, it costs rework, and a reviewer
facing finished code may feel pressure to let it through.

## Who approves

**One named approver**, recorded in Planning's `review.md` with the date and the
spec version they reviewed.

The approver is a tech lead or senior developer. They check that the criteria
can be built and are consistent with the binding rules. The product owner and
rule owners don't approve the spec as well, because their agreement is already
recorded as their Correct confirmations under Person checks.

The approver is never the spec's author, which is what makes this a gate.

## What gets checked

First, the approver confirms that `review.md` names every role and that its
Person checks are complete, with the technical reviewer's Feasible finding and
each decision owner's Correct confirmation for the criteria they own. Then they
apply six checks. These match Planning's Step 8 checklist, so an author who
works through that list should pass. If anything fails, the spec goes back.

The approver also reads the criteria against the request and judges whether they
describe what was asked for. No tool can make that judgement, and it is why this
gate is a person.

**1. Every criterion is testable.** No requirement that says the system "handles
it as specified" or "behaves appropriately". A tester must be able to write a
test from it without asking what it means.

**2. No open questions.** No `[NEEDS CLARIFICATION]` marker remains and no
question's Answer is Open. Each answer cites its source, a named and dated
decision, or the Design handoff item it was passed to. Each Design handoff item
asks only how to build something, with no required behaviour left undefined.

**3. Assumptions are numbered and settled.** Every assumption is numbered and
linked to the criteria that depend on it, and its owner has confirmed or
rejected it, so none is Pending. The criteria reflect each outcome. The approver
reads these closely, because this is where invented requirements hide.

**4. Nothing was invented.** Every criterion and constraint cites the request,
including any mock-up supplied with it, a binding rule or a recorded decision,
and no behaviour, limit or number is left without a source. Anything without one
goes back to the author, who asks its decision owner whether it belongs. If it
does, that answer is recorded as a decision and becomes its source. Only the
owner can remove it, and the removal is recorded under Removed.

**5. Out of scope is stated.** The spec says what the feature deliberately does
not do, and the product owner has confirmed it, so it does not get added back
later.

**6. No open conflicts.** No missing binding rule or contradiction with a
binding rule is still open, and no contradiction within the spec is open unless
it was dismissed with a reason in `review.md`. An open conflict fails this check
whatever the AI reported.

Checks 1 and 4 draw on the Verifiable and Traceable rows of Planning's quality
checklist. Check 2 follows GitHub Spec Kit's clarification markers. Checks 3, 5
and 6 are this methodology's own.

## What happens when it fails

The approver lists each failing check in `review.md` against the version they
reviewed, and the spec stays Draft. It does not go forward with a note to fix it
later, because then the gate no longer blocks anything. The author fixes it in
the Planning step that covers the failed check and sends a new version, as
Planning's Step 8 describes.

| Failed check | Planning steps |
|---|---|
| Person checks or roles | Before you start, Step 7 |
| 1. Testable | Steps 3 and 7 |
| 2. Open questions | Steps 4 to 6 |
| 3. Assumptions | Steps 4 and 6 |
| 4. Nothing invented | Steps 3 and 7 |
| 5. Out of scope | Step 6 Part A |
| 6. Open conflicts | Steps 5 and 7 |

A return here is normal.

## How approval is recorded

The approver records the decision in `review.md` with their name, the date and
the spec version they reviewed, and that entry is committed first. On approval,
the author then commits the Status change to Approved on its own, tagged for
example `spec-<feature>-v0.1-approved`. Design finds the approved copy by that
tag. A team that keeps specs in Jira or Confluence uses their version history in
place of tags, as Planning describes.

## When the spec changes after approval

Design never edits an approved spec. It raises a spec change request, and the
spec returns to Draft while the request is open. Design carries on with items
the request doesn't affect, from the last approved tag. If the answer adds or
changes a criterion, constraint, scope item or assumption, the new version goes
through all six checks again. Otherwise the approver confirms in `review.md`
that nothing changed in substance. Either way the spec gets a new Version and a
new approved tag.

## What AI tooling supports this review

**Plan mode** is the closest thing to this pattern in the tools. In Copilot CLI,
`/plan` has Copilot write a plan and wait for approval before implementing. In a
local VS Code session, Copilot's Plan agent researches the project without
editing files by default, then hands off to implementation. In Claude Code, plan
mode blocks edits until the developer approves the plan or leaves plan mode,
except in sessions set up to bypass permissions. When a Claude Code plan is
ready, the developer can approve it and let Claude work, approve it and review
each edit, or keep planning with feedback.

Plan mode approves the AI's plan of work. This gate approves the spec, so plan
mode supports it without replacing it. What carries over is that a gate has to
allow "no, do it differently" as an outcome.

**GitHub Spec Kit** marks open questions with `[NEEDS CLARIFICATION]`, the
marker check 2 relies on, and has the AI check a spec against checklists that
an earlier version of its README described as "unit tests for English". That is
useful before the gate, but it is the AI reviewing its own output, which
Planning says is not approval.

**The limit of these tools.** Tooling can check that markers are resolved and
criteria are phrased testably. It cannot check whether the spec describes the
right thing, which is the approver's judgement described under What gets
checked.

## Sources

**1. Claude Code: Choose a permission mode**
https://code.claude.com/docs/en/permission-modes
*Vendor documentation.* Source for plan mode blocking edits until a plan is
approved or the developer leaves plan mode, the bypass-permissions exception,
and the options available when a plan is ready.

**2. Visual Studio Code: Plan work with agents in VS Code**
https://code.visualstudio.com/docs/agents/run/planning
*Vendor documentation.* Source for Copilot's Plan agent researching without
editing files by default in a local session, then handing off to implementation.

**3. GitHub: Best practices for GitHub Copilot CLI**
https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices
*Vendor documentation.* Source for `/plan` writing a plan and waiting for
approval before implementing.

**4. GitHub: Spec Kit, Specification-Driven Development**
https://github.com/github/spec-kit/blob/main/spec-driven.md
*Vendor documentation, open source.* Source for the `[NEEDS CLARIFICATION]`
marker. The current README no longer describes the checklist command. An
earlier version, preserved in forks such as https://github.com/evm/spec-kit,
describes checklists as "unit tests for English".

## Open questions

- Who the approver is at NBN, and who owns its security, privacy and network
  rules. This needs client input.