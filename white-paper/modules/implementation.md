# Stage: Implementation

## What changes: traditional vs AI-native

### Standard practice, without AI

SWEBOK v4 defines software construction as coding, verification, unit testing, integration testing and debugging. Checking the work is part of the work, not a separate stage afterwards. The design and acceptance criteria arrive as inputs to this phase and verified working code is the output. Developers still make plenty of calls for things like algorithms, local structure, error handling but within a standard that already exists.

SWEBOK also names Constructing for Verification as a fundamental: build software so faults can be readily found. Reviewability is a property of the code itself. That's why implementation is a conformance-checking phase, and why this phase is Human-Verification oriented rather than Human-Decision oriented. "Conformance-checking" is our framing, not SWEBOK's wording.

This phase is named Implementation. The corresponding SWEBOK v4 knowledge area is Software Construction. We use the phase name throughout and mean coding, verification, unit testing, integration testing and debugging, not deployment.

### How AI changes this

**AI proposes, humans decide:** inline completion, chat-based generation, refactoring suggestions, test scaffolding, code explanation/summarisation, PR-description drafting.

**AI performs the task, with the human approving the finished change, rather than each step:** multi-file agentic editing (agent mode) and the asynchronous coding agent. The human doesn't approve each edit, but the work cannot land without them. The coding agent opens a draft PR that a human must mark ready and merge, and it cannot approve its own PR.

## Artifacts generated

Implementation produces six outputs, each consumed by a later step:

- **The diff** (Change Review)
- **Unit tests** (Testing & QA)
- **Updated instruction files** (readiness layer, for the next cycle)
- **The commit with its attribution trailer** (provenance record)
- **The pull request with description and test plan** (reviewers, then the Security Gate)
- **CI results** (the merge decision)

A well-formed AI-assisted PR states what the change does, how it was tested, and anything the author is unsure about. A PR template with an explicit "caveats" section makes sure warnings like that are visible.

## AI-Assisted Workflow

The working cycle of AI-Assisted implementation:

1. **Intent and Solution Shaping.** The developer states what to build and how the change should be structured, scoped small. Task size is the strongest predictor of success as smaller tasks tend to be more accurate.

On the CLI, `/plan` formalises this step. Copilot asks clarifying questions, produces a checkboxed implementation plan saved to plan.md, and waits for approval before writing code. GitHub states models achieve higher success rates when given a concrete plan to follow. That approval is a human checkpoint before generation, and it suits complex multi-file changes and refactoring rather than quick fixes or single-file edits. Plan mode is a CLI feature whereas VS Code agent mode shows progress as it works but has no equivalent approval gate.

2. **Generate.** The AI writes; the developer directs and verifies actively rather than watching passively.

3. **Verify in flight.** Read the diff, run the checks, re-prompt. This is the Human-Verification checkpoint, firing on every generation.

The three steps run many times per hour in a loop. Most iterations are corrective, re-prompting because the output was not right. Others are simply the next increment of a task that was decomposed. Repeated corrective iterations on the same piece of work are a signal that the task was scoped too large or specified too loosely, and that the developer should re-scope or take over directly rather than re-prompt again.

Verification sits inside the loop because review is a constraint.

**Exit condition.** The loop ends not when tests pass, but when the developer can explain every line without deferring to the AI.

## What to ask the AI

These examples use VS Code and the CLI differs

Examples tied to acceptance criteria and grounded in GitHub's prompt-engineering principles:

- **Scoped generation:** `#file:orderService.ts implement validateDiscount() to satisfy AC-14; reject negative totals; do not change the public signature`

  Three parts: which file, which acceptance criterion, and a constraint on what must not change. AC-14 is a placeholder for a real ticket reference. The "do not change the public signature" clause exists because AI routinely modifies things it wasn't asked to, naming the boundary up front is cheaper than catching the drift in review.

- **Refactor without behaviour change:** `Rewrite the error handling in #selection without changing the public API or observable behaviour`

  Refactoring means restructuring code while keeping behaviour identical. Saying so explicitly matters because AI will otherwise "improve" behaviour while it's in there, which turns a safe refactor into a risky change.

- **Edge-case elicitation:** `Explain #selection and list edge cases it does NOT handle`

  This one isn't asking for code. AI over-fits the happy path, so you ask it to name its own gaps. The answer becomes either your test list or your list of bugs to fix. Note it works on code you wrote too, not just AI-generated code.

- **Bounded test generation:** `@workspace /tests generate unit tests for #file:auth.ts covering token expiry and refresh only`

  "Only" is doing the heavy lifting. Open-ended test requests produce dozens of shallow tests that inflate the diff and pad coverage without asserting anything real. Naming the two behaviours you care about keeps the change small and reviewable reflecting the small-batch principle.

- **Self-review:** `Review your own diff for security issues and unhandled errors before I accept it`

  Ask before you accept. It's free and catches some obvious problems. It does not replace your review. GitHub explicitly warns Copilot code review can hallucinate problems that don't exist, and it can equally miss real ones. Treat it as a first pass.

## What to verify before accepting output

Checklist:

- (a) Can you explain every line?
- (b) Does it satisfy the stated acceptance criterion and nothing more?
- (c) Do the tests assert real behaviour, not just pass?
- (d) Any new dependency, does it actually exist and is it the intended package (slopsquatting check)?
- (e) Secrets/PII absent?
- (f) SAST/security scan clean on the diff?

## Governance and security touchpoints

- (i) **Secrets in generated code**, secret scanning on the diff.
- (ii) **Hallucinated dependencies (slopsquatting)**, verify every AI-suggested package against the registry before install. The USENIX Security 2025 study "We Have a Package for You!" found that roughly 20% of AI-generated code samples reference packages that do not exist.
- (iii) **Licence/IP risk** from generated code.
- (iv) **Content exclusion.** Configure Copilot so it cannot read sensitive repositories or files.

**Escalation triggers:** any secret detected, any dependency that cannot be verified, any high-severity SAST finding on an AI-authored diff.

## How authorship is recorded

Attribution is recorded at commit time. Accountability is recorded at review and merge. Both sit in the governance band that runs under every phase, so this section covers only what Implementation is responsible for producing.

**Attribution.** Every commit containing AI-assisted content carries an `Assisted-by:` trailer naming the tool and model, following the Linux kernel convention:

```
Assisted-by: Copilot:gpt-5
```

**Accountability.** The committer adds `Signed-off-by:` certifying NBN's DCO: that they are the accountable human for the change, have reviewed any AI-assisted content in it, and that it complies with secure coding and compliance standards. AI agents must not add `Signed-off-by:`, only a human can make that certification. At merge, `CODEOWNERS` enforces a named human approver; high-risk changes (auth, payments, PII, infrastructure, public APIs) escalate to a second reviewer.

Copilot's default `Co-authored-by: Copilot` trailer is not used, because it asserts AI authorship, which conflicts with the position that the human is the author.

**Sigstore/gitsign.** Plain trailers are not proof. Any trailer can be omitted or added falsely. Where verifiable provenance is required, Sigstore/gitsign binds the commit to an OIDC-verified identity and records it in a public transparency log, rather than relying on a self-reported line in a commit message.

**Accountable person:** the human who signs off and merges the change.

See [white-paper/governance/](../governance/) for the full attribution and accountability treatment, including build-layer provenance (SLSA), sampling audits of approver sign-off, and organisational accountability under SOCI/CIRMP.

## In practice

A suggested sequence for adopting this phase. These are recommended defaults rather than settled requirements. Where an open question below is unresolved, treat the recommendation as a starting position for NBN to confirm.

- **Encode the readiness layer (week 1).** Ship a tight `.github/copilot-instructions.md` (project map, build/test/validate commands, conventions, "never commit secrets/PII", "verify every new dependency exists"). Keep it short and put non-negotiables first. If agent/chat output routinely ignores a rule, split it into a scoped `*.instructions.md` with an `applyTo` clause.
- **Encode the inner loop (weeks 2-3).** Provide `*.prompt.md` files for the five prompt patterns above, plus a custom chat mode for "diff self-review." For complex or multi-file work on the CLI, use `/plan` and review the plan before approving it. Train developers to read the diff as it streams and to re-prompt rather than accept.
- **Encode what leaves the phase (weeks 3-4).** Enforce the governance trailers at the commit: `Assisted-by:` for tool disclosure and `Signed-off-by:` certifying NBN's DCO, with a commit hook or CI check verifying their presence. Add a PR template requiring intent, test plan and caveats. Apply `CODEOWNERS` so every change has a named human approver, and branch-protection rules requiring SAST, secret scanning and dependency verification as blocking status checks which are server-side enforcement, not editor-side hooks. Enable Copilot code review as a supplement only; it defaults to a non-blocking "Comment" review and GitHub states it must not replace human review. Benchmark: if AI-authored changes show higher change-failure or rework, tighten the escalation criteria.
- **Measure and tune (ongoing).** Track measured PR cycle time, review time, change failure/rework rate, and GitClear-style duplication/churn, segmented for AI-authored PRs. Benchmark to escalate: if a 25%+ rise in AI adoption coincides with falling stability, enforce smaller batch sizes and tighten the security gate before expanding agent use.
- **Pilot the coding agent narrowly.** Start with cleanup/well-specified tasks, pre-configure `copilot-setup-steps.yml`, and keep humans as the arbiter of merge. Treat VS Code hooks as a useful but Preview-stage control, do not let them replace server-side branch protection.

## Metrics for success

- **DORA's four keys** (deployment frequency, lead time, change failure rate, time to restore) remain the delivery baseline. Segment them by AI-authored versus human-authored changes, or the signal disappears into the average.
- **Track measured cycle time, not felt speed.** METR July 2025 RCT: experienced developers took 19% longer with AI while believing they were 20% faster showing a perception to reality gap.
- **Track duplication and churn, not just test-pass.** GitClear (2025 report, 211M changed lines, 2020-2024): copy/pasted lines rose from 8.3% (2020) to 12.3% (2024) and exceeded "moved" (refactored) lines for the first time in 2024; moved lines fell from 24.1% to 9.5%; two-week churn rose from 3.1% to 5.7%; an ~8x rise in blocks of 5+ duplicated lines in 2024.

## How this differs by experience level

- **Juniors: over-reliance and skill-erosion risk.** LLVM reserves "good first issue" tickets for human learning and advises new contributors to start with small contributions they can fully understand, which is the clearest published statement of the concern. Differentiated guidance: attempt the problem first, use AI to explain not to author unread code, work on smaller simpler tasks to understand.
- **Seniors: review-complacency risk.** The "almost-right" near-miss (Stack Overflow 66%) is most dangerous to skim-reviewers. The METR gap shows even experts misjudge their own speed. Differentiated guidance: treat AI PRs with the same scrutiny as an unfamiliar contributor's, verify tests assert behaviour.

## What this stage does not cover

- Architectural/design decisions (upstream)
- Comprehensive test strategy and QA (Testing phase)
- The consolidating security gate and release/deploy/operate concerns

The implementation phase produces a verified change and its immediate unit tests, not the test strategy, not the release.

## Open questions

- **Which attribution trailer, and is it mandatory?** The governance work has settled on `Assisted-by:` for tool disclosure and `Signed-off-by:` for human certification, following the Linux kernel model, in preference to Copilot's `Co-authored-by: Copilot` trailer, which asserts AI authorship and proved unreliable when a 2026 default change caused it to appear on commits made without Copilot. What remains open is enforcement. Assumption until NBN confirms otherwise: no trailer is currently mandatory and none is mechanically verified. Sensible approach: mandate both trailers by policy, enforce their presence with a commit hook or CI check, and treat the trailer as advisory metadata rather than proof with Sigstore/gitsign layered on where verifiable provenance is genuinely required.
- **Do AI-authored pull requests need a different review standard?** Assumption until NBN confirms otherwise: AI-authored and human-authored pull requests are reviewed identically, with no distinct service level or reviewer requirement. Sensible approach: apply `CODEOWNERS` with a named approver on all changes, and escalate high-risk areas such as authentication, payments, personally identifiable information, infrastructure, public APIs to a mandatory second reviewer, regardless of authorship. To close this, NBN needs to decide whether AI authorship itself is a risk tier, or whether risk should be assessed purely on what the code touches.
- **Should security scanning block the merge of AI-authored changes?** A named reviewer is not a sufficient control on its own. This methodology places security checks inside each phase, with the Security Gate consolidating rather than performing the first check. Assumption until NBN confirms otherwise: no scanning is mandatory at merge for AI-assisted changes specifically. Sensible approach: require SAST, dependency scanning and secret scanning as blocking status checks enforced through branch protection, which is server-side and cannot be bypassed locally in preference to relying on editor-side agent hooks, which are Preview-stage, IDE-scoped, and defeated by any developer working outside that editor. To close this, NBN needs to confirm which scanning tools it already runs, and whether branch protection can be configured to make them blocking.
- **Which Copilot surface do NBN's developers use?** Assumption until NBN confirms otherwise: both VS Code chat and the CLI are in use, with no standard across teams. This matters because context syntax differs between them, and several controls exist only on one side. Plan mode, tool allowlists and session credit limits are CLI features while Copilot code review and the #file and @workspace syntax used in the prompt examples above are VS Code. Custom instruction files work on both. Sensible approach: write guidance against the shared surface, which is the instruction files and the verification checklist, and treat surface-specific controls as additions for whichever teams use them. To close this, NBN needs to confirm which surfaces are in use and whether a standard is intended.

## Key takeaways

- **Implementation is a verification phase.** The design and acceptance criteria have already been decided. The developer's job is checking that the code conforms to them, which is why the checkpoint here is Human-Verification oriented.
- **Verification happens on every generation** inside the working loop, many times an hour. It is not a gate at the end of the phase.
- **Scope the task small.** Task size is the strongest single predictor of whether AI-assisted work succeeds. Small, well-specified changes succeed far more often than large or vague ones, and they stay reviewable.
- **The loop ends on comprehension, not on green tests.** Passing tests are necessary but not sufficient. The change is ready when the developer can explain every line without deferring to the AI.
- **Preparation does more than prompting.** Instruction and setup files, refreshed periodically rather than per feature, change outcomes more than better prompts do. This is a one-off cost that pays back on every change afterwards.

**Research behind this module:** [research/modules/implementation.md](../../research/modules/implementation.md)
