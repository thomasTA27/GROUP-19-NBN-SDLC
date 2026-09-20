# Research: Implementation (Phase 3)

**Prepared by:** William Lor
**Date captured:** 2026-09-20 (updated 2026-09-20)
**Research angle:** Sprint 2 module research supporting [white-paper/modules/implementation.md](../../white-paper/modules/implementation.md). It covers how companies actually use AI during the Implementation phase, specifically workflows and enterprise practices.

All captures follow [../ai-in-sdlc/TEMPLATE.md](../ai-in-sdlc/TEMPLATE.md). Five primary sources are captured in full
because the module's core claims rest on them. Supporting sources and tool documentation are listed with enough detail to trace the claim they back.

The module is written for a developer to follow, so evidence and justification that a reader does not need in order to act sit here instead.

**Where this sits on the agreed map:** Implementation is phase 3 of 6, See [white-paper/lifecycle-map/README.md](../../white-paper/lifecycle-map/README.md). The map marks this phase blue (a human verification oriented) Every source below is read with that classification in mind.

Attribution and accountability mechanisms (`Assisted-by:`, the Developer Certificate of Origin, Sigstore/gitsign, SLSA, CODEOWNERS, DACI, NIST AI RMF and the Australian Government
guidance) are captured in the governance research. The Implementation module applies those conventions.

## Contents

**Primary sources**

1. SWEBOK v4: Software Construction knowledge area
2. Microsoft: Ten Months with Copilot Coding Agent in dotnet/runtime
3. LLVM: AI Tool Use Policy
4. Veracode 2025 GenAI Code Security Report
5. DORA: 2024 Accelerate State of DevOps Report

**Supporting sources**

**Tool documentation (GitHub Copilot)**

**Arguments held here rather than in the module**

**Notes on the set as a whole**

---

# Primary sources

## 1. SWEBOK v4: Software Construction knowledge area

**Source:** *Guide to the Software Engineering Body of Knowledge*, Version 4.0, IEEE
Computer Society, 15 October 2024 (currently v4.0a).
https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4

**Date captured:** 2026-09-20
**Reviewed by:** William
**Source type:** Recognised standards body

### Key findings

Defines software construction as "the detailed creation of working software through a
combination of coding, verification, unit testing, integration testing, and debugging", so
verification and testing are constituent activities of construction, not a separate
downstream stage.

Names five Software Construction Fundamentals: Minimising Complexity; Anticipating and
Embracing Change; **Constructing for Verification**; Reusing Assets; Applying Standards in
Construction. Constructing for verification means building software such that faults can
be readily found.

Places construction downstream of Software Design.

### Lifecycle stage mapping

Implementation (phase 3). The standards baseline the module's "traditional vs AI-native"
section contrasts against.

### Relevance to our methodology

Two claims depend on it. Verification belongs inside implementation, which justifies the
checkpoint firing continuously rather than once at the end of the phase. And design and
acceptance criteria are inputs to the phase, which makes it conformance-checking rather
than decision-originating, the structural difference between the teal and red checkpoint
types.

"Conformance-checking" is our terminology, not SWEBOK's. The module retains that
qualification because the claim it supports is the module's central one. The module also
notes that the phase is called Implementation while the SWEBOK knowledge area is Software
Construction, to stop an enterprise reader taking "implementation" to mean rollout.

Replaces ISO/IEC/IEEE 12207 as the standards anchor, which is paywalled and unavailable to
the team.

---

## 2. Microsoft: Ten Months with Copilot Coding Agent in dotnet/runtime

**Source:** Stephen Toub, .NET Blog, Microsoft, 23 March 2026.
https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/

**Date captured:** 2026-09-20
**Reviewed by:** William
**Source type:** Documented organisational case study (vendor-authored, self-flagged biases)

### Key findings

878 agent pull requests over ten months on a major production repository, 535 merged, a
67.9% success rate against 87.1% for Microsoft engineers.

On the bottleneck: "The bottleneck has moved. AI changes the economics of code production.
One person with good judgment and a phone can generate PRs faster than a team can review
them."

On task size: 1 to 50 line changes succeeded 76 to 80% of the time, dropping to 64% at 101
to 500 lines. Scope matters more than size, since "a well-scoped task that produces 50
lines succeeds more reliably than a vague one that produces 200."

Success by task type ranged from cleanup at 84.7% down to performance at 54.5%. 65.7% of
agent-added lines were test code.

On preparation: success rose from 38.1% to 69% after setup changes, "not through better AI
models, but through better preparation."

The agent is "excellent at implementing well-specified changes, very good at investigating
issues, and relatively poor at architecting solutions". It sometimes warned in its own PR
description that a change should not be merged.

### Lifecycle stage mapping

Implementation (phase 3).

### Relevance to our methodology

The strongest source in the set: Copilot-specific, quantitative, and drawn from a real
production repository rather than a benchmark. Carries four module claims, that review is
the constraint, that task size predicts success, that the readiness layer changes outcomes,
and that the agent suits well-specified rather than architectural work.

**Cut from the module and held here:** the task-size figures, and the self-warning
anecdote behind the PR template's caveats field.

Caveat: Microsoft is describing its own product, though the post is candid about non-random
task selection and self-selected populations.

---

## 3. LLVM: AI Tool Use Policy

**Source:** LLVM AI Tool Use Policy, adopted January 2026.
https://llvm.org/docs/AIToolPolicy.html

**Date captured:** 2026-09-20
**Reviewed by:** William
**Source type:** Documented organisational policy (major open-source project)

### Key findings

There must be a human in the loop. The contributor "reviews all the code and is able to
answer questions about it without reference back to the AI which generated it", and is
"always the author and is fully accountable".

Substantially AI-generated contributions must be labelled. Unattended agents are banned. AI
is barred from "good first issue" tickets to preserve the learning pathway, and new
contributors are advised to "start with small contributions that they can fully
understand".

### Lifecycle stage mapping

Implementation (phase 3), at the close of the inner loop.

### Relevance to our methodology

Supplies the only testable exit condition the methodology has. "Tests pass" is not a
checkpoint; "the developer can explain every line without deferring to the AI" is. That is
what makes the Human-Verification checkpoint checkable rather than aspirational. Also
supplies the junior-developer guidance.

Valuable because it is not a vendor. An independent engineering community reaching this
conclusion is harder to dismiss as marketing.

**Cut from the module and held here:** the inline attribution of the exit condition, and
the good-first-issue quotation. The standard and the guidance both remain.

The governance research covers LLVM's accountability position. This entry captures only the
phase-specific use.

---

## 4. Veracode 2025 GenAI Code Security Report

**Source:** Veracode, 2025 GenAI Code Security Report (100+ LLMs, 80+ tasks).
https://www.veracode.com/blog/genai-code-security-report/

**Date captured:** 2026-09-20
**Reviewed by:** William
**Source type:** Vendor research (large, transparent methodology)

### Key findings

45% of generated samples introduced an OWASP Top 10 flaw. Cross-site scripting (CWE-80)
failed in 86% of relevant samples. Java had a 72% failure rate. Security pass rates stayed
roughly flat at 45 to 55% even as syntactic correctness exceeded 95%, so models got better
at writing code that works without getting better at writing code that is safe.

### Lifecycle stage mapping

Implementation (phase 3). Feeds the Security Gate as the consolidating check.

### Relevance to our methodology

The justification for in-phase security scanning rather than deferring security to the
gate, and the argument that a named reviewer is not a sufficient control on its own. These
are defects that read as plausible and are caught by tooling, not by eye.

Supports the escalation triggers and the open question on blocking status checks. The
governance research cites the same finding when identifying the gap where attribution
exists without a mandatory scan, so the two uses should stay consistent.

**Cut from the module and held here:** the figures behind the verification checklist.

Caveat: Veracode sells application security testing, so the finding serves its product. The
methodology is transparent enough that the core result is hard to dismiss.

---

## 5. DORA: 2024 Accelerate State of DevOps Report

**Source:** 2024 Accelerate State of DevOps Report, DORA (Google Cloud).
https://dora.dev/research/2024/dora-report/

**Date captured:** 2026-09-20
**Reviewed by:** William
**Source type:** Established industry research programme

### Key findings

A 25% increase in AI adoption was associated with an estimated **1.5% decrease in delivery
throughput** and an estimated **7.2% decrease in delivery stability**, with larger batch
sizes named as a substantial mechanism. Small batches and robust testing remain
fundamentals.

### Lifecycle stage mapping

Cross-cutting. Measured at delivery level, but the mechanism originates in Implementation.

### Relevance to our methodology

Supports the argument that deferring verification concentrates work where it is already the
constraint. Also the batch-size rationale behind "scoped small" in the working cycle, and
the 25% adoption threshold the module retains as an escalation benchmark.

**Cut from the module and held here:** the 7.2% figure and the argument around it. See
Argument B.

**Attribution precision:** the 7.2% and 1.5% figures belong to DORA **2024**. DORA 2025 used
a standardised-effects methodology, confirmed the directional finding, and did not restate
them. Citing them to 2025 would be an error a reviewer would catch.

Caveat: correlational. DORA is explicit that the data cannot establish why.

---

# Supporting sources

**Stack Overflow 2025 Developer Survey** (49,000+ responses)
https://survey.stackoverflow.co/2025/ai
66% cite AI output that is "almost right, but not quite", 45% say debugging AI code is more
time-consuming, and developers with 10+ years experience are the most sceptical. Backs the
verification checklist and the senior-developer guidance. The near-miss finding is why the
checkpoint cannot be a skim: obviously wrong code gets caught anyway. Figures cut from the
module. Caveat: sample skews to Stack Overflow's engaged users.

**METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer
Productivity** (arXiv:2507.09089, 10 July 2025)
https://arxiv.org/abs/2507.09089
RCT, 16 experienced developers, 246 real tasks. Developers took 19% longer with AI while
believing afterwards they had been 20% faster. Backs the instruction to track measured
rather than perceived cycle time, and the review-complacency warning. The strongest
methodological source in the set. Caveats: small sample, one setting, early-2025 tooling;
METR labels it historical.

**GitClear: AI Copilot code quality research** (211 million changed lines, 2020 to 2024)
URL not yet confirmed.
Copy-pasted lines rose from 8.3% to 12.3% while moved lines fell from 24.1% to 9.5%; 2024
was the first year copy-paste exceeded moved code; two-week churn rose from 3.1% to 5.7%.
Backs the argument that duplication and churn degrade quietly while tests stay green.
Caveats: correlational; GitClear sells code-analysis tooling.

**USENIX Security 2025: "We Have a Package for You!"** (2.23 million samples, 16 models)
URL not yet confirmed.
19.7% of samples contained at least one hallucinated package name, with 205,000+ unique
non-existent names. Backs the slopsquatting touchpoint and the dependency check. The module
retains the approximate figure because the risk reads as hypothetical without it. The only
peer-reviewed source in the set, and the clearest case for a phase-specific control, since
the risk does not exist in the non-AI baseline.

**Kim & Yegge: *Vibe Coding*** (IT Revolution, 2025)
https://itrevolution.com/articles/the-vibe-coding-loop/
Names the inner loop as Frame, Decompose, Generate, Verify, on a timescale of seconds to
minutes. Source of "the smaller the steps, the better chance AI has to succeed". Backs the
module's three-step cycle; our step names are a compression, not a quotation. Quotations
cut from the module. Caveat: trade press, not controlled research.

**Addy Osmani: agentic coding and code review**
URL not yet confirmed.
Reports the effort ratio has inverted to roughly 70% problem definition and verification
against 30% execution. One of three sources behind Argument A. Caveat: practitioner
writing; corroborates the measured sources rather than standing alone.

**VS Code `git.addAICoAuthor` default change and reversal** (2026)
Primary source not yet located; currently traced only through secondary tech-press
reporting.
A default change caused `Co-authored-by: Copilot` trailers to appear on commits made
without Copilot, and was reverted after objection. Backs the module's retained sentence on
why Copilot's default trailer is not the methodology's convention. **Needs a primary source
before publication:** the VS Code changelog entry or the pull request.

---

# Tool documentation (GitHub Copilot)

Reference material for the tool the module describes. Prescriptive rather than evidential:
it establishes what Copilot does, not whether using it works. Not to be cited as evidence.

**Prompt engineering for Copilot Chat**
https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering
GitHub's principles: start general then get specific, give examples, break complex tasks
into simpler tasks, avoid ambiguity, indicate relevant code, experiment and iterate. The
iterate-and-retry guidance is GitHub acknowledging the working cycle is a loop. The
module's five example prompts are our construction following these principles, not
published GitHub examples.

**Chat variables, slash commands and custom instructions**
https://docs.github.com/en/copilot/how-tos/use-chat/get-started-with-chat
Chat variables `#selection`, `#file`, `#editor`, `#codebase`; `@workspace` supplies project
context; slash commands include `/tests`, `/fix`, `/explain`. Custom instructions live in
`.github/copilot-instructions.md`, with path-scoped `*.instructions.md` using an `applyTo`
glob. **Limitation to carry into the module:** the syntax is VS Code-specific and may not be
supported in other IDEs; Visual Studio uses `#MyFile.cs` and `#solution`. Verified against
live docs 2026-09-20. Claude Code equivalents: `copilot-instructions.md` to `CLAUDE.md`,
`*.instructions.md` to nested `CLAUDE.md` files or Skills, `*.prompt.md` to slash commands.

**Responsible use of Copilot code review**
https://docs.github.com/en/copilot/
GitHub states the feature "should be supplemented with careful human code review", "has a
risk of hallucination", and should be used "as a tool, rather than to replace human
reviews". It defaults to a non-blocking "Comment" review. Supports the module's position
that AI review is a first pass, not an approval authority, and is useful because it is the
vendor saying so. The former 300-file cap was retired in an August 2026 changelog; do not
cite it.

---

# Arguments held here rather than in the module

Conclusions drawn across several sources rather than facts from any one of them. Written
for the module and removed, because a developer following the guide does not need them in
order to act, while a reviewer assessing the methodology does.

## A. The three-step working cycle is converged practice, not our invention

**Sources:** Kim & Yegge; GitHub prompt engineering documentation; Osmani.

Three independent sources describe the same cycle without citing each other. Kim & Yegge
name it Frame, Decompose, Generate, Verify. GitHub instructs the developer to iterate on
the prompt and try again when the result is wrong, the same loop from the vendor side.
Osmani reports the effort ratio has inverted toward definition and verification, which
describes where the weight of the loop sits.

The argument is defensive. It answers a reviewer asking whether the loop is industry
practice or a diagram the team drew. The sources differ in kind, being trade press, vendor
documentation and practitioner writing, which makes their agreement more persuasive than
any one alone.

**Module retains:** the loop itself. Our step names are a compression of this shape rather
than a quotation, which should be stated if the module is challenged on terminology.

## B. Verification sits inside the loop because review is the constraint

**Sources:** Microsoft dotnet/runtime; DORA 2024.

Microsoft states the bottleneck has moved from generation to review. DORA 2024 found
stability declining as adoption rose, with batch size a substantial mechanism. Together:
if review is already the constraint, deferring verification to a later phase concentrates
work at the point that is already overloaded, and increases the size of what arrives there.

SWEBOK supports the same placement from the standards side, but explains why verification
belongs in construction generally; these two explain why it matters more once AI is
involved.

**Module retains:** one sentence stating that verification sits inside the loop because
review rather than generation is now the constraint.

## C. The verification checklist is urgent, not routine

**Sources:** Stack Overflow 2025; Veracode 2025.

The checklist could read as ordinary code-review advice. The evidence distinguishes it.
Stack Overflow's near-miss finding identifies a failure mode that survives casual review.
Veracode's identifies defects a human reviewer is poorly placed to catch by eye at all.
Read together they explain why the checklist pairs a comprehension test with a tooling
requirement: neither substitutes for the other.

**A negative finding worth recording:** no universally adopted checklist for reviewing
AI-generated code exists. The module's is assembled from GitHub's responsible-use guidance
and the LLVM comprehension standard. If a standard emerges, adopt it rather than keep a
bespoke list.

**Module retains:** the checklist, without the evidence paragraph.

## D. Experience-level guidance and the limits of the evidence

**Sources:** LLVM; Stack Overflow 2025; METR.

Junior guidance rests on LLVM's reservation of beginner tickets, a policy position rather
than a measured outcome. Senior guidance rests on Stack Overflow's near-miss finding and
METR's demonstration that experienced developers misjudge their own throughput.

**Caveat cut from the module that should not be lost:** controlled-study evidence isolating
junior against senior comprehension outcomes is thin. Skill erosion is a well-supported
concern, not a settled quantified finding, and should not be written as one.

**Previously a gap, now closed:** the module referred to "metacognitive erosion" and
reduced pre-testing, attributed to the responsible-AI literature, with no source captured.
The phrasing was changed to rest on LLVM's reservation of beginner tickets for human
learning, which is already a primary source here.

---

# Notes on the set as a whole

Every source that measures AI's effect on implementation work points the same direction:
generation gets faster, verification becomes the constraint. Microsoft states the bottleneck
has moved to review. DORA 2024 finds stability declining as adoption rises. METR finds
experienced developers slower while believing they were faster. Stack Overflow finds the
dominant complaint is output that is almost right. None of these contradict the lifecycle
map's classification of Implementation as a Human-Verification phase; they are the reason
for it.

**Sourcing caveats to resolve before publication:**

* **Vendor interest.** Veracode and GitClear both sell tooling their findings support.
  Microsoft is describing its own product, though candidly.
* **Not peer-reviewed.** Kim & Yegge and Osmani are practitioners writing trade press.
  Attribute the loop *shape* to them, not empirical backing.
* **The Copilot trailer controversy** rests on secondary reporting. Find the VS Code
  changelog or pull request before the module's sentence on it is published.
* **"Read the diff as it streams"** in the module's "In practice" section has no rigorous
  source. It is a practitioner heuristic and should be labelled as one.
* **"Metacognitive erosion" and reduced pre-testing** are cited in the module with no source
  captured. See Argument D.
* **DORA figure attribution.** 7.2% belongs to DORA 2024. Do not attribute it to 2025.
* **Microsoft setup figure.** The attributable effect is 38.1% to 69%. A separate 41.7% to
  71% figure describes first-month versus recent-quarter rates. Do not conflate them.
* **URLs unconfirmed.** GitClear, the USENIX paper, Osmani and the VS Code trailer change.
  The USENIX one matters most, since it is the only peer-reviewed source in the set.
