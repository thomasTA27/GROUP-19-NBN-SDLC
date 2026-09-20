# Deployment: AI in release automation and rollback decisions

**Prepared by:** Sajad Ali Akbari
**Date captured:** 2026-09-15 (updated 2026-09-19)
**Research angle:** Sprint 2 module research supporting [white-paper/modules/deployment.md](../../white-paper/modules/deployment.md). It covers how companies actually use AI during the Deployment phase, specifically CI/CD, release automation and rollback decisions, set against standard, non-AI practice as a baseline.

All captures follow [../ai-in-sdlc/TEMPLATE.md](../ai-in-sdlc/TEMPLATE.md). Five sources below. Two more directly relevant sources already exist in [../ai-in-sdlc/sajad.md](../ai-in-sdlc/sajad.md) and are cross-referenced rather than duplicated (see "Cross-referenced sources" at the end).

**Where this sits on the agreed map:** Deployment is phase 5 of six, immediately after Gate 3, "Release approved". See [white-paper/lifecycle-map/README.md](../../white-paper/lifecycle-map/README.md). The map marks this phase orange (a human decision), not blue (human verification) or red (blocking automated gate). Every source below is read with that classification in mind.

## Contents

**Standard practice (baseline)**
1. [DORA: Four Keys metrics](#1-dora-four-keys-metrics)

**AI in release automation and rollback**
2. [Google & Netflix: Kayenta, automated canary analysis](#2-google--netflix-kayenta-automated-canary-analysis)
3. [GitLab Duo: Root Cause Analysis for CI/CD pipeline failures](#3-gitlab-duo-root-cause-analysis-for-cicd-pipeline-failures)

**NBN's own tooling (GitHub Copilot)**
4. [GitHub Copilot: CLI automation in Actions and release note attribution](#4-github-copilot-cli-automation-in-actions-and-release-note-attribution)

**Cross-cutting**
5. [DORA: 2025 State of AI-assisted Software Development](#5-dora-2025-state-of-ai-assisted-software-development)

## Notes on the set as a whole

Every AI capability found in this set stops short of holding go or no go authority, or rollback authority, outright. Kayenta auto-promotes or auto-fails only within pre-set score limits and escalates anything marginal to a human. GitLab Duo proposes a fix rather than applying one. That pattern lines up with the lifecycle map already marking this phase orange rather than red. The research supports the classification rather than contradicting it, which is worth stating plainly in the module rather than re-deriving from scratch.

The clearest tension in the set is the DORA 2025 finding that AI adoption now correlates positively with delivery throughput but still negatively with delivery stability. That is a direct, sourced answer to the "standard phase vs AI-changed phase" framing the task asked for. The mechanics of release get faster, the reliability of what gets released does not automatically follow, and DORA is explicit that the gap is closed by practices the team already controls (automated testing, version control discipline, fast feedback loops), not by adopting more AI tooling on its own.

One sourcing caveat to flag before anything here is cited in the white paper: in the course of searching I found a widely repeated web claim describing a "Google proactive rollback system" using Bayesian models to abort risky releases, with a roughly 30% incident reduction figure attached. I could not trace this to any primary Google source. It appears to originate from a non-peer-reviewed paper and gets repeated uncritically by SEO content sites. I am deliberately not capturing it as a source and recommend it stay out of the white paper unless someone finds a primary citation.

---

# Standard practice (baseline)

## 1. DORA: Four Keys metrics

**Source:** DORA's software delivery performance metrics, DORA (Google), https://dora.dev/guides/dora-metrics-four-keys/

**Date captured:** 2026-09-15 (metric list re-checked 2026-09-19)

**Reviewed by:** Sajad Ali Akbari

### Key findings

Defines the standard measurement framework this module needs as a baseline for what good looks like, before asking how AI changes it. The page states that DORA's metrics have "shifted from the original four keys to the current five-metric model". Three throughput factors: change lead time (time from commit to production), deployment frequency (how often a team ships), and failed deployment recovery time (time to recover when a deployment fails). Two instability factors: change fail rate (the ratio of deployments requiring immediate intervention) and deployment rework rate, which the page defines as "the ratio of deployments that are unplanned but happen as a result of an incident in production". DORA's own framing is that these are meant to be read as a set, not optimised one at a time.

### Lifecycle stage mapping

Deployment (phase 5). This is the standard measurement baseline the "how AI changes this" half of the module needs to contrast against.

### Relevance to our methodology

Gives the module a concrete, non-AI definition of what this phase is trying to achieve before any AI claim is evaluated against it. Also gives us the vocabulary (deployment frequency, change fail rate, lead time, recovery time) that the DORA 2025 AI report (#5) later uses when it says AI improves throughput but not stability. Without this capture that finding is not fully legible.

---

# AI in release automation and rollback

## 2. Google & Netflix: Kayenta, automated canary analysis

**Source:** Introducing Kayenta: An open automated canary analysis tool from Google and Netflix, Google Cloud Blog, https://cloud.google.com/blog/products/gcp/introducing-kayenta-an-open-automated-canary-analysis-tool-from-google-and-netflix ; background via Automated Canary Analysis at Netflix with Kayenta, Netflix TechBlog

**Date captured:** 2026-09-15

**Reviewed by:** Sajad Ali Akbari

### Key findings

Kayenta is an open-source service, built jointly by Google and Netflix and integrated with the Spinnaker delivery platform, that automates the judgement call in a canary release. A new version (the canary) takes a small slice of production traffic alongside the stable version (the baseline). Kayenta pulls metrics from the team's existing monitoring (Stackdriver, Prometheus, Datadog, or Netflix's Atlas), runs statistical tests, and returns a 0 to 100 score classified as success, marginal, or failure.

The important detail for this module: the score's classification determines what happens next, not a person watching a dashboard. Success auto-promotes the release. Failure auto-triggers rollback. Marginal routes to a human approval path. Netflix expected the system to be making "thousands of canary judgments per day." No hard numbers on incident reduction were published in the primary source. Waze's cited experience is qualitative ("increase development velocity by detecting anomalies faster"), not a measured figure, and should not be quoted as one.

### Lifecycle stage mapping

Deployment (phase 5). Both release automation and rollback threads: this single system does both, which is itself a finding (the two threads in the task description are not always separate systems in practice).

### Relevance to our methodology

This is the cleanest example in the set of automation that is real and in production use at scale, but bounded. Only the unambiguous ends of the score range act without a person, and the tool was explicitly designed to route the ambiguous middle to a human rather than force a machine judgement on it. That three-way split, auto-promote, escalate, auto-rollback, is a reusable pattern for how the module describes what AI is trusted to decide alone in this phase.

No hard quantitative claim survives scrutiny here beyond the qualitative Waze quote. Flag this if the module is tempted to cite a specific incident-reduction number for Kayenta. None was found in the primary source.

---

## 3. GitLab Duo: Root Cause Analysis for CI/CD pipeline failures

**Source:** Developing GitLab Duo: Blending AI and root cause analysis to fix CI/CD, GitLab Blog, https://about.gitlab.com/blog/developing-gitlab-duo-blending-ai-and-root-cause-analysis-to-fix-ci-cd/

**Date captured:** 2026-09-19 (re-attempted; first attempt on 2026-09-15 hit an HTTP 403 and used a secondary trade-press writeup instead)

**Reviewed by:** Sajad Ali Akbari

### Key findings

GitLab Duo's Root Cause Analysis feature reads failed CI/CD job logs by forwarding portions of them, along with pre-crafted prompts, to GitLab's AI Gateway, which analyses the unstructured log text and returns a likely cause and fix. GitLab's own examples show it identifying a missing Python module (Redis) and a missing Go runtime binary in a container image, the kind of dependency and environment errors that otherwise take manual log-reading to spot. The post names quality benchmarking for the generated responses as future work, not something already measured. Available to GitLab Ultimate customers now, with self-managed and dedicated deployments coming.

The feature proposes a cause and fix. Nothing in the source suggests it applies fixes without a person reviewing and merging them. No accuracy or time-saved figures are published.

### Lifecycle stage mapping

Deployment (phase 5). Specifically the pre-gate mechanics of getting a release pipeline green, which sits just before the actual promote or rollback decision but is squarely inside "CI/CD release automation" as the task describes it.

### Relevance to our methodology

A concrete example of AI handling the tedious, low-judgement part of this phase, reading logs to find a needle in a haystack, rather than the judgement call itself. Useful for the "What to ask the AI" section of the module: pipeline failure triage is a good, low-risk request to make of AI at this stage, distinct from asking it to decide whether a release should ship.

---

# NBN's own tooling (GitHub Copilot)

## 4. GitHub Copilot: CLI automation in Actions and release note attribution

**Source:** Automating tasks with Copilot CLI and GitHub Actions, GitHub Docs, https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/automate-with-actions ; and Generated release notes credit you for Copilot pull requests, GitHub Changelog, https://github.blog/changelog/2026-06-18-generated-release-notes-credit-you-for-copilot-pull-requests/

**Date captured:** 2026-09-19 (first link) and 2026-09-15 (second link)

**Reviewed by:** Sajad Ali Akbari

### Key findings

GitHub's own documentation covers running Copilot CLI as a step inside a GitHub Actions workflow, triggered on a schedule, on a repository event, or manually from the Actions tab. The documented use cases are summarising repository activity, generating reports and scaffolding project content, including, as a named next step, opening a pull request to update a changelog file. Authentication runs through `GITHUB_TOKEN` or a personal access token scoped with "Copilot Requests" permission, and flags like `--no-ask-user` and `--allow-tool` control what it is allowed to do unattended. GitHub recommends its separate "Agentic Workflows" feature over calling Copilot CLI directly for most automation, since agentic workflows carry extra guardrails suited to running unattended.

Separately, GitHub changed how its automatically generated release notes credit a merged pull request opened by the Copilot coding agent. Before this change, that release note credited `@copilot` alone. Now the same release note reads, for example, "Add `create_feature_flag` MCP tool by `@monalisa` with `@copilot`", crediting the human who directed the agent's work alongside the agent. This is rolled out across all repositories and pricing plans.

Nothing in either source gives Copilot a role in canary judgement, risk scoring or rollback. Its documented role in this phase is CI/CD automation, log or activity summarisation, drafting changelog pull requests, and crediting the human behind an agent-opened pull request.

### Lifecycle stage mapping

Deployment (phase 5). CI/CD automation, release note generation and authorship attribution within a release artifact.

### Relevance to our methodology

This is the source that describes the actual tool NBN's engineers use day to day, rather than a comparable alternative. It grounds the module's documentation practice content in something directly actionable at NBN. Copilot CLI can be wired into a deployment pipeline today to draft a changelog pull request from merged work, which a person then reviews and merges. That is the same propose then human decides pattern every other source in this set shows, just on NBN's own platform.

The release notes change is also a concrete, adoptable pattern for the module's "How authorship is recorded" section: a major platform has already made a product decision that release-facing authorship records should name the accountable human even when an agent opened the pull request, not attribute the work to the agent alone (see also William's commit-trailer research in [white-paper/governance/research.md](../../white-paper/governance/research.md), which covers the same principle at the commit layer instead of the release notes layer).

It does not, on this evidence, extend to the canary, risk-scoring or rollback capabilities documented elsewhere in this set. Those remain a gap between what Copilot ships out of the box and what a purpose-built tool like Kayenta does. This is official vendor documentation and a single-vendor product change, not independent research or a measured case study. It describes what the product can be configured to do and what GitHub has decided to credit, not how effectively teams use it in practice.

---

# Cross-cutting

## 5. DORA: 2025 State of AI-assisted Software Development

**Source:** Announcing the 2025 DORA Report, Google Cloud Blog, https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report ; full report at https://dora.dev/dora-report-2025/

**Date captured:** 2026-09-15

**Reviewed by:** Sajad Ali Akbari

### Key findings

Survey of nearly 5,000 technology professionals plus over 100 hours of qualitative data, fielded June to July 2025. Central finding for this module: "we observe a positive relationship between AI adoption on both software delivery throughput and product performance. However, AI adoption does continue to have a negative relationship with software delivery stability", a change from the prior year's report, where the throughput relationship had not yet turned positive (see the 2024 DORA report already captured in [../ai-in-sdlc/sajad.md](../ai-in-sdlc/sajad.md), source #4).

The report's explanation is architectural rather than purely behavioural: "AI accelerates software development, but that acceleration can expose weaknesses downstream. Without robust control systems, like strong automated testing, mature version control practices, and fast feedback loops, an increase in change volume leads to instability." Teams in loosely coupled architectures with fast feedback loops see gains. Teams constrained by tightly coupled systems and slow processes see little or no benefit. The report frames AI generally as an amplifier: it strengthens what a team already does well and worsens what it already does badly, rather than fixing weak practice on its own.

### Lifecycle stage mapping

Deployment (phase 5), and cross-cutting more broadly. Most directly relevant here because delivery stability, change fail rate and recovery time, is measured at and around this phase.

### Relevance to our methodology

This is the single most load-bearing source for the "standard phase vs AI-changed phase" framing the task description asked for. It gives a direct, current, quantified answer. AI measurably speeds up the mechanics covered by release automation, and by extension faster rollback response, but does not on its own improve, and continues to modestly worsen, the reliability outcome (DORA's instability metrics) that the standard phase (source #1) is trying to protect. The module should present AI adoption in this phase as conditional on the underlying delivery discipline already being strong, not as an unconditional improvement.

Consistent with the 2024 DORA report and the METR trial already captured in `sajad.md`. This is now the third consecutive DORA-adjacent or rigorous-trial finding pointing the same direction, individual and mechanical gains, team and system-level caution, which strengthens rather than merely repeats the earlier finding.

---

## Cross-referenced sources (not duplicated here)

Two sources already captured in full in [../ai-in-sdlc/sajad.md](../ai-in-sdlc/sajad.md) are directly relevant to this module and should be cited from there rather than re-captured:

- **Google SRE: AI in SRE, Engineering Reliable Operations** (source #16). The autonomy ladder (propose-then-human-approves) and the circuit-breaker / pause-everything-in-flight control are the most directly reusable governance pattern for how this module describes rollback authority. Its 10% MTTM reduction and 44% investigation-time reduction figures are validated through A/B testing, which makes them stronger evidence than most of what this capture found for the rollback thread specifically.
- **Google and DORA: Accelerate State of DevOps Report 2024** (source #4). The prior year's version of source #5 above. Citing both years together is what makes the "positive relationship now, was not positive before" trend in source #5 legible rather than a single snapshot.
