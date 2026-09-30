# Stage: Planning and Spec Authoring

_Exits through Gate 1 into Design & Context Engineering. Tested twice on Task CRUD in Sprint 2. See [the evidence](../evidence/planning-and-spec-authoring.md)._

## What changes: traditional vs AI-native

### Standard practice, without AI

A request arrives: a ticket, a bug report, someone asking for something. A person
turns it into something clear enough to build from.

The recognised standard is **ISO/IEC/IEEE 29148:2018**, the international standard
for requirements engineering. It covers the processes behind writing requirements
and defines what a well-formed requirement looks like. That definition is what we
use, because it gives an independent measure to check AI output against.

In Agile practice this is user stories, acceptance criteria, a definition of done,
and a sign-off before work starts.

The developer is making decisions here, not checking someone else's work. They
decide what gets built, what "done" means, and what is deliberately excluded.

### How AI changes this

**AI does the task: drafting.** It turns a short ticket into structured acceptance
criteria in minutes.

**AI does the task: finding gaps.** It points out what is vague, contradictory or
unmentioned. These are usually the cases the author skipped because the answer was
already in their head. This is the more valuable capability and the less obvious
one.

**AI recommends, the human decides: everything else.** Scope, intent, what counts
as done, which trade-off to accept. The AI lacks the context and carries none of
the consequences.

**AI leaves alone:** the conversation where an unclear point gets resolved. The AI
finds the question. A person answers it.

When an agent writes the code, the spec becomes the most valuable artifact a
person produces. Every ambiguity is amplified rather than absorbed by a developer
who would have asked.

## Artifacts generated

| Artifact | What it is | Who uses it |
|---|---|---|
| The spec | Acceptance criteria and an out-of-scope statement | Every later stage. Approved at Gate 1 |
| Assumptions table | Numbered, each listing the criteria that depend on it | The Gate 1 approver, and Design if it overturns one |
| Resolved questions | Each blocking question, its answer, and who gave it | Anyone asking later why the spec says what it says |
| Record of what was cut | What the AI proposed that nobody requested | Prevents the same suggestion returning next sprint |
| Sign-off | Name and date | The governance trail |

*Where these live is unresolved.* The spec belongs wherever the team tracks work.
Whether the rest sits there or in the repository is an open question below.

## AI-Assisted Workflow

| Step | What happens | Who |
|---|---|---|
| 1 | Load the project's context files | Developer |
| 2 | AI drafts criteria and marks everything it does not know | AI |
| 3 | Read it. Check for invented rules and untestable criteria | Developer |
| 4 | Cut the markers to the blocking ones. The rest become assumptions | Developer decides, AI applies |
| 5 | Check the spec against the project's own rules | AI |
| 6 | Take the blocking questions to a person | Product owner |
| 7 | Run the quality checklist | AI, developer confirms |
| 8 | Sign off at Gate 1 | Named approver |

**Steps 4 and 6 are the human ones.** Everything else can be prompted. If the AI
is doing either, the stage has stopped working.

**Step 5 is necessary even though step 1 loaded the context.** Both evidence runs
found mandated requirements the first pass had missed: five in one run, six in the
other. The second run had loaded context in its very first prompt. Loading context
early narrows the gap without closing it.

## What to ask the AI

### Step 1: load the context

> "Read the project's context files and documentation before we start. Tell me
> what conventions apply to a new feature: what every record must store, where new
> code lives, what patterns are mandatory."

If no context files exist, this step is to write them. On a new project that is
substantial work and should be budgeted for.

### Step 2: draft the criteria

> "Here is the ticket: [ticket]. Turn it into acceptance criteria. Mark anything
> the ticket does not specify with `[NEEDS CLARIFICATION: the question]` instead
> of assuming a value. Do not guess. Do not write code."

### Step 3: read what comes back

No prompt. Check two things: whether it invented a requirement nobody asked for,
and whether every criterion is testable rather than saying the system "handles it
as specified".

### Step 4: cut the markers down

Expect twenty to thirty markers. Both evidence runs produced that on small
tickets, and roughly a fifth survived.

**The filter:** a question is blocking if you cannot write a testable criterion
without the answer. Where data comes from, how a user is matched to a record,
whether a field is required. Field names, ordering, error wording and performance
targets are engineering decisions a developer can make and a reviewer can correct.

> "Reduce the clarification markers to these only: [list]. For everything else
> that was marked, make a reasonable engineering decision and state it as a
> numbered assumption. Label each assumption's source: Rule if the project
> requires it, Precedent if another feature does it that way, Ticket if it comes
> from the ticket, Decision if you chose it."

Then, before moving on:

> "Which of your assumptions are weakest, and why? Do not change the spec."

In both evidence runs this flagged what a reviewer would have challenged, plus one
or two nobody had noticed.

### Step 5: check the spec against the project

> "Read the project's context files and docs. Which of my assumptions does the
> project already answer, and which does it contradict? Do not rewrite the spec
> yet."

Then, once you have read the list:

> "Fix every contradiction. Correct any source you overstated. Add anything the
> project requires on every feature that this spec is missing."

### Step 6: answer the blocking questions

No prompt. A person decides. Then:

> "Here are the answers: [answers]. Rewrite the affected criteria. Flag anything
> that now clashes with a project rule rather than quietly picking a side."

### Step 7: run the checklist

> "Go through each criterion and check it is necessary, unambiguous, singular and
> verifiable. Flag any that fail and say which one it failed on."

### Step 8: sign off

> "List every artifact this stage should produce and confirm each one is present."

A named person then approves at Gate 1. See
[the Plan Approved gate](gates/plan-approved.md).

### Using a skill instead of prompting

The step 2 and step 4 prompts are identical every time, which makes them a
candidate for a **skill**: a `SKILL.md` committed to the repository that the AI
loads when someone asks for a spec. A prompt is retyped and drifts between people.
A skill works the same for everyone and improves in one place.

In **GitHub Copilot** the equivalent is a custom instruction file in the
repository. GitHub's Spec Kit already ships this pattern, installing with a
Copilot integration and running its commands as agent skills in Copilot's chat.

*Untested.* Both evidence runs prompted each time rather than using a committed
skill.

## What to verify before accepting output

**Use the ISO/IEC/IEEE 29148 quality characteristics.** An independent standard is
easier to defend than criteria we wrote ourselves.

*Caveat.* The full standard is paywalled and not held by RMIT, so this list comes
from secondary summaries that disagree on whether there are nine or ten
characteristics. Treat it as a working checklist rather than a verified quotation.
The step 7 prompt covers only four of the ten. The rest are yours to check, and
"conforming" cannot be checked until the repository has a spec template.

| Characteristic | The question to ask |
|---|---|
| Necessary | Would anything break if we removed it? |
| Appropriate | Is it at the right level, with no implementation detail? |
| Unambiguous | Could this be read two ways? |
| Complete | Is everything needed to understand it here? |
| Singular | Is this one requirement or several? |
| Feasible | Can it be built within our constraints? |
| Verifiable | Can we prove it was met, objectively? |
| Correct | Does it match what was asked for? |
| Conforming | Does it follow our template? |
| Traceable | Can we trace it to a stated need? |

Three further checks apply specifically to AI output.

**Did it invent anything?** Read every criterion and ask who requested it.

**Are there too few markers, or too many?** Zero means the AI filled the gaps
itself. Thirty means nobody can act on them. Both are failures.

**Did the assumptions reintroduce the guessing?** This is the one to watch
hardest. Telling the AI to assume rather than ask does not remove invention. It
relocates it somewhere that looks considered. Across the two runs this produced a
five-minute freshness rule, a two-second timeout, three-second list updates, due
dates to the year 9999, screen width limits, a thousand-task capacity and a
five-second clock tolerance. None were requested. All arrived as reasonable
defaults.

**Know when to stop.** Each round of "make it testable" adds more numbers. One run
went from 168 to 346 lines and 25 to 38 assumptions across its later prompts. If a
pass only adds constraints nobody asked for, the spec is finished.

## Governance and security touchpoints

- **Agree what may go into a prompt before adopting this stage.** Drafting needs
  the ticket and often the existing system behaviour. For NBN that could mean
  customer-facing data structures. This is a client decision.
- **Security requirements are written here but not enforced here.** The security
  gate sits between Testing and Deployment. If a requirement is absent from the
  spec, no later gate will invent it.
- **Escalate any blocking question touching customer data or network
  configuration.** Not a product-owner decision.
- **Skills are a security surface.** Anthropic's guidance is to use skills only
  from trusted sources. Anything NBN adopts should be written in-house and
  reviewed like code.

Full treatment in [white-paper/governance/](../governance/).

## How authorship is recorded

The person who signs off owns the spec, regardless of how much the AI drafted.

**Practice:** AI-drafted sections marked while the spec is in review, so the
reviewer knows what to read hardest. Resolved markers kept rather than deleted.
Sign-off recorded with a name and a date.

**Unresolved.** Our governance band records attribution at commit time, which
works once code exists. A spec in Jira has no commit, and no published convention
exists for recording AI involvement in a requirements document. This describes
what the team should do, not established practice.

## In practice

From the first evidence run, on the Task CRUD ticket.

**Steps 1 and 2.** Context loaded, ticket given. The result was nine criteria and
31 markers. Three criteria were not testable, saying the system "handles it as
specified".

**Step 4.** Six of the 31 were blocking: whether each field is required, whether
the date includes a time, whether past dates are allowed, and what status a new
record starts in. The other 25 became assumptions.

**Step 5.** Found eight contradictions with the project's architecture and five
mandated requirements the spec had missed. The blind first pass had described HTTP
status codes for a project that uses Server Actions and never returns them.

**Step 6.** Two questions were settled by the team's design mock-up. Four were
product decisions. With no product owner on a mock project, the BA decided them
and recorded that they were not client decisions.

**Steps 7 and 8.** Checklist run, spec signed off at Gate 1.

**Cost.** 60 minutes of a person's time, six prompts, $1.86. The AI ran for six
and a half minutes of that hour.

A second run by a different person reached six blocking questions from 25 markers,
the same proportion, and hit the same invented-numbers problem.

## Metrics for success

**What a spec costs.** Measured twice on the same ticket:

| | Prompts | AI time | Cost |
|---|---|---|---|
| Run 1 | 6 | 6m 26s | $1.86 |
| Run 2 | 8 | 45m 51s | $12.80 |

The difference is not context loading but repeated rewriting. Run 2 added 685
lines and removed 375 across eight prompts, with 85% of usage above 150k tokens.
**Each testability pass costs more than the one before.** Budget for the rewrites,
not the first draft.

On a subscription rather than API billing there is no dollar figure. Record tokens
from the session log instead.

**What else is worth measuring.** Proposed, not proven. No published evidence
exists for how organisations measure this stage.

| Measure | What it tells you |
|---|---|
| Markers raised in the first pass | Whether the AI is flagging gaps or filling them |
| Share surviving the filter | About a fifth in both runs. A steady figure suggests the rule is sound |
| Invented numbers in the assumptions | The failure mode specific to this stage |
| Assumptions a reviewer corrected | Whether the AI's defaults match the team's |
| Spec changes after Gate 1 | Whether the spec held once work started |

**Do not measure** specs per week, or how much of a spec the AI wrote. Both rise
as quality falls.

## How this differs by experience level

**Junior developers** gain most from the gap-finding, because those questions are
often ones they would not have known to ask. The risk is the reverse: a fluent
spec looks authoritative, and they have less to judge an invented requirement
against. Every marker goes to a person. This applies doubly to the assumptions
table, where a two-second timeout reads as a formality rather than a real
constraint.

**Senior developers** will find the draft mostly formats requirements they already
held. The value moves to the checklist, catching the edge case they skipped while
moving quickly, and to noticing a requirement that does not belong.

**Both face anchoring.** Everyone accepts a well-written draft more readily than a
rough one.

## What this stage does not cover

- **Architecture and technical design.** Design & Context Engineering. This stage
  stays on what and why.
- **Writing context files.** Also Design & Context Engineering. This stage reads
  them; that stage writes them.
- **Building the spec.** Implementation.
- **Writing tests.** Testing & QA, although the criteria written here are what
  those tests check against.
- **Enforcing security.** The Security Gate. Security requirements are written
  here but not enforced here.

## Open questions

1. **Where a sign-off gets recorded.** A spec in Jira has no commit. The same gap
   appears in the Plan Approved gate.
2. **Whether a committed skill behaves like prompting.** Both runs prompted each
   time.
3. **Whether a spec is buildable without asking the author.** Only answered when
   somebody builds from one.
4. **Who signs off at NBN.** Client input needed.
5. **ISO/IEC/IEEE 29148 remains unverified.** Paywalled and not held by RMIT.
6. **The repository has no spec template**, so "conforming" cannot be checked.
   A team decision affecting every stage.

## Key takeaways

- **Steps 4 and 6 are the human ones.** If the AI is doing either, the stage has
  stopped working.
- **Load the context first, then check against it again at step 5.** Loading early
  narrows the gap without closing it. Both runs found mandated requirements at
  step 5.
- **Too few markers and too many are both failures.** Zero means it guessed.
  Thirty means nobody can act on them.
- **Assumptions are where the guessing hides.** Telling the AI to decide rather
  than ask relocates the invention somewhere that looks considered.
- **The rewrites cost more than the first draft.** $1.86 against $12.80 on the
  same ticket, driven by repeated testability passes rather than context.

**Research behind this module:** [research/modules/planning-and-spec-authoring.md](../../research/modules/planning-and-spec-authoring.md)

**Evidence this module was tested against:** [white-paper/evidence/planning-and-spec-authoring.md](../evidence/planning-and-spec-authoring.md)