# Stage: Testing and QA

_Entered once per feature, after all its pull requests have merged. Run by a tester, who may be a different person from the implementer. The tester starts from the commit the feature's last pull request left on the main branch, the approved acceptance criteria, and the caveats on each of the feature's pull requests. Exits to the Security Gate._

## What changes: traditional vs AI-native

### Standard practice, without AI

**SWEBOK v4** treats unit and integration testing as part of software
construction. Our Implementation module follows that for unit tests: it writes
them for each change and checks them as part of the same review.

What is left for a separate stage is the judgement Implementation cannot make. It
checks one work package at a time, as each is built. Nobody yet checks the suite
against the whole feature.

### How AI changes this

Implementation already checks each work package's tests with a mutation check
(checklist item (c)). The agent applies five small faults to the package's files,
more for a higher-risk package, and each one must either fail a test or be
resolved as dead or equivalent code. That check has two limits, and this stage
exists to cover them.

**It is small and self-chosen.** The agent picks the faults, so it tends to test
what it already expected to matter. A mutation tool generates every mutant its
rules allow, which can run to hundreds for one feature, regardless of what the
author expected.

**It sees one work package at a time.** It cannot see code shared across
packages, or tests that only ever exercise one package's path through that code.

So the question here is not whether each test was reviewed. It is whether the
suite, run against the whole changed feature, catches faults nobody chose in
advance. A suite of individually reasonable, passing tests can still fail that
check.

None of this depends on the tests being AI-written. AI makes the check more
pressing because tests can be produced faster than anyone reads them. Implementation
already moves test review from reading test code to reading a mutation table for
that reason. The check itself applies to any suite.

**What AI does at this stage:** runs the mutation tool on the tester's
configuration, and drafts a classification of what survives. **What the human decides:** whether that
classification holds, and whether the gaps send the change back to
Implementation.

## Artifacts generated

| Artifact | What it is | Who uses it |
|---|---|---|
| Mutation configuration | The tool's configuration, scoped to the feature and committed so the run can be repeated. Owned by the tester | The next tester |
| Testing record (`docs/testing/<feature>.md`) | The tested commit, scope, result, classified survivors, acceptance-criteria trace and decision | Release Approved (criteria 1 and 2); Implementation, when gaps go back |
| Mutation report | The tool's full output | The tester and the decider. Not committed: it is attached to the record's pull request, and the record summarises it. Running the recorded tool version with the committed configuration on the tested commit re-creates it |

`<feature>` is the same name Planning and Design use for `docs/specs/<feature>/`
and `docs/design/<feature>/`, so the records pair up.

## AI-Assisted Workflow

Four steps. The mutation run and the tester's confirmations take most of the time.

| Step | What happens | Who |
|---|---|---|
| 1 | Pin the tested commit, run the project's test command, and match any failure against the known failing baseline | Tester pins and matches, AI runs |
| 2 | Run mutation testing across the feature's source files | AI, or the tester for a long run |
| 3 | Classify every surviving mutant, and trace each outcome of each acceptance criterion to a test | AI drafts, tester confirms |
| 4 | Decide: proceed to the Security Gate, or send back to Implementation | Named person, neither an author of the feature nor the tester |

An **author** of the feature is anyone with commits in its pull requests.
Reviewers are not authors, unless a review suggestion they wrote was committed to
the feature: GitHub records them as a co-author of that commit, and so does this
stage. A merge commit that only brings in the base branch, such as one from
GitHub's Update branch button, does not make someone an author.

The tester may be an author; the step 4 decider must be neither an author nor the
tester, since part of the decider's job is a second look at the tester's work.
Both gates also keep people from approving their own work, though each states
the rule in its own terms.

## What to ask the AI

Run these prompts in Copilot agent mode in VS Code, or Copilot CLI, opened from
the project folder with the tested commit checked out. In Claude Code, start it
from the same folder. The prompts make the AI run commands, which Copilot's Ask
mode cannot do. Start a new session for each run of this stage.

Before step 1, the tester creates the testing record at `docs/testing/<feature>.md`
from `docs/testing/TEMPLATE.md`. Each step's **Record** line names the sections
it fills; ask the AI to write its drafts into that file. The record and the
mutation configuration stay uncommitted until Record and commit under step 4.

**Inputs from outside the repository.** The agent reads only the repository unless
you give it more. Pull request caveats are in the pull request descriptions on
GitHub: paste them into the session, or, where the agent can run the GitHub CLI,
fetch each with `gh pr view <number> --json body`, including any list a caveat
attaches. Planning lets a team keep specs in Jira or Confluence and raise spec
change requests on the work item. Where yours are kept there, paste the approved
spec and any open requests into the session too.

### Step 1: run the suite

**Pin the commit first.** Check out the commit the feature's last pull request
left on the main branch: its merge commit, or the squashed or rebased commit if
the team merges that way.
`gh api repos/{owner}/{repo}/pulls/<number> --jq .merge_commit_sha` gives it in
each case; `gh` fills in `{owner}` and `{repo}` from the current repository.
Record its full SHA in the testing record as the tested commit before running
anything. The one exception is a re-run after another feature's fix, which pins
the first main-branch commit that includes the fix (see below). Every step in
this stage runs on the pinned commit. Work from other features that merged before
it is part of that commit, which cannot be avoided, but only this feature's files
are mutated. Anything merged after it is not covered by this record. Any new
commit to the feature after this one means a re-run from here (see Re-runs under
step 4).

> "Install the project's dependencies at this commit, then run <the project's test
> command>. List every test that ran with its result, by test file and test name,
> and the failing tests separately. Where a test runs once per parameter, give
> each case's full ID. Do not change any test."

`<the project's test command>` is the same command Implementation's Step 0
baseline runs as its test check. Whatever it runs is "the suite" for this whole
stage. If it includes integration tests, so does this stage, and any that need
services the mutation run cannot provide show up in step 2 as tests the runner did
not execute. Record the command under Suite run.

**Match each failure against the baseline.** The tester compares each failing test
with the "Known failing baseline" in the caveats of every pull request in the
feature, including any list a caveat attaches to its pull request. A failure
counts as baseline only if a caveat names that test file and test name. If a caveat
records only that a check failed, without naming the test, treat the failure as
not on the baseline.

**A failure not on the baseline stops the run.** The tester finds whose change
caused it, for example by running the failing test on the commit before a
suspect change merged, and records the finding under "Suite run":

- **This feature's change, or the tester cannot tell:** send the feature back to
  Implementation, with the failing tests listed under "Stopped for".
  Implementation picks them up from the record and starts a new change at its
  step 1.
- **Another feature's change** that merged before the tested commit: raise it with
  that feature's team instead of sending it back. Once their fix merges, re-run
  from step 1, pinning the first main-branch commit that includes the fix.

Either way the stage stops there, and the tester commits the record (see Record
and commit under step 4). No decider is needed: the run cannot continue on a
failing suite whichever way it goes.

**A failure on the baseline is excluded from the mutation run**, because a test
that already fails would make every mutant it runs against look caught, and some
tools stop at a failing test. The tester owns the mutation configuration and
makes the exclusion there, or in a test-runner configuration that only the
mutation run uses, depending on how the tool selects tests. Never edit or delete
the test file. Some tools can exclude only a whole test file or class, which takes
other tests out with the failing one. Record every excluded test, the caveat it
came from, and any tests excluded alongside it. The code those tests covered is
measured less thoroughly than the results suggest, and the record is what makes
that visible.

**Record:** the AI writes the list of tests that ran under Suite run. The tester
fills the rest of Suite run, Tested commit, Previous runs, Tester, Tester is and
Inputs, and the test exclusion fields under Scope.

### Step 2: run mutation testing

Mutation testing plants small deliberate faults and checks whether any test fails.
A test that asserts nothing useful lets almost every fault survive. The tool is
set up once per project, as described under In practice.

> "Run mutation testing across <the feature's source files>. Report the count for
> every status the tool reports, and the score if it reports one, with the tool's
> name for it. List every mutant the tool did not count as detected, including
> survived, no coverage, and any status where the mutant could not be run. If the
> tool has no "detected" category, list every mutant it did not report as killed. Compare the tests the mutation run executed with the tests that ran in
> step 1, and list any it did not execute. Give the tool's name and version, and
> say where the full report was written.
> Use the configuration at <the mutation configuration path>. Do not change any
> source file, test or configuration. If the tool will not run as configured,
> stop and tell me why."

`<the feature's source files>` is the source files changed by the feature's pull
requests. Leave out test files, and files that contain no logic, and record what
you left out under Scope. Judge each file by its content, not its kind: a file of
type definitions or configuration with no logic can go, but one that also holds a
validator, a default that decides behaviour, or any other rule stays in. Widen the
list to shared code the feature calls only if you record why.

`<the mutation configuration path>` is the configuration the tester owns,
including any exclusion made in step 1. If the tool needs a change to run, the
tester makes it and records it under Scope; the AI does not.

If a run is too long for one agent session, the tester can run the tool from a
terminal with the same configuration, then give the AI the report and ask for
everything else the prompt asks for.

**Record:** the tester fills Files mutated, Left out, Widened to, Configuration
and Configuration changes this run. The AI drafts Mutation tool, Tests the runner
did not execute and the Result section from its output, and the tester checks
them against the report.

### Step 3: classify the survivors

> "For each mutant listed in step 2, give the file, the line, what changed, and
> which test should have caught it. Classify each one using these definitions:
>
> - Real gap: a test could catch it and none does.
> - Equivalent or dead code: no test could tell the difference.
> - Presentation only: it changes only how output looks or what is logged, and no
>   acceptance criterion, accessibility need or binding rule depends on it. Check
>   the Constraints section of the approved spec and the project's context files
>   for binding rules, such as a required audit log.
> - Tool limitation: the mutant never ran, or the test that would catch it did not
>   run under the tool.
>
> If you are unsure, classify it as a real gap. Do not change any code or tests.
>
> For every mutant you do not classify as a real gap, give a one-line reason a
> tester can check without redoing the analysis. For a tool limitation, also give
> the evidence: that the mutant never ran, or that the test which would catch it
> did not run under the tool, naming that test. For presentation only, name the
> binding-rule sources you checked. For every real gap, name the acceptance
> criterion it affects, or none, and say whether one of this feature's pull
> requests changed that line. If one did, name it. If none did, mark the gap
> "outside feature".
>
> Then, for each acceptance criterion in <the approved acceptance criteria>, list
> each outcome it states, such as both the allowed and the refused case. For each
> outcome, name the test that would fail if that behaviour broke, and the
> assertion that checks it. Use only tests that passed in step 1 and were not
> excluded. List any outcome with no such test.
>
> For each criterion, check the caveats of every pull request in the feature,
> docs/design/<feature>/spec-change-requests.md, and any spec change requests
> pasted into this session. Flag any criterion with a spec change request still
> open, naming the request and which side was built, or
> listed under "AC not confirmed", and quote the source."

`<the approved acceptance criteria>` is the Acceptance criteria section of
`docs/specs/<feature>/spec.md` at the latest `spec-<feature>-v<n>-approved` tag,
the copy approved at Gate 1 (Plan Approved). Read it at that tag, for example with
`git show spec-<feature>-v<n>-approved:docs/specs/<feature>/spec.md`, not from the
tested commit: while a spec change request is open, the spec in the working tree
is back at Draft. Where the spec is kept in Jira or Confluence, use the version
approved at Gate 1 from its version history instead.

From here on, "survivor" means any mutant listed in step 2, not only those the
tool marked as survived. A no-coverage mutant means no test runs that code at all.
It is classified like any other, and is usually a real gap.

**Presentation only** is narrower than it sounds: a visible focus indicator or a
required audit log is not presentation only. Unlike equivalent or dead code, a
test could catch these, so they are not dismissed here: they go to the step 4
decider as one group.

**Tool limitation** is not a gap in the suite, but that code went unmeasured, and
the record shows it. Where the catching test did not run, it is listed under
"Tests the runner did not execute".

**Outside feature** marks a real gap on a line none of this feature's pull
requests changed, usually elsewhere in a shared file the feature edited. It is
listed, but it is not this feature's gap to fix or accept, so it does not count
toward step 4's conditions. The decider can raise it with the code's owner, and
treats it as this feature's gap if the feature relies on that code.

The tester confirms every classification other than real gap. Equivalent, dead
code and tool-limitation classifications remove a survivor from view, so a person
checks each one. Tool-limitation claims need the most care, because no test was
checked against that mutant at all. Real gaps only need
spot-checking: a wrong one is not hidden, because it goes back to Implementation,
where writing a test for it shows whether it can be caught. Where the tester
disagrees with the AI, the tester's classification stands and the record keeps
both. Where the tester cannot tell, the survivor is a real gap. If the tester is
an author of the feature, or junior or new to the code, the step 4 decider also
checks every one of the tester's confirmations, not a sample. The tester records
both under "Tester is" in the record, so the decider knows the check applies.

The tester also confirms each row of the acceptance-criteria trace by reading the
named test. It must check that outcome's behaviour, must have passed in step 1,
and must not be excluded. An outcome whose only test is failing or excluded has
no test. A criterion is **untraced** if any of its outcomes has no confirmed
test. A test the mutation tool could not run still counts, since the trace
asks whether the behaviour is tested, not whether the tool measured it. Release
Approved reads this trace for its criterion 2, so an unconfirmed row is not
evidence.

A flagged criterion does not stop this stage. With an open spec change request,
the passing test shows only the side that was built, and the build must not be
released until the request closes (see A spec change request that closes later,
under step 4). With "AC not confirmed", nobody checked the criterion by hand.
The flag carries both into the record for the step 4 decider and the release
approver.

**Record:** the AI drafts Survivors and Acceptance criteria trace from its output,
and the tester edits them as they confirm each row.

### Step 4: decide

No prompt. A named person who is neither an author of the feature nor the tester
reads the whole testing record: the suite run, the scope and exclusions, every
survivor, and the acceptance-criteria trace with its flags. There is no score
threshold. The decider may proceed only when both of these hold:

- every outcome of every acceptance criterion traces to a test the tester
  confirmed, not "none", since an untraced criterion fails Release Approved
  criterion 2 anyway; and
- every real gap, other than those marked outside feature, is accepted.

If any real gap is to be fixed, or any criterion is untraced, the outcome is send
back.

Read each real gap with its acceptance criterion and risk tier. A gap in code a
criterion depends on, or in a higher-risk work package, needs a stronger reason to
accept than one that touches neither.

The decider records one of two outcomes in the testing record:

- **Proceed to the Security Gate.** Any real gap that proceeds without a fix is
  accepted, and the record states who accepted it, why, and when it will be
  reviewed again. Presentation-only survivors are accepted as one group, with one
  reason; the decider may take any of them out of the group and treat it as a
  real gap.
- **Send back to Implementation**, listing the gaps to close and any untraced
  criteria in the record. Implementation picks them up from the record and starts
  a new change at its step 1. The whole feature waits: it does not go to the
  Security Gate while the fixes are made.

AI never makes this decision.

**Re-runs.** Any new commit to the feature after the tested commit means a re-run
from step 1. That includes a commit that merges while the run is still going, and
a fix sent back by any stage: this stage, the Security Gate or Release Approved.
Otherwise the released build is not the tested one. A commit that changes only the
record or the mutation configuration does not count. The re-run covers the whole
feature again with fresh classifications, rather than carrying earlier ones
forward. The record is committed after every run, so git keeps each earlier
version, and the record lists them under "Previous runs".

**A spec change request that closes later.** If a request flagged in the trace is
answered after the record is committed, what happens depends on the answer:

- **It keeps the side that was built, and the criterion's wording is unchanged:**
  no re-run. The tester updates the flag and the approved spec tag under Inputs,
  in a commit that changes only the record, through a pull request that a code
  owner of `docs/testing/` other than the tester approves.
- **It changes the criterion, or needs a code change:** re-run from step 1 once
  any code change has merged.

**Record and commit.** This happens after every run, in this order:

1. After step 3 and the checks under What to verify, the tester creates a new
   branch from the main branch, carrying the uncommitted record and mutation
   configuration across, commits both, and opens a pull request. The tester
   attaches the tool's full report to a comment on that pull request, zipped if
   it is a folder, and fills Report with a link to that comment. GitHub accepts
   attachments up to 25 MB. The tester adds AI cost if the team tracks it.
2. The decider reads the record in that pull request, fills Decision, and commits
   it to the same branch.
3. A code owner of `docs/testing/` who is not the decider, the tester or an author
   of the feature approves the pull request, and it merges. The feature goes to
   the Security Gate once it has merged.

A run that stopped at step 1 has no decider. The tester commits the record with
Suite run filled in and Outcome set to "stopped at step 1", leaving the rest of
Decision empty, and any code owner other than the tester approves it. A later run
lists it under Previous runs with that outcome.

## What to verify before accepting output

Before committing the record, the tester checks:

1. **Every classification other than real gap is confirmed**, with a reason that
   holds, and every tool-limitation claim has its evidence.
2. **Every trace row is confirmed**, one for each outcome of each acceptance
   criterion, against a test that passed in step 1 and was not excluded.
3. **Every real gap names its acceptance criterion and risk tier, or is marked
   outside feature**, so the decider can read it against the spec rather than in
   isolation.
4. **The working tree is clean apart from the record and the mutation
   configuration.** Run `git status` and restore anything else. A changed test
   file, or a mutant left in a source file by an interrupted run, means the run no
   longer measures the code that was handed over. Excluding a known-failing test
   in configuration is not an edit.
5. **Nothing has merged to the feature since the tested commit.** Check the
   feature's pull requests and any fixes for it. If something has, re-run from
   step 1 rather than committing this record.

## The pattern to look for

Real gaps tend to share a shape, and the shape is more useful than the count. It
is what the template's "group real gaps by the weakness they share" asks for.

**Every test uses the same easy scenario.** The same input, the same state, the
same optional field left empty. Branches for any other case never run, and
several mutants in one piece of validation survive together.

**Boundaries and starting states are skipped.** Validation is tested only well
inside its limits. Components are tested after interaction, never in their
initial, loading or empty state.

**A test looks like it covers something but cannot tell.** The input happens to
make the fault invisible, such as acting only on one end of a list, or expecting a
message that the fallback produces too. The test passes either way.

**A test double accepts anything.** A stub that ignores its arguments lets the
code call the wrong table, collection or endpoint without any test noticing. It
can hide a serious fault, because the code can point at the wrong place entirely
while every test still passes.

So the thing to look for is not only tests that assert nothing. It is **tests
that only ever run one easy scenario**.

## Governance and security touchpoints

- **AI never decides, and never accepts a gap.** It drafts the classification and
  the trace; a named person confirms them, and a different named person decides.

Full treatment in [white-paper/governance/attribution.md](../governance/attribution.md) and [white-paper/governance/accountability.md](../governance/accountability.md).

## How authorship is recorded

This stage adds no application code, but it commits two files: the mutation
configuration and the testing record. Where AI helped write either, the commit
carries an `Assisted-by:` trailer for each tool and model used. Every commit
carries a human `Signed-off-by:`. The tests keep whatever attribution
Implementation recorded.

## In practice

A suggested sequence for adopting this stage. These are recommended defaults
rather than settled requirements.

- **Choose the mutation tool (week 1).** Pick one that fits the stack, such as
  Stryker for JavaScript and TypeScript, .NET or Scala, PIT for Java, or mutmut
  for Python. Set it up on one feature before using it everywhere. Budget for that
  first setup: the tool runs the suite its own way, and differences from the
  project's test command tend to surface on the first run. Check that it executes
  the same tests as that command, and record any it skips and why; a test is
  never skipped silently to make the tool work.
- **Protect the code during setup (week 1).** Installing and configuring the tool
  should change only its configuration, a script to run it, and ignore entries
  for its output. Run setup from the project folder, then run `git status` and
  confirm nothing else changed. `git status` reports only on its own repository,
  so if the project sits inside another repository, run it there too. Undo any
  other change before the first run.
- **Commit the configuration and the template (week 1).** Commit the
  configuration, set up so it can be pointed at one feature, and the record
  template below at `docs/testing/TEMPLATE.md`. Some tools keep their
  configuration in a shared project file, such as a package or build file. Then
  each record's pull request also changes that file, and needs approval from its
  code owners as well as from `docs/testing/`'s.
- **Name the roles (week 1).** Decide who can act as tester, and who decides at
  step 4, and list them in `CODEOWNERS` for `docs/testing/`. Each record's pull
  request needs a code owner who is not its decider, its tester or an author of
  the feature, so list enough people that one is always free. Whether gaps in
  higher-risk work packages need a further decider at NBN needs client input.
- **Encode the prompts (weeks 2-3).** Provide the prompts in this module as
  agent skills, one per step. Copilot supports skills in both VS Code and Copilot
  CLI, read from `.github/skills/<name>/SKILL.md`, and its documentation also
  lists `.claude/skills/` as a project location. Claude Code reads skills from
  `.claude/skills/<name>/SKILL.md` and runs them as slash commands. Copilot prompt
  files (`.github/prompts/*.prompt.md`) work in VS Code but not in Copilot CLI, so
  they suit a team that uses only VS Code. Write each one with the feature's scope
  as an explicit input, so no prompt carries an unexplained placeholder.
- **Connect the record to release (weeks 2-3).** Release Approved reads the
  testing record for the tested commit and the acceptance-criteria trace. Make
  sure release approvers know where it lives.
- **Measure and tune (ongoing).** Record how long each mutation run takes, since
  it dominates the stage's time, and how survivors split across the four
  classifications. If runs become too slow for once per feature, narrow the scope
  before dropping the stage. Do not set a score threshold: we found no benchmark
  for a good score, so where the tool reports one, compare it only with earlier
  runs on the same scope. Do not use coverage or test count as a stand-in either. Both can
  stay high while assertions are weak, which is what this stage exists to catch.

### Testing record template

Commit at `docs/testing/<feature>.md`. AI cost is optional.

```markdown
# Testing record: <feature>

**Tested commit:** <full SHA>
**Previous runs:** <commits of earlier versions of this record, with their outcome; or none>
**Tester:** <name> · **Date:** <date>
**Tester is:** <an author of the feature (yes/no); junior or new to the code (yes/no)>
**Inputs:** <approved spec tag, e.g. spec-<feature>-v0.2-approved, or the approved Jira or Confluence version>, <pull requests in this feature>

## Suite run (step 1)
**Test command:** <the command, as Implementation's Step 0 baseline runs it>
**Result:** <pass, or each failing test by test file and test name>
**Tests that ran:** <every test with its result, as the step 1 prompt lists them>
**Stopped for:** <failing tests not named in any baseline caveat; whose change caused them; sent back to Implementation or raised with the other feature's team; by, date; or no>

## Scope
**Mutation tool:** <name and version>
**Files mutated:** <paths>
**Left out, with reason:** <files or code excluded from mutation>
**Widened to:** <shared code mutated beyond the feature's changed files, and why; or none>
**Tests excluded:** <each known-failing baseline test, and the PR caveat that names it; or none>
**Excluded alongside:** <passing tests the tool could only exclude together with a failing one; or none>
**Where the exclusion is set:** <config file and setting>
**Tests the runner did not execute:** <tests that ran in step 1 but not in the mutation run, and why; or none>
**Configuration:** <path to the mutation configuration, as committed with this record>
**Configuration changes this run:** <changes the tester made so the tool would run, and why; or none>
**Report:** <link to the comment on the record's pull request that holds the full report>

## Result
**Mutants:** <n> killed · <n> survived · <n> no coverage · <n> timeout · <n> other (<status>)
**Score:** <the tool's score and its name for it, e.g. mutation score, or "none reported">, for this scope only, not adjusted for classifications

## Survivors
<one row per survivor: file and line, change, classification, reason,
confirmed by tester (yes/no), the AI's classification if the tester changed it.
For real gaps, also: the acceptance criterion it affects or none, and either the
feature's pull request that changed the line with that pull request's risk tier
from its caveats (the higher tier if it lists more than one), or "outside
feature". Group real gaps by the weakness they share.>

## Acceptance criteria trace
<one row per outcome of each criterion: criterion ID and outcome; the test and
assertion that would fail if it broke, or "none"; passed in step 1 (yes/no);
confirmed by tester (yes/no); open spec conflict or AC not confirmed, quoting the
source, or none>

## Decision
**Outcome:** <proceed to the Security Gate; send back to Implementation, listing the gaps to close and any untraced criteria; or stopped at step 1>
**Gaps accepted:** <gap, accepted by, reason, review date; or none>
**Presentation only accepted:** <count, accepted by, reason; or none>
**Outside feature:** <each gap raised with the code's owner, raised by, date; any treated as this feature's, and why; or none>
**Tester's confirmations checked:** <all, by the decider, when the tester is an author, junior or new to the code; or not needed>
**Decided by:** <name, neither an author of the feature nor the tester> · **Date:** <date>

**AI cost (optional):** <tool, model, cost or tokens>
```

## What this stage does not cover

- **Writing tests.** Implementation. It produces the unit tests this stage
  measures.
- **Checking each work package's tests as it is built.** Also Implementation,
  through its own per-package mutation check.
- **Writing integration and end-to-end tests.** Implementation runs the change in
  a developer environment by hand, and this stage measures whatever the project's
  test command runs. Neither requires automated integration or end-to-end tests to
  exist.
- **Security scanning.** The Security Gate, immediately after.
- **Deciding whether to release.** The Release Approved gate.
- **Production monitoring.** Maintenance and Operations.

## Open questions

1. **What does a good mutation score look like?** We found no benchmark.
2. **Does closing real gaps improve what the suite catches?** Not yet measured.
   Adding tests for real gaps and re-running would show whether the score moves
   and whether the gaps were real.
3. **Is once per feature the right frequency?** It is the starting position. Per
   work package would repeat Implementation's own check; per release may be too
   late to send gaps back cheaply.
4. **Who approves at NBN?** Needs client input, same as the other stages.
5. **Where do automated integration and end-to-end tests belong** in the
   methodology?
6. **How should very large survivor lists be classified?** Splitting step 3 into
   batches, by file or by work package, is untried.

## Key takeaways

- **This stage asks one question.** Does the suite catch faults across the whole
  feature? Implementation's mutation check is small, agent-chosen and sees one
  work package at a time, so it cannot answer that. A mutation tool run across the
  feature can.
- **Mutation testing is the measurement, not the verdict.** It produces false
  positives. Classify the survivors before acting on them.
- **Look for tests that only run one easy scenario**, not just tests that assert
  nothing.
- **Nothing in this stage edits a source or test file.** If one changes, the run
  no longer measures the code that was handed over.

**Research behind this module:** [research/modules/testing-and-qa.md](../../research/modules/testing-and-qa.md)
