# Gate: Release Approved

Sits between Testing and Deployment. Nothing is deployed until this gate passes.

## What this gate is

A blocking go/no-go decision. No work happens in it. A named person reads the release evidence and either approves the release or stops it.

It is not a second code review. The code was verified in Implementation, and the Security Gate confirmed the security evidence. This gate confirms the whole release is ready to reach customers, that the team can undo it, and that NBN's regulatory obligations are met.

The point is cost. After deployment, a wrong call is an incident. Here, it is a delay.

**Lightweight by default.** DORA found that approval by people outside the team, such as a change advisory board, slowed delivery and showed no evidence of lowering change failure rates. So the default is an independent peer approving in GitHub, where the record is kept automatically. Extra scrutiny is saved for high-risk changes.

## Who approves

One named person per release, and their name is recorded with the date.

| Who | When |
| --- | --- |
| Independent peer or tech lead | Default, for standard changes. |
| Product owner, as well | When the release changes what customers or RSPs see or can do. |
| Named accountable approver and security | High-risk changes: network management, security-enforcing functions, personal data, or AI introduced into operational systems. |

Two rules apply to everyone:

- **The approver is not the author.** Nobody approves a release containing their own change. This is segregation of duties.
- **AI never approves.** Copilot can assemble and summarise the evidence. A human makes the decision and is accountable for it.

Who these people are at NBN, and who owns the SOCI screen, is not yet known. Needs client input.

## What gets checked

Six go/no-go criteria. If any fail, the release stops.

1. **The tested build is the build being released.** The commit or artefact being deployed is the one that passed Testing and the Security Gate. Nothing merged since.
2. **Every acceptance criterion traces to a passing test.** Each criterion approved at Plan Approved maps to a test that ran on this build.
3. **Accepted risks are visible.** Every finding accepted at the Security Gate is listed in the release record with its owner. Nothing was deferred silently.
4. **There is a contingency plan.** It names how to roll back or switch the change off, who does it, and how the team will know something is wrong (the alert or metric to watch). A data migration needs a reverse step or a written forward-fix plan. If the release deploys or changes an AI system, the plan also covers response, recovery and communications, and the accountable person's authorisation to deploy is recorded with its rationale.
5. **The regulatory screen is done.** Someone answered one question: could this change have a material adverse effect on NBN's ability to protect the network? If yes, it is notified to Home Affairs under SOCI s 30EE before release. Adding AI to network management, fault or security systems is the regulator's own example of a notifiable change. Routine software updates usually are not. If the change touches personal data, privacy obligations (APP 11) were considered.
6. **Accountability is complete.** Every AI-assisted commit has `Assisted-by:` and a human `Signed-off-by:`. Every PR had a named `CODEOWNERS` approver. If AI drafted the release summary, the approver checked it against the PRs.

Criteria 1, 2 and 4 are standard release practice. Criterion 5 is specific to NBN as critical infrastructure. Criteria 3 and 6 are where AI-assisted work changes this gate.

## What happens when it fails

The release stops, and the failing item is named. It goes back to the phase that owns it: Testing for 1 and 2, the Security Gate for 3, the release owner for 4, Implementation for 6.

A failed regulatory screen is different. The release is held until the notification is resolved, because CISC expects notification before the change is made.

A no-go is a normal outcome. A release that ships with "we'll monitor it" in place of a contingency plan has passed a gate that was not applied.

## What AI tooling supports this review

GitHub deployment environments can require named reviewers before a deployment runs. Two settings close the back doors. **Prevent self-review** stops whoever triggered the deployment from approving it. **Disallowing admin bypass** stops administrators skipping the rule. Together they enforce the approver rules in the platform, which is also where DORA recommends approvals live. Claude Code has no native equivalent, so this stays a GitHub concern for both tools.

Copilot can draft release notes and summarise the PRs in a release. That is evidence assembly, and it saves time.

**The limit.** Tooling can confirm checks passed and the record is complete. It cannot decide whether a change is SOCI-notifiable, or whether a release is worth its risk today. That depends on what else is changing, who is on call, and what customers are doing. That is what the human is for.

## Sources

1. DORA - [Streamlining change approval](https://dora.dev/capabilities/streamlining-change-approval/). Independent research (2019 State of DevOps Report). Source for external approval slowing delivery without lowering change failure rates, peer review in the platform, and extra scrutiny for high-risk changes.
2. CISC - [Guidance for responsible entities for critical telecommunications assets](https://www.cisc.gov.au/resources-subsite/Documents/telecommunications-guidance.pdf) (April 2025). Government regulator. Source for the s 30EE notification obligation, the AI-in-network example, and routine software updates usually falling below the threshold. Not legal advice.
3. GitHub - [Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments). Vendor documentation. Source for required reviewers, prevent self-review and admin bypass.
4. National AI Centre - [Guidance for AI Adoption: Implementation guidance](https://www.ai.gov.au/staying-safe-and-responsible/essential-ai-practices/guidance-ai-adoption-implementation-guidance) (first published October 2025; current version, PDF dated 5 May 2026). Government, voluntary. Source for 6.1.1, human oversight throughout the lifecycle of AI systems, as the basis of AI never approving. Also 3.3.3, a deployment plan covering response, recovery and communications, and 5.1.5, documented deployment authorisation from the accountable person, which apply when a release deploys or changes an AI system.

## Open questions

- Who at NBN owns the SOCI screen, and whether an internal threshold for notifiable software changes already exists.
- What the emergency path is. NBN will have to create one themselves as we do not have information on deployment infrastructure or technologies
