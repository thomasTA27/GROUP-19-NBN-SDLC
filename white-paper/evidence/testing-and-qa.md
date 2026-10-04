# Evidence — Testing and QA

| | |
|---|---|
| Pilot feature | Task CRUD on the Simple Task Dashboard |
| Module followed | `white-paper/modules/testing-and-qa.md` |
| **Done by** | Ujjawal Mittal (BA/UX) |
| **Tested by** | Sajad Ali Akbari (Part B) |
| Dates | Do: 3 Oct 2026 · Test: 4 Oct 2026 |
| Planner card | [Mock evidence] Do part A for 'Testing and QA' and tailor back the module |

**The situation this run found.** The Implementation task had already written 124
tests for the tasks feature. So this was not a run of writing tests. It was a run
of verifying tests that already existed, written by someone else and never checked
beyond the fact that they pass.

That is a different job from the one the module describes, and it is the first
finding below.

---

## Part A — DO (Ujjawal)

### A1. Steps followed

| Module step | What I did | Followed as written? | If not, why |
|---|---|---|---|
| 1 Give the AI the acceptance criteria | Not run. The tests already existed. | No | The module assumes you are writing tests. It has nothing to say about verifying tests that are already there. |
| 2 AI drafts tests | Not run. | No | Same reason. |
| 3 AI runs the suite | Ran `pnpm test`. 124 tests, 8 files, all passing. | Yes | |
| 4 AI runs mutation testing | Installed Stryker, configured it to mutate only `src/features/tasks/`, ran it. | Partly | Installing and configuring a mutation tool is not in the module. It assumes one is available. Setup took most of the run. |
| 5 Read every test, reject any that asserts nothing | Asked the AI to list every surviving mutant with the test that should have caught it. Reviewed the categories rather than all 83 individually. | Partly | The module says to read every test. With 124 tests and 83 survivors, I used the mutation report to direct attention instead. That is the module's own stated defence against volume, but it is not what step 5 says. |
| 6 Second opinion | Not run as a separate step. The AI's own classification of the survivors served this purpose. | Partly | |
| 7 A named person approves | Not done. Part B has not been assigned. | No | Blocked on Part B. |

### A2. AI log

Run in Claude Code (Opus 5.5) from the frontend folder.

| # | Prompt (short) | AI output | What I checked | Result | Why |
|---|---|---|---|---|---|
| 1 | Set up Stryker for this Vitest project, mutate only `src/features/tasks/`, do not change test files | Stryker config, a `test:mutation` script, gitignore entries, and a completed full run at 83.4% | That no test file was touched, and what the score meant | Accepted | It respected the constraint. It also hit a real problem and solved it correctly, see below. |
| 2 | List every surviving mutant: file, line, what changed, and which test should have caught it. Do not change any code or tests | All 83 survivors classified into four categories, with the specific test named for each gap | Spot-checked the classification against the source files | Accepted | The classification is the useful part. A raw list of 83 would not have been actionable. |

**Totals:** 2 accepted, 0 modified, 0 rejected.

### A3. Metrics

| Time (min) | Tokens / cost | AI accepted | AI modified | AI rejected |
|---|---|---|---|---|
| ~27 (4:27pm to 4:51pm, timed) | 33.9k output, 2.2m cache read · **$1.90** | 2 | 0 | 0 |

API time was 5m 37s inside a 27-minute session. The mutation run itself takes
about 9 minutes and is not AI time at all.

For comparison with the Planning module: that stage cost $1.86 across six prompts
in one run, and $12.80 across eight in another. This run cost $1.90 across two
prompts. The driver here was not rewriting but waiting, because the mutation run
is slow.

**One number worth recording.** 95% of input tokens came from cache, the same as
the Planning runs. Re-prompting on an established context is cheap.

### A4. Output

- `frontend/stryker.config.mjs` (new)
- `frontend/package.json` (added `test:mutation`)
- `.gitignore` (ignores `.stryker-tmp/` and `frontend/reports/`)
- `frontend/reports/mutation/mutation.html` (the report, gitignored)

**No test or source files were changed.** The run was a measurement, not a fix.

---

## The findings

### 1. The mutation score was 83.4%, and 40 real gaps sit behind 124 passing tests

| Category | Count | Meaning |
|---|---|---|
| **Real test gaps** | **40** | A test could catch it and none does |
| Equivalent | 29 | No test could tell the difference |
| Styling only | 9 | A CSS class was emptied; no test checks classes |
| Probably a tool artefact | 5 | See finding 3 |

Per file:

| File | Score |
|---|---|
| `tasks.actions.ts` | 91.8% |
| `sort.ts` | 90.5% |
| `schemas.ts` | 85.4% |
| `TaskForm.tsx` | 82.4% |
| `TaskRow.tsx` | 79.8% |
| `TaskList.tsx` | 77.6% |
| `format.ts` | 54.5% (but see finding 3) |

### 2. The gaps share a shape: the tests only ever ask easy questions

This is the useful part, and it is more specific than "40 gaps".

**Every test uses the same scenario.** Every `TaskRow` test renders a task with an
empty description, so nothing checks that a description appears at all. Every
`TaskList` test has auth already loaded, so the loading branch is never exercised.
No `TaskForm` test ever triggers a description error, which is why six separate
mutations around description validation all survived together.

**Some gaps hide behind a test that looks like it covers them.** The delete-focus
test deletes the *first* task, so changing `tasks[index - 1]` to `tasks[index + 1]`
makes no difference at position 0. The update-failure test returns the same error
constant the fallback uses, so deleting the fallback changes nothing. Both tests
pass. Neither tests what it appears to test.

**One gap is serious.** In `tasks.actions.ts`, `collection('tasks')` can be
changed to `collection('')` and no test notices, because the test double ignores
its argument. A test can pass while the code points at the wrong collection.

### 3. The mutation check needed checking

The AI noticed that five `format.ts` survivors looked wrong: emptying the locale,
time zone or day option should make `Intl.DateTimeFormat` throw at load time, and
every test calling `formatDueDate` would then fail. It verified this in Node.

The report showed zero tests covering those mutants, which means Stryker never
actually loaded them. They are static mutants, not test gaps. The real score for
`format.ts` is probably 100%, not 54.5%.

**So a surviving mutant is not automatically a gap.** The module presents mutation
testing as the objective check. This run shows the check itself produces false
positives and needs a person, or a careful AI, to read the results.

### 4. The AI fixed a tooling problem without weakening a test

The first mutation run stopped before testing anything, because a time zone test
failed under Stryker but passed under plain Vitest. Stryker forces worker threads,
and a worker thread cannot change its own time zone, so the test's
`process.env.TZ` line did nothing.

The AI diagnosed this across several attempts and fixed it by setting the time
zone before Stryker starts, rather than editing the test. It then confirmed all
124 tests pass in that zone before relying on it.

That is exactly the behaviour the module asks for: it did not make a test pass by
changing the test.

### 5. Installing the tool wrote a file into the wrong repo

`pnpm add` triggered `lefthook install`, which created a `lefthook.yml` at the
**capstone** root rather than in the mock project. The Implementation evidence
reports the same problem. That is now at least the fourth control the nesting has
broken.

I deleted it before committing.

---

## Part B — TEST (Sajad Ali Akbari)

### B1. What I tested and how

On 4 October 2026 I trialled the current four-step Testing and QA module on the independently built Part B Task CRUD implementation at `d181508`. The purpose was to assess whether the methodology produces usable evidence, not to approve a release. Claude Code performed the AI steps. The exact module snapshot, inputs and scope are in [run-context.md](../../mock-project%20part-B%28Test%29/testing-and-qa/run-context.md) and [module-under-test.md](../../mock-project%20part-B%28Test%29/testing-and-qa/module-under-test.md).

The ordinary suite passed 778 frontend tests and 5 backend tests. Stryker 10.0.0 measured 11 files: the tasks feature and its shared query, collection and scheduled-erasure dependencies. Type-only and unrelated code were excluded with reasons. The source and existing tests remained unchanged; dependency and measurement configuration changed.

**Independence:** I did not do Testing and QA Part A, but I had participated in this implementation. Prompt preparation had read Part A's QA evidence and Stryker configuration; the execution sessions did not read its application or mutation report. The module itself includes Part A's results. This was a separate execution, not a blind trial.

| Module step | What happened | Followed as written? |
|---|---|---|
| 1. Run the suite | Both ordinary suites passed. | Yes |
| 2. Measure fault detection | Setup and a complete mutation run succeeded. Runner limitations required an adapted execution, and a tooling dependency repair was needed. | Partly |
| 3. Classify survivors | All 70 undetected mutants were classified and checked using ordinary-suite replay and separate diagnostics. Human confirmation remains pending. | Partly: AI work complete; developer check pending |
| 4. Decide | Part B module verdict signed as Pass with changes; test-gap triage remains proposed. | Module verdict confirmed; project approval pending |

The intended open-PR entry condition was not met: Implementation PR #46 had already merged, and independent approval was not evidenced. Measurement proceeded as a recorded retrospective deviation. This is not evidence that the module's approval gate should be removed.

### B1a. AI log and metrics

| Prompt | Output | Review outcome |
|---|---|---|
| 1. Establish context and baseline | Module snapshot, scope, inputs, suite results and hashes | Corrections needed to exposure and baseline wording |
| 2. Set up and run mutation testing | Configuration, reports and inventory | Corrections needed to execution limits; dependency issue required repair |
| 3. Classify and verify | Classification, diagnostic probes and typecheck repair | Saved probe-script fault found during review |
| 4. Correct the harness | Validated scripts and complete probe reruns | Reruns retained as authoritative; classifications unchanged |
| 5. Write evidence and proposals | Decision draft, Part B and proposed amendments | Revised to separate general guidance from local troubleshooting |

**Time:** the setup and mutation session took about 19 minutes, including a 6 min 9 s mutation run. Total elapsed work and AI time were not fully captured. **Cost/tokens: not captured / unavailable.** A reopened session showed $0, which does not establish the earlier cost. These are limitations of the collected metrics, not reasons to enter zero.

The harness review found that a saved script erased output before parsing it. Earlier script provenance was incomplete, so all material probes were rerun using corrected, validated scripts. Superseded records remain historical only. Details are in [setup-log.md](../../mock-project%20part-B%28Test%29/testing-and-qa/setup-log.md) and [diagnostics/README.md](../../mock-project%20part-B%28Test%29/testing-and-qa/diagnostics/README.md).

### B2. Results

| Check | Result | Evidence / interpretation |
|---|---|---|
| Ordinary baseline | Pass | 778 frontend tests in 14 files; 5 backend tests in 2 files. The earlier Implementation record's 767 count remains unexplained. |
| Mutation execution | Complete, with limitations | 953 mutants: 879 Killed, 4 Timeout, 67 Survived, 3 NoCoverage. Original score 92.65%; exit 0 was not an approval threshold. |
| Execution represents the full ordinary suite | No | 22 frontend tests were not selected; 756 were selected, 2 skipped, and 754 inferred to have executed. JSON listed 753 test names; duplicate full names explain the count difference, with the mechanism inferred. All workers used a fixed timezone. |
| Classification | AI draft complete | 38 real test gaps, 23 equivalent, 8 styling-only, 1 tool artefact. No IDs missing or duplicated; interpretation remains subject to developer review. |
| Corrected ordinary-suite replay | Valid verification records | 69 mutants passed all 778 tests; mutant 888 caused suite-loading failures. Seven known-killed controls failed and the unchanged baseline passed. |
| Diagnostic support | Recorded | 37 gap classifications have failing diagnostic assertions; one has a changed message trace. Equivalent classifications rely on code reasoning within stated domains, with sampled traces as support. |
| Timeout checks | Reproduced, qualified | All four remained Timeout at concurrency 1. Ordinary probes gave timeout or incomplete out-of-memory runs, consistent with nonterminating loops; not formal proof. |
| Integrity and tooling | Pass after repair | All 79 application source/test files and original report hashes unchanged. Typecheck and both suites passed after the scoped dependency repair. No pre-install typecheck was captured, so installation causation is probable, not proved. |
| Human decision | Part B module verdict signed | Sajad Ali Akbari confirmed Pass with changes on 4 October 2026. Test-gap approval and release approval remain pending. |

The score describes the adapted execution. Replay supports the classifications of its undetected mutants; it does not validate every killed mutant or establish complete coverage of timezone behaviour. No live integration or browser assessment was performed.

**Findings relevant to the methodology:** permissive test doubles hid collection-access faults; validation tests missed boundary scenarios; component tests checked interaction states but missed initial or idle states. Presentation mutants included keyboard-focus styling, so the styling category did not imply harmlessness. One apparent survivor was a runner artefact.

These are weaknesses exposed by deliberate faults, not demonstrated defects in the original application. The 38 gap entries are mutant-level findings and may share underlying weaknesses. Detailed IDs, requirement mappings, confidence and raw results are in [classified-survivors.md](../../mock-project%20part-B%28Test%29/testing-and-qa/classified-survivors.md) and [mutation-report.md](../../mock-project%20part-B%28Test%29/testing-and-qa/mutation-report.md).

### B3. Sign-off

- [x] I did not do Part A.
- [x] Result: **Pass with changes**.
- Signed: **Sajad Ali Akbari, 4 October 2026**.

**Signed Part B module result: Pass with changes.** The [decision record](../../mock-project%20part-B%28Test%29/testing-and-qa/decision.md) contains the separate test-gap recommendations, which remain proposed. This sign-off concerns module usability, not application release approval or joint Part C agreement.

---

## Part C — Part A's recorded verdict (historical)

*Preserved from Part A. These observations refer to the earlier module version; Part B's assessment of the current version follows below.*

| Claim | Verdict | Evidence |
|---|---|---|
| C1 AI-generated tests often assert too little | **Supported** | 40 real gaps behind 124 passing tests |
| C2 Mutation testing is the objective check that tests catch anything | **Partly** | It found the 40 gaps, but produced 5 false positives of its own (finding 3) |
| C3 Coverage is a poor signal at this stage | *Not tested* | Coverage was not measured in this run |
| C4 The AI will weaken a test to reach green unless told not to | **Not supported here** | Finding 4: it fixed the tooling rather than the test, unprompted |

### Changes needed in the module

**1. The module only covers writing tests, not verifying existing ones.** Steps 1
and 2 could not be run at all. In a real team most testing work is on a suite that
already exists. The module needs a second path: given a test suite you did not
write, how do you establish whether it is any good.

**2. Mutation testing needs setup guidance.** The module recommends it as the
central check but assumes it is available. Installing and configuring Stryker took
most of this run, and it required a non-obvious fix for a time zone problem
specific to how Stryker runs tests.

**3. Say that a surviving mutant is not automatically a gap.** Five of 83
survivors here were tool artefacts. The module should say to classify survivors
before acting on them, and that the classification is itself worth checking.

**4. Add the categories.** Real gap, equivalent, styling only, tool artefact.
Classifying 83 survivors into four buckets is what made the result usable. Without
that, a mutation report is a wall of noise.

**5. Replace step 5 with something achievable.** "Read every test" does not
survive contact with 124 tests. What worked was letting the mutation report direct
attention. The module already says that in the experience-level section but step 5
contradicts it.

**6. Add the failure pattern, not just the failure.** "Reject tests that assert
nothing" is too narrow. The gaps here were tests that assert something real but
only ever exercise one easy scenario: always an empty description, always a loaded
auth state, always the first item in a list. That is a more useful thing to look
for.

**7. Record the cost figures.** $1.90, two prompts, 27 minutes, of which about 9
minutes is the mutation run itself and 5m 37s is AI time. The module says cost is
unmeasured for this stage. It is not any more.

### Open questions after this run

- **Whether the AI's classification of the 83 survivors is right.** I spot-checked
  it rather than verifying all 83. Part B could check a sample.
- **Whether fixing the 40 gaps actually catches anything.** Nobody has added a
  test and re-run.
- **Whether 83.4% is good.** There is no benchmark in the module or the research
  for what a reasonable mutation score looks like.
- **Coverage was never measured**, so C3 is untested.


---

## Part C — Part B's proposed verdict

*Part B's contribution only; not agreed jointly with Part A's author.*

### What can be compared

Part A recorded a seven-step module; Part B followed its revised four-step version. Both used Task CRUD on the same technology stack, but different implementations, specs, suites and mutation scopes. Their 83.4% and 92.65% scores are contextual observations, not a measured improvement or general benchmark.

Both runs found permissive test doubles, limited scenarios and runner artefacts. This supports checking assertion quality beyond a green suite in these pilots. It does not establish how often AI-written tests have these weaknesses across projects, nor that AI authorship caused them.

| Claim | Part B assessment |
|---|---|
| Passing tests can miss requirement-relevant faults | Supported in this implementation by verified undetected mutants. |
| Mutation testing alone establishes suite quality | Only partly: scope, runner behaviour and classification affect interpretation. |
| Coverage is inherently a poor metric | Not tested. |
| AI weakens tests unless instructed otherwise | Not tested; test editing was prohibited. |
| The module is usable across all projects/audiences | Not established by two pilots on one domain and stack. |

### Verdict and proposed tailoring

**Pass with changes, signed for Part B.** The workflow produced useful evidence. Setup and interpretation needed additional guidance; joint Part C agreement and project approval remain pending. Missing project approval is distinct from a defect in the methodology.

Recommend five concise, general clarifications:

1. Define measurement scope, exclusions and execution limits.
2. Protect and check the source/test baseline during tooling setup.
3. Classify by behavioural significance, leaving uncertainty visible.
4. Verify consequential findings and diagnostic tools proportionately.
5. Record a reasoned decision under the project's approval responsibilities.

[Proposed module changes](../../mock-project%20part-B%28Test%29/testing-and-qa/proposed-module-changes.md) provides wording and supporting observations. Installation commands, timezone workarounds and exhaustive replay remain worked-example details. Skipping incompatible tests is not a default remedy. Browser and integration limits may require other QA techniques, rather than automatically moving to the Security gate.

Retain the module's existing warning against score thresholds. Do not infer a universal coverage rule or AI-behaviour claim from these runs. Scenario diversity and optional usage metrics can be supporting notes rather than new mandatory steps.

**Still open:** human confirmation of material classifications; agreement with Part A's author; appropriate follow-up on test gaps and browser/integration limits. No application fixes or post-fix measurements were performed. The module remains unchanged for reviewer consideration.
