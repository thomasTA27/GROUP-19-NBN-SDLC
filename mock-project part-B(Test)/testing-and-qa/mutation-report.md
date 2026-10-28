# Testing and QA, Part B: mutation report (module step 2)

**Date:** 2026-10-04. **Tool:** StrykerJS 10.0.0 with `@stryker-mutator/vitest-runner` 10.0.0, Vitest 3.2.7, Node v22.23.2.
**Repository:** `main` at `d181508`, source and tests unchanged (hash check in `setup-log.md` section 9).
**Status of this report:** a **complete** run: all 953 mutants were tested, no errors, exit code 0. The numbers in sections 2 to 6 are the original run's and have not been changed. Sections 1 and 7 were corrected in the Step 3 session (see "Corrections" at the end). Survivors are classified in `classified-survivors.md`. Setup, scope and departures are in `setup-log.md`. Exit code 0 is not approval: the threshold `break` is `null`, so the exit code does not depend on the score.

## 1. Read this first: what was and was not measured

**This was not a full run of the unchanged suite.** The test files are unchanged, but the suite Stryker executed is not the same suite: two tests were skipped, 22 were not selected, and the tests ran in worker threads with one fixed time zone. The score describes that adapted execution.

### 1a. Test counts, reconciled

| Count | Tests | Files | What it is | How known |
|---|---|---|---|---|
| Ordinary suite | **778** | 14 | `vitest list` and `pnpm run test:component` (all pass) | Observed (`diagnostics/results/vitest-list-778.json`) |
| Not selected by Stryker's `related` filter | 22 | 4 | Files that import no mutated file: `Sidebar.test.tsx` 2, `utils.test.ts` 6, `useFirestore.real-queryequal.test.ts` 4, `tasks-rules.test.ts` 10. Absent from the JSON report's test files | Observed (file list); `related: true` is in the report's config |
| Selected | **756** | 10 | The dry run's "Ran 756 tests" | Observed. 778 − 22 = 756 exactly, so the figure counts every test in the 10 selected files, including the two skipped ones |
| Skipped by my setup file | 2 | 2 | `TaskItem.test.tsx` "…shows the same moment as 9:00 am on a UTC device"; `EditTaskForm.test.tsx` "…daylight saving ends… shows the ambiguous local time…". They switch time zone at run time, which worker threads ignore | Observed (setup file, and both appear among the 14 tests that cover no mutant) |
| Executed and passing in the baseline | 754 | 10 | 756 − 2 | **Inferred** from the arithmetic; the log does not print a skip count |
| Tests in the JSON inventory | **753** | 10 | The report's `testFiles` | Observed |

**The 756 against 753 difference is resolved.** The three missing entries are tests that share a full name with another test: one in `tasks.actions.test.ts` ("createTask > input that includes deletedAt > is refused and writes nothing…", twice) and two in `route.test.ts` ("the secret in the wrong place > is refused in the x-cron-secret header…" and the `x-vercel-cron-secret` one, twice each). `vitest list` shows 133 and 152 tests in those files; the report has 132 and 150, which equals the number of unique names in each. Every other file matches exactly. So the report keys tests by full name and collapses duplicates. That mechanism is inferred from the exact numeric match; I did not read the runner's code for it.

### 1b. Other limits

- **Scope is the 12 patterns in `setup-log.md` section 5:** 11 files, 953 mutants.
- **One run, one machine.** Concurrency was 16, my choice. The four Timeouts reproduced at concurrency 1 (section 7, item 5).
- The score is Stryker's. It is a baseline for this suite, not a target, as the module says. Part A's 83.4% is on a different codebase with a different scope and is not a comparison, and no adjusted score is given here.

## 2. Baseline validation

| Item | Result |
|---|---|
| Command | `pnpm exec stryker run stryker.config.mjs --dryRunOnly` (from `frontend/`) |
| Outcome | **Passed.** "Initial test run succeeded. Ran 756 tests in 33 seconds (net 14314 ms, overhead 19243 ms)" |
| Mutants generated | 953 in 11 files |
| Time zone | `TZ=Australia/Perth`, set by the config |
| Failed baselines before it | 8 (plugin not found, time zone, shell passing no `TZ`, no tests found twice because of a typo in my setup file). All in `setup-log.md` section 3 |
| The full run's own baseline | "Ran 756 tests in 30 seconds" |

## 3. The run

| Item | Value |
|---|---|
| Command | `cd frontend && pnpm run test:mutation` (runs `stryker run stryker.config.mjs`) |
| Started / finished | 01:45:38 / 01:51:50 AEST, 2026-10-04 |
| Duration | **6 minutes 9 seconds** (Stryker "Done in"). 373 s measured around the whole `pnpm` command |
| Exit code | **0** (the score threshold `break` is `null`, so the exit code does not depend on the score) |
| Workers | 16 |
| Coverage analysis | `perTest` (forced by the Vitest runner) |
| Static mutants | 90 (9%) were mutated, not ignored. Of them, 12 survived |
| Warnings | One: the static mutants warning above. "Unknown option" warnings appeared only in the failed first attempt |

## 4. Score and mutant counts

Stryker's definitions (stryker-mutator.io, "Mutant states and metrics"):
- Detected = Killed + Timeout. Undetected = Survived + NoCoverage.
- **Mutation score = detected / valid × 100.** Mutation score based on covered code = detected / covered × 100. (Covered excludes NoCoverage.)
- Runtime Error, Compile Error and Ignored mutants are not in the score.

| Status | Count | Meaning in Stryker's words |
|---|---|---|
| Killed | **879** | At least one test failed while the mutant was active |
| Timeout | **4** | Tests timed out with the mutant active; counted as detected |
| Survived | **67** | All tests that ran passed with the mutant active |
| NoCoverage | **3** | No test executed the mutated code, so it survived |
| Runtime Error | 0 | |
| Compile Error | 0 | |
| Ignored | 0 | |
| Pending | 0 | |
| **Total** | **953** | 879 + 4 + 67 + 3 |

| Score | Value | Working |
|---|---|---|
| **Mutation score** (total) | **92.65%** | (879 + 4) / 953 = 883 / 953 |
| Mutation score on covered code | **92.95%** | 883 / 950 |
| Thresholds used | high 80, low 60, break null | Stryker's colour bands only |

**Distinguishing the undetected:** 67 Survived mutants were executed by at least one test and passed every time. 3 NoCoverage mutants were executed by none. The 4 Timeouts are counted as detected; all four are in `route.ts` at lines 95 and 114, in the paging loop (a `BlockStatement` at 95:*, and a `ConditionalExpression`, an `EqualityOperator` and a `BlockStatement` at 114:*). Whether they are genuine infinite loops or slow runs under load was not checked.

## 5. Per-file results

Score = (Killed + Timeout) / Total. These are the percentages Stryker printed.

| File | Total | Killed | Timeout | Survived | NoCoverage | Score | Covered score |
|---|---|---|---|---|---|---|---|
| `app/api/cron/erase-deleted-tasks/route.ts` | 86 | 80 | 4 | 2 | 0 | 97.67 | 97.67 |
| `features/tasks/schemas.ts` | 145 | 142 | 0 | 3 | 0 | 97.93 | 97.93 |
| `features/tasks/components/TaskList.tsx` | 50 | 49 | 0 | 1 | 0 | 98.00 | 98.00 |
| `features/tasks/actions/tasks.actions.ts` | 107 | 103 | 0 | 4 | 0 | 96.26 | 96.26 |
| `features/tasks/components/CreateTaskForm.tsx` | 65 | 60 | 0 | 5 | 0 | 92.31 | 92.31 |
| `hooks/useFirestore.ts` | 26 | 24 | 0 | 2 | 0 | 92.31 | 92.31 |
| `features/tasks/components/EditTaskForm.tsx` | 103 | 95 | 0 | 8 | 0 | 92.23 | 92.23 |
| `features/tasks/lib/due-date.ts` | 196 | 180 | 0 | 16 | 0 | 91.84 | 91.84 |
| `features/tasks/hooks/useTasks.ts` | 34 | 30 | 0 | 4 | 0 | 88.24 | 88.24 |
| `features/tasks/components/TaskItem.tsx` | 138 | 116 | 0 | 22 | 0 | 84.06 | 84.06 |
| `lib/firebase/firestore.ts` (lines 9-11, 37-39) | 3 | 0 | 0 | 0 | 3 | 0.00 | 0.00 |
| **All files** | **953** | **879** | **4** | **67** | **3** | **92.65** | **92.95** |

Subtotals Stryker printed: `features/tasks` 92.48 (775 killed, 63 survived of 838); `app` 97.67; `hooks` 92.31; `lib` 0.00.

The three `firestore.ts` mutants are all NoCoverage: ids 986 (the `typedCollection` function body emptied), 987 (the `getTasksCollection` body emptied) and 988 (the collection name `'tasks'` replaced with `""`). No test executed either function. (The existing tests mock `@/lib/firebase/firestore`; I did not check this reading.) That is a fact about the run, not a classification.

For context only, not classification: survivors by mutator are StringLiteral 29, ConditionalExpression 17, BooleanLiteral 4, Regex 4, ArrayDeclaration 3, OptionalChaining 3, EqualityOperator 2, LogicalOperator 2, BlockStatement 1, ArithmeticOperator 1, CallExpression 1. 20 of the 67 survivors were executed by 2 or fewer tests.

## 6. Reports and inventory

All paths from `mock-project part-B(Test)`. SHA-256 for the files as produced:

| File | What | SHA-256 |
|---|---|---|
| `testing-and-qa/reports/mutation.json` | Machine-readable Stryker report (mutation-testing-report-schema 1.0), 2.4 MB | `4f4b773bcb6d650a6c6333b2af1db574712a527d8503da8a9240ffefebd08aff` |
| `testing-and-qa/reports/mutation.html` | Stryker's interactive HTML report, 2.7 MB (open in a browser) | `26d460cb3e81915ab7291ef29da6f7fd28058f72c879e0d1e2d519e74cdd113b` |
| `testing-and-qa/reports/survivors-inventory.json` | All **70** Survived (67) and NoCoverage (3) mutants. Per mutant: id, status, file, mutator, start and end line and column, the line's text, original code, replacement, whether static, number and names of covering tests (id, name, file), tests completed. 818 KB | `2c2dea379bbedfd12922a3564a31d490aca665c3e3b7b10a21e938c08bb45fc9` |
| `testing-and-qa/reports/survivors-inventory.md` | The same, one table row each, test names left to the JSON | `2713a5e0b8295b21e2f7dccbd52f3ac71916a27740da369eb562d0cfa4fb5e26` |
| `testing-and-qa/reports/generate-inventory.mjs` | Builds the two inventory files from `mutation.json` and the unmutated source | `597b69d0d6ca12fd8ac2b9ad5ca2bbc44b7e6aed8cdc231c6b9a8030816bc12a` |

**Inventory notes.** "Original" is cut from the source file at the mutant's location (columns are 1-based, end exclusive); "replacement" is Stryker's. For NoCoverage mutants the covering-test list is empty. The inventory reads the working-tree source, so regenerate it only while the source is unchanged.

**Regenerate:**
```bash
cd frontend && pnpm run test:mutation          # overwrites mutation.json and mutation.html
cd .. && node testing-and-qa/reports/generate-inventory.mjs
```
A second run may differ slightly (timeouts, and which tests are credited), so compare the new `statusCounts` printed by the script with section 4 before replacing the evidence.

## 7. Limits of the measurement, investigated in Step 3

Demonstrated facts and possible limits are kept apart. Evidence is in `testing-and-qa/diagnostics/results/` and `classified-survivors.md`.

### Demonstrated

1. **The skipped tests did not cause the survivors.** (These probes were run, then rerun with a corrected harness after a script fault was found; both runs agree.) Every one of the 70 undetected mutants was applied to a disposable copy and the full ordinary suite was run (778 tests, forks pool, working time zones, **including the two skipped tests**, and every test run for every mutant, so Stryker's per-test coverage selection plays no part). 69 of the 70 still pass. Seven mutants Stryker had killed were run the same way as controls and all seven failed, so the harness detects what it should. The one that fails, 888, fails because the module cannot load, which is a tool artefact (below).
2. **Time zone tests.** Tests that set a zone at run time: `CreateTaskForm.test.tsx` (Perth, plus a "pinned timezone" check), `EditTaskForm.test.tsx` (Perth, plus a Sydney group for the daylight saving hour), `TaskItem.test.tsx` (Perth, plus one test that sets UTC). Under worker threads a runtime `process.env.TZ` change has no effect, so everything ran in Perth. Of the Sydney group's three tests, one (the zone assertion) was skipped; the other two ("editing only the title/description sends no due date") passed in Perth, where the repeated hour does not exist, so they may be passing for a weaker reason than they were written for. The only survivors in time-zone-sensitive code are 727 and 753 (`localInputToIso`); both are still uncaught under ordinary Vitest in four zones (Sydney, Perth, UTC, Los Angeles). The first set of these zone runs was invalid (a harness fault, see `diagnostics/README.md`); they were rerun with the corrected harness and gave the same result. So no survivor is explained by the time zone adaptation. I did not re-test the mutants Stryker killed.
3. **Tests that read source text** (`tasks.actions.test.ts` "source guard", the two `vercel.json` tests in `route.test.ts`): none of them was in any mutant's coverage list or kill list, so they added nothing to the score. Fourteen tests in all covered no mutant (the five "pinned time zone" or skipped tests, three text-reading tests, the export-shape test, a headers test, two schema "ID not a string" tests and two wording tests). A diagnostic test run under Stryker confirmed that a test reading `process.cwd()/src/features/tasks/actions/tasks.actions.ts` reads the **instrumented sandbox copy** (the working directory is `frontend/.stryker-tmp/sandbox-*`, the file is 9,271 characters and contains Stryker's switch code), not the original (6,659 characters) and not any single mutant. Under ordinary Vitest the same read returns the real file.
4. **Static mutants.** 90 mutants run at module load. 12 of them survived (203, 204, 270 to 273, 380, 382, 522, 633, 727, 888, shown as "static" in the inventory). Their zero covering tests is a property of static mutants and not NoCoverage. 11 of the 12 also survive the ordinary suite, so they are real. 888 is the artefact: run alone through Stryker it survives with `testsCompleted: 0` (no test result at all), while the ordinary suite fails to load the module.
5. **The four Timeouts are reproducible.** They are Timeout again at concurrency 1, and under ordinary Vitest one never finishes (killed at 60 s) and three run out of memory after about 25 s. Statuses and score are unchanged. Detail in `classified-survivors.md`.
6. **The 756 against 753 difference** is explained in section 1a.

### Possible, not demonstrated

- The two time zone tests that passed in Perth for a weaker reason (item 2) could have hidden a kill or a survival in the daylight saving logic of `EditTaskForm`; none of the 70 survivors is in that logic.
- Mutants Stryker reported as Killed were not re-checked under the ordinary suite. A kill that depends on running in a worker thread or in Perth would still count as detected.
- Tests with duplicate names (3) are collapsed in the report, so coverage credited to one of them may belong to its twin. This changes no status.
- Per-test coverage and the `related` filter decide which tests Stryker runs. For the 70 survivors this does not matter (item 1). For Killed mutants it could in principle hide additional kills, which does not lower the score.

## 8. Difficulties following the module

For the methodology evidence. Detail in `setup-log.md`.

1. **The module's remedy for the worker-thread time zone problem did not work on its own.** Two tests switch time zone at run time, so no single zone makes the whole suite pass. The module offers no step for a test that cannot run under the tool. I skipped two tests by name, so the measured suite is not the full suite, and Step 4's rule that "if the suite changed, the measurement is worthless" has no clean answer here.
2. **Plugin discovery fails under pnpm** without naming the plugin. Not in the module.
3. **The module does not say how to scope.** Choosing files, excluding type-only and shared code, and mutating two functions of a shared file (line ranges) were my decisions.
4. **Installing the tool changed the project.** The lockfile grew by about 1,500 lines, "nothing in this stage changes the project" no longer holds for the tree as a whole, and a transitive Zod 4 dependency broke `pnpm run typecheck`. That is repaired in the Step 3 session with a scoped `packageExtensions` entry (`setup-log.md` section 12). Typecheck was never run before the install, so the install is the probable cause but is not proved.
5. **A failed run can break the ordinary test suite** by leaving sandbox copies of the tests where Vitest finds them.
6. **The module does not mention** the `related` filter (22 tests silently not run) or that the Vitest runner forces `perTest` coverage; tests that read source text from disk never earn credit (section 7, item 3). Both change what "the suite caught" means.
7. **Time:** the module says about 9 minutes for the run and budgets setup "once per project". Here the run was 6 minutes and the setup was the larger cost.
8. **No entry gate was met as written** (no open PR, no independent approver). Measurement proceeded as a deviation (`run-context.md` section 5).

## 9. Not done, by instruction

No test or source was changed and no gap was fixed. Step 4 (the decision, which needs a named person) is not done. Step 3 is in `classified-survivors.md`.

## Corrections made after the first version of this report

The harness review session added one note to section 7 (the diagnostic harness fault and the rerun); no number changed.

The Step 3 session corrected this file without changing any number in sections 2 to 6. Changes: section 1 now separates the 778, 756, 753, 22, 2 and 754 counts and no longer says the 3-test difference is unexplained; the "Survived but not classified" status line; a statement that this is not a full run of the unchanged suite; new section 7; difficulty 4 now points to the repair. The original text said "Survivors in date and time zone code may be caused by that", which section 7 item 2 settles for the 70 survivors.
