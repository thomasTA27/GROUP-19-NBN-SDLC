# Planning and Spec Authoring

**Name:** Ujjawal Mittal
**Last updated:** 2026-09-20

**Phase type:** Human decision. The spec is the main thing a person still writes
from start to finish, and it carries the intent into every phase after this one.

---

## What does a developer do during Planning and Spec Authoring?

This is the phase before any code exists. A request comes in — a ticket, a bug
report, someone asking for something — and a person has to turn it into something
clear enough to build from.

The recognised standard here is **ISO/IEC/IEEE 29148:2018**, the international
standard for requirements engineering. It covers the processes involved in
engineering requirements across the whole lifecycle, and it sets out what a
well-formed requirement looks like, including its characteristics and attributes.

That second part is the useful bit for us. The standard does not just describe a
process. It defines what a good requirement actually is, which gives us something
objective to measure AI output against later in this phase.

In everyday Agile work this shows up as user stories, acceptance criteria, a
definition of done, and someone signing it off before the work starts.

**The developer is making decisions at this phase, not checking someone else's
work.** They decide what gets built, what "done" means, and what is deliberately
left out. Those calls cannot be handed to a model.

---

## What can an AI tool do during Planning and Spec Authoring?

Three things, all visible in tools being used today.

**Write a first draft of the spec.** GitHub's Spec Kit turns a short feature
description into a structured specification with user stories and acceptance
criteria. Atlassian's Code Planner does something similar from a Jira ticket.
Claude Code has a plan mode that keeps planning separate from writing any code.

**Point out what is missing.** The more useful capability, and the one people
notice less. The AI reads a draft requirement and flags what is vague,
contradictory or simply not mentioned — usually the cases the author skipped
because they already knew the answer in their own head.

**Stay at the right level.** Spec Kit's templates tell the model to focus on what
users need and why, and to avoid how to build it — no tech stack, no APIs, no code
structure. Left to itself a model will jump straight to "build it in React" when
the requirement should still say "users need to see updates as they happen."

**What it cannot do is decide.** Scope, intent, what counts as done, which
trade-off to accept — a model cannot settle any of those, because it does not have
the context and does not carry the consequences.

### The bigger shift: specification-driven development

GitHub describes this as flipping the usual order around. Their argument is that
specifications no longer serve the code — the code serves the specification. The
requirements document stops being a guide for building and becomes the thing the
implementation is generated from.

Whether or not a team goes that far, the practical point stands. When an agent is
writing the code, the spec becomes the highest-value thing a person produces. A
vague spec costs a lot more than it used to.

---

## Artifacts generated

**The specification.** User stories, acceptance criteria, and a clear statement of
what is out of scope. Every later phase works from this, and on our map it is what
Gate 1 approves.

**A list of resolved questions.** Every `[NEEDS CLARIFICATION]` marker the AI
raised, with the answer a person gave and who gave it. Worth keeping rather than
deleting — six weeks later, when someone asks why the spec says what it says, this
is the record.

**A record of what was cut.** Requirements the AI proposed that nobody asked for,
and anything left out on purpose. Short, but it stops the same suggestion coming
back next sprint.

**The sign-off.** Who approved the spec and when.

**Where these live is an open question for us.** The spec belongs wherever the
team already tracks work — Jira for NBN, most likely. What we have not answered is
whether the resolved questions and the cut list sit alongside it there, or in the
repo. The repo makes them version-controlled but splits the record across two
places.

---

## How to prepare the AI?

This happens before the first prompt, and it separates a repeatable process from
typing something and hoping.

**Give it the project context.** Conventions, constraints, and what already
exists. Without that, the AI writes perfectly reasonable requirements for a system
that is not yours.

**Set up a spec-authoring skill.** Anthropic's Agent Skills are folders of
instructions that Claude loads when they are relevant. Each skill is a folder with
a `SKILL.md` file holding the instructions. The description stays visible so
Claude knows when the skill applies, but the full instructions only load when
needed.

Anthropic built skills because their engineers noticed Claude writing nearly
identical scripts from scratch every time, so results varied and effort went into
solving something already solved. A skill saves the version that works.

That is the difference between a skill and a prompt. A prompt gets retyped and
drifts. A skill is written once, committed, and works the same for everyone.

**Use a template that limits what the model can do.** Spec Kit's templates work
like structured prompts. They do not just ask for a spec — they make the model
flag its own uncertainty and check its own work.

---

## What to ask the AI?

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

**What not to ask.** Do not ask the AI to decide scope, priority, or what done
means. Ask it "should we build this?" and you get a confident answer with nothing
behind it.

---

## What to check before accepting the output?

**Use the quality characteristics from ISO/IEC/IEEE 29148 as your checklist.** The
advantage is that it comes from an independent standard rather than something we
made up.

*A note on this table.* The full standard sits behind a paywall and is not
available through the RMIT library, so I could only read the freely previewable
sections — foreword, introduction, scope and terms. The list below is compiled
from secondary summaries, and those summaries disagree on whether there are nine
or ten characteristics. Treat it as a working checklist, not a verified quotation.

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

Then two checks specific to AI output.

**Did it make something up?** The most common failure at this phase. The model
adds a requirement that sounds reasonable but nobody asked for — an extra
notification, an additional field, an edge case that does not exist in your
system. Read every criterion and ask who requested it.

**Did it guess where it should have asked?** Spec Kit handles this with a
`[NEEDS CLARIFICATION]` marker. The instruction is to mark every ambiguity and
explicitly not to guess. Their example is a login system: instead of quietly
assuming email and password, the model has to flag that the authentication method
was never specified.

A spec with no clarification markers at all is a warning, not a win. Real requests
are always underspecified, so nothing flagged usually means the model filled the
gaps on its own.

**Watch out for anchoring.** A well-formatted draft is easy to accept without
really reading it. Treat it as a proposal, not a finished document.

---

## Governance and security touchpoints

**What goes into the prompt.** To draft a useful spec the AI needs the ticket and
often the existing system behaviour — for NBN, potentially customer-facing data
structures or network configuration. The team needs a clear line on what may be
pasted into a model and which deployment it runs in. A client question.

**Where the requirement came from.** For a critical-infrastructure operator it is
not enough that a requirement is written down. Someone may need to show who asked
for it, who approved it, and whether a model proposed it. Our governance band
calls this attribution, and the trail starts here.

**Security requirements belong here, even though the security gate does not.** Our
map puts the security gate between Testing and Deployment. That is right for a
blocking check, but it means nothing is enforced at this phase. If a security
requirement is not written into the spec, no later gate will invent it. The
practical rule: ask the AI what could go wrong with this feature, treat the answer
as a prompt for a human conversation, and write the outcome into the criteria.

**Skills are themselves a security surface.** Anthropic's guidance is to use
skills only from sources you trust, because a bad skill could direct the model to
misuse tools or leak data, and skills that pull content from external URLs are
especially risky. Any skill NBN adopts should be written in-house and reviewed
like code.

---

## How authorship is recorded

**What we can say.** The person who signs off the spec owns it — the same
principle the rest of our framework uses. The human whose name is on it is
accountable, regardless of how much a model drafted.

**What good practice looks like.** AI-drafted sections marked as such while the
spec is in review, so the reviewer knows which parts to read hardest. Resolved
clarification markers kept rather than deleted. The sign-off recorded with a name
and a date.

**Where this breaks down.** Our governance band says attribution is recorded at
commit time. That works once code exists. A spec written in Jira or Confluence has
no commit to attach anything to, and we could not find a published convention for
recording AI involvement in a requirements artifact.

So this section describes what the team should do rather than what established
practice says. It needs a decision, and it is in the open questions below.

---

## The reusable skill: spec authoring with mandatory clarification markers

**What the skill does.** A `SKILL.md` file in the repo that, whenever someone asks
for a spec or acceptance criteria:

1. Writes it in our standard template
2. Marks every unspecified detail with `[NEEDS CLARIFICATION: the question]`
3. Is told explicitly not to guess
4. Sticks to what and why, never how
5. Ends by checking itself against the characteristics above

**Why a skill and not just a prompt.** It sits in version control with the code,
works the same for everyone, improves in one place when the team learns something,
and loads itself when relevant rather than relying on someone remembering to paste
the right thing.

**How it helps the AI.** It narrows the job down. "Write a spec" invites the model
to fill silence with something plausible. The skill tells it what good looks like,
what to leave out, and what to do when it does not know — turning the model's
weakest habit here, guessing confidently, into its most useful output: a list of
questions for a person.

---

## How this relates to GitHub Copilot

**Spec Kit is a GitHub product and works with Copilot directly.** It installs with
a Copilot integration flag, and its commands — specify, plan, tasks — run as agent
skills inside Copilot's chat rather than as terminal commands. A team already
using Copilot can adopt spec-first authoring without new tooling.

**Custom instruction files.** Copilot reads instruction files committed to the
repo, which is Copilot's version of the skill described above. Different
mechanism, same principle — the team's standards live in the repo, not in
individual people's habits.

**Worth noting for NBN.** If NBN runs Copilot, the spec-authoring skill should be
built as Copilot instruction files. If they run Claude Code, as a `SKILL.md`. Our
framework should describe the practice and name both rather than tying the
methodology to one vendor.

---

## Practical angle: what this looks like on a real ticket

Using the same feature as our developer storyboard.

**The ticket.** *"The service status API tells a customer whether their service is
down right now, but not whether a planned outage is scheduled. Add planned outage
information to the existing response."*

**Step 1 — Load the context.** Check the context file for this service is up to
date. Give the AI the ticket and the current response format.

**Step 2 — Ask for a first pass.** Request acceptance criteria, with anything
unspecified flagged rather than assumed.

**Step 3 — Read what comes back.** Say it returns sensible criteria — start time,
end time and reason, an empty list when nothing is scheduled — plus three
clarification markers: what happens if an outage is cancelled, what timezone the
dates use, and whether an outage already underway belongs here or in the current
outage field.

**Step 4 — Cut what it invented.** It also suggested adding a notification when an
outage is scheduled. Nobody asked for that, so it goes.

**Step 5 — Take the questions to a person.** The three markers go to the product
owner. That conversation is the real work of this phase. The AI found the
questions but cannot answer them.

**Step 6 — Run the checklist.** "The API should handle outages sensibly" fails on
unambiguous and verifiable. Rewrite it.

**Step 7 — Sign it off.** A named person agrees it is what should be built. On our
map this is Gate 1, and it is the cheapest place in the cycle to catch a mistake —
five minutes here saves reworking code that already exists.

**Time taken.** Steps 1 to 4 take ten or fifteen minutes. Step 5 takes as long as
it takes. The AI sped up the writing, not the deciding.

---

## Metrics for success

**The honest position.** We looked for published evidence of how organisations
measure AI use at this phase and found almost nothing. Atlassian make the same
observation about the wider problem — nearly every engineering team tracks AI
usage and token consumption, and almost none track whether it improved anything.
We are proposing measures below rather than reporting established ones.

| Measure | What it tells you | Why this one |
|---|---|---|
| Clarification markers raised per spec | Whether the AI is surfacing gaps or quietly filling them | Zero markers is the warning sign, not the goal |
| How many markers were real | Whether the AI finds questions worth asking | A model that flags trivia looks busy but adds nothing |
| Invented requirements caught at review | How often the model adds things nobody asked for | Measures the failure mode specific to this phase |
| Spec changes after Gate 1 | Whether the spec held up once work started | A spec rewritten during implementation was not finished |
| Time from ticket to signed-off spec | Whether the phase got faster | Only meaningful alongside the quality measures |

**What not to measure.** Specs produced per week, or how much of a spec the AI
wrote. Both go up when quality goes down, which makes them worse than useless as
targets.

**The measure we cannot give you.** What a spec costs to produce. Our map dropped
cost and metrics from the governance band because we could not evidence how anyone
tracks it. A developer finishes this phase with no idea what the drafting
consumed. Our supervisor raised the same point independently — AI generates a lot
of output, but if it needs reworking then fast is not cheap. We are recording this
as a gap rather than inventing a number.

---

## How will this phase differ depending on your experience?

**Junior developers** gain most from the AI pointing out gaps, because those
questions are often ones they would not have thought to ask. The risk is the flip
side — a fluent spec looks authoritative, and they have less to go on when judging
whether an invented requirement is wrong. The rule: every marker goes to a person,
none get resolved by guessing.

**Senior developers** will find the draft mostly formats requirements they already
held. The value moves to the checklist, catching the edge case they skipped while
moving quickly. They are also better placed to spot a requirement that does not
belong, because they know the system.

**Both are exposed to anchoring.** Everyone is more likely to accept a
well-written draft than a rough one. Experience reduces that, it does not remove
it.

---

## What does this phase not cover?

- **Architecture and technical design** — Design and Context Engineering. This
  phase deliberately stays on what and why.
- **Preparing repo context files** — also Design and Context Engineering, although
  the two phases sit next to each other and often overlap.
- **How the spec actually gets built** — Implementation.
- **Writing tests** — Testing and QA, although the acceptance criteria written
  here are what those tests get checked against.
- **Security as a control** — the security gate sits between Testing and
  Deployment. Security requirements can and should be written here, but they are
  not enforced here.

---

## What is still unknown and open questions?

**1. How do we record AI involvement on a spec?** Our map says attribution is
recorded at commit time. That works for code. A spec written in Jira or Confluence
has no commit. No published convention found, and it matters for a client who may
need to show how a requirement was arrived at. **Needs a team decision.**

**2. Does a better spec actually produce better code?** That is the claim behind
spec-driven development. It sounds right and is widely repeated, but we found no
independent measurement. Flag as an assumption rather than a finding.

**3. Who signs off at NBN?** Our map has a plan-approval gate. Who holds that
authority, and whether it should attach to a SAFe ceremony NBN already runs rather
than being a new checkpoint, needs client input.

**4. To test in the Sprint 3 demo build.** Whether the clarification-marker rule
actually changes what the AI produces, or whether the model marks a couple of
things and guesses the rest anyway. That is testable, and we should test it.

---

## Key points to remember

1. **This phase is about deciding, not checking.** The AI drafts. The person
   decides scope, intent and what done means.

2. **The most useful thing the AI does here is find questions, not write
   answers.** A spec that comes back with nothing flagged is a warning sign.

3. **Never let the AI guess.** Anything unspecified gets marked, not filled in.

4. **Use ISO/IEC/IEEE 29148's characteristics as the acceptance checklist.** An
   independent standard is far easier to defend than criteria we wrote ourselves.

5. **The skill is the deliverable, not the prompt.** Instructions in version
   control that work the same for everyone — a `SKILL.md` for Claude Code, or
   instruction files for Copilot.

6. **Check what the AI added, not just what it got wrong.** Invented requirements
   are the typical failure here.

7. **A vague spec costs more than it used to.** When an agent writes the code,
   every ambiguity gets amplified instead of being absorbed by a person who would
   have just asked.

---

## References / Sources

**1. ISO/IEC/IEEE 29148:2018 — Systems and software engineering, Life cycle
processes, Requirements engineering**
https://www.iso.org/standard/72089.html
*Standards body.* Used for what the phase covers and as the basis for the
verification checklist.
*Access note:* the full standard is paywalled and not held by the RMIT library. I
read the free preview — foreword, introduction, scope and terms — which is what
the opening description is based on. The remaining clauses, including the detailed
requirement characteristics, could not be read.

**2. GitHub — Spec Kit: Specification-Driven Development**
https://github.com/github/spec-kit/blob/main/spec-driven.md
*Vendor documentation, open source.* Source for the specification-as-primary-artifact
argument, the `[NEEDS CLARIFICATION]` marker, and the template rules that keep the
model at the right level.
*Caveat:* GitHub documentation about a GitHub tool. Its time comparison — roughly
twelve hours of traditional documentation against fifteen minutes using Spec Kit —
is a vendor claim and should be written up as reported rather than established.

**3. Anthropic — Agent Skills documentation**
https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
https://www.anthropic.com/news/skills
*Vendor documentation.* Source for what a skill is, the `SKILL.md` structure, how
skills load, and the security guidance on untrusted skills.

**4. GitHub — Spec Kit repository**
https://github.com/github/spec-kit
*Vendor documentation, open source.* Source for the Copilot integration and for
the speckit commands running as agent skills rather than terminal commands.

**5. Anthropic Engineering — Claude Code best practices**
https://www.anthropic.com/engineering/claude-code-best-practices
*Vendor engineering blog.* Source for the explore, plan, implement, commit pattern
and the principle that a person approves the plan before any code gets written.
Captured in full in `research/ai-in-sdlc/ujjawal.md`.

**6. Secondary summaries of ISO/IEC/IEEE 29148**
https://www.modernrequirements.com/blogs/iso-29148-explained/
https://arxiv.org/pdf/2408.10886 (Leveraging LLMs for the Quality Assurance of
Software Requirements)
https://arxiv.org/pdf/2502.18617 (UOOR: Seamless and Traceable Requirements)
*One vendor blog, two academic papers.* Where the checklist table above comes
from. Consistent on the characteristics but disagreeing on the count — one says
nine plus five for the set, another lists ten. Used because the standard itself is
not accessible. Flagged as unverified.

**Sources looked at but not used:** several secondary write-ups of Spec Kit and
Agent Skills were read while getting oriented. Not cited — for a client-facing
document we cite the primary source or nothing.