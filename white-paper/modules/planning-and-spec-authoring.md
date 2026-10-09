# Stage: Planning and Spec Authoring

_Exits through Gate 1, a Human-Decision checkpoint, into Design & Context Engineering. Tested twice on Task CRUD in Sprint 2. The spec began as Create Task and was extended to full CRUD. Design takes the Create Task slice forward. See [the evidence](../evidence/planning-and-spec-authoring.md)._

## What changes: traditional vs AI-native

### Standard practice, without AI

A request arrives: a ticket, a bug report, someone asking for something. A person turns it into user stories, acceptance criteria and a definition of done, signed off before work starts. They decide what gets built, what "done" means and what is deliberately excluded.

The recognised standard is **ISO/IEC/IEEE 29148:2018**, which defines what a well-formed requirement looks like. We use that definition as an independent measure to check AI output against.

### How AI changes this

**AI performs the task, human checks:** drafting criteria from a short ticket, and finding gaps: what is vague, contradictory or unmentioned, usually the cases the author skipped because the answer was already in their head. Gap-finding is the more valuable of the two.

**AI proposes, humans decide:** scope, intent, what counts as done, which trade-off to accept. The AI lacks the context and carries none of the consequences.

**Untouched by AI:** answering the questions. The AI finds them; a person answers them.

When an agent writes the code, the spec becomes the most valuable artifact a person produces. Every ambiguity is amplified rather than absorbed by a developer who would have asked.

## Artifacts generated

| Artifact | What it is | Who uses it |
|---|---|---|
| The spec | Acceptance criteria, each naming its source, and an out-of-scope statement | Every later stage. Approved at Gate 1 |
| Assumptions table | Numbered, each listing the criteria that depend on it | The Gate 1 approver, and Design, which confirms or overturns the Decision-labelled ones |
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
| 6 | Take the blocking questions to a person | Product owner (see step 6 if there isn't one) |
| 7 | Run the quality checklist | AI, developer confirms |
| 8 | Sign off at Gate 1 | Named approver |

**Steps 4 and 6 are the judgement calls:** which questions block, and what the answers are. Steps 3 and 8 are also a person's, but they check and approve rather than decide.

**Step 5 still runs when step 1 has loaded the context.** See step 5 for why.

## What to ask the AI

Some prompts and rules were added after the evidence runs and have not been tested yet. These are the seven-quality checklist and the three fixes in step 7, the approver rule in step 8, and the process for when Design sends the spec back.

Send one prompt per message, so you can tell which prompt caused which change.

### Step 1: load the context

> "Read the project's context files and documentation before we start. Tell me
> what conventions apply to a new feature: what every record must store, where new
> code lives, what patterns are mandatory. Separate what the docs require from what existing features happen to do."

If no context files exist, stop. Writing them belongs to Design & Context Engineering, and on a new project that stage runs once before the first feature is planned. It is substantial work and should be budgeted for.

### Step 2: draft the criteria

> "Here is the ticket: [ticket]. Turn it into acceptance criteria. Give each criterion its source: Ticket if the ticket says it, Rule if a project rule requires it, naming the file. Mark anything the ticket does not specify with [NEEDS CLARIFICATION: the question] instead of assuming a value. Do not guess. Do not write code."

Run this in the same session as step 1, so the context is still loaded.

### Step 3: read what comes back

No prompt. Check three things: whether it invented a requirement nobody asked for; whether every criterion is testable, rather than saying the system "handles it as specified"; and whether every Ticket source matches the ticket and every Rule source matches the file it names. A wrong source is how an invented requirement hides.

### Step 4: cut the markers down

Expect a lot. The evidence runs raised between 22 and 31 markers on small tickets, and roughly a fifth survived the filter.

**The filter:** a question is blocking if you cannot write a testable criterion without the answer. Where data comes from, how a user is matched to a record, whether a field is required. Field names, ordering, error wording and performance targets are engineering decisions a developer can make and a reviewer can correct.

The AI may propose the blocking list. You check every marker against the filter and decide.

> "Reduce the clarification markers to these only: [list]. For everything else that was marked, make a reasonable engineering decision and state it as a numbered assumption. List the criteria that depend on each assumption, and have each of those criteria name the assumption as its source. Label each assumption's source: Rule if the project requires it, naming the file, Precedent if another feature does it that way, Ticket if it comes from the ticket, Decision if you chose it."

Every criterion names one source: Ticket, Rule, Resolved, or an assumption by number. The assumption labels separate what the project requires from what other features happen to do: in the second evidence run, several "conventions" were habits copied from a tutorial feature, so check every Rule label against the file it cites. Decision-labelled assumptions stay provisional until Design confirms or overturns them.

Then, before moving on:

> "Which of your assumptions are weakest, and why? Do not change the spec."

In the second evidence run, this flagged the same weak spots the developer had found, plus two they had not checked.

Watch the numbers. Telling the AI to decide rather than ask, while also wanting every criterion testable, makes it fill each gap with a number. In both runs these arrived as reasonable-looking defaults: a two-second timeout, three-second list updates, due dates to the year 9999. For every assumption with a number in it, ask who asked for it.

### Step 5: check the spec against the project

**Step 5 is necessary even though step 1 loaded the context.** In the second evidence run, context was loaded in the very first prompt, and step 5 still found six requirements the project sets on every feature: among them, schema versions and timestamps on every record, unknown fields refused, and errors that show no internal detail. Loading context early narrows the gap without closing it.

> "Read the project's context files and docs. Which of my assumptions does the
> project already answer, and which does it contradict? Do not rewrite the spec
> yet."

Then, once you have read the list:

> "Fix every contradiction. Correct any source you overstated. Add anything the
> project requires on every feature that this spec is missing."

This can overturn a step 4 decision. Check what changed before moving on.

This is not the same check as Design's first step. Step 5 looks for requirements the spec is missing or contradicts: what to build. Design looks for places the approved spec departs from a convention and needs a decision: how to build it.

### Step 6: answer the blocking questions

No prompt. The product owner answers, or whoever owns what the feature is for. If the person writing the spec answers instead, as happened in both evidence runs, record that in the resolved questions.

Every answer must be a decision. "Use your best judgement" hands it back to the AI. Check each answer for new questions before giving it to the AI. In the second run, two answers raised new questions: one could have meant a third status, and the other added the erasure of deleted tasks.

Then:

> "Here are the answers: [answers]. Rewrite the affected criteria and give each the source Resolved, with the question's number. Flag anything that now clashes with a project rule rather than quietly picking a side."

### Step 7: run the checklist

> "Go through each criterion and check it is necessary, appropriate (no implementation detail), unambiguous, complete, singular, verifiable and traceable (it names its source). Flag any that fail and say which one it failed on."

Three are not the AI's to check. Correct (does it match what was asked for?) is the Gate 1 approver's. Feasible is checked in Design. Conforming waits for a spec template.

When a criterion fails "verifiable", there are three fixes. Adding a number is only one of them:

- Raise it as a blocking question for step 6.
- Keep it as a Decision-labelled assumption, so the approver sees it.
- Cut it, if nobody asked for it.

Then ask:

> "List every number or feature in the spec that nobody asked for."

Each item is confirmed or cut before sign-off. If another pass only adds to this list, the spec is finished. In the second run the spec grew from 168 to 346 lines and 25 to 38 assumptions across its later prompts, ending with 20 additions awaiting a decision.

### Step 8: sign off

Do not sign off while the step 7 list has unconfirmed items. The approver should not be the person who wrote the spec.

> "List every artifact this stage should produce and confirm each one is present."

A named person then approves at Gate 1. See
[the Plan Approved gate](plan-approved.md).

### When Design sends the spec back

Design does not edit the spec. If it finds a gap or contradiction, or a decision changes what a criterion means, it sends a spec change request to the Gate 1 approver. Rerun only what the change touches: step 6 for any new question, step 7 on the changed criteria, then step 8. If Design overturns an assumption, the assumptions table lists the criteria to rewrite. Count each request under "Spec changes after Gate 1".

### Using a skill instead of prompting

The step 2 and step 4 prompts are the same every time apart from the ticket and the marker list, which makes them candidates for a reusable file rather than retyping. In GitHub Copilot that is a prompt file in `.github/prompts/`. GitHub's Spec Kit already ships this pattern, running its commands as agent skills in Copilot's chat. The Claude Code equivalent is a committed `SKILL.md`. A retyped prompt drifts between people. A committed file works the same for everyone and improves in one place.

*Untested.* Both evidence runs prompted each time rather than using a committed
skill.

## What to verify before accepting output

**Use the ISO/IEC/IEEE 29148 quality characteristics.** The full standard is paywalled and not held by RMIT, so this list comes from secondary summaries that disagree on whether there are nine or ten. Treat it as a working checklist rather than a verified quotation. The step 7 prompt checks seven; step 7 says who checks the other three.

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

**Were the markers filtered?** Zero in the first pass means the AI filled the gaps itself. A high count is normal for a first pass, but passing it on unfiltered is a failure, because nobody can act on thirty questions.

**Did the assumptions reintroduce the guessing?** This is the one to watch hardest. Across the two runs, assumptions brought in a five-minute freshness rule, a two-second timeout, three-second list updates, due dates to the year 9999, screen width limits, a thousand-task capacity and a five-second clock tolerance. None were requested. All arrived as reasonable defaults. The step 7 list should catch every one.

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

Full treatment in [white-paper/governance/research.md](../governance/research.md).

## How authorship is recorded

The person who signs off owns the spec, however much the AI drafted. While the spec is in review, mark the sections the AI drafted so the reviewer knows what to read hardest. This is the team's practice, not an established convention.

**Unresolved.** Our governance band records attribution at commit time, and a spec in Jira has no commit. No published convention exists for recording AI involvement in a requirements document. See open question 1.

## In practice

From the first evidence run. Its first two prompts used an earlier mock ticket, a service status API; the rest used Task CRUD.

**Steps 1 to 3.** The project had no context files at the start, so the first prompts ran blind and context was loaded at the third. The first pass gave nine criteria, three of them untestable ("handles them as specified"), and 22 markers. A blind first pass on Task CRUD raised 31.

**Step 4.** Six questions were blocking: whether each field is required, whether the date includes a time, whether past dates are allowed, and what status a new record starts in. On the earlier ticket, told to assume the rest, the AI invented a five-minute data freshness rule and a two-second timeout.

**Step 5.** The blind spec contradicted the project in eight places and missed five mandated requirements. It described HTTP status codes for a project that uses Server Actions and never returns them, sorted with a query that drops tasks with no due date, and stored the date in a way that shifts across midnight in some time zones. This is why step 1 now comes first.

**Step 6.** With no product owner on a mock project, the BA answered the six questions, using the team's design mock-up to settle two.

**Steps 7 and 8.** The "verifiable" check caught the three untestable criteria. Sign-off was not done; it was waiting on the second run.

**Cost.** About 60 minutes of a person's time (estimated), six prompts, $1.86. The AI ran for six and a half minutes of it.

## Metrics for success

**What a spec costs.** Measured twice:

| | Prompts | AI time | Cost |
|---|---|---|---|
| Run 1 | 6 | 6m 26s | $1.86 |
| Run 2 | 8 | 45m 51s | $12.80 |

Run 1's figures include its first two prompts, which used an earlier mock ticket.

The difference is repeated rewriting at a large context, not the first context load. Run 2 added 685 lines and removed 375 across eight prompts, with 85% of usage above 150k tokens, so each rewrite paid for everything already in the session. Each testability pass costs more than the one before. Budget for the rewrites, not the first draft.

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

**Junior developers** gain most from the gap-finding, because those are often questions they would not have known to ask. The risk is the reverse: a fluent spec looks authoritative, and they have less to judge an invented requirement against. The assumptions table is where this bites, because a two-second timeout reads as a formality rather than a real constraint.

**Senior developers** will find the draft mostly formats requirements they already
held. The value moves to the checklist, catching the edge case they skipped while
moving quickly, and to noticing a requirement that does not belong.

**Both face anchoring.** Everyone accepts a well-written draft more readily than a rough one, and the same applies to a blocking list the AI proposes.

## What this stage does not cover

- **Architecture and technical design.** Design & Context Engineering. This stage
  stays on what and why.
- **Writing context files.** Design & Context Engineering, including the first set on a new project. This stage reads them.
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

- **Steps 4 and 6 are the judgement calls.** If the AI is making either, the stage has stopped working.
- **Load the context first, then check against it again at step 5.** Loading early narrows the gap without closing it. The second run loaded context in its first prompt and step 5 still found six mandated requirements.
- **No markers is a failure. Many markers is a signal to filter.** Zero means it guessed. Thirty unfiltered means nobody can act on them.
- **Assumptions are where the guessing hides.** Telling the AI to decide rather
  than ask relocates the invention somewhere that looks considered.
- **The rewrites cost more than the first draft.** $1.86 against $12.80, driven by repeated testability passes at a large context, not by the first context load.

**Research behind this module:** [research/modules/planning-and-spec-authoring.md](../../research/modules/planning-and-spec-authoring.md)

**Evidence this module was tested against:** [white-paper/evidence/planning-and-spec-authoring.md](../evidence/planning-and-spec-authoring.md)