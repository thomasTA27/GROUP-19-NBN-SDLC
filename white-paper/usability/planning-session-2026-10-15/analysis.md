# Usability results analysis: Planning and Spec Authoring

**Date:** 2026-10-17  
**Prepared for:** Sajad Ali Akbari's "[Analysis] Calculate the usability results for each module" Planner ticket  
**Prepared by:** Sajad Ali Akbari  
**Status:** Planning analysis prepared for teammate review. Implementation results and required review are outstanding; keep the ticket open.

## Result

One Planning session produced a draft specification that does not meet all six
Plan Approved criteria. The artifact assessment rates **1 met, 4 partly met and
1 not met**. The participant's adapted SUS score is **5/100**. Observation notes
record difficulties at Steps 3–7, including explicit facilitator help at Steps 4
and 6. These sources support revising the instructions before further use.
They do not establish general usability, an AI-versus-human productivity effect,
or the effectiveness of revisions that have not yet been tested.

## Evidence and reconciliation

| Source | Contribution | Treatment |
| --- | --- | --- |
| [Ujjawal's session findings](../planning-and-spec-authoring-session-findings.md) | Five findings, questionnaire responses and approximate task time | Canonical repository file, originally merged through PR #61 at `f340beb15213967e86a73c01f6095ee327013be9`; later evidence additions link this analysis and the spec assessment. No duplicate findings file is retained here. |
| [William's cleaned compilation](../planning-spec-authoring-compiled-cleaned.md), [observations](../../observations/planning-and-spec-authoring-observations.md) and [CSV data](../csv/planning-and-spec-authoring/) | Observation detail, ten findings, data-quality log and five CSV tables | Canonical repository files from `eea96695a27d4e10e233121c87c1a1a9f9a5cc1f`. Sajad reviewed and merged PR #60 on 2026-10-17, merge commit `6807371ccf7b7cb578a5f3318928b0fa06249751`. No duplicate William source files are retained here. |
| [Tester specification](notes-delete-spec.md) | Original task output | Unchanged submission at `95af1f606b74d33aa1d6bcdb83bfc4e0fb1eda43`. |
| [Six-criterion assessment](assessment.md) | Explicit rubric ratings and VM-to-local deviation | Prepared assessment awaiting human review; no named gate approval. |
| [Scoring guide](../module-usability-scoring.md) | Questionnaire calculation and reporting limits | Used to independently check William's stored contributions. |

These are multiple records of **one session**, not independent participants or
replications. William's compilation identifies the participant as **Bao Nguyen
Le (P1)** and the facilitator as **Sajad**, with **William and Ujjawal taking
notes**. Ujjawal's original report says Mark Nguyen and lists Ujjawal as
facilitator. This analysis uses William's explicit corrections provisionally;
a teammate should confirm them against the session record if the earlier report
is corrected. William's merged data supplies the working session identity and
roles; review of his PR does not constitute review of this later analysis or
the six-criterion assessment. Both contributors' findings are referenced directly
from their repository files.

William's compilation qualifies the original report's claim that prompts
"worked": Steps 5–7 include uncertainty, assistance and skimming. A prompt
running is not evidence that its instruction was followed successfully.
His original and cleaned notes also differ in some purported direct-quote
wording. This analysis paraphrases observations and does not certify verbatim
quotes; verify against the recording before publishing quotations.

## Results and calculations

| Measure | Planning result | Method and limitation | Implementation result |
| --- | --- | --- | --- |
| Submitted artifact | One draft specification preserved | Existence is not successful task completion. | Unavailable: no completed session evidence supplied. |
| Task success | **0 of 1 assessed submissions meets all six criteria**, provisional | Count a success only when all six ratings are Met. This is a descriptive result for one session, pending human review, not a population estimate or a formal gate decision. | Unavailable; do not combine with Planning's denominator. |
| Gate ratings | 1 Met, 4 Partly met, 1 Not met | Count the six rows in the linked assessment. Do not convert partial ratings into a weighted score or confuse 1/6 criteria with participant completion rate. | Not applicable to this Planning rubric; assess Implementation using its own test-plan success checklist when evidence arrives. |
| Recorded elapsed window | **58 minutes** | 16:39 − 15:41 = 58 minutes, from William's session record. This agrees with approximately 60 minutes in Ujjawal's report. Setup, task, debrief and migration boundaries are unverified; this is not established net task time. | Unavailable. |
| Time per step | **Unavailable for all 8 steps** | `steps.csv`: Steps 1–8 each say Not recorded. No mean per-step time, step comparison or delay attribution is calculable. | Unavailable. |
| Steps with recorded difficulty | **5 steps: 3, 4, 5, 6, 7** | Count distinct numbered steps with Blocked, Struggled or Needed help. This counts affected steps, not error events. | Unavailable. |
| Explicit help during numbered steps | **At least 2 steps: 4 and 6** | Count `facilitator_help = Y` for Steps 1–8. Wrap-up help is recorded separately and excluded. Step 3 says unable to proceed independently but help is not explicitly recorded. | Unavailable. |
| Complete error-event count | **Unavailable** | Sources are step summaries, not an exhaustive event log in the test plan's error categories. Repeated quotes, help and misread instructions may describe the same event. | Unavailable. |
| Adapted SUS | **5/100** | Ten valid integer responses; sum contributions = 2; 2 × 2.5 = 5. See calculation below. | Unavailable; do not compare modules yet. |
| Before/after confidence | **Unavailable** | Neither rating is present in these records. SUS item 9 is not a substitute. | Unavailable. |
| Session-specific tokens or monetary cost | **Unavailable** | Usage-window observations exist but cannot isolate this task. No currency conversion or token estimate is justified. | Unavailable. |

### Adapted SUS arithmetic

Source: [sus.csv](../csv/planning-and-spec-authoring/sus.csv). For odd item numbers contribution is
response − 1; for even numbers it is 5 − response. Each contribution must be
0–4. The responses reproduced by William agree with Ujjawal's report.

| Item | Response | Calculation | Contribution |
| --- | --- | --- | --- |
| 1 | 1 | 1 − 1 | 0 |
| 2 | 5 | 5 − 5 | 0 |
| 3 | 2 | 2 − 1 | 1 |
| 4 | 5 | 5 − 5 | 0 |
| 5 | 1 | 1 − 1 | 0 |
| 6 | 4 | 5 − 4 | 1 |
| 7 | 1 | 1 − 1 | 0 |
| 8 | 5 | 5 − 5 | 0 |
| 9 | 1 | 1 − 1 | 0 |
| 10 | 5 | 5 − 5 | 0 |
| Total | | 0 + 0 + 1 + 0 + 0 + 1 + 0 + 0 + 0 + 0 | **2** |

**2 × 2.5 = 5/100.** This is a module-adapted SUS internal baseline, not a
percentage, a pass threshold or a comparison against published software norms.
The arithmetic is verified from transcribed responses; an original response-form
export has not been checked. Do not infer that the response pattern proves
careful responding or excludes misunderstanding; Ujjawal's stronger claim is not
established by these ten values alone.

### Step-level observations

Source: [steps.csv](../csv/planning-and-spec-authoring/steps.csv) and William's compilation.

| Step | Recorded category | Interpretation |
| --- | --- | --- |
| 1 | None | No issue recorded for the step; this is not independent proof of correctness. |
| 2 | None | No issue recorded for the step. |
| 3 | Blocked | Checks lacked an actionable method; participant could not proceed independently. |
| 4 | Blocked; help recorded | Unfilled placeholder and confusion between marker and criterion numbers; arbitrary numbers were entered after clarification. |
| 5 | Struggled | Uncertainty and changing AI output; the model being the cause is an observer hypothesis, not established. |
| 6 | Needed help | `[answers]` was pasted without replacement and clarification was requested. |
| 7 | Struggled | Large output was skimmed; the participant changed the prompt to cut criteria. This does not alone establish how many requirements were lost or why. |
| 8 | Not recorded | A gate-navigation question and an AI artifact-list problem were recorded. The category is missing, not a verified error-free step. |

Category check: 2 None + 2 Blocked + 2 Struggled + 1 Needed help + 1 Not
recorded = 8 numbered steps. Setup and Wrap-up make the CSV's total 10 rows.
At least two placeholder-misread episodes are explicitly described (Steps 4 and
6), and Step 4 also includes a marker/criterion misunderstanding. These overlap
with help and blocking categories, so they must not be summed into a supposedly
complete error total. Tables provide the useful comparison here; charts of
missing timings or one participant would add little information.

## Findings linked to the submitted artifact

William's [findings.csv](../csv/planning-and-spec-authoring/findings.csv) contains **10 distinct
finding IDs**: 3 labelled Blocks the task (F2–F4), 2 labelled Costs time or
weakens the spec (F1, F5), and 5 without an assigned priority (F6–F10). This is a
count of finding themes, not ten error events. F4 combines related placeholders
at different steps; several findings share an underlying wording problem.

| Finding IDs | Combined evidence | Implication for later module revision |
| --- | --- | --- |
| F2 | Step 3 checks blocked independent progress; the submitted spec still acknowledges ambiguity, incompleteness and overstated sources. | Give a concrete check method and an example. The artifact is consistent with incomplete checking, but does not prove missing instructions caused every defect. |
| F3–F4, F10 | Marker/criterion confusion and unfilled `[list]` / `[answers]`; facilitator help at Steps 4 and 6. | Explain each placeholder, distinguish markers from criteria and separate getting human decisions from sending them to the AI. |
| F5, F8 | Evidence statistics distracted the reader; long Step 7 output was skimmed. The final spec retains unresolved quality issues and lists binding rules among cut criteria. | Move statistics out of instructions; make review manageable and explain what may be cut without losing project constraints. |
| F7, F9 | Saving needed a facilitator prompt; the AI said it could not find the artifact list. The original spec has now been recovered. | Add explicit save/handoff instructions and provide the artifact list to the agent. Recovery fixes evidence availability, not the observed instruction gap. |
| F6 | Observations flag mixing what to build with how to build it; the spec identifies implementation-detail issues. | Clarify the boundary between requirements, project constraints and design decisions. Some project constraints are necessary and must not simply be deleted. |
| F1 | Model-selection question; model and effort were not controlled. | Record run settings; these records cannot establish that a different model would resolve the usability issues or explain historical cost differences. |

These are revision recommendations for the separate Module ticket. No tested
module has been revised as part of this analysis, and no post-change improvement
has been measured.

## Environment, adherence and usage limitations

The [environment record](assessment.md#environment-and-submission-deviation)
documents Sajad's account of moving from the VM to the tester's own local clone
because of environment changes and latency, followed by submission through a
fork. No measured migration time is available. Do not subtract a guessed amount
from the 58-minute window or attribute the full duration to module complexity.

William's step observations provide evidence that prompts corresponding to the
module were used. The spec's statement that the two module pages were not read
may refer to the AI's file reading. It does not establish participant
non-adherence. The exact document exposure, deviations and assistance still
require session-record review.

The cleaned session record includes 28% of a five-hour usage allowance, 5% of a
weekly allowance, 32 requests in the last 24 hours and 43% usage above 150k
context. The compilation also records a conflicting 36% display for the last
measure. These observations cover different windows and may include pre-test
activity. They are **not** task cost, task token count, AI runtime or 28% of five
hours of active work. Do not calculate any of those from these figures.

## Analysis ticket checklist and remaining work

| Planner completion criterion | Current status | What remains |
| --- | --- | --- |
| Completion rate, time per step, error count and SUS score calculated for each module | **Partly complete** | Planning's provisional success count and SUS calculated; elapsed window and affected-step counts reported. Exact step times and total error events unavailable. Implementation results missing. |
| Calculations checkable, with formulas or method shown | **Complete for available Planning measures** | Arithmetic and counting rules are shown above. Recalculate if the underlying evidence is corrected. |
| Results shown in tables, with charts where helpful | **Complete for available Planning evidence** | Tables cover all requested measures, including missing inputs. No useful multi-session chart is possible yet. |
| Teammate reviewed the results | **Pending** | A teammate must review sources, reconciliation, counts and gate ratings, then record their name, date and outcome. |

| Missing item / decision | Why it matters | Proposed follow-up |
| --- | --- | --- |
| Completed Implementation session artifact, observation log and questionnaire | Cannot finish analysis for each module or compare them. | William/Ujjawal to supply evidence, or confirm the session has not run. |
| Planning per-step timestamps | Cannot calculate eight step durations. | Check recording timestamps; if not recoverable, accept and report Not recorded. Do not distribute 58 minutes across steps. |
| Complete event log in the test-plan categories | Cannot calculate an exact error-event total. | Review recording with event timestamps and deduplicate; otherwise retain the affected-step counts and missing-total limitation. |
| Before/after confidence responses | Cannot calculate change in confidence. | Recover from facilitator records if captured; otherwise report unavailable. |
| Original questionnaire export and quote verification | Arithmetic uses transcribed responses; cleaned and original quote wording differs. | Ujjawal/William to check against response form and recording. |
| Participant name and actual session roles confirmed | Main report and cleaned data disagree. | Confirm Bao / Sajad / note-takers and update the live report after review. |
| Task-only timing and VM/local baseline details | Cannot isolate setup latency or establish environment parity. | Confirm boundaries, baseline and material differences where recoverable. |
| Human review of gate scoring and analysis | Required teammate review remains absent. | Record reviewer, date, corrections and verdict. A formal gate sign-off is separate and required only before treating a revised spec as approved. |
| Session-specific usage and conflicting context figures resolved | Existing window percentages cannot establish cost. | Recover original usage evidence where possible; otherwise leave tokens/cost unavailable. This does not prevent reporting the other measures. |

Missing observations cannot be repaired by inventing numbers or asking a
participant to retrospectively supply an unrecorded pre-task rating. Review can
accept unrecoverable data as an explicit limitation. The ticket still needs a
teammate review and an agreed disposition of the Implementation analysis before
it can be marked complete.

**Teammate review:** Pending.  
**Reviewer / date / outcome:** Not yet recorded.

## Suggested Planner progress note

Prepared for Sajad to post after review; no Planner update has been sent:

> Done: Combined William's cleaned Planning data, Ujjawal's findings and the
> original spec assessment. Checked SUS (5/100), the 58-minute recorded window,
> step-difficulty/help counts and the provisional gate-based success result.
> Deliverable: Link this analysis file once it is published to the repository.
> Note for next role: Keep open. Teammate review and Implementation evidence are
> outstanding. Planning step timings, full error-event totals, confidence and
> session-specific cost remain unavailable; the missing-data table explains the
> required follow-up. No claim of general effectiveness or post-revision
> improvement is made.
