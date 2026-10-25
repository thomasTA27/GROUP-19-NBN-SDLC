# Stage: Planning and Spec Authoring

Planning turns a request into a specification that says what the software must
do, how to check it and what is out of scope. Another person should be able to
review it without the conversation that produced it. AI drafts, compares and
finds open questions. People decide what is needed, check the sources and
approve.

Use it for a feature, a bug fix or a change to existing behaviour, and split
larger work into parts. It works with any language, framework or AI tool.
Authors without technical expertise should involve a technical reviewer.

## Why planning needs explicit decisions

A spec becomes context for every AI agent that follows, so an unsupported
assumption in it can reach design, code and tests unnoticed. Three practices
stop that. Each criterion links to the request, a binding rule or a recorded
decision. Finding a question is kept separate from answering it. Decisions are
saved in files outside the AI session.

The author runs the work and checks sources. The product or rule owner answers
questions. A separate approver passes the spec at [Gate 1 (Plan
Approved)](plan-approved.md). One person can hold several roles, but the author
never approves their own spec.

## Before you start

Read the request, the project guidance and the [six Gate 1
checks](plan-approved.md#what-gets-checked), which Step 8 lists. For existing
software, find out how it behaves now from its docs, a demo or the code. Settle
any missing essential guidance with its owner first. A new project with no
context files needs the [New projects card in Design and Context
Engineering](design-and-context-engineering.md#new-projects-set-up-the-base-conventions-first)
run before the first spec.

Agree who answers product questions, who owns each binding-rule document (such
as the security doc or the context files), who gives technical help and who
approves. Only a rule's owner settles a question about that rule. When two
documents state the same rule, the owner of the more detailed one settles it,
and if the documents disagree, both owners decide together. The product owner
and rule owners are the decision owners. Record these roles in `review.md`.
Someone working alone still needs another person to approve. Save everything in
`docs/specs/<feature>/` unless your team keeps specs elsewhere. Keep it in the
project's git repository so every version stays readable without your AI
session. In Jira or Confluence, use version history wherever this module says to
tag.

Use an AI tool your team has approved for the material you share. Record the
tool, model version and reasoning setting in `review.md`, and write
"unavailable" for anything the tool doesn't show.

## Artifacts generated

Criteria are numbered AC1, AC2 and so on, with Q for questions, A for
assumptions and H for Design handoff items, so records can point to each other.
A **binding rule** is a documented project rule the change must follow. The
project's **conventions** are the binding rules kept in its context files.
[Design and Context Engineering](design-and-context-engineering.md) lists what
counts as a context file. **Precedent** is how existing software happens to
work, and it binds only where a rule says so. The request includes anything
supplied with it, such as a mock-up, so a criterion can cite a named screen as
its source.

| File in `docs/specs/<feature>/` | What it holds | Written in |
| --- | --- | --- |
| `context-summary.md` | The checked summary of the request, current behaviour and binding rules, with the source list | Step 1 |
| `spec.md` | The specification, using the template below. Status stays Draft until approval. | Steps 2 to 7 |
| `review.md` | The roles, AI use, the Step 7 issues and what was done about each, the person checks, and the approval record against a named version | Before you start, Steps 7 and 8 |

Save this template once as `docs/specs/template.md`. A team template can replace
it if it keeps the same sections and IDs.

```markdown
# Spec: <feature>
Status: Draft
Version: <number, starting at 0.1>

## Request
<the request, quoted or linked>

## Sources
- <document, section, version, including any mock-up supplied with the request>

## Acceptance criteria
- AC1: <observable result>. Source: <request quote, rule section or decision's Q ID, plus any Q or A IDs it depends on>

## Constraints
- <binding rule that applies>. Source: <document, section>

## Out of scope
- <item>
Confirmed by: <product owner, date>

## Questions
### Q1: <the question>
- Affects: <criterion IDs>
- Outcome: Blocking, Answered by source, Assumption A<n>, or Design handoff H<n>
- Ask: <decision owner or owners, or none>
- Answer: <the answer, or Open>
- Decided by: <name, role, date>, or Source: <document, section>

## Assumptions
### A1: <the proposed answer>
- Reason: <why it is proposed>
- Affects: <criterion IDs>
- Status: Pending, Confirmed or Rejected
- Decided by: <name, role, date>

## Design handoff
- H1: <how-question for Design>. Limited by: <binding rule, or none>

## Removed
- <item>. Reason: <why>. Decided by: <name, role, date>
```

Removing an item from the spec doesn't cancel a binding rule.

Start `review.md` from this skeleton, saved once as
`docs/specs/review-template.md`.

```markdown
# Review: <feature>
Author: <name, role>
Product owner: <name>
Rule owners: <document: name, one per document>
Technical reviewer: <name>
Approver: <name>

## AI use
- Tool: <tool>. Model: <model version>. Reasoning setting: <setting, or unavailable>
- Changes during the work: <none, or what changed and when>

## Step 7 issues
- <criterion ID>: <failed check>. Decision: <what you did, and who decided>

## Person checks
- Feasible: <technical reviewer's finding, name, date>
- Correct: <each decision owner's confirmation for the criteria they own, name, date>
- Conforming: <your check against the template, date>

## Approval
- Version <n>: <Approved, or the failures listed>. Approver: <name, role, date>
```

## AI-Assisted Workflow

Copy each prompt as written, replace every `<paste … here>` line, and read each
output before sending the next. You can do any check by hand instead. When a
prompt changes `spec.md`, an agentic tool edits the file and you check the diff.
A chat tool shows only the changed passages, so copy them into the file or ask
it for the whole file. `[NEEDS CLARIFICATION: …]` is different. The AI writes it
to mark a real open question, so leave it until the question is answered.

Start a new session at each step and attach the files that step lists. Within a
step, stay in that session, for example to apply its corrections. Step 7 needs a
new session for each group and for the final check. Models do worse when a
task's details arrive over several turns and hold on to early assumptions, so
one complete prompt is more reliable. A new session is still the same model and
can rate its own writing too kindly, so also check the criteria a review passed.

### Step 1: read the request and load the context

**Read:** the request and project sources. A chat tool may see only what you
attach or paste. Agentic tools such as Claude Code and Copilot agent mode also
load context files and can read the repository, so name the files the AI should
use. If a link won't open, supply an approved excerpt.

```
Read the request and project sources below. Summarise the requested outcome,
current behaviour, binding rules and important gaps. For each rule, name its
source and section, and say whether it is a binding rule or precedent. List
anything you could not read. Do not draft requirements or write code yet.

Request:
<paste the request here, with any mock-ups or attachments>

Sources:
<paste the context files and any other file paths, document links or
excerpts here, with versions where known>
```

**Check and save:** open the cited sections and check the summary against them.
Save it with the source list as `context-summary.md`.

### Step 2: draft criteria and questions

**Read:** in a new session, attach `context-summary.md`, the request and
`docs/specs/template.md`.

```
Draft spec.md from the request and checked context, using the attached
template. Give each acceptance criterion an ID (AC1, AC2 …), an observable
result and its sources: a quote from the request, a rule section or a
decision's question ID, plus every question or assumption ID it depends on.
Treat precedent as binding only where a rule says so. Add a question
(Q1, Q2 …) for each unknown with Answer set to Open, link it to the criteria it
affects, and mark those criteria [NEEDS CLARIFICATION: the question]. Write a
binding rule as a criterion when it has an observable result in this feature,
and otherwise under Constraints only. Fill in Out of scope and leave its
Confirmed by line empty. Do not guess values, add features or write code.
```

**Check and save:** save it as `spec.md` with Status Draft and Version 0.1.
There is no expected number of criteria or questions. An empty question list may
mean the AI missed something, so check.

### Step 3: check each criterion against its source

**Read:** in a new session, attach `spec.md` and the sources it cites. This is a
human review. AI can help you find text, but you confirm the match. For each
criterion:

1. Find the source statement that supports it. If none exists, add a question
   asking the owner whether the criterion belongs. Ask a technical reviewer about
   unfamiliar rules.
2. Say how someone would check the result. If two readers could expect different
   results, add the question that settles it.
3. Add a question for any behaviour, limit or number that nobody asked for and no
   binding rule requires.

Fix wrong references now and leave the rest as questions for Step 4. A draft
that says "exports are fast and always use PDF" for the request "users can
export a report" needs two questions, one on format and one on timing. Don't
pick a format or time limit just to make the criterion testable.

```
Apply only these corrections to the attached spec.md. Show each changed
criterion and any new question. Keep every other criterion and its ID
unchanged. Give each new item the next unused ID. For a new question, set
Answer to Open, add its ID to the Source of each affected criterion and mark
those criteria [NEEDS CLARIFICATION: the question]. For a split, the first
part keeps the original ID and each part keeps only the sources that support
it.

Corrections, one per line, in any of these forms:
"<ID>: <the change>. Reason: <source section or question ID>"
"New criterion: <observable result>. Source: <request quote, rule section or Q ID>"
"New question: <the question>. Affects: <criterion IDs>"
"Split <ID> into: <first part> | <second part> | …"
<paste your corrections here>
```

**Check and save:** check the changes match your list and save `spec.md`. Sort
any question this prompt adds with the Step 4 table, here or when a later step
reuses the prompt.

### Step 4: sort the questions

**Read:** in a new session, attach `spec.md`. Keep every criterion while you
sort. Give each question one outcome.

| Outcome | Use it when | Then |
| --- | --- | --- |
| Blocking | An answer is needed to state or check the intended behaviour, meet a binding rule or decide whether the request can go ahead, and you can't propose one | Ask the decision owner in Step 6. |
| Answered by source | The request or a binding rule already answers it | Note the document and section. Check it in Step 5. |
| Assumption | You can propose an answer and give a reason | Add it under Assumptions with Status Pending. The owner confirms or rejects it in Step 6. |
| Design handoff | It asks how to build an outcome that is already clear | Add it under Design handoff with any binding rule that limits it. |

A question that could change the intended outcome is Blocking, even if it looks
like a design choice. A Pending assumption blocks approval just as a Blocking
question does, but the owner only has to confirm or reject your proposal.
Performance, ordering, messages, privacy and retention often affect users or
binding rules, so they stay in Planning by default. Library, storage structure
and internal names go to Design.

```
Apply this sorting to the attached spec.md. Fill in each question's Outcome
and Ask fields. Add an Assumptions entry with Status Pending for each
Assumption, and add its ID to the Source of every criterion it affects. Add a
Design handoff entry for each Design handoff, set that question's Answer to
"Handed to Design as H<n>" and remove its [NEEDS CLARIFICATION] marker. Keep
every acceptance criterion and its ID. Do not answer questions, invent
defaults, write your own reasons or mark an assumption Confirmed. List any
question left unsorted.

Sorting, one per line as "<Q ID>: <outcome>. <who to ask, source section or
proposed answer>. Reason: <why, for assumptions only>":
<paste your sorting here>
```

**Check and save:** every question has an outcome, and every criterion that
depends on an assumption names its ID. If there were no questions, write "None,
checked on <date>" under Questions. Other markers stay until Step 5 or Step 6
settles their question, and every question stays in the record.

### Step 5: check against the project again

**Read:** in a new session, attach `spec.md` and the sources listed in
`context-summary.md`, including the context files.

```
Compare the attached spec.md with the project sources. List only binding rules
the spec is missing, contradictions with the sources, and source references
that claim more than the source says. For each, give the criterion or question
ID, the exact source section and a proposed correction. Say whether each source
is a binding rule or precedent. Do not change the spec.
```

**Do:** read each cited passage. Where one binding rule gives one clear answer,
apply the correction with the Step 3 prompt. Do the same for each Answered by
source question once you have checked its source, so the correction fills in
Answer and Source and removes the marker. Where sources disagree, may not apply
or would override an agreed requirement, add a Blocking question naming the
criteria, the sources and the decision owners. Other corrections can go ahead
meanwhile. An open conflict blocks approval, whatever the AI says.

### Step 6: get answers, then give them to the AI

**Part A, human decisions.** Take every open Blocking question, Pending
assumption and conflict to its owner in `review.md`, the product owner for
behaviour or the rule owner for a binding rule, with a technical reviewer if
needed. In `spec.md`, fill in each question's Answer and each assumption's
Status, with Decided by giving the name, role and date. When the owner confirms
an assumption, set its question's Answer to "Confirmed as A<n>". If they reject
it, record their answer on its question, or make the question Blocking if they
have none yet. If you are the decision owner, say so. "Use your judgement"
leaves the question Open. Record any new question or wider scope an answer
creates, and sort each new question with the Step 4 table before Part B. Have
the product owner confirm Out of scope too, and again whenever it changes.

**Part B, the AI applies them.** In a new session, attach `spec.md` and the
sources listed in `context-summary.md`.

```
Apply the decisions below to the attached spec.md. Update only the affected
criteria, constraints and scope, and remove the [NEEDS CLARIFICATION] marker
for each answered question and each confirmed assumption. Cite the question or
assumption ID in each changed criterion. Raise any new question or conflict
with a binding rule as a question and do not settle it. Show the changed
passages.

Decisions:
<paste the Questions and Assumptions entries you just filled in here>
```

**Check and save:** compare the changes with the decisions and save `spec.md`.
If the AI added anything no decision supports, remove it, or keep it as a new
question for Part A and run Part B again once it is settled. Approval waits
while any Blocking question is unanswered or any assumption is Pending.

### Step 7: review small groups of criteria

**Read:** in a new session, attach `spec.md` and the sources for one group of
criteria small enough to read in full. The prompt uses the first seven rows of
the [quality checklist](#what-to-verify-before-accepting-output).

```
Review only the criteria listed below in the attached spec.md against seven
checks: necessary, appropriate (behaviour, binding rules and optional design
choices kept separate), unambiguous, complete, singular, verifiable and
traceable. Return only the issues, in a table with the criterion ID, failed
check, the text that shows the problem and a proposed action. Do not rewrite
the spec or delete requirements.

Criteria:
<paste the criterion IDs here, such as AC1, AC2, AC3>
```

**Do:** record each issue and what you decided in `review.md`. Split compound
criteria, clarify wording, move misplaced constraints with their sources, or
send open behaviour back to Step 6 and review those criteria again once
answered. A failed check **never justifies deleting a requirement**. Only the
owner can remove one, and it goes under Removed with the reason. Apply accepted
changes with the Step 3 prompt and move to the next group. Feasible, Correct and
Conforming need a person, so ask the technical reviewer and each decision owner,
check the template yourself, and record each under Person checks in `review.md`.
Redo them for any criterion whose meaning changes after you recorded them.

After the last group, run this in a new session with `spec.md` and the sources
listed in `context-summary.md` attached.

```
List every behaviour, limit, number and assumption in the attached spec.md
that has no source and no confirmed decision. Give IDs and affected criteria
only. Do not add or remove anything.
```

**Check and save:** if a listed item already has a source or a confirmed
decision, note that under Step 7 issues in `review.md` and leave the spec as it
is. The owner confirms or removes each remaining item. Record each confirmation
in `spec.md`, as the assumption's Status or as a new Blocking question with
Answer and Decided by filled in, and cite its ID in the criterion. Removed items
go under Removed. Check no requirement or binding rule was lost, and stop once
every issue in `review.md` is settled.

### Step 8: request approval

**Do:** first rerun Steps 5 and 7 for any criterion whose meaning changed after
you last ran them, including changes from Step 6. Changes made to fix a step's
own findings, and edits that only touch a source, ID or marker, don't need that
step again. Stop when a rerun finds no new issue. Then open `spec.md` and
`review.md` and confirm the list below. The first six match the Gate 1 checks the
approver applies.

- every criterion is testable, so a tester could write a check without asking what it means
- no `[NEEDS CLARIFICATION]` marker remains, no question's Answer is Open, and every answer has a source, a named, dated decision or an H item
- every assumption is numbered and linked to its criteria, none is Pending, and each Confirmed or Rejected one is reflected in the criteria
- every criterion cites the request, a binding rule or a recorded decision, and nothing else was added
- Out of scope is filled in and confirmed by the product owner
- no missing binding rule or contradiction with the project's conventions found in Step 5 is still open
- each Design handoff item is an optional choice about how to build, with no required behaviour left undefined
- the roles and Person checks in `review.md` are filled in
- the files have the latest changes and someone without access to your chat can follow them
- every ID reference and link resolves.

If any fails, keep Status Draft and return to the step that fixes it.

Edits keep the same Version. The first version you send is 0.1, and each later
send raises it by 0.1. Tag each commit you send, for example
`spec-<feature>-v0.1`, so each decision names one exact version. Give the
approver that version of `spec.md`, `review.md` and the sources. They record
their decision in `review.md` with their name, the date and the version, listing
any failures. On approval, set Status to Approved in a commit that changes only
that line, and tag it, for example `spec-<feature>-v0.1-approved`. That tag is
how Design and later stages find the approved copy. An AI checklist is not
approval, and without an independent approver the spec stays Draft. Only an
approved version goes to [Design and Context
Engineering](design-and-context-engineering.md).

### When Design sends the spec back

Design never edits an approved spec. It raises a spec change request in
`docs/design/<feature>/spec-change-requests.md` or on the work item, giving the
spec section, the exact text, the problem and one question. While a request is
open, set Status back to Draft. Design keeps working from the last approved tag,
and Version rises when the changed spec goes to the approver. Add each request
as a Blocking question with its request ID and settle it through Step 6,
recording the answer, name and date in both places. If the answer adds or
changes a criterion, constraint, scope item or assumption, rerun Steps 5 and 7
for the affected criteria and then Step 8. Otherwise the approver confirms in
`review.md` that nothing changed in substance, against the new version, and
Status returns to Approved with a new approved tag. Link each change to its
request. Answer quickly, because Design waits on any request that affects its
decisions.

## What to verify before accepting output

The Step 7 prompt covers the first seven rows and the last three need a person.
The characteristics follow published summaries of ISO/IEC/IEEE 29148, which
disagree on whether Traceable is one of them. The full standard couldn't be
checked, so treat this as a working checklist. It supports review and doesn't
certify compliance with the standard.

| Characteristic | Review question | Responsibility |
| --- | --- | --- |
| Necessary | Does it serve the request or a binding rule? | Author and owner |
| Appropriate | Are behaviour, binding rules and optional design choices kept separate? | Author, with technical help |
| Unambiguous | Could two readers expect different results? | Author and owner |
| Complete | Are needed inputs, outcomes and relevant failure cases stated? | Author and owner |
| Singular | Can each obligation be checked separately? | Author |
| Verifiable | Can someone describe a concrete check without inventing a decision? | Author and reviewer |
| Traceable | Does it cite a real source or named decision, with assumption IDs linked? | Author and approver |
| Feasible | Is there a known obstacle to proceeding? Detailed feasibility continues in Design. | Technical reviewer, who escalates known blockers before approval |
| Correct | Does it represent the owner's need? | Owner and approver |
| Conforming | Does it follow the agreed template? | Author |

## Governance and accountability

Agree what may be shared with the AI tool before you start. Questions about
sensitive data, security, accessibility or regulated behaviour go to the owner
of the rule they concern, and their binding rules are written into the spec,
since later security and release checks won't add missing requirements. The
decisions in `spec.md` and the roles, AI use and approvals in `review.md` are
the accountability record, unless your organisation has its own method.
Accountability sits with those people however much of the draft the AI wrote.

## Metrics for success

These are our own metrics and have not been tested yet. Measure them per
feature. Don't target a number of clarification questions, since a good spec can
have many or none.

| Metric | How to measure | What it tells you |
| --- | --- | --- |
| Traced criteria | Criteria citing a request quote, rule section or decision ID at approval, out of all criteria | Should be all of them. Anything less means an unsupported requirement reached Gate 1. |
| Gate 1 returns | Times the approver sent the spec back before approving it | Repeated returns may point to a skipped step, or to an unclear request. |
| Spec change requests | Requests from Design per feature, and how many changed a criterion | A rising count may mean Planning is missing questions that Design later finds. |
| Answer time | Days from a Blocking question or spec change request being raised to its answer | Long waits stall Design. |

Record time spent and AI usage too where you can measure them reliably.

## Adapting the workflow

Scale review effort to the size and risk of the change. A new reader may check
one criterion at a time and an experienced one larger groups, but every question
is still resolved and every spec independently approved. Specialist software
also needs its safety, regulatory and domain reviews. Planning sets outcomes and
binding rules, and optional architecture and implementation choices belong to
[Design and Context Engineering](design-and-context-engineering.md).