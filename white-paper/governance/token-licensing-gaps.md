# Token Budgets, Licensing and Gaps

> Attribution and accountability mechanisms have moved to their own files: `attribution.md` and `accountability.md`. The NIST AI RMF and Australian Government framework-mapping tables live in `framework-alignment.md`. This file holds what's left of the original combined research document.

## How are token budgets and API usage tracked across a team?

Companies don't publish this internal information, so thresholds and actual token budgets remain thin.

### Usage mechanisms

**Native vendor usage tracking**

Enable native admin/analytics tracking on every AI tool in use, reviewed against a baseline (30 to 60 days of usage data) before setting any budget.

Every major AI coding tool now ships built-in usage tracking at the account/workspace level. Anthropic's Claude Console provides Usage and Cost pages by workspace, model, and API key, with an Admin API (usage_report, cost_report) and a purpose-built Claude Code Analytics API reporting per-developer sessions, cost, and tool accept/reject rates [14]. GitHub Copilot's enterprise usage dashboards report at org/repo/user level with "cost centers" for chargeback mapping [15]. Cursor's Analytics API reports per-user requests and spend with configurable soft-limit alerts at 50/80/100% [16]. This is the minimum viable control: it needs no additional infrastructure, only enabling and reviewing what the vendor already provides.

**LLM gateway**

Deploy an LLM gateway (Cloudflare AI Gateway or LiteLLM) with SSO/OIDC identity attached to every request, giving per-developer attribution regardless of which underlying platform bills the usage.

Native vendor tracking often stops at the API-key or workspace level, not the individual developer. That's a real gap when multiple developers share a key, or when usage flows through cloud platforms (Bedrock, Vertex, Foundry) that don't report back to the vendor at all. The fix is routing traffic through an LLM gateway that ties usage to enterprise identity. Cloudflare's AI Gateway extracts a user's identity from the JWT issued at login and attaches it as metadata on every AI request, making per-user consumption visible without a spoofable custom header [19]. LiteLLM (open source) does the same via SSO/SCIM-issued virtual keys, tracking spend hierarchically by organisation, team, user, and project, and enforcing hard/soft budgets at any of those levels [20]. Anthropic's own documentation names LiteLLM as the tool "several large enterprises reported using," specifically because Claude Code doesn't send usage metrics back from cloud-billed deployments [14].

**Adopt FinOps Tokenomics** *(emerging practice)*

Adopt the FinOps Tokenomics model wholesale: name an accountable owner, baseline usage for 30 to 60 days, then set budgets and alerts off that baseline instead of an arbitrary number.

Cloud FinOps (the discipline of allocating and governing cloud spend) has been directly adapted to AI token costs under the name "Tokenomics" or "FinOps for AI," now formalised by the FinOps Foundation [18]. Per the Foundation's State of FinOps 2026 survey, 98% of respondents now manage AI spend, up from 63% in 2025 and 31% in 2024, and "[g]ranular monitoring of AI spend (tokens, LLM requests and GPU utilization)" ranked first among desired tool features [32] [33]. The Foundation's Tokenomics guidance is the closest thing to an actual methodology: it describes FinOps-led, Platform Engineering-led, and AI Center of Excellence ownership models, with "a named individual who is accountable for AI cost visibility" required regardless of model, a 30 to 60 day usage baseline before setting any budget, budgets set at 110 to 120% of that baseline with alerts at 80% and 100%, and API-key lifecycle governance (provisioning with cost-centre tagging, naming conventions, rotation, and audit for orphaned keys) as the foundational control.

**Route AI token usage to SIEM**

Pipe AI budget and token usage toward a SIEM (Security Information and Event Management system), so proof that AI usage is governed and monitored already exists when someone, an auditor or a regulator, eventually needs it.

A SIEM collects logs and events from across an organisation's infrastructure (firewalls, servers, applications, login systems, and more) into one central place, so security and compliance teams can search, alert on, and review that activity. NBN, as a telecom critical-infrastructure operator, almost certainly already runs a SIEM for its broader security monitoring. The token-tracking mechanisms above only live inside each AI tool's own dashboard, separate from NBN's wider monitoring stack. If budget-limit and anomaly events just sit in a vendor dashboard nobody centrally reviews, they aren't governed. Routing them to a SIEM creates a timestamped, centrally logged, continuously collected record, the kind of evidence NIST's Measure and Manage functions ask for, even though neither mentions tokens specifically.

## Licensing and copyright

AI models are trained on large amounts of code, including copyleft-licensed code. If an AI tool reproduces a close match of that training data, you may end up shipping someone else's licensed code without complying with its license, and you might not even know it happened, since the AI presents it as a fresh suggestion.

The scanning problem is subtler than people assume. GitHub Copilot has a built-in "duplicate detection filter" that blocks suggestions matching public code, but it only catches near-identical matches. Rename a few variables and it passes right through, which is exactly how license contamination slips into codebases undetected.

### Licensing and copyright mechanisms

**Similarity scanning**

Incorporate license/snippet-similarity scanning as its own checkpoint, distinct from security scanning. Tools like FOSSA, Snyk, Black Duck, or GitHub Advanced Security compare AI-generated code against known open-source snippets, not just declared dependencies, a critical distinction since AI-copied code shows up in neither your dependency list nor a license header. Only snippet-matching tools catch it.

See `framework-alignment.md` for this mechanism's NIST AI RMF mapping (GOVERN 6.1, MAP 4.1).

**Duplicate detection filters**

Enable duplicate detection filters on whatever AI tool you standardise on, and require it as policy.

**Legal implications**

Treat license/copyright risk as an open legal question, not a solved compliance checkbox. Similarity scanning and duplicate detection mitigate practical contamination risk today, but don't resolve the underlying, still-litigated question of who owns or can license AI-generated code.

For context: a major pending case alleges Copilot reproduces licensed code without preserving attribution or license terms. Most claims were dismissed by 2024, but two survive: a breach-of-contract theory (that open-source licenses are contracts Copilot allegedly violates) and a DMCA §1202(b) claim now on appeal, with oral arguments heard February 2026 and a ruling still pending [21]. That ruling could significantly widen or narrow legal exposure for every AI coding tool, not just Copilot. This is a live, moving target, not settled law.

A separate, deeper legal question sits underneath this: whether AI-generated code can be copyrighted at all. A March 2025 appellate ruling affirmed that US copyright law requires a human author, stating "all eligible work [must] be authored in the first instance by a human being" [22]. This means purely AI-generated code may not be protectable by copyright in the first place. (One major open-source project banned LLM-derived contributions specifically to protect its copyright-enforcement chain, since AI output has no human author to hold the license against.)

## Gaps

AI code review skills are ambiguous and not fully agreed on across large enterprises, due to a lack of information.

Sampling audit implementation is undefined. The methodology establishes that approved AI-assisted changes should be periodically re-reviewed to verify genuine scrutiny, but doesn't yet define sample size, frequency, or, critically, that the auditor must be independent of the original approver. Without independence, the check-the-checkers mechanism risks becoming exactly the rubber-stamp problem it's meant to catch.

AI licensing and copyright legalities are open and not yet finalised. Once they are, they could drastically change the methodology.

Attribution and named-reviewer accountability exist, but nothing requires a security scan on AI-generated code before it's accepted. A named human reviewer isn't a meaningful control on its own. Research found 45% of AI-generated code samples introduced OWASP Top 10 vulnerabilities [25], so review without a mandatory SAST/dependency scan at the merge gate leaves this risk largely unchecked.

Attribution data (the Assisted-by tag, signed provenance) and accountability structure (the named approver) exist as records, but nothing currently requires the incident/RCA process to actually pull them. When something breaks, the root-cause investigation should query the failing commit's Assisted-by tag and named approver as a first step; otherwise the attribution data sits unused instead of functioning as a real accountability mechanism during failure response.

There's no peer-reviewed research, no standards-body clause, and no second independent methodology to cross-check the FinOps Foundation's approach against, unlike the AI accountability requirements.
