# Stage: Deployment

_Notes: release approved at Gate 3, going to production. This phase is orange on the agreed map, a human decision, not a blocking automated gate._

## What changes: traditional vs AI-native

### Standard practice, without AI

A release that has already cleared Gate 3 ("Release approved") moves through a CI/CD pipeline toward production, usually via a progressive rollout strategy rather than a single all-at-once switch: canary (the new version takes a small slice of traffic first, watched before it takes the rest), blue-green (a full parallel environment that traffic switches to, and back from, near-instantly), or rolling (nodes replaced a few at a time). The point of all three is the same: keep the blast radius of a bad release small, and keep reversing it cheap.

The standard measure of whether this phase is healthy is DORA's delivery metrics. DORA still calls the set the four keys, but its own site now lists five: change lead time, deployment frequency and failed deployment recovery time as throughput factors, and change fail rate and deployment rework rate as instability factors. Smaller, more frequent releases carry a lower change fail rate than large infrequent ones, because each one changes less at once.

Traditionally, a person (or an on-call rotation) watches the rollout against dashboards and alerts, and either promotes it to full traffic or triggers a rollback. Where rollback is automated at all, it is usually a hard, pre-set threshold, for example error rate crosses X percent, with no judgement beyond that threshold. It is not adaptive.

### How AI changes this

Nothing in the research found gives AI outright go or no go authority, or rollback authority, in this phase. What it does do is take over parts of the standard process above that used to need a person watching a dashboard or reading logs.

- **Judging a canary automatically.** Netflix and Google's Kayenta runs statistical tests comparing a canary's metrics against the baseline and returns a score that auto-promotes on success, auto-rolls-back on failure, and only routes the ambiguous middle, what Kayenta calls marginal, to a human.
- **Triaging a broken pipeline.** GitLab Duo's Root Cause Analysis reads failed CI/CD job logs and proposes a cause and a fix, cutting the manual log-reading step before a release can even reach the gate.
- **Drafting what shipped.** Release notes, previously written by hand, are increasingly AI-drafted from the merged pull requests and commits in the release, and GitHub already credits the human who directed that work alongside the agent that opened the pull request.

The best current industry evidence, DORA's 2025 State of AI-assisted Software Development report, says this genuinely increases throughput but continues to show a negative relationship with delivery stability. The report explains the gap as conditional. Teams with strong automated testing, mature version control and fast feedback loops see real gains from AI here. Teams without that discipline do not. AI in this phase makes the mechanics faster. It does not substitute for the standard practice above. It depends on that practice already being solid.

Our recommendation is to treat that discipline as a precondition, not a footnote. A team should not turn on this phase's AI release automation until its automated testing, version control and feedback loops are already solid. Adopting the tooling before that groundwork is in place is exactly the situation DORA 2025 describes, where throughput goes up and stability does not follow.

We also treat the absence of full rollback authority as a deliberate boundary for this methodology, not a gap the technology will eventually close. Even as canary scoring and pipeline triage keep improving, final promote or rollback authority for a production release should stay with a named human. The accountability and kill switch requirements set out below only mean something if a human is still the one making the call they are accountable for.

## Artifacts generated

- **Release/rollout record.** What shipped, its canary classification, and the promote or rollback decision, with a named human against each. This is the artifact the "How authorship is recorded" section below builds on.
- **Canary classification score**, for example Kayenta's 0 to 100 canary score. It drives the promote or rollback outcome directly for clear-cut cases, and is only handed to a person when the result is marginal.
- **Pipeline failure triage output.** A proposed root cause and fix, attached to the failed CI/CD run, consumed by whoever applies the fix before the release can proceed.
- **AI-drafted release notes / changelog.** Generated from the release's merged PRs and commits, reviewed by a person before publishing.
- **Incident record.** Produced only if a rollback fires. Feeds directly into the next cycle's Maintenance and Operations phase, and from there back into Planning as the next cycle's intent.

## What to ask the AI

- Summarise what is actually in this release, the changed endpoints or services, anything unusual such as a schema change or a dependency bump, so a person approving the rollout is looking at a short summary rather than the raw diff list.
- Triage a failed CI/CD pipeline run. Read the logs, propose the likely root cause and a fix, before it reaches a person for the fix to be applied.
- Monitor progressive rollout metrics against thresholds the team already agreed on, and classify the result as promote, needs a human look, or roll back. Do not act outside thresholds a person has already reviewed and approved.
- Draft release notes and changelog entries from the merged pull requests, crediting the human who directed the work even where an agent opened the pull request.

## What to verify before accepting output

- That an AI-generated release summary actually matches the diff. Check it against what changed, not against how plausible it reads.
- That an AI-proposed classification or score is being used as an input to a named person's decision, not treated as the decision itself. Accountability for the change stays with the engineer who ships it, regardless of what scored it.
- That an AI-proposed root cause for a pipeline failure is checked against the actual logs before its fix is applied. Do not merge a plausible sounding fix unread.
- That any automatic rollback configuration, which metrics it watches and what counts as a regression, was reviewed and approved by a named person before it goes live, rather than left at a vendor's default. A threshold that is wrong in either direction either blocks good releases or lets bad ones through unattended.
- That AI-drafted release notes are read before publishing. This output is non-deterministic by design, and vendor guidance itself recommends human review for anything that matters.

## Governance and security touchpoints

- Giving any part of this phase's automation, canary judgement or auto-rollback, standing production credentials widens the attack surface of that automation itself, separate from the risk of a bad release. Scope those credentials as a security review item, not just an ops convenience.
- A named person, or role, needs standing authority to halt any of this phase's automation, sometimes called a kill switch, before it goes live, not improvised during an incident. See [white-paper/governance/research.md](../governance/research.md) for the broader human-oversight pattern this should follow.
- None of this module's sources say what should happen when an AI's canary judgement and a human's own read of production telemetry disagree. Our recommendation: the human's read wins by default, since the person watching production may know about something happening elsewhere in the system that the AI's pre-agreed metrics do not capture. Log the disagreement itself as part of the release record, not just the final decision, so a pattern of the model being routinely overridden becomes visible instead of staying anecdotal.
- NBN's SOCI Act and CIRMP obligations as a critical infrastructure operator mean deploy and rollback automation for production systems is not just a team-level engineering choice. It sits inside a board-approved risk management program (see [white-paper/governance/research.md](../governance/research.md)).
- Full cross-cutting AI-use policy lives in [white-paper/governance/](../governance/); this list is only the checkpoints specific to shipping a release.

## How authorship is recorded

Authorship in this phase builds on, rather than re-decides, what Gate 3 already established: a named person approved this release going to production. What this phase's record needs to add is what actually shipped and how much of it was AI-assisted, against what that person approved.

GitHub's release notes attribution change is a concrete, adoptable pattern for this. A pull request opened by an agent is now credited to the human who directed it, shown as "by @monalisa with @copilot", not to the agent alone. The same principle applies to the release automation tooling described above. A canary judgement or a pipeline fix is a recommendation an agent produced, and the release record should show which human accepted it and when, the same way commit-level attribution already does further upstream (see [white-paper/governance/research.md](../governance/research.md) for the commit-trailer conventions this should stay consistent with).

## Documentation in practice

This phase produces a lot of paperwork, most of it generated rather than typed by hand, so it matters where that paperwork actually lives and who checks it.

- Release notes and changelogs should be generated from the release's merged pull requests and commits, then edited by a person before publishing rather than posted as is. GitHub's own release notes feature already pulls from merged PRs, and GitHub Copilot CLI can be wired into a GitHub Actions workflow to draft the same kind of summary as a pull request against a changelog file, which someone then reviews and merges like any other change.
- The release or rollout record, meaning what shipped, its canary outcome, and the promote or rollback decision, should be attached to the release itself rather than left in chat messages or memory. A comment on the release or deployment ticket, written at the moment the decision is made, is enough. What matters is that it exists and names a person.
- Pipeline failure triage output, meaning a proposed cause and fix, should stay attached to the failed run it came from, so anyone looking at a later incident can see what was suggested and whether it was the fix that was actually applied.
- None of this needs new tooling at NBN. It needs the habit of treating an AI-drafted summary as a first draft that gets attached to the record, not something read once and thrown away.

## A deployment skill for AI assistants

Most AI tools let a team save a reusable set of instructions so the same rules do not have to be restated every time someone asks for help. Claude calls this a Skill. GitHub Copilot supports something similar through a custom instructions file. Whatever the tool, a skill for this phase should:

- Load the phase's standard practice baseline (DORA's delivery metrics) and the team's own configured thresholds for what counts as a regression, so the AI is reasoning against agreed numbers instead of guessing.
- Stick to the outputs this module's research actually shows AI being trusted with: a summary of what is in a release, a classification like Kayenta's promote, marginal or roll back, and a proposed fix for a broken pipeline. Not a decision by itself.
- Treat a marginal or ambiguous case as something to flag, not something to resolve. If a canary score falls in the grey zone, the skill's job is to say so and name who needs to look at it.
- Attach a named human to anything it produces before that output counts as part of the release record.

This is a description of what such a skill should do, not a claim that one has been built. Building and testing it is later work, not something this research set covers.

## Relevance to GitHub Copilot

NBN's engineers use GitHub Copilot. Here is where it already fits this phase, and where it doesn't.

What Copilot does today, on GitHub's own documentation: Copilot CLI can run as a step inside a GitHub Actions workflow, triggered on a schedule or a repository event, to summarise activity, generate reports, or draft a changelog update as a pull request for a person to merge. Separately, GitHub's generated release notes already credit the human who directed a Copilot coding agent's pull request alongside the agent, rather than crediting the agent alone. That's exactly the authorship pattern this module recommends for the rest of the phase.

Copilot does not do canary judgement or automatic rollback. Those are not documented Copilot capabilities. That is the job of a purpose-built tool like Kayenta, which would sit alongside Copilot in NBN's pipeline rather than replace it. A team using this module's methodology with Copilot as its main assistant should expect to pair it with a tool like that for the judgement and rollback parts of this phase, and use Copilot for the code, the pull request and the documentation side it already covers.

## Metrics for success

- **DORA's delivery metrics** (still often called the four keys, though DORA's site now lists five), read together rather than individually: change lead time, deployment frequency and failed deployment recovery time as throughput, change fail rate and deployment rework rate as instability. This phase's automation should be judged against all five, not just how much faster releases go out.
- **Throughput moving without stability moving with it is a warning sign, not a win.** DORA's 2025 report found AI adoption correlates positively with throughput but still negatively with delivery stability overall, and ties the gap to whether the team already has strong automated testing, mature version control, and fast feedback loops. A team should expect this phase's AI tooling to help only once that underlying discipline is in place, not as a substitute for it.
- **The canary/rollout classification split over time** (Kayenta-style: % auto-promoted / % escalated to a human / % auto-rolled-back), tracked as a leading indicator of how much of this phase is actually running unattended versus needing a person, and whether that ratio is drifting in a direction anyone approved.

## How this differs by experience level

- A less experienced engineer should operate within gating thresholds and rollback triggers someone else has already set and approved. They should flag or escalate a marginal classification rather than resolve it themselves.
- Setting and tuning the actual thresholds, what score counts as marginal, what counts as a regression, is judgement work. Kayenta routes anything marginal to a human rather than resolving it automatically, and in practice that person should be a senior engineer or release owner, not whoever happens to be on call that day.
- Reading an AI-drafted release summary or release notes against the real diff before accepting it is not experience-gated. The verification step in this module applies the same way regardless of seniority.

## What this stage does not cover

- Whether the release should ship at all. That decision is made at Gate 3, "Release approved", before this phase starts.
- Security scanning of the code being released. That is the Security Gate, upstream of Gate 3.
- Runtime monitoring, incident response and the operational feedback loop once a release has fully promoted. That is Maintenance and Operations.

## Open questions

Both of these need an answer from NBN, so neither can be closed from research alone.

- **Who owns the rollback thresholds, and how much regression is tolerable before the system acts on its own?** This is the same open gap the storyboard walkthrough flagged as "no definition of what counts as risky code". Assumption until NBN confirms otherwise: no owner or threshold has been set yet, so any of this phase's automation should escalate to a human rather than act alone. Sensible approach: thresholds start conservative, are approved by a named person, and get reviewed after any rollback fires, tightening or loosening only with that person's sign-off. To close this, NBN needs to name who owns the decision and confirm the actual regression tolerance once set, for example how far a change fail rate or a latency figure has to move before it counts as a regression.
- **What does this phase's AI tooling cost at NBN's release volume?** This is the same gap the storyboard walkthrough raised for the cycle as a whole. Assumption until NBN confirms otherwise: we have no release volume or budget figures to size this against. Sensible approach: estimate cost as release count times analyses per release (one canary judgement plus however many pipeline triage runs a typical release needs) times the cost per analysis for whichever vendor NBN uses, then run a small pilot on one pipeline or one release train with a fixed spending cap before wider rollout, so the estimate gets replaced with a real number early. To close this, NBN needs to tell us current release frequency, which tools would actually be used, and who owns the budget line.

## Key takeaways

- AI in Deployment speeds up the mechanics: canary judgement, pipeline triage and release notes. Nothing found gives it outright go or no go, or rollback, authority, and this module treats that as a deliberate boundary rather than a gap the technology will eventually close.
- That speed-up is conditional: DORA 2025 shows it improves throughput but not stability unless the team's underlying delivery discipline (testing, version control, feedback loops) is already strong. We treat that discipline as a precondition for adopting this phase's AI tooling, not an assumption.
- Every recommendation an agent produces in this phase, whether a score, a judgement or a proposed fix, needs a named human decision attached to it in the release record, consistent with how attribution already works upstream. When the AI and a human disagree, the human's read wins and the disagreement itself gets logged.

**Research behind this module:** [research/modules/deployment.md](../../research/modules/deployment.md)
