# Planning module revisions after usability testing

**Prepared by:** Sajad Ali Akbari  
**Date:** 2026-10-17  
**Module:** [Planning and Spec Authoring](../modules/planning-and-spec-authoring.md)  
**Status:** Revisions prepared for review; no post-revision participant test has run.

## Sources and scope

Finding IDs are William's IDs from
[findings.csv](csv/planning-and-spec-authoring/findings.csv), merged through
[PR #60](https://github.com/thomasTA27/GROUP-19-NBN-SDLC/pull/60). The
[cleaned compilation](planning-spec-authoring-compiled-cleaned.md) combines his
observations with [Ujjawal's findings](planning-and-spec-authoring-session-findings.md).
The [Sprint 2 evidence report](../evidence/planning-and-spec-authoring.md) retains
the historical prompt counts, times, costs, marker counts and specification-growth
figures. Source observations and measurements are unchanged.

The final revision is one self-contained module combining an explanation of
the method with practical Read / Do / Check steps. The separate companion guide
was removed at the author's request. Prompts are explicitly optional examples:
readers can adapt them or write their own while retaining the step's decisions,
checks and outputs. The module contains no sprint history, session statistics,
internal production commentary or claims of measured improvement. Evidence
provenance and evaluation limits belong in this log and the evidence reports.

The eight-step structure and independent Plan Approved gate remain. Neither
Implementation nor the gate document is changed. General roles, source types
and an illustrative report-export example avoid requiring the team's technology
stack or mock feature.

## Changes linked to findings

| Finding | Change | Where to review | Remaining limit |
| --- | --- | --- | --- |
| **F1 — model/effort unspecified** | Tell readers to use an approved tool, ask the team about unclear settings and record exposed model/effort settings and changes. Historical model details stay in evidence rather than becoming a universal recommendation. | [Before you start](../modules/planning-and-spec-authoring.md#before-you-start) | Historical Sprint 2 effort settings remain unavailable. No optimal vendor or setting is established. |
| **F2 — Step 3 lacks a checking method** | Explain how to open the cited source, find support, describe an observable check and flag additions. Include a worked example and an optional correction prompt, with technical help for unfamiliar rules. | [Step 3](../modules/planning-and-spec-authoring.md#step-3-check-each-criterion-against-its-source) | Independent usability of the revised instructions is not yet demonstrated. |
| **F3 — marker count read as a target** | Distinguish questions from criteria, retain the criteria while classifying questions and explain that there is no target count. Remove historical marker figures from the module. | [Step 2](../modules/planning-and-spec-authoring.md#step-2-draft-criteria-and-questions), [Step 4](../modules/planning-and-spec-authoring.md#step-4-sort-the-questions-keeping-the-criteria) | Historical counts remain in evidence; an empty question list still requires checking. |
| **F4 — unexplained placeholders** | Explain optional prompt use and every example's input. Replace ambiguous `[list]` with a reviewed classification record; explain `[answers]` using question IDs, actual decisions, owners and dates. | [Workflow introduction](../modules/planning-and-spec-authoring.md#ai-assisted-workflow), [Step 4](../modules/planning-and-spec-authoring.md#step-4-sort-the-questions-keeping-the-criteria), [Step 6](../modules/planning-and-spec-authoring.md#step-6-obtain-answers-then-give-them-to-the-ai) | Examples illustrate required information; readers may use their own wording. Output markers are distinguished from input placeholders. |
| **F5 — evidence statistics interrupt instructions** | Remove sprint history and historical measurements from reader-facing text. Retain a concise Metrics section describing useful success checks; preserve the detailed figures in the existing evidence report. | [Metrics](../modules/planning-and-spec-authoring.md#metrics-for-success), [evidence report](../evidence/planning-and-spec-authoring.md) | No source measurements are changed and no new performance or cost claim is made. |
| **F6 — what/how boundary unclear** | Separate observable behaviour, binding constraints, process checks and optional implementation choices. Defer only design choices that do not conceal an unresolved outcome or feasibility conflict. | [Step 2](../modules/planning-and-spec-authoring.md#step-2-draft-criteria-and-questions), [Step 4](../modules/planning-and-spec-authoring.md#step-4-sort-the-questions-keeping-the-criteria), [Adapting the workflow](../modules/planning-and-spec-authoring.md#adapting-the-workflow) | Source priority remains unassigned; binding technical rules are retained. |
| **F7 — no saving instructions** | Agree a versioned location, save checked changes and decisions throughout, provide a final save example and manually save if the tool cannot access the destination. Reopen the saved result before handoff. | [Before you start](../modules/planning-and-spec-authoring.md#before-you-start), [Step 6](../modules/planning-and-spec-authoring.md#step-6-obtain-answers-then-give-them-to-the-ai), [Step 8](../modules/planning-and-spec-authoring.md#step-8-save-the-artifacts-and-request-approval) | Source priority remains unassigned; no specific repository or vendor command is required. |
| **F8 — Step 7 output too large to review** | Review human-selected groups, request issues only and pause for review. Changes require confirmation; failure of a quality check does not justify deleting a required behaviour or binding rule. | [Step 7](../modules/planning-and-spec-authoring.md#step-7-review-small-sections-and-resolve-issues) | No fixed batch size is imposed. Manageability needs participant retesting. |
| **F9 — AI cannot locate artifact list** | Keep the artifact list in the module and include it in the optional Step 8 prompt. Require missing-item reporting, saved Draft status and verification outside the chat. | [Artifacts](../modules/planning-and-spec-authoring.md#artifacts-generated), [Step 8](../modules/planning-and-spec-authoring.md#step-8-save-the-artifacts-and-request-approval) | The reader supplies required artifacts when writing their own prompt; the AI need not discover them from an unstated checklist. |
| **F10 — Step 6 mixes no-prompt and prompt actions** | Separate Part A, obtaining named and dated decisions, from Part B, applying those decisions with AI. New blocking questions return to their owner. | [Step 6](../modules/planning-and-spec-authoring.md#step-6-obtain-answers-then-give-them-to-the-ai) | Remedy prepared; no participant retest yet. |

## Reader-facing structure

The opening explains the planning problem and the reasoning behind source
traceability, explicit decision ownership, bounded review and independent
approval. The practical workflow then specifies what readers need to read,
do and save. Optional prompt examples appear at the relevant step rather than
in a separate document. Definitions and instructions remain local to the work
so readers do not need knowledge of the capstone's production process.

Technical rules can come from documents or a work tracker as well as repository
files. Nontechnical readers are directed to a technical reviewer where needed.
The method keeps specialist review obligations visible without claiming that
one small study establishes suitability for all software or audiences.

## Remaining limits and review

### First-reader clarity refinements

A desk walkthrough identified four remaining points of hesitation. The following
refinements retain one module and optional example prompts; they are editorial
responses, not a participant retest or evidence of improved usability.

| Refinement | Change | Related finding IDs / review location |
| --- | --- | --- |
| Question statuses and marker lifecycle | Explain when to retain or replace unresolved markers, preserve resolved question history, confirm/reject assumptions and defer only optional Design choices. Add a final status check before requesting approval. | F3, F4, F6, F9; [Step 4](../modules/planning-and-spec-authoring.md#step-4-sort-the-questions-keeping-the-criteria) and [Step 8](../modules/planning-and-spec-authoring.md#step-8-save-the-artifacts-and-request-approval). |
| Complete worked example | Extend the export example through fictional owner answers, a named/dated decision record, a sourced acceptance criterion and a concrete verification action. State that other behaviour still needs criteria and the example must not supply project decisions. | F2, F4; [Step 3](../modules/planning-and-spec-authoring.md#step-3-check-each-criterion-against-its-source). |
| Corrections versus decisions | Explain that a clearly applicable source can support a factual correction, while conflicting sources, uncertain applicability or overriding an agreed requirement create a blocking question for Step 6. Exclude unresolved conflicts from the correction prompt. | F2, F6, F10; [Step 5](../modules/planning-and-spec-authoring.md#step-5-check-against-the-project-again). |
| Action independent of prompt wording | State Step 7's actual review action, issue-record fields and human checkpoint before explaining the optional placeholder. Readers can perform the review themselves or use their own prompt. | F4, F8; [Step 7](../modules/planning-and-spec-authoring.md#step-7-review-small-sections-and-resolve-issues). |

### Evaluation limits

- F1's missing historical settings cannot be supplied by editing. They remain
  unavailable in the evidence; the module gives a usable selection/recording process.
- F6–F10 had no source priority assigned. This log does not assign severity
  retroactively or alter William's CSV.
- Revisions do not establish that observed problems have disappeared. No timing,
  SUS, cost or effectiveness improvement is claimed. This distinction is retained
  here rather than interrupting the reader-facing instructions.

Editorial checks cover local links and section anchors, eight ordered steps,
optional labelling for prompt examples, F1–F10 coverage, and retention of
source checks, unresolved-question handling, numbered assumptions, scope,
project-rule consistency and independent approval. These do not replace review
or participant evaluation.

- [ ] Teammate review of clarity, project-rule fidelity and finding-linked remedies.
- [ ] Participant walkthrough with a different request using the integrated module.
- [ ] Capture step times, help/errors, task output, gate results and the same adapted questionnaire.
- [ ] Record unaddressed feedback, reasons and any further revisions.

**Reviewer / date / outcome:** Pending.
