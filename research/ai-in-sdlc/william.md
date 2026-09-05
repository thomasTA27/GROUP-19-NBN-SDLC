# AI in SDLC

## Frame

My methodology answers how AI should be integrated into enterprise SDLC by first establishing which activities remain irreplaceably human due to reasons such as tacit knowledge and judgment under ambiguity, then specifying 'human' checkpoints to govern AI involvement in the remainder.

AI adoption is deep but shallow-trusted. Three independent 2025 surveys converge on ~84–90% developer AI adoption, but trust is falling sharply (Stack Overflow: only 29% trust accuracy, down from 40% in 2024). AI can produce security risks, one reason why trust is shallow

This adoption/trust gap is the central tension the capstone methodology must address.

**How can we ensure that AI generated code can be more trustworthy?** Human Review / Governance

AI is severely unevenly distributed across phases. AI capability is unevenly distributed across phases. Coding and code review have mature, documented tooling. Testing and requirements have credible but less-proven tooling. Deployment optimization and AIOps are real but the "AI" branding is contested.

## SDLCs

### What is Waterfall and phases

Linear SDLC but sometimes can be mixed into other SDLCs for a more flexible hybrid approach.

- Requirements Analysis
- System Design
- Implementation
- Testing
- Deployment
- Maintenance

### What is Agile and phases

- Concept
- Inception
- Iteration
- Testing
- Release
- Maintenance & Retirement

## State of AI in SDLC

DORA 2025 "State of AI-assisted Software Development" (Google Cloud; ~5,000 respondents, surveyed June 13–July 21, 2025): 90% of technology professionals use AI at work (a 14.1% increase over the prior year); respondents spend a median of two hours per workday interacting with AI; 90% of organizations have adopted platform engineering; writing new code is the #1 AI use (71% of those who write code); a majority (61%) report never interacting with AI in an agentic mode. *Source type: rigorous vendor-run survey (methodologically transparent).*

Across any SDLC, AI tends to struggle under ambiguity like tradeoffs and hence the biggest gaps in AI concentrate around the frontside (Planning and Design) and backend (Deployment and Maintenance Operations) phases of the lifecycle where work is mostly context dependent. I strongly suggest placing human in the loop checks between those phases.

---

## Planning / Requirements

Traditionally humans did requirements gathering, requirements specification, feasibility study, scope definition such as boundaries and constraints, risk assessments, resource and budget planning and roadmap creation.

AI is typically used for requirements elicitation, user-story and acceptance-criteria generation, epic breakdown, backlog grooming, meeting-note summarization, natural-language-to-ticket conversion.

**Tools that could be used:** Atlassian Rovo/Intelligence in Jira, Miro AI user-story generator.

*Valid but weak evidence as these are vendor marketing.*

### Gaps

Potential gaps exist in "deep-seeded domain nuances, understanding the overall context, over-automation, over-specification and losing the human-centric view of requirements."

AI cannot surface tacit or unknown-known knowledge that only emerges through human relationship and interactive elicitation. Unknown-known means that a stakeholder knows something but doesn't outright explain it as it is second nature to them, making it difficult for business analysts to gauge it, and only through human interaction and observation can those requirements arise. This is basically impossible for AI currently as it only works with texts/prompts it's given and there is no way to physically observe somebody, build interpersonal trust and reading the room. We definitely need some kind of human checkpoint here.

AI has no access to organizational/business context, stakeholder politics, or strategic priorities unless explicitly fed them; DORA 2025 notes AI "tends to turn up at the keyboard," so friction "beyond the individual's purview" tied to how the organization is wired is unaffected.

### Verdict

Planning is one of the most human dependent phases whilst AI serves more as a drafting/summarising tool. Human in the loop control should be mandatory.

**References:**
- Arora, C., Grundy, J., & Abdelrazek, M. (n.d.). *Advancing Requirements Engineering through Generative AI: Assessing the Role of LLMs.* Retrieved September 2, 2026, from https://arxiv.org/pdf/2310.13976
- *State of AI-assisted Software Development 2025* Platinum sponsors Premier research partner Research partners Gold sponsors. (n.d.). Retrieved September 2, 2026, from https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf

---

## Design / Architecture

What humans actually do in the design phase: system architecture design, technology/stack selection, API design, database schema design, design pattern selection. Non-functional requirement design (scalability, security, performance, availability). Design reviews and Architecture Decision Records (ADRs); technical-debt tradeoff decisions; UI/UX design collaboration.

Within the design phase AI can perform architecture brainstorming, design-doc drafting, OpenAPI/schema generation, diagram/prototype generation, design-to-code.

**Possible tools used:** Gemini Code Assist (OpenAPI spec generation, app prototyping agent in Firebase Studio turning ideas into functional prototypes with UI/backend/AI flows; Application Design Center for visual template design — in preview); GitHub Copilot chat; Claude for design docs.

*Valid but weak evidence as these are vendor marketing.*

### Gaps

AI performs poorly at "architecting solutions, especially in large codebases that require broad understanding." AI was found to struggle with anticipating ripple effects across platforms and understanding the downstream implications of design decisions.

### Verdict

Design and Architecture phase is the most resistant technical phase where human in the loop must be mandatory. AI is used here to provide options and boilerplate but definitely not to own architectural design.

**References:**
- Toub, S. (2026, March 23). *Ten Months with Copilot Coding Agent in dotnet/runtime* - .NET Blog. .NET Blog. https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/

---

## Implementation

What humans typically do here: writing code, debugging, refactoring, integrating third-party libraries/APIs. Code reviews (peer review), pair programming. Version control practices (branching, commit hygiene), following coding standards/style guides, documentation writing.

Most evidence and most used here. AI tools can do inline code completion, chat-based generation, agentic multi-file editing, autonomous issue-to-PR coding agents, code translation/migration, documentation generation.

**Tools include:** GitHub Copilot, Claude Code, Cursor (Agentic CLI)

Octoverse 2025 reports nearly 80% of new GitHub developers adopt Copilot within their first week; JetBrains' State of Developer Ecosystem 2025 (24,534 developers, 194 countries) found 85% use AI regularly and 62% rely on at least one AI coding assistant; per DORA 2025, writing new code is the #1 AI use (71% of code-writing respondents), followed by technical literature reviews (68%), modifying existing code (66%), and proofreading (66%).

### Gaps

**Security Defects:** Veracode's 2025 report found 45% of samples introduced OWASP Top-10 vulnerabilities. Developers with AI write less secure code.

AI struggles with maintainability, as in GitClear's analysis reported that found refactored/"moved" code fell from ~25% (2021) to under 10% (2024) while copy/paste rose, with an eightfold increase in duplicated code blocks. 2024 was the first year copy/paste exceeded moved code.

### Verdict

AI is the strongest here and does most of the implementation. However, humans need to verify and review potential implementation issues such as security risks or poor maintainability. Code review, security scanning, and accountability must be enforced at human checkpoints, shifting human effort to verification and review.

**References:**
- Toub, S. (2026, March 23). *Ten Months with Copilot Coding Agent in dotnet/runtime* - .NET Blog. .NET Blog. https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/
- *How Anthropic teams use Claude Code.* (2025, July 24). Claude. https://claude.com/blog/how-anthropic-teams-use-claude-code
- *How Anthropic teams use Claude Code.* (2025, July 24). Claude. https://codingscape.com/blog/how-anthropic-engineering-teams-use-claude-code-every-day / https://claude.com/blog/how-anthropic-teams-use-claude-code
- Vibe Graveyard. (2026, June 10). *GitClear study finds AI coding assistants are pushing codebases toward copy-paste debt.* Vibegraveyard.ai; Vibe Graveyard. https://vibegraveyard.ai/story/gitclear-ai-copilot-code-quality-study/
- Staff, G. (2025, October 28). *Octoverse: A new developer joins GitHub every second as AI leads TypeScript to #1.* The GitHub Blog. https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/

---

## Testing / Quality Assurance

What humans do in testing: test planning and strategy design, test design and implementation, regression testing strategy. Exploratory testing, manual/usability testing, edge-case identification, accessibility testing. UAT coordination, bug triage and prioritization, test incident reporting.

AI can do test-case generation, autonomous test authoring from requirements/wireframes, self-healing tests, visual validation, AI root-cause analysis of failures, test-data generation.

**Tools include:** Applitools (visual validation), Mabl, ACCELQ (Autopilot/QGPT), testRigor, Functionize, Testsigma, Virtuoso QA; plus GitHub Copilot/Claude for unit-test skeletons. Gemini Code Assist and Firebase Studio automate test creation/execution.

The Forrester Wave™: Autonomous Testing Platforms, Q4 2025 (published Dec 2025) evaluated 15 providers, naming UiPath a Leader and Functionize and Applitools Strong Performers, providing analyst validation for some vendors. The .NET data shows AI genuinely strong at test writing (testing category 75.6% success; 65.7% of CCA merged added lines were test code). *Mixed evidence.*

AI "can automate repetitive tasks and optimise test execution." AI is effective at generating unit tests and boilerplate.

### Gaps

AI lacks contextual understanding and adaptability to software conditions unless explicitly being told. It struggles to understand business requirements, edge cases and contextual nuances. "Overreliance on automation often leads to neglecting nuanced user-experience checks, resulting in poor customer satisfaction despite high test pass rates." AI cannot reliably determine correct expected behaviour. The .NET Microsoft team warns AI-generated tests "may encode incorrect behavior" — for example, tests that pass but validate the wrong thing. The oracle problem is a long-standing, possibly permanent limitation in testing research.

"More concerning, CCA can produce tests that validate existing incorrect behavior, effectively encoding a bug as the expected result. This is actively harmful: such tests create false confidence and will cause future correct fixes to appear as regressions."

### Verdict

AI pioneers testing VOLUME but human testers must own test quality such as strategy, exploratory/usability/accessibility testing.

**References:**
- Vahid Garousi, Joy, N., Zafar Jafarov, Keleş, A. B., Sevde Değirmenci, Ece Özdemir, & Zarringhalami, R. (2024). *AI-powered software testing tools: A systematic review and empirical assessment of their features and limitations* (2409.00411v3). arXiv. https://arxiv.org/abs/2409.00411v3
- *Overcoming Testing Challenges with Generative AI: Common Pitfalls and Solutions.* (2025). Powerdrill.ai. https://powerdrill.ai/blog/overcoming-testing-challenges-with-generative-ai
- Toub, S. (2026, March 23). *Ten Months with Copilot Coding Agent in dotnet/runtime* - .NET Blog. .NET Blog. https://devblogs.microsoft.com/dotnet/ten-months-with-cca-in-dotnet-runtime/

---

## Deployment / CI/CD

In this cycle humans usually do release planning, deployment strategy decisions (blue-green, canary), rollback planning, environment configuration. Change management/approval processes, compliance/audit sign-off, communicating releases to stakeholders.

AI usually performs pipeline generation/optimization, AI code review as a merge gate, deployment-risk prediction, IaC generation and review, release-note generation.

**Tools include:** GitHub Copilot, Claude Code, Gemini Assist. Similar tools to Implementation phase.

Code review has real first-party evidence (GitHub, .NET). Pipeline optimization is more vendor-led. *Flag as mixed.*

### Gaps

Change management and compliance/audit sign-off are accountability-bearing decisions requiring a human owner. AI cannot provide traceable evidence for quality and compliance outcomes — for example, who is accountable if something goes wrong and proven evidence of how and why the system was made. Deployment strategy and rollback decisions require contextual judgment AI lacks.

### Verdict

Deployment must stay human-oriented as most of the important finalising decisions are made here, such as approval and compliance, but AI can automate the mechanical steps such as pipelines.

**References:**
- Baqar, M., & Khanda, R. (n.d.). *The Future of Software Testing: AI-Powered Test Case Generation and Validation.* Retrieved September 2, 2026, from https://arxiv.org/pdf/2409.05808

---

## Maintenance / Operations

Maintenance phase consists of incident response and on-call, root cause analysis (RCA), monitoring/alerting configuration. Technical debt management, capacity planning, patching/security updates. Customer support escalation handling, legacy system knowledge transfer, deprecation planning.

AI is capable in alert noise reduction, event correlation, root-cause analysis, incident triage, automated remediation, post-incident report generation, autonomous investigation.

**Tools include agents:** Dynatrace (Davis AI), Splunk ITSI, Moogsoft, BigPanda, etc.

*Mixed evidence but real.*

### Gaps

In real-time events such as incident response, require reasoning across telemetry, business context, and institutional memory under pressure. AI lacks live system access and tacit knowledge, and cannot own incident command. On-call tasks require a human to answer. In regards to security threat modelling, Veracode displays AI both introduces vulnerabilities and can help attackers exploit them faster, as it lacks a contextual understanding and creative thinking.

### Verdict

AI is typically used for root-cause diagnoses where it is shown to be promising, but humans do the judgement and ownership aspects of maintenance and operations as they are required for tasks such as incident command.

**References:**
- Hingel, P. (2026, May 18). *What Is AIOps in 2026? Event Intelligence Explained.* Augmentcode.com; Augment Code. https://www.augmentcode.com/guides/what-is-aiops
