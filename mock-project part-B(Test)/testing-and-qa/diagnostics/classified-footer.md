## Timeout mutants (original status Timeout, kept in the score as detected)

These four were not classified as undetected; they were checked because the brief asked for it. Ids are from the original run.

| ID | Location | Mutation | Original run | Concurrency 1 (Stryker, `route.ts` lines 90-140, 36 mutants) | Ordinary Vitest, `route.test.ts` only, hard stop at 60 s |
|---|---|---|---|---|---|
| 54 | 95:14 | body of `for (;;)` emptied | Timeout | **Timeout** | Killed by my 60 s limit (SIGTERM): did not finish |
| 70 | 114:11 | `page.size < PAGE_SIZE` becomes `false` | Timeout | **Timeout** | Out of memory after about 25 s (heap near 4 GB), exit 1 |
| 72 | 114:11 | `<` becomes `>=` | Timeout | **Timeout** | Out of memory after about 25 s |
| 73 | 114:34 | `done = true; stopped = ...; break` block emptied | Timeout | **Timeout** | Out of memory after about 25 s |

All four reproduce at concurrency 1, so they are not load artefacts of the 16-worker run. They are consistent with a nonterminating loop: 54 is a loop with an empty body; in 70, 72 and 73 the exit condition that ends paging when a short page returns is removed, so the mocked query keeps returning data and the loop keeps accumulating until memory runs out (the time-budget exit never fires in tests that freeze the clock). I did not prove non-termination formally. In the corrected harness the ordinary-Vitest run of mutant 54 is a `timeout` (killed at 60 s) and those of 70, 72 and 73 are `invalid` (no result file; the log shows an out-of-memory crash), so they give no pass or fail verdict, only the log evidence. The other 32 mutants in the range were Killed at concurrency 1. Their Timeout status and the score are unchanged.

## Summary of failure patterns

**1. Test doubles that supply the answer (the most serious gaps).** Three mutants change the collection name or remove the collection helper and no test notices: 986, 987, 988 (the real `getTasksCollection` is never run; `useTasks.test.ts` substitutes its own) and 90 (the transaction helper's `collection("tasks")`; the mock `collection()` accepts any name and only createTask's name is asserted). These are the module's "collection name changed to an empty string" shape. A fault of this kind in the application would affect AC-4.1 and the update, toggle and delete paths, and the suite would still pass.

**2. Tests that only ask the easy question.** Validation tests pick one or two bad examples and stop: month 13 and hour 24 are tested, month 00, day 00, minute 60, seconds 60, offset 24h, a 31st in a 30-day month and trailing text are not (633, 690, 693, 696, 699, 787, 796, 802, 727, 753); no year divisible by 400 (780, 782); no legal ID with a second `__` (864, 865). A mutant that accepts such an impossible date turns it into a different moment (AC-2.9); the real code refuses it, and no test says so. The component tests set every field before submitting, so the untouched-form message is never read (203, AC-2.1b).

**3. Focus and accessibility state asserted only after an interaction.** Tests check that focus moves when a confirmation opens or closes. None checks that nothing is focused on first render (388, 389, 396, 404, 406), that a region is not `aria-busy` while idle (485, 507), or that Escape does not leak to an ancestor (479). If the application stole focus on render, it would affect every keyboard user of the live list (AC-8.4a); the mutants do this and nothing fails.

**4. A defensive branch tested for its count, not its effect.** The in-flight guard's "skipped" path is exercised by a same-tick double click, but the test checks only the call count, not that no error toast or state reset follows (423, 459, 461). The matching toggle branch cannot be reached (446, 448).

**5. Logged text.** Eight survivors are log labels or when the log fires (183, 196, 239, 331, 431, 593, 596, 597). The suite checks that something is logged, seldom what or when. Low consequence; no AC fixes the wording.

**6. Styling carrying accessibility.** All eight styling survivors (204, 270 to 273, 380, 382, 522) are class strings that include the keyboard focus outline or ring (AC-8.4c), with `aria-invalid` and disabled styling on some. jsdom cannot see them, and the plan assigns AC-8.4c to a browser check. They are "styling only" for a unit suite and not harmless for the product.

**7. Equivalent mutants are mostly defaults, error types and clamps.** Twenty-three, each judged equivalent on code reasoning about the valid domain (sampled traces support, but do not prove, that): fallbacks whose replacement gives the same number or string (663, 665, 672, 674, 6, 577), error `type` labels nothing reads (223, 235, 308, 327), ref and flag handling that no reachable sequence can disturb (290, 384, 395, 399, 400, 409, 410), two query helpers that are the same call (960, 962), and four more (20, 97, 446, 448) explained in their rows.

## Acceptance criteria touched by real gaps

| Criterion | Mutants |
|---|---|
| AC-4.1, AC-1.2 (list reads the tasks collection) | 986, 987, 988 |
| AC-1.3, 5.1, 6.1, 6.2, 7.1 to 7.4 (writes reach the task record) | 90 |
| AC-2.9 (field rules enforced on direct requests) | 633, 690, 693, 696, 699, 780, 782, 787, 796, 802, 864, 865 |
| AC-2.4, AC-2.8 (date entry and its error message) | 727, 753, 203 |
| AC-2.1b (due date required, message states the rule) | 203 |
| AC-8.4a, AC-8.4c (focus and accessible state) | 388, 389, 396, 404, 406, 479, 485, 507 |
| AC-8.1a, AC-7.5 (no error shown when nothing failed) | 423, 459, 461 |
| Logging only (ADR-0006 / rule 5; no AC) | 183, 196, 239, 331, 431, 593, 596, 597 |

## What the module did not explain

- How to treat a survivor the tool cannot test at all (no CSS in jsdom) or cannot run (a module that fails to load counted as survival).
- That "Survived" with 0 covering tests can mean either NoCoverage-like absence or a static mutant; the report's `coveredBy` is empty for both, and only the status and `static` flag tell them apart.
- How to verify "equivalent": the module says no test could tell the difference but not how to establish that. Here it took traces over generated inputs and sequences, which is more effort than the module suggests.
- That the diagnostic work to verify a classification needs a disposable copy and its own harness, and that running the ordinary suite is a separate check from Stryker's adapted run.
- That the classification takes much longer than the module's "AI drafts, developer checks" implies: the draft is quick, the verification is most of the time.
