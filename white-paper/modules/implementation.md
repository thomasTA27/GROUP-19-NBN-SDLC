# Stage: Implementation

## What changes: traditional vs AI-native

### Standard practice, without AI

SWEBOK v4 defines software construction as coding, verification, unit testing, integration testing and debugging, so checking the work is part of the work rather than a separate stage afterwards. It also names Constructing for Verification as a fundamental: build software so faults can be readily found.

Design and acceptance criteria arrive as inputs here, which makes this phase conformance-checking rather than decision-origination, and is why its checkpoint is Human-Verification oriented. "Conformance-checking" is our framing, not SWEBOK's wording.

### How AI changes this

**AI proposes, humans decide:** inline completion, chat-based generation, refactoring suggestions, test scaffolding, code explanation and summarisation, PR-description drafting.

**AI performs the task, with the human approving the finished change rather than each step:** multi-file agentic editing (agent mode in Copilot). The human does not approve each edit, but the work cannot land without them.

This module covers interactive use, where the developer is present during the work. The asynchronous coding agent, which works alone and opens its own draft pull request, is out of scope.

## Artifacts generated

Implementation produces six outputs, each consumed by a later step:

- **The diff** (reviewers)
- **Unit tests** (Testing & QA)
- **Updated instruction files** (readiness layer, for the next cycle)
- **The commit, with its attribution trailer and sign-off** (provenance record)
- **The pull request, with description, test plan and caveats** (reviewers, then Testing & QA)
- **CI results** (the merge decision)

The caveats section carries what the checks recorded or could not settle. The PR template under In practice gives it an explicit heading and one field per check, which keeps these visible rather than lost in prose.

## Risk tiers

Two checks in this phase scale with risk: the independent human review in checklist item (f), and the number of mutations in item (c). The independent-session review in item (h) runs on every branch, and only its role changes with risk. A change is **lower risk only if** it cannot affect who can read or write data, cannot reach storage, the network or the file system, cannot change what input is accepted, and cannot alter the outcome of any action that does those things. In practice that means presentation and formatting code calling only already-reviewed handlers, where no part of the change is itself what prevents an action from happening.

**Everything else is higher risk**, including anything you are unsure about. What matters is what the code can cause, not what kind of code it is. A button whose disabled state is the only thing preventing an action is higher risk, since removing it changes the outcome of an action that reaches storage.

Set the tier for each work package in step 1. Record a lower-risk classification with its reason; a higher-risk one needs none.

Each check uses the tier at the grain it runs at. The mutation count in item (c) is set per package, since mutations run against that package's files. The human review in item (f) runs once per branch, so a branch needs it if any work package on it is higher risk, and may skip it only if every package is lower risk.

> This follows the canonical tier definition in the governance module, including the button example, and governance owns it for the whole lifecycle, so check there if the two ever differ. Applying it per work package is this module's choice, not part of the definition.

## AI-Assisted Workflow

### 0. Baseline and controls

**Where to start the agent.** Open the agent from the project folder, not a parent directory. In VS Code, agent settings, agent hooks, instruction files and custom agents load only from the folder you open, so a session opened one level up silently loses them. The Copilot CLI also reads instruction files from the repository root and every folder between it and where it started, so in a project nested inside another repository the outer repository's instruction files load alongside yours. Git hooks and CI depend instead on which repository git finds. In a project nested inside another repository, the git hooks and CI you rely on may be the outer one's: if the project is a plain folder inside it, commits run the outer repository's hooks and checks rather than your project's; if it is its own repository, the outer repository's CI never sees its commits. Run `git rev-parse --show-toplevel` from the project folder: if it prints a parent directory, the project is a plain folder inside the outer repository. If it prints the project folder, run it again from the parent folder: if that also succeeds, the project is its own repository nested inside another.

**Baseline.** Run every check the project already has and record what fails. A failing baseline is recorded as known and is not fixed in this change.

```
Run these checks now and change nothing. <build> <lint> <typecheck> <test> <dependency audit>. For each one paste the last lines and the exit code. Do not install, upgrade or fix anything. Then run git status and tell me whether any file changed, and which.
```

**Controls.** Confirm the controls are in effect rather than merely present. Commit hooks fire on a test commit, CI runs on a pull request from this folder, the expected instruction files, and no others, load in the agent, and a secret, dependency and SAST scanner exists and runs. A control that is configured but never fires is the same as one that is absent.

**Model version.** Record the agent and model version now and check it again before each work package's commit. Tools update mid-session, which changes behaviour and makes the recorded attribution wrong.

**Where this goes.** The PR does not exist yet, so keep a local scratch file, for example `IMPL-NOTES.md`, ignored through `.git/info/exclude` rather than `.gitignore`, since that file is local to your clone and needs no change to anything shared. It holds everything bound for the PR caveats, so start it with the template's caveats headings. Record the baseline result, the controls check and the model version now, and add the risk tiers, mutation tables, commit-check outcomes, unverified list and later results as they arrive. Paste it into the PR when you open it. It is a working note rather than an artifact: nobody else can see it, it is not carried into a second worktree or a fresh clone, and `git clean -xdf` removes it. Everything in it has to reach the PR before you finish.

### 1. Intent and solution shaping

Before anything is written, the developer states what to build and how the change should be structured, and the agent turns that into a plan to approve.

A **work package** is one unit of the change: a set of files that can be written, reviewed and verified on their own, covering one or more acceptance criteria. Most changes break into several. Keep each one small enough that a single failure is easy to locate.

The output is a list of work packages, each naming the acceptance criteria it covers, the files it may change and what it must not change. Approve the plan before any code exists.

Set each package's risk tier here, before anything is written, and record it in the scratch file for the PR caveats. Use the agent's answers as input, not as the classification. Check them against the files the package may change and the handlers it calls, and classify any package you cannot confirm yourself as higher risk. The tier is not the agent's call: an agent that has misjudged what a change can cause will misjudge the tier the same way.

Scope matters more than line count: a well-scoped small task succeeds more reliably than a vague one, and task size is a strong predictor of whether AI-assisted work lands cleanly.

This is also where spec conflicts first surface. Anything the agent flags as contradictory goes to the Gate 1 approver as a spec change request. See Spec conflicts under Before opening the PR for how work continues while it is open.

```
Read <spec, design and rule files>. Do not write code yet. Ask me anything you need to know, then list work packages of at most 5 files each, with the acceptance criteria each one covers, the files it may change and what it must not change. For each package, say whether it can affect who can read or write data, reach storage, the network or the file system, change what input is accepted, or alter the outcome of any action that does those things, including by removing or weakening a check, a guard or a disabled state. Flag any place where two inputs contradict each other. Wait for my approval.
```

Five files is a starting point, not a rule. Lower it for unfamiliar code and raise it for mechanical changes such as a rename.

Run this in plan mode, reached with `/plan` in both VS Code and the CLI. Treat it as an approval checkpoint rather than a file lock. In VS Code, approving a plan is a separate thing from approving tool actions, so confirm the session's permissions if nothing should be written yet.

### 2. Generate

The AI writes the code for one work package while the developer directs it and reads the output as it arrives, rather than waiting for it to finish. Reading as it arrives is a practitioner heuristic, not a measured finding.

Give the agent the approved package and nothing wider. The scoped-generation pattern under "What to ask the AI" is the shape to use.

```
Implement work package <n> from the approved plan. Change only <files>. Do not change <what the plan said must not change>. Stop and ask me if the plan does not cover something you need.
```

Generate one package at a time. Running several at once means a failure can no longer be traced to one package.

### 3. Verify in flight

Read the diff, run the checks, re-prompt. This is the Human-Verification checkpoint, firing on every generation rather than once at the end of the phase.

Read the production-code diff on every generation. Once a hardening round has added gap tests, stop reading the test code line by line and read the mutation table from item (c) instead. See Within the loop below.

### Within the loop

**Two kinds of round.** Steps 2 and 3 run many times per hour, inside one work package approved in step 1. A corrective round means the output was wrong and you re-prompt. Stop after two corrective rounds on the same package and either take over directly or go back to step 1 and re-scope it. Two is a starting point, not a rule. Repeated corrective rounds signal a task scoped too large or specified too loosely, which another prompt will not fix.

A hardening round is different. The output was right and passed, and review found a gap worth closing, such as a missing check, an unhandled edge case, or a mutation the tests did not catch. Expect at least one of these on a package even when it was small and the first output passed. Hardening rounds do not count toward the corrective limit, so the limit never stops a package that is still finding real defects.

**Reviewing tests.** Once hardening rounds add gap tests, the test code can outgrow the production code, and reading it line by line stops being a usable check. Keep reading the production code, since item (b) depends on it.

Review a mutation table instead. Ask the agent to make small changes that should break a test, run the suite after each, and report which tests failed. A surviving mutation means the test does not assert what it appears to. The prompt and the rule for resolving survivors are under checklist item (c).

**Session length.** A long session re-reads its context repeatedly, which adds cost without adding work. Caching absorbs some of it, so treat this as a reason to keep sessions bounded rather than a cost model. Start a new session at each work package, carrying forward only the decisions made so far, any open spec change requests, and the unverified list.

### Exit condition

The loop ends when the change is understood, not when the tests are green.

Before committing, the developer writes the commit message by hand, covering how the change works and not only what changed. The agent then checks it against the staged diff and reports what was wrong or left out.

Writing the message by hand is ordinary practice; having the agent mark it is this methodology's proposal rather than established practice.

A message the agent drafted fails the exit condition, because the check would then grade the model's explanation of the code rather than the developer's understanding of it.

This records that the check ran. It does not stop someone passing off an AI-written explanation. The `Signed-off-by:` trailer is what carries the accountability, certifying that the signer reviewed any AI-assisted content, but it is a declaration rather than an enforcement mechanism. Making it enforceable needs a CI check on trailer presence and sampling audits of the recorded outcomes, neither of which is in place until NBN decides to require them. See How authorship is recorded for what a trailer can and cannot prove.

The sequence is stage, check, then commit. First the agent stages the work:

```
Stage only these files: <file list>. Do not commit. Then print the staged file list and anything staged that I did not name.
```

Write the draft message to a file excluded the same way as the Step 0 scratch file, for example `COMMIT-DRAFT.txt`. End it with a blank line followed by the `Assisted-by:` line. Without the blank line, git reads the trailer as body text and a trailer check finds no attribution. Then run the check:

```
Read <draft file>. Check that commit message against the staged diff (git diff --cached). Tell me what I got wrong or left out. Point to each gap but do not write corrected wording. Also confirm the draft ends with an Assisted-by: trailer, after a blank line, naming each <tool:model> used in this work package.
```

**What to do with the findings.** Three cases. If the message was inaccurate, edit the draft. If the message was right and the code does not do what it says, fix the code, stage it again and run the check again, since the diff it was checked against has changed. If the agent is wrong, say so in the caveats and move on, since the check is a prompt rather than an authority. Record which of the three applied in the PR caveats, since recording only that the check ran tells a reviewer nothing.

Then commit once from the draft, for example `git commit -s -F COMMIT-DRAFT.txt`, where `-s` adds the `Signed-off-by:` sign-off. Committing after the check means nothing needs amending, so any commit signature stays valid.

Commit once per work package, at its exit condition. Anything changed after that, including fixes from items (f), (g) or (h) or from the dev-environment run, is a new commit that goes through the same stage, check and commit sequence.

## What to ask the AI

Examples use VS Code chat syntax. Avoid `@workspace` and other `@name` chat participants, which VS Code has deprecated, and use `#codebase` where a prompt needs the whole project. On the CLI, replace `#file:<path>` with `@<path>`, replace `#selection` by naming the file and line range or pasting the code, and leave out `#codebase`, since the CLI already works from the folder it was started in. Slash commands such as `/tests` are VS Code chat commands and are not in the CLI's documentation, so check its own command list. These are patterns to adapt, not prompts to paste unchanged.

**Scoped generation**

```
#file:orderService.ts implement validateDiscount() to satisfy AC-14; reject negative totals; do not change the public signature
```

Three parts: which file, which acceptance criterion, and what must not change, since AI routinely modifies things it was not asked to. AC-14 stands in for a real ticket reference.

**Refactor without behaviour change**

```
Rewrite the error handling in #selection without changing the public API or observable behaviour
```

Say so explicitly, because AI will otherwise improve behaviour while it is in there, which turns a safe refactor into a risky change.

**Edge-case elicitation**

```
Explain #selection and list edge cases it does NOT handle
```

AI over-fits the happy path, so ask it to name its own gaps rather than write code. The answer becomes your test list or your list of bugs to fix, and it works on code you wrote as well as generated code.

**Bounded test generation**

```
/tests #file:auth.ts generate unit tests covering token expiry and refresh only
```

"Only" is doing the heavy lifting. Open-ended test requests produce dozens of shallow tests that inflate the diff and pad coverage without asserting anything real, so name the behaviours you care about.

**Self-review**

```
Review your own diff for security issues and unhandled errors before I accept it
```

It is cheap and catches obvious problems, but GitHub warns that Copilot code review can raise problems that do not exist, and it can equally miss real ones. It replaces neither the human review in item (f) nor the independent-session review, since a session reviewing its own output is the weakest of the three. Each catches defects the others miss.

## Before opening the PR

**Spec conflicts.** Implementation treats the spec as settled, but conflicts surface here anyway, usually when two acceptance criteria cannot both hold. Raise a spec change request to the Gate 1 approver, using the SCR format defined in the Design & Context Engineering module.

Do not wait for the answer. Build to one side, name which and why in the SCR, and keep the change small enough that the other side is still reachable. This is a provisional implementation, not a resolution: the phase does not decide which side is right.

The provisional change may merge. It must not be released while the SCR is open. That relies on the lifecycle keeping merge and release separate, which the Release Approved gate does. A team that deploys automatically on merge either ships the provisional behaviour behind a flag that stays off until the SCR is answered, or holds the merge. Nothing detects that automatically: a test written for the side you picked satisfies the Release Approved gate's requirement that every acceptance criterion trace to a passing test, so the gate passes on a disputed criterion. The stop depends on the release approver seeing the conflict, so it goes in the PR caveats and not only in the SCR. Closing the gap properly needs the Release Approved gate to name open spec change requests in its own criteria, which it does not yet do.

**Unverified claims.** Agents state things about libraries, APIs and platform behaviour with equal confidence whether or not they are true, and these claims are not visible in the diff. At the end of each work package, ask the agent what it asserted without checking. Probe anything that matters with a throwaway script, run once and deleted rather than added to the suite, and record the rest in the Step 0 scratch file for the PR caveats. Do not leave it to the end of the change: each work package runs in its own session, and a later session cannot list what an earlier one asserted.

```
List everything you stated or assumed in this work package that you did not run or read in the source. Include library behaviour, API responses, platform limits and browser behaviour. For each one give the claim, why it is unverified, and the exact check that would settle it.
```

**Run it in a developer environment.** Tests and a clean diff do not show that the change works. Before opening the PR, run the change against a dev environment and walk the acceptance criteria it claims to satisfy. A person does this, not the agent. Record which criteria were confirmed and which could not be, putting anything unconfirmed into the PR caveats. A failure here sends you back through the loop.

## What to verify before accepting output

Security checks run inside this phase rather than waiting for the gate. Secret, dependency and SAST scanning apply to AI-authored diffs as they are produced, which is what item (d) enforces. The Security Gate, which sits between Testing and Deployment, consolidates and confirms; it is not the first line of defence.

**Checklist:**

- **(a)** Has the exit condition been met, with the outcome of the commit-message check recorded in the PR caveats?
- **(b)** Does the change satisfy the acceptance criteria the work package claimed, and nothing more?
- **(c)** Do the tests assert real behaviour? Run the mutation check and read the table. Every surviving mutation is resolved before the PR in one of two ways. Either write the test the agent proposed, then re-apply that mutation and confirm the new test now fails against it, or record why the mutation is dead or equivalent code. The developer confirms any claim that a mutation is dead or equivalent, since that claim is the agent excusing its own tests. A proposed test that was never written does not resolve anything. Record the result in the PR caveats.
- **(d)** Do the scans pass on the diff? Secret, dependency and SAST scanning, plus a check that any new dependency actually exists and is the intended package. Where a scanner is missing, Step 0 recorded that, and it goes in the PR caveats.
- **(e)** Has every factual claim the AI made about a library, API, platform or browser been probed or listed as unverified in the PR?
- **(f)** Has a **human** who did not write the code reviewed the branch? Required once over the whole branch before the PR whenever any work package on it is higher risk. A model cannot discharge this item. May be skipped only when every work package on the branch is lower risk, with the skip and the reason recorded in the PR caveats, in which case the independent-session review in item (h) stands as the branch's review.
- **(g)** Does the repository still describe itself accurately? Instruction files and docs match the code, and the added lines are free of text hazards such as non-ASCII characters, mixed tabs and spaces, or inconsistent line endings.
- **(h)** Has the independent-session review run once over the whole branch, in a fresh session, preferably on a different model? Required on every branch. Where any work package is higher risk, it runs before the human review in (f) and its findings go to that reviewer, as an addition and never a replacement. Where every package is lower risk and (f) is skipped, it is the branch's review. A finding that contradicts a lower-risk classification makes that package higher risk, and (f) is then required. Update its risk tier line in the caveats and re-run its mutation check at the higher-risk count. Record the session or model used and the findings in the PR caveats.

**Prompts for items (c), (g) and (h)**

(c) Mutation check

```
For <files>, list 5 small changes that should make a test fail, such as removing a check, reversing a condition, or changing a limit. Apply them one at a time. After each, run <test command>, record whether a test failed, then restore the file exactly and show its hash before and after. Do not edit any test while a change is applied. Give me a table of the change, the number of tests that failed, and whether it was killed or survived. For each survivor, propose a test or say it is dead or equivalent code.
```

Five is a starting point, set per work package. Raise it for a higher-risk package as defined under Risk tiers, for example to ten. Re-run the check after every hardening round that adds tests, and before the package's commit, so the table always reflects the tests being committed.

(g) Docs and instruction files

```
Compare <instruction and doc files> with the code in <diff range>. For every claim about file paths, exports, commands, environment variables or rules, say whether the code agrees. Separate the findings into the doc is wrong, the doc is incomplete, and the code looks wrong against the doc. Give file and line. Do not change any file.
```

(g) Text hazards

```
List every added line in <diff range> that has a character outside printable ASCII, a tab where the file uses spaces, or a line ending that differs from the rest of its file. Show file, line and the character code. Do not change any file.
```

Both (g) prompts only report. Where the audit finds an instruction file or doc wrong against the code, correct it in this change. Where the code looks wrong against the doc, fix the code as a new commit through the exit condition sequence. If you believe the code is right and the approved spec behind the doc is wrong, raise an SCR instead. Fix any text hazard that is not intended content, leaving deliberate non-ASCII such as translated strings alone. The instruction-file and doc corrections are what the "updated instruction files" output of this phase consists of.

(h) Independent-session review (item (h) sets its role)

```
Review <diff range or files> as someone who did not write it. Read the code and do not rely on the author's summary. Check who can read or write data, where input is validated, where errors are shown to users, where secrets are read or logged, and where data is deleted. Check the diff against the acceptance criteria each work package claims. For each work package, say whether it can affect who can read or write data, reach storage, the network or the file system, change what input is accepted, or alter the outcome of any action that does those things, including by removing or weakening a check, a guard or a disabled state. For each finding give a severity, the file and line, and the input that triggers it. Do not change any file.
```

The acceptance-criteria and tier questions matter most on a branch where this is the only review, since a lower-risk branch should have nothing to find under the first checks. Run this in a fresh session, which is the minimum, or on a different model, which is stronger because it shares fewer of the authoring model's blind spots. The authoring session asked again does not count.

## Governance and security touchpoints

- **Secrets in generated code.** Secret scanning on the diff.
- **Hallucinated dependencies (slopsquatting).** Verify every AI-suggested package against the registry before install. Peer-reviewed research across 576,000 generated code samples found that around one in five package names suggested by open-source models did not exist, and an average of at least one in twenty for commercial models. Copilot is a commercial model, so the commercial figure is the relevant one, though the models tested are not the ones Copilot serves today. Attackers can register these names with malware, so one bad install is enough to make the check worth running whatever the rate.
- **Licence and IP risk** from generated code.
- **Content exclusion.** Configure the tool so it cannot read sensitive repositories or files. In Copilot this is content exclusion, available on Business and Enterprise plans and set by a repository, organisation or enterprise admin. In Claude Code it is deny rules in the settings file. **Note the gap:** GitHub states that content exclusion is not supported in Edit and Agent modes of Copilot Chat, nor in Copilot CLI or the coding agent. It therefore does not cover the agentic work this phase describes, and is not a control you can rely on here.

**Escalation triggers:** any secret detected, any dependency that cannot be verified, any high or critical SAST finding on an AI-authored diff. When one fires, the change does not proceed to the PR until the finding is either fixed, or formally accepted with three things recorded: who accepted it, why, and when it will be reviewed again. A detected secret is also rotated, not just removed from the code, since it has already been exposed. Escalate rather than deciding it inside the loop. The developer cannot accept their own finding. Accepting a high or critical finding needs the tech lead and the CISO's delegate, as the Security Gate requires. For anything lower, the approver is the one the Security Gate names for that kind of change, and until NBN names security champions, that is the NBN security team. A detected secret and an unverifiable dependency carry no severity of their own, so which route they take is for NBN to set. Until it does, treat both as critical, which sends them to the tech lead and the CISO's delegate.

## How authorship is recorded

Attribution is recorded at commit time. Accountability is recorded at review and merge. Both sit in the governance band that runs under every phase, so this section covers only what Implementation produces.

**Attribution.** Every commit containing AI-assisted content carries an `Assisted-by:` trailer naming the tool and model, following the Linux kernel convention:

```
Assisted-by: Copilot:gpt-5
```

The developer writes this trailer, so the instruction file is not what protects it. The commit-message check confirms it is present, and, once NBN adopts it, the commit hook or CI check in the rollout catches a commit without it. Keep the convention in `.github/copilot-instructions.md` as well, so the agent applies it when it checks a draft.

Where the authoring model changes mid-change, record each tool and model used rather than only the last. Multiple `Assisted-by:` trailers on one commit are the simplest way to do this, and are this methodology's extension rather than part of the Linux convention. Reviewing models, including the one used for item (h), go in the PR caveats rather than in commit trailers, since the review runs after the commits exist and a reviewing model did not author the code.

**Accountability.** The committer adds `Signed-off-by:` certifying NBN's DCO: that they are the accountable human for the change, have reviewed any AI-assisted content in it, and that it complies with NBN's secure coding and compliance standards. AI agents must not add `Signed-off-by:`; only a human can make that certification.

The `Co-authored-by: Copilot` trailer is not used, because it asserts AI authorship, which conflicts with the position that the human is the author. VS Code adds it by default for chat and agent work, so set `git.addAICoAuthor` to `off` rather than assume it is absent. It applies only to commits made inside VS Code, so a developer committing from the command line will not see it either way.

**Merge method.** Per-commit trailers survive a merge commit and a rebase merge. Per-commit signatures survive only a merge commit, because a rebase merge rewrites the commits with new SHAs and updated committer information, which invalidates them. A squash merge replaces both with one new commit, so the trailers have to be carried into the squashed message and the per-commit signatures are lost. Where squash or rebase is the convention, retain the source branch rather than deleting it on merge, so the original signed commits stay reachable.

**Sigstore/gitsign.** Plain trailers are not proof. Any trailer can be omitted or added falsely. Where verifiable provenance is required, Sigstore/gitsign binds the commit to an OIDC-verified identity and records it in a public transparency log, rather than relying on a self-reported line in a commit message.

**Accountable person:** the committer who signs off is accountable for the change. Where someone else merges it, the person who merges is accountable for the merge decision. A `CODEOWNERS` file on its own only requests review automatically; enforcing a named approver needs branch protection or a ruleset that requires code-owner approval. Keep Copilot approvals disabled: when an admin enables them, a Copilot approval counts toward the repository's required approvals. The independent human review in item (f) is the review this phase adds. Code-owner approval at merge, which the rollout below requires on every PR, is a separate requirement, and it covers every PR only if `CODEOWNERS` gives every path an owner, for example with a catch-all `*` entry. So a branch that skips (f) still gets a human approval at merge, and a higher-risk branch gets both. GitHub does not let an author approve their own PR, so make sure every owned path has a code owner other than the people who usually change it, or its PRs cannot be approved. Where governance or the Security Gate requires a further named approver for a given area, that approval is on top of these, not a substitute for either.

## In practice

A suggested sequence for adopting this phase. These are recommended defaults rather than settled requirements. Where one of the open questions in the research file is unresolved, treat the recommendation as a starting position for NBN to confirm.

- **Encode the readiness layer (week 1).** Ship a tight `.github/copilot-instructions.md` covering the project map, build and test commands, conventions, and the commit rules: the only attribution trailer is `Assisted-by:`, never `Co-authored-by:` or any default the tool adds, and the agent stages only, never committing, amending, signing off or pushing. Keep it short with non-negotiables first. If agent output routinely ignores a rule, split it into a scoped `*.instructions.md` with an `applyTo` clause. Instruction files are advisory rather than deterministic, so the staging prompt still prints what was staged as a check.
- **Set up the PR template (week 1).** Every check in this phase that records or cannot settle something writes into the PR caveats, so the template is a prerequisite. Create `.github/pull_request_template.md`:

```markdown
## What this change does

## How it was tested

## Caveats

**Risk tier:** <one line per work package: name, higher or lower,
and the reason if lower>

**Agent and model:** <each tool and model used, and when it changed if it did>

**Known failing baseline:** <checks already failing at Step 0, not fixed here>

**Controls missing:** <anything Step 0 found absent>

**Mutation check:** <per work package, mutations applied, killed and
survived, and for each survivor the test added or why it is dead or
equivalent code>

**Commit message check:** <what the agent found, and whether you fixed
the message, fixed the code, or disagreed>

**Unverified:** <claims the agent made that were not probed>

**Open spec conflicts:** <SCRs raised, and which side was built>

**AC not confirmed:** <criteria the dev-environment run could not check>

**Independent human review:** <run, or skipped with the reason>

**Independent-session review:** <fresh session or model used, and the
findings, or none>

**Accepted security findings:** <finding, accepted by, reason, review
date; secrets rotated; or none>
```

- **Encode the prompts (weeks 2-3).** Provide `*.prompt.md` files for the prompts in this module: baseline, work package plan, work package implementation, staging, commit-message check, unverified claims, mutation check, independent-session review, docs audit and text hazards. The five patterns in "What to ask the AI" are adapted per task rather than shipped unchanged. Make plan mode the default for step 1, with session permissions set so planning cannot write files, since plan mode alone does not guarantee that.
- **Encode what leaves the phase (weeks 3-4).** Verify the trailers with a commit hook or CI check. Apply `CODEOWNERS`, with a catch-all `*` entry so every path has an owner, together with a ruleset or branch protection requiring code-owner approval, and leave Copilot approvals disabled, as set out under Accountable person. Add the server-side merge controls, which are three different mechanisms rather than one: a ruleset with code scanning merge protection for SAST, secret scanning push protection, which blocks secrets at push rather than at merge, and dependency review as a required status check. Confirm the merge method preserves trailers and signatures, which only a merge commit does, or that merged branches are retained where it does not. Enable Copilot code review as a supplement only, since it defaults to a non-blocking "Comment" review and GitHub states it should not replace human review.
- **Measure and tune (ongoing).** For whoever owns measurement. Record change failure rate and rework rate, as DORA defines them, for the quarter before this phase is adopted, and then every quarter. If either is worse than that baseline for two quarters running, tighten this phase before expanding AI use: lower the work package limit in step 1 from five files, require the human review in item (f) on every branch whatever its tier, and raise the mutation count in item (c). Two quarters is a starting point, chosen so one noisy quarter does not trigger a change. Once the `Assisted-by:` trailer is mandatory and checked, split these figures into AI-assisted and other work, which shows whether the change is concentrated in AI-assisted work.

The full set is a starting position rather than a permanent standard, so expect to tune which checks apply where. Which ones hold up under sustained use is an open question recorded in the research file.

## What this stage does not cover

- Architectural and design decisions (Design & Context Engineering, upstream)
- Requirements and acceptance criteria (Planning, approved at Gate 1). Conflicts found here go back as a spec change request (see Spec conflicts).
- Comprehensive test strategy and QA (Testing phase)
- The Security Gate, which sits between Testing and Deployment, and release, deploy and operate concerns
- Unattended work by the asynchronous coding agent. No developer is present, so this module's checks do not apply as written.

## Key takeaways

- **Implementation is a verification phase.** The design and acceptance criteria have already been decided. The developer's job is checking that the code conforms to them, which is why the checkpoint here is Human-Verification oriented.
- **Verification happens on every generation**, many times an hour, not once at the end of the phase.
- **Scope the task small.** Scope matters more than line count, and a well-scoped small package succeeds more reliably than a vague larger one.
- **The loop ends on comprehension, not on green tests.** The developer writes the commit message by hand and the agent marks it against the diff. Passing tests are necessary but not sufficient.
- **Preparation can matter more than the model.** In a ten-month published account of Copilot's asynchronous coding agent on a large production repository, success rose after setup changes rather than model upgrades. A baseline check, working controls and short instruction files are this module's version of that setup work.

**Research behind this module:** [research/modules/implementation.md](../../research/modules/implementation.md)
