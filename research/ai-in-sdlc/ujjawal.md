# Research capture

**Source:** Claude Code: Best practices for agentic coding — Anthropic Engineering, https://www.anthropic.com/engineering/claude-code-best-practices
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Anthropic sets out a four-step working pattern for AI-assisted development:
explore the codebase, plan the change, implement it, then commit. The separation
of planning from execution is deliberate — the developer approves a plan before
any code is written.

Three practices recur throughout. First, context files (`CLAUDE.md`) are checked
into the repository so the AI's working knowledge of the project is versioned
alongside the code rather than living in individual developers' heads. Second,
the AI must be given a way to verify its own work — a test suite, a build, a
screenshot — rather than the developer accepting output on trust. Third, context
window management is treated as a core discipline, on the basis that model
performance degrades as context fills.

Anthropic distinguishes between code where autonomous operation is acceptable
and code where it is not: peripheral or low-risk changes can run with
auto-accept, while core business logic requires synchronous, detailed prompting.
Accountability sits with the human — the stated position is that the developer
whose name is on a pull request is responsible for its contents regardless of
how the code was produced.

The tool is described as intentionally low-level and unopinionated, providing
close to raw model access without imposing a specific workflow.

## Lifecycle stage mapping

Spans most of the lifecycle. Maps to planning/design (the explore-and-plan
phase), implementation, verification/testing, and version control. The context
file practice is cross-cutting rather than belonging to one stage.

## Relevance to our methodology

This is the closest published analogue to what our white paper is trying to do —
a concrete description of what a developer does at each point, rather than
general claims about productivity. Three things are directly transferable:

- **The plan-approval gate.** A human approving the plan before implementation
  is a checkpoint we should define explicitly in our lifecycle map.
- **Verification before acceptance.** This gives us a concrete answer to "what
  does the developer check before accepting output" — the AI must produce
  evidence, not just code.
- **Risk-tiered autonomy.** The peripheral-vs-core distinction suggests our
  methodology shouldn't prescribe one level of AI autonomy across the whole
  lifecycle. It should vary by what's being changed.

**Open question for the team:** Anthropic gives developers tools but does not
tell them how to work — they leave the workflow up to each team. Our brief asks
for the opposite: a standard method that everyone at NBN follows. So the
decisions Anthropic leaves open, we have to make ourselves. For example,
Anthropic says risky code needs closer checking than low-risk code, but does not
define which is which. Our white paper would need to say so. Worth asking Alessio
and Ben how strict our method should be.

---

# Research capture

**Source:** The AI-native SDLC is paying off — Atlassian, https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian names five lifecycle phases and brands the whole thing an "AI-native
SDLC": Plan, Orchestrate, Code, Review, Operate. This is the most explicit
phase-level breakdown of the four organisations I looked at — the others frame
their approach around capabilities, tool generations, or a working pattern
rather than named stages.

Atlassian reports results from an internal study across a large number of
repositories and customers, headlining a 19% increase in pull requests merged
per month and 2–3 hours saved per developer per week. The underlying figure is
3–5 additional PRs merged per month per adopter.

Their measurement position is that organisations should move away from AI
*usage* metrics (seats, activation, prompts sent) toward *outcome* metrics, and
they propose four dimensions: speed, efficiency, quality, and satisfaction.

## Lifecycle stage mapping

Provides a full-lifecycle phase model. Their five phases are a candidate
structure to compare against when the team converges on our own map.

## Relevance to our methodology

Useful as a structural reference point rather than a source of truth. Two
things to take from it:

- **A named-phase model exists and is public.** When we propose our own lifecycle
  map we can position it against Atlassian's five phases, showing where we agree
  and where we split things differently. That's a stronger argument than
  presenting our map with no comparison.
- **Outcome over usage metrics.** If our white paper says anything about
  measuring adoption, this framing is worth adopting — it's a more defensible
  position than counting AI usage.

**Caveat for citation:** Atlassian ran this study on their own product, so the
numbers favour them. Write "Atlassian reports 19%" rather than stating it as
fact, and find independent research to compare against if we use it.

---

# Research capture

**Source:** GitHub Copilot Agents — responsible use documentation, GitHub Docs, https://docs.github.com/en/copilot/responsible-use/agents
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

GitHub's responsible-use documentation for its coding agents sets out how the
agent operates and where human judgement is required. The agent works from an
issue, produces changes on its own branch, and opens a draft pull request — so
the output enters the normal review process rather than bypassing it. The draft
status is itself a design decision: nothing merges without a human acting.

GitHub does not claim ownership of the suggestions the tool produces; output
belongs to the user, with the corresponding implication that responsibility does
too.

## Lifecycle stage mapping

Implementation, version control, and code review. Also relevant to any
governance section covering ownership of AI-generated code.

## Relevance to our methodology

The draft-PR pattern is a concrete mechanism for our "how does authorship get
recorded" question. The AI's work arrives through the same channel as a human
contributor's, is attributable to a branch and a session, and cannot reach main
without a human merging it.

This is worth contrasting with approaches where AI output is accepted inline in
the editor and becomes indistinguishable from hand-written code once committed.
The difference matters for auditability, which will matter for NBN.

---

# Research capture

**Source:** Manage request allowances — GitHub Docs, https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/manage-and-track-spending/manage-request-allowances
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

GitHub meters advanced AI features as "premium requests" against an allowance.
Enterprise administrators can set budgets that block further use once reached,
and receive alerts at 75%, 90% and 100% of budget. Budget and usage management
are exposed via API, so consumption can be pulled into an organisation's own
reporting.

## Lifecycle stage mapping

Cross-cutting — governance and operational cost control rather than a single
stage.

## Relevance to our methodology

Directly relevant to the governance and token model deliverable in our brief.
GitHub's model — a request allowance with hard stops and staged alerts — is one
of three distinct approaches I found across vendors (the others being
token-based and credit-based).

For the white paper this means cost governance cannot be described in
vendor-neutral terms without losing precision. We either pick a model and
describe it concretely, or we describe the pattern (budget, alert thresholds,
hard stop, API for reporting) and note that the unit of account differs by
vendor. I'd argue for the second — it survives a tooling change.

---

# Research capture

**Source:** Costs — Claude Code documentation, https://code.claude.com/docs/en/costs.md
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Claude Code meters usage in tokens. A `/usage` command shows per-session token
statistics. The documentation is explicit that the dollar figure shown is
computed locally from token counts at list prices and may differ from the actual
bill — a caveat worth noting, since it means the in-tool number is an estimate,
not an invoice.

Administrators can set spend limits at organisation, group, or individual member
level, with daily spend reporting available.

## Lifecycle stage mapping

Cross-cutting — governance and cost control.

## Relevance to our methodology

Second of the three cost-governance models (see the GitHub capture above for the
first). The distinguishing feature here is granularity: limits can be set per
individual, not just per organisation.

The local-estimate caveat is a small but useful detail for the white paper. If we
recommend that teams monitor AI spend, we should say where the number comes from
and how much to trust it. A methodology that tells developers to watch a figure
without saying it's an estimate is giving bad advice.

---

# Research capture

**Source:** Monitoring usage — Claude Code documentation, https://code.claude.com/docs/en/monitoring-usage.md
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Claude Code exports telemetry via OpenTelemetry, a vendor-neutral standard, so
metrics can go into an organisation's existing observability stack rather than a
proprietary dashboard. Exported metrics include session counts, token usage,
cost, and lines of code. Managed settings can lock the export destination, which
prevents individual developers from redirecting telemetry.

## Lifecycle stage mapping

Cross-cutting — governance, measurement, and operations.

## Relevance to our methodology

The OpenTelemetry choice matters more than the specific metrics. It means AI
usage data can sit alongside existing engineering telemetry instead of in a
separate silo, which is the difference between AI measurement being a bolt-on
and being part of normal operations.

Worth flagging a tension for the white paper: lines of code is one of the
exported metrics, but the wider research consensus is against using it to
measure productivity. Availability of a metric isn't an argument for using it as
a KPI. If our methodology recommends what to measure, we should say what not to
measure too.

---

# Research capture

**Source:** Rovo Dev pricing — Atlassian, https://www.atlassian.com/software/rovo-dev/pricing
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian meters AI work in credits. Each action the tool performs — a code
review on a pull request, a CLI request — draws from a credit allowance, and the
cost of an action depends on its complexity rather than being flat-rate.
Administrators can set per-site limits. Notably, credits for a code review are
deducted from the pull request author's allocation, and admins can reduce
consumption by configuring reviews to run only when a PR is first created rather
than on every update.

## Lifecycle stage mapping

Cross-cutting — governance and cost control, with a specific touchpoint at code
review.

## Relevance to our methodology

Third of the three cost models. What's interesting here isn't the credit unit but
the fact that cost attribution has a *policy* dimension: deciding whose budget a
review draws from, and when reviews trigger, are process decisions, not billing
decisions.

That's a genuinely useful insight for our governance module. Cost control isn't
only about setting a limit — it's about deciding which lifecycle events consume
AI budget and who owns that consumption. Our methodology should prompt teams to
make those decisions deliberately.

---

# Research capture

**Source:** Translating principles to practice: Our No-BS Guide to Responsible Tech Reviews — Atlassian, https://www.atlassian.com/blog/strategy/responsible-tech-guide
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian publishes a set of Responsible Technology Principles and a review
template teams use to assess technology before release. The principles include
open communication and disclosure about AI use, building for trust
(privacy/security), and treating accountability as a shared team responsibility
with human oversight across the system lifecycle. The template is deliberately
designed to be usable by working teams rather than being a compliance exercise
run by a separate function.

## Lifecycle stage mapping

Cross-cutting governance. Sits alongside the lifecycle rather than inside a
single stage.

## Relevance to our methodology

The design intent behind the template is the most useful part — a governance
artefact that engineering teams will actually complete, rather than one that gets
delegated or skipped. Our brief asks for clear accountability across
multi-disciplinary teams, and the failure mode there is producing governance that
looks rigorous and gets ignored.

The disclosure principle is also relevant to our authorship question. If AI
involvement is meant to be disclosed, our methodology needs to say where that
disclosure lives — commit message, PR description, or somewhere else.

---

# Research capture

**Source:** AI-assisted Assessment of Coding Practices in Industrial Code Review — Google Research, https://research.google/pubs/ai-assisted-assessment-of-coding-practices-in-industrial-code-review/
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Google Research published work on AutoCommenter, an LLM-based system that learns
coding best practices and applies them during code review, deployed across
multiple languages at large scale internally.

The framing is worth noting: the AI is applied to *enforcing existing standards*
during review, not to generating code. It's a quality-assurance role rather than
a production role.

## Lifecycle stage mapping

Code review.

## Relevance to our methodology

Most discussion of AI in development assumes AI on the generation side with
humans reviewing. This is the inverse — humans write, AI reviews against
codified standards.

For our methodology that suggests the review stage has two distinct AI
applications that shouldn't be conflated: reviewing AI-generated code (where the
concern is that the same model may not catch its own errors) and applying AI to
enforce standards regardless of who wrote the code. We should define both.

This is also a peer-reviewed source rather than vendor marketing, which makes it
one of the stronger citations available for the white paper.

---

# Research capture

**Source:** National Framework for the Assurance of AI in Government — Australian Government Department of Finance, https://www.finance.gov.au/government/public-data/data-and-digital-ministers-meeting/national-framework-assurance-artificial-intelligence-government/introduction
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Australia has a national framework for assuring AI use in government, agreed
through the Data and Digital Ministers Meeting and built on Australia's AI Ethics
Principles. It establishes expectations around accountability and transparency
for government AI adoption.

## Lifecycle stage mapping

Cross-cutting governance. Sits above the lifecycle as an assurance obligation
rather than within any stage.

## Relevance to our methodology

This is the piece none of the four vendors address, and it's where our white
paper can say something they don't.

NBN Co operates as a government business enterprise in critical infrastructure.
A methodology that only reflects what US technology vendors publish will be
generically competent and locally incomplete. Layering Australian assurance
expectations onto the lifecycle is a genuine differentiator for the deliverable.

# Research capture

**Source:** Claude Code: Best practices for agentic coding — Anthropic Engineering, https://www.anthropic.com/engineering/claude-code-best-practices
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Anthropic sets out a four-step working pattern for AI-assisted development:
explore the codebase, plan the change, implement it, then commit. The separation
of planning from execution is deliberate — the developer approves a plan before
any code is written.

Three practices recur throughout. First, context files (`CLAUDE.md`) are checked
into the repository so the AI's working knowledge of the project is versioned
alongside the code rather than living in individual developers' heads. Second,
the AI must be given a way to verify its own work — a test suite, a build, a
screenshot — rather than the developer accepting output on trust. Third, context
window management is treated as a core discipline, on the basis that model
performance degrades as context fills.

Anthropic distinguishes between code where autonomous operation is acceptable
and code where it is not: peripheral or low-risk changes can run with
auto-accept, while core business logic requires synchronous, detailed prompting.
Accountability sits with the human — the stated position is that the developer
whose name is on a pull request is responsible for its contents regardless of
how the code was produced.

The tool is described as intentionally low-level and unopinionated, providing
close to raw model access without imposing a specific workflow.

## Lifecycle stage mapping

Spans most of the lifecycle. Maps to planning/design (the explore-and-plan
phase), implementation, verification/testing, and version control. The context
file practice is cross-cutting rather than belonging to one stage.

## Relevance to our methodology

This is the closest published analogue to what our white paper is trying to do —
a concrete description of what a developer does at each point, rather than
general claims about productivity. Three things are directly transferable:

- **The plan-approval gate.** A human approving the plan before implementation
  is a checkpoint we should define explicitly in our lifecycle map.
- **Verification before acceptance.** This gives us a concrete answer to "what
  does the developer check before accepting output" — the AI must produce
  evidence, not just code.
- **Risk-tiered autonomy.** The peripheral-vs-core distinction suggests our
  methodology shouldn't prescribe one level of AI autonomy across the whole
  lifecycle. It should vary by what's being changed.

**Open question for the team:** Anthropic gives developers tools but does not
tell them how to work — they leave the workflow up to each team. Our brief asks
for the opposite: a standard method that everyone at NBN follows. So the
decisions Anthropic leaves open, we have to make ourselves. For example,
Anthropic says risky code needs closer checking than low-risk code, but does not
define which is which. Our white paper would need to say so. Worth asking Alessio
and Ben how strict our method should be.

---

# Research capture

**Source:** The AI-native SDLC is paying off — Atlassian, https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week
**Date captured:** 2026-08-27
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian names five lifecycle phases and brands the whole thing an "AI-native
SDLC": Plan, Orchestrate, Code, Review, Operate. This is the most explicit
phase-level breakdown of the four organisations I looked at — the others frame
their approach around capabilities, tool generations, or a working pattern
rather than named stages.

Atlassian reports results from an internal study across a large number of
repositories and customers, headlining a 19% increase in pull requests merged
per month and 2–3 hours saved per developer per week. The underlying figure is
3–5 additional PRs merged per month per adopter.

Their measurement position is that organisations should move away from AI
*usage* metrics (seats, activation, prompts sent) toward *outcome* metrics, and
they propose four dimensions: speed, efficiency, quality, and satisfaction.

## Lifecycle stage mapping

Provides a full-lifecycle phase model. Their five phases are a candidate
structure to compare against when the team converges on our own map.

## Relevance to our methodology

Useful as a structural reference point rather than a source of truth. Two
things to take from it:

- **A named-phase model exists and is public.** When we propose our own lifecycle
  map we can position it against Atlassian's five phases, showing where we agree
  and where we split things differently. That's a stronger argument than
  presenting our map with no comparison.
- **Outcome over usage metrics.** If our white paper says anything about
  measuring adoption, this framing is worth adopting — it's a more defensible
  position than counting AI usage.

**Caveat for citation:** Atlassian ran this study on their own product, so the
numbers favour them. Write "Atlassian reports 19%" rather than stating it as
fact, and find independent research to compare against if we use it.

---

# Research capture

**Source:** GitHub Copilot Agents — responsible use documentation, GitHub Docs, https://docs.github.com/en/copilot/responsible-use/agents
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

GitHub's responsible-use documentation for its coding agents sets out how the
agent operates and where human judgement is required. The agent works from an
issue, produces changes on its own branch, and opens a draft pull request — so
the output enters the normal review process rather than bypassing it. The draft
status is itself a design decision: nothing merges without a human acting.

GitHub does not claim ownership of the suggestions the tool produces; output
belongs to the user, with the corresponding implication that responsibility does
too.

## Lifecycle stage mapping

Implementation, version control, and code review. Also relevant to any
governance section covering ownership of AI-generated code.

## Relevance to our methodology

The draft-PR pattern is a concrete mechanism for our "how does authorship get
recorded" question. The AI's work arrives through the same channel as a human
contributor's, is attributable to a branch and a session, and cannot reach main
without a human merging it.

This is worth contrasting with approaches where AI output is accepted inline in
the editor and becomes indistinguishable from hand-written code once committed.
The difference matters for auditability, which will matter for NBN.

---

# Research capture

**Source:** Manage request allowances — GitHub Docs, https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/manage-and-track-spending/manage-request-allowances
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

GitHub meters advanced AI features as "premium requests" against an allowance.
Enterprise administrators can set budgets that block further use once reached,
and receive alerts at 75%, 90% and 100% of budget. Budget and usage management
are exposed via API, so consumption can be pulled into an organisation's own
reporting.

## Lifecycle stage mapping

Cross-cutting — governance and operational cost control rather than a single
stage.

## Relevance to our methodology

Directly relevant to the governance and token model deliverable in our brief.
GitHub's model — a request allowance with hard stops and staged alerts — is one
of three distinct approaches I found across vendors (the others being
token-based and credit-based).

For the white paper this means cost governance cannot be described in
vendor-neutral terms without losing precision. We either pick a model and
describe it concretely, or we describe the pattern (budget, alert thresholds,
hard stop, API for reporting) and note that the unit of account differs by
vendor. I'd argue for the second — it survives a tooling change.

---

# Research capture

**Source:** Costs — Claude Code documentation, https://code.claude.com/docs/en/costs.md
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Claude Code meters usage in tokens. A `/usage` command shows per-session token
statistics. The documentation is explicit that the dollar figure shown is
computed locally from token counts at list prices and may differ from the actual
bill — a caveat worth noting, since it means the in-tool number is an estimate,
not an invoice.

Administrators can set spend limits at organisation, group, or individual member
level, with daily spend reporting available.

## Lifecycle stage mapping

Cross-cutting — governance and cost control.

## Relevance to our methodology

Second of the three cost-governance models (see the GitHub capture above for the
first). The distinguishing feature here is granularity: limits can be set per
individual, not just per organisation.

The local-estimate caveat is a small but useful detail for the white paper. If we
recommend that teams monitor AI spend, we should say where the number comes from
and how much to trust it. A methodology that tells developers to watch a figure
without saying it's an estimate is giving bad advice.

---

# Research capture

**Source:** Monitoring usage — Claude Code documentation, https://code.claude.com/docs/en/monitoring-usage.md
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Claude Code exports telemetry via OpenTelemetry, a vendor-neutral standard, so
metrics can go into an organisation's existing observability stack rather than a
proprietary dashboard. Exported metrics include session counts, token usage,
cost, and lines of code. Managed settings can lock the export destination, which
prevents individual developers from redirecting telemetry.

## Lifecycle stage mapping

Cross-cutting — governance, measurement, and operations.

## Relevance to our methodology

The OpenTelemetry choice matters more than the specific metrics. It means AI
usage data can sit alongside existing engineering telemetry instead of in a
separate silo, which is the difference between AI measurement being a bolt-on
and being part of normal operations.

Worth flagging a tension for the white paper: lines of code is one of the
exported metrics, but the wider research consensus is against using it to
measure productivity. Availability of a metric isn't an argument for using it as
a KPI. If our methodology recommends what to measure, we should say what not to
measure too.

---

# Research capture

**Source:** Rovo Dev pricing — Atlassian, https://www.atlassian.com/software/rovo-dev/pricing
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian meters AI work in credits. Each action the tool performs — a code
review on a pull request, a CLI request — draws from a credit allowance, and the
cost of an action depends on its complexity rather than being flat-rate.
Administrators can set per-site limits. Notably, credits for a code review are
deducted from the pull request author's allocation, and admins can reduce
consumption by configuring reviews to run only when a PR is first created rather
than on every update.

## Lifecycle stage mapping

Cross-cutting — governance and cost control, with a specific touchpoint at code
review.

## Relevance to our methodology

Third of the three cost models. What's interesting here isn't the credit unit but
the fact that cost attribution has a *policy* dimension: deciding whose budget a
review draws from, and when reviews trigger, are process decisions, not billing
decisions.

That's a genuinely useful insight for our governance module. Cost control isn't
only about setting a limit — it's about deciding which lifecycle events consume
AI budget and who owns that consumption. Our methodology should prompt teams to
make those decisions deliberately.

---

# Research capture

**Source:** Translating principles to practice: Our No-BS Guide to Responsible Tech Reviews — Atlassian, https://www.atlassian.com/blog/strategy/responsible-tech-guide
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Atlassian publishes a set of Responsible Technology Principles and a review
template teams use to assess technology before release. The principles include
open communication and disclosure about AI use, building for trust
(privacy/security), and treating accountability as a shared team responsibility
with human oversight across the system lifecycle. The template is deliberately
designed to be usable by working teams rather than being a compliance exercise
run by a separate function.

## Lifecycle stage mapping

Cross-cutting governance. Sits alongside the lifecycle rather than inside a
single stage.

## Relevance to our methodology

The design intent behind the template is the most useful part — a governance
artefact that engineering teams will actually complete, rather than one that gets
delegated or skipped. Our brief asks for clear accountability across
multi-disciplinary teams, and the failure mode there is producing governance that
looks rigorous and gets ignored.

The disclosure principle is also relevant to our authorship question. If AI
involvement is meant to be disclosed, our methodology needs to say where that
disclosure lives — commit message, PR description, or somewhere else.

---

# Research capture

**Source:** AI-assisted Assessment of Coding Practices in Industrial Code Review — Google Research, https://research.google/pubs/ai-assisted-assessment-of-coding-practices-in-industrial-code-review/
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Google Research published work on AutoCommenter, an LLM-based system that learns
coding best practices and applies them during code review, deployed across
multiple languages at large scale internally.

The framing is worth noting: the AI is applied to *enforcing existing standards*
during review, not to generating code. It's a quality-assurance role rather than
a production role.

## Lifecycle stage mapping

Code review.

## Relevance to our methodology

Most discussion of AI in development assumes AI on the generation side with
humans reviewing. This is the inverse — humans write, AI reviews against
codified standards.

For our methodology that suggests the review stage has two distinct AI
applications that shouldn't be conflated: reviewing AI-generated code (where the
concern is that the same model may not catch its own errors) and applying AI to
enforce standards regardless of who wrote the code. We should define both.

This is also a peer-reviewed source rather than vendor marketing, which makes it
one of the stronger citations available for the white paper.

---

# Research capture

**Source:** National Framework for the Assurance of AI in Government — Australian Government Department of Finance, https://www.finance.gov.au/government/public-data/data-and-digital-ministers-meeting/national-framework-assurance-artificial-intelligence-government/introduction
**Date captured:** 2026-08-28
**Reviewed by:** Ujjawal Mittal

## Key findings

Australia has a national framework for assuring AI use in government, agreed
through the Data and Digital Ministers Meeting and built on Australia's AI Ethics
Principles. It establishes expectations around accountability and transparency
for government AI adoption.

## Lifecycle stage mapping

Cross-cutting governance. Sits above the lifecycle as an assurance obligation
rather than within any stage.

## Relevance to our methodology

This is the piece none of the four vendors address, and it's where our white
paper can say something they don't.

NBN Co operates as a government business enterprise in critical infrastructure.
A methodology that only reflects what US technology vendors publish will be
generically competent and locally incomplete. Layering Australian assurance
expectations onto the lifecycle is a genuine differentiator for the deliverable.

The sector-specific obligations that sit alongside this framework are captured
separately below.

---

# Research capture

**Source:** Critical Infrastructure Risk Management Program factsheet — Cyber and Infrastructure Security Centre (CISC), April 2025, https://www.cisc.gov.au/resources-subsite/Documents/cisc-factsheet-risk-management-program.pdf
**Date captured:** 2026-08-31
**Reviewed by:** Ujjawal Mittal

## Key findings

The Security of Critical Infrastructure Act 2018 (SOCI Act) requires responsible
entities for certain critical infrastructure assets to establish and maintain a
written risk management program — the CIRMP — covering the material risks of
hazards that could affect their asset.

The obligations rest on four principles-based outcomes: identify material risks
using an all-hazards approach, minimise risks to prevent incidents, mitigate the
impact of incidents that do occur, and maintain effective governance through
annual board-approved reporting.

Four hazard vectors must be addressed: cyber and information security, personnel
(the trusted-insider risk from workers who could disrupt the asset), supply
chain, and physical and natural hazards.

The requirement is qualified by "so far as is reasonably practicable" —
entities weigh what is possible and proportionate given their size, maturity and
asset criticality, rather than pursuing mitigations disproportionate to the risk.

Annual reporting must be approved by the board or governing body and submitted
within 90 days of financial year end. The regulator holds a last-resort power to
direct an entity to remedy a program found seriously deficient.

**Important scoping point:** the CIRMP Rules apply to a defined list of asset
classes — electricity, gas, water, liquid fuels, financial market
infrastructure, data storage and processing, designated hospitals, domain name
systems, food and grocery, freight, broadcasting. Critical telecommunications
assets are handled under separate rules (see the next capture).

## Lifecycle stage mapping

Cross-cutting governance. Sits above the lifecycle as an organisational
obligation rather than within a development stage.

## Relevance to our methodology

Useful as the framing layer even though the specific rules do not apply to
telecommunications. Two things carry across:

The **all-hazards, four-vector structure** is a sensible way to organise our
governance module. If AI is introduced into NBN's development process, it
touches at least three of the four vectors — cyber (AI-generated code entering
production systems), personnel (who is authorised to accept AI output), and
supply chain (dependency on an external model provider).

The **"reasonably practicable" standard** is the more important insight for our
white paper. Australian critical-infrastructure regulation does not prescribe
fixed controls; it requires entities to justify proportionate decisions. That
suggests our methodology should be defensible-by-design — a team should be able
to explain why a given level of AI oversight is appropriate — rather than simply
listing mandatory steps.

---

# Research capture

**Source:** Telecommunications Security and Risk Management Program (TSRMP) Rules 2025, referenced in CISC risk management program factsheet, April 2025, https://www.cisc.gov.au/resources-subsite/Documents/cisc-factsheet-risk-management-program.pdf
**Date captured:** 2026-08-31
**Reviewed by:** Ujjawal Mittal

## Key findings

Telecommunications is regulated separately from the general CIRMP regime. The
Security of Critical Infrastructure and Other Legislation Amendment (Enhanced
Response and Prevention) Act 2024 moved the former Telecommunications Sector
Security Reforms into the SOCI Act, supported by the Telecommunications Security
and Risk Management Program Rules 2025.

The TSRMP Rules commenced on 4 April 2025 and apply to responsible entities that
own or operate a carrier asset or a relevant carriage service provider asset.

This means NBN Co, as a carrier, falls under TSRMP rather than the CIRMP Rules
that cover most other critical infrastructure sectors.

## Lifecycle stage mapping

Cross-cutting governance, same as the CIRMP capture above.

## Relevance to our methodology

This corrects an assumption I made earlier. My first pass at the Australian
governance layer assumed CIRMP applied to NBN. It does not — telecommunications
has its own instrument. Naming the wrong regulation in a client-facing white
paper would undermine the whole governance section, so it is worth being precise
here.

**Still to do.** I have established that TSRMP is the applicable instrument, but
have not yet read the TSRMP Rules themselves. The CISC website holds specific
telecommunications guidance and that is the next source to capture. What we need
from it is whether the rules impose anything on software development practice
specifically — change management, code integrity, supply chain assurance for
software — as opposed to network security more broadly. That determines whether
our governance module can point at concrete obligations or only at general
principles.

I am flagging this rather than filling the gap with assumption. The distinction
between CIRMP and TSRMP is exactly the kind of detail that a secondary summary
would have blurred, and it took reading the primary factsheet to catch.