# Design & Context Engineering: AI in architectural decisions and agent context

**Prepared by:** William Lor
**Date captured:** 2026-09-27
**Updated:** 2026-10-23 by William Lor, to match the revised module
**Updated:** 2026-10-25 by William Lor, to align with the revised Planning module (see the update at the end)
**Research angle:** Sprint 2 module research supporting [white-paper/modules/design-and-context-engineering.md](../../white-paper/modules/design-and-context-engineering.md). It covers how design decisions are recorded and how that output is turned into context an agent will actually load, set against standard, non-AI design practice as a baseline.

**Where this sits on the agreed map:** Design & Context Engineering is phase 2 of six, entered from Gate 1, "Plan approved". The map marks this phase as Human-Decision, not Human-Verification, because the phase sets the standard that every later phase checks against. Every source below is read with that classification in mind.

## Contents

**Standard practice (baseline)**
1. [SWEBOK v4: Software Architecture and Software Design](#1-swebok-v4-software-architecture-and-software-design)
2. [Michael Nygard: Architecture Decision Records](#2-michael-nygard-architecture-decision-records)

**AI in design and context engineering**
3. [Empirical research on context files and context adaptation](#3-empirical-research-on-context-files-and-context-adaptation)
4. [Zhang et al.: Guardrails Beat Guidance](#4-zhang-et-al-guardrails-beat-guidance)
5. [Thoughtworks: context engineering and the limits of evaluating it](#5-thoughtworks-context-engineering-and-the-limits-of-evaluating-it)

**Cross-cutting**
6. [OWASP Top 10 for LLM Applications](#6-owasp-top-10-for-llm-applications)

**Tool documentation (GitHub Copilot and Claude Code)**

**Positions in the module that are our construction**

**Cross-referenced sources**

## Notes on the set as a whole

The set splits cleanly in two. Sources 1 and 2 describe a design practice that predates AI entirely and is unchanged by it: architecture is a set of significant decisions, and those decisions plus their rationale are the phase's real output. Sources 3 to 5 describe the new work AI adds, which is turning those decisions into context an agent will load. Nothing found suggests AI takes over the deciding. That supports the map marking this phase Human-Decision rather than Human-Verification, and the module states that plainly rather than re-deriving it.

The most important finding across the set is a negative one, and it is stated independently by both descriptive papers in source 3. Rule files are written on developer intuition, and nobody has measured whether they work for a project's own decisions. Jiang and Nam put it directly: their impact on model performance remains an open question. Mohsenimofidi et al. name evaluating how content, structure and style affect agent behaviour as future work. Source 4 measures rule files on a generic bug-fixing benchmark, and its experiments exclude project-specific rules, so it does not test whether an agent follows a project's own decisions either. This is the strongest available support for the module's open question, and it means the with and without comparison the module recommends is not a weaker substitute for a known method. There is no known method for this use.

**Resolved: the unsourced claim flagged in the earlier capture.** The earlier version of this file noted that the module attributed two findings to "the largest study of rule files": that constraint-shaped rules helped while positive instructions hurt, and that randomly generated rules helped as much as expert-written ones on generic tasks. Neither paper in source 3 reports either finding. The study has since been located: it is source 4, a different paper from the ACE paper in source 3, although both have a first author named Zhang. Separately, the module no longer relies on either finding. It now justifies "lead with never" on reviewability alone, and no longer mentions random rules. Source 4 is held here as supporting evidence the module could cite.

---

# Standard practice (baseline)

## 1. SWEBOK v4: Software Architecture and Software Design

**Source:** *Guide to the Software Engineering Body of Knowledge*, Version 4.0, IEEE Computer Society, 15 October 2024 (currently v4.0a), https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4

**Date captured:** 2026-09-27

**Reviewed by:** William Lor

### Key findings

SWEBOK v4 splits this phase across two knowledge areas. Software Architecture treats architecture as a set of significant decisions about the organisation of a software system. Software Design covers detailed design, recording rationale, and design reviews. Both take requirements as input and produce the structure that construction builds from.

The consequence for this module is that the phase's output is not a diagram or a document. It is the decision and the reasoning behind it.

### Lifecycle stage mapping

Design & Context Engineering (phase 2). The standards baseline the module's "traditional vs AI-native" section contrasts against.

### Relevance to our methodology

Supplies the reason this phase is classified Human-Decision. If architecture is a set of significant decisions, and design sets the standard that Implementation and Testing later verify against, then a wrong decision here propagates into every downstream check. There is no upstream standard to verify a design against, only judgement, which is what distinguishes a red checkpoint from a teal one.

The module's sentence "every later phase checks its work against these decisions" is our framing built on SWEBOK, not SWEBOK's wording. The module no longer uses the term "standard-setting" in that section, so it no longer carries a separate disclaimer; the framing is recorded here instead.

Replaces ISO/IEC/IEEE 12207 as the standards anchor, which is paywalled and unavailable to the team.

---

## 2. Michael Nygard: Architecture Decision Records

**Source:** Michael Nygard, "Documenting Architecture Decisions", 15 November 2011, https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions

**Date captured:** 2026-09-27

**Reviewed by:** William Lor

### Key findings

Proposes one short file per decision, with Title, Status, Context, Decision and Consequences. The format is deliberately lightweight, on the argument that heavyweight design documents go unread and unmaintained while the reasoning behind a system is exactly what a later team needs.

The rule that matters most for this module: an accepted ADR is not rewritten. A new ADR supersedes it instead, and the old one's status is changed to Superseded, so the decision history survives rather than being overwritten.

### Lifecycle stage mapping

Design & Context Engineering (phase 2). The ADR is the phase's primary artifact, consumed by Implementation as the "why", by code review, and by future design work.

### Relevance to our methodology

Gives the phase a concrete, widely adopted artifact rather than an abstract instruction to record the decision. The module now ships a full ADR template in step 4 and states when an ADR can be Accepted: it names the human who decided, gives the rejected options and the cost, has no unverified claims left, and has had any security review it needs.

The rejected options requirement is the load-bearing part. Without them a reviewer cannot tell whether a real choice was made or whether the first option was written up after the fact, which is precisely the failure mode when an AI drafts the ADR.

The module's template extends Nygard's format. These additions are our convention, not part of the original format:
- a Rationale section, where the rejected options are recorded. The module's description of Nygard's format no longer lists rejected options, since they aren't part of it
- front matter: `Decided-by`, `Drafted-with`, `Supersedes` and `Security review`
- a "Not yet verified" section that must be empty before acceptance

The module says the front-matter fields are our convention.

---

# AI in design and context engineering

## 3. Empirical research on context files and context adaptation

**Sources:**
- Shaokang Jiang and Daye Nam (UC Irvine), "An Empirical Study of Developer-Provided Context for AI Coding Assistants in Open-Source Projects", arXiv:2512.18925, December 2025, https://arxiv.org/abs/2512.18925
- Seyedmoein Mohsenimofidi, Matthias Galster, Christoph Treude and Sebastian Baltes, "Context Engineering for AI Agents in Open-Source Software", MSR '26, arXiv:2510.21413, https://arxiv.org/abs/2510.21413
- Qizheng Zhang, Changran Hu et al. (Stanford, SambaNova, UC Berkeley), "Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models", ICLR 2026, https://ace-agent.github.io

**Date captured:** 2026-09-27

**Reviewed by:** William Lor

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

**Efficacy is unmeasured.** Both descriptive papers say so explicitly. Jiang and Nam: the rules observed are primarily based on developer intuition and their actual impact on model performance remains an open question. Mohsenimofidi et al.: future work needs to evaluate how content, structure and style affect agent behaviour and task performance.

### The ACE paper: evidence pointing the other way

Zhang et al. (ACE) is a different kind of source from the other two. It is an intervention study with measured outcomes rather than a description of what developers write, and it is peer-reviewed at ICLR. It matters here because it argues against the "shorter is better" intuition. Not to be confused with source 4, a separate paper whose first author is also named Zhang.

**Brevity bias is named as a failure mode.** The paper documents context optimisation collapsing toward short generic instructions that omit domain-specific heuristics, tool-use guidelines and common failure modes. Its position is that contexts should be comprehensive structured playbooks rather than concise summaries, on the argument that LLMs, unlike humans, are more effective given long detailed contexts and can distil relevance at inference time.

**Short files do not automatically cost less.** ACE reports 91.8% of input tokens served from cache during evaluation, reducing billed input-token cost by 82.6% relative to counting raw context tokens. The paper's claim is that longer context does not translate linearly into higher serving cost under modern KV-cache reuse.

**Context collapse.** Monolithic rewriting of an accumulated context erodes detail over time. Their case study records a context dropping from 18,282 tokens to 122 in a single step, with accuracy falling from 66.7 to 57.1, below the 63.7 baseline without adaptation. Their answer is incremental delta updates rather than full rewrites.

**Its own stated limits.** The paper concedes that not all applications need rich contexts, that some tasks benefit more from concise high-level instructions, and that its approach is most useful where detailed domain knowledge or complex tool use is required.

**Why this does not simply overturn the module's guidance.** ACE studies automatically generated and maintained agent playbooks, not human-authored repository rule files reviewed in a pull request. Different artifact, different author, different maintenance cost. The module's rules exist partly so a human reviewer can check a diff against them, which is not a constraint ACE operates under.

### Lifecycle stage mapping

Design & Context Engineering (phase 2). Specifically step 4, where accepted decisions become rules that later agent sessions load.

### Relevance to our methodology

Carries four of the module's rules of thumb, each for a reason the papers actually support:

- **Only what the agent can't infer from the code.** This is the module's strongest rule and has direct backing. Jiang and Nam identify copying material the agent already has as wasted context budget.
- **Keep files short enough to review in one read.** Real files are long and getting longer; an average of 462 lines against a maximum of 11,076 shows the failure mode is common. The module now justifies short files on reviewability only, as this file recommended, because ACE's caching finding undercuts the cost argument.
- **No duplicates or contradictions.** 28.7% duplication across 401 repositories, with some files almost entirely copied.
- **Change rules in the same PR as the ADR they come from.** Half of all `AGENTS.md` files were never touched after creation. This is the drift the module's instruction freshness metric is designed to catch.

Also supports two module positions outside the rules of thumb. "Context files are code" is Mohsenimofidi et al.'s own conclusion and is now a key takeaway. And the module's open question about evaluating instruction files is confirmed independently by all three papers rather than being an admission of incomplete research.

**The genuine conflict, held here rather than in the module.** Jiang and Nam note that excessive context may degrade performance if it confuses the model. ACE argues the opposite for its setting. Both are credible, and they were measured on different artifacts. The module no longer states this conflict directly; the metrics section was cut back for length. The conflict is still the reason the module tells teams to measure locally, through the with and without comparison after Implementation, rather than adopting a rule of thumb about context size. The key takeaway "write only rules the agent can't guess" does not pick a side on context size.

**What these papers do NOT support.** Neither reports that constraint-shaped rules outperform positive instructions, and neither reports anything about randomly generated rules. Mohsenimofidi et al. show prohibitive phrasing is a style developers use; they do not show it works better. Source 4 is the paper that reports both findings.

**Caveat on the two descriptive papers.** They are descriptive studies of what developers write, not experiments on what works. Jiang and Nam studied only Cursor rules in repositories that adopted them early, and used an LLM to assist coding at scale. Mohsenimofidi et al. describe their own work as preliminary, with 155 files analysed in depth. Both are appropriate evidence for how this practice is done and inappropriate evidence for whether it succeeds.

---

## 4. Zhang et al.: Guardrails Beat Guidance

**Source:** Xing Zhang, Guanghui Wang, Yanwei Cui, Wei Qiu, Ziyuan Li, Bing Zhu and Peiyang He, "Guardrails Beat Guidance: A Large-Scale Study of Rules, Skills, and Persistent Configuration for Coding Agents", arXiv:2604.11088 (v1 13 April 2026; v2 28 May 2026), https://arxiv.org/abs/2604.11088

**Date captured:** 2026-10-23

**Reviewed by:** William, 2026-10-23 (full text, v2).

**Source type:** Industry research preprint, not peer-reviewed. The authors are from the AWS Generative AI Innovation Center and HSBC Technology Center; the agent studied (Claude Code) ran on AWS Bedrock. Not a vendor describing its own product, but not independent academic research either.

### Key findings

**Method.**
- **Corpus:** 679 rule files from GitHub: 486 `CLAUDE.md` files and 193 `.cursorrules` files. These yielded 42,199 rules, filtered to 25,532.
- **Taxonomy:** the authors' LLM classifier (87% agreement with human labels) found 64.9% of rules were project-specific.
- **Experiments:** four experiments, 3,544 runs, plus 1,500 screening runs, at about US$2,000 in API cost.
- **Setup:** Claude Code with Claude Opus 4.6 on SWE-bench Verified (Python bug fixes), using 58 "discriminative" tasks with a 30–70% baseline pass rate (35 tasks for experiment 4).
- **The experiments excluded project-specific rules** and used only the five "transferable" categories: process, style, architecture, behaviour and safety.

**Rules help; their content matters less than their presence (experiment 1).**
- **Gains:** all seven rule conditions beat the no-rule baseline (50.0%) by 6.9–13.8 percentage points. Random and curated rules tied at 63.8%.
- **Significance:** no condition differed significantly from any other (Cochran's Q p = 0.697), and no single comparison with the baseline reached p < 0.05. The headline rests on direction: all seven improved, sign test p = 0.008.
- **Interpretation:** the authors read this as "context priming".

**Polarity (experiment 4a).**
- **Method:** each of 18 hand-written rules was removed in turn from the full set, across 35 tasks.
- **Classification:** 3 rules were "shaping" (removal hurt) and all were "do not" constraints. 4 were "distorting" (removal helped) and all were "do" directives. 11 were inert.
- **Significance:** Fisher's exact p = 0.029. Only one rule, "do not refactor unrelated code", was individually significant (p = 0.016), and that would not survive correction for multiple comparisons.
- **Robustness:** the split holds at 3 and 5 percentage-point thresholds, weakens at 7 (p = 0.067), dissolves at 10 (p = 0.25), and a threshold-free test gives p ≈ 0.13.
- **The authors' own framing:** "suggestive evidence motivating cross-agent replication rather than a strong individual-paper claim".

**Rule count (experiment 2).** Pass rates stayed in a 59–67% band from 0 to 50 rules, with no significant difference (p = 0.227). The authors conclude developers "need not aggressively prune their rule files".

**Rule type (experiment 3).** Tool and process rules scored highest (63.8%) and architecture rules lowest (53.4%). The difference was not significant; the authors call it directional.

**Authors' guidance and expectations.**
- **Box 1:** prefer "do not" over "do"; audit positive directives; "presence beats phrasing"; up to 50 rules showed no degradation; don't rely on evaluating rules one at a time, because ensemble effects dominate.
- **Discussion:** they tentatively expect project-specific "what not to do" rules to keep their value as models improve, because those rules encode organisational priorities "the model has no way to know". This is stated as an expectation, not tested; their experiments excluded project-specific rules.

**Stated limits.** Single agent, single model, single benchmark, Python bug fixes only. Weaker models may behave differently. Benchmarks that reward minimal patches may favour "do not refactor"-style rules more than other work would.

### Lifecycle stage mapping

Design & Context Engineering (phase 2), step 4, where rules are written.

### Relevance to our methodology

**Corrections to the earlier capture of this source**, which was made from the abstract only:
- The corpus is `CLAUDE.md` and `.cursorrules` files only. Skills, plugins and personas are the "broader family" the authors expect the findings to apply to in principle; they were not in the corpus.
- "Every individually beneficial rule was a constraint" refers to 3 rules out of a hand-written set of 18, not to the 25,532-rule corpus.
- The polarity finding is suggestive, by the authors' own account, and depends on the threshold chosen.
- The +13.8 point gain is not individually significant. It is the direction across seven conditions that is.

**Where it supports the module.**
- **"Lead with never."** The polarity result is the only measured support for this rule, but it is weak: 7 rules, one benchmark, threshold-dependent. If cited, cite it as suggestive alongside the module's reviewability reason, not instead of it.
- **"Only what the agent can't infer from the code."** The authors' expectation that project-specific constraints keep their value because the model can't know them matches the module's main rule. It is their hypothesis, not a result.
- **Justifying short files on reviewability, not accuracy.** No degradation up to 50 rules means accuracy is not a reason to keep files short.

**Where it is in tension with the module.**
- **"Presence beats phrasing."** The module's fresh-session probe asks teams to reword a rule the agent misreads. The paper measured pass rates on generic bug fixes with generic rules, not whether an agent followed a specific project decision. Its experiments excluded project-specific rules, so it doesn't test the case the probe covers. This strengthens the module's inference that the benchmark result doesn't settle the question for project rules.
- **"Don't rely on single-rule evaluation."** The module's with and without comparison tests one rule at a time. The two measure different things: the paper looked at pass rates, the module checks whether a specific decision is followed. A team should still expect a rule's effect to change once it sits among others.
- **"Need not aggressively prune."** The module says to keep files short enough to review. That is a reviewability position the paper doesn't address, not an accuracy claim, so there is no direct conflict. But the module should not imply long files hurt performance.

**Caveats.** Industry-authored preprint, not peer-reviewed. One model, one agent, one benchmark of Python bug fixes. Experiments excluded the project-specific rules that make up most real rule files and all of the module's rules. Results may not transfer to Copilot.

---

## 5. Thoughtworks: context engineering and the limits of evaluating it

**Source:** Birgitta Böckeler, "Exploring Gen AI" series, martinfowler.com, https://martinfowler.com/articles/exploring-gen-ai.html ; Thoughtworks Technology Radar on context engineering

**Date captured:** 2026-09-27

**Reviewed by:** William Lor

### Key findings

Context engineering is described as curating what the model sees in order to get a better result, distinct from prompt engineering in that it concerns the standing material loaded into every session rather than the wording of a single request.

The position the module leans on is a negative one: there are no unit tests for context engineering. A rule file cannot be verified the way code can, so the only practical check is comparing outcomes with and without it.

### Lifecycle stage mapping

Design & Context Engineering (phase 2).

### Relevance to our methodology

Supplies the module's definition of context engineering and the justification for treating it as design work rather than a tooling concern. An agent only acts on what is in its context window, so a decision that is made but never written into context does not reach the agent that implements it.

Its practical value has narrowed now that sources 3 and 4 are captured. The empirical papers make the unmeasured-efficacy point with data behind it, so this source is best used for the definition and the framing rather than as the sole basis for the testing guidance.

**Caveat:** the exact wording and location of the no-unit-tests position has not been verified directly. Because the location couldn't be confirmed, the module now states the point without attributing it ("There are no unit tests for context engineering"). This source still supplies the definition of context engineering, which the module attributes to Thoughtworks. If the location is confirmed, the attribution can be restored.

---

# Cross-cutting

## 6. OWASP Top 10 for LLM Applications

**Source:** OWASP Top 10 for Large Language Model Applications, OWASP GenAI Security Project, https://genai.owasp.org/llm-top-10/

**Date captured:** 2026-09-27

**Reviewed by:** William Lor

### Key findings

Supplies the vocabulary for this phase's security touchpoints. LLM02 Sensitive Information Disclosure covers secrets and personal data reaching a model through material it loads. The excessive agency entry covers tools granted more capability than a task requires, which applies directly to third-party skills and MCP servers holding write or shell access.

### Lifecycle stage mapping

Cross-cutting, applied here to design artifacts. ADRs, specs and context files are committed to the repository and loaded straight into agent sessions, which makes them both a disclosure surface and a prompt-injection route.

### Relevance to our methodology

Underpins the module's governance touchpoints on context files, third-party dependencies and secrets. It is also part of the reason the module treats context files as code, placing them under `CODEOWNERS` alongside source, rather than as documentation that can be edited freely. Mohsenimofidi et al. reach the same conclusion from the artifact side, so the position rests on both a security framing and an empirical one.

The module now defines "context files" broadly: instruction and rule files, skills, custom agents and subagents, prompt files and commands, and any doc these tell the agent to read. All of these load into the model's context, so the injection and disclosure risks apply to all of them, not only to instruction files.

The supply-chain framing of third-party skills and MCP servers follows from the excessive agency entry: adding one at design time is a dependency decision with the same review requirements as any other dependency.

---

# Tool documentation (GitHub Copilot and Claude Code)

Reference material for the tools the module describes. Prescriptive rather than evidential: it establishes what the tools do, not whether using them works. Not to be cited as evidence. The module is now tool-neutral, so both tools are listed.

**Copilot: custom instructions and instruction-file scoping**
https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
Repository-wide instructions live in `.github/copilot-instructions.md`; path-scoped instructions live in `.github/instructions/*.instructions.md` with an `applyTo` glob. **Checked 2026-10-23** against the Copilot CLI page (https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions): several patterns go in one quoted, comma-separated string, for example `applyTo: "**/*.ts,**/*.tsx"`, which is the form the module's example uses. The same page says Copilot CLI "does not define a general precedence order between these files" and advises "Avoid conflicting instructions". It confirms `@path` references inside `copilot-instructions.md`, `AGENTS.md` and `CLAUDE.md`, but not in `*.instructions.md` files or prompts. **The claim the module depends on:** GitHub defines no precedence order between instruction files and its own guidance is to avoid conflicting instructions. That is what makes the rule conflict check and checklist (e) necessary rather than tidy-up work, because when two rules disagree the agent's behaviour is not predictable. The module now says "neither tool reliably decides which rule wins"; Claude Code's own precedence behaviour has not been checked, so the module deliberately makes no stronger claim about it.

**Copilot: plan mode and context inspection**
https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli
Plan mode exists in both Copilot surfaces: VS Code has a built-in Plan agent, and the CLI has `/plan`. Both produce a plan without changing files. On the CLI, `/context` shows what is currently loaded. The module defines "read-only" as plan mode or Ask mode, which holds for both surfaces. **Resolved:** the earlier capture recorded plan mode as CLI-only; that was wrong, and the team has confirmed VS Code's Plan agent. The Implementation module still says plan mode is a CLI feature with no VS Code equivalent, so it needs the same correction. The module no longer mentions the VS Code context indicator, because it hadn't been checked; it tells users whose tool doesn't list individual files to rely on the fresh-session probe.

**Copilot: prompt files**
https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file
Reusable prompts live in `.github/prompts/*.prompt.md`. They work in Copilot in VS Code but not Copilot CLI, which is why the module's "In practice" section points CLI users to skills instead.

**Copilot: AGENTS.md support**
https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/
Copilot coding agent supports the tool-agnostic `AGENTS.md` convention alongside its own format. Relevant because source 3's second paper studies `AGENTS.md` files specifically, so its findings apply to Copilot users and not only to Codex or Claude Code.

**Claude Code: memory, rules, skills and subagents**
- Memory and `CLAUDE.md`, including path-scoped rules in `.claude/rules/`: https://code.claude.com/docs/en/memory
- Skills: https://code.claude.com/docs/en/skills
- Subagents: https://code.claude.com/docs/en/sub-agents

These back the Claude Code equivalents the module gives: `CLAUDE.md`, `.claude/rules/*.md` scoped with `paths:`, skills, and subagents for the read-only design reviewer. **Checked 2026-10-23** against the memory documentation: `paths:` is a YAML list of quoted globs, as the module now shows. Rules without `paths` load at launch and apply to all files. A path-scoped rule loads when Claude reads, writes or edits a matching file. `/context` lists loaded files under "Memory files", which is the check the module gives.

---

# Positions in the module that are our construction

These are the methodology's own proposals, not findings from the sources above. They come from the team's testing of the module (see the Design evidence file in `white-paper/evidence/`; confirm the path). The module states them as guidance without citing that testing. A reviewer should treat each as a position to be tested, not as established practice.

- **The four-step workflow.** Read the spec, sort by hand, decide, record. The module labels it the methodology's proposal. No independent source describes an AI-assisted design workflow; the spec-driven tools that include a design step are vendor products.
- **Planning says what, Design says how.** The team's phase boundary. Conventions answer most "how" questions, so an ADR is needed only where none does or the spec departs from one.
- **The consistency check runs before sorting,** so every spec problem reaches the Gate 1 approver before any decision is made.
- **Five sort outcomes.** Follows convention, decided in Planning, ADR, spec change request, context fix. Sorting is done by hand.
- **Writing your own view first.** `my-view.md` is written before the options prompt and kept out of it, so the options can't be shaped by the reader's view and the reader can't skip forming one unnoticed.
- **Recording who decided, by attestation.** If an AI made or confirmed a decision, `Decided-by` stays empty and the ADR can't be Accepted. No process can prove who made a decision, so the module doesn't claim delegation can be prevented. Instead, filling in `Decided-by` is a certification, modelled on `Signed-off-by` and the DCO, and checklist (a) checks only what a reviewer can see: a named decider, their reason and the held, changed or missing line in `decisions.md`, and an entry in `my-view.md`. The instruction to write the view before seeing the options stays in step 3, but a reviewer can't confirm the timing, so the checklist doesn't ask them to. The "defend every decision without deferring to the AI" test stays as the exit condition, a standard rather than a checkable item.
- **The "Not yet verified" gate.** Every library, API or platform claim in an ADR is checked against official docs before the ADR can be Accepted.
- **The `Security review` field.** Makes governance touchpoint (iv) part of the acceptance conditions.
- **The spec change request format and independent approver.** The Gate 1 approver answers, not the person running Design.
- **Fixing an existing context file** as a Design task, unless `CODEOWNERS` gives the file to another team.
- **Scoping a rule to every file where it could be broken,** not just the feature folder.
- **The fresh-session probe** before merging, and the with and without comparison after Implementation. The comparison needs feature code to change, so it can't run in Design. It is optional, tracked as an issue assigned to the ADR's decider, and the "without" run uses a branch with the rule file removed.
- **Doc entries are listed in Design and written in Implementation,** so a document never describes something not yet built. The Implementation module needs a matching checklist line.
- **The new-project setup card,** which creates the first context files before the first feature reaches Planning.
- **Starting each step in a new session, and the cost metric by account type.** API billing gives a dollar figure; subscription plans give only token counts. The module labels the cost metric "(our metric)".
- **The design review PR process.** Deciders set Status to Accepted as the PR's last change before approval; the PR doesn't merge while a spec change request affecting an ADR is unanswered.
- **Deliberate departures.** A rule that departs from a context doc on purpose, as an ADR records, is not treated as a conflict to fix in Design; the doc is updated through the doc entry list in Implementation.
- **Juniors as deciders.** Whether a junior may be the named decider is left to the organisation.
- **The metrics marked "our metric"**: decision traceability, design-attributable rework and instruction freshness.

---

# Cross-referenced sources (not duplicated here)

Three sources captured in full elsewhere are cited by this module and should be referenced from their original capture rather than re-captured:

- **METR randomised controlled trial** (see [research/modules/implementation.md](implementation.md)). The finding that experienced developers misjudge their own AI-assisted speed is cited in this module's senior guidance. The module labels the extension from speed to review quality as its own expectation, not METR's finding.
- **Linux kernel AI coding assistants policy and the Developer Certificate of Origin** (see [white-paper/governance/research.md](../../white-paper/governance/research.md)). Supplies the `Assisted-by:` and `Signed-off-by:` conventions this module applies to ADRs and context-file commits.
- **CODEOWNERS and named-approver structures** (see [white-paper/governance/research.md](../../white-paper/governance/research.md)). This module applies the pattern to `docs/adr/`, `docs/design/` and every context file, as the module defines them, rather than defining it.

---

# Update, 2026-10-25 (William Lor): aligning the module with the revised Planning module

The Planning module was revised after usability testing, and these changes bring Design in line with it. Entries above that this update supersedes are listed first. They are left as written, for the record.

## Superseded entries above

- **"The consistency check runs before sorting, so every spec problem reaches the Gate 1 approver"** (Positions). Spec problems now go back to the spec author in Planning. The check still runs before sorting.
- **"The spec change request format and independent approver. The Gate 1 approver answers, not the person running Design."** (Positions). The spec author now takes each request to the decision owner, who answers it. The person running Design never answers their own request. If the answer adds or changes a criterion, constraint, scope item or assumption, the spec goes back through Gate 1. Otherwise the Gate 1 approver confirms that nothing changed in substance.
- **"Starting each step in a new session"** (Positions) gave cost as the only reason. The module now gives reliability as a second reason, citing the multi-turn finding below.
- **"Juniors as deciders. Whether a junior may be the named decider is left to the organisation."** (Positions). The module now sets a default: until the organisation says juniors may decide, a junior drafts ADR items and a senior or architect decides them. Step 3 needs a named decider before it starts.

## What changed in the module and why

- **Step 1 reads Planning's Design handoff items first** (H1, H2 …), then the recorded decisions and numbered assumptions. Planning now hands Design an explicit list of "how" questions, each with any binding rule that limits it, and Design previously never asked for it. A handoff's "Limited by" rule is cited in `step2-sort.md`, and in the ADR's Context if the item becomes an ADR.
- **"Product decisions" became "recorded decisions".** Planning's decisions are question answers with a named decider, and they can be about project rules as well as the product. The Decided in Planning outcome now cites the decision's question ID.
- **The spec lives where Planning saves it,** `docs/specs/<feature>/spec.md`. The module previously had Jira specs pasted into `docs/design/<feature>/spec.md`, which made a second copy in a different folder.
- **Design records the spec version it used,** in step 1's inputs and in the ADR's Context. Planning now versions the spec and returns it to Draft while a spec change request is open, so an ADR needs to show which approved version it was built against.
- **The spec change request flow** now matches Planning, as in the superseded entry above. The template's Answer line reads "decision owner's answer". Items a request doesn't affect carry on from the last approved version.
- **Quality outcomes belong to Planning.** Under Larger features, where the spec states a quality outcome, Design decides only the mechanism, and a missing outcome is a spec change request. Planning keeps performance, ordering, messages, privacy and retention outcomes in the spec, so without this line both modules claimed them.
- **"What this stage does not cover"** no longer mentions "the assumptions table", which Planning no longer has.
- **The read-only design reviewer gets a caution.** It may share the drafting model's blind spots, so a clean critique doesn't prove the ADR is sound.

## Sources behind the new wording

Both are captured in full in [research/modules/planning-and-spec-authoring.md](planning-and-spec-authoring.md), in its update of 2026-10-25, and are not duplicated here.

- **Laban et al. (2025), "LLMs Get Lost In Multi-Turn Conversation", ICLR 2026.** Supports "models do worse when a task's details arrive over several turns". The paper revealed underspecified instructions turn by turn and didn't test design work, so applying it to one session per Design step is our extension.
- **Panickssery et al. (2024), "LLM Evaluators Recognize and Favor Their Own Generations", NeurIPS 2024.** Related to the reviewer caution. It found models rate their own outputs higher, but only tested news summaries. The module's wording, "may share the drafting model's blind spots", is our hedge, and it applies most when the reviewer runs the same model as the drafter.

## Positions added that are our construction

- Citing a Design handoff item's "Limited by" rule in the sort and the ADR
- Recording the spec version in the ADR's Context
- The boundary that Planning sets quality outcomes and Design decides the mechanism
- Items an open spec change request doesn't affect carrying on from the last approved version
- Finding the approved spec by its approved git tag, which Planning creates on approval
- A Context fix covers a context file that will be wrong once the feature is built, citing the ADR or criterion that makes it wrong, and an ambiguous convention is sorted as an ADR item
- Step 3 attaches the spec and the context files and docs the item cites, and the pasted item carries its spec sections, the conventions quoted in `step1-questions.md` and any Limited by rule
- Unverified claims are checked against docs for the version the project uses. A false claim behind the chosen option returns the item to its decider, and a rejected option stays if its rejection still stands
- Feature rule files take the feature's name and are scoped with `applyTo` or `paths:` to each folder the feature changes
- Deleting any recommendation the AI adds before the decider reads the options
- Doc entries are kept only when the quoted convention really requires a record
- Waiting for the spec's new approved tag when a spec change request's answer changes the spec, before the design review PR merges