# Gate: Security Gate

Sits after Testing and QA and before Release Approved. Nothing goes to Release Approved until this gate passes.

_Entered once per feature, after the feature's testing record has merged with the outcome "proceed to the Security Gate". Exits to Release Approved._

## What this gate is

A blocking, consolidating checkpoint. It is not the first security check. Security runs in every phase: Design reviews security-relevant ADRs, and Implementation runs its checklist on every generation and blocking scans on every PR. ASD treats AI-assisted development no differently: its software guidelines apply to humans and AI alike, and expect Secure by Design throughout the lifecycle.

This gate checks the assembled feature. A feature lands as many small AI-assisted PRs, each scanned on its own. Nobody has yet looked at the whole: a new dependency in one PR, an auth change in another, a suppression accepted under deadline in a third.

**Evidence, not confidence.** About 40% of Copilot-generated programs were found vulnerable in high-risk security scenarios. Developers using an AI assistant wrote less secure code and were more likely to believe it was secure. A reviewer's confidence is not evidence, so this gate asks for the evidence.

**Why it matters at NBN.** The nbn network is critical infrastructure. Under the SOCI Act, NBN must protect its assets and keep a risk management program. ASD expects residual security risks to be accepted before a system goes into use. A finding accepted at this gate is one of those risks, so it is recorded like one.

## Who approves

Each approver is named, and their name is recorded with the date.

| Who | When |
| --- | --- |
| Security champion, or the NBN security team until security champions exist | Default. They check the scan evidence and the review trail, and decide whether to accept findings below high. |
| NBN security team | When the feature touches authentication or authorisation, personal data, network management or configuration, security-enforcing functions, or AI introduced into operational systems. They also decide whether to accept findings below high on those features. |
| Tech lead and the CISO's delegate | When a high or critical finding is to be accepted rather than fixed. Exposed secrets and dependencies that cannot be verified count as critical until NBN sets its own severity rule. |

Two rules apply to everyone:

- **The approver is not an author of the feature.** An author is anyone with commits in the feature's pull requests, as Testing defines it. Nobody signs off security on their own work.
- **AI never approves or waives.** Copilot can find, explain and propose fixes. Only a named human can pass the gate or accept a finding. Keep Copilot approvals disabled: they are off by default, but once an admin turns them on they count toward required approvals.

Security-aware means listed on a developer security skills register. Who these people are at NBN, and whether a security champion role exists, is not yet known. Needs client input.

## What gets checked

Seven criteria. If any fail, the feature goes back.

1. **Scans cover the tested commit.** Code scanning ran on the commit named in Testing's record, not an earlier one. Dependency review passed on every pull request in the feature, since it checks pull requests rather than commits. Secret scanning push protection was on throughout, so secrets were blocked before they reached the repository.
2. **No high or critical finding is open.** Each is fixed, or accepted by the tech lead and the CISO's delegate. Anything lower that stays open was accepted by the approver the table names for the feature. This includes findings accepted earlier under Implementation's escalation triggers, listed in each pull request's "Accepted security findings" caveat: the gate checks each was accepted by the right approver. Every detected secret was rotated, not only removed. A finding in code this feature did not change is raised with that code's owner and does not block this feature, unless the feature relies on that code, in which case it counts as this feature's.
3. **No AI waived or fixed a finding unchecked.** Every dismissed alert was dismissed by a named human with a reason. In-code suppressions added in this feature are reviewed like findings. Every AI-proposed fix was read and tested by a human, not merged because the alert closed.
4. **High-risk features had a security-aware reviewer.** A feature touching authentication or authorisation, personal data, network management or configuration, security-enforcing functions, or AI introduced into operational systems was reviewed by someone on the developer security skills register. This is on top of Implementation's independent human review, not a replacement for it.
5. **Every new dependency is verified.** It exists in the registry, is the intended package, comes from a trustworthy source, is pinned to a specific version, and has an acceptable licence and no known vulnerabilities.
6. **New trust boundaries are covered.** If the feature added a data flow, external call or trust boundary, an ADR from Design covers it, and so does the project's threat model if NBN keeps one. Both match what was built.
7. **Agent context changes had a binding code-owner approval.** Instruction files, prompt files, custom agents, skills and MCP server config are prompt-injection routes, so any change to them was approved by a named code owner. A `CODEOWNERS` file alone only requests review. Approval is binding only when a ruleset or branch protection requires code-owner approval, and the file has a catch-all `*` entry so every path has an owner.

Criteria 1, 2, 5 and 6 are ASD practice applied to the whole feature. Criterion 4's list reflects NBN as critical infrastructure. Criteria 3 and 7 exist because the code was AI-assisted.

## What happens when it fails

The feature goes back with the failing items listed in the security record. Most failures go to Implementation, which starts a new change from that list. A trust boundary that no ADR covers goes back to Design, because the fix is a decision, not a patch. Any fix is a new commit, so Testing runs again in full before the feature returns to this gate.

Each finding is either fixed or formally accepted. Accepted means three things are recorded: who accepted it, why, and when it will be reviewed again. Accepted findings then appear in the release record that Release Approved keeps.

A "known issue, fix later" note without those three is not an acceptance. That is how a gate stops being a gate.

## Record

The approver records each run of the gate in `docs/security/<feature>.md`, using the same `<feature>` name as Testing's record. It names the tested commit from Testing's record, the result of each criterion, every finding accepted at this gate with who accepted it, why and when it will be reviewed again, the approvers, and the outcome: proceed to Release Approved, or send back, listing the failing items. It is committed through a pull request that a code owner of `docs/security/` other than the approver approves. A commit that changes only this record does not change the feature's code, so it does not mean a re-run of Testing.

## What AI tooling supports this review

The checks behind criteria 1 and 2 are enforced server-side, so they cannot be skipped from the editor, but each blocks in a different way. Dependency review can be a required status check through branch protection or rulesets. Code scanning blocks merges through a ruleset's code scanning merge protection, set to a severity threshold, which is separate from status checks. Secret scanning push protection blocks secrets at push, before they reach the repository. By the time this gate runs, the approver is reading their results, not running them.

Copilot Autofix proposes a fix for a code-scanning alert, which a human reviews and applies. It is on by default wherever CodeQL is enabled. Where the Copilot cloud agent is available, assigning an alert to Copilot lets the agent resolve it. That is the loop criterion 3 exists to break: the same system generating, assessing and fixing the code. Implementation's checks do not cover the cloud agent's unattended work, so a fix it produces goes back through Implementation as a new change before it counts. Claude Code's nearest equivalent is the `/security-review` command.

AI is encouraged to augment security testing, as long as skilled people validate every finding. Augment is the point: the AI widens what is found, and a human decides what it means.

**The limit.** Tooling checks code against the rules it has. It cannot tell whether a missing authorisation check is a bug or a design choice, or decide whether a risk is acceptable on NBN's network. And developers using AI tend to overrate their own security, so the approver reads the evidence rather than trusting a summary. That is what the human is for.

## Sources

1. ASD — [Information Security Manual](https://www.cyber.gov.au/business-government/asds-cyber-security-frameworks/ism/cyber-security-guidelines/guidelines-for-software-development) (September 2026). Government. ASD's advice; not legally required unless legislation compels it. Supports:
    - the guidelines applying to humans and AI, and Secure by Design throughout the lifecycle (ISM-0401)
    - residual risk accepted before use (principle GOV-05), with the CISO or their delegate as the authorising officer. Letting the default approver accept findings below high assumes the CISO delegates that authority; NBN needs to confirm it
    - security-aware reviewers drawn from a developer skills register (ISM-2038)
    - criterion 1: SAST, DAST and SCA testing before every release (ISM-0402) and secrets blocked at commit (ISM-2030)
    - criterion 3: AI supplementing security testing with findings validated by skilled people (ISM-2122), and human approval before AI disables security controls (ISM-2113)
    - criterion 4: peer review of critical and security-related components (ISM-2061)
    - criterion 5: trustworthy sources (ISM-2029), pinned versions (ISM-2154), and no known vulnerabilities, using a third-party component's SBOM where one is available (ISM-2054)
    - criterion 6: a threat model reviewed so it reflects the as-built software (ISM-2039)
    - criterion 7: retrieved content treated as untrusted (ISM-2158; written for AI applications an organisation builds, applied here by our reading)
    - the Record section: security decisions linked to the work they concern (ISM-2025 expects an issue tracker that does this; a committed record per feature is this methodology's substitute)
2. CISC — [Guidance for responsible entities for critical telecommunications assets](https://www.cisc.gov.au/resources-subsite/Documents/telecommunications-guidance.pdf) (April 2025). Government regulator. Supports NBN's obligations as a carrier to protect its assets and keep a risk management program, applied to telecommunications through the TSRMP Rules from 4 April 2025. Treating an accepted finding as a risk under that program is our reading. Not legal advice.
3. Pearce et al. — [Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions](https://arxiv.org/abs/2108.09293) (IEEE S&P 2022). Academic, peer-reviewed. Supports "Evidence, not confidence": about 40% of 1,689 Copilot-generated programs were vulnerable in high-risk scenarios.
4. Perry et al. — [Do Users Write More Insecure Code with AI Assistants?](https://dl.acm.org/doi/10.1145/3576915.3623157) (ACM CCS 2023). Academic, peer-reviewed. Supports "Evidence, not confidence" and "The limit": AI-assisted participants wrote less secure code while believing it more secure.
5. GitHub — [About autofix for code scanning](https://docs.github.com/en/code-security/concepts/code-scanning/autofix-for-code-scanning). Vendor documentation. Supports the tooling section: Autofix on by default with CodeQL, and agentic autofix via the Copilot cloud agent. Also [Code scanning merge protection](https://docs.github.com/en/code-security/concepts/code-scanning/merge-protection), for merge protection being set through rulesets and separate from status checks, and [Configuring Copilot code review](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/configure-code-review), for Copilot approvals being an admin setting that counts toward merge requirements when enabled.

## Open questions

- Which scanners NBN already runs, including whether it runs DAST, which the ISM also expects before release. And whether NBN's GitHub plan and settings support dependency review as a required status check, code scanning merge protection and secret scanning push protection.
- Whether findings accepted in the security record also go to NBN's risk register, and whether they feed NBN's risk management program.
- Whether NBN keeps a threat model for each system, which the ISM expects to be reviewed throughout the lifecycle. Design's ADRs record individual decisions, not a threat model, so criterion 6 relies on ADRs until one exists.
- Whether NBN produces a software bill of materials for its own releases, which the ISM also expects. No stage in this methodology produces one yet.
- Whether NBN will appoint security champions in delivery teams. Until it does, the NBN security team holds the default approver role. And what severity NBN assigns to exposed secrets and unverifiable dependencies; until it decides, both count as critical.