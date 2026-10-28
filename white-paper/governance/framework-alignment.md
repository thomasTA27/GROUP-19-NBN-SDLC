# Framework Alignment: Australian Government and NIST AI RMF

> Maps mechanisms described in `attribution.md`, `accountability.md`, and `token-licensing-gaps.md` to the Australian Government National AI Centre guidance and the NIST AI Risk Management Framework. Kept as one file because several mechanisms (e.g. license/copyright scanning) don't sort cleanly into attribution or accountability, and this mapping is cross-cutting rather than belonging to either.

These mechanisms tie directly into NIST AI RMF and adhere to Australian Government frameworks.

## Australian Government (National AI Centre) alignment

| Mechanism | Reference | What it requires (per source description, not direct quote unless marked) |
|---|---|---|
| Named accountability for AI systems (DACI Approver; board approval comes from SOCI, not this guidance) | [5] | "Assign, document and clearly communicate who is accountable across the organisation... for the operation of the AI management system, including: safe and responsible policies, practices and procedures; the development and deployment of every AI system, including ongoing human control and oversight..." Also: "For each accountable person, define and communicate the required competencies and their authority. Ensure they are staffed with appropriately skilled people and have the necessary resources." |
| Named human authority to override/halt AI | [5] | "Implement mechanisms to enable human control and intervention during the operation of the AI system." Also: "Define and determine: the criteria or reasons that termination of an AI model or system might need to occur, and at what point intervention should take place; the most appropriate role or person to oversee the intervention and decommissioning process; whether the model or system is essential to any critical infrastructure or service delivery." |
| Reviewer/approver training | [5] | "Evaluate and document the training needed to build broad AI understanding and a culture of accountability across the organisation... Regularly check skills are up‑to‑date as AI development and deployment evolves." Also: "Evaluate the training needs of accountable people and provide appropriate up‑to‑date training to address gaps, such as those responsible for: meeting legal and regulatory obligations... operation, control, intervention or termination of each AI system; oversight and monitoring of each AI system..." |

## NIST AI RMF alignment

| Mechanism | NIST AI RMF clause | What it requires |
|---|---|---|
| Assisted-by: tagging (AI tool disclosure per commit) | GOVERN 2.1 | "Roles and responsibilities and lines of communication... are documented and clear to individuals and teams" |
| Signed-off-by: DCO (human certifies accountability) | GOVERN 2.1, GOVERN 2.3 | Named human accountability; "Executive leadership... takes responsibility for decisions about risks" |
| NBN-customised DCO text (secure coding/compliance certification) | GOVERN 1.2 | "Characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices" |
| Sigstore/gitsign (cryptographic identity verification) | GOVERN 1.4 | "Risk management process and its outcomes are established through transparent policies, procedures, and other controls" |
| SLSA build provenance (tamper-proof build receipts) | MAP 4.1, MEASURE 2.1 | Mapping technology/legal risks of components; documenting "test sets, metrics, and details about the tools used during TEVV" |
| CODEOWNERS + mandatory named reviewers | GOVERN 3.2, MAP 3.5 | "Policies and procedures... differentiate roles and responsibilities for human-AI configurations and oversight"; human oversight processes defined "in accordance with organizational policies from the GOVERN function" |
| Risk-tiered review gates (high-risk changes escalate to second reviewer) | GOVERN 3.2 | Same clause, differentiated oversight based on configuration/risk, directly supporting the Human-Decision vs. Human-Verification split |
| SOCI Act risk management program (TSRMP Rules for carriers) | GOVERN 1.1, GOVERN 2.3 | "Legal and regulatory requirements involving AI are understood, managed, and documented"; executive/board-level responsibility for AI risk decisions |
| DACI / RACI single-Accountable-owner rule | GOVERN 2.1, GOVERN 2.3 | Documented, clear roles; leadership accountability for AI-related decisions |
| License/copyright scanning (FOSSA, Snyk, Black Duck) | GOVERN 6.1, MAP 4.1 | "Policies and procedures... address AI risks associated with third-party entities, including risks of infringement of a third-party's intellectual property"; mapping legal risks of third-party components |
| AI vendor exit plan (disengagement authority, non-AI fallback) | GOVERN 6.2 | "Contingency processes... for failures or incidents in third-party data or AI systems deemed to be high-risk" |
| Periodic sampling audit of approver sign-offs | MEASURE 2.8 | "Risks associated with transparency and accountability... are examined and documented" |

Reference: [13]
