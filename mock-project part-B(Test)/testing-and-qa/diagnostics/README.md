# Diagnostics for Step 3 (verification of the classifications)

**DIAGNOSTIC ONLY. Not part of the application, not part of the project's tests, and not baseline tests.** Nothing here was added to `frontend/tests/`, and nothing here strengthens or replaces an existing test. The files exist so the verification in `testing-and-qa/classified-survivors.md` can be repeated and inspected. Every "mutant" behaviour these scripts observe is a planted fault in a disposable copy, not a defect in the application.

## What is here

| Path | What it is |
|---|---|
| `probe.mjs` | Applies one mutant from the **original** `reports/mutation.json` to a disposable copy and runs the ordinary Vitest suite (forks pool, working time zones, `tests/diag/**` excluded), then restores the file. Gives each run a `verdict` (below). Optional env: `PROBE_FILES`, `PROBE_TIMEOUT`, `PROBE_EXPECT_TOTAL`, `PROBE_LOG` |
| `diagprobe.mjs` | The same, but runs the diagnostic tests in `tests/` and collects assertion failures and traces. Optional env: `DIAG_EXPECT_TOTAL` (44), `DIAG_EXPECT_TRACES` (9), `DIAG_TIMEOUT` |
| `tests/diag-*.test.ts(x)` | The 44 diagnostic tests. *Assertions* state intended behaviour and pass on the original; *traces* write observable state to `diag-trace.jsonl` so an original run and a mutant run can be compared |
| `counts.mjs` | Compares `vitest list` output with the JSON report's test counts (the 756 against 753 difference) |
| `compare-diag-runs.mjs` | Compares the corrected diagnostic run with the first one (takes the scratch folder and the `results/superseded` folder as arguments) |
| `generate-classified.mjs`, `classified-header.md`, `classified-footer.md` | Build `../classified-survivors.md`. The classification data is in the script |
| `results/` | Raw outputs from the corrected harness (below). `results/superseded/` keeps the first-run files and the earlier script versions |

## Verdicts

`probe.mjs`: `caught` (a test failed or a suite could not load, in a fresh result file), `not-caught` (exit 0, fresh readable result, the expected 778 tests, none failed), `timeout` (killed by the time limit), `invalid` (anything else: spawn error, signal, missing, empty or unreadable result, parse error, unexpected test count, non-zero exit with no failure recorded). Only `not-caught` means the suite did not notice. `timeout` and `invalid` mean no answer, never a pass.

`diagprobe.mjs`: `assertion-fails`, `all-pass` (exit 0, 44 tests, 9 trace records, nothing failed), `timeout`, `invalid`. A missing result is never reported as a failed assertion.

Before each run both scripts delete the previous result (and trace) file, check it is gone, read only what the new run wrote, and restore the mutated file in `finally` (and check it was restored).

## Script history (what is and is not known)

This section records what the retained files show and the order of events in the sessions. It does not claim more than that.

| Time (session clock) | Event | Retained? |
|---|---|---|
| 03:11 to 03:17 | The first version of `probe.mjs` ran the 7 controls and the 70 ordinary-suite probes | **The script as it was then is not retained.** The file was edited afterwards |
| between 03:17 and 03:26 (exact time not recorded) | `PROBE_FILES` and `PROBE_TIMEOUT` added (to run `route.test.ts` alone for the Timeout mutants) | Not as a separate copy |
| 03:26:54 | `PROBE_LOG` and a line emptying `probe-result.json` after Vitest finished and before it was read added; this is the last modification before the fix. It was added to avoid reading a stale file after a run that crashed | The result is the file saved in `results/superseded/probe.mjs.as-checked-in-before-fix` |
| 03:28 to 03:30 | The time-zone variants for mutants 727 and 753 ran with that version | Their saved results all have `total: null` and `parseError: "Unexpected end of JSON input"`: **invalid evidence** (kept in `results/superseded/…INVALID-parse-errors.jsonl`) |
| 03:32:51 | `diagprobe.mjs` written. It deleted old outputs before launching, but reported a missing result as a failed assertion and checked no test count | Saved unchanged in `results/superseded/diagprobe.mjs.as-checked-in-before-review`; it is byte-identical to the file in the scratch folder and was written before every saved diagnostic result (03:33 to 03:36), so it is the version that produced them |

**The discrepancy.** The checked-in `probe.mjs` emptied the result file before reading it, so run with the checked-in script every probe would have a parse error and `failedCount` 0. The saved results of the 70 probes and the controls show parsed counts (778 tests, 53 failed, and so on) because they were produced by the earlier version that had no emptying line. That earlier version was not saved, and it also did not delete a stale result before launching. For runs with exit 0 Vitest writes the file at the end, so the parsed counts were almost certainly fresh, and the saved `exit`, `signal` and total fields support that. But the script cannot be shown, so the correctness of those results cannot be proved from retained evidence. They were therefore rerun with the corrected harness (below). They agree exactly.

The saved results of the mutants 727 and 753 under Perth, UTC and Los Angeles were produced by the emptying version and were not valid. They are rerun too.

## Results (corrected harness)

| File | Contents |
|---|---|
| `ordinary-suite-probe-70.json` | All 70 undetected mutants, one at a time, full 778-test suite: 69 `not-caught`, 1 `caught` (888, 217 tests ran, 7 suites did not load). No `invalid` or `timeout` |
| `ordinary-suite-controls-and-baseline.jsonl` | The unmutated copy (`not-caught`, 778 tests) and seven mutants Stryker killed (all `caught`) |
| `harness-validation-probe.jsonl`, `harness-validation-diagprobe.jsonl` | The validation runs of the two scripts: baseline, a killed control, mutant 90, a NoCoverage mutant (986), mutant 888, and three failure modes (a planted stale passing result with a test path that does not exist, a time limit too short, and a wrong expected count). The failure modes gave `invalid`, `timeout` and `invalid`, never a pass. The validation of `probe.mjs` was first run while `tests/diag/` was still in the copy (822 tests, so the expected-total check made the baseline `invalid`); `--exclude tests/diag/**` was then added and the validation redone. Only the second run's file is kept |
| `diag-baseline-original.jsonl`, `diag-probe-70.jsonl` | Diagnostic tests on the original and each of the 70 mutants: 38 `assertion-fails`, 32 `all-pass`, no `invalid`. The same 38 as the first run. The 32 `all-pass` are the 23 equivalent, the 8 styling-only and 203 (shown by a trace difference). Three `all-pass` runs have a trace difference from the original: 97 (only the impossible snapshot), 203 (the due-date message) and 384 (only the `id` attribute) |
| `timezone-variants-727-753.jsonl` | Mutants 727 and 753 under Perth, UTC, Los Angeles and Sydney: all `not-caught` with 778 tests |
| `timeout-probes-corrected-harness.jsonl` and `timeout-mutant-{54,70,72,73}-ordinary-vitest-tail.txt` | The four Timeout mutants in ordinary Vitest, `route.test.ts` only, 60 s limit: 54 `timeout`; 70, 72 and 73 `invalid` (no result file; the logged tail shows an out-of-memory crash) |
| `timeouts-concurrency1-stryker.json` | Stryker re-run of `route.ts` lines 90 to 140 at concurrency 1 (the four Timeouts reproduce). Not affected by the harness change |
| `isolated-stryker-888.json` | Stryker run on mutant 888 alone (`testsCompleted: 0`). Not affected |
| `source-read-under-stryker-vs-ordinary.txt`, `vitest-list-778.json` | Not affected |

## How to repeat

1. Make a disposable copy of `frontend/` (do not run anything in the real `frontend/`): copy `src`, `tests`, `vitest.config.ts`, `tsconfig.json`, `vercel.json`, `package.json`, `stryker.config.mjs`, `vitest.stryker.config.ts`, `stryker/`, plus `firebase/firestore.rules` one level up. Link (do not copy) `node_modules` into `<copy>/frontend/node_modules` and `<copy>/node_modules` with directory junctions.
2. Copy `tests/diag-*.test.ts*` into `<copy>/frontend/tests/diag/`. The ordinary probe excludes that folder.
3. The scripts call `node …/vitest.mjs` directly, not `pnpm exec`: in a copy with its own `package.json`, `pnpm exec` tries to run `pnpm install`.
4. `node probe.mjs <copy> <project> <out.jsonl> <base|id,id,...> [tz]` and `node diagprobe.mjs <copy> <project> <out.jsonl> <base|id,id,...>`.

Mutant IDs are those in the original report and `reports/survivors-inventory.md`. The scripts read the report from `<project>/testing-and-qa/reports/mutation.json`; do not overwrite it.
