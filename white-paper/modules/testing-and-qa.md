# Stage: Testing and QA

_Entered from Implementation when tests are green and a PR is open. Exits through the Security gate. Run once on the Task CRUD suite in Sprint 2; see [the evidence](../evidence/testing-and-qa.md)._

## What changes: traditional vs AI-native

### Standard practice, without AI

Most testing happens during construction. **SWEBOK v4** puts coding, unit testing
and integration testing in the same knowledge area, and our Implementation module
follows that: it writes the unit tests for each change and checks them as part of
the same review.

What is left for a separate stage is the judgement Implementation cannot make. It
reviews one change at a time. Nobody checks whether the suite, taken together,
actually catches anything.

**ISO/IEC/IEEE 29119**, the international testing standard, calls this test
completion: establishing that testing is sufficient before the work moves on.
*Access note: the standard is paywalled and not held by the RMIT library, so this
is its structure rather than a quotation.*

### How AI changes this

The suite is now largely AI-written, and it grows faster than anyone reads it.

Implementation's checklist asks "do the tests assert real behaviour, not just
pass?" per change. That check works, and it is still not enough. In our evidence
run, 124 tests had each passed that review during Implementation. Mutation testing
on the finished suite found **40 real gaps**.

So the AI-native problem is not that individual tests are bad. It is that a suite
of individually-reasonable tests can still fail to catch anything, and no
per-change review will reveal it.

**What AI does at this stage:** runs the suite, runs mutation testing, and
classifies the results. **What the human decides:** whether the gaps matter enough
to block the change.

## Artifacts generated

| Artifact | What it is | Who uses it |
|---|---|---|
| Mutation report | Which planted faults the suite caught, and which it missed | The reviewer, then the Security gate |
| Classified survivor list | Each surviving mutant marked as a real gap, equivalent, styling only, or a tool artefact | The reviewer |
| Go or no-go decision | Whether the gaps block release, with a named person behind it | The Security gate |

## AI-Assisted Workflow

Four steps. This stage is short by design.

| Step | What happens | Who |
|---|---|---|
| 1 | Run the full suite | AI |
| 2 | Run mutation testing across the changed feature | AI |
| 3 | Classify every surviving mutant | AI drafts, developer checks |
| 4 | Decide: fix, accept, or send back | Named person |

**Step 4 is the human one.** Everything else is a measurement.

## What to ask the AI

### Step 1: run the suite

> "Run the full test suite and report the result. Do not change any test."

A failing suite does not reach this stage. If it does, it goes back to
Implementation.

### Step 2: run mutation testing

> "Run mutation testing across [the changed feature]. Report the score and every
> surviving mutant."

Mutation testing plants small deliberate faults and checks whether any test fails.
A test that asserts nothing useful lets almost every fault survive.

*Expect setup work the first time.* Our run needed Stryker installed and
configured, and hit a problem specific to how Stryker runs tests in worker
threads. Budget for that once per project.

### Step 3: classify the survivors

> "For each surviving mutant, give the file, the line, what changed, and which
> test should have caught it. Classify each one as a real test gap, equivalent (no
> test could tell the difference), styling only, or a tool artefact. Do not change
> any code or tests."

The classification is what makes a mutation report usable. In our run it turned 83
survivors into 40 things worth acting on.

### Step 4: decide

No prompt. A person reads the real gaps against the acceptance criteria and
decides whether the change can proceed.

## What to verify before accepting output

**1. Are the "real gaps" really gaps?** Spot-check the classification. The AI is
reading its own tooling's output and can be wrong about it.

**2. Are the survivors tool artefacts?** In our run, five survivors in one file
were mutants Stryker never actually loaded, not weak tests. The AI found this
itself by running the mutations in Node and confirming they would throw at load
time. A surviving mutant is not automatically a test gap.

**3. Do the real gaps touch an acceptance criterion?** A gap in styling is not the
same as a gap in whether a task saves to the right place. Read the gaps against
the spec, not in isolation.

**4. Was anything changed to improve the score?** Nothing in this stage should
edit a test. If the suite changed, the measurement is worthless.

## The pattern to look for

Our evidence run found the 40 gaps shared a shape, and it is more useful than a
count.

**The tests only ever ask easy questions.** Every component test used a task with
an empty description, so nothing checked a description rendered. Every list test
had authentication already loaded, so the loading branch was never exercised. No
form test triggered a description error, which is why six mutations around that
validation all survived together.

**Some gaps hide behind a test that looks like it covers them.** A delete test
removed the *first* item, so changing `index - 1` to `index + 1` made no
difference. A failure test used the same error constant as the fallback, so
deleting the fallback changed nothing. Both tests pass. Neither tests what it
appears to.

**One gap was serious.** A database collection name could be changed to an empty
string without any test noticing, because the test double ignored its argument. A
test can pass while the code points at the wrong place entirely.

So the thing to look for is not "tests that assert nothing". It is **tests that
only ever run one easy scenario**.

## Governance and security touchpoints

- **This stage produces the evidence the Security gate reads:** the mutation
  report, the classified survivor list and the go or no-go decision.
- **Nothing here edits a test.** If the suite changes during this stage, the
  measurement no longer means anything.
- **The person who wrote the change should not be the only one who approves the
  gaps.** Implementation already requires a named approver; this stage inherits
  that.

Full treatment in [white-paper/governance/](../governance/).

## How authorship is recorded

This stage adds no code, so there is nothing new to attribute. The tests carry
whatever attribution Implementation recorded.

**What this stage should record** is the decision: who read the gaps, what they
decided, and when. That goes on the pull request alongside the mutation report.

## In practice

From the evidence run, on the Task CRUD suite.

**Starting point.** 124 tests, 8 files, all passing. Every one had been written
and reviewed during Implementation.

**Step 1.** Suite run. All green.

**Step 2.** Stryker installed and configured, scoped to the tasks feature. First
run stopped on a time zone test that passed under plain Vitest but failed under
Stryker. The AI diagnosed it as Stryker forcing worker threads, which cannot
change their own time zone, and fixed it by setting the zone before Stryker
starts rather than editing the test.

Mutation score: **83.4%**.

**Step 3.** 83 survivors, classified: 40 real gaps, 29 equivalent, 9 styling only,
5 tool artefacts.

**Step 4.** Not completed. The gaps were recorded rather than fixed, because this
was a measurement run.

**Time and cost.** About 27 minutes, two prompts, $1.90. Roughly 9 minutes of that
is the mutation run itself, and 5m 37s is AI time. Most of the stage is waiting.

## Metrics for success

| Measure | What it tells you |
|---|---|
| Mutation score | Whether the suite catches anything. 83.4% in our one run |
| Real gaps after classification | The number worth acting on. 40 of 83 survivors in our run |
| Gaps touching an acceptance criterion | Which gaps actually matter |
| Tests changed during this stage | Should be zero |

**Do not measure** coverage, or number of tests. Both rise when assertion quality
falls, which is the failure this stage exists to catch.

**No benchmark exists** for what a good mutation score looks like. We have one
data point. Treat 83.4% as a baseline to compare against, not a target.

## How this differs by experience level

**Junior developers** will find the mutation report does the hard part. It points
at the weak tests directly, which is easier than reading 124 tests and judging
each one.

**Senior developers** are better placed to judge the classification, which is
where the real skill is. Deciding whether a survivor is a genuine gap or
genuinely uncatchable needs knowing the code.

**Both should be sceptical of the tool.** Five of our 83 survivors were artefacts.
The check needs checking.

## What this stage does not cover

- **Writing tests.** Implementation. It produces the unit tests this stage
  measures.
- **Checking an individual change's tests.** Also Implementation, whose checklist
  already asks whether tests assert real behaviour.
- **Security scanning.** The Security gate, immediately after.
- **Deciding whether to release.** The Release Approved gate.
- **Production monitoring.** Maintenance and Operations.

## Open questions

1. **Is 83.4% good?** No benchmark exists in our research or the module. One data
   point is not a baseline.
2. **Does fixing the gaps help?** Nobody has added tests for the 40 gaps and
   re-run to see whether the score moves or the gaps were real.
3. **How often should this run?** Per change is slow at 9 minutes. Per release may
   be too late. Undecided.
4. **Who approves at NBN?** Needs client input, same as the other stages.
5. **ISO/IEC/IEEE 29119 is paywalled**, so the test completion framing comes from
   previews and secondary summaries.

## Key takeaways

- **This stage is short.** Implementation writes and reviews the tests. This stage
  asks one question the per-change review cannot: does the suite as a whole catch
  anything?
- **Per-change review is not enough.** 124 tests each passed Implementation's
  check. 40 real gaps survived anyway.
- **Mutation testing is the measurement, not the verdict.** It produces false
  positives. Classify the survivors before acting on them.
- **Look for tests that only run one easy scenario**, not just tests that assert
  nothing. That was the shape of every gap we found.
- **Nothing in this stage edits a test.** If the suite changes, the measurement
  is worthless.

**Research behind this module:** [research/modules/testing-and-qa.md](../../research/modules/testing-and-qa.md)

**Evidence this module was tested against:** [white-paper/evidence/testing-and-qa.md](../evidence/testing-and-qa.md)