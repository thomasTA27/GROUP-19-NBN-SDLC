# Testing and QA: proposed module amendments from Part B

**Proposal for review. The module has not been changed.** These recommendations translate one Task CRUD pilot into guidance for a general white paper. Detailed commands and troubleshooting remain in the run records, rather than becoming instructions for every project.

## Overall recommendation

**Pass with changes, proposed.** Retain the four steps: run the suite, measure fault detection, classify findings, and make a human decision. Both pilots use the same application domain and stack. They support this workflow in that context, not its suitability for every audience or project.

Prioritise the five clarifications below. Do not turn every local difficulty into a mandatory process step.

## 1. Define measurement scope and execution limits

**Pilot evidence:** selecting shared dependencies required judgement, and the mutation runner selected fewer tests and skipped two incompatible timezone tests. See [run context](run-context.md) and [mutation report](mutation-report.md).

**Proposed wording:**

> State the code and behaviour being assessed, the tests used, and significant exclusions. Confirm that the measurement environment preserves the behaviour those tests intend to exercise. Record selected, skipped and executed tests where available. Explain how execution differences limit conclusions and which separate checks are needed. Do not weaken or silently exclude tests to obtain a score.

This does not recommend skipping incompatible tests. A compatible runner, isolated check, another technique or an explicitly incomplete assessment may be appropriate. Range syntax and type-only file exclusions belong in tool-specific guidance.

## 2. Protect the measured baseline during setup

**Pilot evidence:** tooling installation was followed by a typecheck failure and a dependency repair. No pre-install typecheck was recorded, so installation causation is probable rather than proved. Existing source and tests stayed unchanged. See [setup log](setup-log.md), sections 7 and 12.

**Proposed wording:**

> Record the source revision, relevant project checks and tool configuration before measurement. After setup, confirm that those checks still pass and that measured source and tests have not changed. Record tooling changes separately. Consider isolation where setup would disturb the application. Return source or test fixes to Implementation and measure the new baseline separately.

Do not mandate disabling installation scripts, a particular package manager or a dependency workaround. Those decisions depend on the project and tool.

## 3. Classify by behavioural significance, with uncertainty visible

**Pilot evidence:** uncovered helpers exposed gaps, one survivor was a runner artefact, and presentation changes affected keyboard-focus styling. See [classified findings](classified-survivors.md).

**Proposed wording:**

> Keep the tool's status separate from the reviewer's interpretation. Explain each undetected fault's behavioural effect, affected requirement or risk, and classification basis. Uncovered code is not automatically a tool artefact. Equivalence requires reasoning about valid inputs and reachable behaviour; sampled passing tests alone do not prove it. Presentation changes may affect accessibility or usability. Leave uncertain findings unresolved and identify the next check.

The existing categories can remain. Styling describes the change, not permission to ignore it. Multiple mutants may reveal one underlying weakness; mutant counts are not counts of distinct application defects.

## 4. Verify consequential findings and the checks themselves

**Pilot evidence:** ordinary-suite replay confirmed important collection-access gaps and rejected a fault the runner labelled Survived. Review also found a diagnostic-harness error, requiring corrected reruns. See [diagnostics and script history](diagnostics/README.md).

**Proposed wording:**

> Review findings against acceptance criteria and verify high-impact, disputed or suspicious results. Choose verification effort according to consequence and uncertainty, and state what was checked. Validate diagnostic automation on unchanged code and a known detectable fault. Missing output, execution failure and timeout must not be interpreted as a passing result. Retain enough evidence to reproduce material conclusions.

Replaying every mutant and writing a separate diagnostic suite were pilot techniques, not universal requirements. Detailed instructions remain in the worked example.

## 5. Record a reasoned decision under project governance

**Pilot evidence:** a decision draft could be produced, but human confirmation remained pending and the implementation PR was already merged. This is a project-governance limitation, not proof that step 4 is impossible. See [decision draft](decision.md).

**Proposed wording:**

> Record who reviewed the findings, what must be fixed, what is accepted and why, and what remains unresolved. Keep the decision in the team's review record with links to measurement evidence. Apply the project's approval responsibilities. A mutation score informs the decision; it does not establish acceptance-criteria compliance, security or release readiness by itself.

Do not prescribe one hosting platform or record format. This retrospective pilot does not establish that the intended open-PR gate should be relaxed.

## Supporting observations, not mandatory amendments

- **Scenario diversity:** initial, idle, boundary and failure states are useful examples of the module's existing warning about easy scenarios. They are not a fixed inventory for every feature.
- **Metrics:** where useful, record elapsed work, tool runtime and reported AI usage separately. Capture available usage before session information is lost and mark unavailable figures as unavailable. Part B cost was not captured; a reopened session showing $0 does not establish the earlier cost. Avoid vendor-specific commands in general guidance.
- **Other QA techniques:** distinguish what mutation testing cannot establish from what belongs to another stage. Browser accessibility, deployed behaviour and integration testing may remain QA responsibilities; do not assign all of them to the Security gate.
- **Scores:** retain scores as contextual pilot observations. Different implementations, scopes and execution settings prevent direct comparison. The module already warns against a universal threshold.

## Unsupported conclusions

This pilot did not test whether coverage is inherently a poor metric, whether AI tends to weaken tests, which score is universally sufficient, or whether exhaustive replay is necessary. It exposed faults existing tests would miss, not demonstrated defects in the original application.

Preserve Part A's historical record, distinguish the module versions followed, and avoid carrying untested claims into a general white paper as established conclusions.
