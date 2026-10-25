# Stage: Design & Context Engineering
## What changes: traditional vs AI-native

### Standard practice, without AI

SWEBOK v4 treats architecture as a set of significant decisions, and design as turning requirements into the structure that construction builds from. Each decision goes in an Architecture Decision Record (ADR), following Michael Nygard, with its context, the decision and its consequences. A changed decision gets a new ADR that supersedes the old one. In this methodology every later phase checks its work against these decisions, which makes this phase Human-Decision oriented.

### How AI changes this

An agent only acts on what is in its context window, so Design also turns decisions into context the agent will see, which Thoughtworks calls context engineering. AI does the groundwork and proposes options, and a human makes the red-shield (Human-Decision) calls on architecture, patterns, services and risk.

## Artifacts generated

- **ADRs** in `docs/adr/` record the reasons behind each decision for Implementation, review and later design.
- **Context updates** are new scoped rules and fixes to context files that were wrong. Every later agent session loads them.
- **Design notes** in `docs/design/<feature>/` hold the questions, options and decisions, plus the doc entries Implementation must write.
- **Spec change requests** go back to the spec author in Planning.
- **The design review PR** holds all of these and is the evidence for the checkpoint.

An ADR can be Accepted only when it names the human who decided, gives the rejected options and the cost, has no unverified claims left, has had any security review it needs, and the design review PR is approved.

## AI-Assisted Workflow

_This workflow is the methodology's own proposal and isn't yet established practice._

Planning decides what gets built, and Design decides how it gets built. Conventions answer most "how" questions, so an ADR is only needed where none does or where the spec departs from one.

1. **Read the spec.** The AI lists the "how" questions, marks whether a convention answers each, and checks the spec for contradictions.
2. **Sort by hand.** Each item gets one of five outcomes. Spec problems go back to Planning as spec change requests.
3. **Decide.** For each ADR item, the AI gives options and a named human decides. A decision no human made is recorded as such and can't be Accepted.
4. **Record.** The AI drafts the ADRs, fixes wrong context files, drafts rules and lists the doc entries Implementation will write. The human keeps only rules the agent couldn't infer, then opens the design review PR.

With no ADR items, skip step 3. If step 4 has nothing to do either, the design review PR records "no new decisions".

**Exit condition.** A named human can defend every decision without the AI, and an implementer, human or agent, could build the change without making an architecture-significant choice.

**Larger features.** A feature with little to lean on, such as one that adds a background job or an external service, comes back mostly "no convention". Step 3 then also covers structure, quality attributes such as reliability, cost and privacy, and the contracts between new parts, with a senior decider. Where the spec states a quality outcome, Design decides only the mechanism, and a missing outcome is a spec change request.

**New projects.** Without context files, every question comes back "no convention", so run the New projects card before the first feature reaches Planning.

## What to ask the AI

Each card gives the inputs, the mode, a prompt to copy, where to save the output and what to check. "Read-only" means plan mode or Ask mode, where the AI changes no files, so you copy its answer into the save file.

Start each step in a new session and attach the files it lists. A long session costs more with every turn, and models do worse when a task's details arrive over several turns.

**Context files** are everything the agent loads or is pointed to, meaning instruction and rule files (`.github/copilot-instructions.md`, `.github/instructions/`, `AGENTS.md`, every `CLAUDE.md`, `.claude/rules/`), skills, custom agents and subagents, prompt files and commands, and any doc these tell the agent to read.

Design notes go in `docs/design/<feature>/`, with one folder per feature, and each feature's rule file takes the same `<feature>` name, with its scope set by `applyTo` or `paths:`. Attach files with `#file:` in Copilot in VS Code, or `@path` in Copilot CLI and Claude Code.

### New projects: set up the base conventions first

**You need** the project files so far, such as `package.json`, framework config and any docs. **Run it** read-only and **save it to** `docs/design/project-setup/step1-questions.md`.

```
Read the attached project files. List the conventions an agent would need
to build features here consistently, covering at least: tech stack and
versions, folder structure, how data is stored and accessed, security rules
and authentication, error handling, testing, and build and run commands.
For each, say whether the project already settles it (quote the file) or
whether it is still open. Do not propose answers.
```

**Then** decide each open item with step 3 and record it as an ADR without a spec section. Write the base context file (`.github/copilot-instructions.md` or `AGENTS.md` in Copilot, `CLAUDE.md` in Claude Code) with one line per item, citing its source file or ADR. The five-rule limit and "never" form are only for feature rules. A tech lead approves the file in a design review PR before the first feature reaches Planning.

### Step 1: Read the spec

Run both prompts before sorting. Planning saves the spec as `docs/specs/<feature>/spec.md`. A spec kept in Jira needs pasting into that file first so it can be attached.

**You need** the spec version approved at Gate 1, found by its approved tag and named in Planning's `review.md`, and the context files. That means the repo-wide instruction file, any scoped instruction or rule files, the skills that cover the same area, and the docs they point to, such as a schema or security doc. **Run it** read-only and **save it to** `step1-questions.md` and `step1-spec-conflicts.md`.

**List the "how" questions (context engineering)**

```
Read the approved spec and the attached context files. List every question
about how this feature will be built, covering at least: data model, where
logic runs, security rules, validation, error handling, state and loading,
and external services. Start with the spec's Design handoff items (H1,
H2 …), then its recorded decisions and numbered assumptions. For each
question give the spec section, and whether a convention answers it: quote
the convention, name its file, and say whether the spec follows or departs
from it. If none does, write "no convention". Do not propose answers.
```

**Consistency check**

```
Read the attached spec. Do any decisions, assumptions, acceptance criteria
or out-of-scope notes contradict each other? Quote both sides of each
conflict with their section references.
```

**Then** spot-check the quoted conventions, because the AI can overstate them, and note any it misreads in `step2-sort.md` as a candidate rule. Dismiss intentional contradictions with a one-line reason in `step1-spec-conflicts.md`, and treat the rest as spec change requests. Leave the spec itself alone.

### Step 2: Sort by hand

**You need** both step 1 files. **Do this** without AI, since this is where spec problems and wrong context files surface. **Save it to** `step2-sort.md`.

Give each question, and each contradiction you didn't dismiss, one of these outcomes.

| Outcome | Use it when | Next |
|---|---|---|
| Follows convention | A convention answers it and the spec follows it | Cite the convention. |
| Decided in Planning | The spec settles it in a recorded decision | Cite the decision's question or assumption ID. If a convention needs a doc entry, it goes on step 4's list. |
| ADR | No convention answers it, the spec departs from one, or the convention is ambiguous | Steps 3 and 4. |
| Spec change request | The spec is unclear, contradicts itself, or can't sensibly be delivered | Send it to the spec author and don't decide it here. |
| Context fix | An existing context file is wrong now, or will be once this feature is built | Step 4, Fix a context file, citing the ADR or criterion that makes it wrong. |

A Design handoff item's "Limited by" rule binds whatever is decided for it. Cite the rule in the item's line in `step2-sort.md`, and in the ADR's Context if it becomes one.

If an item's outcome changes later, note the change and the reason in `step2-sort.md`.

Write each spec change request in `spec-change-requests.md` using this format.

```markdown
## SCR-1: Short title of the problem
- Spec section: for example A12 or AC6
- Quote: the exact spec text
- Problem: what is unclear, contradictory, or can't be delivered
- Question: one question that settles it
- Raised by: name, date
- Answer: decision owner's answer, name, date
- Spec updated: no, or the new approved version
```

The spec author takes it to the decision owner, and the spec returns to Draft while the request is open. Items the request doesn't affect carry on from the last approved version, found by its approved tag. If the answer adds or changes a criterion, constraint, scope item or assumption, the spec goes back through Gate 1. Otherwise the Gate 1 approver confirms that nothing changed in substance. The person running Design never answers their own request. Keep each request to one problem. The same fields work as a Jira comment.

**Then** group questions one decision would settle into a single ADR item, send the spec change requests, and wait for answers to any that affect an ADR item. If an answer changes the spec, wait for its new approved tag too.

### Step 3: Decide, one ADR item at a time

**You need** a named decider for the item (see How this differs by experience level), an ADR item from `step2-sort.md`, the spec, and the context files and docs the item cites. **Run it** read-only and **save it to** `step3-options.md`, with one heading per item.

**First** write your preferred option and a one-line reason in `my-view.md`, or "no view" and what you'd need to know. Keep it out of the prompt so it can't shape the options.

```
Below is one design question, with its spec section and convention status.
Use the attached spec and context files. Give 2-3 realistic options. For each, give the trade-offs for correctness,
security, testability, effort and consistency with the conventions. Mark
any claim about a library, API or platform as "verified" (name the source)
or "unverified". Do not recommend an option. End with the questions I need
to answer to decide.

Question:
<paste the item's rows from step2-sort.md here, with their spec sections,
the conventions quoted in step1-questions.md and any Limited by rule>
```

**Then** delete any recommendation the AI added despite the prompt, so the decider sees only the options, and decide. In `decisions.md`, write the decision, the reason, whether your view held, changed or was missing, and the name of whoever made the call, which certifies they made it. If an AI made or confirmed it, say so in place of a name, and the ADR stays Proposed until a human decides. A choice that would change the spec needs a spec change request.

### Step 4: Record and carry it forward

Run these cards in order.

**Draft the ADR.** **You need** the entry from `decisions.md`, its options from `step3-options.md`, and the template below, saved once as `docs/adr/template.md`. **Run it** in agent mode and **save it to** `docs/adr/`, numbered after the last ADR as `NNNN-short-title.md`.

```markdown
---
Status: Proposed
Decided-by:
Drafted-with:
Supersedes: none
Security review: not needed | needed: <reviewer> | done: <reviewer>, <date>
---

# ADR-NNNN: Short title of the decision

## Context
The question, its spec section and version if there is one, and any convention involved.

## Decision
What was chosen, in one or two sentences.

## Rationale
Why the chosen option was chosen, and why each other option was rejected,
in the decider's words.

## Consequences
What this costs or makes harder, and what later work must do because of it.

## Not yet verified
Library, API or platform claims a person hasn't yet checked against
official docs. Must be empty before the ADR is Accepted.
```

```
Draft an ADR for the decision below, using docs/adr/template.md. Set Status
to Proposed and leave Decided-by empty. In Rationale, use only the reasons
given below. Copy every claim about a library, API or platform into "Not
yet verified", whether or not it is marked "verified".

Decision and reasons:
<paste the entry from decisions.md here>

Options considered:
<paste the matching section from step3-options.md here>
```

**Then** check the rejected options are fair and the reasons are the decider's. Fill in `Decided-by`, empty if an AI decided, `Drafted-with` as `tool:model`, and the spec version in Context. For authentication, authorisation, data residency or personal data, set `Security review` to "needed" with a reviewer, who changes it to "done". If it replaces an older ADR, set `Supersedes` and mark the old one Superseded. Check each "Not yet verified" claim against official docs for the version the project uses. Move a true claim into Rationale or Consequences with its source. If a false claim supports the chosen option, return the item to its decider and note any change in `decisions.md`. If it supports a rejected option, remove the claim and keep the option if its rejection still stands, and otherwise return the item to its decider. The read-only design reviewer (see In practice) can also critique the draft. It may share the drafting model's blind spots, so a clean critique doesn't prove the ADR is sound.

**Fix a context file.** **You need** a Context fix item, the wrong file, and the doc holding the convention or the ADR that makes the file wrong. **Run it** in agent mode. **Save** the fixed file and add a line under "Context fixes" in `decisions.md` naming the file, the problem and the convention it now follows.

```
The attached context file conflicts with the convention or ADR in the
attached document, as described below. Change only the conflicting lines so
the file follows it, and quote each line before and after. Change nothing
else.

Problem:
<paste the Context fix item from step2-sort.md here>
```

**Then** check that the diff only touches those lines. If you can't tell whether the file or the convention is wrong, treat it as an ADR item. A file that `CODEOWNERS` gives to another team is raised with them and listed as open, and the PR can still merge.

**Derive rules (context engineering).** **You need** the feature's ADRs and any candidate rules from `step2-sort.md`. **Run it** read-only and **save** a draft to `step4-rules-draft.md`. Final rules usually go in one file per feature, `.github/instructions/<feature>.instructions.md` in Copilot or `.claude/rules/<feature>.md` in Claude Code.

```
From the attached ADRs and candidate rules, propose at most five rules for
the agent that will implement this feature. Only include rules an agent
could not infer from the code. Start each rule with what the agent must
never do, then what to do instead. For each, name the ADR it comes from and
every file or folder where it could be broken, including security rules,
config or schema files outside the feature folder.
```

**Then** judge the draft against Writing context updates below.

**Rule conflict check (context engineering).** **You need** the drafted rules and every context file. **Run it** read-only and **save it to** `step4-rule-conflicts.md`.

```
Compare the drafted rules with the attached context files, including
skills, custom agents, prompt files and the docs they point to. List any
existing instruction that duplicates, contradicts or overlaps a drafted
rule, quoting both.
```

**Then** remove duplicates and resolve every contradiction, because neither tool reliably decides which rule wins. If an existing file is the one that's wrong, fix it with the Fix a context file card and record it under "Context fixes". When an ADR departs from a doc on purpose, the ADR and its doc entry below resolve the conflict.

**List required doc entries.** **You need** the ADRs, the "Decided in Planning" items, and the context files, which say what must be documented. **Run it** read-only and **save it** under "Doc entries required" in `decisions.md`, one line per entry.

```
For each attached ADR, and each item below, check whether a convention says
the decision must be recorded in a document. If so, give one line: the
document, the entry it needs, and the ADR or spec decision it comes from.
Quote the convention. Do not edit any document.

Items tagged "Decided in Planning":
<paste them here, or write "none">
```

**Then** check each line names its document, decision and convention, and that the quoted convention really requires a record. Delete any line whose convention doesn't. Implementation writes the entries with the code, so no document describes something not yet built.

**Open the design review PR.** Put the ADRs, context updates and design notes in one PR, and list any open spec change requests, context fixes raised with other teams and the after-Implementation follow-up issue in its description. A `CODEOWNERS` approver reviews it against What to verify, with the security reviewer where needed. Each decider sets their ADR to Accepted as the last change before approval. The PR waits while a spec change request affecting an ADR is unanswered or its spec change isn't yet re-approved, and Implementation starts from the merged PR.

### Writing context updates

Feature rules go in a scoped rule file and the reasoning stays in the ADR. Most features need only a few, since the conventions cover the rest. In Copilot the file is `.github/instructions/<feature>.instructions.md` and looks like this.

```markdown
---
applyTo: "<each folder the feature changes>/**,<other files where the rules could be broken>"
---

# <Feature> rules (from ADR-NNNN, last checked <date>)

- Never <what the agent must not do>. <What to do instead>. See docs/adr/NNNN-short-title.md.
```

In Claude Code the same rules go in `.claude/rules/<feature>.md`, with the scope written as a `paths:` list in the front matter.

```markdown
---
paths:
  - "<each folder the feature changes>/**"
  - "<other files where the rules could be broken>"
---
```

**Rules of thumb**

- Only include what the agent can't infer from the code.
- Lead with "never", because a constraint is easy to check against a diff.
- Keep to one checkable behaviour per rule.
- Scope each rule to every file where it could be broken. Shared types, data-access code, security rules and config often sit outside the feature folder, so check whether they belong in scope. A rule that needs a much wider scope belongs in its own file.
- Keep files short enough to review in one read.
- Avoid duplicates and contradictions.
- Change rules in the same PR as the ADR they come from, and update the "last checked" date in the file's heading.

**Before merging**

- **Context loads at all.** Once per project and whenever context files are added, ask a new session to list the instruction files, rules, skills, agents and MCP servers it can see. Fix any that are missing, because a misplaced file may be ignored silently.
- **The rule loads.** Open a file in its scope and check `/context` in Copilot CLI or its "Memory files" in Claude Code. If your tool doesn't list individual files, rely on the probe.
- **The rule reads as meant.** In a new session, run this prompt with the name of a file in the rule's scope, save the answer to `step4-probe.md` and reword any rule it misreads.

  ```
  Read <a file in the rule's scope>. Before changing anything, list every rule,
  decision and convention you would follow when editing this file, and say
  in one line what each requires. Do not make any changes.
  ```

**After Implementation, check that the rule changes behaviour (optional).** Run a small task the rule should affect, such as a change to one of the files it covers, in two new sessions, one with the rule and one on a branch with the rule file removed and the ADRs left out. Track it as an issue assigned to the ADR's decider. Published studies only test generic rules, so this is the only way to see whether a project's own rule works.

## What to verify before accepting output

- (a) Does each ADR name a decider in `Decided-by`, with their reason and the held, changed or missing line in `decisions.md`, and an entry in `my-view.md`? Filling in `Decided-by` certifies that person made the call, the way `Signed-off-by` certifies authorship.
- (b) Does every decision trace to the spec or a convention, and does every item in `step2-sort.md` have one outcome, with later changes noted?
- (c) Are the rejected options real and fairly described, and is each ADR's "Not yet verified" list empty? Check library, API and package claims against official docs and the package registry, because the model's word isn't enough.
- (d) Does each ADR still satisfy the spec's acceptance criteria? If a decision changes what a criterion means, raise a spec change request.
- (e) Do new rules conflict with any context file, apart from deliberate departures an ADR lists as a doc entry, and could the agent have inferred any of them from the code?
- (f) Are secrets, internal hostnames and PII kept out of ADRs, design notes and context files?
- (g) Is each ADR's `Security review` either "not needed" or "done"?

## Governance and security touchpoints

- (i) **Context files are an attack surface.** They load straight into the model's context, so a careless or malicious edit can become a prompt injection. Review them under `CODEOWNERS` like code.
- (ii) **Third-party skills, agents and MCP servers are dependencies.** Those with write or shell tools also carry excessive-agency risk, so adding one at design time is a supply-chain decision.
- (iii) **Secrets in design artifacts.** ADRs, design notes and context files are committed and loaded into agent sessions (LLM02 Sensitive Information Disclosure).
- (iv) **Security-relevant decisions.** An ADR that touches authentication, authorisation, data residency or personal data needs a second, security-aware reviewer before it is accepted.

## How authorship is recorded

**Attribution.** Commits with AI-assisted content carry an `Assisted-by:` trailer naming the tool and model you actually used, following the Linux kernel convention, for example `Assisted-by: Copilot:gpt-5`. Each ADR's front matter also records `Decided-by` and `Drafted-with`, which are this methodology's own convention.

**Accountability.** The committer adds `Signed-off-by:` to certify NBN's DCO, and AI agents must never add it. Filling in `Decided-by` certifies that person made the call, and only they can move the ADR to Accepted in the design review PR. `CODEOWNERS` names a human approver for `docs/adr/`, `docs/design/` and every context file.

**Accountable people.** The decider is accountable for the decision, and the approver who merges is accountable for the change.

[white-paper/governance/](../governance/) covers the rest, including build provenance (SLSA), sampling audits of sign-off, and accountability under SOCI/CIRMP.

## In practice

These are recommended defaults for NBN to confirm.

- **Set up the decision record (week 1).** Save the step 4 template as `docs/adr/template.md`, and apply `CODEOWNERS` to `docs/adr/`, `docs/design/` and the context files.
- **Save the prompts as reusable commands (weeks 1-2).** Use prompt files (`.github/prompts/`) in Copilot in VS Code and skills in Copilot CLI and Claude Code. Add a read-only design reviewer as a Copilot custom agent or a Claude Code subagent.
- **Ship rules with their ADR (weeks 2-3).** Context updates go in the same PR as the ADR they come from, so both are accepted together.
- **Test rules before adding more (ongoing).** After Implementation, run the with and without comparison. Context engineering has no unit tests, and this is the closest thing to one.

## Metrics for success

- **Decision traceability (our metric).** The share of implementation PRs that link the ADRs and spec they were built against.
- **Design-attributable rework (our metric).** PRs reworked because the design was missing or wrong, tagged in retros.
- **Context-file cost versus value (our metric).** Tokens, runtime and success per task with and without new rules, once feature code exists. Record dollars on API billing and tokens on subscription plans, and keep them separate.
- **Instruction freshness (our metric).** Time since each rule file's "last checked" date, because rule files drift unless someone prunes them.

## How this differs by experience level

Controlled studies have only measured coding, so this guidance is our inference.

**Juniors face an anchoring risk.** Seeing options before forming a view tends to mean adopting the AI's framing.

- Don't skip `my-view.md`. If you have no view, say so and ask a senior before reading the options.
- Use AI to check the spec against conventions and explain trade-offs.
- Until your organisation says juniors may decide, draft ADR items and have a senior or architect decide them.

**Seniors face a rubber-stamp risk.** Experts misjudge their own AI-assisted speed (METR, in the Implementation module), and we expect the same overconfidence in review, so a fluent ADR can be accepted without its rejected options being checked.

- Decide the ADR items juniors can't, and review the ones they can.
- Use AI for a wider range of options and for critique.
- Act as CODEOWNER for context-file changes.

The checkpoint is the same for both. Experience only changes who decides.

## What this stage does not cover

- Requirements, acceptance criteria, recorded decisions and assumptions (Planning, approved at Gate 1)
- Writing production code (Implementation)
- Writing doc entries such as schema notes (Implementation, from the list in the design notes)
- Test strategy and QA (Testing)
- Security testing of the built change (Security Gate, between Testing and Deployment)
- Organisation-wide AI policy and tool approval (governance)

## Open questions

- **How are instruction files evaluated?** No accepted method exists. Until NBN confirms otherwise, we assume rules are reviewed and probed but not measured. NBN could run the with and without comparison on a real feature and decide whether the result justifies the cost.

## Key takeaways

- **Planning settles what gets built and Design settles how,** and every later phase checks its work against that.
- **AI proposes and a named human decides.** An ADR without a name in `Decided-by` hasn't been decided.
- **Write only the rules an agent can't guess,** and scope them to wherever they can be broken.
- **Probe rules before merging and measure them after Implementation.**
- **Treat context files as code** and keep secrets out of them.

**Research behind this module:** [research/modules/design-and-context-engineering.md](../../research/modules/design-and-context-engineering.md)