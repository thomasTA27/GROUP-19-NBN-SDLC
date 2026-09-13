# Governance, attribution and token accounting research - William

## What is code attribution?

It is identifying who or what tool wrote a specific piece of software source code.

## What is code accountability?

It is asking who is responsible for the code if something breaks.

## How is AI code attributed?

Attribution is achieved at the commit and build layer.

### Attribution mechanisms

**Tagging**

Linux's official documentation states that "AI agents MUST NOT add Signed-off-by tags. Only humans can legally certify the Developer Certificate of Origin (DCO)" when working on the Linux Kernel. The human submitter remains responsible for everything.

When AI assistance is used, the commit message must include an Assisted-by: tag in the format Assisted-by: AGENT_NAME:MODEL_VERSION [TOOL1] [TOOL2]. "[TOOL1] [TOOL2] are optional specialized analysis tools used (e.g., coccinelle, sparse, smatch, clang-tidy)" Example "Assisted-by: Claude:claude-3-opus coccinelle sparse"

Refer to https://docs.kernel.org/process/coding-assistants.html for more information on use of AI for finding and fixing bugs

**Developer Certificate of Origin (DCO)**

In Linux's example, using the tag "Signed-off-by:" asserts the DCO "I have the right to submit this under the open source license indicated". Not AI-generated code related however we can adopt this methodology and define our own DCO to match NBN's policy. For example "By signing off, I certify that I am the accountable human for this change, that I have reviewed any AI-assisted content in it, and that it complies with NBN's secure coding and compliance standards" The Signed-off-by: tag is the signal that the committer is making the certification. The DCO document itself is what they're certifying by adding that signal.

**Sigstore / gitsign**

Adding just bare tags can be easily faked, for example a developer can lie about their commit. To solve this using Sigstore enables keyless Git commit signing: a developer authenticates via OIDC (e.g., GitHub or Google identity) which is a short-lived certificate is issued binding that identity to a signing key, and the signature is recorded in a public transparency log (Rekor). It ties the commit to a cryptographically verified identity rather than just a self-reported comment.

**SLSA (Supply-chain Levels for Software Artifacts)**

SLSA ensures that the package was built from the source code and processes that it was claimed to be from. When code gets compiled/packaged into something deployable, SLSA requires the build system to automatically generate a cryptographically signed metadata receipt called 'provenance'. It can say something like "this artifact was built from commit 123 using this exact build script, on this build server, at this time". The build platform itself signs the 'provenance' instead of a human so it cannot be forged by someone editing a commit message. This does not directly defend against AI-generated code however the code can be traced via the 'provenance'. This is a build level reinforcement to prevent tampering and enable transparency.

**Sources**

AI Coding Assistants — The Linux Kernel documentation. (2026). Kernel.Org. https://docs.kernel.org/process/coding-assistants.html

dco [Wiki]. (2019). Linuxfoundation.Org. https://wiki.linuxfoundation.org/dco

GitHub - sigstore/gitsign: Keyless Git signing using Sigstore. (2023). GitHub. https://github.com/sigstore/gitsign

Supply-chain Levels for Software Artifacts. (n.d.). SLSA. Retrieved September 12, 2026, from https://slsa.dev/

## Who is accountable for it if it fails?

### Accountability mechanisms

The common consensus in enterprise and open source development is that the human who merges/commits/signs is accountable regardless of who wrote the code. On a higher level "Your organisation is ultimately accountable for how and where AI is used. AI complexity can create gaps where no one takes clear responsibility for outcomes." according to the Australian Government [1]

**Code ownership and review structures** (Flagged as a vendor source)

[The tier structure could be used but the specifics will be determined by the company itself]

CODEOWNERS + mandatory named reviewers: owners must review/approve every change to their codebase and is being reinforced in the AI era.

The emerging enterprise pattern treats AI-generated code like a third-party dependency and escalates high-risk changes (auth, payments, money movement, PII, infrastructure, data migrations, public APIs) to explicit human sign-off with a required test diff and a second reviewer, while low-risk changes can use lighter/automated gates. "An AI reviewer can be useful, but it is not an approval authority."

For more detail go to https://www.metacto.com/blogs/establishing-code-review-standards-for-ai-generated-code

**Australian Laws**

NBN, as a telecommunications critical infrastructure operator, is legally bound by the SOCI Act's Critical Infrastructure Risk Management Program (CIRMP) requirements, requiring a board-approved risk management program. While APRA's CPS 230 (a financial-services-only standard) does not apply to NBN, its "documented decision, approved by a named Accountable person" pattern is a useful design template that could be adapted into NBN's own CIRMP-aligned governance, even though NBN has no obligation to follow CPS 230 itself.

It is not every individual that must comply with CIRMP, it's the organisation who establishes rules and practices for the employees to follow like secure coding practices. The staff member's obligation is to follow NBN's internal policy that implements SOCI, not to interact with the Act directly.

[For us our methodology could be framed as the mechanism that translates board-level SOCI accountability down into practice. Things like checkpoint structure showing accountability]

**DACI framework (Driver, Approver, Contributors and Informed) and the single Accountable rule**

In enterprise development in companies such as Atlassian they use frameworks to organise contributors and approvers to remove ambiguity, speed up project velocity, and assign exact decision-making rights to the right people.

DACI (and variants RASCI, RACI, RAPID) is the standard responsibility-assignment tool. Its governing discipline is exactly one Accountable owner per deliverable/decision mapping directly to who is answerable for the code change.

*How to use DACI the framework*

The four roles (exactly one Approver, everyone else can be multiple people):

- Driver - owns the decision process, gathers info, keeps things moving
- Approver - the single person who makes the final call
- Contributors - subject-matter experts consulted for input
- Informed - people who need to know the outcome but don't weigh in

When to use it: Only for decisions with cross-team impact — not for small, low-stakes calls.

What you need to create one (the essential sections):

- Details - status, impact, who holds each role, due date, eventual outcome
- Background - context, related past decisions, constraints
- Relevant Data - evidence/feedback informing the decision
- Options Considered - each option with pros/cons and cost/resource estimate
- Action Items - open questions still needing answers
- Outcome - the final decision and why, recorded for future reference

Process, in order:

1. Assign roles (you're usually the Driver)
2. Fill in Details/Background/Relevant Data/Options — set a due date to force timely input
3. Share with everyone in the roles and collect input from Contributors
4. Approver makes the final call
5. Document and broadly share the Outcome so it's easy to find later

The core value proposition: it forces a single accountable decision-maker (the Approver) while still surfacing expert input (Contributors) and keeping stakeholders aware (Informed), avoiding both "decision by committee" paralysis and blindsiding people who needed a heads-up.

You can find DACI templates online.

**Board-approved AI risk accountability**

"1.1.1 To ensure AI systems perform as required and obligations are met, assign, document and clearly communicate who is accountable across the organisation (including contractors and third‑party providers/systems) for the operation of the AI management system, including: safe and responsible policies, practices and procedures the development and deployment of every AI system, including ongoing human control and oversight oversight of the development and use of AI systems by third parties testing of AI systems across the organisation oversight of concerns, challenges and requests for redress the performance and continual improvement of the AI management system."

"1.1.2 For each accountable person, define and communicate the required competencies and their authority. Ensure they are staffed with appropriately skilled people and have the necessary resources."

This matters because AI-assisted development creates risks that no single developer or team can be expected to catch or own alone. The consequences of a bad AI-assisted deployment on critical infrastructure (an outage, a security breach, a compliance failure) can affect the entire organisation and the public it serves, not just the team that shipped the change. Requiring board and executive sign-off means the people with the authority and visibility to weigh that organisation-wide risk are the ones formally accountable for it, rather than accountability being left to whoever happened to click "approve" on a pull request. It also creates a clear, unavoidable point of responsibility where if something goes wrong, there's no ambiguity about who was supposed to be watching, which is exactly what regulators, auditors, and the public expect from an organisation operating critical national infrastructure.

**Named human authority to override / halt AI (Kill switch)**

"6.1.1 Maintain operational accountability, capability and human oversight throughout the lifecycle of AI systems. 6.1.2 Implement mechanisms to enable human control and intervention during the operation of the AI system (DEV). 6.1.3 Implement mechanisms to enable human oversight and intervention to address systemic risks and emerging capabilities such as capability evaluation, training, pause, independent oversight, dynamic guardrails and tool/system access controls (DEV). 6.1.4 Ensure appropriate training is provided to anyone overseeing or using AI systems to understand each system's capabilities, limitations and failure modes and when human intervention is needed."

"6.2.1 Define and determine: the criteria or reasons that termination of an AI model or system might need to occur, and at what point intervention should take place the most appropriate role or person to oversee the intervention and decommissioning process whether the model or system is essential to any critical infrastructure or service delivery Assess the risks and impacts of shutting down the AI model or system, including impacts on end‑users and interdependencies with other integrated systems on which the model, data or outputs rely to function. Develop a timeframe and treatment plan to minimise impacts or disruption caused by the decommissioning process. Determine a method to extract data and for the return or deletion of assets. Establish which information should be preserved for record keeping purposes."

The European Union's Artificial Intelligence Act states "High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period in which they are in use."

AI systems can behave unpredictably, especially once they're acting somewhat autonomously when for example generating code, making changes, or taking actions faster than a human might notice something has gone wrong. Without a clearly designated person who has both the authority and the responsibility to stop the system, an organisation risks a dangerous gap in an emergency. Everyone assumes someone else can intervene, or nobody has actually been given the authority to act in time. Naming a specific accountable person (or role) to halt AI activity removes that ambiguity before a crisis happens, so when something does go wrong, the response is immediate and decisive rather than delayed by confusion over who's allowed to pull the plug.

**Reviewer/approver training**

"Delivering effective training in AI across the organisation can build confidence, support AI adoption and ensure accountable people have the right capabilities to perform their roles."

"1.3.1 Evaluate and document the training needed to build broad AI understanding and a culture of accountability across the organisation. Source or deliver training to bridge any identified gaps. Regularly check skills are up‑to‑date as AI development and deployment evolves."

"1.3.2. Evaluate the training needs of accountable people and provide appropriate up‑to‑date training to address gaps, such as those responsible for: meeting legal and regulatory obligations handling personally identifiable information operation, control, intervention or termination of each AI system oversight and monitoring of each AI system procurement, development or deployment of third‑party AI systems safe and responsible development of AI systems (DEV)."

For a more information on the framework please refer to https://www.ai.gov.au/staying-safe-and-responsible/essential-ai-practices/guidance-ai-adoption-implementation-guidance

**AI vendor exit plan**

What happens when the AI fails or changes in an enterprise? Use a documented AI vendor exit plan per critical workflow for example named person/role with authority to disengage, a defined non-AI fallback, and a tested recovery path reviewed before the tool becomes essential to any critical function. AI vendor dependency carries two risks generic vendor risk doesn't: concentrated dependency (a handful of providers sit underneath most enterprise AI features, so an outage propagates immediately) and non-deterministic behaviour (a vendor can silently change model weights, prompts, or safety filters, so validated output can change without warning) If no plan exists then severe consequences can happen such as the 2024 CrowdStrike outage, cost Delta Air Lines an estimated $350 million and triggered a DOT investigation from a single unplanned third-party failure.

For more information on the exit plan please go to https://itecs.ai/insights/ai-vendor-exit-plan-critical-workflows
https://safe.security/resources/blog/2026-guide-to-third-party-risk-management-tprm/
https://www.isms.online/iso-42001/ai-vendor-risk/

**How to actually verify that accountability mechanisms actually work?**

Periodic, risk-weighted sampling of approved AI-assisted changes, independently re-reviewed to confirm the named approver's sign-off reflected genuine scrutiny, not a rubber stamp.

Named-reviewer sign-off can fail silently, identity governance research documents "rubber stamping" as a known failure mode where a required approval exists on paper but provides no real scrutiny, which "completely negates any access controls currently in place." The established discipline for catching this is audit sampling (PCAOB AS 2315) periodically testing a subset of approvals to verify the control is actually working, rather than assuming compliance because a process exists. Reviewers cannot realistically review and check every commit or change carefully so we use audit sampling. Audit sampling is borrowed from financial auditors.

Think of this as the "check that the checkers are actually checking" process, so you have real evidence your accountability structure works".

**Sources**

APRA. (2025). APRA. Apra.Gov.Au. https://www.apra.gov.au/

Schiesel, J. (2025, October 11). Establishing Code Review Standards for AI-Generated Code. MetaCTO; Meta CTO. https://www.metacto.com/blogs/establishing-code-review-standards-for-ai-generated-code

Atlassian. (2020, October 29). The DACI method: how to make better decisions during projects. Inside Atlassian. https://www.atlassian.com/blog/teamwork/daci-method-for-better-project-decisions

Ribeiro, A. (2026, April 22). Australia's CISC tightens cyber reporting rules to capture AI-driven incidents in critical infrastructure. Industrial Cyber. https://industrialcyber.co/regulation-standards-and-compliance/australias-cisc-tightens-cyber-reporting-rules-to-capture-ai-driven-incidents-in-critical-infrastructure/

Article 14: Human Oversight | EU Artificial Intelligence Act. (n.d.). EU Artificial Intelligence Act. Retrieved September 13, 2026, from https://artificialintelligenceact.eu/article/14/

[1] Guidance for AI adoption: implementation guidance | National AI Centre. (2026, May 5). Ai.Gov.Au. https://www.ai.gov.au/staying-safe-and-responsible/essential-ai-practices/guidance-ai-adoption-implementation-guidance

The ITECS Team. (2026, August 21). AI Vendor Exit Plan: Keep Critical Workflows Running. Itecs AI. https://itecs.ai/insights/ai-vendor-exit-plan-critical-workflows

2026 Guide to Third Party Risk Management (TPRM) - Safe Security. (2026, January 21). Safe Security. https://safe.security/resources/blog/2026-guide-to-third-party-risk-management-tprm/

Edwards, M. (2026, April 24). AI Vendor Risk Management: Third Party AI Assessment | ISMS.online. ISMS.Online. https://www.isms.online/iso-42001/ai-vendor-risk/

## Australian Government & NIST AI RMF (National Institute of Standards and Technology, Artificial Intelligence, Risk Management Framework)

These are not only just things I've found and picked up because they were useful, they tie in with NIST AI RMF and adhere to the Australian government frameworks.

| Mechanism | Source | What it requires (per secondary-source description, not direct quote) |
|---|---|---|
| Board-approved AI risk accountability (SOCI/CIRMP, DACI Approver) | National AI Centre, Guidance for AI Adoption: Implementation Guidance, 1.1.1–1.1.2 | "Assign, document and clearly communicate who is accountable across the organisation... for the operation of the AI management system, including: safe and responsible policies, practices and procedures; the development and deployment of every AI system, including ongoing human control and oversight..." Also: "For each accountable person, define and communicate the required competencies and their authority. Ensure they are staffed with appropriately skilled people and have the necessary resources." |
| Named human authority to override/halt AI | National AI Centre, Guidance for AI Adoption: Implementation Guidance, 6.1.2–6.1.3, 6.2.1 | "Implement mechanisms to enable human control and intervention during the operation of the AI system." Also: "Define and determine: the criteria or reasons that termination of an AI model or system might need to occur, and at what point intervention should take place; the most appropriate role or person to oversee the intervention and decommissioning process; whether the model or system is essential to any critical infrastructure or service delivery." |
| Reviewer/approver training | National AI Centre, Guidance for AI Adoption: Implementation Guidance, 1.3.1–1.3.2 | "Evaluate and document the training needed to build broad AI understanding and a culture of accountability across the organisation... Regularly check skills are up‑to‑date as AI development and deployment evolves." Also: "Evaluate the training needs of accountable people and provide appropriate up‑to‑date training to address gaps, such as those responsible for: meeting legal and regulatory obligations... operation, control, intervention or termination of each AI system; oversight and monitoring of each AI system..." |

| Mechanism | NIST AI RMF clause | What it requires |
|---|---|---|
| Assisted-by: tagging (AI tool disclosure per commit) | GOVERN 2.1 | "Roles and responsibilities and lines of communication... are documented and clear to individuals and teams" |
| Signed-off-by: DCO (human certifies accountability) | GOVERN 2.1, GOVERN 2.3 | Named human accountability; "Executive leadership... takes responsibility for decisions about risks" |
| NBN-customized DCO text (secure coding/compliance certification) | GOVERN 1.2 | "Characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices" |
| Sigstore/gitsign (cryptographic identity verification) | GOVERN 1.4 | "Risk management process and its outcomes are established through transparent policies, procedures, and other controls" |
| SLSA build provenance (tamper-proof build receipts) | MAP 4.1, MEASURE 2.1 | Mapping technology/legal risks of components; documenting "test sets, metrics, and details about the tools used during TEVV" |
| CODEOWNERS + mandatory named reviewers | GOVERN 3.2, MAP 3.5 | "Policies and procedures... differentiate roles and responsibilities for human-AI configurations and oversight"; human oversight processes defined "in accordance with organizational policies from the GOVERN function" |
| Risk-tiered review gates (high-risk changes escalate to second reviewer) | GOVERN 3.2 | Same clause, differentiated oversight based on configuration/risk, directly supporting your Human-Decision vs. Human-Verification split |
| SOCI Act / CIRMP board-approved risk program | GOVERN 1.1, GOVERN 2.3 | "Legal and regulatory requirements involving AI are understood, managed, and documented"; executive/board-level responsibility for AI risk decisions |
| DACI / RACI single-Accountable-owner rule | GOVERN 2.1, GOVERN 2.3 | Documented, clear roles; leadership accountability for AI-related decisions |
| License/copyright scanning (FOSSA, Snyk, Black Duck) | GOVERN 6.1, MAP 4.1 | "Policies and procedures... address AI risks associated with third-party entities, including risks of infringement of a third-party's intellectual property"; mapping legal risks of third-party components |
| AI vendor exit plan (disengagement authority, non-AI fallback) | GOVERN 6.2 | "Contingency processes... for failures or incidents in third-party data or AI systems deemed to be high-risk" |
| Periodic sampling audit of approver sign-offs | Measure 2.8 | "Risks associated with transparency and accountability... are examined and documented" |

National Institute of Standards and Technology. (2023, July 12). AI Risk Management Framework. NIST. https://www.nist.gov/itl/ai-risk-management-framework

## How are token budgets and API usage tracked across a team?

Companies do not publish such internal information so things like thresholds and what companies set as token budgets remain thin.

### Usage Mechanisms

**Native Vendor Usage Tracking**

Enable native admin/analytics tracking on every AI tool in use, reviewed against a baseline (30-60 days of usage data) before setting any budget.

Every major AI coding tool now ships built-in usage tracking at the account/workspace level. Anthropic's Claude Console provides Usage and Cost pages by workspace, model, and API key, with an Admin API (usage_report, cost_report) and a purpose-built Claude Code Analytics API reporting per-developer sessions, cost, and tool accept/reject rates. GitHub Copilot's enterprise usage dashboards report at org/repo/user level with "cost centers" for chargeback mapping. Cursor's Analytics API reports per-user requests and spends with configurable soft-limit alerts at 50/80/100%. This is the minimum viable control, it requires no additional infrastructure, only enabling and reviewing what the vendor already provides.

**LLM Gateway**

Deploy an LLM gateway (Cloudflare AI Gateway or LiteLLM) with SSO/OIDC identity attached to every request, giving per-developer attribution regardless of which underlying platform bills the usage.

Native vendor tracking often stops at the API-key or workspace level, not the individual developer. It is a real gap when multiple developers share a key or when usage flows through cloud platforms (Bedrock, Vertex, Foundry) that don't report back to the vendor at all. The fix is routing traffic through an LLM gateway that ties usage to enterprise identity. Cloudflare's AI Gateway extracts a user's identity from the JWT issued at Cloudflare Access login and attaches it as metadata on every AI request, making per-user consumption visible without a spoofable custom header. LiteLLM (open-source) does the same via SSO/SCIM-issued virtual keys, tracking spend hierarchically by organization, team, user, and project, and enforcing hard/soft budgets at any of those levels. Anthropic's own documentation names LiteLLM as the tool "several large enterprises reported using" specifically because Claude Code doesn't send usage metrics back from cloud-billed deployments.

**Adopt FinOps Tokenomics (Emerging practice)**

Adopt the FinOps Tokenomics model wholesale, name an accountable owner, baseline usage for 30-60 days, then set budgets and alerts off that baseline rather than an arbitrary number.

Cloud FinOps (the discipline of allocating and governing cloud spend) has been directly adapted to AI token costs under the name "Tokenomics" or "FinOps for AI," now formalised by the FinOps Foundation. Per the Foundation's State of FinOps 2026 survey, 98% of practitioners now manage AI spend, up from 31% in 2024 but the same survey found granular AI-spend monitoring is the single most-requested capability, unmet by commercial tooling. The Foundation's Tokenomics guidance is the closest thing to an actual methodology: it prescribes a single named accountable owner (via a FinOps-led, Platform-Engineering-led, or AI Center of Excellence model), a 30-60 day usage baseline before setting any budget, budgets set at 110-120% of that baseline with alerts at 80% and 100%, and API-key lifecycle governance (provisioning with cost-center tagging, naming conventions, rotation, and audit for orphaned keys) as the foundational control.

**Route AI token usage to SIEM (Security Information and Event Management)**

Pipe AI budget and token usage towards SIEM. When someone eventually needs proof that AI usage is being governed and monitored (an auditor, a regulator), that proof already exists in a system built for exactly that purpose.

A SIEM is a system organisations use to collect logs and events from everywhere across their infrastructure (firewalls, servers, applications, login systems, etc.) into one central place, so security and compliance teams can search, alert on, and review that activity. NBN, as a telecom critical-infrastructure operator, almost certainly already runs a SIEM for its broader security monitoring. The token tracking mechanism previously mentioned only lives inside the AI tools dashboard, separate from NBN for example. If those budget-limit and anomaly events are just sitting in a vendor dashboard nobody centrally reviews, it is not governed. Having it routed to SIEM means that you have a timestamped, centrally-logged, continuously-collected record, evidence NIST's Measure/Manage functions are asking for, even though neither mentions tokens.

**Sources**

Manage costs effectively - Claude Code Docs. (2025). Claude.Com; Claude Code Docs. https://code.claude.com/docs/en/costs

GitHub.com Help Documentation. (n.d.). GitHub Docs. Retrieved September 13, 2026, from https://docs.github.com/

Cursor. (2026, September 10). Cursor. https://cursor.com/changelog

Tokenomics: Managing AI Value in SaaS Model Token Costs. (2026). Finops.Org. https://www.finops.org/wg/token-economics-saas/

Cloudflare. (2026). Your AI bill is out of control. Cloudflare can fix it now. Cloudflare Blog. https://blog.cloudflare.com/ai-gateway-spend-limits/

LiteLLM. (n.d.). LiteLLM Documentation: https://docs.litellm.ai/

## Licensing and Copyright

AI models are trained on large amounts of code, including copyleft-licensed code. If an AI tool reproduces a close match of that training data, you may end up shipping someone else's licensed code without complying with its license, and you might not even know it happened, since the AI presents it as a fresh suggestion.

The scanning problem is subtler than people assume. GitHub Copilot has a built-in "duplicate detection filter" that blocks suggestions matching public code but it only catches near-identical matches. Rename a few variables and it passes right through, which is exactly how license contamination slips into codebases undetected.

### Licensing and Copyright mechanisms

**Similarity scanning**

Incorporate license/snippet-similarity scanning as its own checkpoint, distinct from security scanning. Tools like FOSSA, Snyk, Black Duck, or GitHub Advanced Security compare AI-generated code against known open-source snippets, not just declared dependencies (a critical distinction, since AI-copied code shows up in neither your dependency list nor a license header, only snippet-matching tools catch it).

**Duplicate detection filters**

Enable duplicate-detection filters on whatever AI tool you standardize on, and require it as policy.

**Legal implications**

Treat license/copyright risk as an open legal question, not a solved compliance checkbox the similarity-scanning and duplicate-detection mechanisms mitigate practical contamination risk today, but they don't resolve the underlying, still-litigated question of who owns or can license AI-generated code.

For context: Doe v. GitHub (filed 2022, against GitHub/Microsoft/OpenAI) alleges Copilot reproduces licensed code without preserving attribution or license terms. Most claims were dismissed by 2024, but two survive: a breach-of-contract theory (that open-source licenses are contracts Copilot allegedly violates) and a DMCA §1202(b) claim now on appeal at the Ninth Circuit, with oral arguments heard February 2026 and a ruling still pending. That ruling could significantly widen or narrow legal exposure for every AI coding tool, not just Copilot. This is a live, moving target, not settled law. There's a separate, deeper legal question underneath this: whether AI-generated code can be copyrighted at all. Thaler v. Perlmutter (D.C. Circuit, March 2025) affirmed that US copyright law requires a human author stating "all eligible work [must] be authored in the first instance by a human being." This means purely AI-generated code may not be protectable by copyright in the first place. (GCC banned LLM-derived contributions specifically to protect its GPLv3 copyright-enforcement chain, since AI output has no human author to hold the license against).

**Sources**

Doe, et al. v. Github, Inc., et al., 24-7700 - CourtListener.com. (2026). CourtListener. https://www.courtlistener.com/docket/69495342/doe-et-al-v-github-inc-et-al/

Thaler v. Perlmutter, No. 23-5233 (D.C. Cir. 2025). (2025). Justia Law. https://law.justia.com/cases/federal/appellate-courts/cadc/23-5233/23-5233-2025-03-18.html

## GAPS

AI Code review skills are ambiguous and not quite fully agreed upon as a whole from large enterprises due to a lack of information.

Sampling audit implementation is undefined. The methodology establishes that approved AI-assisted changes should be periodically re-reviewed to verify genuine scrutiny, but does not yet define sample size, frequency, or critically that the auditor must be independent of the original approver. Without independence, the check-the-checkers mechanism risks becoming exactly the rubber-stamp problem it's meant to catch.

AI licensing and copyright legalities are open and not yet finalised. Once they are it can drastically change the methodology.

Attribution and named-reviewer accountability exist, but nothing requires a security scan on AI-generated code before it's accepted. A named human reviewer is not a meaningful control on its own. Veracode's 2025 research found 45% of AI-generated code samples introduced OWASP Top-10 vulnerabilities, so review without a mandatory SAST/dependency scan at the merge gate leaves this risk largely unchecked.

Attribution data (the Assisted-by tag, signed provenance) and accountability structure (the named approver) exist as records, but nothing currently requires the incident/RCA process to actually pull them. When something breaks, the root-cause investigation should query the failing commit's Assisted-by tag and named approver as a first step otherwise the attribution data sits unused rather than functioning as a real accountability mechanism during failure response.

There is no peer-reviewed research, no standards-body clause, and no second independent methodology to cross-check the FinOps Foundation's approach against unlike the AI accountability requirements.
