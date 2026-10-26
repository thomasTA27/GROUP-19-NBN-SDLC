# Sources: Governance, Attribution and Token Accounting Research

Numbered to match the [n] reference markers used across `governance-attribution.md`, `governance-accountability.md`, `governance-token-licensing-gaps.md`, and `governance-framework-alignment.md` (the reference numbers are shared across all files).

[1] AI Coding Assistants: The Linux Kernel documentation (v7.2). (2026). Kernel.Org. https://kernel.org/doc/html/v7.2/process/coding-assistants.html
Note: verified directly on 25 October 2026. The AGENT_NAME:MODEL_VERSION format, placeholder definitions, Claude example, Signed-off-by rules and human responsibilities all match the v7.2 page verbatim. The in-development docs (7.3.0) at https://docs.kernel.org/process/coding-assistants.html now show `Assisted-by: LLM [TOOL1] [TOOL2]` with example `Assisted-by: LLM coccinelle sparse`.

[2] Linux Foundation. (n.d.). Developer Certificate of Origin (DCO). LF Best Practices. https://bestpractices.linuxfoundation.org/ip/contribution-mechanisms-dco.html
Note: replaces https://wiki.linuxfoundation.org/dco, which could not be reached from this environment. This Linux Foundation page quotes clause (a) verbatim, describes Signed-off-by as the traditional way to record a DCO sign-off, and names https://developercertificate.org/ as the official DCO text. Clause (a) wording also matches the Eclipse (https://www.eclipse.org/legal/DCO.html) and GitLab (https://docs.gitlab.com/legal/developer_certificate_of_origin/) copies.

[3] GitHub, sigstore/gitsign: Keyless Git signing using Sigstore. (2023). GitHub. https://github.com/sigstore/gitsign

[4] SLSA. (2023). Security levels (SLSA v1.0 specification). https://slsa.dev/spec/v1.0/levels

[5] Guidance for AI adoption: implementation guidance | National AI Centre. (2026, May 5). Ai.Gov.Au. https://www.ai.gov.au/staying-safe-and-responsible/essential-ai-practices/guidance-ai-adoption-implementation-guidance
Note: quotes checked against the PDF version (https://www.ai.gov.au/sites/default/files/2026-07/Guidance-for-AI-adoption-implementation-guidance_0_0.pdf). The guidance does not mention board or senior executive sign-off.

[6] Schiesel, J. (2026, July 8). Establishing Code Review Standards for AI-Generated Code. MetaCTO. https://www.metacto.com/blogs/establishing-code-review-standards-for-ai-generated-code
Note: consultancy blog that links to MetaCTO's own services. The lane model is the author's recommendation; it names no companies and gives no adoption data. Page date shown as 8 July 2026 when checked (previously recorded as 11 October 2025).

[7] MinterEllison. (n.d.). APRA's final guidance on CPS 230: What you need to know. https://www.minterellison.com/articles/apras-final-guidance-on-cps-230
Note: replaces the APRA homepage, which didn't support the specific claim. The phrase "documented decision, approved by a named Accountable person" previously shown in quotes does not appear in this source; the module now paraphrases the FAR Accountable Person example instead.

[8] Atlassian. (2020, October 29). The DACI method: how to make better decisions during projects. Inside Atlassian. https://www.atlassian.com/blog/teamwork/daci-method-for-better-project-decisions

[9] European Commission. (n.d.). Article 14: Human oversight. AI Act Service Desk. https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-14

[10] The ITECS Team. (2026, August 21). AI Vendor Exit Plan: Keep Critical Workflows Running. Itecs AI. https://itecs.ai/insights/ai-vendor-exit-plan-critical-workflows
Note: vendor blog (managed IT and AI services). Does not mention CrowdStrike or Delta.

[11] 2026 Guide to Third Party Risk Management (TPRM). Safe Security. (2026, January 21). Safe Security. https://safe.security/resources/blog/2026-guide-to-third-party-risk-management-tprm/
Note: could not be fetched to verify the concentration and silent-change claims, so the module now cites [12] only for those. No longer cited inline.

[12] Edwards, M. (2026, April 24). AI Vendor Risk Management: Third Party AI Assessment | ISMS.online. ISMS.Online. https://www.isms.online/iso-42001/ai-vendor-risk/
Note: compliance platform vendor.

[13] National Institute of Standards and Technology. (2023, July 12). AI Risk Management Framework. NIST. https://www.nist.gov/itl/ai-risk-management-framework

[14] Manage costs effectively. Claude Code Docs. (2025). Claude.Com; Claude Code Docs. https://code.claude.com/docs/en/costs

[15] GitHub.com Help Documentation. (n.d.). GitHub Docs. Retrieved September 13, 2026, from https://docs.github.com/

[16] Cursor. (2026, September 10). Cursor. https://cursor.com/changelog

[17] Ribeiro, A. (2026, April 22). Australia's CISC tightens cyber reporting rules to capture AI-driven incidents in critical infrastructure. Industrial Cyber. https://industrialcyber.co/regulation-standards-and-compliance/australias-cisc-tightens-cyber-reporting-rules-to-capture-ai-driven-incidents-in-critical-infrastructure/
Note: not inline-cited; supporting background for the Australian Laws section.

[18] FinOps Foundation. (2026, June 3). Tokenomics: Managing AI Value in SaaS Model Token Costs. Finops.Org. https://www.finops.org/wg/token-economics-saas/
Note: verified directly on 25 October 2026. Confirms the three ownership models, "a named individual who is accountable for AI cost visibility", the 30 to 60 day baseline, budgets at 110 to 120% of baseline, alerts at 80% and 100%, and API key governance as "the foundational control layer for everything else" (cost centre provisioning, naming conventions, rotation, orphaned key audits). No formal authors; acknowledgments thank contributors from Shutterstock, AWS, Wayfair, Superhuman, the FinOps Foundation and Align Technology. Does not contain the State of FinOps survey figures; those are cited to [32] and [33].

[19] Cloudflare. (2026, June 5). Your AI bill is out of control. Cloudflare can fix it now. Cloudflare Blog. https://blog.cloudflare.com/ai-gateway-spend-limits/

[20] LiteLLM. (n.d.). LiteLLM Documentation. https://docs.litellm.ai/

[21] Doe, et al. v. Github, Inc., et al., 24-7700. CourtListener.com. (2026). CourtListener. https://www.courtlistener.com/docket/69495342/doe-et-al-v-github-inc-et-al/

[22] Thaler v. Perlmutter, No. 23-5233 (D.C. Cir. 2025). (2025). Justia Law. https://law.justia.com/cases/federal/appellate-courts/cadc/23-5233/23-5233-2025-03-18.html

[23] Why Managers Rubberstamp User Access Reviews. (2026). Clarity Security Blog. https://claritysecurity.com/clarity-blog/why-managers-rubberstamp-uars/
Note: vendor blog (Clarity Security sells identity governance tooling). The quoted phrase is a verbatim match. The general rubber-stamping failure mode is also described by other identity governance publications (CyberArk, OASIS Security, SC World), but this specific quote traces to Clarity Security alone.

[24] AS 2315: Audit Sampling. (n.d.). Public Company Accounting Oversight Board (PCAOB). https://pcaobus.org/oversight/standards/auditing-standards/details/AS2315
Note: official regulator source for financial statement audits. Amended via PCAOB Release No. PCAOB-2025-01, with the amended version effective December 15, 2026; confirm which version applies if citing after that date.

[25] Veracode. (2025, July 30). AI-Generated Code Poses Major Security Risks in Nearly Half of All Development Tasks, Veracode Research Reveals [2025 GenAI Code Security Report]. Business Wire. https://www.businesswire.com/news/home/20250730694951/en/AI-Generated-Code-Poses-Major-Security-Risks-in-Nearly-Half-of-All-Development-Tasks-Veracode-Research-Reveals
Note: Veracode tested 100+ large language models across 80 curated coding tasks and found AI-generated code introduces security vulnerabilities, including OWASP Top 10 flaws, in 45% of cases.

[26] Fortune. (2024, August 9). [Article on Delta's reported CrowdStrike outage losses; exact headline not recorded]. https://fortune.com/2024/08/09/delta-380-million-lost-revenue-crowdstrike-outage-cancel-thousands-flights
Note: $380 million lost revenue plus an estimated $170 million in costs; Delta had earlier projected about $500 million. Replaces the previous uncited $350 million figure.

[27] Australian Government. (2010). Carrier licence granted to NBN Co Limited (ACN 136 533 741). data.gov.au. https://data.gov.au/data/dataset/52db5013-1a63-4d14-90f8-c19fb6289695/resource/b0aedea9-6dcd-4a57-962f-017451b87588/download/licence-287-nbn-co-limited.pdf

[28] Explanatory Statement: Security of Critical Infrastructure (Telecommunications Security and Risk Management Program) Rules 2025. (2025, March 11). Federal Register of Legislation. https://legislation.gov.au/F2025L00325/asmade/2025-03-11/es/original/pdf

[29] Cyber and Infrastructure Security Centre. (n.d.). Responsible entity risk management program annual report. https://www.cisc.gov.au/resources/online-forms/responsible-entity-risk-management-program-annual-report
Note: covers Part 2A and Part 2AA responsible entities; does not mention telecommunications specifically.

[30] Allens. (2025, March). Key regulatory changes for the telecommunications sector. https://www.allens.com.au/insights-news/insights/2025/03/key-regulatory-changes-for-the-telecommunications-sector/
Note: law firm commentary. Covers the 4 April 2025 move of telecommunications security into the SOCI Act, the TSRMP Rules, and carriers' annual attestation.

[31] Sigstore. (n.d.). Signing overview. Sigstore Documentation. https://docs.sigstore.dev/signing/overview/

[32] FinOps Foundation. (2026). State of FinOps 2026. https://data.finops.org/
Note: states "98% of respondents now manage AI spend (up from 63% in 2025 and 31% in 2024)" and ranks "Granular monitoring of AI spend (tokens, LLM requests and GPU utilization)" first among desired tool features. It does not say commercial tooling fails to meet this; that claim was removed from the module.

[33] Linux Foundation. (2026, February 19). State of FinOps Survey: AI Value and Skills Top Priorities as FinOps Matures Across Technology Value [Press release]. https://www.linuxfoundation.org/press/state-of-finops-survey-ai-value-and-skills-top-priorities-as-finops-matures-across-technology-value-98-manage-ai-90-saas-64-licensing-48-data-center-1
Note: confirms 98%, "up from 31% just two years ago", from 1,192 respondents.
