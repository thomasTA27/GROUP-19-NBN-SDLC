# Stage: Deployment

_Notes: release approved at Gate 3, going to production. This phase is orange on the agreed map, a human decision, not a blocking automated gate._

## What changes: traditional vs AI-native

### Standard practice, without AI

A release that has cleared Gate 3 moves through a continuous integration and delivery (CI/CD) pipeline via a progressive rollout (canary, blue-green or rolling) to keep the blast radius of a bad release small and keep reversing it cheap. The DevOps Research and Assessment (DORA) delivery metrics (see Metrics for success below) are the standard measure of this phase's health: smaller, more frequent releases carry a lower change fail rate than large, infrequent ones. Traditionally, a person or on-call rotation watches the rollout and either promotes it or triggers a rollback; automated rollback, where it exists, is usually a hard, pre-set threshold with no judgement beyond it.

### How AI changes this

Nothing in the research gives AI outright go/no-go or rollback authority here. It takes over the mechanical parts of the process above that used to need a person watching a dashboard or reading logs.

- **Judging a canary automatically.** An automated canary analysis (ACA) engine, such as Kayenta, compares a canary's metrics against baseline and returns a score that auto-promotes on success, auto-rolls-back on failure, and routes only the ambiguous middle, what ACA tooling calls marginal, to a human.
- **Triaging a broken pipeline.** GitLab Duo's Root Cause Analysis reads failed CI/CD job logs and proposes a cause and a fix, cutting the manual log-reading step before a release reaches the gate.
- **Drafting what shipped.** Release notes, previously written by hand, are increasingly AI-drafted from a release's merged PRs and commits, with GitHub crediting the human who directed that work alongside the agent.

The best current industry evidence, DORA's 2025 State of AI-assisted Software Development report, finds this increases throughput but shows a negative relationship with delivery stability, a gap tied to team discipline: teams with strong testing, version control and feedback loops see real gains, teams without don't. Our recommendation: treat that discipline as a precondition, not a footnote. Don't turn on this phase's AI release automation until it's in place, or you get exactly DORA's pattern of throughput up, stability flat. We also treat the absence of full rollback authority as a deliberate boundary, not a gap the technology will close (see Governance below).

## How to execute this phase

A chronological runbook from Gate 3 sign-off to full production traffic. Each step names who acts: a human, the ACA tool, or the deployment-review skill.

1. **Pre-rollout verification (human).** Confirm Gate 3's sign-off is recorded and named, and run the AI release summary against the diff to check what actually changed. Confirm baseline telemetry (error rate, latency, saturation) is healthy: an already-degraded baseline will misclassify the canary.
2. **Initial traffic routing and canary step (human, then ACA tool).** A human routes the release to its initial slice (e.g. a 5-10% canary or the first rolling node); the ACA tool scores that slice's telemetry against baseline and pre-approved thresholds.
3. **Telemetry scoring and triage (ACA tool, deployment-review skill, human).** The ACA tool classifies its score as Promote, Marginal, or Rollback against the pre-agreed thresholds. The deployment-review skill checks the release delta and record completeness in parallel, and writes a plain-language readout of the ACA result.
   - **Promote**, from the ACA tool within pre-approved thresholds, continues automatically to the next traffic step.
   - **Marginal** doesn't resolve automatically. Escalate to the named person holding rollback authority with the skill's readout and the triggering metrics, and hold traffic until they decide. Agree a maximum hold time in advance; if it runs out, escalate further, never promote by default.
   - **Rollback**, from the ACA tool within pre-approved thresholds, fires the pre-agreed rollback procedure immediately, without waiting on a human to confirm it.
   - If Gate 3 sign-off cannot be confirmed, that is a **Hold**, not a Rollback: do not start or continue the rollout, and escalate to a named person.
   - A **Flag** from the deployment-review skill pauses any automatic Promote until the named person has reviewed it and recorded their decision. A Flag can hold a release, never advance one.
4. **Final promotion or rollback (ACA tool or human).** Once every canary step clears, or a human resolves a Marginal case, promote to 100% traffic. Accountability sits with whoever made the call: the human who resolved it, or for an automatic Promote or Rollback, whoever approved the ACA tool's thresholds. A GitHub Environment with required reviewers is one way to hold a rollout open for that person.
5. **Recording and audit logging (human, with AI-drafted inputs).** Generate the release record and changelog with this module's human attribution: who approved at Gate 3, who directed any AI-assisted work, and who made the promote or rollback call. Attach it to the deployment ticket or GitHub Release; NBN's compliance team should confirm separately whether it meets their audit requirements.

This runbook assumes the thresholds, canary slice sizes, and kill-switch ownership it references are already set. Where they are not, see Open questions below: stop and escalate rather than letting any of the above run unattended.

## Artifacts generated

- **Release/rollout record.** What shipped, its canary classification, and the promote, rollback, or hold decision, with a named human against each (see How authorship is recorded), attached to the deployment ticket or GitHub Release.
- **Canary classification score** (e.g., a Kayenta-style 0-100 score), computed by the ACA tool against pre-approved thresholds; drives promote or rollback for clear-cut cases, handed to a person when Marginal.
- **Deployment-review readout.** The skill's Clear or Flag output: a plain-language summary of the release delta, record completeness, and the ACA result, with a reason and a named person to look at it if flagged.
- **Pipeline failure triage output.** A proposed root cause and fix, attached to the failed CI/CD run.
- **AI-drafted release notes / changelog.** From merged PRs and commits, reviewed by a person before publishing; GitHub's release notes already pull from merged PRs, and Copilot CLI can draft the same as a PR for review.
- **Incident record.** Produced only if a rollback fires, feeding into Maintenance and Operations and back into Planning as next-cycle intent.

A sample release record, using placeholders rather than made-up numbers:

```
Gate 3 approval: <name>, <date>
Rollout steps: canary <percent> -> <percent> -> 100%
ACA verdict: score <score>, classification <Promote|Marginal|Rollback>
Decision: <Promote|Rollback|Hold> by <name>, reason: <text>
AI-assisted work directed by: <name>
Outcome: <text>
```

The release record itself needs no new tooling at NBN, just the habit of treating an AI-drafted summary as a first draft attached to it, not read once and thrown away.

## What to ask the AI

- Summarise what's in this release (changed endpoints/services, anything unusual like a schema change or dependency bump) so the approver gets a short summary, not the raw diff.
- Triage a failed CI/CD pipeline run: read the logs, propose a root cause and fix.
- Check a release's delta and record completeness, and summarise the ACA tool's result in plain language: Clear, or Flag and to whom.
- Draft release notes and changelog entries from merged PRs, crediting the human who directed the work even where an agent opened it.

## What to verify before accepting output

- That an AI-generated release summary matches the diff, not how plausible it reads.
- That a Clear or Flag from the deployment-review skill is an input to a named person's decision, not the decision itself; accountability stays with the engineer who ships it.
- That an AI-proposed root cause is checked against the actual logs before its fix is applied.
- That the ACA tool's thresholds were reviewed and approved by a named person, not left at a vendor's default; wrong in either direction, they block good releases or let bad ones through.
- That AI-drafted release notes are read before publishing. This output is non-deterministic, and vendor guidance recommends human review for anything that matters.

## Governance and security touchpoints

- Giving this phase's automation standing production credentials widens its own attack surface; scope those credentials as a security review item, not just an ops convenience.
- A named person, or role, needs standing authority to halt this phase's automation (a kill switch), set before it goes live, not improvised during an incident. See [white-paper/governance/research.md](../governance/research.md) for the broader human-oversight pattern.
- None of this module's sources say what should happen when the ACA tool's result or the skill's Flag and a human's read of production telemetry disagree. Our recommendation: the human's read wins by default, since that person may know something elsewhere in the system the AI's metrics don't capture. Log the disagreement, not just the final decision.
- NBN's Security of Critical Infrastructure (SOCI) Act obligations, including its Critical Infrastructure Risk Management Program (CIRMP) requirements, mean deploy and rollback automation isn't just a team-level choice; it sits inside a board-approved risk management program (see [white-paper/governance/research.md](../governance/research.md)). Engineers follow NBN's internal policy that implements SOCI, not the Act directly.
- Full cross-cutting AI-use policy lives in [white-paper/governance/](../governance/); this list is only the checkpoints specific to shipping a release.

## How authorship is recorded

Authorship here builds on what Gate 3 already established: a named person approved this release. The record adds what shipped and how much was AI-assisted, against what that person approved.

GitHub's release notes attribution is a concrete, adoptable pattern: a pull request opened by an agent is now credited to the human who directed it ("by @monalisa with @copilot"), not the agent alone. The same applies here: a deployment-review readout or a pipeline fix is a recommendation an agent produced, and the record should show which human accepted it and when, consistent with the commit-trailer conventions used upstream (see [white-paper/governance/research.md](../governance/research.md)).

## A deployment skill for AI assistants

Most AI tools let a team save reusable instructions, a Skill in Claude or a custom instructions file in Copilot, so rules don't need restating every time. A skill for this phase should:

- Read the thresholds the ACA tool used, so the readout can name which one was crossed, but never apply them itself.
- Never classify, score, or compare telemetry itself: the ACA tool already did that against approved thresholds, and the skill only reads and reports that result.
- Check the release delta and record for completeness, flagging anything undeclared or missing rather than resolving it.
- Output only Clear or Flag, never a promote or rollback decision, and name who needs to look at anything flagged.

### What it looks like

A real agent skill, `deployment-review`, at `.github/skills/deployment-review/SKILL.md`:

```markdown
---
name: deployment-review
description: Checks a release's delta and record completeness, and writes a plain-language readout of the ACA tool's result for the human making the promote or rollback call. Use after the ACA tool scores a canary step.
---

# Deployment review

This skill never scores telemetry, classifies a canary, or triggers a promote, rollback, or hold: the ACA tool already did that against approved thresholds. It makes that result easier for a human to act on, and catches what the ACA tool cannot see.

## Checks

1. Release delta: read the merged diff and list every changed service, endpoint, and schema change or migration; flag anything not declared in the release ticket.
2. Record completeness: confirm the release record has a named Gate 3 approval and the other required fields; flag anything missing.
3. ACA readout: read the score and classification the ACA tool already produced, do not recompute it, and summarise it in plain language, including what triggered a Marginal or Rollback result.

## Output

Clear or Flag, never a promote, rollback, or hold decision.

- Clear: the release delta is fully declared, the record is complete, and the ACA result shows no problem.
- Flag: state the reason and name who needs to look at it. If the ACA tool's output is missing or unreadable, flag it rather than guessing a result.
```

The same folder works under `.claude/skills` for Claude too; Copilot CLI reads both locations. The module's other two jobs get the same treatment: `release-notes` drafts changelog entries from merged PRs and must credit the directing human, never publish unreviewed; `pipeline-triage` proposes a fix from CI/CD logs and must cite the log lines used, never apply it.

This slots into a rollout as a pipeline step, not something run by hand:

```yaml
# .github/workflows/deploy.yml (excerpt)
permissions:
  contents: read
jobs:
  deployment-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @github/copilot
      # Earlier steps produce canary-metrics.json and release-diff.json
      - name: Run deployment-review skill
        env:
          COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_GITHUB_TOKEN }}
        run: |
          copilot -p "Use the deployment-review skill on canary-metrics.json and release-diff.json. Write the readout to review-readout.md." \
            --allow-tool 'write(review-readout.md)' \
            --no-ask-user
```

GitHub recommends its separate Agentic Workflows feature over calling Copilot CLI directly for most automation, since it carries extra guardrails suited to running unattended (see "Automating tasks with Copilot CLI and GitHub Actions", [research/modules/deployment.md](../../research/modules/deployment.md#4-github-copilot-cli-automation-in-actions-and-release-note-attribution)).

## Relevance to GitHub Copilot

NBN's engineers use GitHub Copilot. Here is where it already fits this phase, and where it doesn't.

Copilot CLI can run as a GitHub Actions step to summarise activity, generate reports, or draft a changelog PR for a person to merge. GitHub's release notes already credit the human who directed a Copilot coding agent's PR alongside the agent, the authorship pattern this module recommends.

Copilot does not do canary judgement or automatic rollback; those aren't documented capabilities. That's the job of an ACA tool like Kayenta, paired with monitoring (e.g., Datadog/Prometheus), alongside Copilot rather than replacing it. Use Copilot for the code, the PR, and the documentation it covers; pair it with tooling like that for judgement and rollback.

## Metrics for success

- **DORA's delivery metrics** (still often called the four keys, though DORA's site now lists five), read together: change lead time, deployment frequency and failed deployment recovery time as throughput, change fail rate and deployment rework rate as instability. Judge this phase's automation against all five, not just how much faster releases go out.
- **Throughput moving without stability moving with it is a warning sign, not a win** (see How AI changes this for the DORA 2025 finding).
- **The canary/rollout classification split over time** (ACA-style: % auto-promoted / % escalated / % auto-rolled-back), a leading indicator of how much of this phase runs unattended versus needing a person.

## How this differs by experience level

- A less experienced engineer should operate within gating thresholds someone else has already set, flagging a marginal classification rather than resolving it themselves.
- Setting and tuning the actual thresholds is judgement work for a senior engineer or release owner, not whoever happens to be on call that day.
- Reading an AI-drafted release summary against the real diff before accepting it is not experience-gated; this module's verification step applies regardless of seniority.

## What this stage does not cover

- Whether the release should ship at all. That's decided at Gate 3, before this phase starts.
- Security scanning of the code being released. That's the Security Gate, upstream of Gate 3.
- Runtime monitoring, incident response and the operational feedback loop once a release has fully promoted. That's Maintenance and Operations.

## Open questions

Both of these need an answer from NBN, so neither can be closed from research alone.

- **Who owns the rollback thresholds, and how much regression is tolerable before the system acts on its own?** Same gap the storyboard walkthrough flagged as "no definition of what counts as risky code." Assumption: no owner or threshold is set, so automation should escalate rather than act alone. Sensible approach: thresholds start conservative, approved by a named person, and are only tightened or loosened with that person's sign-off after a rollback. To close this, NBN needs to name who owns the decision and the actual regression tolerance, e.g. how far a change fail rate or latency figure must move to count.
- **What does this phase's AI tooling cost at NBN's release volume?** Same gap the storyboard raised for the cycle as a whole. Assumption: no release volume or budget figures exist to size this against. Sensible approach: estimate cost as release count × analyses per release × cost per analysis for the vendor NBN uses, then pilot on one pipeline with a fixed spending cap, replacing the estimate with a real number early. To close this, NBN needs current release frequency, which tools would be used, and who owns the budget line.

## Key takeaways

- AI in Deployment speeds up the mechanics: canary scoring (by the ACA tool, not an LLM), pipeline triage and release notes. No AI skill has go/no-go or rollback authority; this module treats that as a deliberate boundary, not a gap the technology will eventually close.
- That speed-up is conditional on the team's delivery discipline already being strong (see How AI changes this for the DORA 2025 finding).
- Automatic promote or rollback only ever comes from the ACA tool, acting within thresholds a named person already approved. Everything an AI skill produces needs a named human decision attached to it in the release record; when the ACA tool and a human disagree, the human's read wins, and the disagreement gets logged.

**Research behind this module:** [research/modules/deployment.md](../../research/modules/deployment.md)
