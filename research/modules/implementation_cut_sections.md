# Cut from the Implementation module, 2026-10-26

Removed to keep the module focused on what a developer following it can act on. Neither
section is wrong, and both are sourced in `implementation.md`. They are kept here so they
can be placed somewhere they fit rather than lost.

**Where these probably belong.** Metrics for success is measurement policy: a developer
working through a change cannot act on change failure rate or churn trends, but whoever owns
measurement can. The governance module or a measurement appendix is the likelier home. The
experience-level guidance is advice rather than procedure, and nothing in the workflow
depends on it, so it could sit in an onboarding or training document.

**One cross-reference died with them.** The seniors bullet referred to "the measured-versus-felt
gap above", which pointed at the METR finding in Metrics for success. If either section is
reinstated on its own, that phrase needs replacing with the finding itself.

---

## Metrics for success

- **DORA's four keys** (deployment frequency, lead time, change failure rate, time to restore) remain the delivery baseline. Segment them by AI-authored versus human-authored changes, or the signal disappears into the average.
- **Track measured cycle time, not felt speed.** A randomised trial of experienced open-source developers found they took 19% longer with AI while believing afterwards they had been 20% faster. The sample was small and the tooling has moved on, but the gap between measured and felt speed is the reason to measure.
- **Track duplication and churn, not just test-pass.** Code can degrade while every test stays green. Analysis of 211 million changed lines found copy-pasted lines overtook moved lines for the first time in 2024, moved lines being the usual proxy for refactoring. The same analysis reports two-week churn rising from 3.1% to 5.7%, which rests on the vendor's own figures rather than independently confirmed ones.
- **Track what the checks are catching.** Defects found by the human review or the independent-session review that self-review missed, hardening rounds per work package, and items still unverified at the PR. If these drop to zero, either the work got easier or the checks stopped being run, and the difference matters.

Note: the module keeps a short measurement step in its "In practice" rollout section, under
"Measure and tune". It compares change failure rate and rework rate against a pre-rollout
baseline and names which of the phase's settings to tighten. Anything reinstated from here
should not duplicate it.

---

## The 25% adoption trigger, cut from "Measure and tune"

This was the module's previous "Measure and tune" step. It was replaced because its adoption
measure cannot be relied on yet: adoption was defined as the share of merged pull requests
carrying an `Assisted-by:` trailer, and the module's open questions assume the trailer is
neither mandatory nor checked. Until it is, that share measures how often people remember the
trailer rather than how much AI is used. The 25% figure was also the team's own chosen review
point rather than a published threshold. Worth reinstating, in governance or a measurement
appendix, once the trailer is mandatory and verified, with three things defined first: whether
25% is a relative rise or percentage points, the comparison period, and how much stability has
to fall.

- **Measure and tune (ongoing).** This step is for whoever owns measurement rather than the developer in the loop. Track PR cycle time, review time, change failure rate, rework rate, time to restore, and duplication and churn, segmented for AI-authored pull requests. Stability here means change failure rate and rework rate as DORA defines them, which is how DORA's 2024 model groups stability. Time to restore is still worth tracking, but that model counts it under throughput rather than stability. Adoption means the share of merged pull requests carrying an `Assisted-by:` trailer, which is a second reason the trailer check matters. Benchmark to escalate: if adoption rises by 25% or more while stability falls, enforce smaller batch sizes and tighten the security gate before expanding use. The 25% is our chosen review point, not a level at which published research identifies a change. It is the increment DORA used to model the association, which makes it a convenient place to look rather than a threshold being crossed.

---

## How this differs by experience level

- **Juniors: over-reliance and skill-erosion risk.** LLVM reserves "good first issue" tickets for human learning and advises new contributors to start with small contributions they can fully understand, which is the clearest published statement of the concern. Attempt the problem before prompting, use AI to explain rather than to author unread code, and keep work packages small enough to follow end to end.
- **Seniors: review-complacency risk.** The near-miss that reads correctly is most dangerous to a skim-reviewer, and the measured-versus-felt gap above shows experts misjudge their own AI-assisted work. Treat an AI-authored change with the scrutiny of an unfamiliar contributor's, own the sign-off rather than delegating it, and act as the independent human reviewer for others' branches with a higher-risk package.

The checks are the same for both. Experience changes how much weight to put on the agent's
own findings, not whether the checks apply.

**Sourcing caveat worth keeping with this text.** The research file records that
controlled-study evidence isolating junior against senior comprehension outcomes is thin.
Skill erosion is a well-supported concern, not a settled quantified finding, and should not
be written as one wherever this text ends up.
