# Research captures: AI-assisted software engineering lifecycle

**Prepared By:** Sajad Ali Akbari  
**Date captured:** 2026-09-05  
**Research angle:** What developers actually do at each lifecycle stage when using AI, as distinct from what the tools are capable of.

Lifecycle stage mapping is deliberately left general in every capture, since the team has not yet agreed the stage names. Revisit that field once the lifecycle map is finalised.

## Contents

**Productivity evidence (contested)**

1. [METR: Measuring the Impact of Early-2025 AI on Experienced Developer Productivity](#1-metr-measuring-the-impact-of-early-2025-ai-on-experienced-developer-productivity)
2. [Peng et al.: The Impact of AI on Developer Productivity, Evidence from GitHub Copilot](#2-peng-et-al-the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot)
3. [Paradis et al. (Google): How Much Does AI Impact Development Speed?](#3-paradis-et-al-google-how-much-does-ai-impact-development-speed)
4. [Google and DORA: Accelerate State of DevOps Report 2024](#4-google-and-dora-accelerate-state-of-devops-report-2024)
5. [Stack Overflow: 2025 Developer Survey, AI section](#5-stack-overflow-2025-developer-survey-ai-section)
6. [Atlassian: State of Developer Experience Report 2025](#6-atlassian-state-of-developer-experience-report-2025)

**Security evidence**

7. [Veracode: 2025 GenAI Code Security Report](#7-veracode-2025-genai-code-security-report)
8. [Perry et al.: Do Users Write More Insecure Code with AI Assistants?](#8-perry-et-al-do-users-write-more-insecure-code-with-ai-assistants)
9. [Pearce et al.: Asleep at the Keyboard?](#9-pearce-et-al-asleep-at-the-keyboard)

**Workflow and practice accounts**

10. [Anthropic: Claude Code Best Practices for Agentic Coding](#10-anthropic-claude-code-best-practices-for-agentic-coding)
11. [Anthropic: How Anthropic Teams Use Claude Code](#11-anthropic-how-anthropic-teams-use-claude-code)
12. [ETH Zurich and LogicStar.ai: Evaluating AGENTS.md](#12-eth-zurich-and-logicstarai-evaluating-agentsmd)
13. [Microsoft: Spec-Driven Development, AI-Native Engineering](#13-microsoft-spec-driven-development-ai-native-engineering)

**Review and verification practice**

14. [Codacy: AI Is Breaking Code Review](#14-codacy-ai-is-breaking-code-review)
15. [GitHub: Turning One Giant AI-Generated Pull Request Into a Reviewable Stack](#15-github-turning-one-giant-ai-generated-pull-request-into-a-reviewable-stack)

**Operations practice**

16. [Google SRE: AI in SRE, Engineering Reliable Operations](#16-google-sre-ai-in-sre-engineering-reliable-operations)
17. [Meta: Leveraging AI for Efficient Incident Response](#17-meta-leveraging-ai-for-efficient-incident-response)

**Governance**

18. [Attribution: the Co-Authored-By trailer convention](#18-attribution-the-co-authored-by-trailer-convention)
19. [Finout: Token Economics and TokenOps](#19-finout-token-economics-and-tokenops)
20. [EU AI Act and Product Liability Directive: accountability for generated code](#20-eu-ai-act-and-product-liability-directive-accountability-for-generated-code)
21. [DX: Measuring Developer Productivity with the DX Core 4](#21-dx-measuring-developer-productivity-with-the-dx-core-4)

## Notes on the set as a whole

The productivity sources contradict each other directly. METR measured a slowdown among experienced developers working in mature codebases; the Copilot and Google trials measured speedups on more constrained tasks. Task complexity and codebase familiarity are the most plausible explanation, but that reconciliation is my reading rather than something any single source states.

The security sources are the most internally consistent group in the set, and carry the strongest quantitative evidence I found anywhere.

The governance sources are the weakest group, not because they are poor quality but because very little has been published. That absence is itself a finding for the white paper.

Two captures rest on secondary summaries and should be checked against primary sources before anything cites them: the ETH Zurich AGENTS.md evaluation, and the 31.3 percent unreviewed-merge figure inside the Codacy capture, which originates from CircleCI.

---

# Productivity evidence (contested)

## 1. METR: Measuring the Impact of Early-2025 AI on Experienced Developer Productivity

**Source:** Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity, Becker, Rush, Barnes and Rein (METR), https://arxiv.org/abs/2507.09089

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

A randomised controlled trial with 16 experienced open-source developers working on 246 real tasks in repositories they had contributed to for around five years on average, using Cursor Pro with Claude 3.5 and 3.7 Sonnet.

Participants predicted AI would cut their completion time by roughly a quarter. After finishing, they still believed they had gained about a fifth. The measured result went the other way: tasks took about 19 percent longer with AI allowed.

The gap between perceived and actual performance is the finding that matters, not the slowdown itself. Developers could not tell that they were slower while it was happening.

METR has since published an update characterising this as a snapshot of early-2025 tooling rather than a permanent property of AI assistance.

### Lifecycle stage mapping

General: cuts across the whole lifecycle rather than mapping to one stage. Most directly relevant to whichever stage covers code generation and to any stage where we make claims about speed.

### Relevance to our methodology

This is the most methodologically rigorous study I found and it contradicts the vendor narrative and the survey data. It is the main reason our methodology should be weighted toward verification rather than throughput.

It also sets the standard for how we treat productivity claims in the white paper. If a source reports self-assessed time savings rather than measured ones, this study is the reason to discount it.

Contradicts: Peng et al. (2023), Paradis et al. (2024), Atlassian (2025).

---

## 2. Peng et al.: The Impact of AI on Developer Productivity, Evidence from GitHub Copilot

**Source:** The Impact of AI on Developer Productivity: Evidence from GitHub Copilot, Peng, Kalliamvakou, Cihon and Demirer, https://arxiv.org/abs/2302.06590

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

A randomised controlled trial with 95 professional developers recruited through Upwork. The group with Copilot access completed the assigned task about 56 percent faster than the control group, 71 minutes against 161, with a statistically significant result.

The task was a self-contained JavaScript HTTP server implementation. It had no existing codebase to understand, no legacy constraints, and no integration surface.

Author affiliation matters here. Two of the four authors were at GitHub at the time of writing, which does not invalidate the trial design but is worth recording.

### Lifecycle stage mapping

General: implementation and code generation.

### Relevance to our methodology

Usually cited as the headline evidence that AI speeds developers up, and it is a real RCT rather than a survey, so it cannot be dismissed.

Its value to us is the contrast with METR. The task design is the variable that explains the divergence: greenfield and self-contained here, mature and high-context there. That contrast is the basis for any claim our methodology makes about when AI assistance helps and when it does not.

Contradicts: METR (2025). Supported by: Paradis et al. (2024).

---

## 3. Paradis et al. (Google): How Much Does AI Impact Development Speed?

**Source:** How Much Does AI Impact Development Speed? An Enterprise-Based Randomized Controlled Trial, Paradis et al. (Google), https://arxiv.org/pdf/2410.12944

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

An enterprise RCT with 96 full-time Google engineers. Task completion time fell by roughly 21 percent with AI assistance.

Two caveats the paper itself raises: the confidence interval is wide, and the task was constructed around Google's internal tooling and codebase conventions, which limits how far the result generalises to teams without that infrastructure.

Sits between the Copilot trial and the METR trial in both effect size and task realism.

### Lifecycle stage mapping

General: implementation and code generation.

### Relevance to our methodology

Useful because it is a speedup result from a controlled trial inside a real enterprise rather than on a contrived task, which makes it harder to dismiss than the Copilot study.

For our methodology it supports a conditional claim rather than an absolute one: AI assistance produces measurable gains where the surrounding tooling and conventions are strong. That is an argument for the readiness and context work in our lifecycle.

Supported by: Peng et al. (2023). Contradicts: METR (2025).

---

## 4. Google and DORA: Accelerate State of DevOps Report 2024

**Source:** Accelerate State of DevOps Report 2024, Google / DORA, https://dora.dev/research/2024/dora-report/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Reports that AI adoption improved individual-level outcomes including flow, productivity and job satisfaction, while simultaneously correlating with worse delivery performance at team level. The report associates a 25 percent increase in AI adoption with a small decrease in delivery throughput and a larger decrease in delivery stability.

This was the second consecutive year DORA reported AI adoption correlating with worse delivery outcomes.

Correlational, not causal. The report does not establish that AI caused the decline.

### Lifecycle stage mapping

General: cross-cutting, but most relevant to whichever stages cover review, testing and release, since those are where throughput and stability are determined.

### Relevance to our methodology

The most important single finding for framing the white paper, because it separates individual experience from team outcome. Developers feel faster and the delivery system gets worse.

That gap is the strongest argument for a methodology that puts controls between individual generation and team delivery. It also explains why the survey evidence and the delivery evidence disagree without either being wrong.

Adds nuance to: Atlassian (2025), Peng et al. (2023). Consistent with: METR (2025).

---

## 5. Stack Overflow: 2025 Developer Survey, AI section

**Source:** 2025 Developer Survey, AI section, Stack Overflow, https://survey.stackoverflow.co/2025/ai

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

49,009 responses across 166 countries. Adoption is effectively settled: 84 percent use or plan to use AI tools.

Trust moved the other way. Trust in the accuracy of AI output fell to 29 percent from 40 percent the previous year. More developers actively distrust accuracy (46 percent) than trust it (33 percent), and only 3 percent report high trust.

The most cited frustration, named by 66 percent, is output that is almost correct but not quite.

### Lifecycle stage mapping

General: cross-cutting. The almost-correct failure mode is most relevant to verification, review and testing stages.

### Relevance to our methodology

Establishes two things our methodology can rely on. First, adoption is not the problem to solve, so the white paper should not spend pages arguing for AI use. Second, the characteristic failure is subtle wrongness rather than obvious breakage.

That second point drives a specific methodological claim: conventional code review is tuned to catch obviously wrong code and is poorly suited to catching plausibly wrong code. Any verification guidance we write has to account for that.

Large sample and self-reported. Attitudes, not measured outcomes.

---

## 6. Atlassian: State of Developer Experience Report 2025

**Source:** State of Developer Experience Report 2025, Atlassian, https://www.atlassian.com/blog/developer/developer-experience-report-2025

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Survey of around 3,500 developers. Nearly all report time savings from AI, and around 68 percent report saving ten or more hours per week.

The same report finds developers losing a comparable amount of time each week to organisational friction, primarily finding information and context switching.

Self-reported throughout. No measured task times.

### Lifecycle stage mapping

General: cross-cutting.

### Relevance to our methodology

The internal contradiction is the finding worth using. Ten hours saved and ten hours lost in the same population means tool-level gains do not automatically become delivery gains.

That reconciles this source with DORA rather than putting them in conflict, and it supports a claim our methodology should make explicitly: improving individual tooling without addressing team-level flow produces no net delivery improvement.

Self-reported time savings should be discounted given the METR finding that developers misjudge their own speedup. Treat the ten hours saved as perception and the ten hours lost as the more reliable half.

---

# Security evidence

## 7. Veracode: 2025 GenAI Code Security Report

**Source:** 2025 GenAI Code Security Report, Veracode, https://www.veracode.com/blog/ai-generated-code-security-risks/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Testing across more than 80 coding tasks and over 100 large language models found security vulnerabilities introduced in roughly 45 percent of cases.

Failure rates varied sharply by language and vulnerability class. Java was the weakest language tested at around a 72 percent security failure rate. Cross-site scripting failed in about 86 percent of relevant cases and log injection in about 88 percent.

Veracode's own framing is that the failure rate has not improved as models have grown more capable, which is a stronger claim than the data alone supports and should be treated as their interpretation.

### Lifecycle stage mapping

General: security review, and any stage covering verification of generated code before it reaches production.

### Relevance to our methodology

The hardest quantitative evidence in the whole research set, and the primary justification for treating security as a blocking control rather than a selective review.

Vendor-origin, and Veracode sells application security testing, so the finding aligns with their commercial interest. It should be cited alongside the independent academic work (Pearce 2022, Perry 2023) rather than on its own.

Supported by: Pearce et al. (2022), Perry et al. (2023).

---

## 8. Perry et al.: Do Users Write More Insecure Code with AI Assistants?

**Source:** Do Users Write More Insecure Code with AI Assistants?, Perry, Srivastava, Kumar and Boneh, ACM CCS 2023

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

A user study finding that participants with access to an AI assistant produced less secure code than those without, and were more confident that their code was secure.

The confidence inversion is the substantive result. It is not simply that AI produces insecure output; it is that using it degrades the developer's ability to judge whether their own output is secure.

### Lifecycle stage mapping

General: security review, and any stage that relies on developer judgement to decide what needs closer inspection.

### Relevance to our methodology

This is the finding that justifies making security checks automatic and universal rather than selective.

Selective security review depends on developers correctly identifying which of their changes are risky. This study says that judgement is miscalibrated in the wrong direction when AI is involved. If the person deciding what needs attention is systematically overconfident, the control has to move off their judgement.

Directly supports the argument for a blocking gate over a discretionary review.

Supported by: Veracode (2025), Pearce et al. (2022).

---

## 9. Pearce et al.: Asleep at the Keyboard?

**Source:** Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions, Pearce, Ahmad, Tan, Dolan-Gavitt and Karri, IEEE S&P 2022

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Generated 1,689 programs using Copilot across scenarios drawn from high-risk CWE categories and found approximately 40 percent contained vulnerabilities.

Predates the current model generation by several years, so the specific rate should not be quoted as current. Its value is as an independent early datapoint that the later vendor testing is consistent with.

### Lifecycle stage mapping

General: security review, implementation.

### Relevance to our methodology

Establishes that insecure generation is a persistent property of the technology rather than a quirk of one model or one vendor's testing methodology.

Because it is peer-reviewed and independent, it is the citation to lead with when the security argument is challenged as vendor-driven. Cite Veracode for current magnitude, cite this for independence and duration.

Supported by: Veracode (2025), Perry et al. (2023).

---

# Workflow and practice accounts

## 10. Anthropic: Claude Code Best Practices for Agentic Coding

**Source:** Claude Code: Best Practices for Agentic Coding, Anthropic, https://www.anthropic.com/engineering/claude-code-best-practices

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

First-party guidance covering repository context files, workflow structure and verification.

Three things are directly usable. First, context files recording build commands, code style, testing instructions and repository conventions, generated with an initialisation command and refined over time. Second, an explore, plan, code, commit workflow with a distinct planning step separated from execution. Third, and most important for us, the principle of giving the model a way to check its own work through tests, build exit codes, linters and visual diffs, so the correction loop closes without a human in it.

Also recommends a separate verification agent that attempts to refute a result, so the agent that produced the work is not the one grading it.

### Lifecycle stage mapping

General: context and repository preparation, implementation, and verification of generated output.

### Relevance to our methodology

One of the few sources that describes a concrete workflow rather than tool capabilities, which fits my research angle directly.

The self-verification principle is the most transferable idea in the source and is vendor-neutral in substance even though the document is vendor-published. It gives our methodology a concrete rule: before delegating a task, define how the result will be checked.

Vendor-published, so treat workflow recommendations as one organisation's practice rather than an established pattern.

---

## 11. Anthropic: How Anthropic Teams Use Claude Code

**Source:** How Anthropic Teams Use Claude Code, Anthropic, https://www.anthropic.com/news/how-anthropic-teams-use-claude-code

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Internal accounts from several teams. The useful parts are the limits rather than the successes.

One product team reports that a substantial majority of a feature was built autonomously, but specifies that this works at the edges of the product rather than in core business logic. One engineering team reports first-attempt success on autonomous work at roughly one in three.

The security team describes pasting infrastructure plans into the tool to ask what a change will actually do before approving it, with the human retaining the decision.

Teams update their repository context files at the end of working sessions rather than treating them as fixed.

### Lifecycle stage mapping

General: implementation, context preparation, and deployment approval.

### Relevance to our methodology

Valuable specifically because the numbers are unflattering. A one-in-three first-attempt rate and an explicit boundary between peripheral and core code are more useful to a methodology document than a success story would be.

Supports two claims: that autonomy should be scoped by code criticality rather than applied uniformly, and that context files are maintained continuously rather than written once.

Single organisation, and that organisation builds the tool. Do not generalise to teams with different tooling or codebases.

---

## 12. ETH Zurich and LogicStar.ai: Evaluating AGENTS.md

**Source:** Evaluating AGENTS.md, ETH Zurich and LogicStar.ai, summarised at https://todatabeyond.substack.com/p/do-agentsmdclaudemd-files-help-coding

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Tested whether repository context files improve coding agent performance. Found that automatically generated context files reduced task success rates and increased inference cost by more than 20 percent.

The proposed explanation is that broad architectural overviews send agents into unbounded exploration rather than focusing them.

Accessed through secondary summaries rather than the primary paper. The original should be located and read before citing in the white paper.

### Lifecycle stage mapping

General: context and repository preparation.

### Relevance to our methodology

The most important counter-evidence in the research set, and the reason the context work in our methodology has to be prescriptive about what to leave out rather than just recommending that teams write these files.

Practice has run ahead of evidence here. Over 60,000 public repositories contain such a file, and the one rigorous evaluation available suggests a common way of producing them makes things worse.

Contradicts the implicit assumption in most practitioner writing on this topic, including Anthropic's guidance, though that guidance does emphasise brevity.

---

## 13. Microsoft: Spec-Driven Development, AI-Native Engineering

**Source:** Spec-Driven Development: AI-Native Engineering, Microsoft Developer Blog, https://developer.microsoft.com/blog/spec-driven-development-ai-native-engineering/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Describes treating a precise, versioned specification as the source of truth, with code as a generated and verifiable output rather than the primary artifact. Documents a workflow moving from specification through planning and task breakdown to implementation.

Related tooling (GitHub Spec Kit, released September 2025 under an MIT licence) implements this workflow.

Thoughtworks Technology Radar Volume 33 placed spec-driven development in its Assess ring, cautioning that the workflows are elaborate and that some tooling produces specifications which are themselves hard to review.

### Lifecycle stage mapping

General: requirements, design and specification authoring.

### Relevance to our methodology

The main source for the argument that the specification becomes the highest-leverage human artifact when generation is cheap.

The Thoughtworks assessment is the important qualifier and should be cited alongside it. This is an emerging practice adopted by a minority of teams, not established practice, and the white paper should present it as such rather than as the default.

Directly relevant to how our lifecycle handles requirements and design, particularly since design has no obvious home once generation is agent-driven.

---

# Review and verification practice

## 14. Codacy: AI Is Breaking Code Review

**Source:** AI Is Breaking Code Review: How Engineering Teams Survive the PR Bottleneck, Codacy, https://blog.codacy.com/ai-breaking-code-review-how-engineering-teams-survive-pr-bottleneck

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Argues that AI shifted the constraint in software delivery from writing code to approving it. Cites data indicating pull requests merged without any review rose by 31.3 percent.

Recommended response is to move baseline and mechanical checks onto automated tooling so that human attention concentrates on whether a change solves the correct problem.

### Lifecycle stage mapping

General: code review and verification of completed changes.

### Relevance to our methodology

Provides the quantitative anchor for the review bottleneck argument, which is otherwise easy to assert and hard to evidence.

The automate-the-baseline recommendation is sensible but not novel, and Codacy sells automated code review tooling, so the recommendation aligns with their commercial interest. The underlying statistic is sourced from CircleCI rather than from Codacy, which makes it more usable than the surrounding argument.

The primary CircleCI report should be located before the 31.3 percent figure is cited in the white paper.

---

## 15. GitHub: Turning One Giant AI-Generated Pull Request Into a Reviewable Stack

**Source:** Turn One Giant AI-Generated Pull Request Into a Reviewable Stack, The GitHub Blog, https://github.blog/engineering/turn-one-giant-ai-generated-pull-request-to-a-reviewable-stack/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Describes a concrete practice for handling the volume problem: decomposing a single large AI-generated pull request into a sequence of smaller, individually reviewable ones.

Addresses a specific failure mode where AI produces a change too large for a human to review meaningfully, which then gets approved without real scrutiny because rejecting it is expensive.

### Lifecycle stage mapping

General: code review and verification of completed changes.

### Relevance to our methodology

One of very few sources describing an actual workflow change rather than a tool capability, which is exactly the kind of evidence my research angle calls for.

Gives our review guidance something concrete to say beyond review carefully. A pull request sizing rule is an artifact a team can actually adopt.

Single organisation, and GitHub has an obvious interest in pull request workflows. The practice itself is tool-independent.

---

# Operations practice

## 16. Google SRE: AI in SRE, Engineering Reliable Operations

**Source:** AI in SRE: Engineering Reliable Operations, Google SRE, https://sre.google/resources/practices-and-processes/ai-engineering-reliable-operations/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Describes production AI agents operating across the incident lifecycle with measured outcomes. An incident hypothesis feature produced around a 10 percent reduction in mean time to mitigate, validated through A/B testing. Investigation dashboards produced roughly a 44 percent reduction for supported incidents.

The operator agent runs predominantly at a level where it proposes and a human approves.

Two safety concepts are directly reusable. The first is that the blast radius of an AI mistake in production propagates faster than a human one. The second is the mechanism they build in response: circuit breakers on agent actions and a control to pause everything in flight.

### Lifecycle stage mapping

General: operations, incident response, and production release.

### Relevance to our methodology

The best-measured operational practice in the entire research set, and one of very few sources reporting validated numbers rather than estimates.

The autonomy ladder and the pause control are the most directly reusable artifacts I found anywhere. They are concrete enough to become white paper content without much adaptation.

Google-scale, with corresponding tooling and staffing. The autonomy principle transfers; the specific implementation probably does not.

---

## 17. Meta: Leveraging AI for Efficient Incident Response

**Source:** Leveraging AI for Efficient Incident Response, Engineering at Meta, https://engineering.fb.com/2024/06/24/data-infrastructure/leveraging-ai-for-efficient-incident-response/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Describes a fine-tuned model used to rank likely root causes when an incident is created. Meta reports accuracy of around 42 percent at incident creation time and states plainly that the system can propose incorrect causes and mislead engineers.

The system narrows a search space rather than producing an answer. It is positioned as an accelerator for human investigation, not a replacement for it.

### Lifecycle stage mapping

General: operations and incident response.

### Relevance to our methodology

The candour is what makes this useful. A published accuracy figure below half, with an explicit warning about misleading engineers, is a better model for how our white paper should describe AI capability than any source claiming high reliability.

Supports a specific methodological principle: AI output in high-stakes contexts should be framed as a ranked hypothesis to investigate rather than a conclusion to act on. That framing generalises well beyond incident response.

Single organisation, at a scale most teams do not operate at.

---

# Governance

## 18. Attribution: the Co-Authored-By trailer convention

**Source:** Co-Authored-By trailer discussion, anthropics/claude-code issue 66602, https://github.com/anthropics/claude-code/issues/66602

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Records the dispute over the emerging convention of attributing AI contribution through a Git commit trailer.

Tooling has converged somewhat in practice. Claude Code adds a co-authorship trailer, VS Code added a setting controlling this behaviour in its 1.110 release in February 2026 with the default off, and Codex CLI added commit attribution in early 2026.

The objection recorded in the issue is that asserting AI co-authorship conflicts with United States Copyright Office guidance treating the human as author and the AI as a tool.

Practitioner consensus in adjacent sources favours instrumenting attribution at commit time over attempting detection afterwards, since statistical detection of generated code degrades as models improve.

### Lifecycle stage mapping

General: cross-cutting governance. Applies at commit and review, not at a single lifecycle stage.

### Relevance to our methodology

Directly addresses one of the two governance concerns the client raised twice.

The headline finding is that no standard exists. Conventions are tool-specific, contested on legal grounds, and mostly disabled by default. For the white paper this is a genuine gap rather than a summary of settled practice, which means our module has to propose a convention rather than document one.

The write-time versus detection-time distinction is the most reusable idea and should shape whatever we recommend.

---

## 19. Finout: Token Economics and TokenOps

**Source:** Token Economics and TokenOps: FinOps for Tokens, Finout, https://www.finout.io/blog/token-economics-and-tokenops-the-definitive-guide-to-finops-for-tokens

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Describes applying FinOps principles of visibility, allocation and optimisation to token consumption.

The practical core is tagging every model call with metadata identifying team, feature and environment, then joining that to provider billing. This usually requires routing calls through a proxy or gateway because providers expose limited native attribution.

The FinOps Foundation is extending its FOCUS specification with AI cost primitives.

One useful counterpoint: high token consumption may correlate with high effectiveness, so cost tracking should inform allocation rather than drive reduction.

### Lifecycle stage mapping

General: cross-cutting governance.

### Relevance to our methodology

Addresses the second governance concern the client raised twice.

Vendor-published, and the space is dominated by vendors. I found very little published practice from real engineering teams describing how they budget or allocate token spend at team or individual level. That absence is itself a finding worth stating explicitly in the white paper.

The tag-then-join pattern is the only concrete, tool-independent practice I could extract. Everything else in this space is product positioning.

---

## 20. EU AI Act and Product Liability Directive: accountability for generated code

**Source:** The 2026 EU AI Act and AI-Generated Code, Augment Code, https://www.augmentcode.com/guides/eu-ai-act-2026, and Ensuring AI Accountability Through Product Liability, National Law Review

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Two points relevant to accountability.

The EU AI Act's next major enforcement milestone falls on 2 August 2026. Ordinary use of AI coding assistance does not typically trigger high-risk obligations, but code that powers a high-risk system does, which shifts the question from how the code was written to what it operates.

The recast EU Product Liability Directive (2024/2853), in force since November 2024, treats software including AI as a product and AI providers as manufacturers.

Both sources are legal analysis and extrapolation. There is no case law applying either instrument to routine AI-assisted development.

### Lifecycle stage mapping

General: cross-cutting governance, and any stage where a change is approved or accepted.

### Relevance to our methodology

Relevant to NBN Co specifically, given critical infrastructure exposure, and to the accountability half of the client's governance concern.

The practical finding for our methodology is that accountability is currently anchored in process rather than law: the developer who accepts the change is treated as responsible, and the defensible position is to record who reviewed a change and whether they were competent to evaluate generated output.

Legal analysis rather than settled law. The white paper should describe the direction of regulation without asserting specific obligations.

---

## 21. DX: Measuring Developer Productivity with the DX Core 4

**Source:** Measuring Developer Productivity with the DX Core 4, DX, https://getdx.com/research/measuring-developer-productivity-with-the-dx-core-4/

**Date captured:** 2026-09-05

**Reviewed by:** Sajad Ali Akbari

### Key findings

Consolidates DORA, SPACE and DevEx into four dimensions: speed, effectiveness, quality and impact. Positioned explicitly on the argument that existing frameworks cannot capture what AI changes.

Balancing quality and impact against speed is the structural point. A framework that measures only throughput will report improvement from AI adoption even where delivery outcomes worsen.

### Lifecycle stage mapping

General: cross-cutting, governance and measurement.

### Relevance to our methodology

Relevant to the measurement part of our governance work. If the white paper recommends that teams adopt AI practices, it has to say how they will know whether it worked, and DORA metrics alone will not answer that.

Vendor-published, and DX sells developer productivity measurement, so the claim that existing frameworks are inadequate serves their product. The underlying reasoning stands on its own and the constituent frameworks are independent.

Consistent with DORA (2024).

---
