# Usability Test Findings: Planning and Spec Authoring

**Module tested:** `white-paper/modules/planning-and-spec-authoring.md`
**Participant:** Bao Nguyen Le (P1)
**Date:** 2026-10-15
**Model:** Claude Sonnet 5.5, low effort

> **Conventions**
> - This is **one session**, combined from two sets of notes:
>   - **Notes**: step-by-step observation notes taken by William during the session
>   - **Report**: the session findings report written by Ujjawal Mittal
> - Facilitator clarifications (Sajad) are recorded as William noted them. Sajad may have clarified other points during the test that weren't captured.
> - Text in quotation marks is a **direct quote** carried over verbatim from the source, including original spelling and punctuation.
> - *Italic notes in brackets* are observer or facilitator annotations, not quotes.
> - [FLAG] marks a flagged entry. Every flag is explained in [Section 7: Data quality log](#7-data-quality-log).
> - **Not recorded** means the sources left the field blank. **None** means a source states there was no issue.

---

## 1. Session

| Field | Details |
| --- | --- |
| **Participant** | Bao Nguyen Le (P1) |
| **Background** | Computer science student, junior developer |
| **Facilitator** | Sajad |
| **Note-takers** | William (notes), Ujjawal Mittal (report) |
| **Date** | 2026-10-15 |
| **Start / end** | 3:41 pm to 4:39 pm |
| **Duration** | 58 min (report: approximately 60 minutes) |
| **Module** | `white-paper/modules/planning-and-spec-authoring.md` |
| **Model** | Claude Sonnet 5.5, low effort |
| **Tool** | Claude Code (subscription plan) |
| **Adapted SUS score** | 5 / 100 |
| **Cost** | 28% of 5-hr session window; 5% of weekly limit [FLAG] |
| **Requests** | 32 requests, 1 session (last 24h) |
| **Usage at >150k context** | 43% (last 24h) [FLAG] |
| **Spec produced** | `notes-delete-spec.md`, committed by Claude at session end (copy not yet attached) [FLAG] |

---

## 2. Step records

One record per step. **Session** is P1 and **Module** is `planning-and-spec-authoring.md` for every record. Cost was only captured for the whole session.

| Session | Module | Step | Time | Errors | Cost |
| --- | --- | --- | --- | --- | --- |
| P1 | planning-and-spec-authoring | Setup | Not recorded [FLAG] | Not recorded | Not recorded |
| P1 | planning-and-spec-authoring | 1 | Not recorded [FLAG] | None (step worked) | Not recorded |
| P1 | planning-and-spec-authoring | 2 | Not recorded [FLAG] | None (step worked) | Not recorded |
| P1 | planning-and-spec-authoring | 3 | Not recorded [FLAG] | **Blocked.** Stuck; could not perform the three checks without help | Not recorded |
| P1 | planning-and-spec-authoring | 4 | Not recorded [FLAG] | **Blocked.** Pasted the prompt without filling `[list]`; read the marker count as a target and began reducing his 29 acceptance criteria; filled `[list]` with arbitrary numbers after facilitator clarification | Not recorded |
| P1 | planning-and-spec-authoring | 5 | Not recorded [FLAG] | Seemed unsure; AI output contradicted itself and backpedalled | Not recorded |
| P1 | planning-and-spec-authoring | 6 | Not recorded [FLAG] | **Needed facilitator.** Pasted the prompt without filling `[answers]` | Not recorded |
| P1 | planning-and-spec-authoring | 7 | Not recorded [FLAG] | Overwhelmed by large output; skimmed | Not recorded |
| P1 | planning-and-spec-authoring | 8 | Not recorded [FLAG] | Not recorded (asked whether to open the gate) | Not recorded |
| P1 | planning-and-spec-authoring | Wrap-up | Not recorded [FLAG] | Not recorded | Session total: 28% of 5-hr window, 5% weekly [FLAG] |

---

## 3. Step details

### Stage: Setup

| What happened | Direct quotes |
| --- | --- |
| Sajad explained how the session would work and what to expect, then guided Bao through the codebase. Bao seemed to understand. | None recorded |

### Step 1

| What happened | Direct quotes |
| --- | --- |
| Pasted the Step 1 prompt and received output; step worked. Used Sonnet 5.5 at low effort *[because that is what was in front of him]*. *[Observer: the project should not work locally because of no initial setup.]* | "What model do I use?"<br>"The ticket deleting the notes right?" *[Needs clarification on task/ticket; can ignore]* |

### Step 2

| What happened | Direct quotes |
| --- | --- |
| Pasted the Step 2 prompt and received output; step worked. | "What is this [Needs Clarification: the question] section in the prompt?" *[Can ignore]* |

### Step 3

**Module text (verbatim):**

> Step 3: read what comes back. No prompt. Check three things: whether it
> invented a requirement nobody asked for; whether every criterion is testable,
> rather than saying the system "handles it as specified"; and whether every
> Ticket source matches the ticket and every Rule source matches the file it
> names. A wrong source is how an invented requirement hides.

| What happened | Direct quotes |
| --- | --- |
| Read through the output from Step 2. Seemed stuck and unsure what to do. Asked how to check the three things and could not proceed on his own. | "What does the rule source mean?" *[Found it after rereading the output]*<br>"Quite unsure on how I can check for these things." *[Re: Rule source]*<br>"What does a rule source mean?" [FLAG] |

### Step 4

**Module text (verbatim):**

> "Reduce the clarification markers to these only: [list]."

> Expect a lot. The evidence runs raised between 22 and 31 markers on small
> tickets, and roughly a fifth survived the filter.

| What happened | Direct quotes |
| --- | --- |
| 1. Pasted the first Step 4 prompt (reduce the markers) without filling in `[list]`<br>2. Pasted the second Step 4 prompt (weakest assumptions)<br>3. *Sajad clarified*<br>4. Pasted the first Step 4 prompt again with 9, 10, 21, 25 *[random numbers]* and read the output<br><br>*[Report: he had produced 29 acceptance criteria, matched them against the module's "22 to 31", and set about reducing the criteria instead of the clarification markers.]* | "I assume the numbers are the markers?" |

### Step 5

| What happened | Direct quotes |
| --- | --- |
| 1. Pasted the first Step 5 prompt (which assumptions the project answers or contradicts) and read the output<br>2. Scrolled back through previous outputs to read the list<br>3. Pasted the second Step 5 prompt (fix every contradiction) and read the output. The AI fixed some contradictions and backpedalled on some statements *[likely due to a mediocre model]*<br>4. Carefully reviewed the AI's output | None recorded |

### Step 6

| What happened | Direct quotes |
| --- | --- |
| 1. Pasted the Step 6 prompt without answers<br>2. Asked for clarification<br>3. Pasted the Step 6 prompt with answers [9 and 10] *[answers are the decisions on unclear ACs]*<br>4. AI returned that 9C needs clarification<br>5. Wrote back his answer for that AC and read the output | "What are [answers] in the prompt?" |

### Step 7

| What happened | Direct quotes |
| --- | --- |
| 1. Pasted the first Step 7 prompt (the quality checklist)<br>2. Typed his own version of the second Step 7 prompt, adding an instruction to cut the criterion that failed "verifiable" (quoted)<br>Seemed overwhelmed by the large output and skimmed through it. | Bao's prompt: "Cut the criterion that fails “verifiable” and list every number ot feature in the spec that nobody asked for" |

### Step 8

| What happened | Direct quotes |
| --- | --- |
| Pasted the Step 8 prompt (list every artifact this stage should produce). | AI: "The project does not define what a requirements stage produces, so this list is my own"<br>Bao: "Do I open plan approved gate now?" |

### Stage: Wrap-up (final steps and metrics)

| What happened | Direct quotes |
| --- | --- |
| 1. Sajad gave Bao a prompt to save<br>2. Ran `/usage` to check credits<br>3. Asked Claude to commit | None recorded |

---

## 4. Findings

Priority scale (from the report): **Blocks the task** · **Costs time or weakens the spec**. Findings that appear only in the notes had no priority assigned and are marked [FLAG].

**Headline (report, verbatim):** "The module explains what each step achieves but not how to do it, and the steps without a prompt are the ones that failed."

| # | Finding | Priority | Source | Proposed change |
| --- | --- | --- | --- | --- |
| F1 | **The module does not say which model to use.** Nothing names a model or effort level. The cost table's $1.86 vs $12.80 comparison can't be interpreted if the runs used different models. | Costs time or weakens the spec | Report, Notes ("What model do I use?") | State which model the evidence runs used, and whether the guidance assumes a particular model or effort level. |
| F2 | **Step 3 cannot be performed as written.** It names three checks and gives no method for any of them. It is also the first step with no prompt, and the change in format is not signalled. | Blocks the task | Report, Notes | Give a prompt for the mechanical parts, or spell out the method: read each Ticket-labelled criterion against the ticket; open each file named in a Rule label and confirm the rule is there; ask whether a tester could write a test from each criterion without asking a question. |
| F3 | **Step 4's marker count was read as a target.** The "22 to 31" figure anchored the reader, and the step does not make clear that it counts clarification markers, not acceptance criteria. | Blocks the task | Report | Move the evidence figures out of the instruction. Say plainly that Step 4 reduces the clarification markers, and that the criteria stay. |
| F4 | **Prompt placeholders are unexplained.** `[list]` (Step 4) is something the reader must construct first, and the module never says what it is. `[answers]` (Step 6) caused the same problem. | Blocks the task | Report (`[list]`), Notes (`[list]`, `[answers]`) | Say what each placeholder holds, e.g. "replace `[list]` with the markers you decided are blocking, by number". Do the same for `[answers]`. |
| F5 | **Evidence-run statistics read as noise.** They report what happened in the team's runs, not what the reader should do, and the Step 4 figure actively misled Bao. | Costs time or weakens the spec | Report, Notes (facilitator conclusion) | Move them to "Metrics for success" or "In practice". Make a pass through the whole "What to ask the AI" section so the steps contain instructions only. |
| F6 | **The AI mixed up *what* and *how*.** *How* should be answered in the design phase. | Not assigned [FLAG] | Notes | Not proposed yet. |
| F7 | **No prompts for saving decisions.** | Not assigned [FLAG] | Notes | Not proposed yet. |
| F8 | **Step 7 output was too large to review.** Bao was overwhelmed and skimmed. | Not assigned [FLAG] | Notes | Not proposed yet. |
| F9 | **The AI couldn't find the stage's artifact list at Step 8.** It said the project doesn't define what a requirements stage produces and made up its own list. The module does define this (the "Artifacts generated" table), but the list isn't in the project files the AI reads, and the Step 8 prompt doesn't supply it. | Not assigned [FLAG] | Notes | Not proposed yet. One option: include the artifact list in the Step 8 prompt, or add it to the project's context files. |
| F10 | **Step 6 says "No prompt" and then gives one.** The module opens Step 6 with "No prompt. The product owner answers…", then supplies a prompt containing `[answers]`. This is the same unsignalled change of format as Step 3, and it's where Bao pasted the prompt without filling `[answers]` and needed clarification. | Not assigned [FLAG] | Notes, module text | Split Step 6 into two clearly labelled parts: getting the answers from a person (no prompt), then giving them to the AI (prompt). Say what goes in `[answers]` (see F4). |

Evidence statistic quoted in the report alongside F5 (verbatim):

> In the second run the spec grew from 168 to 346 lines and 25 to 38 assumptions
> across its later prompts, ending with 20 additions awaiting a decision.

**Suggested scope of fix (report):** give Step 3 a method, explain the Step 4 placeholder, and move the evidence figures out of the instruction steps. The report estimates about an hour of editing, addressing four of its five findings. Adding the `[answers]` explanation (F4) covers the extra issue from the notes.

---

## 5. Participant feedback and facilitator observations

### Participant feedback

| # | Feedback | Annotation |
| --- | --- | --- |
| 1 | "Hard to understand what is going wording wise." | *[Observer assumes it's about the module and not the AI output itself]* |
| 2 | "Instructions are extremely vague." | None |

### Facilitator process notes

| # | Note |
| --- | --- |
| 1 | Bao didn't talk much and only spoke up when unsure. |
| 2 | We may not have probed enough. |

---

## 6. Adapted SUS score

**5 out of 100.** The lowest possible is 0.

| Item | Response | Contribution |
| --- | --- | --- |
| 1 I would like to use this module frequently | 1 | 0 |
| 2 I found the module unnecessarily complex | 5 | 0 |
| 3 I thought the module was easy to use | 2 | 1 |
| 4 I would need the support of a technical person | 5 | 0 |
| 5 The various functions were well integrated | 1 | 0 |
| 6 There was too much inconsistency | 4 | 1 |
| 7 Most people would learn to use this quickly | 1 | 0 |
| 8 I found the module very cumbersome | 5 | 0 |
| 9 I felt very confident using the module | 1 | 0 |
| 10 I needed to learn a lot before getting going | 5 | 0 |
| | **Total** | **2** |

2 × 2.5 = 5.

- **The responses are coherent.** 5 on every negatively worded item and 1 on almost every positive one, with discrimination on items 3 and 6. Random or reversed answering doesn't produce this.
- **The score matches the session.** He could not perform Step 3, could not fill Step 4's placeholder, misread what Step 4 was counting, and needed help at Step 6.
- **How to read it.** Internal baseline only. The wording is adapted from "system" to "module", so it can't be compared with the published software average. The Implementation session will use the same wording.

---

## 7. Data quality log

| # | Entry | Issue | Action taken |
| --- | --- | --- | --- |
| 1 | Participant name | The report names the participant "Mark Nguyen"; the notes name "Bao Nguyen Le". They are the same person. | **Merged** into one session under Bao Nguyen Le (P1). |
| 2 | Facilitator | The report listed Ujjawal Mittal as facilitator. Ujjawal and William were note-takers; Sajad facilitated. | **Corrected.** Sajad listed as facilitator, Ujjawal and William as note-takers. |
| 2a | Facilitator clarifications | Sajad may have clarified some things during the test that weren't captured in the notes. Only the clarifications at Step 4 and Step 6 were recorded. | Flagged. The number of points where Bao needed help may be undercounted. |
| 3 | Duplicate observations | Both sources describe the same events (e.g. the model question, being stuck at Step 3, the `[list]` placeholder). | **Merged** into single step entries and findings, with both sources listed. |
| 4 | Quotes | An earlier formatted version of the notes had edited some quotes. | **Restored verbatim**, typos included. |
| 5 | Step 3 quotes | "What does the rule source mean?" and "What does a rule source mean?" are near-duplicates. | **Both kept** (they may be two separate moments). Flagged as a repeated question. |
| 6 | Steps 5 to 7 | The report says the steps with prompts worked; the notes show uncertainty at Step 5, a facilitator clarification at Step 6, and an overwhelming output at Step 7. | **Resolved in favour of the notes**, which match the module's steps. The report's "worked" is read as "the prompt ran". |
| 7 | Step 5, action 3 | The notes say "Pasted step 6 second prompt" under Step 5. | **Resolved.** The module's Step 5 has two prompts and Step 6 has one, so this was Step 5's second prompt. |
| 8 | Step 8 prompt | The report lists Steps 1, 2, 4, 5, 6 and 7 as having prompts. | **Resolved.** The module's Step 8 has a prompt ("List every artifact this stage should produce…"), matching the notes. The report's list is incomplete. |
| 8a | Step 3 module text | The report's quote of Step 3 stopped before the module's last sentence. | Completed from the module itself: "A wrong source is how an invented requirement hides." |
| 8b | Step 7 prompt | Bao's typed prompt differs from the module's second Step 7 prompt ("List every number or feature in the spec that nobody asked for."). | Not an error. Recorded as his own version, with the quote unchanged. |
| 8c | F9 wording | An earlier version said the module doesn't define what the stage produces. It does, in the "Artifacts generated" table. | **Corrected.** F9 now says the AI couldn't find the list in the project files. |
| 9 | >150k context | `/usage` shows 43%; the usage panel screenshot shows 36% (likely taken at a different time). | Used 43% from `/usage`. **Confirm.** |
| 10 | Cost | The 5-hr window began at 12:50 pm, so 28% may include usage before the 3:41 pm start. No dollar figure. 7-day statistics excluded as not session-specific. | Flagged. Session-level only. |
| 11 | Duration | Notes: 58 min (3:41 to 4:39). Report: approximately 60 minutes. | Consistent. Used 58 min. |
| 12 | Per-step time | Not recorded by either source. | Every step record marked Not recorded. |
| 13 | Step 4 numbers | 9, 10, 21, 25 were noted as random, so the Step 4 output doesn't reflect a real filter. | Flagged in the step record. |
| 14 | Step 5 model behaviour | "Likely due to a mediocre model" is an observer guess, not tested. | Kept as an annotation, not a finding. |
| 15 | Blank fields | Many "What happened?" / "Issues encountered?" / "Comments" fields were empty in the notes. | Marked **Not recorded** rather than "None", since blank doesn't confirm there was no issue. |

---

## 8. Limitations

- **One participant, one session.** This shows the problems exist. It can't show how common they are, or that nothing else is wrong.
- **The participant is a student.** The result speaks to the junior reader the module describes. A senior developer may supply the missing mechanics from habit and never notice the gaps.
- **Model and effort were not controlled.** Sonnet 5.5 at low effort may behave differently from whatever the evidence runs used.
- **Probing may have been light.** Bao spoke mainly when unsure.
- **Facilitator help may be undercounted.** Sajad may have clarified points that weren't captured, so the steps where Bao needed help could be more than recorded.

---

## 9. Still to record

- [ ] Confidence rating before and after, and the reason for any change
- [ ] Gate scoring: the six Plan Approved criteria, each met, partly met or not met
- [ ] Dollar cost for the session (only `/usage` percentages so far)
- [ ] A copy of `notes-delete-spec.md`
- [ ] Time per step (consider timestamps at each step in future sessions)
