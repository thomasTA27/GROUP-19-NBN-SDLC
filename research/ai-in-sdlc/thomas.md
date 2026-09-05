# How AI in the SDLC: A Stage-by-Stage Overview of Traditional vs. AI-Driven Software Development


Context 
 AI now is shifting the software development life cycle (SDLC) from a linear pipeline of human handoffs into a continuous, agent-driven loop
 The bottleneck has moved compare to the old SDLC. Once agents write most of the code, the slow parts become planning, review, testing, and deployment — so the winning move is not just faster coding but redesigning the process, controls, and metrics around human-in-the-loop oversight

keyfinding :

- **Traditional SDLC = linear handoffs; AI-native SDLC = a loop.** Claude's framing: the traditional SDLC is a mostly linear flow of documents, tickets, and sign-offs between roles; the AI-native SDLC becomes a non-linear loop where each stage ends by committing a version-controlled artifact (intent.md → spec.md → plan.md → the diff → the PR → the incident record) that triggers the next stage.
- **AWS goes furthest blueprint** with AI-DLC, positioning AI as "a central collaborator ," not an assistant, and replacing Agile rituals: "sprints" become "bolts" (hours or days, not weeks) and "epics" become "Units of Work."
- **    Human decision-making remains important at key stages** .Across all sources, humans  review artifacts, approve high-risk changes, and make the decisions requiring business context. IBM: senior engineers "will need to spend more time on architecture and review than on implementation."
- **Measured productivity gains are real but require new metrics.** Atlassian argues engineering leaders must shift from usage metrics (active users, token consumption) to outcome metrics (PR throughput, hours saved)


### The backbone: Claude's six-stage AI-native SDLC

Anthropic's Applied AI team frames the AI-native SDLC as six non-linear stages — **Plan, Design, Build, Test, Deploy, Maintain** — connected as a loop. Each stage ends by committing a machine-readable, human-readable artifact that the next stage reads, and "the chain of commits is also the audit trail: who asked for what, what the agent produced, and who approved it." The governing principle: "the agent can do everything up to the production gate, but never crosses it."

The reason AI forces a redesign .I once agents produce code in hours, the human-speed stages then  become the constraint. Anthropic notes that traditional controls "stop matching reality and become intractable" . Reviewing each line by hand made sense when a person wrote it, "but it can't keep up once agents write most of the diff."

### Stage-by-stage: Traditional vs. AI-driven

**Stage 1 — Plan**

|||
|---|---|
|**Traditional approach**|person has an idea and must "convince a member of the product team to manually write the idea up" Ideas wait for PM make them into requirements and roadmaps (Claude) => This is inefficient with the use of AI as now as planning is a non-core activity consuming large amounts of product-owner and developer time (AWS)|
|**AI-driven approach**|The originator brainstorms with Claude and produces a version-controlled `intent.md` with the problem, proposed outcome, affected users/systems, constraints, and open questions then the product owner or PM reviews and corrects (Claude). For IBM approach: NLP tools "summarize stakeholder interviews and translate them into project roadmaps" and help build timelines and allocate resources. For AMAZON , AWS's "Inception phase"  AI transform business intent into "detailed requirements, stories and units" through "Mob Elaboration," where the whole team validates AI's questions. For Atlassian approach: "Humans establish intent and requirements. Agents draft technical breakdowns, estimates, and work items"|

**Stage 2 — Design / Analyze**

|||
|---|---|
|**Traditional approach**| collect and analyze requirements, technical architects turn requirements into designs; core steps include architecture, navigation, UI, and database schema (IBM)
|**AI-driven approach**|Once `intent.md` is approved, Claude produces a requirements-and-design spec (`spec.md`), guided by the organization's "skills" for brand, security, compliance, and UX; the product owner reviews but doesn't write it, resolving flagged concerns with policy owners. UI work can be mocked in Claude Design and exported to Claude Code (Claude). For IBM: AI provides "structural recommendations" for architecture, frameworks, and database schema, converts unstructured inputs (emails, tickets) into requirements documents, analyzes feasibility, and produces "interactive prototypes." For AWS's "Mob Construction" has AI propose "a logical architecture, domain models, code solution and tests."|

**Stage 3 — Develop / Build (Code)**

|||
|---|---|
|**Traditional approach**|Engineers write code by hand from the spec and  documentation is a time consuming manual task (Claude, IBM)|
|**AI-driven approach**|This is where AI has "its most visible and immediate impact" (IBM). For Claude Code's "plan mode" is the default starting point; a version-controlled `CLAUDE.md` gives the agent the context "a new joiner would need" (conventions, commands, architecture, common mistakes); reusable "skills" encode institutional knowledge; parallel sessions and subagents enable concurrency.For  IBM: agents work "alongside human developers in their IDE," generate "high-quality code snippets and even entire modules" from natural-language prompts, catch complexity and refactoring opportunities in real time, and auto-generate documentation. AWS's Construction phase runs a per-unit loop generating design, code, and tests. Atlassian: "Agents work autonomously outside the IDE," pick up "well-scoped work from the backlog," run it in the background, and raise "a PR ready for review."|

**Stage 4 — Test**

|||
|---|---|
|**Traditional approach**|QA teams verify software after it is built, testers write test cases and hunt bugs manually (IBM, Claude).|
|**AI-driven approach**|Claude gives the agent a feedback loop so it "checks its own work and fixes its own mistakes before an engineer sees them," verifying against tests, a build, or a screenshot diff , with a hook that blocks the agent from editing test files during a fix. "Continuous evals" run in CI whenever the agent's configuration (CLAUDE.md, skills, hooks) changes, and "every production incident is turned into a permanent eval" . IBM do the same thing: AI "automatically create test cases by analyzing the codebase," identifies edge cases, detects anomalies, and performs visual regression testing|

**Stage 5 — Deploy**

|||
|---|---|
|**Traditional approach**|Release teams ship software; approval gates, change boards, and manual sign-offs govern releases; CI/CD pipelines run but human approvals gate each step (Claude, IBM).|
|**AI-driven approach**|Claude runs three plays: (1) **AI in the PR review loop** , the  agents review PRs against team standards and the original plan, catching bugs and style issues before a human is pulled in; (2) **Hooks as approval gates** — deterministic hooks allow, block, or pause the agent's actions ("the production deploy hook blocks the release until a named release manager authorizes it"); (3) **CI/CD integration**  Claude runs non-interactively in the pipeline (triaging failed builds, drafting changelogs, fixing lint), always arriving as a PR through branch protection with "no route to push to main," with rollback rehearsed in advance. IBM: AI "streamline and optimize" CI/CD pipelines "by predicting bottlenecks" and monitors logs/metrics in real time to "detect potential failures before they escalate." Atlassian's "Review" stage: agents review PRs against standards and plan before a human reviewer is pulled in.|

**Stage 6 — Maintain / Operate**

|||
|---|---|
|**Traditional approach**|Maintenance is a reactive phase. All tickets or incidents wait on a person to act on it and restart the process" (Claude). Teams push updates, patch bugs, and monitor manually|
|**AI-driven approach**|This is where the loop closes. A deterministic monitor watches production "control bands"; when one is breached, Claude diagnoses the issue and writes the finding as a _new_ `intent.md`, re-entering the pipeline at Stage 1 back into the loop . This stage "runs headless, with an independent confidence  stages" deciding whether to continue or escalate to a human (Claude). IBM: AI "automatically categorize and prioritize bug reports, summarize incidents and suggest root causes," proposes debugging fixes, and enables "proactive" continuous monitoring. Atlassian's "Operate" stage: "Site reliability agents listen to alerts, triage incidents in Slack, and propose fixes to humans as an always-on incident co-pilot." AWS's "Operations phase" applies accumulated context to manage infrastructure-as-code and deployments with team oversight.|

### Reconciling stage names across the four sources

The sources use slightly different labels but map cleanly onto the Plan-to-Maintain backbone:

| Claude (6 stages) | IBM (7 phases)      | AWS AI-DLC (3 phases)       | Atlassian (5 stages)      |
| ----------------- | ------------------- | --------------------------- | ------------------------- |
| Plan              | Planning + Analysis | Inception                   | Plan                      |
| Design            | Design              | Inception → Construction    | (within Plan/Orchestrate) |
| Build             | Coding              | Construction                | Code                      |
| Test              | Testing             | Construction (build & test) | (within Code/Review)      |
| Deploy            | Deployment          | Operations                  | Review                    |
| Maintain          | Maintenance         | Operations                  | Operate                   |

Atlassian adds an explicit **Orchestrate** stage ("Teams coordinate work across humans and agents. Agents are dispatched directly from work items, and every action is visible"), which has no direct one-to-one equivalent in the others but reflects the same insight — coordinating a mixed team of humans and agents is itself new work.

### AWS's AI-DLC: the most radical reframing

AI-DLC's answer rests on two dimensions:

- **AI Powered Execution with Human Oversight**: "AI systematically creates detailed work plans, actively seeks clarification and guidance, and defers critical decisions to humans."
- **Dynamic Team Collaboration**: "As AI handles the routine tasks, teams unite in collaborative spaces for real-time problem solving."

The core mental model repeats "rapidly for every SDLC activity": **AI creates a plan -> asks clarifying questions -> implements only after human validation.** AWS reworks Agile vocabulary to match: sprints become **bolts** (hours or days, not weeks), epics become **Units of Work**, and the collaborative rituals are **Mob Elaboration** (Inception) and **Mob Construction** (Construction). The three phases **Inception** (transform business intent into requirements, stories, and units), **Construction** (propose architecture, domain models, code, and tests in a per-unit loop), and **Operations** (manage infrastructure-as-code and deployments)  each "provides richer context for the next," with AI persisting context to the project repository across sessions. AWS claims this lets teams "complete tasks in hours or days that previously took weeks," with benefits spanning velocity, innovation, quality, market responsiveness, and developer experience. The methodology is authored by Raja SP, a Principal Solutions Architect at AWS leading Developer Transformation Programs.

### IBM's cautions: where AI in the SDLC breaks do dds

IBM is the most explicit on risks. AI tools "are probabilistic systems" whose outputs are "based on patterns in their training dataset, not true understanding." AI-generated code "may look correct, but can contain subtle problems," can miss "cross-system dependencies, API integrations, or organizational design standards," and "can call functions that don't actually exist because they are hallucinations," potentially introducing "security vulnerabilities or resource inefficiencies." IBM's prescription: a human-in-the-loop approach for "any sort of serious coding project," and a recognition that "evaluating the code written by AI" is the new bottleneck — so organizations must "upgrade review processes, best practices and even their culture."


### Bottom line: Traditional vs. AI-driven SDLC

The traditional SDLC is a **linear relay** —  discrete phases, owned by distinct roles, connected by documents, tickets, and human sign-offs, where writing code is the slow step. The AI-driven SDLC is a **continuous loop** with agents draft, build, test, review, and monitor at every stage, committing versioned artifacts that automatically trigger the next stage, while humans move "above the loop," setting intent and governing at approval gates. The evidence that this pays off is early but real (Atlassian's 19% more PRs and 2–3 hours saved per developer per week). The catch, on which all four vendors agree, is that the gains only materialize if organizations redesign the _process, controls, and metrics_ around the code — not just bolt an AI onto the old pipeline. The new scarce skill is no longer writing code; it is evaluating and governing what the agents produce.



REFFERENCE
Claude Academy. (2026). _The AI-Native SDLC Playbook_. [online] Available at: https://academy.claude.com/courses/ai-native-sdlc-playbook [Accessed 5 Sept. 2026].


Amazon Web Services. (2025). _AI-Driven Development Life Cycle: Reimagining Software Engineering | Amazon Web Services_. [online] Available at: https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/ [Accessed 5 Sept. 2026].

Stryker, C. (2026). _AI in the SDLC_. [online] Ibm.com. Available at: https://www.ibm.com/think/topics/ai-in-sdlc [Accessed 5 Sept. 2026].

Geoghegan, R. and Jiang, F. (2026). _The AI-native SDLC is paying off: 19% more PRs and 2–3 hours saved per developer per week_. [online] Inside Atlassian. Available at: https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week [Accessed 5 Sept. 2026].