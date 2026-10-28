# Testing and QA, Part B: classified survivors (module step 3)

**Date:** 2026-10-04. **Classified by:** Claude Code (claude-sonnet-5-5), third session; harness reviewed and re-run in the fourth. **Developer check:** not yet done. The classification is an AI draft until a person has spot-checked it; the verification below is the AI's own and is not independent review.
**Not done:** no test was added or changed, no gap was fixed, no decision was made. Step 4 (decide) is not in this file.

## A note on wording

The mutation run plants small deliberate faults (mutants). **Every behaviour described in this file as "accepted", "refused", "focus lands on…" and so on is the behaviour of a planted fault in a disposable copy. None of it was observed in the application.** A "real test gap" means the existing tests would not notice such a fault, not that the application has a bug. Where a consequence for the live application is mentioned, it is a conditional ("if the code did this") and has not been checked in a real browser or against the deployed services.

## What this covers

All 70 undetected mutants from the original run: 67 Survived and 3 NoCoverage, each once, with Stryker's status left as reported. The original reports are unchanged (`testing-and-qa/reports/mutation.json` SHA-256 `4f4b773bcb6d650a6c6333b2af1db574712a527d8503da8a9240ffefebd08aff`, `mutation.html` `26d460cb3e81915ab7291ef29da6f7fd28058f72c879e0d1e2d519e74cdd113b`). The score stays **92.65%**, as reported, with the limitations in `mutation-report.md`. This file does not adjust it.

## Inputs read

The Part B source and tests named in each row, `task-crud-spec.md`, ADR-0001 to ADR-0006, `implementation/plan.md`, `docs/TESTING.md`, the survivors inventory and the original mutation JSON. Not read: Part A's application, configuration or mutation report. Exposure to Part A is as recorded in `run-context.md` section 1 (the module text quotes Part A's headline numbers). The count of real gaps below happens to be close to the one the module reports for Part A; I did not look at Part A to check anything, and no comparison is drawn.

## Classes used

| Class | Meaning here |
|---|---|
| Real test gap | A planted fault changes behaviour that a requirement or documented intent cares about, and no existing test notices. Backed by a diagnostic assertion that fails on the mutant and passes on the original code (37 of 38), or, for 203, by a trace showing a different message. |
| Equivalent | I found no input in the valid domain, and no reachable sequence, that tells the mutant from the original. The basis is **code reasoning about the valid domain**; sampled traces over generated inputs or interaction sequences are supporting evidence only. Equal traces do not prove equivalence, and each row states the reasoning and the domain. |
| Styling only | Changes a presentation class string and no traced behaviour. Each row says what the class carries; none is called harmless without that check. |
| Tool artefact | The survival comes from how Stryker ran the mutant, not from the tests. |
| Unresolved | Could not be settled. **None remain.** Rows with Medium confidence are the least settled. |

"Severity" on a real gap is my judgement of consequence (High, Medium, Low), not a tool value.

## How each finding was checked

1. **Ordinary suite probe (all 70).** The mutant's code from the original report was applied, one at a time, to a disposable copy, and the full ordinary suite (778 tests, Vitest forks pool, working time zones, **including the two tests Stryker skipped**, with no per-test selection) was run. A corrected harness (below) ran them: 69 of the 70 had `not-caught` (exit 0, 778 tests, none failed); 888 was `caught` because the module cannot load (217 tests ran, 7 suites failed to load). Seven mutants Stryker had killed were run as controls and all seven were `caught`; the unmutated copy was `not-caught` with 778 tests. So no survivor other than 888 is explained by the skipped tests or by Stryker's adapted run.
2. **Diagnostic tests (all 70).** A separate set of 44 tests, kept in `testing-and-qa/diagnostics/tests/`, written only for this verification and run only in the disposable copy. They are not part of the project's tests and nothing was added to `frontend/tests/`. *Assertions* state the intended behaviour: they pass on the original and fail on a mutant with a real gap. *Traces* record observable state (error text, focus, ARIA attributes, return values, 40,000 generated date inputs) so a mutant run can be compared with the original run. Failing assertions back a "real gap"; equal traces are supporting evidence for an "equivalent" finding.
3. **Stryker re-runs.** Mutant 888 alone, to show the tool artefact; the four Timeout mutants at concurrency 1.

### Harness correction and provenance (fourth session)

The first version of `probe.mjs` did not delete the previous run's result file before launching Vitest, and a later edit (made while investigating the Timeout mutants, after the 70 probes and the controls had run) emptied the result file before it was read. The 70 ordinary-suite results and the controls were produced **before** that edit; the four time-zone-variant results for mutants 727 and 753 were produced **after** it and contain parse errors, so they were invalid. The version used for the first 70 probes was not kept as a file, so its correctness could not be shown from retained evidence. All of these were therefore **rerun with the corrected harness**, and the first-run files are kept separately in `diagnostics/results/superseded/`. **No classification changed**: all 70 ordinary-suite verdicts, the seven controls, the diagnostic-test verdicts and the trace differences are the same as in the first run, and the time-zone variants are now valid (mutants 727 and 753 are `not-caught` in Perth, UTC, Los Angeles and Sydney). Full account in `testing-and-qa/diagnostics/README.md`.

## What the verification does not show

- "Equivalent" rests on code reasoning about the valid domain, with sampled traces as support. It is not a proof. Medium-confidence rows lean most on the code's structure.
- A failing diagnostic assertion shows that a behaviour difference exists and that a test could detect it. It does not show a user would meet it. Reachability is stated in the row where it is low.
- The severity and the mapping to acceptance criteria are mine and have not been reviewed.
- Nothing here exercises the deployed rules, index, real authentication, the real Admin SDK, a real browser or Tailwind's CSS. A styling finding can only be confirmed by looking at the page.
