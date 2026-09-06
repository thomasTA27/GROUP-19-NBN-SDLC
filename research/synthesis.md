# Research synthesis

**Date:** 2026-09-06
**Sprint:** 1
**Compiled by:** Sajad Ali Akbari (drafted with Claude Code)
**Draws on:** `research/ai-in-sdlc/sajad.md`, `thomas.md`, `ujjawal.md`, `william.md`. `research/modules/` has no content yet.

## At a glance

Read only this table to know what we concluded. Details and citations are below.

| # | Finding | Who found it | Evidence strength |
|---|---|---|---|
| 1 | Adoption of AI is now almost universal, but trust in its output is falling. | Sajad, William | Strong |
| 2 | Individual productivity gains from AI do not reliably show up as team-level delivery gains. | Sajad, Thomas, William | Mixed |
| 3 | Security is the most consistent, best-evidenced risk. AI also makes developers overconfident about their own code. | Sajad, Thomas, William | Strong |
| 4 | AI is strongest at well-specified implementation work and weakest at the ambiguous edges: planning, design, deployment approval, maintenance ownership. | William, Thomas, Sajad | Mixed |
| 5 | Every independent source scopes human oversight by risk or criticality rather than applying it evenly, but they disagree on whether that scoping should be binary or graduated. | Sajad, Thomas, Ujjawal, William | Strong |
| 6 | AI can generate tests and code that look fine but hide problems: encoded bugs, near-miss output, rising duplication debt. | Sajad, William | Mixed |
| 7 | Keeping AI-assisted changes small is a recurring, independently-motivated control against review overload. | Ujjawal, Sajad | Mixed |
| 8 | Accountability evidence works better when it is captured continuously, as work happens, than when it is assembled at a single review gate. | Sajad, Thomas, Ujjawal | Mixed |

This rolls up findings across `ai-in-sdlc/` and `modules/` into conclusions for the white paper. It is not a place for raw captures. Those stay in the personal files or the module files, using `TEMPLATE.md`. A section below only exists because two or more people's captures independently support the same conclusion, and each one names whose captures it draws from.

This synthesis does not propose or endorse a lifecycle stage structure. Several individual captures stake out a phase model of their own: Sajad's eight-phase cycle, Thomas's four vendor frameworks, Ujjawal's Waterfall, Agile, DevOps and SAFe comparison. Reconciling those into one map is the job of the team's Miro merge session, not this file. What follows is findings and evidence only.

## How we're weighing this evidence

Every capture flags the same caveat: self-reported and vendor-published claims should count for less than independent or controlled evidence. Sajad's read of METR is the sharpest version of this. Trial participants believed AI made them faster while being measurably slower. That is a direct reason to treat self-reported productivity and workflow claims, including the Stack Overflow and Atlassian surveys and the AWS and Atlassian blog posts, as perception rather than measurement.

Thomas, Ujjawal and William each attach the same discount to their own sources independently: Thomas on AWS's "hours not weeks" claim and Atlassian's self-reported PR figures, Ujjawal on the Atlassian and NBN captures, William marking vendor tooling claims as "valid but weak evidence." Where a finding below rests only on a vendor's account of its own product, that is noted. Where independent or peer-reviewed evidence exists, it is cited first.

## 1. Adoption is settled. Trust is not, and it is falling

Three independent surveys agree that AI adoption is now almost universal: 84 to 90 percent of developers use it (Sajad's Stack Overflow capture, William's DORA 2025 and JetBrains figures). Trust is moving the opposite way. Stack Overflow found trust in AI accuracy fell to 29 percent, down from 40 percent the year before. The most common complaint, from 66 percent of respondents, is output that is almost correct but not quite (Sajad). William frames this adoption-trust gap as the central tension the methodology has to address, and ties the low trust directly to the security evidence in finding 3.

> **For the white paper:** adoption is not the problem to argue for. Trustworthiness is.

## 2. Individual productivity gains do not reliably become team delivery gains

Controlled trials disagree with each other. Peng et al. measured a 56 percent speedup on a small, self-contained task. Paradis et al. (Google) measured 21 percent inside a mature enterprise codebase. METR measured experienced developers on real, high-context repositories taking 19 percent longer with AI allowed (Sajad). The pattern: the more novel and self-contained the task, the bigger the measured gain.

Self-reported figures point the same way, but per the weighting note above that means perception, not extra proof. Thomas's Atlassian figures (19 percent more PRs, 2 to 3 hours saved a week) and AWS's "hours not weeks" claim are both self-reported. They support the pattern. They do not add independent measurement of it.

The sharper finding is that individual and team outcomes move in opposite directions. DORA found AI adoption correlating with better individual flow but worse team delivery throughput and stability, two years running (Sajad). Atlassian's own survey shows the same shape: about ten hours saved a week, and a similar amount lost to organisational friction. William's DORA capture adds that 61 percent of developers never use AI in agentic mode, so the higher-autonomy workflows are not the norm yet.

> **For the white paper:** attach a task-type and codebase-maturity qualifier to any productivity claim. Weight METR and DORA over greenfield trial results, since NBN's own codebase is mature and high-context.

## 3. Security is the most consistent, best-evidenced risk

Three people converge on this from non-overlapping sources, which makes it the most internally consistent finding in the set. Veracode's large-scale testing found vulnerabilities in about 45 percent of generated samples, with much higher rates for specific languages and vulnerability classes (Sajad, also cited by William). Pearce et al.'s peer-reviewed, pre-vendor-era study found a comparable 40 percent rate years earlier, which shows this is a persistent property of the technology, not one model or vendor's problem (Sajad). Thomas's IBM capture names the same failure mode independently: AI can call functions that do not exist, and can miss cross-system dependencies that only broader context would catch.

The more important finding sits underneath the raw rate. Perry et al. found that developers using an AI assistant wrote less secure code and were more confident it was secure (Sajad). That confidence inversion is the reason to make security checks automatic and universal, not left to developer judgement about which changes look risky, since the evidence says that judgement is unreliable here.

> **For the white paper:** this is the strongest evidence for a blocking security gate rather than a discretionary one. Cite Pearce and Perry first, since they are independent. Cite Veracode second, for magnitude.

## 4. AI capability concentrates on implementation. The gaps sit at the ambiguous edges

William states the general principle: AI struggles with ambiguity and tradeoffs, so the biggest capability gaps sit at the front of the lifecycle (Planning, Design) and the back of it (Deployment approval, Maintenance ownership), where work depends on organisational context and tacit knowledge that is never written down.

Thomas's IBM capture reaches the same shape from a different angle. It lists real capabilities at every phase: requirement summarisation, architecture recommendations, in-IDE generation, automated test-case generation, incident categorisation. It names the same limit at all of them: output can look correct while missing cross-system dependencies or organisational standards that only wider context supplies.

Sajad's account of documented practice matches this from a third angle. Anthropic reports running agents with light supervision on peripheral features while keeping close control over core business logic, describing the same capability gradient in practitioner terms.

> **For the white paper:** the gap is not evenly spread, and the research gives a reason why: ambiguity and tacit knowledge, not raw difficulty. This matters for wherever oversight needs to concentrate.

## 5. Human oversight is scoped by risk, not applied evenly, but sources disagree on the shape

This is the finding all four people converged on independently, and it is the most load-bearing conclusion in this synthesis. The sources do not all propose the same shape of answer though, and that disagreement matters too.

Three sources describe a binary split. Anthropic runs light supervision on peripheral features and close control over core business logic (Sajad). Claude Academy's rule: the agent can act up to the production gate but never crosses it (Thomas). NBN's own stated position is a "dual-speed" approach, heavy governance on core network capability, faster movement at the edge (Ujjawal). Ujjawal flags this as her strongest finding because it comes from the client, not the team.

Google SRE runs something more graduated: a four-level autonomy ladder, read-only, suggests, bounded action, human approves (Sajad). This is the most usable version in the set, since it gives a team more than one place to draw a line.

William's phase-by-phase audit fits the binary framing: mandatory human-in-the-loop for Planning and Design, human ownership of test quality even where AI writes the tests, and deployment sign-off kept human because it carries accountability.

The research does not supply a threshold for where "core" ends at NBN, but it does supply criteria for drawing one. Blast radius, how far and fast a mistake spreads, is Google SRE's own reasoning for circuit breakers and a pause control. Reversibility, how cheaply a change can be undone, is behind the commit-often practice in the workflow sources (Sajad). Language and vulnerability class matter too, since Veracode's failure rates were not uniform across either (finding 3).

> **For the white paper:** propose a rule built on blast radius and reversibility, not a "core" definition borrowed from a vendor's internal practice. Whether the rule should be binary or a graduated ladder is an open question, see below.

## 6. AI output can create false confidence, not just false coverage

Two people converge on a specific failure mode: AI does not just under-test, it can produce tests that look like coverage while asserting nothing real, or worse, encode a bug as the expected result. Sajad notes that AI inflates coverage without guaranteeing the tests assert anything real, and separately that the Stack Overflow "almost correct" complaint (66 percent of respondents) applies directly to this stage. William's capture is more concrete: Microsoft's own .NET team warns that AI-generated tests "may encode incorrect behavior," and calls this actively harmful, since such tests create false confidence and make future correct fixes look like regressions. William also flags the oracle problem, the long-standing difficulty of a test suite ever proving correct expected behaviour, as sharpened by AI's ability to generate volume quickly.

A related but separate risk, also from William: GitClear's analysis found refactored or moved code falling from about 25 percent to under 10 percent of changes between 2021 and 2024, while copy-pasted code rose eightfold. This is not a security finding. It is a maintainability finding: AI-assisted codebases can accumulate duplication debt largely invisibly.

> **For the white paper:** any claim that AI improves coverage needs this caveat attached. Coverage and duplication metrics do not mean what they used to when a human wrote every line by hand.

## 7. Keeping changes small is a recurring practical control

Ujjawal's DevOps capture names small, reversible changes as one of the two practices that hold the DevOps model together, and flags that AI's ability to produce large changes quickly cuts against this discipline. Sajad's research finds the same problem showing up in practice, and the same response to it. Codacy's data shows pull requests merged with no review at all rising 31.3 percent, attributed to review capacity not keeping pace with generation volume. GitHub's own engineering blog describes a concrete practice built in direct response: breaking a single oversized AI-generated pull request into a sequence of smaller, individually reviewable ones.

> **For the white paper:** this is one of the few places where a concrete, adoptable team practice, a pull-request sizing rule, is independently motivated by both an old operational principle and a documented present-day response.

## 8. Accountability evidence works better captured continuously than assembled at a gate

Three people, from three different angles, land on the same shape of answer: capture accountability evidence continuously, as work happens, not after the fact. Sajad's attribution research finds no accepted standard for crediting AI-written code, but does find a practitioner preference for recording attribution at commit time over trying to detect AI-generated code afterwards, since detection gets less reliable as models improve.

Thomas's Claude Academy capture describes a mechanism that does this by construction: every stage commits a machine-readable artifact (intent, spec, plan, diff, PR, incident record), and the resulting chain of commits doubles as an audit trail of who asked for what, what the agent produced, and who approved it.

Ujjawal's SAFe capture reaches the same principle from regulated-industry practice that predates any of this AI tooling. SAFe's Solution Intent is a living record built up continuously, not assembled at the end, on the reasoning that inspection at the end is too late because the quality is already fixed in the product.

> **For the white paper:** the accountability module has three independent supports, a governance-research finding, a vendor mechanism, and a pre-AI regulated framework, all pointing at the same design choice: evidence generated continuously, not collected at a single gate.

## Where the research is still thin

1. **Governance and cost tracking (TokenOps) is almost entirely vendor-published.** Sajad found no account of how a real team budgets AI or token spend, only vendor product positioning. Worth stating as a gap rather than hiding it.
2. **Most documented practice comes from a handful of very large organisations** (Google, Meta, Microsoft, GitHub, Anthropic, Atlassian, AWS) describing themselves or their own customers (Sajad, Thomas). Nothing in the set is systematic research into how a mid-sized team works day to day. Treat these as principles to adapt, not implementations to copy.
3. **NBN's own stated position is a secondary source.** Ujjawal's capture of the "dual-speed" approach comes from a conference talk reported by a trade outlet, not NBN's own material. Confirm it directly before treating it as settled in the white paper.
4. **Two figures need primary-source verification before citation.** The ETH Zurich and LogicStar.ai evaluation of AGENTS.md-style context files is currently sourced through a secondary summary. The 31.3 percent unreviewed-merge figure cited via Codacy originates with CircleCI's own report (Sajad).
5. **Regulatory accountability is analysis, not settled law.** The EU AI Act and Product Liability Directive material Sajad captured is legal analysis and extrapolation. No case law yet applies either instrument to routine AI-assisted development.

## Open questions for the team

1. **Where does "core" end and "peripheral" begin, at NBN specifically?** Raised independently by Ujjawal, Sajad and William. The research supplies criteria (blast radius, reversibility, language and vulnerability class, see finding 5) but not thresholds. Propose a rule based on blast radius and reversibility, then ask NBN to calibrate the thresholds.
2. **Should the oversight rule be binary or a graduated ladder?** NBN's dual-speed language and Anthropic's practice are both binary. Google SRE runs a four-level ladder (finding 5). Decide which shape the methodology adopts before the Miro merge session locks in a structure that assumes one or the other.
3. **Confirm NBN's dual-speed position with the client or Alessio** before it is cited as settled in the white paper.
4. **Chase down the two primary sources flagged above** (the AGENTS.md evaluation, CircleCI's unreviewed-merge figure) before either is quoted in the white paper.
