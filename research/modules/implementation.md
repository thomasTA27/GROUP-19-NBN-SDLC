# Research: Implementation (Phase 3)

Sources behind the Implementation module. Five primary sources are captured in full
because the module's core claims rest on them. Supporting sources and tool documentation
are listed with enough detail to trace the claim they back.

The module is written for a developer to follow, so evidence and justification that a
reader does not need in order to act sit here instead.

Attribution and accountability mechanisms (`Assisted-by:`, the Developer Certificate of
Origin, Sigstore/gitsign, SLSA, CODEOWNERS, DACI, NIST AI RMF and the Australian Government
guidance) are captured in the governance research. The Implementation module applies those
conventions; it does not define them.

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

**A gap to close:** the module refers to "metacognitive erosion" and reduced pre-testing,
attributed to the responsible-AI literature. No source for either has been captured. Either
find a citation or soften the phrasing to something the captured sources support.

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

---

# Update 2026-10-26: source re-verification

Added by William after a usability pass on the Implementation module. Existing entries above
are left as written. This section records what was checked against live sources, what was
found wrong, and what changed in the module as a result. Four corrections, two URLs closed,
one claim strengthened.

## Corrections to claims above

### 1. USENIX package hallucination figures were misstated

The supporting-source entry says "2.23 million samples, 16 models" and "19.7% of samples
contained at least one hallucinated package name". Both are wrong.

Verified against the published USENIX abstract
(https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen) and arXiv v1
(https://arxiv.org/abs/2406.10279):

* The sample count is **576,000 code samples**, not 2.23 million. Quote: "we generate
  576,000 code samples in two programming languages". 16 models is correct.
* 19.7% is the share of **generated package references that are hallucinated**, not the
  share of samples containing at least one. Quote from the arXiv abstract: "19.7% of
  generated packages across all the tested LLMs are hallucinated".
* The published abstract gives the figure split by model type rather than as a single
  average. Quotes: "at least 5.2% for commercial models" and "21.7% for open-source
  models".
* 205,474 unique hallucinated package names is correct.

The split matters more than the arithmetic. Copilot is a commercial model, so the rate
relevant to NBN is around 5.2%, not the one-in-five headline. Stating 19.7% in a
Copilot-targeted module overstated the frequency by roughly four times. The module's
slopsquatting bullet now gives both rates, says Copilot sits in the commercial group, and
argues the control from consequence rather than frequency, since one malicious install is
enough.

Full citation for the entry above, now confirmed: Spracklen, Wijewickrama, Sakib, Maiti and
Jadliwala, "We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by
Code Generating LLMs", 34th USENIX Security Symposium, Seattle, 2025.

### 2. The Osmani claim is a misattribution

Argument A says Osmani "reports the effort ratio has inverted to roughly 70% problem
definition and verification against 30% execution". He does not say that.

His actual claim, verified at https://zed.dev/blog/ai-70-problem-addy-osmani, is the "70%
problem", which is about how much of the code AI produces rather than how effort divides.
Quotes: "AI can rapidly produce maybe 70% of the code for an app, for a feature", and the
remaining 30%, "things like edge cases where you might have to put in additional
debugging", is "just as time consuming as it ever was".

Argument A still stands, but on the corrected claim. Osmani's point is that the hard
remainder survives generation, which is the same place the loop puts its weight, so he
corroborates verification being the constraint without any inverted-ratio framing. The
inverted ratio should not be quoted anywhere.

No module change needed. The module never carried the 70/30 figure.

### 3. Plan mode is not a file lock, and it is not VS Code only

Two findings, pulling in opposite directions.

The tool-documentation section's note that the syntax is "VS Code-specific" is correct for
`#file:` and `@workspace`, but should not be read as covering plan mode. Plan mode exists in
**both** surfaces. GitHub's CLI best-practices page
(https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/copilot-cli/cli-best-practices)
describes plan mode, invoked with Shift+Tab or `/plan`, writing a checklist plan to
`plan.md` and pausing for approval. VS Code has a Plan agent reached the same way with
`/plan` (https://code.visualstudio.com/docs/agents/planning).

Against that, "no files change while planning" is not something either surface guarantees.
The VS Code page is explicit that approving a plan is separate from approving tool actions,
and that telling the agent not to change files "guides the agent's behavior but does not
change the session's permissions". Only the separate local-harness Plan agent researches
"without editing project files" by default.

The module previously claimed plan mode meant no files change. It now presents plan mode as
an approval checkpoint, names `/plan` on both surfaces, and tells the developer to confirm
session permissions rather than assume a lock. The rollout step that made plan mode the
step 1 default now pairs it with a permissions setting.

### 4. Task size was overstated in the module, not here

This entry records Microsoft correctly: "Scope matters more than size". The module had
hardened that into "task size is the strongest predictor of success", which Microsoft does
not say. The module now reads "a strong predictor", with scope leading. Flagged so the
stronger phrasing is not reintroduced from a summary of this file.

## URLs now confirmed

* **GitClear.** http://gitclear.com/ai_assistant_code_quality_2025_research, traced via
  devclass's February 2025 write-up
  (https://www.devclass.com/ai-ml/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/1626250).
  211 million changed lines and 2024 as the first year copy-pasted lines exceeded moved
  lines are both confirmed. One precision point: GitClear's metric is **moved** lines, not
  "refactored" lines. The module said "refactored" and now says moved, noting it is the
  usual proxy for refactoring. The two-week churn figures (3.1% to 5.7%) were not in the
  secondary coverage checked and still rest on GitClear's own reporting.
* **USENIX.** See correction 1 above.

Still open: the Osmani URL above is the Zed interview rather than a post on his own site,
which is adequate but worth replacing if he has written it up directly.

### The VS Code trailer caveat is now partly closed

The caveat above says the `git.addAICoAuthor` primary source is not located and the module's
sentence should be held. Two primary sources have now been found, and the caveat should be
narrowed rather than kept whole.

* **The setting exists and what it does.** VS Code 1.110 release notes, Source Control
  section, "AI co-author attribution for commits"
  (https://code.visualstudio.com/updates/v1_110). It controls whether VS Code "can
  automatically append a `Co-authored-by:` trailer when you commit code that includes
  AI-generated contributions", with values `off` ("default: does not add a co-author
  trailer"), `chatAndAgent` and `all`. It also states VS Code "only adds co-author trailers
  for commits you make from within VS Code" and "does not modify commits made in external
  Git tools or the command line".
* **The default changed to on.** VS Code 1.118 release notes, section headed "Copilot added
  as a Git co-author by default" (https://code.visualstudio.com/updates/v1_118). It states
  VS Code "now enables Git AI co-authoring by default for chat and agent workflows" and that
  when Copilot changes your files, "Copilot is automatically added as a co-author on that
  commit".

What is **still** unsourced is narrower than the original caveat suggested, and the module
does not rely on any of it. Neither release notes page mentions trailers appearing on
commits made without Copilot, and neither mentions a reversal. Those two claims rest on tech
press alone. The 1.118 wording scopes the behaviour to chat and agent workflows, which does
not match the press description of trailers on unassisted commits, so that specific claim
should be treated as unconfirmed rather than repeated.

**Module position.** The module's sentence needs only the setting's existence and its current
default, both of which are now primary-sourced, so it is publishable. It was reviewed and
corrected on two points of precision. It previously called this "Copilot's default" trailer,
when VS Code's Git integration adds it rather than Copilot, and the sentence now names the
`git.addAICoAuthor` setting, says to turn it off rather than assume it is absent, and notes
that it affects only commits made inside VS Code. That last point matters for NBN, since a
developer committing from the command line never sees the trailer and would otherwise read
the instruction as a step they had skipped.

## Claim strengthened: content exclusion

The module previously described Copilot content exclusion as having gaps. Live docs show the
gap is wider than that, so this is a correction in the direction of more caution rather than
less.

GitHub states content exclusion is "currently not supported in Edit and Agent modes of
Copilot Chat in Visual Studio Code and other editors", and a second page adds that "GitHub
Copilot CLI, Copilot coding agent, and Agent mode in Copilot Chat in IDEs, do not support
content exclusion". It also requires a Copilot Business or Enterprise plan.

Those are precisely the surfaces this phase describes. Content exclusion therefore does not
cover agentic work and is not a control the module can lean on. The module now says so
directly and keeps the configuration step only as defence for the non-agentic surfaces.

## Note on the module's exit condition

The LLVM entry above says the policy "supplies the only testable exit condition the
methodology has", citing "the developer can explain every line without deferring to the AI".
The module no longer uses that formulation. It was found unenforceable in usability testing
and was replaced by a hand-written commit message that the agent then marks against the
diff, with three named outcomes recorded in the PR.

LLVM remains the source for the underlying standard, which is that the contributor must be
able to answer questions about the code without reference back to the AI and is fully
accountable. What changed is the check, not the standard. The entry above is accurate about
LLVM and now describes a module formulation that has moved on.

## Test-run references

All references to the internal test run were removed from the module, since modules must
read as standalone guidance. The findings they carried, such as hardening rounds being
needed even on small packages whose first output passed, remain in the module stated
generically. Nothing in this research file depended on them.

## Items raised by an independent review of the module, same date

A separate reviewer read the module cold against this file. Three items land here rather
than in the module.

**The session-cost claim has no entry in this file at all.** The module's "Session length"
guidance asserted that re-reading context across long sessions, rather than generation, is
the main cost driver in this phase. Nothing in this file supports that: no primary source,
no supporting source, no tool documentation entry and no argument covers token cost, context
re-reading or caching. The module has been softened to a mechanism statement, that a long
session re-reads its context repeatedly and so adds cost without adding work, which is
near-tautological and safe. **If the stronger comparative claim is wanted back, it needs a
source captured here first.** The instruction it supports, keeping sessions bounded to one
work package, stands on its own either way.

**The Linux kernel `Assisted-by:` convention may be deprecated.** The live kernel
documentation at docs.kernel.org/process/coding-assistants.html still specifies the tag, and
still states verbatim that "AI agents MUST NOT add Signed-off-by tags. Only humans can
legally certify the Developer Certificate of Origin (DCO)", which is the kernel-derived claim
the module leans on hardest and which remains correct. But secondary reporting of the October
2026 Maintainers Summit says the kernel agreed on 8 October to deprecate the `Assisted-by:`
tag, with a removal patch posted the following day. That is tech-press sourcing and the
documentation has not changed, so the convention is not dead. **Treat it as a watch item and
find the removal patch on the mailing list before publication.** Two precision points worth
recording: the kernel's documented format is `Assisted-by: <LLM>` with optional bracketed
tool names, not the colon-joined `Copilot:gpt-5` form the module shows, and earlier kernel
traffic used `Co-developed-by:` for the same purpose, so "the Linux kernel convention" has
never been a stable anchor. If the tag is removed upstream, the module should present
`Assisted-by:` as NBN's own convention rather than as an external standard.

**The `Assisted-by:` format question is resolved, and the deprecation watch item narrows.**
The governance attribution file records the kernel's v7.2 documented format as
`Assisted-by: AGENT_NAME:MODEL_VERSION [TOOL1] [TOOL2]`, with the example
`Assisted-by: Claude:claude-3-opus coccinelle sparse`. The module's
`Assisted-by: Copilot:gpt-5` therefore matches the documented v7.2 form, and the reviewer's
objection to the colon-joined tool and model came from the in-development 7.3.0
documentation, which simplifies the tag to `Assisted-by: LLM [TOOL1] [TOOL2]` and drops the
model version. So the module is correct against the published format today, and the live
risk is only that a future kernel release changes it. That strengthens the recommendation
above, which is to present `Assisted-by:` as NBN's own convention rather than as an external
standard, since the methodology depends on recording the model version and the direction of
travel upstream is to drop it.

**Microsoft's figures describe agent-authored work, and the module is about interactive
work.** The task-size finding and the test-share figure both come from the asynchronous
Copilot coding agent, which the module explicitly puts out of scope. The module no longer
quotes the test-share number, which removes the sharpest instance, but the task-size guidance
still rests on agent data. The transfer is reasonable, since scoping affects both modes, but
it is a transfer and a reviewer who knows the source will notice. Worth one sentence in entry
2 above if that entry is ever revised.

## Two sections were cut from the module, which changes what some entries above support

The module's "Metrics for success" and "How this differs by experience level" sections were
removed and kept in `implementation_cut_sections.md`. Several entries above still describe
them as module content. Rather than edit those entries, record the corrections here.

* **The LLVM entry's "Also supplies the junior-developer guidance"** and the **Stack Overflow
  entry's "the senior-developer guidance"** now back the cut file, not the module. The module
  has no experience-level guidance at all.
* **Argument D** is about content the module no longer carries. Keep it, since it supports the
  cut file and will matter again if that section is reinstated anywhere, but read it as
  applying there.
* **Argument D's "gap to close" is closed.** It records that the module "refers to
  'metacognitive erosion' and reduced pre-testing, attributed to the responsible-AI
  literature" with no source captured, and asks for a citation or softer phrasing. The module
  does not use either phrase anywhere now, so the unsourced-claim risk is retired. The same
  item in the sourcing caveats at the end of the original research can be treated as closed
  for the module. It remains unsourced in the cut file, which is why that file carries its own
  caveat about skill-erosion evidence being thin.
* **The DORA entry calls 25% a "threshold".** The module now states the opposite, that it "is
  our chosen review point, not a level at which published research identifies a change", and
  that it is the increment DORA used to model the association. Read "threshold" in that entry
  as "review point", since the module's wording is the deliberate one.
* **The METR and GitClear figures no longer appear in the module.** Both were in "Metrics for
  success". Their entries above still stand as sourcing for the cut file, and the module's only
  surviving measurement content is the "Measure and tune" step in its rollout section.

## Third review round, same date: three verified corrections

A third independent reviewer checked platform behaviour against current documentation and
local tests. Three findings correct earlier entries in this file.

* **`@workspace` is deprecated in VS Code, and the CLI references files with `@<path>`.** The
  tool-documentation entry above, verified 2026-09-20, lists `@workspace` as the way to supply
  project context. VS Code's current "Manage context for AI" page
  (https://code.visualstudio.com/docs/chat/copilot-chat-context.md) states that chat
  participants invoked with `@name` are deprecated and not supported in the Copilot harness,
  and points to `#codebase` instead. Separately, GitHub's Copilot CLI documentation shows files
  referenced as `@<path>`, and does not list `/tests` among the CLI's commands. The module's
  bounded-test example and CLI translation note have been rewritten to match. The open
  question below that mentions "the `#file:` and `@workspace` syntax" should be read as
  `#file:` and `#codebase`.
* **DORA's 2024 model groups stability differently from the module's first definition.** Per
  DORA's metrics history guide (https://dora.dev/guides/dora-metrics/history/), the 2024
  model treats change failure rate and rework rate as stability metrics and counts failed
  deployment recovery time under throughput. The module had defined stability as change failure
  rate and time to restore. It now uses change failure rate and rework rate, and keeps time to
  restore as a tracked metric outside the stability definition. Checked against the guide
  rather than the 2024 report PDF itself.
* **The `Assisted-by:` trailer only parses as a trailer after a blank line.** Tested locally on
  git 2.43: when the draft message ends with `Assisted-by:` as its own paragraph after a blank
  line, `git commit -s -F` places `Signed-off-by:` directly beneath it and
  `git interpret-trailers --parse` returns both. When `Assisted-by:` sits directly under body
  text, git starts a new paragraph for the sign-off and only `Signed-off-by:` parses as a
  trailer, so a CI trailer check would report the attribution missing. The module now tells the
  developer to end the draft with a blank line and the trailer, and the commit-message check
  confirms it.

## Fourth, targeted pass, same date: sources newly relied on

The module now rests on three platform facts not previously captured here. All three were
checked against official documentation by the reviewer, not re-fetched by the author.

* **Where VS Code and the Copilot CLI load instruction files from differs.** VS Code loads
  instruction files, agents and hooks only from the open folder by default, with
  `chat.useCustomizationsInParentRepositories` off
  (https://code.visualstudio.com/docs/agent-customization/overview). The Copilot CLI reads
  instruction files from the repository root, the current working directory, every directory
  between them, and directories nested in the path of a file it works on
  (https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions).
  The module's Step 0 now states both, and warns that in a nested project the CLI loads the
  outer repository's instruction files alongside the project's.
* **Copilot approvals count toward required approvals when enabled.** GitHub's changelog of
  1 September 2026
  (https://github.blog/changelog/2026-09-01-copilot-code-review-can-now-approve-pull-requests)
  says approvals are off by default, switched on by an admin, and when on a Copilot approval
  "counts toward the repository's required-approvals rule". It does not say whether that
  extends to code-owner approval, so the module now states only what the changelog says.
* **Paths with no code owner fall back to any writer's approval.** GitHub's code owners
  documentation says such changes "can be made with the approval of any user who has write
  access". The module now requires a catch-all `*` entry so code-owner approval covers every
  PR. Separately, GitHub's review documentation confirms "Pull request authors cannot approve
  their own pull requests", which the module relies on for its author-only code owner warning.

## Final pass, same date: two corrections to the module

* **The commercial package-hallucination figure is an average.** The USENIX abstract reads
  "the average percentage of hallucinated packages is at least 5.2% for commercial models and
  21.7% for open-source models". An intermediate edit had described 5.2% in the module as "the
  floor the paper reports rather than an average", which inverts that. The module now says "an
  average of at least one in twenty for commercial models". The final reviewer also reported
  per-model commercial rates from arXiv v3 below 5.2% for two of the three commercial models;
  those per-model figures were not re-checked by the author.
* **Secret scanning push protection blocks at push, not at merge, and has no separate blocking
  setting.** Per GitHub's push protection documentation, it is a single toggle that blocks
  secrets when they are pushed. The module had named a "block-on-secrets setting" that does not
  exist. A separate ruleset rule that blocks merging a pull request with unresolved secret
  alerts was announced in GitHub's changelog of 9 September 2026, in public preview; it is not
  relied on in the module and would need capturing here before it is.

**Accountability deliberately differs from the Design module.** Design says "the approver who
merges is accountable for the change". This module says the committer who signs off is
accountable for the change, and the person who merges is accountable for the merge decision.
The difference is intentional: an Implementation committer certifies NBN's DCO for code they
reviewed, which a design review PR has no equivalent of. Do not align the two without
revisiting that reason.

**This file describes earlier states of the module in several places** (the original exit
condition, the cut sections, time to restore as a tracked metric, and the streaming-diff
heuristic's location). The update sections above record what changed; where an original entry
and an update disagree about what the module says, the update is current.

**The 25% adoption trigger has left the module.** It measured adoption as the share of merged
pull requests carrying an `Assisted-by:` trailer, and the open questions below assume that
trailer is neither mandatory nor checked, so the measure was not yet reliable. The module now
compares change failure rate and rework rate against a pre-rollout baseline, triggers on two
quarters worse than that baseline, and names which of the phase's settings to tighten. The
two-quarter figure is the team's own starting point, not a published threshold. The DORA
entry's reference to the 25% "threshold", already read as "review point" per the note above,
no longer applies to the module at all. The previous wording is kept in
`implementation_cut_sections.md` for reinstatement once the trailer is mandatory and verified.

---

# Open questions for NBN, moved out of the module 2026-10-26

These were the Implementation module's "Open questions" section. They are held here rather
than in the module because they are decisions for NBN rather than instructions a developer
can act on, and the module is written to be followed. The module's "In practice" rollout
section points here for them.

Each item states the assumption the module runs on until NBN confirms otherwise. Where an
assumption differs from what the module recommends elsewhere, the recommendation is the
sensible default and the assumption is what holds until someone decides.

* **Is the attribution trailer mandatory, and verified?** Assumed neither. Mandating the
  `Assisted-by:` trailer and the `Signed-off-by:` sign-off, and checking both are present in
  CI, is the sensible default, and NBN decides whether that blocks a merge. This one also
  decides how much weight the module's exit condition can carry, since the sign-off is a
  declaration rather than an enforcement mechanism until the CI check exists.
* **Do AI-authored pull requests need a different review standard?** Assumed reviewed
  identically to human-authored changes. The open choice is whether AI authorship is itself a
  risk tier, or risk rests purely on what the code touches.
* **Should security scanning block the merge?** Assumed not mandatory at merge, since Step 0
  makes a missing scanner visible without stopping the change. Each tool blocks by a different
  mechanism, all of them server-side rather than editor-side. A ruleset with code scanning
  merge protection blocks on SAST alerts, secret scanning blocks at push, and dependency
  review can be required as a status check.
* **Which Copilot surface do developers use?** Assumed both VS Code and the CLI, with no
  standard. Plan mode and instruction files work on both, but the `#file:` and `@workspace`
  syntax in the module's examples is VS Code specific.
* **Which merge method, and are merged branches retained?** Assumed squash with branches
  deleted, which leaves attribution resting on the squashed message alone.
* **How should a reviewing model be recorded?** `Assisted-by:` conflates authoring with
  reviewing and no convention exists. Assumed reviewer models go in the PR rather than a
  commit trailer.
* **Does this workflow hold for unattended agent work?** No developer is present for the
  asynchronous coding agent, so the staging rule and the in-loop checks cannot apply as
  written. Closing this needs a run against an agent-authored PR.
* **Which checks hold up under sustained use?** The full set is a starting position. Teams
  will likely drop the highest effort-to-finding checks first, so closing this needs several
  weeks of real use with the dropped checks recorded.
* **What severity do a detected secret and an unverifiable dependency carry?** Added after
  the fourth review pass. Both are escalation triggers, but neither has a severity of its own,
  and severity decides who may accept the finding: the tech lead and the CISO's delegate for
  high or critical, otherwise the approver the Security Gate names. Assumed critical until NBN
  sets it, which routes both to the stricter approval. A secret is rotated in any case.

Two further questions sit outside the module and are recorded here so they are not lost. The
Security Gate module states it sits between Implementation and Testing, while the
Implementation module states the Security Gate sits between Testing and Deployment. One of
those is wrong and the placement needs reconciling across both. And the Release Approved gate
does not name open spec change requests in any of its criteria, although the Implementation
module now relies on that gate to stop a provisionally built change. Criterion 2, which asks
every acceptance criterion to trace to a passing test, is the natural place to name them.
