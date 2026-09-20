# Stage: Planning and Spec Authoring

*Human decision stage. Exits through Gate 1 (plan approved) into Design and
Context Engineering.*

## What changes: traditional vs AI-native

### Standard practice, without AI

This is the stage before any code gets written. A request comes in — a ticket, a
bug report, someone asking for something — and a person has to turn it into
something clear enough to build from.

The recognised standard here is **ISO/IEC/IEEE 29148:2018**, the international
standard for requirements engineering. It covers the processes behind writing
requirements, and it sets out what a well-formed requirement looks like.

That second part is the useful bit. The standard does not just describe a process,
it says what a good requirement actually is. That gives us something solid to
check AI output against later on.

In normal Agile work this shows up as user stories, acceptance criteria, a
definition of done, and someone signing it off before work starts.

At this stage the developer is making decisions, not checking someone else's work.
They decide what gets built, what "done" means, and what gets left out on purpose.

### How AI changes this

**AI does the task: drafting.** GitHub's Spec Kit takes a short feature
description and turns it into a proper spec with user stories and acceptance
criteria. Atlassian's Code Planner does the same starting from a Jira ticket.
Claude Code has a plan mode that keeps planning separate from writing code.

**AI does the task: finding gaps.** The AI reads a draft requirement and points
out what is vague, contradictory, or just missing. Usually these are the cases the
author skipped because they already knew the answer in their own head. This is the
more useful capability and the one people notice less.

**AI recommends, human decides: everything else.** Scope, intent, what counts as
done, which trade-off to accept. The AI cannot settle any of these, because it
does not have the context and does not carry the consequences.

**What AI leaves alone.** The conversation where an unclear point gets sorted out.
The AI can find the question. A person has to answer it.

**The bigger shift.** GitHub describes spec-driven development as turning the
usual order around — the spec no longer serves the code, the code serves the spec.
Whether or not a team goes that far, the point stands. When an AI writes the code,
the spec becomes the most valuable thing a person produces. A vague spec costs a
lot more than it used to.

## Artifacts generated

**The spec.** User stories, acceptance criteria, and a clear statement of what is
out of scope. Every later stage works from this, and Gate 1 approves it.

**A list of resolved questions.** Every `[NEEDS CLARIFICATION]` marker the AI
raised, with the answer and who gave it. Keep it rather than deleting it — six
weeks later, when someone asks why the spec says what it says, this is the record.

**A record of what was cut.** Things the AI suggested that nobody asked for, plus
anything left out on purpose. Stops the same suggestion coming back next sprint.

**The sign-off.** Who approved the spec and when.

*Where these live is not settled yet.* The spec belongs wherever the team already
tracks work — Jira, most likely, for NBN. Whether the questions and the cut list
sit there too or go in the repo is an open question below.

## What to ask the AI

**Turn this into acceptance criteria.**
> "Here is the ticket and the current API response format. Turn this into
> acceptance criteria. Mark anything the ticket does not specify instead of
> assuming a value."

**Tell me what is missing.**
> "Read this spec and list every case it does not cover. Do not suggest fixes —
> just tell me what a developer would run into and have to guess about."

**Push back on it.**
> "What would make this requirement impossible to test? Rewrite anything that
> cannot be checked objectively."

**Check it against the standard.**
> "Go through each requirement and check it is necessary, unambiguous, singular
> and verifiable. Flag any that fail and say which one it failed on."

**What not to ask.** Anything that makes the AI decide — scope, priority, what
done means. Ask it "should we build this?" and you get a confident answer with
nothing behind it.

## What to verify before accepting output

**Use the quality characteristics from ISO/IEC/IEEE 29148 as your checklist.** An
independent standard is much easier to defend than criteria we made up ourselves.

*A note on this table.* The full standard is paywalled and RMIT does not have it,
so this list comes from secondary summaries. Those summaries disagree on whether
there are nine or ten characteristics. Treat it as a working checklist rather than
something verified. More detail in the research doc.

| Characteristic | The question to ask |
|---|---|
| Necessary | Would anything break if we took this out? |
| Appropriate | Is it at the right level, with no implementation detail? |
| Unambiguous | Could this be read two different ways? |
| Complete | Is everything needed to understand it actually here? |
| Singular | Is this one requirement, or several stuck together? |
| Feasible | Can it be built within what we have? |
| Verifiable | Can we prove it was met, objectively? |
| Correct | Does it match what was actually asked for? |
| Conforming | Does it follow our template? |
| Traceable | Can we trace it back to a stated need? |

Then two checks that only apply to AI output.

**Did it make something up?** This is the most common failure here. The AI adds a
requirement that sounds sensible but nobody asked for — an extra notification, an
additional field, an edge case that does not exist in your system. Read every
criterion and ask who actually requested it.

**Did it guess where it should have asked?** Spec Kit deals with this using a
`[NEEDS CLARIFICATION]` marker. The rule is simple: mark anything unclear, and do
not guess. Their example is a login system — instead of quietly assuming email and
password, the AI has to flag that nobody said how people log in.

A spec that comes back with no markers at all is a warning sign, not a win. Real
requests are always missing details. Nothing flagged usually means the AI filled
the gaps itself.

**Watch out for anchoring.** A neat, well-written draft is easy to accept without
really reading it. Treat it as a proposal, not a finished document.

## The reusable skill: mandatory clarification markers

**What it is.** A `SKILL.md` file in the repo that, whenever someone asks for a
spec or acceptance criteria, does five things: writes it in our standard template,
marks every unclear detail with `[NEEDS CLARIFICATION: the question]`, is told
explicitly not to guess, sticks to what and why rather than how, and checks itself
against the characteristics above.

**Why a skill and not just a prompt.** Anthropic's Agent Skills are folders of
instructions that Claude loads when they are relevant. A prompt gets retyped every
time and drifts between people. A skill sits in version control, works the same
for everyone, and improves in one place. That is the difference between a
methodology and a suggestion.

**How it helps the AI.** It narrows the job down. "Write a spec" invites the AI to
fill any silence with something plausible. The skill tells it what good looks
like, what to leave out, and what to do when it does not know. That turns the AI's
worst habit here — guessing confidently — into its most useful output, which is a
list of questions for a person.

**In GitHub Copilot.** Spec Kit is a GitHub product and installs with a Copilot
integration flag. Its commands run as agent skills inside Copilot's chat. Copilot
also reads instruction files committed to the repo, which is Copilot's version of
a `SKILL.md`. Different mechanism, same idea — the team's standards live in the
repo, not in people's habits. If NBN uses Copilot, build the skill as instruction
files. If Claude Code, as a `SKILL.md`. Our framework should name both rather than
tie itself to one vendor.

## Practical angle: what this looks like on a real ticket

Using the same feature as our developer storyboard.

**The ticket.** *"The service status API tells a customer whether their service is
down right now, but not whether a planned outage is scheduled. Add planned outage
information to the existing response."*

**Step 1 — Load the context.** Check the context file for this service is up to
date. Give the AI the ticket and the current response format.

**Step 2 — Ask for a first pass.** Ask for acceptance criteria, with anything
unclear flagged rather than assumed.

**Step 3 — Read what comes back.** Say it returns sensible criteria — start time,
end time and reason, and an empty list when nothing is scheduled — plus three
markers. What happens if an outage gets cancelled. What timezone the dates use.
Whether an outage that has already started belongs here or in the current outage
field.

**Step 4 — Cut what it invented.** It also suggested adding a notification when an
outage is scheduled. Nobody asked for that, so it goes.

**Step 5 — Take the questions to a person.** The three markers go to the product
owner. That conversation is the real work of this stage.

**Step 6 — Run the checklist.** "The API should handle outages sensibly" fails on
unambiguous and verifiable. Rewrite it.

**Step 7 — Sign it off.** A named person agrees it is what should be built. This
is Gate 1, and it is the cheapest place in the whole cycle to catch a mistake.

**Time taken.** Steps 1 to 4 take ten or fifteen minutes. Step 5 takes as long as
it takes. The AI sped up the writing, not the deciding.

## Governance and security touchpoints

- **Agree what may go into a prompt before adopting this stage.** Drafting a
  useful spec needs the ticket and often the existing system behaviour — for NBN
  that could mean customer-facing data structures. A client question, not ours.
- **Security requirements get written here even though nothing enforces them
  here.** The security gate sits between Testing and Deployment. If a requirement
  is not in the spec, no later gate will invent it.
- **Escalate if a clarification marker touches customer data or network
  configuration.** Those are not product-owner decisions.
- **Skills are a security surface.** Anthropic say to use skills only from sources
  you trust. Any skill NBN adopts should be written in-house and reviewed like
  code.

Full treatment in [white-paper/governance/](../governance/).

## How authorship is recorded

The person who signs off the spec owns it. That matches the rest of our framework
— the human whose name is on it is accountable, no matter how much the AI drafted.

**What good practice looks like.** AI-drafted sections marked while the spec is in
review, so the reviewer knows which parts to read hardest. Resolved markers kept
rather than deleted. Sign-off recorded with a name and a date.

**Where it breaks down.** Our governance band records attribution at commit time.
That works once code exists. A spec in Jira or Confluence has no commit, and we
could not find any published convention for recording AI involvement in a
requirements document. So this section says what the team should do rather than
what established practice says. Needs a decision.

## Metrics for success

*There are no established metrics for this stage.* We looked for published
evidence of how organisations measure AI use at the requirements stage and found
almost nothing. Atlassian make the same point about the wider problem — nearly
every engineering team tracks AI usage and token spend, and almost none track
whether it improved anything. The measures below are proposed, not proven.

| Measure | What it tells you |
|---|---|
| Clarification markers raised per spec | Whether the AI is flagging gaps or quietly filling them — zero is the warning sign, not the goal |
| How many markers were real | Whether the AI finds questions worth asking |
| Invented requirements caught at review | How often the AI adds things nobody asked for |
| Spec changes after Gate 1 | Whether the spec held up once work started |
| Time from ticket to signed-off spec | Whether the stage got faster — only useful alongside the quality measures |

**Do not measure** specs produced per week, or how much of a spec the AI wrote.
Both go up when quality goes down.

**The measure we cannot give you** is what a spec costs to produce. Cost and
metrics were proposed for the governance band and dropped, because we could not
find evidence of how anyone tracks it. A developer finishes this stage with no
idea what the drafting cost.

## How this differs by experience level

**Junior developers** get the most out of the AI pointing out gaps, because those
questions are often ones they would not have thought to ask. The risk is the other
side of that — a fluent spec looks authoritative, and they have less to go on when
judging whether an invented requirement is wrong. The rule: every marker goes to a
person, none get resolved by guessing.

**Senior developers** will find the draft mostly formats requirements they already
had in their head. The value moves to the checklist, catching the edge case they
skipped while moving fast. They are also better placed to spot a requirement that
does not belong, because they know the system.

**Both are exposed to anchoring.** Everyone is more likely to accept a well-written
draft than a rough one. Experience reduces that, it does not remove it.

## What this stage does not cover

- **Architecture and technical design** — Design and Context Engineering. This
  stage stays on what and why.
- **Preparing repo context files** — also Design and Context Engineering, although
  the two sit next to each other and often overlap.
- **Building the spec** — Implementation.
- **Writing tests** — Testing and QA, although the acceptance criteria written
  here are what those tests get checked against.
- **Enforcing security** — the Security Gate, between Testing and Deployment.
  Security requirements are written here but not enforced here.

## Open questions

1. **How do we record AI involvement on a spec?** No published convention found,
   and recording at commit time does not work for a Jira ticket. Team decision.
2. **Does a better spec actually produce better code?** That is the claim behind
   spec-driven development. Widely repeated, never independently measured. Should
   be written up as an assumption rather than a finding.
3. **Who signs off at NBN?** Whether Gate 1 should attach to a SAFe ceremony NBN
   already runs rather than being something new. Needs client input.
4. **Does the clarification-marker rule actually work?** Whether it changes what
   the AI produces, or whether it marks a couple of things and guesses the rest.
   Testable in the Sprint 2 demo build.
5. **Can anyone get full access to ISO/IEC/IEEE 29148?** The checklist stays
   unverified until someone can read the standard's own wording.

## Key takeaways

- **This stage is about deciding, not checking.** The AI drafts. The person
  decides scope, intent and what done means.
- **The most useful thing the AI does here is find questions, not write answers.**
  A spec that comes back with nothing flagged is a warning sign.
- **Never let the AI guess.** Anything unclear gets marked, not filled in.
- **The skill is the deliverable, not the prompt.** Instructions in version
  control that work the same for everyone.
- **A vague spec costs more than it used to.** When an AI writes the code, every
  unclear bit gets amplified instead of being absorbed by a person who would have
  just asked.

**Research behind this module:** [research/modules/planning-and-spec-authoring.md](../../research/modules/planning-and-spec-authoring.md)