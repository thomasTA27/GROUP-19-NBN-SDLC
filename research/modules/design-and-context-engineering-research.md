# Design & Context Engineering: AI in architectural decisions and agent context

**Prepared by:** William Lor
**Date captured:** 2026-09-27
**Research angle:** Sprint 2 module research supporting [white-paper/modules/design-and-context-engineering.md](../../white-paper/modules/design.md). It covers how design decisions are recorded and how that output is turned into context an agent will actually load, set against standard, non-AI design practice as a baseline.

**Where this sits on the agreed map:** Design & Context Engineering is phase 2 of six, entered from Gate 1, "Plan approved". The map marks this phase as Human-Decision, not Human-Verification, because the phase sets the standard that every later phase checks against. Every source below is read with that classification in mind.

## Contents

**Standard practice (baseline)**
1. [SWEBOK v4: Software Architecture and Software Design](#1-swebok-v4-software-architecture-and-software-design)
2. [Michael Nygard: Architecture Decision Records](#2-michael-nygard-architecture-decision-records)

**AI in design and context engineering**
3. [Empirical studies of AI context files](#3-empirical-studies-of-ai-context-files)
4. [Thoughtworks: context engineering and the limits of evaluating it](#4-thoughtworks-context-engineering-and-the-limits-of-evaluating-it)

**Cross-cutting**
5. [OWASP Top 10 for LLM Applications](#5-owasp-top-10-for-llm-applications)

**Tool documentation (GitHub Copilot)**

**Cross-referenced sources**

## Notes on the set as a whole

The set splits cleanly in two. Sources 1 and 2 describe a design practice that predates AI entirely and is unchanged by it: architecture is a set of significant decisions, and those decisions plus their rationale are the phase's real output. Sources 3 and 4 describe the new work AI adds, which is turning those decisions into context an agent will load. Nothing found suggests AI takes over the deciding. That supports the map marking this phase Human-Decision rather than Human-Verification, and the module should state that plainly rather than re-derive it.

The most important finding across the set is a negative one, and it is stated independently by both empirical papers in source 3. Rule files are written on developer intuition, and nobody has measured whether they work. Jiang and Nam put it directly: their impact on model performance remains an open question. Mohsenimofidi et al. name evaluating how content, structure and style affect agent behaviour as future work. That is the strongest available support for the module's open question, and it means the with and without comparison the module recommends is not a weaker substitute for a known method. There is no known method.

**A claim that needs correcting before publication.** The module currently attributes two findings to "the largest study of rule files": that constraint-shaped rules helped while positive instructions hurt, and that randomly generated rules helped as much as expert-written ones on generic tasks. Neither paper in source 3 reports either finding, and both state that efficacy is unmeasured. Two possibilities: a third study exists that has not been located, or the claims came from somewhere unreliable. Until it is found, both claims should be softened to positions the module holds rather than findings it reports. The module's conclusions survive this change, because source 3 supports the same guidance for different reasons.

---

# Standard practice (baseline)

## 1. SWEBOK v4: Software Architecture and Software Design

**Source:** *Guide to the Software Engineering Body of Knowledge*, Version 4.0, IEEE Computer Society, 15 October 2024 (currently v4.0a), https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4

**Date captured:** 2026-09-27

**Reviewed by:** William

### Key findings

SWEBOK v4 splits this phase across two knowledge areas. Software Architecture treats architecture as a set of significant decisions about the organisation of a software system. Software Design covers detailed design, recording rationale, and design reviews. Both take requirements as input and produce the structure that construction builds from.

The consequence for this module is that the phase's output is not a diagram or a document. It is the decision and the reasoning behind it.

### Lifecycle stage mapping

Design & Context Engineering (phase 2). The standards baseline the module's "traditional vs AI-native" section contrasts against.

### Relevance to our methodology

Supplies the reason this phase is classified Human-Decision. If architecture is a set of significant decisions, and design sets the standard that Implementation and Testing later verify against, then a wrong decision here propagates into every downstream check. There is no upstream standard to verify a design against, only judgement, which is what distinguishes a red checkpoint from a teal one.

"Standard-setting" is the module's framing, not SWEBOK's wording, and the module says so. SWEBOK supports the underlying facts; the framing built on top is ours.

Replaces ISO/IEC/IEEE 12207 as the standards anchor, which is paywalled and unavailable to the team.

---

## 2. Michael Nygard: Architecture Decision Records

**Source:** Michael Nygard, "Documenting Architecture Decisions", 15 November 2011, https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions

**Date captured:** 2026-09-27

**Reviewed by:** William

### Key findings

Proposes one short file per decision, with Title, Status, Context, Decision and Consequences. The format is deliberately lightweight, on the argument that heavyweight design documents go unread and unmaintained while the reasoning behind a system is exactly what a later team needs.

The rule that matters most for this module: an accepted ADR is never edited. A new ADR supersedes it instead, so the decision history survives rather than being overwritten.

### Lifecycle stage mapping

Design & Context Engineering (phase 2). The ADR is the phase's primary artifact, consumed by Implementation as the "why", by code review, and by future design work.

### Relevance to our methodology

Gives the phase a concrete, widely adopted artifact rather than an abstract instruction to record the decision. It also supplies the module's merge condition: an ADR is ready when it names who decided, which options were rejected and why, and what the decision costs.

The rejected options requirement is the load-bearing part. Without them a reviewer cannot tell whether a real choice was made or whether the first option was written up after the fact, which is precisely the failure mode when an AI drafts the ADR.

The module extends Nygard's format with front-matter fields naming the decider and the drafting tool. That extension is our convention, not part of the original format, and the module says so.

---

# AI in design and context engineering

## 3. Empirical studies of AI context files

**Sources:**
- Shaokang Jiang and Daye Nam (UC Irvine), "An Empirical Study of Developer-Provided Context for AI Coding Assistants in Open-Source Projects", arXiv:2512.18925, December 2025, https://arxiv.org/abs/2512.18925
- Seyedmoein Mohsenimofidi, Matthias Galster, Christoph Treude and Sebastian Baltes, "Context Engineering for AI Agents in Open-Source Software", MSR '26, arXiv:2510.21413, https://arxiv.org/abs/2510.21413

**Date captured:** 2026-09-27

**Reviewed by:** William

### Key findings

Two independent studies of the same artifact, from different angles. Jiang and Nam qualitatively analyse 401 open-source repositories containing Cursor rule files and build a taxonomy of what developers put in them. Mohsenimofidi et al. scan 10,000 mature repositories for AI context files of any format and analyse 155 `AGENTS.md` files for content, style and evolution.

**Adoption is early.** Mohsenimofidi et al. found only 466 of 10,000 repositories (5%) had adopted any context file format.

**Files are long.** Jiang and Nam found an average Cursor rule file of 462.67 lines, with the longest at 11,076 lines. Mohsenimofidi et al. found Copilot instruction files longest on average at 310 lines, `CLAUDE.md` at 287, and `AGENTS.md` most variable at 142 with a standard deviation of 231.

**A large share is copied.** Jiang and Nam found 28.7% of all lines across the dataset were exact duplicates, with the top 10 repositories over 96% duplicated. Sources included dependency documentation, similar repositories, and community template repositories.

**Copying wastes context budget.** Jiang and Nam interpret the duplication as developers being uncertain about what the agent can already see, introducing "inefficient use of the context budget, which could be better utilized for information not already available to the AI". They name context transparency as the design gap.

**More context is not better.** Jiang and Nam note that excessive context may degrade performance if it confuses the model, and that 80.55% of repositories provide a moderate number of context types, between 3 and 15, peaking at 9.

**Prohibition is a real, observed style.** Mohsenimofidi et al. identify five stylistic dimensions in convention sections: descriptive, prescriptive, prohibitive, explanatory and conditional. Their prohibitive example is "Never commit directly to the main branch".

**Files go stale.** Mohsenimofidi et al. found 77 of 155 `AGENTS.md` files (50%) had never been changed after creation, 23% changed once, and 21% between two and seven times. The most frequent change categories were adding and modifying individual instructions.

**Context files are maintained artifacts.** Mohsenimofidi et al. conclude that AI context files are versioned, reviewed, quality-assured and tested, i.e. software artifacts rather than documentation.

**Efficacy is unmeasured.** Both papers say so explicitly. Jiang and Nam: the rules observed are primarily based on developer intuition and their actual impact on model performance remains an open question. Mohsenimofidi et al.: future work needs to evaluate how content, structure and style affect agent behaviour and task performance.

### Lifecycle stage mapping

Design & Context Engineering (phase 2). Specifically the second half of the phase, where accepted decisions become instruction rules that later agent sessions load.

### Relevance to our methodology

Carries four of the module's rules of thumb, each for a reason the papers actually support:

- **Only what the agent couldn't infer from the code.** This is the module's strongest rule and now has direct backing. Jiang and Nam identify copying material the agent already has as wasted context budget.
- **Keep files short, scope with `applyTo`.** Real files are long and getting longer. An average of 462 lines against a maximum of 11,076 shows the failure mode the rule guards against is common, not hypothetical.
- **No duplicates.** 28.7% duplication across 401 repositories, with some files almost entirely copied.
- **Change rules with the decision.** Half of all `AGENTS.md` files were never touched after creation, which is the drift the module's instruction freshness metric is designed to catch.

Also supports two module positions outside the rules of thumb. "Context files are code" is Mohsenimofidi et al.'s own conclusion. And the module's open question about evaluating instruction files is confirmed independently by both papers rather than being an admission of incomplete research.

**What these papers do NOT support.** Neither reports that constraint-shaped rules outperform positive instructions, and neither reports anything about randomly generated rules. Mohsenimofidi et al. show prohibitive phrasing is a style developers use; they do not show it works better. The module's current wording attributes both findings to a study, and until that study is located the claims should be softened. Suggested replacements are in the module review notes; the module's guidance does not change, only its justification.

**Caveat on both papers.** They are descriptive studies of what developers write, not experiments on what works. Jiang and Nam studied only Cursor rules in repositories that adopted them early, and used an LLM to assist coding at scale. Mohsenimofidi et al. describe their own work as preliminary, with 155 files analysed in depth. Both are appropriate evidence for how this practice is done and inappropriate evidence for whether it succeeds.

---

## 4. Thoughtworks: context engineering and the limits of evaluating it

**Source:** Birgitta Böckeler, "Exploring Gen AI" series, martinfowler.com, https://martinfowler.com/articles/exploring-gen-ai.html ; Thoughtworks Technology Radar on context engineering

**Date captured:** 2026-09-27

**Reviewed by:** William

### Key findings

Context engineering is described as curating what the model sees in order to get a better result, distinct from prompt engineering in that it concerns the standing material loaded into every session rather than the wording of a single request.

The position the module leans on is a negative one: there are no unit tests for context engineering. A rule file cannot be verified the way code can, so the only practical check is comparing outcomes with and without it.

### Lifecycle stage mapping

Design & Context Engineering (phase 2).

### Relevance to our methodology

Supplies the module's definition of context engineering and the justification for treating it as design work rather than a tooling concern. An agent only acts on what is in its context window, so a decision that is made but never written into context does not reach the agent that implements it.

Its practical value has narrowed now that source 3 is captured. The two empirical papers make the unmeasured-efficacy point with data behind it, so this source is best used for the definition and the framing rather than as the sole basis for the testing guidance.

**Caveat:** the exact wording and location of the no-unit-tests position has not been verified directly. It is quoted in the module and should be confirmed against the source before publication, or paraphrased without quotation marks.

---

# Cross-cutting

## 5. OWASP Top 10 for LLM Applications

**Source:** OWASP Top 10 for Large Language Model Applications, OWASP GenAI Security Project, https://genai.owasp.org/llm-top-10/

**Date captured:** 2026-09-27

**Reviewed by:** William

### Key findings

Supplies the vocabulary for this phase's security touchpoints. LLM02 Sensitive Information Disclosure covers secrets and personal data reaching a model through material it loads. The excessive agency entry covers tools granted more capability than a task requires, which applies directly to third-party skills and MCP servers holding write or shell access.

### Lifecycle stage mapping

Cross-cutting, applied here to design artifacts. ADRs, specs and instruction files are committed to the repository and loaded straight into agent sessions, which makes them both a disclosure surface and a prompt-injection route.

### Relevance to our methodology

Underpins two of the module's four governance touchpoints. It is also part of the reason the module treats context files as code, placing them under `CODEOWNERS` alongside source, rather than as documentation that can be edited freely. Mohsenimofidi et al. reach the same conclusion from the artifact side, so the position rests on both a security framing and an empirical one.

The supply-chain framing of third-party skills and MCP servers follows from the excessive agency entry: adding one at design time is a dependency decision with the same review requirements as any other dependency.

---

# Tool documentation (GitHub Copilot)

Reference material for the tool the module describes. Prescriptive rather than evidential: it establishes what Copilot does, not whether using it works. Not to be cited as evidence.

**Custom instructions and instruction-file scoping**
https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
Repository-wide instructions live in `.github/copilot-instructions.md`; path-scoped instructions live in `.github/instructions/*.instructions.md` with an `applyTo` glob. **The claim the module depends on:** GitHub defines no precedence order between instruction files and its own guidance is to avoid conflicting instructions. That is what makes check (e) in the verification checklist load-bearing rather than tidy-up work, because when two rules disagree the agent's behaviour is not predictable.

**Plan mode and context inspection**
https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli
On the CLI, `/plan` produces a plan without changing files, and `/context` shows what is currently loaded. The module uses the first to keep steps 1 and 2 read-only, and the second to confirm a new rule actually loads for files its `applyTo` pattern matches. Both are CLI features. In VS Code the equivalent is running the same prompts in Ask mode, which does not write files.

**AGENTS.md support**
https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/
Copilot coding agent supports the tool-agnostic `AGENTS.md` convention alongside its own format. Relevant because source 3's second paper studies `AGENTS.md` files specifically, so its findings apply to Copilot users and not only to Codex or Claude Code.

---

# Cross-referenced sources (not duplicated here)

Three sources captured in full elsewhere are cited by this module and should be referenced from their original capture rather than re-captured:

- **METR randomised controlled trial** (see [research/modules/implementation.md](implementation.md)). The finding that experienced developers misjudge their own AI-assisted throughput is the basis for the rubber-stamp risk in this module's senior guidance.
- **Linux kernel AI coding assistants policy and the Developer Certificate of Origin** (see [white-paper/governance/research.md](../../white-paper/governance/research.md)). Supplies the `Assisted-by:` and `Signed-off-by:` conventions this module applies to ADRs and context-file commits.
- **CODEOWNERS and named-approver structures** (see [white-paper/governance/research.md](../../white-paper/governance/research.md)). This module applies the pattern to two specific path groups, design artifacts and every agent-context path, rather than defining it.
