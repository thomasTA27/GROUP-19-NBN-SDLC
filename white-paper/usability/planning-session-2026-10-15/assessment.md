# Planning usability session: submitted specification assessment

**Assessment date:** 2026-10-17  
**Prepared by:** Sajad Ali Akbari  
**Review status:** Evidence assessment prepared for human review; not a Gate 1 approval.  
**Artifact:** [Unchanged participant submission](notes-delete-spec.md), dated 2026-10-15  
**Rubric:** [Plan Approved gate: six criteria](../../modules/plan-approved.md#what-gets-checked)

## Submission and provenance

The participant submitted the specification through the
[tester repository](https://github.com/vepvep07/nbn-usability-planning-spec),
a fork of [the session repository](https://github.com/Sajad-Ali-Dev/nbn-usability-planning-spec).
The source is commit
[`95af1f606b74d33aa1d6bcdb83bfc4e0fb1eda43`](https://github.com/vepvep07/nbn-usability-planning-spec/commit/95af1f606b74d33aa1d6bcdb83bfc4e0fb1eda43),
which adds only `notes-delete-spec.md` (209 lines). The commit records Claude
Sonnet 5.5 as a co-author; this does not establish the effort setting or usage.

The adjacent copy preserves the original file bytes. Its Git blob SHA-1 is
`a46eaa20112a387e1666cef1b912557f0b8b6b4a`, matching the GitHub content object.
Relative project-file references inside it refer to the tester's checkout,
not this evidence folder. Keep this copy unchanged; save any revised spec as a
separate artifact.

## Assessment against the six criteria

Ratings describe the submitted artifact, not the participant's ability. Section
and criterion references below refer to the unchanged specification. A partly
met criterion does not pass the gate: all six must be met.

| Gate criterion | Rating | Evidence and reasoning | Work needed to meet it |
| --- | --- | --- | --- |
| 1. Every criterion is testable | **Partly met** | Many criteria specify observable outcomes, such as ownership checks and the empty state. However, criterion 24 says the UI works on mobile without defining the target or observable checks; 9c-i leaves the undo surface unsettled; 9b leaves the restored data representation unresolved. Section 6 itself lists ambiguous and incomplete criteria. Its claim that no remaining criterion fails verifiability is not sufficient evidence that every criterion is testable. | Resolve the open behaviours and define observable checks for vague requirements. Separate behaviour, project constraints and definition of done as section 6 proposes, without discarding binding rules. |
| 2. No unresolved clarification markers | **Not met** | Section 2 explicitly retains `[NEEDS CLARIFICATION: how should the deleted-notes view read its data?]`. Sections 2 and 5 also leave query behaviour and the undo action unverified. Section 7 records answers to Q9, Q9c and Q10 but does not name who answered them. | Record the responsible person's decision on the deleted-notes read approach and the answerer for each resolved question. Settle the identified feasibility checks with evidence; do not remove markers merely to reach zero. |
| 3. Assumptions are visible and numbered | **Partly met** | Section 4 provides A1–A12 with source labels and a dependency column, and explicitly preserves four assumptions with no remaining criteria. Some dependencies are incomplete: criterion 9c-i says its duration is A12, but A12's Used by cell lists only 9d and 23; A10's restore timestamp decision is acknowledged as missing from the criteria in section 6. | Reconcile assumptions, source labels and references in both directions. Distinguish decisions awaiting confirmation from accepted decisions, and retain or remove assumptions with no criteria deliberately. |
| 4. Nothing was invented | **Partly met** | Ticket, rule, precedent and decision sources are largely visible, and section 9 openly lists additions nobody requested. Disclosure is useful, but does not establish acceptance: section 5 says A3's no-confirmation choice depends on an unresolved undo design, and section 6 admits overstated sources for criteria 5, 9a, 9b and 10. Section 7's answers also lack named decision owners. The document remains explicitly unapproved. | Have the appropriate owner confirm or cut each proposed addition, correct overstated sources and record who made the decisions. Retain necessary project rules even where their original criterion was cut. |
| 5. Out of scope is stated | **Met** | The opening scope restricts this artifact to planning and specification. A4, A5, A9 and A11 and sections 8–9 explicitly record single-note scope, no purge job, no restore expiry and the decision to leave the tutorial unchanged. Section 8 distinguishes cut criteria from project rules that still bind. These are explicit exclusions, although their suitability still needs owner review under criterion 4. | Consolidating the exclusions into one out-of-scope list would make them easier to find. This rating does not approve the exclusions. |
| 6. The spec matches the project's conventions | **Partly met** | Section 10 records extensive context reading, and the criteria name project rules. However, sections 2 and 5 identify unresolved conflicts involving deleted-note reads, the undo surface and the documented `deletedAt` type. Section 6 acknowledges that some cut criteria still represent binding project rules. This review did not independently audit every referenced file in the tester's checkout, so convention compliance is not fully verified. | Resolve each flagged conflict against the session's exact project baseline, preserve binding constraints and record the decisions and supporting checks. |

**Result: 1 met, 4 partly met, 1 not met. Gate not passed.** This is a rubric
assessment of the original submission, not a task-completion percentage or a
named approver's sign-off. The submitted status, "Draft for Gate 1 review. Not
approved", is consistent with this result. Return the spec for revision before
using it as an approved implementation input; preserve the original as evidence.

## Environment and submission deviation

**Source of this account:** Sajad Ali Akbari's explanation in this chat, recorded
on 2026-10-17. It has not been independently verified against a recording or log.

The team initially used a VM environment. Environment changes and latency issues
prevented the tester from committing directly to the team's repository. The team
decided to stop using the VM for the test and asked the tester to clone the
session repository onto his own machine, perform the test locally and commit
the result. The resulting submission is the fork commit linked above.

This changes the execution environment and submission route; it does not by
itself show that the ticket or module version changed. The exact local baseline,
OS, tool versions, dependency state, timing of the switch and time lost have not
yet been established. Do not assume that the tester's machine reproduced the
VM exactly. The spec itself reports that `node_modules` was not installed and
some library behaviour was unverified.

For the session report:

- Record setup, migration and latency time separately from task time where
  timestamps support that separation. If they do not, mark the breakdown
  unavailable rather than estimating a subtraction. Keep the existing
  approximately 60-minute task-time report qualified until this is checked.
- Attribute observed interruptions to the module, tooling or an unknown cause
  only where the notes or recording support it. The environment change does not
  invalidate observed wording problems, but it limits causal claims about time.
- Record the actual local baseline commit and material environment differences
  if recoverable. The submission commit alone does not prove environment parity.

## Interpretation limits and remaining evidence

The later [combined analysis](analysis.md) adds William's observation notes and
usage-window records, reconciles available measurements and distinguishes
remaining missing data. Those observations support module-prompt use but do not
establish complete adherence or session-specific token cost.

Section 10 says the two linked white-paper module pages were not read. This
could describe only the AI's file-reading activity; it does not establish whether
the participant separately read the module. Check facilitator notes or the
recording before claiming either full adherence or non-adherence. A finished
artifact alone cannot establish step order, assistance received or time per step.

The [session findings](../planning-and-spec-authoring-session-findings.md) report
an adapted SUS score of 5/100. That questionnaire result is separate from this
gate assessment and is not a percentage or a general usability verdict.

Still needed:

- Human review of these six ratings and a named, dated gate decision if the
  revised specification is proposed for approval.
- Before/after confidence ratings and the explanation for any change.
- Usage metrics, if recoverable; otherwise report unavailable.
- Confirmation of module use, environment details and task-time boundaries from
  session records. Do not reconstruct missing measurements from the spec.
