# Stage: Design & Context Engineering

_Entered from Gate 1. Not yet tested; to be run on Create Task in Sprint 2._

## What changes: traditional vs AI-native

### Standard practice, without AI

SWEBOK v4 covers this phase in two knowledge areas: Software Architecture treats architecture as a set of significant decisions. Software Design covers detailed design, recording rationale, and design reviews. Both take requirements as input and produce the structure that construction builds from. The phase's key output is the decision and its rationale.

The common lightweight form is the Architecture Decision Record (ADR), popularised by Michael Nygard. An ADR is one short file per decision, with Title, Status, Context, Decision and Consequences, usually plus a Rationale listing the rejected options. An accepted ADR is never edited. A new one supersedes it instead, so the reasons behind the system survive.

Design sets the standard that later phases check against. If it is wrong, every later check verifies against the wrong thing, which is why this phase is Human-Decision oriented. "Standard-setting" is our framing, not SWEBOK's. We call this phase Design to mean both architectural and detailed design.

### How AI changes this

An agent only works from what is in its context window, so design gains a new job which is turning human decisions into context the agent will actually see. This is context engineering, which Thoughtworks describes as curating what the model sees so that you get a better result.

**AI performs the task, human checks:** mapping the codebase's constraints and conventions, spotting where the approved spec departs from them, drafting ADRs, and drafting instruction rules from accepted ADRs.

**AI proposes, humans decide:** design options with trade-offs, and adversarial review of a design.

**Untouched by AI:** choosing architecture, patterns or services, and accepting risk. These are the red-shield decisions.

## Artifacts generated

Design produces four outputs, each consumed by a later step:

- **The ADR**, e.g. `docs/adr/0001-due-date-as-string.md` (Implementation, as the "why"; code review; future design work)
- **Context updates:** new or changed scoped rules in `.github/instructions/*.instructions.md`, plus doc entries the conventions require, such as a codebase map or schema note.
- **The design review record**, the approved PR on the ADRs and context updates (gate evidence for the Human-Decision checkpoint)
- **Spec change requests**, when Design finds a gap or contradiction in the approved spec. (Back to the Gate 1 owner.)

An ADR is ready to merge when it names who decided, which options were rejected and why, and what the decision costs. Without rejected options, a reviewer can't tell whether a real choice was made.

## AI-Assisted Workflow

_This workflow is the methodology's proposal, not established practice._

Design starts from the spec approved at Gate 1. On a codebase with strong conventions, Planning has already settled much of the design, so this stage only does work where the spec departs from or extends a documented convention.

1. **Check the spec against the conventions.** The AI reads the approved spec and the project's context files and lists every item that departs from or extends a convention. Run this read-only, plan mode for example
2. **Decide each flagged item.** For each item, the AI lays out options with trade-offs and does not pick one. A named human decides. This is the Human-Decision checkpoint, and it cannot be delegated. If the options expose a gap or contradiction in the spec, it goes back to the Gate 1 owner as a spec change request, not to the AI.
3. **Record and carry it forward.** The AI drafts the ADR and the context updates. The human reviews them and keeps only rules the agent couldn't infer from the code.

If step 1 finds nothing, Design is a single check, recorded in the design review PR as "no new decisions".

**Example.** On the Create Task spec, step 1 should flag three items, and each becomes an ADR: storing `dueDate` as a date string instead of a `Timestamp` allowing task writes only through the Server Action sorting tasks in the client The second also conflicts with the spec's note that later tickets will relax the update rule, so that question goes back to Planning.

**Exit condition.** A named human can defend every decision without deferring to the AI. In addition, an implementer, human or agent, could build the change without making an architecture-significant choice of its own.

**Larger features.** Create Task is routine: the conventions settle most of its design. A feature with no convention to lean on, such as reminders, needs a new scheduled job and notification service, so step 1 flags most of it. The same steps apply, but step 2 then covers structural choices, quality attributes such as reliability, cost and privacy, and the interface contracts between new parts, each recorded in an ADR with a senior decider.

## What to ask the AI

Examples use the Create Task ticket and VS Code syntax; on the CLI, use `@path` instead of `#file:`. Run steps 1 and 2 in the Plan agent or Ask mode. If the spec lives in Jira rather than the repo, paste it in.

### Step 1: check the spec against the conventions

**Find what needs deciding (context engineering):**

```
#file:docs/specs/create-task.md #file:CLAUDE.md #file:docs/FIRESTORE-SCHEMA.md #file:docs/SECURITY.md Read the approved spec and these convention files. List every item in the spec that departs from or extends a documented convention, citing the convention and the spec section. Include assumptions that are really technical decisions. Do not propose changes.
```

Choosing the files is part of context-engineering. "Do not propose changes" stops it designing too early. Each item it lists is a candidate ADR, and anything it misreads about the conventions is a candidate rule.

### Step 2: decide each flagged item

**Options without a verdict:**

```
The spec stores dueDate as a YYYY-MM-DD string instead of a Timestamp. Give 2-3 options for storing a date-only due date in Firestore, with trade-offs for time-zone correctness, sorting, querying and consistency with the schema conventions. Do not recommend one. End with the questions I need to answer to decide.
```

"Do not recommend one" keeps the decision with the human. A recommendation anchors the reader, especially a junior one, and turns the checkpoint into a rubber stamp.

**Consistency check:**

```
#file:docs/specs/create-task.md Do any decisions, assumptions or out-of-scope notes contradict each other? Quote both sides of each conflict.
```

This is the prompt meant to catch the conflict between all writes going through the Server Action and the note that later tickets will relax the update rule. Conflicts go back to Planning as spec change requests.

### Step 3: record and carry it forward

**Rule derivation (context engineering):**

```
From #file:docs/adr/0002-task-writes-via-server-action.md, propose at most five rules for .github/instructions/tasks.instructions.md with applyTo: "frontend/src/features/tasks/**". Only include rules an agent could not infer from the code. Start each rule with what the agent must never do.
```

Its output, such as "never write to `tasks` with the Firestore client SDK", is loaded by every later agent session. "At most five" and "could not infer" keep the rules short and non-obvious.

**Rule conflict check (context engineering):**

```
Compare these proposed rules with #file:.github/copilot-instructions.md and the files in .github/instructions/. List any rule that duplicates, contradicts or overlaps an existing one.
```

Copilot defines no precedence between instruction files, so a conflicting rule makes the agent's behaviour unpredictable. This backs check (e) below.

### Writing context updates

The rule-derivation prompt produces a draft; this is how to judge it. Put feature rules in a scoped `.instructions.md` file, keep the reasoning in the ADR, and record any fact a convention requires in the document it names, such as `docs/FIRESTORE-SCHEMA.md`.

The tasks feature needs only three rules, because the project's conventions cover the rest:

```markdown
---
applyTo: "frontend/src/features/tasks/**"
---

# Tasks feature rules (from ADR-0001 to ADR-0003)

- Never convert `dueDate` to a Firestore Timestamp. Store it as a `YYYY-MM-DD` string or `null`. See docs/adr/0001-due-date-as-string.md.
- Never write to `tasks` with the Firestore client SDK; security rules deny it. Use the tasks Server Actions.
- Never sort tasks with Firestore `orderBy('dueDate')`; it puts null dates first. Sort in the client with the sort helper.
```

**Rules of thumb:**

- Only what the agent couldn't infer from the code.
- Lead with what never to do. A constraint is checkable against a diff in a way a positive instruction is not, so it is easier to review and easier to tell whether it was followed. Whether constraint-shaped rules also perform better is untested.
- One checkable behaviour per rule, so a reviewer can check a diff against it.
- Scope it with `applyTo` and keep files short. Short files cost less on every request and are easier to review.
- No duplicates or contradictions. Copilot has no precedence order between instruction files.
- Change rules with the decision. When an ADR is superseded, update its rules in the same PR.

**Before merging, check two things:**

- **It loads.** Open a file the `applyTo` pattern matches and confirm the rule is in context, for example with `/context` on the CLI.
- **It changes behaviour.** Give the agent a small task the rule should affect, such as "add a due date filter to the task list", with and without the rule. No published method exists for evaluating whether a rule file works. Jiang and Nam note that rule content is based on developer intuition and that its impact on model performance is an open question, so this comparison, not the rules of thumb, is what shows a rule is working.

## What to verify before accepting output

Checklist:

- (a) Can a named human defend every decision without deferring to the AI?
- (b) Does every decision trace to the approved spec or a documented convention, and does every item flagged in step 1 end as an ADR, an explicit "follows convention", or a spec change request?
- (c) Are the rejected options real and fairly stated? Check library, API and package claims against official docs and the package registry, not against the model.
- (d) Does each ADR still satisfy the spec's acceptance criteria? If a decision changes what a criterion means, raise a spec change request rather than editing the spec.
- (e) Do new rules conflict with existing instruction files, and is each one something the agent couldn't infer from the code?
- (f) Are secrets, internal hostnames and PII absent from ADRs, specs and instruction files?

Ensure you check (e) carefully. Copilot doesn't define a precedence order between its instruction files, and GitHub's own guidance is to avoid conflicting instructions. When two rules disagree, you can't predict which one the agent follows.

## Governance and security touchpoints

- (i) **Context files are an attack surface.** Instruction files, prompt files, custom agents and skills are loaded straight into the model's context. A malicious or careless edit is a route for prompt injection. Put them under `CODEOWNERS` like code.
- (ii) **Third-party skills, agents and MCP servers are dependencies.** Those with write or shell tools also carry excessive-agency risk. Adding one at design time is a supply-chain decision.
- (iii) **Secrets in design artifacts.** ADRs, specs and instruction files are committed and loaded into agent sessions (LLM02 Sensitive Information Disclosure).
- (iv) **Security-relevant decisions.** An ADR that touches authentication, authorisation, data residency or personal data needs a second, security-aware reviewer before it is accepted.

## How authorship is recorded

Attribution is recorded at commit time. Accountability is recorded at review and merge. Both sit in the governance band that runs under every phase, so this section covers only what design & context engineering is responsible for producing.

**Attribution.** Every commit containing AI-assisted content carries an `Assisted-by:` trailer naming the tool and model, following the Linux kernel convention:

```
Assisted-by: Copilot:gpt-5
```

Each ADR also carries front matter naming who decided and which tool helped draft it:

```
Status: Accepted
Decided-by: <name, role>
Drafted-with: Copilot:gpt-5
```

The front-matter fields are our convention, not an external standard. The AI may draft an ADR, but only the named decider can move it from Proposed to Accepted, and only through a reviewed PR.

**Accountability.** The committer adds `Signed-off-by:` certifying NBN's DCO; AI agents must not add it. `CODEOWNERS` names a human approver for two groups of paths:

- design artifacts: `docs/adr/`
- every agent-context path: `.github/copilot-instructions.md`, `AGENTS.md`, `.github/instructions/`, `.github/prompts/`, `.github/agents/` and `.github/skills/`

**Accountable person:** the named decider in the ADR for the decision itself, and the approver who merges it for the change to the repository.

See [white-paper/governance/](../governance/) for the full attribution and accountability treatment, including build-layer provenance (SLSA), sampling audits of approver sign-off, and organisational accountability under SOCI/CIRMP.

## In practice

A suggested sequence for adopting this phase. These are recommended defaults rather than settled requirements. Where an open question below is unresolved, treat the recommendation as a starting position for NBN to confirm.

- **Set up the decision record (week 1).** Add `docs/adr/` with a Nygard template, a Rationale section and the front-matter fields above. Apply `CODEOWNERS` to the design and agent-context paths.
- **Encode the design prompts (weeks 1-2).** Provide `*.prompt.md` files for the prompt patterns above, plus a read-only custom agent for design review with only read and search tools. Make the Plan agent, or `/plan` on the CLI, the default for design work so no files change during exploration.
- **Connect design to the readiness layer (weeks 2-3).** Each accepted ADR produces its context updates, written as described under Writing context updates and reviewed in the same PR as the ADR.
- **Test rules before scaling them (ongoing).** Run the same small task with and without a new rule. Compare the result, the token use and the review outcome before adding more. In Böckeler's words there are no unit tests for context engineering, so this comparison is the closest substitute.

## Metrics for success

- **Decision traceability (our metric):** the share of implementation PRs that link the ADRs and spec they were built against. This checks whether implementation work is actually built against the design.
- **Design-attributable rework (our metric):** PRs reworked because the design was missing or wrong, tagged in retros. This checks whether bad or missing design is causing problems later.
- **Context-file cost versus value.** Track tokens, runtime and success per agent task, with and without new rules. No published method exists for evaluating this, so only local measurement settles it. This checks whether your rules are worth what they cost.
- **Instruction freshness (our metric):** time since each rule was last checked against an accepted ADR. Context files grow through frequent small additions, so they drift unless someone prunes them. This checks whether rules have gone stale.

## How this differs by experience level

Evidence specific to design is thin, because the controlled studies measure coding tasks rather than design, so the guidance below is our inference.

**Juniors: anchoring risk.** A junior who asks for options before forming a view tends to adopt the AI's framing. Differentiated guidance:

- Write down your own option before prompting.
- Use AI to check the spec against the conventions and to explain trade-offs.
- Draft ADRs, but leave architecture-significant decisions to a senior or architect.

**Seniors: rubber-stamp risk.** The METR finding in the Implementation module shows experts misjudge their own AI-assisted work. The risk here is accepting a fluent, plausible ADR without checking its rejected options. Differentiated guidance:

- Own the `Decided-by` field.
- Use AI for breadth and adversarial review.
- Act as CODEOWNER for instruction-file changes.

The gate is the same for both. Experience changes who decides, not whether the checkpoint applies.

## What this stage does not cover

- Requirements, acceptance criteria and the assumptions table (Planning, approved at Gate 1)
- Writing production code (Implementation)
- Test strategy and QA (Testing)
- Security testing of the built change (Security Gate, after Implementation)
- Organisation-wide AI policy and tool approval (governance)

The design phase produces accepted decisions and the context that prepares the agent. It does not produce the spec, the code or the tests.

## Open questions

- **How are instruction files evaluated?** No accepted method exists yet. Assumption until NBN confirms otherwise: rules are reviewed but not tested. Sensible approach: the with/without comparison described under In practice, on a small sample of tasks. To verify this: Sprint 2 dogfooding on `garage-boilerplate` should show whether rules measurably change outcomes.

## Key takeaways

- **Design sets the standard.** Implementation and Testing verify against what this phase decides, which is why the checkpoint here is Human-Decision oriented.
- **AI can explore, draft and critique, but not decide.** The named human in the ADR owns the choice, and early evidence suggests agents are weakest at exactly these choices.
- **Design now prepares the AI.** Accepted decisions become short, scoped instruction rules that every later agent session loads. This is where context engineering meets the design phase.
- **Less context is often better.** Keep only rules the agent couldn't infer from the code, and measure whether they help. More context adds cost without reliably improving results.
- **Context files are code.** Review them under `CODEOWNERS`, keep secrets out, and treat third-party skills and MCP servers as supply-chain dependencies.

**Research behind this module:** [research/modules/design-and-context-engineering.md](../../research/modules/design-and-context-engineering.md)
