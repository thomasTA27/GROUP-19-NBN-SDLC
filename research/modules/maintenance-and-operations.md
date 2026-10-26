# Maintenance & Operations: AI in incident response, diagnosis and routine maintenance

**Prepared by:** William
**Date captured:** 2026-10-21
**Research angle:** Sprint 2 module research supporting [white-paper/modules/maintenance-operations.md](../../white-paper/modules/maintenance-operations.md). It covers how AI is used once a release is running in production: alert triage, root-cause diagnosis, fixes, dependency and security patching, and post-incident review, set against standard non-AI practice. It also covers the Australian obligations that constrain this phase at NBN as a telecommunications carrier.

All captures follow [../ai-in-sdlc/TEMPLATE.md](../ai-in-sdlc/TEMPLATE.md). Fourteen sources below. Sources already captured in [deployment.md](deployment.md) and [../ai-in-sdlc/sajad.md](../ai-in-sdlc/sajad.md) are cross-referenced rather than duplicated (see "Cross-referenced sources" at the end).

**Where this sits on the agreed map:** Maintenance & Operations is phase 6 of six. It starts once Deployment promotes a release to full traffic, and its output loops back into Planning. See [white-paper/lifecycle-map/README.md](../../white-paper/lifecycle-map/README.md). This capture reads the phase as orange (a human decision), the same as Deployment; confirm against the map.

## Contents

**Standard practice (baseline)**
1. [SWEBOK v4: Software Maintenance and Software Engineering Operations](#1-swebok-v4-software-maintenance-and-software-engineering-operations)
2. [Google SRE: Postmortem culture](#2-google-sre-postmortem-culture)

**Australian obligations**
3. [ASD Essential Eight: patching and restricting administrative privileges](#3-asd-essential-eight-patching-and-restricting-administrative-privileges)
4. [SOCI Act: mandatory cyber incident reporting](#4-soci-act-mandatory-cyber-incident-reporting)
5. [Telecommunications security reforms moved into SOCI](#5-telecommunications-security-reforms-moved-into-soci)
6. [ASD-led joint guidance: Careful adoption of agentic AI services](#6-asd-led-joint-guidance-careful-adoption-of-agentic-ai-services)
7. [Australian AI governance: DISR Guidance for AI Adoption and DTA policy](#7-australian-ai-governance-disr-guidance-for-ai-adoption-and-dta-policy)

**AI in incident response**
8. [Microsoft: LLM root-cause and mitigation recommendations (ICSE 2023)](#8-microsoft-llm-root-cause-and-mitigation-recommendations-icse-2023)
9. [Microsoft: RCACopilot (EuroSys 2024)](#9-microsoft-rcacopilot-eurosys-2024)
10. [LLM log parsing: LILAC and LUNAR](#10-llm-log-parsing-lilac-and-lunar)

**AI in maintenance**
11. [Legacy code comprehension and migration: MITRE and Google](#11-legacy-code-comprehension-and-migration-mitre-and-google)
12. [Dependabot security pull requests (MSR 2021)](#12-dependabot-security-pull-requests-msr-2021)
13. [Patch correctness: overfitting in automated program repair](#13-patch-correctness-overfitting-in-automated-program-repair)
14. [Security of Copilot-generated code (IEEE S&P 2022)](#14-security-of-copilot-generated-code-ieee-sp-2022)

**Security of AI in operations**
15. [OWASP Top 10 for LLM Applications 2025](#15-owasp-top-10-for-llm-applications-2025)

## Notes on the set as a whole

The pattern matches Deployment's: nothing in this set gives AI authority to act on production alone. The empirical studies show AI is useful for reading and proposing (log summaries, root-cause hypotheses, drafts) and unreliable as a decider. The Australian government sources point the same way independently, through least privilege, limited agent autonomy and human-held reporting obligations. That supports reading this phase as orange.

The biggest evidence gap: almost all root-cause evidence comes from Microsoft's cloud services, and the largest study used GPT-3-era models. Nothing found measures AI-assisted incident response in a telecommunications network. NBN's own incident records (see the AI-involvement field in the module) are the only way to close that gap.

Sourcing caveats to resolve before anything here is cited in the white paper:

- **Dropped figures.** An earlier draft cited two Dependabot figures: that 28% of Dependabot PRs with a failed CI pipeline were merged (attributed to Rombaut, Cogo and Hassan, 2024), and that 57% of bot-initiated security updates were merged (a 2025 Empirical Software Engineering study). Neither could be traced to a primary source, so both are left out.
- **Overfitting percentages.** Specific overfitting rates often quoted for older repair tools (Le et al. 2018; Qi et al. 2015) were not confirmed against the papers. The module uses only the qualitative finding.
- **Opened directly for this capture:** sources 4, 5, 6, 7, 8, 9 (abstract), 12 and the METR cross-reference. **Taken from an earlier research run and not re-opened:** sources 1, 2, 3 (cyber.gov.au blocks automated access), 10, 11, the Petke et al. part of 13, 14 and 15. Spot-check these before the white paper is finalised.

---

# Standard practice (baseline)

## 1. SWEBOK v4: Software Maintenance and Software Engineering Operations

**Source:** Guide to the Software Engineering Body of Knowledge (SWEBOK) v4.0, IEEE Computer Society, 2024, https://www.computer.org/education/bodies-of-knowledge/software-engineering

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

SWEBOK v4 treats this phase as two knowledge areas. Software Maintenance covers changing software already in service: correcting faults, adapting to a changed environment, improving it, and preventing future problems. Software Engineering Operations is new in v4 and covers deploying, operating and supporting software while keeping it stable and intact.

### Lifecycle stage mapping

Maintenance & Operations (phase 6). Framing only.

### Relevance to our methodology

The standards anchor for this module, as SWEBOK is for the other modules. The split into maintenance and operations is why the module has two runbooks: incident-driven work and routine maintenance.

---

## 2. Google SRE: Postmortem culture

**Source:** Postmortem Culture: Learning from Failure, Site Reliability Engineering (Google), https://sre.google/sre-book/postmortem-culture/

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

Google's SRE practice requires postmortems to be blameless: they identify contributing causes without blaming an individual or team. Postmortems are written for incidents that meet agreed triggers, such as user-visible downtime, data loss, or an on-call engineer having to intervene.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), the review step.

### Relevance to our methodology

The baseline for step 7 of the incident runbook. AI can draft a postmortem, but the blameless rule has to be written into the `postmortem-draft` skill, because a model summarising chat logs will otherwise name whoever typed the command that broke things.

---

# Australian obligations

## 3. ASD Essential Eight: patching and restricting administrative privileges

**Source:** Essential Eight Maturity Model, Australian Signals Directorate, https://www.cyber.gov.au/business-government/asds-cyber-security-frameworks/essential-eight/essential-eight-maturity-model

**Date captured:** 2026-10-21 (page blocks automated access; figures from an earlier research run)

**Reviewed by:** pending

### Key findings

Patch timeframes: patches for vulnerabilities in online services are applied within 48 hours of release when the vendor rates the vulnerability critical or a working exploit exists, and within two weeks otherwise. Restricting administrative privileges: privileged access is validated when first requested, and privileged accounts are used only for privileged duties.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), routine maintenance and agent access.

### Relevance to our methodology

Two uses. The patch timeframes are a hard clock the routine maintenance runbook works to, and the clock runs until the patch is applied, not drafted. The privilege controls are the most direct Australian basis for treating an AI agent as a privileged identity: no standing production credentials, access requested and reviewed.

---

## 4. SOCI Act: mandatory cyber incident reporting

**Source:** Report a cyber security incident, ASD's ACSC, https://www.cyber.gov.au/report-and-recover/report/report-a-cyber-security-incident ; and Notification of cyber security incident guidance, Cyber and Infrastructure Security Centre, https://www.cisc.gov.au/resources-subsite/Documents/ncsi-guidance.pdf

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

If a critical cyber security incident has had, or is having, a significant impact on the availability of an asset, the responsible entity must notify ASD's ACSC within 12 hours of becoming aware of it. For other cyber security incidents with a relevant impact on the asset, the deadline is 72 hours after becoming aware. The CISC guidance adds that a verbal report must be followed by a written one, within 84 hours for critical incidents and 48 hours for other incidents.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), the triage step.

### Relevance to our methodology

The clock runs from awareness, not from root cause. That is why the module asks a person to make the reportability call at triage rather than after diagnosis, and why the skill escalates any security signal instead of filtering it. AI can surface signals faster, but the obligation sits with NBN and a named person.

---

## 5. Telecommunications security reforms moved into SOCI

**Source:** Telecommunications sector security, Department of Home Affairs, https://www.homeaffairs.gov.au/nat-security/Pages/telecommunications-sector-security.aspx ; Security of Critical Infrastructure (Telecommunications Security and Risk Management Program) Rules 2025, https://www.legislation.gov.au/F2025L00325

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

Schedule 5 of the ERP Act, which relates to telecommunications security, commenced on 4 April 2025, and the earlier obligations in Part 14 of the Telecommunications Act 1997 have ceased. Together with the TSRMP Rules, it moves those national security obligations into the all-hazards setting of the SOCI Act. A responsible entity for a critical telecommunications asset must keep competent supervision and effective control over the asset and maintain a written risk management program.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), and cross-cutting governance.

### Relevance to our methodology

Confirms that the Deployment module's point about SOCI risk management programs applies to carriers specifically. Our inference, not stated in the source: AI tooling that reads production systems or drafts changes to them affects how NBN supervises and controls its assets, so it belongs inside NBN's risk management program rather than being a team-level tooling choice.

---

## 6. ASD-led joint guidance: Careful adoption of agentic AI services

**Source:** Careful adoption of agentic AI services, ASD's ACSC with CISA, NSA, the Canadian Centre for Cyber Security, NCSC-NZ and NCSC-UK, published 1 May 2026, https://www.cyber.gov.au/sites/default/files/2026-05/careful_adoption_of_agentic_ai_services.pdf

**Date captured:** 2026-10-21 (read through the PDF's contents and partner summaries, not end to end)

**Reviewed by:** pending

### Key findings

The guidance focuses on LLM-based agentic AI systems and covers both threats to them and risks arising from their behaviour. The PDF says agentic AI can automate repetitive, well-defined and low-risk tasks. CISA's summary lists its recommendations as including aligning agentic AI risk management with existing cyber security frameworks, and limiting agent autonomy so agents are not given broad or unrestricted access, especially to sensitive data or critical systems.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), and cross-cutting governance.

### Relevance to our methodology

The strongest government basis for the module's boundary: no AI action against production without a person. It is written with critical infrastructure in mind and co-authored by ASD, so it carries more weight at NBN than vendor guidance. It also supports starting with read-only tasks (triage, summaries) before anything with side effects.

---

## 7. Australian AI governance: DISR Guidance for AI Adoption and DTA policy

**Source:** Guidance for AI Adoption, Department of Industry, Science and Resources, https://www.industry.gov.au/publications/guidance-for-ai-adoption ; Policy for the responsible use of AI in government v2.0, Digital Transformation Agency, https://www.digital.gov.au/ai/ai-in-government-policy

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

DISR published the Guidance for AI Adoption on 21 October 2025; it sets out six essential practices for AI governance and evolves the earlier Voluntary AI Safety Standard. Its foundations version says organisations should test and monitor their AI systems to use them safely.

The DTA policy v2.0 took effect on 15 December 2025. It applies to all non-corporate Commonwealth entities and requires accountable officials, a designated owner for each in-scope AI use case, an internal use case register, and risk assessment of every use case.

### Lifecycle stage mapping

Cross-cutting governance, applied here to operations.

### Relevance to our methodology

NBN is a government business enterprise, so our inference is that the DTA policy is not mandatory for it. We use it as a model: a named owner for each AI use case maps onto a named owner for the incident-review skill and its thresholds. The DISR guidance's emphasis on testing and monitoring AI systems supports recording AI involvement and accuracy in each incident record.

---

# AI in incident response

## 8. Microsoft: LLM root-cause and mitigation recommendations (ICSE 2023)

**Source:** Ahmed, Ghosh, Bansal, Zimmermann, Zhang, Rajmohan, "Recommending Root-Cause and Mitigation Steps for Cloud Incidents using Large Language Models", ICSE 2023, https://arxiv.org/abs/2301.03797

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

The study evaluated 44,340 incidents from 1,759 Microsoft services. Fine-tuned GPT-3 and GPT-3.5 models generated root causes and mitigation steps from the incident title and summary as written when the incident was opened. In a human evaluation, the engineers who had resolved the incidents scored the suggestions. The best models' mean correctness scores were 2.88 (root cause) and 3.16 (mitigation) out of 5. More than 70% of incident owners rated the recommendations' usefulness 3 or above. Owners also raised a direct risk: a wrong suggestion could make on-call engineers take longer to investigate. The authors also found that automatic text-similarity metrics did not reliably match human judgement.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), diagnosis.

### Relevance to our methodology

The strongest large-scale evidence for AI-proposed root causes, and the clearest statement of the risk. Suggestions are useful often enough to be worth generating and wrong often enough that they must stay hypotheses a person tests. That is why the skill must give evidence against each hypothesis, not just for it. Limits: one company, cloud services, GPT-3-era models, and a small human evaluation.

---

## 9. Microsoft: RCACopilot (EuroSys 2024)

**Source:** Chen et al., "Automatic Root Cause Analysis via Large Language Models for Cloud Incidents", EuroSys 2024, https://arxiv.org/abs/2305.15778

**Date captured:** 2026-10-21 (abstract opened directly; dataset detail from an earlier research run)

**Reviewed by:** pending

### Key findings

RCACopilot routes each incident to a handler based on its alert type, gathers the key diagnostic information, predicts a root-cause category and explains its reasoning. Evaluated on a year of real Microsoft incidents, it reached root-cause accuracy of up to 0.766. The earlier research run recorded this as micro-F1 on 653 incidents from one service. The diagnostic information collection part has been in use at Microsoft for over four years.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), triage and diagnosis.

### Relevance to our methodology

Shows the design pattern the module uses: deterministic collection of evidence first, then an LLM to classify and explain. The part in long-term production use is the evidence collection, not the LLM judgement. That fits the module's split between the monitoring tool (deterministic) and the skill (reads and reports).

---

## 10. LLM log parsing: LILAC and LUNAR

**Source:** Jiang et al., "LILAC: Log Parsing using LLMs with Adaptive Parsing Cache", FSE 2024, https://arxiv.org/abs/2310.01796 ; Huang et al., LUNAR, https://arxiv.org/abs/2406.07174

**Date captured:** 2026-10-21 (figures from an earlier research run)

**Reviewed by:** pending

### Key findings

LILAC improved template-level accuracy by 69.5% on average over earlier log parsers on public benchmark datasets. LUNAR found that parsers relying on labelled examples lose accuracy when fewer labels are available: template accuracy dropped by 33% for LogPPT and 15% for LILAC.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), triage.

### Relevance to our methodology

Supports log summarisation as a reasonable ask, but the results are on public benchmark logs, not NBN's. Accuracy depends on examples the model has seen, so the module requires every claim in a readout to cite a log line a person can check.

---

# AI in maintenance

## 11. Legacy code comprehension and migration: MITRE and Google

**Source:** Diggs et al. (MITRE), "Leveraging LLMs for Legacy Code Modernization: Challenges and Opportunities for LLM-Generated Documentation", 2024, https://arxiv.org/abs/2411.14971 ; Nikolov et al. (Google), "How is Google using AI for internal code migrations?", 2025, https://arxiv.org/abs/2504.09691

**Date captured:** 2026-10-21 (figures from an earlier research run)

**Reviewed by:** pending

### Key findings

MITRE had experts rate LLM-generated documentation for legacy MUMPS and mainframe assembly code. GPT-4 scored highly for factual accuracy on MUMPS, but usefulness ratings were lower, and automated metrics correlated poorly with expert judgement. Google reported that 74.45% of code changes across 39 internal migrations were LLM-generated; developers estimated a 50% time saving, which was self-reported, not measured.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), routine maintenance.

### Relevance to our methodology

Supports "explain this legacy component before changing it" as a useful ask, with expert review still needed. The Google time saving should not be quoted as a measured figure.

---

## 12. Dependabot security pull requests (MSR 2021)

**Source:** Alfadel, Costa, Shihab, Mkhallalati, "On the Use of Dependabot Security Pull Requests", MSR 2021, https://2021.msrconf.org/details/msr-2021-technical-papers/25/On-the-Use-of-Dependabot-Security-Pull-Requests

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

Across 2,904 JavaScript projects using Dependabot, 65.42% of security pull requests were accepted, often merged within a day. Most unmerged PRs were left for reasons related to concurrent changes to the same dependency rather than Dependabot failures, and only 3.2% of the manually examined PRs had build breakages.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), routine maintenance.

### Relevance to our methodology

Dependabot is rule-based, not AI, but it is the trigger for most routine patching on GitHub and shows automated update PRs are widely accepted and quickly merged. Quick merging is the risk the module addresses: release notes read, reachability checked, CI green, then ship through Deployment.

---

## 13. Patch correctness: overfitting in automated program repair

**Source:** Le, Thung, Lo, Le Goues, "Overfitting in semantics-based automated program repair", Empirical Software Engineering, 2018, https://doi.org/10.1007/s10664-017-9577-2 ; Petke et al., FSE 2024 Companion, https://dl.acm.org/doi/10.1145/3663529.3663776 (title to confirm; ACM blocks automated access)

**Date captured:** 2026-10-21

**Reviewed by:** pending

### Key findings

Le et al. define overfitting patches as ones that pass all existing test cases but fail to generalise beyond them, and find that overfitting occurs in semantics-based repair in various ways, as it does in heuristics-based repair. From the earlier research run: Petke et al. argue the problem may be less severe than previously thought, finding a median of two plausible patches per Defects4J bug, though one bug needed up to 61 reviewed.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), repair.

### Relevance to our methodology

The basis for "passing tests is not proof" in the module. A fix must reproduce the failure first and add a regression test that fails without it. These studies cover pre-LLM repair tools; the principle holds for AI-drafted fixes but the rates do not transfer.

---

## 14. Security of Copilot-generated code (IEEE S&P 2022)

**Source:** Pearce, Ahmad, Tan, Dolan-Gavitt, Karri, "Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions", IEEE S&P 2022, https://arxiv.org/abs/2108.09293

**Date captured:** 2026-10-21 (figures from an earlier research run)

**Reviewed by:** pending

### Key findings

Copilot generated 1,689 programs across 89 security-relevant scenarios, and about 40% were vulnerable.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), repair.

### Relevance to our methodology

AI-drafted fixes need the same code scanning as any other change. The study used an early Copilot model, so the rate is dated; the module uses it only to justify the check.

---

# Security of AI in operations

## 15. OWASP Top 10 for LLM Applications 2025

**Source:** OWASP Top 10 for LLM Applications 2025, OWASP GenAI Security Project, https://genai.owasp.org/llm-top-10/

**Date captured:** 2026-10-21 (from an earlier research run)

**Reviewed by:** pending

### Key findings

Prompt injection is ranked first (LLM01) and includes indirect injection, where instructions arrive inside content the model reads. Excessive agency (LLM06) names three causes: excessive functionality, excessive permissions and excessive autonomy.

### Lifecycle stage mapping

Maintenance & Operations (phase 6), triage and cross-cutting security.

### Relevance to our methodology

Logs and tickets contain text an attacker can control, so this phase is more exposed to indirect injection than earlier phases. That is why the skill treats all input as data, quotes any instruction it finds and escalates, and why a skill that reads production data holds no write or execute permission.

---

## Cross-referenced sources (not duplicated here)

- **DORA: Four Keys metrics** ([deployment.md](deployment.md), source #1). Defines deployment rework rate as unplanned deployments caused by a production incident, which this module uses as its own metric, alongside failed deployment recovery time and change fail rate.
- **DORA: 2025 State of AI-assisted Software Development** ([deployment.md](deployment.md), source #5). AI adoption's negative relationship with delivery stability is measured largely in this phase's outcomes.
- **GitHub Copilot: CLI automation in Actions** ([deployment.md](deployment.md), source #4). Basis for the incident-review workflow excerpt and the Agentic Workflows recommendation.
- **Google SRE: AI in SRE** ([../ai-in-sdlc/sajad.md](../ai-in-sdlc/sajad.md), source #16). The autonomy ladder and circuit-breaker control apply to incident automation as much as to rollback.
- **METR RCT** (captured in [../ai-in-sdlc/sajad.md](../ai-in-sdlc/sajad.md); Becker et al., https://arxiv.org/abs/2507.09089). 16 experienced developers took 19% longer with AI while believing they were faster. Used in the module's metrics and experience-level sections.
