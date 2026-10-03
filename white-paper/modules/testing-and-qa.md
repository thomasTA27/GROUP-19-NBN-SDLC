# Stage: Testing and QA

_Entered from Implementation. Exits through the Security gate when tests are green and a PR is open. Not yet run on a real feature; to be tested in Sprint 2._

## What changes: traditional vs AI-native

### Standard practice, without AI

A change arrives with the code written and the acceptance criteria already agreed
at Planning. Someone has to establish whether the change does what it was meant to
do.

The recognised standard is **ISO/IEC/IEEE 29119**, the international software
testing standard. It covers test processes and supplies the documentation that
gets signed off.

The **test pyramid**, from Mike Cohn's *Succeeding with Agile*, gives the shape.
Ham Vocke's summary of it is two rules: write tests with different granularity,
and the more high-level you get the fewer tests you should have. He adds a third
point that matters here: test for observable behaviour instead of implementation,
and treat test code as being as important as production code.

In practice the developer writes the tests, a peer reviews code and tests
together, and the acceptance criteria are confirmed before sign-off.

The developer is verifying here, not deciding. The decisions were made at
Planning. This stage establishes whether they were honoured.

### How AI changes this

**AI does the task: writing tests.** Copilot's `/tests` command, Claude Code's
test-first loop and Playwright's generator agent all turn a description or a piece
of code into tests in minutes.

**AI does the task: running and repairing.** GitHub's coding agent runs tests and
linters in its own environment. Playwright ships three agents: a planner that
explores the app and writes a test plan, a generator that turns the plan into test
files, and a healer that runs the suite and repairs failing tests. The healer's
documented output is a passing test, or a skipped test if it believes the
functionality is broken.

**AI does the task: checking criteria.** Atlassian's Rovo Dev can check a change
against the acceptance criteria in a linked Jira item.

**The human keeps the oracle.** The oracle is the expected answer a test checks
against. Deciding what the right answer is cannot be delegated.

### The failure mode specific to this stage

Konstantinou, Degiovanni and Papadakis (University of Luxembourg, 2024) studied
test oracles across 24 open-source Java repositories. They found that LLM-based
test generation is prone to generating oracles that capture the actual program
behaviour rather than the expected one.

In plain terms: the AI writes tests describing what the code does, not what it
should do. If the code has a bug, the test records the bug as correct.

Two further findings from the same paper matter here.

**LLMs are better at writing oracles than judging them.** So asking a second AI to
review the tests does not close this gap.

**But LLM oracles have higher fault detection potential than EvoSuite's**, the
established automated alternative. AI test generation is not worse than the tool
it replaces. It is better. It is still not a substitute for a person deciding what
the right answer is.

## Artifacts generated

| Artifact | What it is | Who uses it |
|---|---|---|
| Test suite | Unit, integration and end-to-end tests | Implementation, and every future change |
| Criteria-to-test table | Each acceptance criterion mapped to its tests | The Security gate and the reviewer |
| Mutation report | Which planted faults the tests caught | The reviewer, as evidence the tests bite |
| Review approval | A named person, not the agent that wrote the code | The governance trail |

## AI-Assisted Workflow

| Step | What happens | Who |
|---|---|---|
| 1 | Give the AI the acceptance criteria, not the implementation | Developer |
| 2 | AI drafts tests against each criterion | AI |
| 3 | AI runs the suite and reports results | AI |
| 4 | AI runs mutation testing and reports surviving faults | AI |
| 5 | Read every test. Reject any that asserts nothing | Developer |
| 6 | Second opinion on missing cases | AI |
| 7 | A named person approves | Reviewer |

**Step 5 is the human one.** If nobody reads the assertions, this stage produces
coverage without verification.

**Step 1 is where this stage usually goes wrong.** Giving the AI the code produces
tests that describe the code. Giving it the criteria produces tests that describe
the requirement.

## What to ask the AI

### Step 1: start from the criteria

> "Here are the acceptance criteria for this change: [criteria]. List the testable
> behaviours in them. Do not read the implementation yet."

### Step 2: draft the tests

> "Write tests for each behaviour you listed. Every test must assert a specific
> expected value, state change or error. Do not use not-null, truthy, type-only or
> no-exception-thrown as the only assertion. Test observable behaviour, not
> implementation detail."

### Step 3: run them

> "Run the suite and show me the output. Do not change any test to make it pass."

### Step 4: prove the tests bite

> "Run mutation testing on the changed files. Report every surviving mutant and
> which test should have caught it."

A surviving mutant means a deliberate fault was planted and no test noticed.

### Step 5: read it yourself

No prompt. See the verification section.

### Step 6: second opinion

> "Review these tests for missing cases and for any test that would pass whether
> the code were correct or not."

Useful for gaps. Not sufficient as the check, because the research found LLMs are
better at writing oracles than judging them.

### Step 7: sign off

> "Produce a table mapping each acceptance criterion to the tests covering it.
> Mark any criterion you could not test."

A named person then approves. The agent that wrote the code cannot approve its own
tests.

### Using a skill instead of prompting

The step 2 rules are identical every time, which makes them a candidate for a
**skill**: a `SKILL.md` committed to the repository that Claude loads when asked
to write tests. It should encode the banned assertion patterns, what may be
mocked, which test types are required, and the requirement to report mutation
results.

In **GitHub Copilot** the equivalent is a path-scoped instruction file applying to
the test directory. Copilot code review reads these too, so the same rules apply
when the AI reviews tests as when it writes them.

*Untested.* We have not run this stage with a committed skill.

## What to verify before accepting output

**1. Does every test assert a specific expected value?** Reject any test whose
only assertion is not-null, truthy, type-only, or that no exception was thrown.
These pass whether the code is right or wrong.

Siddiq et al. (EASE 2024) found LLM-generated tests heavily affected by Assertion
Roulette and Magic Number Test. They also produced Empty Tests, Redundant
Assertion and Constructor Initialization smells, none of which EvoSuite produced
at all. Our own walkthrough found two of six generated tests asserted nothing
useful.

**2. Would each test fail if the code were wrong?** The mutation report answers
this objectively.

**3. Does every acceptance criterion have a test?** The criteria-to-test table
shows this.

**4. Was anything skipped or weakened to reach green?** Playwright's healer agent
can mark a test skipped if it believes the functionality is broken. That is a
judgement a person should make, so every skipped test needs a human decision
behind it.

**On coverage.** Coverage counts lines executed, not behaviour verified. That
matters more with AI-generated tests, because assertion-weak tests execute code
without checking results. Coverage can rise while fault detection does not.
*Stated as reasoning, not a measured finding.*

## Governance and security touchpoints

- **This stage feeds the Security gate.** The criteria-to-test table and the
  mutation report are the evidence that gate reads.
- **The AI that wrote the code must not approve its own tests.**
- **Keep any AI auto-approve feature turned off.** For critical infrastructure the
  approval should be a person.
- **Security scanning is out of scope here.** The Security gate runs it. This
  stage checks the change does what the criteria say.

Full treatment in [white-paper/governance/](../governance/).

## How authorship is recorded

GitHub's coding agent authors commits with the human who started the task as
co-author. Claude Code adds a co-author trailer by default, configurable through
its attribution setting.

**Two gaps.** Neither tool marks *individual tests* as AI-generated, so a pull
request with thirty tests gives no way to tell which a person wrote. And because
attribution can be switched off, a missing trailer does not prove no AI was used.
For NBN this should be enforced through managed settings rather than defaults.

**House convention to adopt:** an `ai-generated-tests` label on the pull request,
with the criteria-to-test table and mutation report attached.

## Practical angle: what this looks like on a real change

Not yet run on a real feature. This is what the stage should look like, drawn from
the research and our earlier walkthrough.

**Step 1.** The acceptance criteria go to the AI. Not the code. The temptation is
to paste the implementation, and that is what produces tests describing the code.

**Step 2.** The AI drafts tests for each criterion, with the banned assertion
patterns stated in the prompt.

**Step 3.** The suite runs. Green.

**Step 4.** Mutation testing runs. Surviving faults mean tests that would not have
noticed if that code were broken.

**Step 5.** A person reads every test. In our earlier walkthrough, two of six only
checked that a function returned something. Those are rewritten.

**Steps 6 and 7.** Second opinion for missing cases, then a named person approves
and the change moves to the Security gate.

**What this stage would have caught.** The two assertion-free tests, before they
reached a gate that would have passed them.

## Metrics for success

**Cost is not yet measured for this stage.** Our Planning module measured $1.86
and $12.80 across two runs and found the driver was repeated rewriting rather than
context loading. The equivalent figure here is unknown until we run it.

| Measure | What it tells you |
|---|---|
| Surviving mutants per change | Whether the tests catch anything. The strongest single signal |
| Tests rejected at review for weak assertions | The failure mode specific to this stage |
| Acceptance criteria with no test | Gaps the suite does not cover |
| Tests skipped or weakened to reach green | Whether the suite was made to pass rather than made to work |
| Defect escape rate | Whether any of this reduced defects reaching production |

**Do not measure** coverage alone, or number of tests generated. Both rise when
assertion quality falls.

**A note on published numbers.** Most at-scale figures in this space come from
vendors measuring their own tools. Treat them as reported, not established.

## How this differs by experience level

**Junior developers** are most exposed, because this failure is invisible. A test
that asserts nothing still passes, still shows green, and still raises coverage.
Noticing that a test would pass whether the code worked or not requires knowing
what the code is supposed to do.

The rule to enforce: read the assertion, not the test name.

**Senior developers** catch weak assertions faster but face volume. Thirty
generated tests is slow to review properly, and skimming is tempting. The mutation
report is the defence, because it directs attention to the tests that caught
nothing.

**Both face the same trap.** A passing suite feels like evidence. It is only
evidence if the tests would have failed.

## What this stage does not cover

- **Writing the acceptance criteria.** Planning and Spec Authoring, although the
  criteria written there are what these tests check against.
- **Writing the implementation.** Implementation.
- **Security scanning.** The Security gate, immediately after this stage.
- **Deciding whether to release.** The Release Approved gate.
- **Production monitoring.** Maintenance and Operations.

## Open questions

1. **Reviewer fatigue is unevidenced** for this case. Does review quality drop
   with thirty generated tests rather than six? Testable in Sprint 2.
2. **Does NBN have testing evidence obligations?** The Australian ISM covers
   software security testing, but whether it binds NBN needs client confirmation.
3. **Whether a committed skill changes behaviour.** Same open question as Planning.
4. **ISO/IEC/IEEE 29119 is paywalled.** The description above comes from previews
   and secondary summaries.

## Key takeaways

- **AI writes tests from the code unless you stop it.** Give it the acceptance
  criteria instead, or the tests record existing bugs as correct.
- **AI is worse at judging a test than writing one**, so a second AI review does
  not replace a person reading the assertions.
- **A green suite proves nothing on its own.** Mutation testing is the check that
  the tests catch anything.
- **Reject any test whose only assertion is not-null or truthy.** Documented in
  the research and found in our own walkthrough.
- **Coverage is the wrong measure here.** It counts lines executed, not behaviour
  verified.

**Research behind this module:** [research/modules/testing-and-qa.md](../../research/modules/testing-and-qa.md)