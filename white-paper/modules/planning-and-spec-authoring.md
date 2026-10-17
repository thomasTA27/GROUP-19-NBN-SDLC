# Stage: Planning and Spec Authoring

Planning turns a request into an agreement about what software must do, how its
behaviour can be checked and what is outside the change. The result is a
specification that another person can review and use without reconstructing the
conversation that produced it.

AI can help draft that specification, compare it with project guidance and find
unanswered questions. People remain responsible for deciding what is needed,
checking the sources and approving the result. This module explains that division
of responsibility and provides a practical workflow in eight steps.

Use it for a feature, a bug fix or a change to existing behaviour. For larger
work, agree a manageable scope and repeat the workflow for each part. The method
does not depend on a particular programming language, framework or AI tool.
Product owners, analysts, designers and developers can prepare the specification;
readers without technical expertise should involve a technical reviewer for
unfamiliar constraints.

## Why planning needs explicit decisions

When a specification becomes context for an AI agent, its assumptions can shape
design, code and tests. A fluent draft may carry an unsupported decision through
several stages without making that decision obvious. The important question is
therefore not whether the draft sounds complete, but whether each requirement
has a reason to be there and a person who can confirm it.

Three practices make that review possible. First, connect each criterion to the
request, a binding project rule or a recorded decision. Second, separate finding
an unanswered question from deciding its answer. Third, review changes in
manageable groups and save the decisions outside the AI conversation. Together,
these practices give the approver something concrete to check and a way to send
an incorrect interpretation back for revision.

The author coordinates the work and checks sources. The person responsible for
the product or rule answers questions. AI assists with drafting and comparison.
A separate approver decides whether the plan is ready to proceed. Several roles
may be held by one person, but the author does not approve their own specification
under the [Plan Approved gate](plan-approved.md).

## Before you start

The author first reads the original request, relevant project guidance and the
[six Plan Approved checks](plan-approved.md#what-gets-checked). For existing
software, establish current behaviour from documentation, a demonstration or
implementation evidence with technical help. Project guidance may live in
repository files, documents or a work tracker; no specific context-file format
is required. Missing essential guidance must be established with the responsible
owner before affected requirements are drafted.

Agree who answers product and rule questions, who provides technical help and
who independently approves. Someone working alone must still arrange another
reviewer before treating the specification as approved. Choose one versioned
location for the specification and its supporting records so they remain
available after the AI session ends.

Use a tool permitted to process the material being shared. Record the tool,
model version and effort/reasoning setting where available, and any changes
during the run. Ask the team when settings are unclear; this method prescribes
no vendor or universal setting. An unavailable setting is recorded as unavailable,
not guessed. Provide the AI with accessible source text or references, and check what it
actually read before relying on its summary.

## Artifacts generated

The artifacts form a review record. They may be sections of one document rather
than separate files. An acceptance criterion describes an observable result;
a clarification marker identifies an unanswered question; an assumption is a
proposal, not an approved fact.

| Artifact | What the reviewer needs |
| --- | --- |
| Specification | Request and source references, numbered acceptance criteria, mandatory project constraints and explicit out-of-scope items. |
| Questions and decisions | Question IDs, affected criteria, answers or unresolved status, decision owners and dates. |
| Assumptions | IDs, sources/reasons, affected criteria and confirmation status, with references in both directions. |
| Removed/deferred items | What changed, why, who decided and any Design handoff. Removing text does not cancel a binding rule. |
| Review and approval | Issues found, their disposition, the reviewed version and the approver's named, dated decision. Until approval, the status remains Draft. |

## AI-Assisted Workflow

Read "Before you start" and gather the inputs before following Steps 1–8.
Each step states what to read, what to do and what to check or save. Complete
those actions whether you use the example prompts or write your own.

**The prompts are optional examples.** Adapt them to your project, tool and
working style. Their purpose is to show the information and boundaries the AI
needs; copying their wording is not a requirement. You can also perform checks
yourself. Send one request at a time and inspect the output before continuing.

If you use an example, replace bracketed inputs such as `[request]` with your
actual information. Each step explains what belongs there. The output label
`[NEEDS CLARIFICATION: ...]` is different: it identifies a real unanswered
question in the draft. Do not invent answers just to remove the label.

### Step 1: read the request and load the context

**Read:** the request, relevant project guidance and existing behaviour gathered
under "Before you start". Provide the AI with the project inputs it needs;
opening a document beside a chat does not mean the AI can see it.

**Do:** provide the actual text or references the AI can access. Replace
`[request]` with the request and `[sources]` with a list of the relevant files,
documents or supplied excerpts, including versions where known. If a link is
inaccessible, supply an approved excerpt or get access through the normal process.

**Example prompt (optional):**

> Read this request: [request]. Read these project sources: [sources]. Summarise
> the requested outcome, current behaviour, applicable rules and important gaps.
> For each rule, name the source and section. Separate required rules from
> examples of how existing software happens to work. List anything you could not
> read. Do not draft requirements or write code yet.

**Check/output:** open the cited sections and verify the summary. Resolve missing
essential sources with the owner. Save the checked summary and source list.

### Step 2: draft criteria and questions

**Read:** the checked context summary and request. Continue in the same AI session,
or provide the saved context again if you start another.

**Do:** ask for a first draft using the checked context and the requirements
below. The example prompt uses the inputs already provided.

**Example prompt (optional):**

> Draft a specification from the request and checked context. Give each acceptance
> criterion a stable ID, an observable result and its source: Request (quote or
> reference), Rule (document and section), or a recorded decision (ID). Do not
> treat existing behaviour as a mandatory rule without evidence. Create numbered
> questions Q1, Q2 and so on for unknowns; link each to affected criteria and mark
> it [NEEDS CLARIFICATION: the specific question]. Do not guess values, add
> features or write code. Separate observable behaviour from mandatory project
> constraints and process checks. Include an explicit out-of-scope section.

**Check/output:** save the numbered draft and questions. No particular number of
criteria or questions is expected. An empty question list may mean the request
is complete or the AI missed something; check rather than assuming either.

### Step 3: check each criterion against its source

**Read:** the draft beside the original request and the source sections it cites.
This is a human review. You may ask AI to locate text, but you confirm the match.

**Do:** work through one criterion at a time:

1. Open its named source. Find the exact statement that supports it. If it is
   missing, flag the criterion as a proposal needing a decision; do not accept
   an invented source label. Ask a technical reviewer about unfamiliar rules.
2. Describe how someone could tell whether the result happened. If two readers
   could expect different results, write the question that would settle it.
3. Compare scope with the request. Flag extra behaviour, limits or numbers that
   nobody requested and no project rule requires.

**Example:** a request says "Users can export a report." A draft says "Exports
are fast and always use PDF." "Fast" has no agreed check, and PDF has no source.
Ask the owner which formats and, if relevant, what timing is required. Do not
choose a time limit or format merely to make the criterion testable.

For example, after the decisions in Step 6, the record could look like this:

| Record | Example content |
| --- | --- |
| Q1 — Which export format is required? | Resolved: CSV only. Decided by Product owner (example), 12 March 2026. PDF is outside this change. |
| Q2 — Is a new response-time target required? | Resolved: no new target for this change; existing project performance rules still apply. Same decision owner and date. |
| AC1 — Export format | Selecting Export for a report produces a downloadable CSV file. Source: decision Q1. |

AC1 now has an observable result and an identifiable decision. A reviewer can
select Export and inspect the downloaded file's format. Other behaviour, such
as which data the file contains, still needs its own criteria if relevant.
The role label, date and decisions above are illustrative, not requirements or
answers to copy into your project. In an actual decision record, use the real
decision-maker's name, role and decision date.

Optional prompt, after your review: replace `[corrections]` with criterion IDs,
the problem and supporting source or question for each.

**Example prompt (optional):**

> Apply only these reviewed corrections: [corrections]. Show the changed
> criteria and any new questions. Preserve the other criteria and their IDs.

**Check/output:** confirm the changes against your list and save the draft.

### Step 4: sort the questions, keeping the criteria

**Read:** every question and its affected criteria. You are filtering
**clarification markers, not acceptance criteria**. Do not enter arbitrary
criterion numbers or delete requirements to reduce a count.

**Do:** assign each question one of these outcomes:

| Outcome | When to use it | Record |
| --- | --- | --- |
| Blocking | An answer is needed to state/check intended behaviour, satisfy a binding rule or judge whether the request can proceed. | Question ID, reason, affected criteria and person to ask in Step 6. |
| Answered by a source | An authoritative project source already supplies the answer. | Exact source/section; verify it in Step 5. |
| Proposed assumption | You have a reasoned proposal that needs confirmation. | Numbered assumption A1, A2, etc., source/reason, affected criteria and Pending status. Behaviour-affecting proposals need the owner's decision before approval. |
| Design decision | The question concerns how to implement an already clear outcome. | Design handoff item and relevant constraint. If it affects the intended outcome or an unresolved feasibility conflict, keep it blocking too. |

Keep every question's ID and history, but update its status as the work proceeds.
A blocking question retains its unresolved marker until Step 6 supplies an
answer. For a source-backed answer, replace the marker only after checking the
source in Step 5; for a human decision, do so after checking the update in Step 6.
In both cases, mark the question Resolved and link the affected criteria to the
source or decision. Keep the original question and answer in the record.

An assumption awaiting confirmation remains Pending and must not be treated as
an agreed requirement. Once the owner confirms or rejects it, record that
decision and update its affected criteria. For an optional implementation choice,
record Deferred to Design and its reason instead of leaving an unresolved
requirements marker. Deferral is valid only when the required behaviour and
binding constraints are already clear; it cannot hide a blocking question.

Performance, ordering, messages, privacy and retention can affect user needs or
binding rules; do not automatically dismiss them as implementation details.
Keep a required technical constraint in its own section. Leave optional choices
of library, storage structure or internal function names to Design.

Replace `[classification]` with your reviewed list, for example: "Q1 blocking,
ask the owner about supported formats; Q2 answered by Policy section 3; Q3 design
decision, internal file naming." Use your own question IDs, not this example.

**Example prompt (optional):**

> Apply this question classification: [classification]. Keep acceptance criteria
> and their IDs. Record source-backed answers, pending assumptions with their
> affected criteria, blocking questions and design handoff items separately.
> Do not silently answer questions, invent defaults or mark a proposal confirmed.
> List any question that remains unclassified.

**Check/output:** check every question has a disposition. For each assumption,
check the criteria refer back to its ID and the dependency list is complete.
Save the question list, assumptions and draft. If there are no questions, record
that the list was checked; do not create questions to hit a target.

### Step 5: check against the project again

**Read:** the draft and assumptions alongside the project guidance from Step 1.
This checks the actual draft; loading guidance earlier does not establish that
the draft follows it.

**Do:** ask for a focused comparison, not a full rewrite.

**Example prompt (optional):**

> Compare the draft criteria and assumptions with the project sources. List only
> missing applicable requirements, contradictions and overstated source labels.
> For each, give the criterion/question ID, exact source section and proposed
> correction. Distinguish binding rules from precedent. Do not change the spec.

Read the cited passages and distinguish a source correction from a decision.
Correcting a misquoted value or wrong reference can be approved here when an
applicable authoritative source gives one clear answer. Record the source and
the correction. If sources disagree, their applicability is unclear or a proposed
change would override an agreed requirement, create or update a blocking question
for Step 6. Name the affected criteria, conflicting sources and responsible
decision owner; do not choose a rule to ignore. You may correct unaffected items
while that question remains open.

If using the example below, replace `[approved corrections]` with only the IDs
and exact changes you have confirmed. Exclude conflicts awaiting a decision.

**Example prompt (optional):**

> Apply only these approved corrections: [approved corrections]. Show the diff
> or changed passages. Keep unresolved conflicts visible as questions. Do not
> choose which binding rule to ignore or add unrelated requirements.

**Check/output:** check the changes and save them. A missing authoritative rule
or unresolved conflict blocks approval; it is not cleared by the AI's assertion.

### Step 6: obtain answers, then give them to the AI

**Part A — human decisions. Read:** the blocking questions, pending proposals
affecting behaviour and conflicts. Take them to the person responsible for the
product or rule. They may need a technical, security or domain reviewer.

**Do:** record each question ID, concrete answer, who decided and the date. If
you are also the decision owner, state that; the final approver remains separate.
"Use your judgement" does not resolve an unspecified behaviour. Keep unanswered
questions open. Check whether an answer introduces another question or expands
scope, and get that decision recorded too.

**Part B — AI applies those decisions.** Replace `[answers]` with the actual
records, for example "Q1: CSV export only; decided by the product owner [actual
name], [actual date]." Replace every example field with real information; do not
send the word `[answers]` or just the question numbers.

**Example prompt (optional):**

> Apply these recorded answers: [answers]. Update only affected criteria,
> assumptions and scope. Cite each decision's question ID and preserve its
> decision owner and date. Flag new questions or conflicts with project rules
> instead of settling them yourself. Show the changed passages.

**Check/output:** compare changes with the actual decisions. Save the question
and decision records together with the draft; return to the owner for new
blocking questions. Do not proceed to approval while any blocking questions remain unresolved.

### Step 7: review small sections and resolve issues

**Read:** one manageable group of criteria, its sources and decisions, then the
[quality checklist below](#what-to-verify-before-accepting-output). Choose
a group you can read fully before continuing; there is no required batch size.

**Do:** check each criterion in the chosen group against the quality checklist.
Record only the issues found, with the criterion ID, failed check, supporting
source and proposed action. Review those issues before approving any changes,
then repeat for the next group. You may do this yourself or ask AI to assist.

If using the example prompt, replace `[criterion IDs]` with the IDs of the group
you have chosen, for example `AC1, AC2, AC3`. Use your actual IDs.

**Example prompt (optional):**

> Review only these criteria: [criterion IDs]. Check necessity, appropriate
> separation of behaviour and constraints, ambiguity, completeness, one checkable
> obligation per criterion, verifiability and traceability. Return only issues
> in a table: criterion ID, failed check, evidence and proposed action. Do not
> rewrite the spec or delete requirements. Stop after this group for human review.

Read each issue with its source. Split compound criteria, clarify wording or
return unanswered behaviour to Step 6. If a required constraint is in the wrong
section, move it and retain its source. A criterion failing a quality check is
**not permission to delete the underlying requirement**. Remove an item only
when the owner confirms it is unnecessary or out of scope; record the reason
and decision owner. If outputs are too long to inspect, reduce the group.

Ask for only the changes you have approved, inspect them, save and continue
until every criterion has been reviewed. Then check for proposals that still
lack a source or confirmation. An example request is:

**Example prompt (optional):**

> List all proposed behaviour, limits, numbers and assumptions that lack a source
> or a recorded confirmation. Give IDs and affected criteria only. Do not add
> requirements or remove anything.

**Check/output:** have the owner confirm or remove each proposal. Verify that
no required behaviour or binding rule was lost and all references still match.
Stop rewriting once the review issues are resolved; more text is not a completion
condition. Any unresolved issue remains visible and prevents approval where it
fails the gate.

### Step 8: save the artifacts and request approval

**Read:** the complete saved specification, supporting records and the
[six Plan Approved checks](plan-approved.md#what-gets-checked). Do not ask the AI
to guess which artifacts this stage requires.

**Do:** replace `[location]` with the agreed document/file/work-item location.
If the tool cannot save there, ask it to produce the content and save it yourself.

**Example prompt (optional):**

> Save the current draft at [location], or provide it for me to save if you cannot
> access that location. Include: the request and source references; numbered
> acceptance criteria; applicable project constraints; out-of-scope items;
> numbered assumptions with affected criteria and confirmation status;
> questions with answers, decision owners and dates; removed/deferred items and
> reasons; design handoff items; and a review/approval section. Preserve unresolved
> items. Mark Draft, not approved. Report each artifact's location and anything
> missing. Do not invent an approval or a decision owner.

Open the saved artifact yourself. Confirm it contains the latest changes and
can be read by the reviewer without access to your chat. Check all links and
that assumptions and criteria reference each other correctly.

Before requesting approval, check the question record against the specification.
Resolved questions keep their answers and sources or named, dated decisions;
their unresolved markers must be replaced in the affected criteria. Deferred
items must concern optional Design choices and have a recorded reason, with no
required behaviour left undefined. Confirm that assumptions affecting requirements
have been accepted or rejected and reflected in the criteria. If a blocking
question or unresolved requirements marker remains, keep Draft status and return
it to Step 6. Preserve the history rather than deleting the question record.

Give an independent approver the saved version and supporting sources. The
approver checks all six gate criteria, records a decision against that version
with their name and date, and either approves or returns specific failures for
revision. An AI checklist is not approval. If you cannot obtain an independent
reviewer, keep Draft status and do not treat the plan as approved.

**Output:** a saved approval record or a saved list of required corrections.
Only an approved version goes to [Design and Context Engineering](design-and-context-engineering.md).

### When Design sends the spec back

Design records a change request rather than silently changing approved intent.
The request names affected criteria/assumptions and why they must change. Obtain
new decisions through Step 6, rerun Step 7 for the affected parts and seek renewed
approval through Step 8. Keep the earlier approved version and link the change.

## What to verify before accepting output

Use the following questions to review the specification. AI can help identify
issues, but the author and reviewer must check the sources and resolve the
decisions. This checklist supports a review; it does not certify compliance
with a requirements standard.

| Characteristic | Review question | Responsibility |
| --- | --- | --- |
| Necessary | Does it serve the request or an applicable binding rule? | Author and owner |
| Appropriate | Are behaviour, mandatory constraints and optional design choices separated? | Author, with technical help |
| Unambiguous | Could two readers expect different results? | Author and owner |
| Complete | Are needed inputs, outcomes and relevant failure cases stated? | Author and owner |
| Singular | Can each obligation be checked separately? | Author |
| Feasible | Is there a known obstacle to proceeding? Detailed feasibility continues in Design. | Technical reviewer; escalate known blockers before approval |
| Verifiable | Can someone describe a concrete check without inventing a decision? | Author and reviewer |
| Correct | Does it represent the owner's need? | Owner and approver |
| Conforming | Does it follow the agreed format, if one exists? | Author; record if none is agreed |
| Traceable | Does it cite a real source or named decision, with assumption dependencies linked? | Author and approver |

## Governance and accountability

Agree what information may enter the AI tool before sharing project material.
Questions about sensitive data, security, accessibility or regulated behaviour
go to the responsible specialist. Their binding requirements stay visible in
the specification; later security and release checks cannot be assumed to
supply missing requirements.

Record who prepared the specification, who made each decision and who approved
which version. Record AI assistance using your organisation's agreed method.
The approval record belongs with the specification or in a linked document or
work item with version history. Accountability follows those decisions,
regardless of how much of the draft the AI wrote.

## Metrics for success

Evaluate the specification by whether its requirements are supported, unresolved
decisions are visible, and an independent reviewer can approve it. More prompts
or a longer document do not establish better quality. Record task time and AI
usage where reliable measurements are available, but do not use the number of
clarification questions as a success target.

## Adapting the workflow

Keep the same decision and source checks while adjusting review effort to the
complexity and consequences of the change. A new reader may inspect one
criterion at a time; an experienced reader may work with larger groups. Neither
approach removes the need to resolve questions and obtain independent approval.
Specialist software also requires the relevant safety, regulatory and domain
reviews. A project-specific template can organise the artifacts listed above
without changing their purpose.

Planning defines outcomes and mandatory constraints. Optional architecture and
implementation choices belong to [Design and Context Engineering](design-and-context-engineering.md).
Coding and executing tests follow in their respective stages. Hand over the
approved version with its supporting sources and decision record so those
stages can act on agreed intent.
