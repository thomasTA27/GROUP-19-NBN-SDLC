# Accountability

## What is code accountability?

It is asking who is responsible for the code if something breaks.

## Who is accountable for it if it fails?

### Accountability mechanisms

In open source, the Linux kernel requires the human submitter to take "full responsibility for the contribution" regardless of AI involvement [1]. MetaCTO, an AI consultancy, similarly argues that merge decisions on sensitive code belong to accountable humans [6]. At the organisational level, the National AI Centre states: "Overall, your organisation is ultimately accountable for how and where AI is used, AI complexity can create gaps where no one takes clear responsibility for outcomes" [5].

**Code ownership and review structures** 

[The tier structure could be used but the specifics will be determined by the company itself]

CODEOWNERS with mandatory named reviewers: owners must review and approve every change to their part of the codebase. [No source yet for this being reinforced specifically for AI-generated code.]

MetaCTO proposes a lane-based review model [6]. This is the author's recommendation; the article names no companies and gives no adoption data. "Red lane" work (auth, authorization, cryptography, payments, PII, database migrations, public APIs, infrastructure) requires "senior approval, security review, and an explicit threat model or migration plan". Low-risk "Green lane" work needs "[s]tandard reviewer approval, automated checks, and no new trust boundary." The article also states: "An AI reviewer can be useful, but it is not an approval authority" [6].

**Proposed tier definition.** The MetaCTO model above lists subsystems, but a subsystem list misses changes that affect those subsystems indirectly. This methodology defines the tier by what the code can cause, not by what kind of code it is.

A change is lower risk only if it cannot affect who can read or write data, cannot reach storage, the network, or the file system, cannot change what input is accepted, and cannot alter the outcome of any action that does those things. In practice that means presentation and formatting code calling only already-reviewed handlers. Everything else is higher risk, including anything the developer is unsure about.

The tier is set when the work is scoped, before anything is written. A lower-risk classification needs its reason recorded; a higher-risk classification needs no justification.

Example: a button whose disabled state is the only thing preventing an action is higher risk, because removing it changes the outcome of an action that reaches storage. A subsystem list would classify it as UI.

**Australian Laws**

NBN Co holds a carrier licence under the Telecommunications Act 1997 [27]. Since 4 April 2025, telecommunications security obligations sit in the SOCI Act, and carriers must maintain a risk management program under the Security of Critical Infrastructure (Telecommunications Security and Risk Management Program) Rules 2025 (TSRMP), which "replicate and enhance the existing provisions within the CIRMP Rules" [28] [30]. Carriers must provide an annual attestation on compliance with their program [30]. For Part 2A risk management programs, the Cyber and Infrastructure Security Centre states the annual report "must be approved by the Entity's board, council or other governing body" [29]. That page doesn't mention telecommunications specifically, so applying board approval to NBN's TSRMP is our inference from both being Part 2A programs.

APRA's CPS 230 (financial services only) does not apply to NBN, but its pattern of tying specific decisions to a named accountable person (for example, a decision that an operation is not critical must be approved by a FAR Accountable Person) is a useful design template NBN could adapt into its own SOCI-aligned governance, with no obligation to follow CPS 230 itself [7].

Our reading: SOCI obligations sit with the organisation, which establishes rules and practices (like secure coding practices) for employees to follow; they are not an obligation on every individual. Staff follow NBN's internal policy implementing SOCI, not the Act directly.

[For us our methodology could be framed as the mechanism that translates board-level SOCI accountability down into practice. Things like checkpoint structure showing accountability]

**DACI framework (Driver, Approver, Contributors, Informed) and the single Approver rule**

Atlassian uses DACI internally ("At Atlassian, we make use of a structured framework") as its method for team decisions, giving the Approver "the final say on which path the team should take" [8]. Atlassian's rule is that the Approver "should be just one person, not several" [8], which maps directly to who is answerable for the code change. Related responsibility-assignment models (RACI, RASCI, RAPID) exist but aren't covered by this source.

*How to use the DACI framework* [8]

Four roles (exactly one Approver, everyone else can be multiple people):

- Driver: creates the decision plan, lays out the problem, keeps the team moving
- Approver: the single person who makes the final call
- Contributors: subject-matter experts who weigh the options' pros and cons
- Informed: people who need to know the direction but don't contribute to the decision, such as managers of adjacent teams

Use it for big decisions with effects across teams, not minor ones.

Essential sections to create one:

- Details: status, impact, who holds each role, due date, eventual outcome
- Background: context, related past decisions, constraints
- Relevant Data: evidence or feedback informing the decision
- Options Considered: each option with pros, cons, and cost or resource estimate
- Action Items: open questions still needing answers
- Outcome: the final decision and why, recorded for future reference

Process, in order:

1. Assign roles (you're usually the Driver)
2. Fill in Details, Background, Relevant Data, and Options, including a due date
3. Share with everyone in the roles and collect input from Contributors
4. Approver makes the final call
5. Document and broadly share the Outcome so it's easy to find later

This keeps one accountable decision-maker (the Approver) while still surfacing expert input (Contributors) and keeping stakeholders aware (Informed), avoiding both decision by committee and blindsiding people who needed a heads-up.

**Named accountability for AI systems**

"To ensure AI systems perform as required and obligations are met, assign, document and clearly communicate who is accountable across the organisation (including contractors and third‑party providers/systems) for the operation of the AI management system, including: safe and responsible policies, practices and procedures; the development and deployment of every AI system, including ongoing human control and oversight; oversight of the development and use of AI systems by third parties; testing of AI systems across the organisation; oversight of concerns, challenges and requests for redress; the performance and continual improvement of the AI management system" [5].

"For each accountable person, define and communicate the required competencies and their authority. Ensure they are staffed with appropriately skilled people and have the necessary resources" [5].

The guidance also requires "documented deployment authorisation and rationale from the accountable person" [5]. It does not require board or executive sign-off; for NBN, board-level approval comes from SOCI (see Australian Laws).

Our argument: AI-assisted development creates risks no single developer or team can be expected to catch or own alone. A bad AI-assisted deployment on critical infrastructure (an outage, a security breach, a compliance failure) can affect the entire organisation and the public it serves, not just the team that shipped the change. Combining a named accountable person [5] with the board-approved SOCI program puts formal accountability with people who have the authority and visibility to weigh that organisation-wide risk, instead of leaving it to whoever happened to click "approve" on a pull request. It also creates a clear, unavoidable point of responsibility: if something goes wrong, there's no ambiguity about who was supposed to be watching, which matters for an organisation operating critical national infrastructure.

**Named human authority to override or halt AI (kill switch)**

"Maintain operational accountability, capability and human oversight throughout the lifecycle of AI systems. Implement mechanisms to enable human control and intervention during the operation of the AI system. Implement mechanisms to enable human oversight and intervention to address systemic risks and emerging capabilities such as capability evaluation, training, pause, independent oversight, dynamic guardrails and tool/system access controls. Ensure appropriate training is provided to anyone overseeing or using AI systems to understand each system's capabilities, limitations and failure modes and when human intervention is needed" [5].

"Define and determine: the criteria or reasons that termination of an AI model or system might need to occur, and at what point intervention should take place; the most appropriate role or person to oversee the intervention and decommissioning process; whether the model or system is essential to any critical infrastructure or service delivery. Assess the risks and impacts of shutting down the AI model or system, including impacts on end‑users and interdependencies with other integrated systems on which the model, data or outputs rely to function. Develop a timeframe and treatment plan to minimise impacts or disruption caused by the decommissioning process. Determine a method to extract data and for the return or deletion of assets. Establish which information should be preserved for record keeping purposes" [5]. (List labels a., b., c. omitted.)

The EU AI Act states: "High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period in which they are in use" (Article 14(1)), and requires the ability "to intervene in the operation of the high-risk AI system or interrupt the system through a 'stop' button or a similar procedure that allows the system to come to a halt in a safe state" (Article 14(4)(e)) [9]. Article 14 applies to high-risk AI systems under EU law. It does not bind NBN and is cited as a reference point only.

Our argument: AI systems can behave unpredictably, especially once acting somewhat autonomously, generating code, making changes, or taking actions faster than a human might notice something has gone wrong. Without a clearly designated person with both the authority and responsibility to stop the system, an organisation risks a dangerous gap in an emergency: everyone assumes someone else can intervene, or nobody has actually been given the authority to act in time. Naming a specific accountable person or role to halt AI activity removes that ambiguity before a crisis happens, so the response is immediate and decisive instead of delayed by confusion over who's allowed to pull the plug.

**Reviewer/approver training**

"Delivering effective training in AI across the organisation can build confidence, support AI adoption and ensure accountable people have the right capabilities to perform their roles" [5].

"Evaluate and document the training needed to build broad AI understanding and a culture of accountability across the organisation. Source or deliver training to bridge any identified gaps. Regularly check skills are up‑to‑date as AI development and deployment evolves" [5].

"Evaluate the training needs of accountable people and provide appropriate up‑to‑date training to address gaps, such as those responsible for: meeting legal and regulatory obligations; handling personally identifiable information; operation, control, intervention or termination of each AI system; oversight and monitoring of each AI system; procurement, development or deployment of third‑party AI systems; safe and responsible development of AI systems" [5].

**AI vendor exit plan**

What happens when the AI fails or changes in an enterprise? ITECS, a managed IT and AI services firm, recommends requiring "an exit plan before an AI model or platform becomes essential", with named decision owners for each trigger, a manual operating path that moves work "into a visible manual queue without continuing uncertain AI calls", and scheduled failover exercises [10].

ISMS.online, a compliance platform vendor, identifies two ways AI vendor risk differs from classic supplier risk [12]. First, concentration: "A handful of foundation model providers now sit underneath thousands of AI features", so outages and policy changes "propagate immediately into your products and customer journeys". Second, silent change: a vendor "can change model weights, system prompts, safety filters, and training data without notice", so "[t]he output you validated in testing may not be the output your customer sees in production six months later."

A non-AI example of what an unplanned single-vendor failure costs: after the July 2024 CrowdStrike outage, Delta Air Lines reported $380 million in lost revenue plus an estimated $170 million in costs, and the US Department of Transportation opened an investigation into Delta's handling of the disruption [26].

**How to actually verify that accountability mechanisms work**

Periodic, risk-weighted sampling of approved AI-assisted changes, independently re-reviewed to confirm the named approver's sign-off reflected genuine scrutiny and not a rubber stamp.

Named-reviewer sign-off can fail silently. Identity governance vendor Clarity Security describes "rubber stamping" as a failure mode where a required approval exists on paper but provides no real scrutiny, and states that it "completely negates any access controls currently in place" [23]. Financial auditing has an established technique for testing whether a control works without checking every item: audit sampling, which PCAOB AS 2315 defines as "the application of an audit procedure to less than 100 percent of the items within an account balance or class of transactions for the purpose of evaluating some characteristic of the balance or class" [24]. AS 2315 is a financial audit standard; applying it to code review approvals is our adaptation. Reviewers cannot realistically review and check every commit or change carefully, so we use audit sampling, a technique borrowed from financial auditors.

Think of this as checking that the checkers are actually checking, so you have real evidence your accountability structure works.

## Framework alignment

See `framework-alignment.md` for how these mechanisms map to the Australian Government National AI Centre guidance and the NIST AI RMF.
