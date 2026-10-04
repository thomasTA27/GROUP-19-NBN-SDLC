# Testing and QA, Part B: decision record (module step 4)

**Status: Part B module verdict signed; test-gap recommendations proposed.** Prepared by Claude Code (claude-sonnet-5-5) from the measurement and classification in this folder. Sajad Ali Akbari signed the module usability verdict as Pass with changes on 4 October 2026. This is not application release approval or joint Part C agreement.

| | |
|---|---|
| Change under test | Task CRUD (Implementation Part B), `main` at `d181508`, source and tests unchanged by this stage |
| Module verdict signed by | **Sajad Ali Akbari, Part B module tester** |
| Date of module verdict | **4 October 2026** |
| Implementation approver (module: "this stage inherits that") | **Not evidenced.** See [run-context.md](run-context.md) section 5 |
| Entry conditions | Tests green: yes (778 frontend, 5 backend). "A PR is open": no, PR #46 was merged before this stage began. Recorded as a deviation, not a blocker |

Two separate conclusions follow. They answer different questions and should not be merged.

---

## 1. Is the module usable? (recommendation: Pass with changes)

**Question.** Can a person independently follow the current four-step module on a project it was not written on, and get a usable result?

**Signed module verdict: Pass with changes.** The module's four-step shape worked and the result was usable. It was not usable *as written*: several unstated decisions were needed and one of the module's stated remedies did not hold. Project approval remains pending.

### Evidence

| Step | Did it work as written? | Evidence |
|---|---|---|
| 1. Run the full suite | **Yes.** 778 frontend and 5 backend tests passed, no test changed | [run-context.md](run-context.md) section 5 |
| 2. Run mutation testing | **Only with unstated decisions.** A complete run (953 mutants, score 92.65%, exit 0), but setup took most of the recorded session time and the score describes an adapted execution, not the unchanged suite | [setup-log.md](setup-log.md), [mutation-report.md](mutation-report.md) sections 1 and 7 |
| 3. Classify every survivor | **Yes, and it was the useful part.** All 70 undetected mutants fell into four classes with none unresolved. Drafting was quick; verifying took far more effort | [classified-survivors.md](classified-survivors.md) |
| 4. Decide | **Part B module verdict signed; test-gap triage pending.** The project has not evidenced an Implementation approver. This is a governance limitation, not proof that the module makes the step impossible. | this file |

### Unstated decisions the module needed

1. **Scope and tooling.** Which files to mutate, how to leave out type-only and shared code, how to mutate two functions of a shared file, and how to install and configure the tool.
2. **A remedy that did not hold.** The module says to set the time zone before Stryker starts. Here two existing tests switch zone at run time, which worker threads ignore, so no single zone made all 778 pass. Two tests were skipped by name (not edited), so 756 tests were selected, two skipped, and 754 inferred to have executed, and the module has no rule for that.
3. **A side effect of the install.** Adding the tool made `pnpm run typecheck` fail through a transitive Zod 4 dependency. The module does not warn that installing a tool can change the project. Typecheck was not run before the install, so the install is the probable cause, not a proved one. A scoped `packageExtensions` entry repaired it.
4. **What the score covers.** 22 of 778 tests were never selected by the tool's default filter, tests that read source text earn no credit, and the report keys tests by name. None of this is in the module.
5. **How to treat awkward survivors.** A module that fails to load was counted as survival (1 tool artefact). Styling class strings that carry keyboard-focus classes are not harmless. "Equivalent" needs reasoning, not just a passing suite.
6. **Recording decisions and usage.** The run needed a record outside the already-merged PR. The module verdict is now signed; test-gap approval remains pending. Total time and original session usage were not captured; that does not make the module's decision step impossible.

### Necessary guidance versus optional technique

Only part of Part B's verification effort should be asked of other users. [proposed-module-changes.md](proposed-module-changes.md) separates:

- **Proposed general guidance**: a scope statement, recording tests that cannot run, counting what was actually run, checking the install did not break the project, the class definitions, a minimum check of the classification, a decision record.
- **Optional technique**: re-applying each undetected mutant to a copy and running the ordinary suite, plus diagnostic tests and traces. These made Part B's classification well supported and cost most of Step 3. They are worth it when a gap would block a release or a classification is disputed. They are not a requirement for every run.

### What this does not show

- Two runs on one stack (Next.js, Vitest, Stryker) do not establish that the module is usable on every project.
- This run was not independent of the build: the tester had authored the spec and performed Implementation Part B, and had read Part A's written QA evidence and Stryker configuration before the run (the Claude sessions had not). The module text itself quotes Part A's headline numbers.
- Nothing here measures coverage or the AI's behaviour. The AI's classifications are an AI draft; no developer has yet spot-checked them.
- The mutation score of 92.65% is not a pass threshold, not a benchmark, and not a comparison with Part A's 83.4%. Exit code 0 is not approval.

---

## 2. What should happen to the test suite? (recommendation for the named person)

**Question.** Of the 70 undetected mutants, which should go back to Implementation, which need investigation, and which can be accepted?

**What the findings are.** The mutation run plants deliberate faults. A "real test gap" means the existing tests would not notice such a fault. It does **not** show a defect in the application. Where a consequence is mentioned it is conditional ("if the code did this"), not observed.

### Summary

| Class | Count | Meaning | Recommendation |
|---|---|---|---|
| Real test gap | 38 | Tests would not notice the planted fault | 20 return to Implementation, 3 investigate, 15 accept with rationale (below) |
| Equivalent | 23 | No input in the valid domain was found that tells the fault from the code | Accept, on code reasoning (9 are Medium confidence) |
| Styling only | 8 | A class string was emptied | Do not accept as harmless: investigate with a browser check |
| Tool artefact | 1 | Mutant 888, a module that fails to load counted as survival | Accept; no test action |
| **Total** | **70** | 67 Survived + 3 NoCoverage | |

The 4 Timeout mutants (counted as detected) reproduce at concurrency 1 and are consistent with nonterminating loops; no action is recommended.

### 2a. Return to Implementation (20)

| Group | IDs | Why it matters | Requirement |
|---|---|---|---|
| **Collection name never checked** (High) | 986, 987, 988 (no test runs the real `getTasksCollection`); 90 (update, toggle and delete never assert the collection written) | A fault of this kind could point the code at the wrong collection while every test passes. This is the module's own "serious gap" shape | AC-4.1, AC-1.2; AC-1.3, 5.1, 6.1, 6.2, 7.1 to 7.4 |
| **Direct-request date validation** (Medium) | 633 (text after a valid date), 690 (minute 60+), 696 and 699 (offset limits), 787 (31st of a 30-day month), 796 (month 00), 802 (day 00), 727 (leading text, 5-digit year) | Tests try one or two bad values and stop, so a fault accepting these impossible values would go unnoticed | AC-2.9, AC-2.4, AC-2.8 |
| **Required-field message** (Medium) | 203 | An untouched form would show "must be a valid date and time" instead of "is required" and no test notices | AC-2.1b, AC-2.8 |
| **Focus and accessible state** (Medium/Low) | 388, 389, 396, 404, 406 (focus on first render); 485, 507 (`aria-busy` while idle) | Only focus *after* an interaction is tested | AC-8.4a, AC-8.4c |

Each is a missing assertion, not a code change. The diagnostic assertions in `diagnostics/tests/` show that such assertions can fail on the planted fault and pass on the original. They are examples, not proposed baseline tests, and were not added to the project.

### 2b. Further investigation (11)

| IDs | What to investigate | Why not decide now |
|---|---|---|
| 204, 270, 271, 272, 273, 380, 382, 522 (styling) | A browser check of AC-8.4c (visible keyboard focus, disabled and invalid styling) on the form fields, buttons and paging links | Each emptied class string carries focus classes. jsdom cannot see CSS, so no unit test can answer this. "Styling only" describes the unit suite, not accessibility |
| 423, 459, 461 | Whether the in-flight guard's "skipped" path can be reached by a real second activation | Only a same-tick double click in a test reaches it; a real second click lands on a disabled button. If unreachable, accept; if reachable, return |

### 2c. Accept with a rationale (15 real gaps, 23 equivalent, 1 artefact)

The person deciding should confirm each rationale; none is approved here.

| IDs | Proposed rationale |
|---|---|
| 183, 196, 239, 331, 431, 593, 596, 597 | Diagnostic logging labels and when the log fires. No requirement fixes the wording and there is no user-visible effect. Cheap to fix later if wanted |
| 479 | Escape reaching an ancestor listener. No ancestor Escape handler exists today (latent only) |
| 693 | Seconds 60+ are still refused; only the reason message differs |
| 753 | Browser-side minute 60+ cannot come from a `datetime-local` input (argued, not tested in a browser) |
| 780, 782 | Century leap years. No accept or refuse decision changes in the 2026 to 2037 window; only the refusal reason would differ |
| 864, 865 | Legal Firestore IDs containing a second `__` would be refused. App-generated IDs never look like this |
| Equivalent (23): 6, 20, 97, 223, 235, 290, 308, 327, 384, 395, 399, 400, 409, 410, 446, 448, 577, 663, 665, 672, 674, 960, 962 | Judged equivalent on code reasoning about the valid domain. Sampled traces support but do not prove it. Revisit if the code changes. The 9 Medium-confidence ones (290, 384, 395, 399, 400, 409, 410, 446, 448) lean most on code structure; 20 holds only while the secret's minimum length stays above 9 |
| 888 | Tool artefact: Stryker counted a module that cannot load as survival; the ordinary suite fails as it should |

### 2d. What this stage cannot decide

- Two skipped time-zone tests, and two further Sydney-group tests that passed in Perth (possibly for a weaker reason), mean daylight-saving behaviour in `EditTaskForm` was not exercised by the mutation run. None of the 70 survivors is in that logic. Killed mutants were not re-checked.
- Behaviour requiring deployed rules, real integrations or a browser remains unverified by this measurement. Assign the appropriate follow-up QA or security checks according to the behaviour and project responsibilities; these are not all Security-gate tasks.
- The setup added a `packageExtensions` entry to `pnpm-workspace.yaml` and a lockfile change. They should be reviewed like any dependency change before anything is committed.
- The Implementation approver is not evidenced and the ADRs are still Proposed.

### 2e. How to use the numbers

The score (92.65%, from an adapted Stryker execution: 879 Killed, 4 Timeout, 67 Survived, 3 NoCoverage of 953) is a baseline for this suite on this scope. It was not used as a threshold in this recommendation, and no adjusted score is offered.

---

## 3. Decision record (to be completed by the named person)

| Field | Entry |
|---|---|
| Module usability | **Pass with changes — signed by Sajad Ali Akbari on 4 October 2026** |
| Gaps returned to Implementation | Proposed: the 20 in 2a. **Confirmed / changed: ____** |
| Gaps to investigate | Proposed: the 11 in 2b. **Confirmed / changed: ____** |
| Gaps accepted, with rationale | Proposed: 2c. **Confirmed / changed: ____** |
| Decision on the change | **____ (not proposed here)** |
| Named person, role, date | **Sajad Ali Akbari, Part B module tester, 4 October 2026** (module verdict only) |
| Where this record is attached | Evidence PR: https://github.com/thomasTA27/GROUP-19-NBN-SDLC/pull/47 |

Module verdict signed: **Sajad Ali Akbari, 4 October 2026**. Test-gap triage and application release approval remain pending.

## Where the evidence is

| What | File |
|---|---|
| Entry conditions, inputs, hashes, scope | [run-context.md](run-context.md) |
| Setup, versions, problems, typecheck repair, harness review | [setup-log.md](setup-log.md) |
| Run, score, limits of the measurement | [mutation-report.md](mutation-report.md) |
| Classification of all 70, with evidence | [classified-survivors.md](classified-survivors.md) |
| Diagnostic harness, corrected results and script history | [diagnostics/README.md](diagnostics/README.md) |
| Original reports (unchanged) | `reports/mutation.json`, `reports/mutation.html`, `reports/survivors-inventory.md` |
| Proposed module amendments | [proposed-module-changes.md](proposed-module-changes.md) |
| Part B evidence and proposed Part C verdict | [white-paper/evidence/testing-and-qa.md](../../white-paper/evidence/testing-and-qa.md) |
