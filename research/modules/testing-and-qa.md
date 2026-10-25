# Testing and QA

**Name:** Ujjawal Mittal
**Last updated:** 2026-10-02

Raw findings for the Testing and QA phase. Claims below are limited to what the
cited sources actually say. Where a figure is widely repeated but I could not open
the source text, it is left out.

---

## What does a developer do during Testing and QA?

**What I was looking for.** A citable description of the phase that does not
depend on an AI vendor.

**ISO/IEC/IEEE 29119** is the international software testing standard, published
in five parts covering concepts, test processes, documentation, techniques and
keyword-driven testing. Part 2 sets out the test processes and Part 3 supplies the
documentation templates that get signed off.

**Access note.** The standard is paywalled. I read the ISO Online Browsing
Platform preview and secondary summaries. I have not read the full text, so this
module describes its structure rather than quoting it.

**The test pyramid**, from Mike Cohn's *Succeeding with Agile* and set out by Ham
Vocke on martinfowler.com. Vocke's summary: "Write tests with different
granularity" and "The more high-level you get the fewer tests you should have."
He also says "Test for observable behavior instead" and "Test code is as important
as production code. Give it the same level of care and attention."
*Verified against the article.*

**Position on the developer.** The developer is verifying here, not deciding. The
decisions were made at Planning. This matches how our lifecycle map classifies the
stage.

---

## What can an AI tool do during Testing and QA?

**Playwright test agents.** *Verified against playwright.dev/docs/test-agents.*
Three agents ship with Playwright: the **planner** "explores the app and produces
a Markdown test plan", the **generator** "transforms the Markdown plan into the
Playwright Test files", and the **healer** "executes the test suite and
automatically repairs failing tests". The healer's documented output is "a passing
test, or a skipped test if the healer believes that functionality is broken."

That last behaviour matters. An agent deciding a test should be skipped is making
a judgement a person should make.

**Other vendor capabilities.** GitHub Copilot has a `/tests` command, its coding
agent runs tests in its own environment, and Atlassian's Rovo Dev can check a
change against Jira acceptance criteria.
*Not verified by me.* These come from vendor documentation reported in my
research rather than pages I opened. They are product facts rather than
performance claims, but confirm before citing a specific feature.

---

## How to prepare the AI?

**The one thing that matters most.** Give the AI the acceptance criteria, not the
implementation. This follows directly from the finding below and is the single
most important preparation step at this phase.

**Custom instruction files.** Copilot reads instruction files committed to the
repository, and supports path-scoped files so testing rules apply only to test
directories.

**Agent Skills.** Anthropic's skills are folders containing a `SKILL.md` that
Claude loads when relevant. Claude Code keeps them in `.claude/skills/`.

**What I could not find.** Any official Anthropic testing skill.

---

## What to ask the AI?

> "List the testable behaviours in these acceptance criteria, then write tests for
> each. Do not read the implementation first."

> "Every test must assert a specific expected value, state change or error. Do not
> use not-null, truthy, or no-exception-thrown as the only assertion."

> "Run mutation testing on the changed files and report any surviving mutants."

> "Produce a table mapping each acceptance criterion to the tests covering it."

**What not to ask.** Do not ask the AI to judge whether its own oracles are
correct. See below.

---

## What to check before accepting the output?

This is the core of the research.

**AI writes tests describing what the code does, not what it should do.**

Konstantinou, Degiovanni and Papadakis (University of Luxembourg, arXiv
2410.21136, 2024) studied developer-written and automatically generated tests
across 24 open-source Java repositories. Their verified findings:

- Traditional generators such as Randoop and EvoSuite have a known limitation:
  they produce oracles capturing actual program behaviour rather than expected
  behaviour.
- LLM-based test generation is "also prone on generating oracles that capture the
  actual program behaviour rather than the expected one."
- LLMs "are better at generating test oracles rather than classifying the correct
  ones."
- They generate better oracles when code contains meaningful names.

A test oracle is the expected answer a test checks against.

**The consequence.** If the AI writes tests from the code, the tests record
whatever the code currently does, bugs included. A green suite then proves only
that behaviour has not changed.

**The counterpoint, which belongs in the module.** The same paper finds
LLM-generated oracles have *higher fault detection potential* than EvoSuite's. So
AI test generation is not worse than the automated alternative. It is better. The
problem is that neither replaces a person deciding what the right answer is.

**Weak and missing assertions are documented.**

Siddiq et al. (EASE 2024, arXiv 2305.00418) studied Codex, GPT-3.5-Turbo and
StarCoder across 160 Java classes from HumanEval plus the SF110 benchmark.
Verified findings:

- No model exceeded 2% coverage on SF110.
- Generated tests heavily suffer from Assertion Roulette and Magic Number Test.
- LLMs produced Empty Tests, Redundant Print, Redundant Assertion and Constructor
  Initialization smells. EvoSuite produced none of these smell types.

That last point is the useful one. A traditional generator produced zero empty
tests. The LLMs did not.

**Correction to an earlier draft.** I previously wrote that the comparison was
against manually written tests. It was against EvoSuite. I also cited specific
percentages for Assertion Roulette and Empty Tests which I could not verify in the
paper text. Both removed.

**This matches our own walkthrough.** Two of six generated tests only checked that
a function returned something. Consistent with the documented smell patterns.

**Mutation testing is the objective check.** Mutation testing plants small
deliberate faults and sees whether any test fails. A test that only checks
"something was returned" lets almost every fault survive, which makes mutation
testing a direct detector for this failure.

*Flagged as reasoning, not a cited finding.* The argument follows from how
mutation testing works. I have not cited a study measuring it specifically for
AI-generated tests.

**Coverage becomes a poor signal.** Coverage counts lines executed, not behaviour
verified. Assertion-weak tests execute code without checking results, so coverage
can rise while fault detection does not.

*Also flagged as reasoning.* Well supported but I found no study quantifying the
effect.

---

## How is authorship/attribution handled?

Better than at Planning, because code has commits.

GitHub's coding agent authors commits with the human who started the task as
co-author. Claude Code adds a co-author trailer by default, configurable through
its attribution setting.

**Two gaps.** Neither tool marks *individual tests* as AI-generated. And because
attribution can be switched off, a missing trailer does not prove no AI was used.

---

## How will Testing and QA differ depending on your experience?

No source addresses this for the testing phase specifically. What follows is
reasoning.

**Junior developers** are most exposed, because this failure is invisible. A test
asserting nothing still passes and still raises coverage. Noticing that a test
would pass whether the code worked or not requires knowing what the code should
do.

**Senior developers** catch weak assertions faster but face volume. Thirty
generated tests is slow to review properly.

**Reviewer fatigue is unevidenced for this case.** I found no study measuring it
for AI-generated tests. Worth testing in our own Sprint 2 run.

---

## What does this phase not cover?

- Writing the acceptance criteria. Planning and Spec Authoring.
- Writing the implementation. Implementation.
- Security scanning. The Security gate, immediately after.
- Deciding whether to release. The Release Approved gate.
- Production monitoring. Maintenance and Operations.

---

## What is still unknown and open questions?

1. **No independent measurement of defect escape rate** for AI-generated tests.
2. **Coverage inflation is argued, not measured.**
3. **Reviewer fatigue is unevidenced** for this case.
4. **ISO/IEC/IEEE 29119 is paywalled**, as 29148 was for the Planning module.
5. **Whether a committed skill changes behaviour.** Same open question as Planning.
6. **Does NBN have testing evidence obligations?** The Australian ISM covers
   software security testing, but whether it binds NBN is unclear. **Needs client
   confirmation.** I could not open the ISM text directly, so I have removed the
   quotes I previously had.
7. **Cost is unmeasured for this phase.** Our Planning module measured $1.86 and
   $12.80 across two runs. The equivalent here is unknown until we run it.

---

## Key points to remember

1. **AI writes tests from the code unless you stop it.** The fix is to give it the
   acceptance criteria instead.
2. **AI is worse at judging oracles than writing them.** So a second AI review is
   not a substitute for a person.
3. **AI test generation beats the traditional automated alternative.** It is not
   worse than EvoSuite, it is better. It just is not a replacement for a human.
4. **Mutation testing is the proof that a test catches anything.**
5. **Most impressive numbers in this space are vendor self-reports.** The module
   should say so.

---

## References

**1. Konstantinou, Degiovanni and Papadakis. Do LLMs generate test oracles that
capture the actual or the expected program behaviour?**
https://arxiv.org/pdf/2410.21136
*Academic, University of Luxembourg, 2024.* The central source. Abstract verified
directly. Source for the actual-versus-expected finding, the point that LLMs are
better at generating oracles than classifying them, and the counterpoint on fault
detection potential.
*Note:* I verified the abstract, not the full paper. Specific figures from the
body are not cited here.

**2. Siddiq et al. Using Large Language Models to Generate JUnit Tests: An
Empirical Study**
https://arxiv.org/pdf/2305.00418
*Academic, EASE 2024.* Source for the SF110 coverage figure, the test smell
patterns, and the point that EvoSuite produced no Empty Tests while the LLMs did.
*Note:* specific smell percentages removed as unverified.

**3. Ham Vocke. The Practical Test Pyramid**
https://martinfowler.com/articles/practical-test-pyramid.html
*Practitioner reference.* Source for the pyramid rules and for testing observable
behaviour rather than implementation.

**4. ISO/IEC/IEEE 29119 series**
*Standards body.* Used for the structure of the testing phase.
*Access note:* paywalled. Preview and secondary summaries only. I have not
included a direct link because I could not confirm which part number corresponds
to the current edition of each part.

**5. Playwright Test Agents documentation**
https://playwright.dev/docs/test-agents
*Vendor documentation, verified.* Source for the planner, generator and healer
behaviour, including the healer's option to skip a test it believes is broken.

**Removed from an earlier draft.** Meta's TestGen-LLM and ACH figures, the
Australian ISM quotes, specific Siddiq percentages, and the Konstantinou accuracy
figure. All were either vendor self-reports or claims I could not verify against
the source text.