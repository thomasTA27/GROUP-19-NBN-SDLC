# Research capture

**Source:** Managing the Development of Large Software Systems — Dr Winston W. Royce, Proceedings IEEE WESCON, August 1970, https://www.praxisframework.org/files/royce1970.pdf
**Date captured:** 2026-08-26
**Reviewed by:** Ujjawal Mittal

## Key findings

This is the paper that Waterfall came from. It does not say what most people
assume it says.

Royce draws the sequential model — requirements, then design, then code, then
test, then operate. He then writes that this approach "is risky and invites
failure." The rest of the paper argues for iteration. He recommends doing each
major phase twice, and allowing later stages to send work back to earlier ones.

He never uses the word "Waterfall" anywhere in the paper. That label was added by
other people later.

The model became fixed in government and defence work partly through procurement
standards. The United States Department of Defense set out a waterfall-style
process in DOD-STD-2167 in 1985, updated as 2167A in 1988. These standards
required formal reviews and sign-offs, which in practice forced contractors to
design and document everything before building. The standards were later
criticised for this and were replaced by MIL-STD-498 in 1994.

## Lifecycle stage mapping

Gives the standard sequential phase list that most later frameworks define
themselves against.

## Relevance to our methodology

Two points matter for our map.

The first is useful for the brainstorm. If someone argues that a linear map is
simply Waterfall and therefore out of date, the fair response is that even the
author of Waterfall argued for feedback loops. The real disagreement is not
linear against iterative. It is how much a team commits to before starting work.

The second is about NBN. The procurement history explains why a client in this
position may still expect Waterfall-shaped documents. Phase gates and sign-off
records fit neatly with contracts and audits. Our compliance gate comes from
this tradition, even though the rest of our map does not.

---

# Research capture

**Source:** Manifesto for Agile Software Development — Beck, Fowler, Cockburn, Jeffries and 13 others, February 2001, https://agilemanifesto.org
**Date captured:** 2026-08-26
**Reviewed by:** Ujjawal Mittal

## Key findings

Four values and twelve principles, written by 17 practitioners in Snowbird, Utah
in February 2001.

The values are written as preferences rather than rejections. The manifesto
states that while there is value in the items on the right, the authors value the
items on the left more. Agile therefore does not reject documentation or
planning. It changes their priority.

The main structural claim is that fixed phases should be replaced by short
repeating iterations, with each iteration containing some of every activity.
Principle 2 welcomes changing requirements even late in development. Principle 7
states that working software is the main measure of progress, rather than
documents or completed phases.

Agile assumes small teams working in the same place and organising themselves.
Face-to-face conversation is named as the best form of communication. This
assumption is where the scaling problem comes from, and it is the problem SAFe
was later created to solve.

## Lifecycle stage mapping

Avoids fixed stages on purpose. Relevant to whether our boxes are sequential
phases or repeating activities.

## Relevance to our methodology

There is a direct tension here. Our brief asks for a standard method with defined
steps. Agile argues that defining steps too tightly is the problem rather than
the solution.

This does not make our brief wrong, but we should be able to explain why a
standard method suits NBN when Agile argues against one. The likely answer is
scale and regulation. Agile's assumption of small teams does not hold at NBN, and
its light approach to documentation would not satisfy an auditor.

This is worth raising in the brainstorm. If our map is a fixed sequence of eight
boxes, we have taken a side in an argument that has been running for twenty-five
years. We should do that on purpose rather than by accident.

---

# Research capture

**Source:** DevOps origins and the Accelerate/DORA research programme — Patrick Debois (DevOpsDays 2009); Forsgren, Humble and Kim, Accelerate (2018); dora.dev
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

The term DevOps comes from Patrick Debois, who organised the first DevOpsDays
event in Ghent in October 2009. The idea was prompted by a 2009 conference talk
by John Allspaw and Paul Hammond about deploying ten or more times a day at
Flickr through cooperation between developers and operations staff.

DevOps replaces the straight line with a continuous loop, usually drawn as a
figure eight: plan, code, build, test, release, deploy, operate, monitor.
Monitoring feeds back into planning, so there is no end point.

The original complaint behind DevOps is organisational rather than procedural. It
is about the gap between developers and operations, often called the wall of
confusion. Waterfall treats operations as a later phase handled by different
people. DevOps treats them as one team with shared responsibility.

Two practices hold the model together. The first is automation of build, test and
deployment. The second is keeping changes small, because small changes are easier
to check and easier to reverse.

The Accelerate research tested four measures: deployment frequency, lead time for
changes, change failure rate, and time to restore service. It found that strong
teams achieve speed and stability together rather than trading one against the
other.

## Lifecycle stage mapping

Provides the loop shape, and the operate and monitor stages that other frameworks
often leave outside the lifecycle.

## Relevance to our methodology

This is where my proposed map takes its shape. The loop from operate back to
intake comes from DevOps rather than Waterfall or Agile.

The principle of small changes also matters in an AI context. If AI makes it easy
to produce large changes quickly, that works against the practice DevOps says
keeps delivery safe. Our methodology should probably say something about the size
of changes, not only about who approves them.

The four measures are also the most defensible answer I have found to the
question of what a team should track.

---

# Research capture

**Source:** Scaled Agile Framework — Dean Leffingwell, Scaled Agile Inc., https://framework.scaledagile.com
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

SAFe exists to apply Agile at organisational scale. It was created by Dean
Leffingwell and first released around 2011. The current version is 6.0, with an
AI-Native SAFe operating model released in June 2026 that sits alongside the core
framework rather than replacing it.

SAFe offers four configurations of increasing size — Essential, Large Solution,
Portfolio and Full — so an organisation adopts only as much structure as it
needs. The main delivery unit is the Agile Release Train, usually five to twelve
teams, which plans together at PI Planning and delivers in Program Increments of
eight to twelve weeks.

On governance, SAFe rejects traditional phase gates. Its fifth principle is to
base milestones on objective evaluation of working systems, and its glossary
describes phase gates as belonging to older sequential approaches. Instead of
document sign-offs, SAFe uses demonstrations of the working system at a fixed
rhythm.

For regulated industries, SAFe provides a Lean Quality Management System and a
concept called Solution Intent. Solution Intent is a single living record holding
requirements, designs, standards, tests and traceability, built up continuously
rather than assembled at the end. The reasoning, quoting Deming, is that
inspection at the end is too late because the quality is already in the product.

## Lifecycle stage mapping

Provides a governance structure rather than a list of phases. Most relevant to
when our approval gates happen and what evidence they produce.

## Relevance to our methodology

This is the framework that applies most directly to NBN, for two reasons.

First, NBN already uses SAFe. Any methodology we propose will land inside an
existing SAFe structure, so our gates should attach to ceremonies NBN already
runs rather than creating separate checkpoints.

Second, Solution Intent is a better answer to our authorship question than
anything the AI vendors publish. The idea that evidence builds up continuously
rather than being gathered before a gate is exactly what recording AI involvement
at commit time achieves.

---

# Research capture

**Source:** SAFe – Good But Not Good Enough, and Issues with SAFe — Ron Jeffries, February 2014, https://ronjeffries.com/xprog/articles/safe-good-but-not-good-enough/
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Ron Jeffries is one of the seventeen people who signed the Agile Manifesto and a
founder of Extreme Programming. His criticism of SAFe is the clearest documented
disagreement inside the Agile community.

His summary is that SAFe is good but not good enough, and less charitably that it
is fast food. His specific objections are that SAFe is heavily top-down, with the
important decisions made at portfolio level; that its two-day PI Planning is
large-scale planning up front under a different name; that it treats dependencies
between teams as normal rather than as problems to remove; and that Program
Increments push teams toward large synchronised releases rather than continuous
flow.

Other Agile figures have made similar arguments. Jeff Gothelf published a piece
titled "SAFe is Not Agile."

## Lifecycle stage mapping

Not a lifecycle model. A criticism of one, relevant to how much structure our
methodology should carry.

## Relevance to our methodology

I captured this because the disagreement is real, and we should not present these
frameworks as though they agree with each other.

The practical warning is this. If our methodology adds gates, planning sessions
and documents on top of what NBN already runs, we may create exactly what
Jeffries objects to. Three approval gates is defensible for critical
infrastructure. Three gates plus a planning ritual plus a compliance document
plus a disclosure record starts to look like the thing Agile was created to
escape.

The white paper should state that we chose the gates deliberately and kept
everything else light.

---

# Research capture

**Source:** NBN Co "dual-speed" AI approach — Richard Halliday, General Manager Operations, AWS Summit Sydney, reported by Cyber Daily, https://www.cyberdaily.au/digital-transformation/13606-nbn-to-shift-towards-an-agentic-ai-strategy
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

NBN Co has described publicly how it wants to approach AI. Its general manager of
operations said the company needs a dual-speed approach, where core capabilities
are maintained with high resilience, while far more innovation is possible at the
edge.

NBN also already runs Agile and SAFe internally.

## Lifecycle stage mapping

Cross-cutting. Affects how strict each stage should be rather than adding a
stage.

## Relevance to our methodology

This is the most useful single finding in my research, because it is the client
answering a question we were about to debate ourselves.

We have been asking whether our methodology should be strict or flexible. NBN's
stated position is that it should be both, depending on what is being changed.
Core network capability receives heavy governance. Work at the edge moves faster.

This matches the risk-based approach in my lifecycle proposal, and it means the
idea does not originate with me. It comes from the client, which is a stronger
position to argue from.

It also suggests our white paper should not describe one uniform process. It
should describe a process with two settings, and clear criteria for deciding
which one applies.

## Caveat

This is a secondary source reporting a conference talk. Before this goes into the
white paper we should find NBN's own published material, or confirm the position
with Alessio.

---

# Research capture

**Source:** The AI-native SDLC is paying off — Atlassian, https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian names five lifecycle phases and calls the result an AI-native SDLC:
Plan, Orchestrate, Code, Review, Operate. This is the clearest phase-level model
published by any of the AI vendors. The others describe capabilities, tool
generations or working patterns rather than named stages.

Atlassian reports results from an internal study covering a large number of
repositories and customers. The headline figures are a 19 per cent increase in
pull requests merged per month and two to three hours saved per developer per
week.

Their position on measurement is that organisations should move away from usage
figures, such as seats and prompts sent, and toward outcome measures. They
propose four: speed, efficiency, quality and satisfaction.

## Lifecycle stage mapping

Provides a full-lifecycle phase model. Their five phases are a structure to
compare our own map against.

## Relevance to our methodology

Useful as a reference point rather than a source of truth.

When we propose our own map we can position it against Atlassian's five phases
and show where we agree and where we divide things differently. That is a
stronger argument than presenting our map with nothing to compare it to.

Their position on outcome measures over usage measures is also worth adopting if
our white paper says anything about measuring adoption.

## Caveat

Atlassian ran this study on their own product, so the figures favour them. Any
use should be written as a result Atlassian reports rather than as established
fact, and balanced against independent research.

---

# Research capture

**Source:** Claude Code: Best practices for agentic coding — Anthropic Engineering, https://www.anthropic.com/engineering/claude-code-best-practices
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Anthropic describes a four-step working pattern for AI-assisted development:
explore the codebase, plan the change, implement it, then commit. The separation
of planning from execution is deliberate, and the developer approves a plan
before any code is written.

Three practices appear throughout. Context files are kept in the repository, so
the AI's knowledge of the project is versioned with the code rather than held by
individual developers. The AI must be given a way to check its own work, such as
a test suite or a build, rather than the developer accepting output on trust.
Context is managed carefully, because model performance drops as the context
window fills.

Anthropic separates code where autonomous operation is acceptable from code where
it is not. Peripheral or low-risk changes can run with less supervision, while
core business logic requires detailed prompting and closer attention.
Accountability stays with the person. Their stated position is that the developer
whose name appears on a pull request is responsible for its contents regardless
of how the code was produced.

The tool is described as low-level and unopinionated. It provides close to raw
model access without imposing a particular workflow.

## Lifecycle stage mapping

Covers most of the lifecycle: planning, implementation, verification and version
control. The practice of keeping context files is cross-cutting rather than
belonging to one stage.

## Relevance to our methodology

This is the closest published equivalent to what our white paper is trying to
produce. It describes what a developer actually does at each point rather than
making general claims about productivity.

Three things carry across directly. The plan-approval gate, because a person
approving the plan before implementation is a checkpoint we should define
explicitly. Verification before acceptance, which answers the question of what a
developer checks before accepting output. And varying supervision by risk, which
suggests our methodology should not apply one level of AI autonomy across the
whole lifecycle.

## Open question for the team

Anthropic gives developers tools but does not tell them how to work. Our brief
asks for the opposite: a standard method that everyone at NBN follows. The
decisions Anthropic leaves open are therefore ours to make. For example,
Anthropic states that risky code needs closer checking than low-risk code but
does not define which is which. Our white paper would need to say. This is worth
raising with Alessio and Ben.

---

# Where these frameworks disagree

A summary for the brainstorm, drawing on the captures above.

| Question | Waterfall | Agile | DevOps | SAFe |
|---|---|---|---|---|
| Line or loop | Line | Loop, short iterations | Continuous loop | Increments on a fixed rhythm |
| Requirements fixed at the start | Yes | No | No | Fixed per increment |
| Where gates sit | Between every phase | Few formal gates | Automated in the pipeline | At existing ceremonies |
| Developers and operations | Separate | Mostly silent | One team | Joined through the pipeline |
| Documentation | Comprehensive, up front | Only what is needed | Automated evidence | A living record |
| Release pattern | One large release at the end | Frequent increments | Continuous | Build on a rhythm, release when ready |
| Assumed scale | Large projects | Small teams in one place | Small independent teams | Explicit structure for scale |
| Fit for regulated work | Strong | Weak without adaptation | Requires automated compliance | Strong |

## The three disagreements our map cannot avoid

**Line or loop.** Every framework except Waterfall treats the lifecycle as a
loop. I have drawn a loop.

**How much is fixed before work starts.** Waterfall says everything, Agile says
as little as possible, and SAFe fixes scope for eight to twelve weeks. Our
plan-approval gate takes a position on this, and we should say so rather than
leave it implied.

**What form the gates take.** Only Waterfall treats gates as document sign-offs.
DevOps wants them automated, SAFe wants them attached to existing ceremonies, and
Agile treats them as obstacles. The question for our map is therefore not whether
to have gates, but how each one is carried out.

## What we can leave alone

Whether SAFe counts as genuinely Agile. That argument has been running for twelve
years without resolution, and we do not need to settle it in order to use SAFe's
compliance structure.