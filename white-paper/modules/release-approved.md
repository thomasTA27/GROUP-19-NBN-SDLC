# Gate: Release Approved

Sits after the Security Gate and before Deployment. Nothing is deployed until this gate passes.

_Entered once every feature in the release has a security record with the outcome "proceed to Release Approved". Exits to Deployment._

## What this gate is

A blocking go/no-go decision. No code changes in it. A named person reads the release evidence and either approves the release or stops it.

It is not a second code review. The code was verified in Implementation and Testing, and the Security Gate confirmed the security evidence. This gate confirms the whole release is ready to reach customers, that the team can undo it, and that NBN's regulatory obligations are met.

The point is cost. After deployment, a wrong call is an incident. Here, it is a delay.

**Lightweight by default.** DORA found that approval by people outside the team, such as a change advisory board, slowed delivery and showed no evidence of lowering change failure rates. So the default is an independent peer approving in GitHub, where the approval is recorded automatically. Extra scrutiny is saved for high-risk changes.

## Who approves

Each approver is named, and their name is recorded with the date.

| Who | When |
| --- | --- |
| Independent peer or tech lead | Default, for standard changes. |
| Product owner, as well | When the release changes what customers or RSPs see or can do. |
| Named accountable approver and the NBN security team | High-risk changes: network management or configuration, authentication or authorisation, security-enforcing functions, personal data, or AI introduced into operational systems. |

Two rules apply to everyone:

- **The approver is not an author of any feature in the release.** An author is anyone with commits in a feature's pull requests, as Testing defines it. This is segregation of duties.
- **AI never approves.** Copilot can assemble and summarise the evidence. A human makes the decision and is accountable for it. This includes the PR approvals criterion 6 checks: keep Copilot approvals disabled, as the Security Gate requires.

Who these people are at NBN, and who owns the SOCI screen, is not yet known. Needs client input.

## What gets checked

Six go/no-go criteria. If any fail, the release stops.

1. **The tested build is the build being released.** The commit being deployed is the tested commit of the last feature merged into the release, as named in that feature's testing and security records. Anything merged after it is not in the release. Every other feature merged to the main branch before it is in the release too. Each of those has passed Testing and the Security Gate on its own tested commit, or is switched off behind a flag, or the release waits.
2. **Every acceptance criterion is traced and settled.** Testing's acceptance-criteria trace has a confirmed test for every outcome of every criterion approved at Plan Approved. No criterion has a spec change request still open. The trace flags requests that were open when the record was made, but a request can open or close after that, so the approver also checks `docs/design/<feature>/spec-change-requests.md`, or the work item where specs are kept in Jira or Confluence. A build made on a provisional reading of a criterion is not released while that request is open. A criterion flagged "AC not confirmed" was never checked by hand in a developer environment: the approver either accepts that in the release record with a reason, or sends it back for the check.
3. **Accepted risks are visible.** The release record lists every risk accepted before this gate, each with who accepted it: risks accepted in Design's ADRs, the "Accepted security findings" caveat on each pull request, "Gaps accepted" and "Presentation only accepted" in Testing's record, and findings accepted in the security record. Nothing was deferred silently.
4. **There is a contingency plan.** It names how to roll back or switch the change off, who does it, and how the team will know something is wrong (the alert or metric to watch). A data migration needs a reverse step or a written forward-fix plan. If the release deploys or changes an AI system, the plan also covers response, recovery and communications, and the accountable person's authorisation to deploy is recorded with its rationale.
5. **The regulatory screen is done.** Someone answered one question: is this change likely to have a material adverse effect on NBN's ability to protect the network? If yes, it is notified to Home Affairs under SOCI s 30EE before release. Adding AI to network management, fault or security systems is the regulator's own example of a notifiable change. Routine software updates may fall below the threshold. If the change touches personal data, privacy obligations (APP 11) were considered.
6. **Accountability is complete.** Every commit merged into the release carries a human `Signed-off-by:`, and every commit with AI-assisted content carries `Assisted-by:`. The check reads the merged commits, not the PR branch: if NBN squash-merges, the trailers only survive if they were carried into the squash commit's message. This confirms the trailers are present, not that they are accurate. Whether a commit without `Assisted-by:` really had no AI help rests on the signer's certification. Every PR was approved by a named code owner, which is binding only when a ruleset or branch protection requires code-owner approval and `CODEOWNERS` has a catch-all `*` entry so every path has an owner. If AI drafted the release summary, the approver checked it against the PRs.

Criteria 1, 2 and 4 are standard release practice. Criterion 5 is specific to NBN as critical infrastructure. Criteria 3 and 6 are where AI-assisted work changes this gate.

## What happens when it fails

The release stops, and the failing item is named. It goes back to the stage that owns it:

- **Criterion 1:** the release owner, to deploy the tested commit or wait for the other features.
- **Criterion 2:** Testing for an untraced criterion, the Plan Approved owner for an open spec change request, and Implementation for an "AC not confirmed" criterion the approver does not accept.
- **Criterion 3:** the release owner adds any missing entry. A risk that was never formally accepted goes back to the stage that found it.
- **Criterion 4:** the release owner.
- **Criterion 6:** the release owner. A missing trailer or code-owner approval cannot be added to a merged commit without rewriting the main branch. So the change is either reverted and merged again correctly, or recorded in the release record as an exception, with the signer's confirmation and the approver's acceptance.

A fix that changes code is a new commit, so it passes through Testing and the Security Gate again before it returns here.

A failed regulatory screen is different. The release is held until the notification has been made and the owner of the SOCI screen clears the release, because CISC expects notification before the change is made.

A no-go is a normal outcome. A release that ships with "we'll monitor it" in place of a contingency plan has passed a gate that was not applied.

## Record

The release record is `docs/release/<release>.md`, where `<release>` is the version or tag the release is deployed as. It is committed before deployment through a pull request that a code owner of `docs/release/` other than the approver approves. It names the commit being deployed and the features in it, the result of each criterion, the accepted risks from criterion 3, any "AC not confirmed" acceptance and criterion 6 exception, the contingency plan, the regulatory screen's answer and who gave it, and the approvers. The deployment approval itself is recorded in GitHub's deployment environment. The record's commit lands after the tested commit, but it is not deployed: criterion 1 deploys the tested commit.

## What AI tooling supports this review

GitHub deployment environments can require named reviewers before a deployment runs. Two settings close the back doors. **Prevent self-review** stops whoever triggered the deployment from approving it. **Disallowing admin bypass** stops administrators skipping the rule. These settings keep the approval in the platform, which is where DORA recommends approvals live. They do not check whether the approver authored a change in the release, so the author rule stays a human check. On GitHub Free, Pro and Team, required reviewers only work on public repositories. Claude Code has no native equivalent, so this stays a GitHub concern for both tools.

Copilot can be asked to summarise the PRs in a release and draft release notes from them. That is evidence assembly, and it saves time.

**The limit.** Tooling can confirm checks passed and required entries are filled in. It cannot show that nothing was left out. It cannot decide whether a change is SOCI-notifiable, or whether a release is worth its risk today. That depends on what else is changing, who is on call, and what customers are doing. That is what the human is for.

## Sources

1. DORA - [Streamlining change approval](https://dora.dev/capabilities/streamlining-change-approval/). Independent research (2019 State of DevOps Report). Source for external approval slowing delivery without lowering change failure rates, peer review in the platform, and extra scrutiny for high-risk changes.
2. CISC - [Guidance for responsible entities for critical telecommunications assets](https://www.cisc.gov.au/resources-subsite/Documents/telecommunications-guidance.pdf) (April 2025). Government regulator. Source for the s 30EE notification obligation, the AI-in-network example, and routine software updates possibly falling below the threshold. Not legal advice.
3. GitHub - [Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments). Vendor documentation. Source for required reviewers, prevent self-review applying to the deployment's initiator, admin bypass being on by default, and required reviewers needing a public repository on Free, Pro and Team plans. Also [Configuring Copilot code review](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/configure-code-review), for Copilot approvals being an admin setting that counts toward merge requirements when enabled.
4. National AI Centre - [Guidance for AI Adoption: Implementation guidance](https://www.ai.gov.au/staying-safe-and-responsible/essential-ai-practices/guidance-ai-adoption-implementation-guidance) (first published October 2025; current version, PDF dated 5 May 2026). Government, voluntary. Source for 6.1.1, human oversight throughout the lifecycle of AI systems, as the basis of AI never approving. Also 3.3.3, a deployment plan covering response, recovery and communications, and 5.1.5, documented deployment authorisation from the accountable person, which apply when a release deploys or changes an AI system.

## Open questions

- Who at NBN owns the SOCI screen, and whether an internal threshold for notifiable software changes already exists.
- What the emergency path is. NBN will have to create one themselves as we do not have information on deployment infrastructure or technologies.
- Which GitHub plan NBN is on. On Free, Pro and Team plans, required reviewers are not available on private repositories, so the deployment approval would have to be enforced another way.
- Whether NBN mandates the `Assisted-by:` and `Signed-off-by:` trailers. This gate is where their presence is checked before release, so if NBN mandates neither, criterion 6 checks code-owner approval only, and the trailer check becomes advisory. The trailer convention follows the Linux kernel's and is a watch item: if Implementation changes the trailer, criterion 6 checks the new one.
- Whether NBN squash-merges. If it does, the PR template or merge settings need to carry the trailers into the squash commit message.
- Whether NBN uses the asynchronous coding agent. Implementation leaves it out of scope, so its work has not been through Implementation's checks. Its commits must not carry `Signed-off-by:`, because only a human can make that certification, so they fail criterion 6 unless a human-signed squash commit carries the trailers.