# Planning and Spec Authoring — raw research

**Name:** Ujjawal Mittal
**Last updated:** 2026-09-20

Raw findings for the Planning and Spec Authoring phase module. This is the
research behind `white-paper/modules/planning-and-spec-authoring.md` — what I
found, where it came from, and how much weight each source can carry. The module
is the distilled version.

---

## What does a developer do during Planning and Spec Authoring?

**What I was looking for.** An established, citable description of the phase that
does not depend on any AI vendor, so the module has a baseline to measure change
against.

**What I found.** ISO/IEC/IEEE 29148:2018 is the international standard for
requirements engineering. Its introduction says it provides a unified treatment of
the processes and products involved in engineering requirements throughout the
lifecycle, and gives details for the construct of well-formed textual
requirements, including characteristics and attributes. Its scope says it
specifies the required processes implemented in the engineering activities that
result in requirements for systems and software products.

**Access problem.** The full standard is paywalled and is not held by the RMIT
library. I read the free preview — foreword, introduction, scope, and terms and
definitions. The detailed clauses, including the requirement characteristics,
could not be read. Anything below about those characteristics comes from secondary
sources, marked as such.

**Position on the developer.** The template asks whether the developer is
decision-oriented or verify-and-validate-oriented at this phase. This one is
clearly decision-oriented — the output is a set of choices about what gets built,
not a check of someone else's work. That matches how our lifecycle map classifies
it, which was arrived at separately.

---

## What can an AI tool do during Planning and Spec Authoring?

Three capabilities, each with a source.

**Drafting a first-pass spec.** GitHub's Spec Kit takes a short feature
description and produces a structured specification with user stories and
acceptance criteria. Atlassian's Code Planner does the equivalent from a Jira
ticket — captured in my earlier vendor research at
`research/ai-in-sdlc/ujjawal.md`. Claude Code has a plan mode that separates
planning from implementation.

**Surfacing ambiguity.** Spec Kit's templates instruct the model to mark
everything it does not know rather than filling the gap. Their documented example
is a login system — the model must flag that the authentication method was never
specified rather than assuming email and password.

**Holding the abstraction level.** Spec Kit templates tell the model to focus on
what users need and why, and to avoid how to implement — no tech stack, no APIs,
no code structure.

**The wider claim.** GitHub frames this as an inversion: specifications no longer
serve code, code serves specifications. Worth capturing, but note it is a
methodology position from a vendor rather than a measured finding.

**What I could not find.** Independent evidence that any of this is effective.
There is plenty of material describing what these tools do and almost none
measuring whether the output is better. See open questions.

---

## How to prepare the AI?

**Context loading.** Established across all four vendors from my Sprint 1
research — Anthropic through committed context files, GitHub through instruction
files, Atlassian through the Teamwork Graph.

**Agent Skills.** Anthropic's documentation describes skills as folders of
instructions, scripts and resources that Claude loads dynamically when relevant.
Each is a folder containing a `SKILL.md` file. The mechanism is progressive
disclosure — the description stays visible so Claude knows when the skill applies,
and the full instructions load only when needed.

**Why Anthropic built them.** Their own account is that engineers noticed Claude
repeatedly writing nearly identical scripts from scratch each run, so results
varied and effort went into work already solved once.

**Why this matters for our framework.** It is the difference between a prompt and
a standard. A prompt is retyped and drifts between developers. A skill is
version-controlled and applies identically. That is what makes a methodology
enforceable rather than advisory — which is exactly what our brief asks for.

**Security note found alongside.** Anthropic's guidance is to use skills only from
trusted sources, because a malicious skill could direct Claude to misuse tools or
leak data, and skills that fetch external content are especially risky. Relevant
for a critical-infrastructure client.

---

## What to ask the AI?

Prompts drawn from the practices above rather than from a source that lists
prompts directly.

> "Here is the ticket and the current API response format. Turn this into
> acceptance criteria. Mark anything the ticket does not specify instead of
> assuming a value."

> "Read this spec and list every case it does not cover. Do not suggest fixes —
> just tell me what a developer would run into and have to guess about."

> "What would make this requirement impossible to test? Rewrite anything that
> cannot be checked objectively."

> "Go through each requirement and check it is necessary, unambiguous, singular
> and verifiable. Flag any that fail and say which one it failed on."

**What not to ask.** Anything that asks the model to decide — scope, priority,
what done means. This follows from the phase being decision-oriented, not from a
source.

---

## What to check before accepting the output?

**The framework.** ISO/IEC/IEEE 29148's quality characteristics for a requirement.
Using an independent standard as the acceptance test is stronger than criteria we
invent, and it is reusable across phases.

**The problem with it.** The exact list is behind the paywall. Three secondary
sources give it, and they do not agree on the count:

- Modern Requirements (vendor blog) — nine characteristics for an individual
  requirement plus five for the set
- arXiv 2408.10886, on LLMs for requirements QA — says the standard defines nine
- arXiv 2502.18617 (UOOR) — lists ten

They agree on the characteristics themselves: necessary, appropriate,
unambiguous, complete, singular, feasible, verifiable, correct, conforming,
traceable. The disagreement is over how they are grouped and counted.

**Recommendation.** Use the list as a working checklist and mark it unverified.
If anyone on the team can get institutional access to the full standard before the
white paper is finalised, replace it with the standard's own wording.

**Two AI-specific checks that came out of the research.**

*Invented requirements.* The model adds something plausible that nobody asked for.
This is implied rather than measured in the sources — Spec Kit's whole
clarification-marker design exists to prevent it, which is indirect evidence that
it is a real failure mode.

*Silent guessing.* Spec Kit's `[NEEDS CLARIFICATION]` marker is the documented
countermeasure. The instruction is explicit: mark all ambiguities and do not
guess.

**My own inference, flagged as such.** A spec returning with no clarification
markers is a warning sign rather than a success, because real requests are
underspecified. No source says this. It follows from the design but is not
evidenced.

---

## How is authorship/attribution handled?

**Unresolved for this phase.** This is the clearest gap I found.

Our lifecycle map's governance band says attribution is recorded at commit time.
That works once code exists. A specification authored in Jira or Confluence has no
commit to attach a trailer or label to.

**What I searched for and did not find.** A published convention for recording AI
involvement in a requirements artifact. Nothing from GitHub, Anthropic, Atlassian
or the standards material covers it.

**What can be said.** The person who signs off owns the spec, consistent with the
accountability principle the rest of our framework uses — Anthropic's stated
position is that the developer whose name is on a pull request is responsible for
its contents regardless of how it was produced. Extending that to a spec is
reasonable but is our extension, not theirs.

**Flag for the team.** This needs a decision and it matters for a
critical-infrastructure client who may have to show how a requirement was arrived
at.

---

## How will Planning and Spec Authoring differ depending on your experience?

No source addresses this directly for the requirements phase. What follows is
reasoning from the material rather than a finding.

**Junior developers** benefit most from ambiguity surfacing, because the questions
raised are often ones they would not know to ask. They are also least equipped to
judge whether an invented requirement is wrong, because that judgement needs
domain knowledge.

**Senior developers** get less from the drafting — the AI mostly formats
requirements they already hold — and more from the checklist catching what they
skipped while moving fast.

**Both face anchoring.** A fluent draft is easier to accept than a rough one.
This is a general known effect rather than something measured in an AI context
here, so it should be presented as a risk to watch rather than a finding.

---

## What does this phase not cover?

- Architecture and technical design — Design and Context Engineering
- Preparing repository context files — also Design and Context Engineering,
  though the two sit adjacent and overlap in practice
- Implementation of the spec
- Test authoring — Testing and QA, although acceptance criteria written here are
  what those tests get checked against
- Security as an enforced control — our security gate sits between Testing and
  Deployment. Security requirements should be written here but nothing enforces
  them at this point, which is worth stating explicitly in the module.

---

## What is still unknown & open questions?

**1. The ISO 29148 characteristics are unverified.** Paywalled, not held by RMIT,
three secondary sources disagree on the count. Needs institutional access.

**2. No published convention for recording AI involvement in a spec.** Our
governance band assumes a commit exists. Needs a team decision.

**3. No independent evidence that better specs produce better generated code.**
This is the load-bearing claim behind spec-driven development. It is plausible and
widely repeated, and I found no measurement of it. Should be stated as an
assumption in the white paper rather than a finding.

**4. Who signs off at NBN.** Our map has a plan-approval gate but no owner for it.
Whether it should attach to a SAFe ceremony NBN already runs, rather than being a
new checkpoint, needs client input.

**5. To test in the Sprint 2 demo build.** Whether the clarification-marker rule
actually changes model behaviour, or whether the model marks a token number of
items and guesses the rest. This is directly testable and we should test it.

**6. Nothing found on cost at this phase.** Consistent with what the team found
when cost and metrics were proposed for the governance band and dropped. Our
supervisor has since raised the same point, so it should not stay dropped without
a conversation.

---

## Key points to remember (Summary)

1. The phase is decision-oriented. The AI drafts, the person decides.

2. The most useful AI capability here is finding questions, not writing answers.

3. The `[NEEDS CLARIFICATION]` marker is the single most transferable practice
   found in this research. It is concrete, adoptable, and converts the model's
   weakest habit into its most useful output.

4. ISO/IEC/IEEE 29148 gives us an independent acceptance framework — but we could
   not read the definitive list, so it ships unverified.

5. Attribution at this phase is genuinely unresolved. Worth writing up as a
   finding rather than hiding.

6. Most of what is published here is vendor methodology, not measured evidence.
   The module should be written accordingly.

---

## References / Sources

**1. ISO/IEC/IEEE 29148:2018 — Requirements engineering**
https://www.iso.org/standard/72089.html
*Standards body.* Foreword, introduction, scope and terms read via the free
preview. Remaining clauses paywalled and not held by RMIT.

**2. GitHub — Spec Kit: Specification-Driven Development**
https://github.com/github/spec-kit/blob/main/spec-driven.md
*Vendor documentation, open source.* The most useful single source for this
phase. Source for the specification-as-primary-artifact argument, the
`[NEEDS CLARIFICATION]` marker and the abstraction-level rules.
*Caveat:* GitHub writing about a GitHub tool. Its claim of roughly twelve hours of
traditional documentation work against fifteen minutes using Spec Kit is a vendor
claim and should be reported as such.

**3. GitHub — Spec Kit repository**
https://github.com/github/spec-kit
*Vendor documentation, open source.* Source for the Copilot integration and for
the speckit commands running as agent skills rather than terminal commands.

**4. Anthropic — Agent Skills**
https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
https://www.anthropic.com/news/skills
*Vendor documentation.* Source for what a skill is, the `SKILL.md` structure,
progressive disclosure, the rationale for building them, and the security guidance
on untrusted skills.

**5. Anthropic Engineering — Claude Code best practices**
https://www.anthropic.com/engineering/claude-code-best-practices
*Vendor engineering blog.* Source for the explore, plan, implement, commit pattern
and for human approval of the plan before code is written. Captured in full in
`research/ai-in-sdlc/ujjawal.md`.

**6. Secondary summaries of ISO/IEC/IEEE 29148**
https://www.modernrequirements.com/blogs/iso-29148-explained/
https://arxiv.org/pdf/2408.10886
https://arxiv.org/pdf/2502.18617
*One vendor blog, two academic papers.* Where the requirement characteristics come
from. Consistent on the characteristics, inconsistent on the count. Used because
the standard is not accessible. **Unverified.**

**7. Atlassian — AI-native SDLC**
https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week
*Vendor blog.* Source for Code Planner and for the observation that almost no
engineering organisations measure whether AI improved anything. Captured in
`research/ai-in-sdlc/ujjawal.md`.

**Sources reviewed and not used.** Several secondary write-ups of Spec Kit and
Agent Skills were read while orienting. Not cited — where they pointed at
something useful I went to the primary source instead.