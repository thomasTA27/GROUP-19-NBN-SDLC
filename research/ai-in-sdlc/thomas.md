1. Anthropic (Claude Academy): The AI-Native SDLC Playbook
Source: The AI-Native SDLC Playbook, Claude Academy, 2026, https://academy.claude.com/courses/ai-native-sdlc-playbook
Date captured: 2026-09-05
Reviewed by: <name>

Key findings
Frames the SDLC as six non-linear stages — Plan, Design, Build, Test, Deploy, Maintain — connected as a loop rather than a relay. Each stage ends by committing a version-controlled, machine-readable artifact (intent.md → spec.md → plan.md → the diff → the PR → the incident record) that triggers the next stage; the chain of commits doubles as an audit trail of who asked for what, what the agent produced, and who approved it.
Governing principle stated directly: the agent can act up to the production gate but never crosses it. Practical mechanisms named across stages include CLAUDE.md as persistent repo context, reusable "skills," hooks as deterministic approval gates (e.g. a production-deploy hook that blocks release until a named release manager authorizes it), continuous evals that re-run in CI whenever agent configuration changes, and the closing-the-loop move where a breached production control band gets diagnosed and written back out as a new intent.md, re-entering Stage 1.

Lifecycle stage mapping
All six stages: Plan, Design, Build, Test, Deploy, Maintain.

Relevance to our methodology
This is the backbone we map the other three sources against, since it is the only source that names a full non-linear loop with an explicit artifact at every handoff. The "agent stops at the production gate" principle gives our methodology its clearest single statement of where human authority sits, and the hooks-as-approval-gates mechanism is the most concrete answer we have to "how is oversight actually enforced" rather than just asserted.
Vendor-published and self-referential (Claude describing Claude Code), so treat the specific mechanisms as one implementation of the loop rather than the only possible one — use IBM and Atlassian to check whether the same control points appear under different tooling.

---

2. Amazon Web Services: AI-Driven Development Life Cycle
Source: AI-Driven Development Life Cycle: Reimagining Software Engineering, Amazon Web Services, 2025, https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/
Date captured: 2026-09-05
Reviewed by: <name>

Key findings
The most radical reframing among the sources: positions AI as "a central collaborator," not an assistant. Reworks Agile vocabulary to match a faster cadence — sprints become "bolts" (hours or days, not weeks), epics become "Units of Work" — and organizes work into three phases: Inception (business intent → detailed requirements, stories, units, via "Mob Elaboration" where the whole team validates AI's questions), Construction (a per-unit loop where AI proposes architecture, domain models, code, and tests, via "Mob Construction"), and Operations (managing infrastructure-as-code and deployments with team oversight).
Rests on two stated principles: "AI Powered Execution with Human Oversight" (AI plans, asks clarifying questions, defers critical decisions to humans) and "Dynamic Team Collaboration" (as AI handles routine tasks, teams unite in real-time collaborative sessions). Claims teams can complete in hours or days what previously took weeks. Authored by Raja SP, a Principal Solutions Architect at AWS leading Developer Transformation Programs.

Lifecycle stage mapping
Inception (≈ Plan/Design), Construction (≈ Build/Test), Operations (≈ Deploy/Maintain).

Relevance to our methodology
Gives us the strongest "how much faster" claim (hours or days instead of weeks) and the clearest process-level evidence that human oversight is being redesigned rather than removed — "actively seeks clarification and guidance, and defers critical decisions to humans" is a direct statement of the human-in-the-loop principle, independent of Anthropic's framing.
Useful as a contrast case: AWS renames the units of work themselves (bolts, Units of Work) rather than just adding an AI step to existing Agile ceremonies, which supports the argument that AI-native adoption requires process redesign, not a bolt-on. Author is a single named AWS architect rather than an org-wide guide, so treat the specific claims (hours-to-days) as directional rather than benchmarked.

---

3. Stryker, C. (IBM): AI in the SDLC
Source: AI in the SDLC, Stryker, C., IBM, 2026, https://www.ibm.com/think/topics/ai-in-sdlc
Date captured: 2026-09-05
Reviewed by: <name>

Key findings
The most cautionary of the four sources. States plainly that AI tools "are probabilistic systems" whose outputs reflect patterns in training data rather than true understanding; AI-generated code "may look correct, but can contain subtle problems," can miss cross-system dependencies, API integrations, or organizational design standards, and "can call functions that don't actually exist because they are hallucinations" — potentially introducing security vulnerabilities or resource inefficiencies.
Also documents the positive capabilities across all seven of its named phases: NLP-based requirement/roadmap summarization (Planning), structural/architecture recommendations and interactive prototypes (Design), in-IDE code generation and auto-documentation (Coding), automated test-case generation and visual regression testing (Testing), CI/CD bottleneck prediction (Deployment), and automated incident categorization/root-cause suggestion (Maintenance). Its prescription is a human-in-the-loop approach for any serious coding project, framing "evaluating the code written by AI" as the new bottleneck that requires upgrading review processes, best practices, and culture.

Lifecycle stage mapping
Seven phases: Planning, Analysis, Design, Coding, Testing, Deployment, Maintenance.

Relevance to our methodology
This is our counterweight to the vendor-optimism in the Claude and AWS sources. IBM naming hallucinated function calls and missed cross-system dependencies as concrete failure modes gives our methodology a vendor-neutral statement of *why* the human-in-the-loop gate has to exist, which pairs directly with Pearce et al. (source 9) and Veracode as the evidence that the risk is real rather than hypothetical.
Also the clearest statement of where the bottleneck has actually moved — "evaluating the code written by AI" — which is the same claim our own argument rests on, so this is a citation to lead with when making that specific point. IBM is a vendor too, so its caution should be read as compatible marketing (selling review/governance tooling) rather than fully independent, even though the substance lines up with the peer-reviewed sources.

---

4. Geoghegan, R. and Jiang, F. (Atlassian): The AI-native SDLC is paying off
Source: The AI-native SDLC is paying off: 19% more PRs and 2–3 hours saved per developer per week, Geoghegan, R. and Jiang, F., Atlassian, 2026, https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week
Date captured: 2026-09-05
Reviewed by: <name>

Key findings
Reports measured productivity gains — 19% more PRs and 2–3 hours saved per developer per week — and argues engineering leaders must shift measurement from usage metrics (active users, token consumption) to outcome metrics (PR throughput, hours saved).
Structures the work as five stages: Plan (humans set intent and requirements; agents draft technical breakdowns, estimates, and work items), Orchestrate (teams coordinate work across humans and agents; agents are dispatched directly from work items with every action visible), Code (agents work autonomously outside the IDE, pick up well-scoped backlog work, run it in the background, and raise a PR), Review (agents review PRs against standards and the original plan before a human reviewer is pulled in), and Operate (site-reliability agents listen to alerts, triage incidents in Slack, and propose fixes to humans as an always-on incident co-pilot). Orchestrate has no direct one-to-one equivalent in the other three frameworks but reflects the same underlying need: coordinating a mixed human/agent team is itself new work.

Lifecycle stage mapping
Five stages: Plan, Orchestrate, Code, Review, Operate.

Relevance to our methodology
This is our source for the metrics argument specifically: the shift from usage metrics to outcome metrics is a methodological point the other three sources don't make explicitly, and the 19%-more-PRs / 2–3-hours-saved figures are the most citable "gains are real" datapoint we have, since they come from Atlassian's own product usage rather than a vendor claim about a competitor's model.
The Orchestrate stage is the most useful addition to the six-stage backbone — it names the coordination overhead of a mixed human/agent team as its own category of work, which the Claude, AWS, and IBM framings leave implicit. Figures are self-reported by a vendor measuring its own tooling, so treat them as an internal case study rather than an independently verified benchmark.