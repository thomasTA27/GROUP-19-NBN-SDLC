# Stage: Planning and Spec Authoring

*Human decision stage. Exits through Gate 1 (plan approved) into Design and
Context Engineering.*

*Tested on a real feature in Sprint 2. The evidence run and what it changed are in
[white-paper/evidence/planning-and-spec-authoring.md](../evidence/planning-and-spec-authoring.md).*

## What changes: traditional vs AI-native

### Standard practice, without AI

This is the stage before any code gets written. A request comes in — a ticket, a
bug report, someone asking for something — and a person has to turn it into
something clear enough to build from.

The recognised standard is **ISO/IEC/IEEE 29148:2018**, the international standard
for requirements engineering. It covers the processes behind writing requirements,
and sets out what a well-formed requirement looks like.

That second part is the useful bit. It does not just describe a process, it says
what a good requirement actually is — which gives us something solid to check AI
output against later.

In normal Agile work this shows up as user stories, acceptance criteria, a
definition of done, and someone signing it off before work starts.

At this stage the developer is making decisions, not checking someone else's work.
They decide what gets built, what "done" means, and what gets left out on purpose.

### How AI changes this

**AI does the task: drafting.** GitHub's Spec Kit turns a short feature
description into a proper spec with user stories and acceptance criteria.
Atlassian's Code Planner does the same from a Jira ticket. Claude Code has a plan
mode that keeps planning separate from writing code.

**AI does the task: finding gaps.** The AI reads a draft requirement and points
out what is vague, contradictory, or just missing — usually the cases the author
skipped because they already knew the answer in their own head. This is the more
useful capability and the one people notice less.

**AI recommends, human decides: everything else.** Scope, intent, what counts as
done, which trade-off to accept. The AI cannot settle any of these, because it
does not have the context and does not carry the consequences.

**What AI leaves alone.** The conversation where an unclear point gets sorted out.
The AI can find the question. A person has to answer it.

**The bigger shift.** GitHub describes spec-driven development as turning the
usual order around — the spec no longer serves the code, the code serves the spec.
When an AI writes the code, the spec becomes the most valuable thing a person
produces, and a vague spec costs a lot more than it used to.

## Loading the context: the step that matters most

*Rewritten after the Sprint 2 evidence run, which measured what happens when you
skip it.*

Before the first prompt, give the AI the project's own conventions — its context
files, architecture notes and design docs.

**What happens if you skip it.** A spec was written twice on the same feature:
once blind, once after loading the project's `CLAUDE.md` and `docs/`. Of 23
assumptions in the blind version, **8 were contradicted** by the project's actual
architecture. One was structural — the spec described HTTP status codes for a
project that uses Server Actions, which never return them. Three acceptance
criteria described behaviour that could not exist in that codebase.

It also missed **five requirements the project mandates on every feature**: the
fields every document must store, the four places a new collection has to be
registered, the Server Action pattern, the loading and empty states, and the
testing conventions.

**If no context file exists yet.** On a new project it often does not. Then this
step is *create* the context, not load it — write down the conventions,
architecture and what already exists before asking for a spec. That is real work,
not a quick step.

**What it costs.** About five times the token cost of writing blind. See Metrics.

## Artifacts generated

**The spec.** User stories, acceptance criteria, and a clear statement of what is
out of scope. Every later stage works from this, and Gate 1 approves it.

**A numbered assumptions table.** See below — where the decisions the AI made on
your behalf get recorded.

**A list of resolved questions.** Every `[NEEDS CLARIFICATION]` marker, with the
answer and who gave it. Keep it — six weeks later, when someone asks why the spec
says what it says, this is the record.

**A record of what was cut.** Things the AI suggested that nobody asked for, plus
anything left out on purpose.

**The sign-off.** Who approved the spec and when.

*Where these live is not settled.* The spec belongs wherever the team tracks work
— Jira, most likely. Whether the questions and cut list sit there or in the repo
is an open question below.

## What to ask the AI

**Turn this into acceptance criteria.**
> "Here is the ticket and the current API response format. Turn this into
> acceptance criteria. Mark anything the ticket does not specify instead of
> assuming a value."

**Check my spec against the project.**
> "Read the project's context files and docs. Then tell me which of my assumptions
> the project already answers, and which it contradicts. Do not rewrite the spec
> yet."

*Added after the evidence run. This was the single most valuable prompt of the six
— it found eight contradictions and five missing requirements.*

**Cut the questions down.**
> "Reduce the clarification markers to these six only: [list]. For everything else
> that was marked, make a reasonable engineering decision and state it as a
> numbered assumption, each listing which criteria depend on it."

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
independent standard is easier to defend than criteria we made up.

*A note on this table.* The full standard is paywalled and RMIT does not have it,
so this list comes from secondary summaries, which disagree on whether there are
nine or ten characteristics. Treat it as a working checklist, not a verified
quotation.

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

*In the evidence run, "verifiable" earned its place. It caught three criteria that
said "the response handles them as specified" instead of stating what happens —
text that reads like a requirement but cannot be tested.*

Then three checks specific to AI output.

**Did it make something up?** The AI adds a requirement that sounds sensible but
nobody asked for. Read every criterion and ask who actually requested it.

**Did it guess where it should have asked?** Spec Kit handles this with a
`[NEEDS CLARIFICATION]` marker: mark anything unclear, do not guess. Their example
is a login system — instead of assuming email and password, the AI has to flag
that nobody said how people log in.

**Are there too few markers, or too many?** Both are a problem.

*No markers* is a warning sign. Real requests are always missing details, so
nothing flagged usually means the AI filled the gaps itself.

*Too many* is just as unusable. In the evidence run, a small ticket produced 22
markers and a second produced 31. Nobody can take 31 questions to a product owner.
The rule that worked: **keep only the questions that block writing the spec, and
make the AI decide the rest as stated assumptions.** About a fifth survived that
filter both times.

Blocking questions are the ones where you cannot write a testable criterion
without an answer — where data comes from, how a user is matched to a record,
whether a field is required. Everything else — field names, empty-value handling,
ordering, error wording, performance targets — is an engineering decision a
developer can make and a reviewer can correct.

**Watch out for anchoring.** A neat draft is easy to accept without really reading
it. Treat it as a proposal, not a finished document.

## The assumptions table

*Added after the evidence run. The most useful structure to come out of it.*

Once the markers are cut to the blocking ones, everything else becomes a numbered
assumption:

| ID | Assumption | Used by |
|---|---|---|
| A1 | Whitespace is trimmed from the title. After trimming it is 1–100 characters. | AC4, AC13 |
| A2 | Duplicate titles are allowed. | AC4 |

**Why it works.** Each assumption lists the criteria depending on it, so a
reviewer who disagrees with A1 sees immediately what changes. Without that column,
correcting an assumption means re-reading the whole document. Each criterion cites
its assumptions the other way round, so reading a criterion tells you which
decisions it inherited.

**The warning.** Telling the AI to assume rather than ask does not remove the
guessing — it moves it somewhere more respectable-looking. In the evidence run,
the assumptions instruction produced a five-minute data freshness rule and a
two-second timeout nobody asked for, presented as reasonable defaults. Both are
real constraints with cost implications, arriving in the clothes of a considered
decision.

So the assumptions table is not where you stop reading. It is the list to check
hardest — and worth asking the AI which of its own assumptions it considers
weakest, because it will tell you.

## The reusable skill: mandatory clarification markers

**What it is.** A `SKILL.md` in the repo that, whenever someone asks for a spec,
writes it in our template, marks every unclear detail with
`[NEEDS CLARIFICATION: the question]`, is told explicitly not to guess, sticks to
what and why rather than how, and checks itself against the characteristics above.

**Why a skill and not a prompt.** Anthropic's Agent Skills are folders of
instructions Claude loads when relevant. A prompt gets retyped and drifts between
people. A skill sits in version control, works the same for everyone, and improves
in one place. That is the difference between a methodology and a suggestion.

**How it helps the AI.** It narrows the job. "Write a spec" invites the AI to fill
silence with something plausible. The skill tells it what good looks like, what to
leave out, and what to do when it does not know — turning the AI's worst habit
here into its most useful output, a list of questions for a person.

**In GitHub Copilot.** Spec Kit is a GitHub product and installs with a Copilot
integration flag; its commands run as agent skills in Copilot's chat. Copilot also
reads instruction files committed to the repo, which is its version of a
`SKILL.md`. Different mechanism, same idea. If NBN uses Copilot, build the skill
as instruction files; if Claude Code, as a `SKILL.md`.

*Not yet tested.* The evidence run applied the marker rule by prompting each time
rather than through a committed skill. Whether a skill produces the same behaviour
unprompted is still open.

## Practical angle: what this looks like on a real ticket

*Run for real in Sprint 2. The numbers below are from that run.*

**The ticket.** *"A user can create, read, update and delete their own tasks, each
with a title, description and due date."*

**Step 1 — Load the context.** Open the project's context files and docs. If none
exist, write them first. Give the AI the ticket.

**Step 2 — Ask for a first pass** with anything unclear flagged rather than
assumed.

**Step 3 — Read what comes back.** Nine criteria and 31 markers. Three criteria
were not testable — they said the system "handles it as specified" rather than
stating what happens.

**Step 4 — Cut the markers down.** Six of the 31 were blocking: whether each field
is required, whether the date includes a time, whether past dates are allowed, and
what status a new record starts in. The other 25 became assumptions.

**Step 5 — Check the spec against the project.** This step did not exist in the
first version of this module. It found eight contradictions and five missing
requirements.

**Step 6 — Take the blocking questions to a person.** Two were settled by the
team's design mock-up. Four were product decisions — on a mock project with no
product owner, the BA decided them and recorded that they were not client
decisions.

**Step 7 — Run the checklist** against every criterion.

**Step 8 — Sign it off.** A named person agrees it is what should be built. This
is Gate 1, the cheapest place in the cycle to catch a mistake.

**Time and cost.** About 60 minutes of a person's time, six prompts, and $1.86.
The AI ran for six and a half minutes of that hour. It sped up the writing, not
the deciding.

## Governance and security touchpoints

- **Agree what may go into a prompt before adopting this stage.** Drafting a spec
  needs the ticket and often the existing system behaviour — for NBN that could
  mean customer-facing data structures. A client question, not ours.
- **Security requirements get written here even though nothing enforces them
  here.** The security gate sits between Testing and Deployment. If a requirement
  is not in the spec, no later gate will invent it.
- **Escalate if a clarification marker touches customer data or network
  configuration.** Those are not product-owner decisions.
- **Skills are a security surface.** Anthropic say to use skills only from trusted
  sources. Any skill NBN adopts should be written in-house and reviewed like code.

Full treatment in [white-paper/governance/](../governance/).

## How authorship is recorded

The person who signs off the spec owns it. The human whose name is on it is
accountable, no matter how much the AI drafted.

**Good practice.** AI-drafted sections marked while the spec is in review, so the
reviewer knows which parts to read hardest. Resolved markers kept rather than
deleted. Sign-off recorded with a name and a date.

**Where it breaks down.** Our governance band records attribution at commit time.
That works once code exists. A spec in Jira or Confluence has no commit, and we
found no published convention for recording AI involvement in a requirements
document. This section says what the team should do rather than what established
practice says. Needs a decision.

## Metrics for success

*Updated after the Sprint 2 run. This section used to say cost could not be
measured at this stage. It can.*

**What a spec costs.** Measured on one feature, in Claude Code:

| | Cost |
|---|---|
| Written with no context loaded | $0.32 |
| Rewritten with the project's context loaded | $1.54 |
| Extended to a larger feature | +$0.32 |

Loading context is roughly five times the cost of writing blind, and it is the
expensive part. Extending an existing spec is cheap — 95% of the input came from
cache in the run that produced these figures.

For comparison: the blind spec contradicted the architecture in eight places and
omitted five mandatory requirements. The $1.22 difference buys a spec a developer
can actually build from.

**Time.** 60 minutes of a person's time for one feature, of which the AI ran for
six and a half minutes. Treat any "the AI wrote it in a minute" claim with that
ratio in mind.

**What else is worth measuring.** Proposed rather than proven — no published
evidence exists for how organisations measure this stage, and Atlassian observe
the same gap.

| Measure | What it tells you |
|---|---|
| Clarification markers per spec | Whether the AI is flagging gaps or filling them — zero is a warning sign, and so is thirty |
| Share of markers that survived filtering | Whether the AI finds questions worth asking. About a fifth, in our run |
| Invented requirements caught at review | How often the AI adds things nobody asked for |
| Assumptions a reviewer corrected | Whether the AI's defaults match the team's |
| Spec changes after Gate 1 | Whether the spec held up once work started |
| Time from ticket to signed-off spec | Whether the stage got faster — only useful alongside the quality measures |

**Do not measure** specs produced per week, or how much of a spec the AI wrote.
Both go up when quality goes down.

## How this differs by experience level

**Junior developers** get the most from the AI pointing out gaps, because those
questions are often ones they would not have thought to ask. The risk is the other
side of that — a fluent spec looks authoritative, and they have less to go on when
judging whether an invented requirement is wrong. The rule: every marker goes to a
person, none get resolved by guessing. This applies double to the assumptions
table, where a two-second timeout can read as a formality rather than a real
constraint.

**Senior developers** will find the draft mostly formats requirements they already
had in their head. The value moves to the checklist, catching the edge case they
skipped while moving fast. They are also better placed to spot a requirement that
does not belong.

**Both are exposed to anchoring.** Everyone is more likely to accept a well-written
draft than a rough one. Experience reduces that, it does not remove it.

## What this stage does not cover

- **Architecture and technical design** — Design and Context Engineering. This
  stage stays on what and why.
- **Preparing repo context files** — also Design and Context Engineering. Note
  that this stage *reads* the context files; that stage *writes* them.
- **Building the spec** — Implementation.
- **Writing tests** — Testing and QA, although the acceptance criteria written
  here are what those tests get checked against.
- **Enforcing security** — the Security Gate, between Testing and Deployment.
  Security requirements are written here but not enforced here.

## Open questions

1. **How do we record AI involvement on a spec?** No published convention found,
   and recording at commit time does not work for a Jira ticket. Team decision.
2. **Does a better spec actually produce better code?** The claim behind
   spec-driven development. Widely repeated, never independently measured.
3. **Who signs off at NBN?** Whether Gate 1 should attach to a SAFe ceremony NBN
   already runs. Needs client input.
4. **Does the marker rule work as a committed skill?** The evidence run applied it
   by prompting each time. Untested as a `SKILL.md`.
5. **Can anyone get full access to ISO/IEC/IEEE 29148?** The checklist stays
   unverified until someone reads the standard's own wording.
6. **Is the marker rule still needed once the assumptions pattern is in place?**
   They overlap, and it is not clear the first does work the second could not.

## Key takeaways

- **This stage is about deciding, not checking.** The AI drafts. The person
  decides scope, intent and what done means.
- **Load the project's context first.** Skipping it produced a spec that
  contradicted the architecture in eight places and omitted five mandatory
  requirements.
- **Too few markers and too many are both failures.** Zero means the AI guessed.
  Thirty means nobody can act on them.
- **Assumptions are where the guessing hides.** Telling the AI to decide rather
  than ask moves the invention somewhere that looks considered. Read them hardest.
- **A vague spec costs more than it used to.** When an AI writes the code, every
  unclear bit gets amplified instead of being absorbed by a person who would have
  just asked.

**Research behind this module:** [research/modules/planning-and-spec-authoring.md](../../research/modules/planning-and-spec-authoring.md)

**Evidence this module was tested against:** [white-paper/evidence/planning-and-spec-authoring.md](../evidence/planning-and-spec-authoring.md)