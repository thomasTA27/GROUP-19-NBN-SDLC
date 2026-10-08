# Stage: Implementation
SWEBOK defines construction as including verification. Design and acceptance criteria arrive as inputs, so the job here is conformance-checking instead of decision-origination.

## How AI changes the implementation phase in the SDLC
**AI proposes, humans decide:** inline completion, chat-based generation, refactoring suggestions, test scaffolding, code explanation/summarisation, PR-description drafting.

**AI performs the task, with the human approving the finished change, rather than each step:** multi-file agentic editing (agent mode) and the asynchronous coding agent. The human doesn't approve each edit, but the work cannot land without them. The coding agent opens a draft PR that a human must mark ready and merge, and it cannot approve its own PR.

This module covers interactive use, where the developer is present during the work. The asynchronous coding agent, which works alone and opens its own draft pull request, is out of scope. The checks below assume a human is there as the change is made, and nothing here has been tested against unattended agent work.

## Artifacts generated

Implementation produces six outputs, each consumed by a later step:

- **The diff** (Reviewers)
- **Unit tests** (Testing & QA)
- **Updated instruction files** (readiness layer, for the next cycle)
- **The commit with its attribution trailer and sign-off** (provenance record)
- **The pull request with description, test plan and caveats** (reviewers, then the Security Gate)
- **CI results** (the merge decision)

The caveats section carries what the checks found and could not settle. For example, the agent's findings on the commit message, claims left unverified, spec conflicts raised but not yet answered, and any control found missing at Step 0. A PR template with an explicit caveats heading is what makes those visible rather than lost in prose.

## The AI-Assisted Workflow & cycle of implementation

### 0. Baseline and controls

**Where to start the agent.** Open the agent from the project folder, not a parent directory. Settings, hooks, instruction files and custom agents load relative to where the session starts, so a session opened one level up silently loses them. A project nested inside another repository is worse, because commit hooks and CI belong to the outer repository and will not fire for the inner one whatever else is configured. 

**Baseline.** Run every check the project already has and record what fails. A failing baseline is recorded as known and is not fixed in this change.

```
Run these checks now and change nothing. <build> <lint> <typecheck> <test> <dependency audit>. For each one paste the last lines and the exit code. Do not install, upgrade or fix anything. Then run git status and tell me whether any file changed, and which.
```

**Controls.** Confirm the controls are in effect rather than merely present. Commit hooks fire on a test commit, CI runs on a pull request from this folder, instruction files load in the agent, and a secret, dependency and SAST scanner exists. Note anything missing in the PR.

**Model version.** Record the agent and model version now and check it again at the end. Tools update mid-session, which changes behaviour and makes the recorded attribution wrong.

### 1. Intent and Solution Shaping. 
Before anything is written, the developer states what to build and how the change should be structured, and the agent turns that into a plan to approve. The output is a list of work packages, each naming the acceptance criteria it covers, the files it may change and what it must not change. Approve the plan before any code exists. 

Task size is the strongest predictor of success, and scope matters more than line count. Keep packages small enough that one failure is easy to locate.

This is also where spec conflicts first surface. Anything the agent flags as contradictory goes to the Gate 1 owner as a spec change request rather than being resolved here.

```
Read <spec, design and rule files>. Do not write code yet. Ask me anything you need to know, then list work packages of at most <number> files each, with the acceptance criteria each one covers, the files it may change and what it must not change. Flag any place where two inputs contradict each other. Wait for my approval.
```

On the CLI, run this in plan mode so no files change during planning. In VS Code, use Ask mode.

### 2. Generate. 
The AI writes; the developer directs and verifies actively rather than watching passively.

### 3. Verify in flight. 
Read the diff, run the checks, re-prompt. This is the Human-Verification checkpoint, firing on every generation. Reading the diff works while the change is mostly production code. Once hardening rounds add gap tests, tests come to dominate the diff and the mutation table replaces it as the check. See Running the loop below.

### Within the loop
The loop runs from steps 1-3 many times per hour and two kinds of rounds exist. Most rounds are corrective, meaning the output was wrong and you re-prompt. Repeated corrective rounds on the same piece of work signal that the task was scoped too large or specified too loosely, and the right move is to re-scope or take over directly rather than re-prompt again. 

A hardening round is different. The output was right, it passed, and review found a gap worth closing, such as a missing check, an unhandled edge case, or a mutation the tests did not catch. These do not mean the scope was wrong. In the test run every package was small and every first output passed, yet all eleven needed one to three hardening rounds. Count the two separately, and do not let a limit meant for failed generations stop work that is still finding real defects.

**Session length.** Cost in this phase is driven by context re-reading rather than by generation. Start a new session at each work package rather than carrying one across the whole change. Carry forward only what the next package needs, which is the decisions made so far, any open spec change requests, and the unverified list.

**Reviewing tests.** Once gap tests and mutations are added, tests dominate the diff. In the test run they reached about three quarters of the added lines, at which point reading the diff stops being a usable check.

Review a mutation table instead. Ask the agent to make small changes that should break a test, run the suite after each, and report which tests failed. A surviving mutation means the test does not assert what it appears to. Read the table, not the test code, and require a proposed test or a reason for every survivor.

### Exit condition. The loop ends when the change is understood, not when the tests are green.

Before accepting, the developer writes the commit message by hand, covering how the change works and not only what changed. The agent then checks it against the diff and reports what was wrong or left out, without giving the answer first. Record what it finds in the PR caveats.

Writing the message by hand is ordinary practice while having the agent mark it is this methodology's proposal. Where an agent drafted the message, the check runs in a separate session or on a different model, since the model that wrote the code cannot mark its own explanation.

This records that the check ran. It does not stop someone passing off an AI-written explanation. What makes it binding is the Signed-off-by: trailer certifying the signer reviewed any AI-assisted content. See [white-paper/governance/](../governance/)

```
Stage only these files: <file list>. Do not commit. Then print the staged file list and anything staged that I did not name.
```

```
Check this commit message against the diff. Tell me what I got wrong or left out, without telling me the answer first.
```

**What to do with the findings.** The agent's response falls into three cases. If the message was inaccurate, fix the message. If the message was right and the code does not do what it says, fix the code. If the agent is wrong, say so in the caveats and move on, since the check is a prompt rather than an authority. Recording which of the three applied is what makes the check visible to a reviewer; recording only that it ran is not.

## What to ask the AI

Examples use VS Code syntax. On the CLI, use plain file paths instead of `#file:`

Examples tied to acceptance criteria and grounded in GitHub's prompt-engineering principles:

**Scoped generation:** 
```
#file:orderService.ts implement validateDiscount() to satisfy AC-14; reject negative totals; do not change the public signature
```

Three parts: which file, which acceptance criterion, and a constraint on what must not change. AC-14 is a placeholder for a real ticket reference. The "do not change the public signature" clause exists because AI routinely modifies things it wasn't asked to, naming the boundary up front is cheaper than catching the drift in review.

**Refactor without behaviour change:** 
```
Rewrite the error handling in #selection without changing the public API or observable behaviour
```

Refactoring means restructuring code while keeping behaviour identical. Saying so explicitly matters because AI will otherwise "improve" behaviour while it's in there, which turns a safe refactor into a risky change.

**Edge-case elicitation:**
```
Explain #selection and list edge cases it does NOT handle
```

This one isn't asking for code. AI over-fits the happy path, so you ask it to name its own gaps. The answer becomes either your test list or your list of bugs to fix. Note it works on code you wrote too, not just AI-generated code. In the test run this prompt found two bugs, the only one of these five patterns with measured results behind it.

**Bounded test generation:** 
```
@workspace /tests generate unit tests for #file:auth.ts covering token expiry and refresh only
```

"Only" is doing the heavy lifting. Open-ended test requests produce dozens of shallow tests that inflate the diff and pad coverage without asserting anything real. Naming the two behaviours you care about keeps the change small and reviewable reflecting the small-batch principle. Bounded tests are the starting point, and once hardening rounds add gap tests, review the mutation table rather than the diff.

**Self-review:** 

```
Review your own diff for security issues and unhandled errors before I accept it
```

Ask before you accept. It is free and catches some obvious problems, but GitHub warns Copilot code review can hallucinate problems that do not exist, and it can equally miss real ones. It does not replace the independent review in checklist (f). The two are complementary rather than ranked. In the test run the self-review found defects the independent reviewer missed, and the independent reviewer found defects in five packages the self-review missed. Run both on higher-risk changes.

## Before opening the PR
**Spec conflicts.** Implementation treats the spec as settled, but conflicts surface here anyway, usually when two acceptance criteria cannot both hold. Raise a spec change request to the Gate 1 owner in Design's SCR format. Do not wait for the answer. Build to one side, name which and why in the SCR, and treat the choice as reversible. List the conflict in the PR caveats so a reviewer knows a decision was made that Planning has not confirmed.

**Unverified claims.** Agents state things about libraries, APIs and platform behaviour with the same confidence whether or not they are true, and these claims are not visible in the diff. At the end of each work package, ask the agent what it asserted without checking. Probe anything that matters with a throwaway script, and carry the rest into the PR caveats. Doing this only at the end of a change does not work, because by then the session is too long to recall accurately.

```
List everything you stated or assumed in this work package that you did not run or read in the source. Include library behaviour, API responses, platform limits and browser behaviour. For each one give the claim, why it is unverified, and the exact check that would settle it.
```

**Run it in a developer environment.** Tests and a clean diff do not show that the change works. Before opening the PR, run the change against a dev environment and walk the acceptance criteria it claims to satisfy. A person does this, not the agent. Record which criteria were confirmed and which could not be checked, and put anything unconfirmed into the PR caveats. Finding a failure here means going back through the loop, which is the step working rather than failing.

## What to verify before accepting output
Security checks run inside this phase rather than waiting for the gate. Secret, dependency and SAST scanning apply to AI-authored diffs as they are produced, which is what checklist (d) enforces. The Security Gate consolidates and confirms and it is not the first line of defence.

Risk tiers are defined in [white-paper/governance/](../governance/). This phase applies them to item (f) only. The second human reviewer stays on governance's narrower escalation list, because review capacity is the constraint this phase is trying not to make worse.

**Checklist:**

- **(a)** Has the exit condition been met, with the agent's findings on the commit message recorded in the PR caveats?
- **(b)** Does the change satisfy the stated acceptance criterion and nothing more?
- **(c)** Do the tests assert real behaviour? Run the mutation check and read the table.
- **(d)** Do the scans pass on the diff? Secret, dependency and SAST scanning, plus a check that any new dependency actually exists and is the intended package. Where a scanner is missing, Step 0 recorded that, and it goes in the PR caveats.
- **(e)** Has every factual claim the AI made about a library, API, platform or browser been probed or listed as unverified in the PR? A probe is a throwaway script that runs once and is deleted, not a test that lands in the suite.
- **(f)** Has a reviewer that did not write the code reviewed the change? Required for higher-risk changes as defined in [white-paper/governance/](../governance/), and once over the whole branch before the PR. May be skipped for lower-risk code, with the skip and the reason recorded in the PR caveats.
- **(g)** Does the repository still describe itself accurately? Instruction files and docs match the code, and the added lines are free of text hazards such as non-ASCII characters, mixed tabs and spaces, or inconsistent line endings.

**Prompts to assist verifying output**

(c)
```
For <files>, list <number> small changes that should make a test fail, such as removing a check, reversing a condition, or changing a limit. Apply them one at a time. After each, run <test command>, record whether a test failed, then restore the file exactly and show its hash before and after. Do not edit any test while a change is applied. Give me a table of the change, the number of tests that failed, and whether it was killed or survived. For each survivor, propose a test or say it is dead or equivalent code.
```

(f)
```
Review <diff range or files> as someone who did not write it. Read the code and do not rely on the author's summary. Check only who can read or write data, where input is validated, where errors are shown to users, where secrets are read or logged, and where data is deleted. For each finding give a severity, the file and line, and the input that triggers it. Do not change any file.
```

(g)
```
Compare <instruction and doc files> with the code in <diff range>. For every claim about file paths, exports, commands, environment variables or rules, say whether the code agrees. Separate the findings into the doc is wrong, the doc is incomplete, and the code looks wrong against the doc. Give file and line. Do not change any file.
```

(g)
```
List every added line in <diff range> that has a character outside printable ASCII, a tab where the file uses spaces, or a line ending that differs from the rest of its file. Show file, line and the character code. Do not change any file.
```

## Governance and security touchpoints

- **Secrets in generated code**, secret scanning on the diff.
- **Hallucinated dependencies (slopsquatting)**, verify every AI-suggested package against the registry before install. The USENIX Security 2025 study "We Have a Package for You!" found that roughly 20% of AI-generated code samples reference packages that do not exist.
- **Licence/IP risk** from generated code.
- **Content exclusion.** Configure the tool so it cannot read sensitive repositories or files. In Copilot this is content exclusion, set by a repository, organisation or enterprise admin. In Claude Code it is deny rules in the settings file. Note that Copilot's content exclusion is **not supported** in Edit or Agent modes, so it does not cover the agentic work this phase describes.

**Escalation triggers:** any secret detected, any dependency that cannot be verified, any high-severity SAST finding on an AI-authored diff.

## How authorship is recorded

Attribution is recorded at commit time. Accountability is recorded at review and merge. Both sit in the governance band that runs under every phase, so this section covers only what Implementation is responsible for producing.

**Attribution.** Every commit containing AI-assisted content carries an `Assisted-by:` trailer naming the tool and model, following the Linux kernel convention:

```
Assisted-by: Copilot:gpt-5
```

Put this convention in .github/copilot-instructions.md rather than restating it per prompt. A convention that has to be remembered each session will eventually be missed, and the commit it is missed on is the one that matters.

Where the model changes during a change, or a reviewer runs on a different model, record each tool and model used rather than only the last. Multiple Assisted-by: trailers on one commit are the simplest way to do this, and are this methodology's extension rather than part of the Linux convention. Check the model version at the start and end of a session, since tools update mid-run and the recorded version silently stops being accurate.

**Accountability.** The committer adds `Signed-off-by:` certifying NBN's DCO: that they are the accountable human for the change, have reviewed any AI-assisted content in it, and that it complies with secure coding and compliance standards. AI agents must not add `Signed-off-by:`, only a human can make that certification.

Copilot's default `Co-authored-by: Copilot` trailer is not used, because it asserts AI authorship, which conflicts with the position that the human is the author.

**Merge method.** Per-commit trailers and signatures only survive a merge commit or a rebase merge. A squash merge replaces them with a single new commit, so the trailers have to be carried into the squashed message and the per-commit signatures are lost on the merged commit itself.

Where squash is the organisation's convention, the squashed message carries the Assisted-by: trailers for every tool and model used in the change, and the source branch is retained rather than deleted on merge so the signed commits stay reachable. Branch deletion, not the squash itself, is what breaks the provenance chain.

**Sigstore/gitsign.** Plain trailers are not proof. Any trailer can be omitted or added falsely. Where verifiable provenance is required, Sigstore/gitsign binds the commit to an OIDC-verified identity and records it in a public transparency log, rather than relying on a self-reported line in a commit message.

**Accountable person:** the human who signs off and merges the change. At merge, `CODEOWNERS` enforces a named human approver, and higher-risk changes escalate to a second reviewer as defined in governance.

See [white-paper/governance/](../governance/) for more detail

## In practice

A suggested sequence for adopting this phase. These are recommended defaults rather than settled requirements. Where an open question below is unresolved, treat the recommendation as a starting position for NBN to confirm.

- **Encode the readiness layer (week 1).** Ship a tight `.github/copilot-instructions.md` covering the project map, build and test commands, conventions, and the commit rules: the only trailer is `Assisted-by:`, never `Co-authored-by:` or any default the tool adds, and the agent stages only and never commits, amends, signs off or pushes. Keep it short and put non-negotiables first. If agent output routinely ignores a rule, split it into a scoped `*.instructions.md` with an applyTo clause. Instruction files are advisory rather than deterministic, so the commit prompt still prints what was staged as a check.
- **Set up the PR template (week 1).** Five of this phase's steps write into the PR caveats, so the template is a prerequisite. Headings for what the change does, how it was tested, and caveats, with the caveats section covering the commit-message findings, unverified claims, open spec conflicts and any control found missing at Step 0.
- **Encode the prompts (weeks 2-3).** Provide `*.prompt.md` files for the prompts in this module: baseline, work package plan, staging, commit-message check, unverified claims, mutation check, independent review, docs audit and text hazards. The five generation patterns in "What to ask the AI" are adapted per task rather than shipped as files. Make plan mode the default for step 1 so no files change during planning.
- **Encode what leaves the phase (weeks 3-4).** Verify the trailers with a commit hook or CI check. Apply `CODEOWNERS` so every change has a named human approver, and branch-protection rules requiring SAST, secret scanning and dependency verification as blocking status checks, which are server-side enforcement rather than editor-side hooks. Confirm the merge method preserves trailers and signatures, or that merged branches are retained if squash is the convention. Enable Copilot code review as a supplement only as it defaults to a non-blocking "Comment" review and GitHub states it must not replace human review.
- **Measure and tune (ongoing).** Track measured PR cycle time, review time, change failure and rework rate, and duplication and churn, segmented for AI-authored PRs. Benchmark to escalate: if a 25% or greater rise in AI adoption coincides with falling stability, enforce smaller batch sizes and tighten the security gate before expanding use.

This is a lot to run on every change. The full set is what the test run used, and nearly every check caught something, but that was one run on one branch by people who knew they were testing. Expect to tune which checks apply where rather than running all of them indefinitely. Which ones survive contact with a real team is itself an open question.

## Metrics for success

- **DORA's four keys** (deployment frequency, lead time, change failure rate, time to restore) remain the delivery baseline. Segment them by AI-authored versus human-authored changes, or the signal disappears into the average.
- **Track measured cycle time, not felt speed.** METR July 2025 RCT: experienced developers took 19% longer with AI while believing they were 20% faster, showing a perception to reality gap.
- **Track duplication and churn, not just test-pass.** Code can degrade while every test stays green. GitClear's 2025 report found copy-pasted lines overtook refactored lines for the first time in 2024, and two-week churn rose from 3.1% to 5.7% across 211 million changed lines.
- **Track what the checks are catching.** Defects found by independent review that self-review missed, hardening rounds per work package, and items still unverified at the PR. In the test run these were five of eleven packages, one to three rounds per package, and twenty-one items. A phase where these drop to zero means either the work got easier or the checks stopped being run.

## How this differs by experience level

- **Juniors: over-reliance and skill-erosion risk.** LLVM reserves "good first issue" tickets for human learning and advises new contributors to start with small contributions they can fully understand, which is the clearest published statement of the concern. Attempt the problem before prompting, use AI to explain rather than to author unread code, and keep work packages small enough to follow end to end.
- **Seniors: review-complacency risk.** The near-miss that reads correctly is most dangerous to a skim-reviewer, and METR shows experts misjudge their own AI-assisted work. Treat an AI-authored change with the scrutiny of an unfamiliar contributor's, own the sign-off rather than delegating it, and act as the independent reviewer for others' higher-risk changes.

The checks are the same for both. Experience changes how much weight to put on the agent's own findings, not whether the checks apply.

## What this stage does not cover

- Architectural/design decisions (upstream)
- Comprehensive test strategy and QA (Testing phase)
- The consolidating security gate and release/deploy/operate concerns
- Unattended agent work. The asynchronous coding agent commits and opens its own pull request without a developer present, so this module's checks do not apply as written.
- Requirements and acceptance criteria (Planning, approved at Gate 1). Conflicts found here go back as a spec change request rather than being resolved in this phase.

The implementation phase produces a verified change and its immediate unit tests, not the test strategy, not the release.

## Open questions

- **Is the attribution trailer mandatory, and is it verified?** Assumption until NBN confirms otherwise, no trailer is mandatory and none is mechanically checked. Sensible approach, mandate both trailers by policy and verify their presence with a commit hook or CI check. To close this, NBN needs to decide whether trailer presence blocks a merge.
- **Do AI-authored pull requests need a different review standard?** Assumption until NBN confirms otherwise, AI-authored and human-authored changes are reviewed identically. To close this, NBN needs to decide whether AI authorship is itself a risk tier, or whether risk is assessed purely on what the code touches.
- **Should security scanning block the merge?** Assumption until NBN confirms otherwise, no scanning is mandatory at merge. Step 0 makes a missing scanner visible but does not stop the change. Sensible approach, require SAST, secret and dependency scanning as blocking status checks through branch protection, which is server-side rather than editor-side. To close this, NBN needs to confirm which scanners it runs and whether branch protection can make them blocking.
- **Which Copilot surface do NBN's developers use?** Assumption until NBN confirms otherwise, both VS Code and the CLI, with no standard. Plan mode is CLI-only and the `#file` syntax is VS Code, so some guidance applies to one surface only. To close this, NBN needs to confirm which surfaces are in use.
- **Which merge method does NBN use, and are merged branches retained?** Assumption until NBN confirms otherwise, squash merge with branches deleted, which leaves attribution resting on the squashed message alone. To close this, NBN needs to confirm its merge and branch retention conventions.
- **How should a reviewing model be recorded?** A model that reviewed the code did not author it, so `Assisted-by:` conflates two contributions and no convention exists. Assumption until NBN confirms otherwise, reviewer models go in the PR rather than a commit trailer.
- **Does this module's workflow hold for unattended agent work?** The asynchronous coding agent commits and opens its own pull request with no developer present, so the staging rule and the in-loop checks cannot apply as written. To close this, the workflow needs running against an agent-authored PR.
- **Which checks survive daily use?** Nearly every check in this module caught something in the test run, but that was one run by people who knew they were being observed. Assumption until tested, teams will drop the checks with the highest effort-to-finding ratio first. To close this, the workflow needs running by a team over several weeks without the testers present.

## Key takeaways

- **Implementation is a verification phase.** The design and acceptance criteria have already been decided. The developer's job is checking that the code conforms to them, which is why the checkpoint here is Human-Verification oriented.
- **Verification happens on every generation** many times an hour, not once at the end of the phase.
- **Scope the task small.** Task size is the strongest single predictor of whether AI-assisted work succeeds. Small, well-specified changes succeed far more often than large or vague ones, and they stay reviewable.
- **The loop ends on comprehension, not on green tests.** The developer writes the commit message by hand and the agent marks it against the diff. Passing tests are necessary but not sufficient.
- **Preparation does more than prompting.** A baseline check, working controls and short instruction files change outcomes more than better prompts do, and the cost is paid once.

**Research behind this module:** [research/modules/implementation.md](../../research/modules/implementation.md)
