# Evidence — Module 2: Design and Context Engineering

| | |
|---|---|
| Pilot feature | Task CRUD on the Simple Task Dashboard |
| Module followed | `white-paper/modules/design-and-context-engineering.md` |
| **Done by** | William Lor (dev) |
| **Tested by** | Sajad Ali Akbari (Developer) |
| Dates | Do: 27 Sep 2026 · Test: 27 Sep 2026 |
| Planner card | [Mock evidence] - Do part A mock evidence for 'Design and Context Engineering' and tailor back the module : 120 |

*Input: the Planning output `task-crud-spec.md` (617 lines, 11 decisions, 16 conventions, 45 assumptions, 19 acceptance criteria). The mock project uses Claude Code (`CLAUDE.md`, `.claude/rules/`, `.claude/skills/`), not Copilot, so the module's Copilot-specific steps were adapted. Each adaptation is recorded below.*

---

## Part A — DO (William)

### A1. Steps followed

| Module step | What I did | Followed as written? | If not, why |
|---|---|---|---|
| 1 Check the spec against the conventions | The AI read the spec, both `CLAUDE.md` files, `FIRESTORE-SCHEMA.md`, `SECURITY.md` and `firestore.rules`, and searched the codebase for each pattern. It listed 8 items that depart from or extend a convention, with no proposals. | Partly | The module's prompt uses Copilot `#file:` syntax and file paths that don't exist here (`docs/specs/create-task.md`), so the prompt was adapted. The worked example expects 3 items; this run found 8 (A4). |
| 2 Decide each flagged item | I decided all 8. Two (#1 `dueDate`, #3 sorting) I decided straight away, without asking for options. For the other six I asked for options first. For #6 I also asked where the item came from and what `idSchema` covers, and asked "would (b) be more maintainable?" | Partly | The module tells juniors to write their own option before prompting. I did that for 2 of 8 items. For the rest I read the AI's options first, which is the anchoring risk the module warns about. |
| 2 Decision outcome: #1 | I first chose a Timestamp with a time. The AI flagged that this contradicts D5 (a product-owner decision), so it became a spec change request (SCR-1). I then withdrew SCR-1, because the product owner may want to keep due dates simple. | Yes | The module routed the disagreement correctly. The item ends as "decided in Planning (D5)", which is not one of the outcomes checklist (b) lists. |
| 2 Consistency check | Ran it on the spec. It found 4 conflicts. I raised 3 as SCRs (SCR-2, -3, -4) and dismissed 1 as intentional (the difference between how edits and status toggles handle a save with no changes). | Yes | |
| 3 Record: ADRs | The AI drafted 7 ADRs in `docs/adr/`. All are Status Proposed, Decided-by William Lor, Drafted-with Claude Code:claude-opus-5-5. | Yes | ADR-0003's rejected options were drafted after I had decided, not presented to me beforehand. |
| 3 Record: rule derivation | The AI proposed 8 candidate rules and ranked them. I kept R1–R5 (all "Never…"). | Partly | The rules went in `.claude/rules/tasks.md` with `paths:`, not in `.github/instructions/*.instructions.md` with `applyTo`, because the tool is Claude Code. The prompt also exposed that R1 is broken by editing `firebase/firestore.rules`, which is outside the feature folder, so I widened the scope to include that file. |
| 3 Rule conflict check | I ran it against root and frontend `CLAUDE.md`, `frontend/AGENTS.md`, `.claude/rules/`, and the skills and agents that touch Firestore. It found that the `/firebase-collection` skill directly contradicts R1: it opens client writes and allows hard delete. R4 also overlaps the soft-delete wording in `CLAUDE.md` and `security-reviewer`. | Partly | The module's prompt only compares against instruction files. The real conflict was in a **skill**. |
| 3 Fix an existing context file | I fixed the skill's rules template to use soft delete and `notDeleted()`, as a Design change in this feature's design work. It still opens client create and update, so ADR-0001 records the remaining conflict. | No | The module doesn't say what to do when Design finds an existing context file is wrong. It isn't a spec problem, so an SCR doesn't fit. |
| Writing context updates: doc entries | Added the `tasks` section to `docs/FIRESTORE-SCHEMA.md`, including the note on why `dueDate` is a string. | Yes | This creates doc/code drift until Implementation lands, because the schema doc describes a collection that doesn't exist yet. The spec's definition of done puts this entry in Implementation. |
| Before merging: it loads | Two fresh sessions each read `firebase/firestore.rules`. Both named `.claude/rules/tasks.md` and quoted ADR content they weren't asked for. `/context` in this client shows only categories, and **Memory files did not change** after the read. The second session was also started from the capstone root, not the mock project. | Partly | Inconclusive. The behavioural signs suggest the agent saw the rule, but the tool didn't confirm that `paths:` scoping triggered it, and the agent may have read the file itself. |
| Before merging: it changes behaviour | Not run. | No | Skipped by choice to save cost. The fresh sessions above did show something useful: both **misread R4** (A4). |
| Checklist (a)–(f) | See A4. | Partly | (c) is only partly met: four technical claims were not verified. |
| Design review PR | Not opened. | No | Out of scope for this run. The ADRs stay Proposed until it is opened. |

### A2. AI log

Run in Claude Code (Opus 5.5) from the capstone repo, working in `mock-project part-A(Do)/garage-boilerplate-basic-main`.

| # | Prompt (short) | AI output (link) | What I checked | Result | Why |
|---|---|---|---|---|---|
| 1 | Step 1: list every item that departs from or extends a convention, citing both sides, no proposals | 8 items with spec and convention citations | Each citation against the source files | Modified | All 8 were real. The first version said it was "not known" whether `idSchema` rejects `/`. When I asked, it checked `common.ts:3` and confirmed it doesn't. |
| 2 | Decision #1: I chose Timestamp with time | Flagged that this contradicts D5, a product-owner decision, and routed it as SCR-1 instead of changing the design | Whether D5 really said date-only | Accepted | It correctly refused to let Design overrule Planning. I later withdrew the SCR. |
| 3 | Options for #2 (how task writes reach Firestore): 2–3 options, no recommendation, end with questions | 3 options and 4 questions | Whether each option was real. I asked what "second layer" meant | Accepted | Chose A (deny all client writes). I judged a second layer unnecessary at this scope. |
| 4 | Options for #5 (ownership check) | 3 options plus a sub-question: shared helper or inline | Option C relied on a `lastUpdateTime` precondition. I declined the SDK check, so it's marked unverified | Accepted | Chose the transaction with one shared helper, for data integrity. |
| 5 | Options for #4, #6, #7, #8; explain #6; "would (b) be more maintainable?" | Short options. For #6: where it came from, the difference between `taskId` and `uid`, and maintainability trade-offs both ways with no verdict | That #6 traced to spec line 437, AC17 and A37 | Accepted | Picked a, a, a, a. For #8 I gave both reasons (simpler, and no information leak). |
| 6 | Consistency check: do any decisions or assumptions contradict? Quote both sides | 4 conflicts, each with line references | Each quote against the spec | Modified | 3 raised as SCRs. The A32 vs A44 difference I judged intentional and dismissed. |
| 7 | Draft ADRs for each decision | 7 ADRs in `docs/adr/` | Decider, rejected options, consequences, spec references | Accepted | Kept as Proposed pending review. ADRs 0001, 0002, 0006 and 0007 are marked as needing a security-aware reviewer. |
| 8 | Rule derivation: at most 5 rules, not inferable, start with "never" | 8 candidates, ranked. Flagged that `paths:` scoping misses `firestore.rules` | Whether each rule is inferable from code | Modified | Kept R1–R5 and cut R6–R8. Widened the scope to include `firebase/firestore.rules`. |
| 9 | Rule conflict check against existing context files | Skill contradiction (client writes, hard delete) and R4 overlap | Read the skill and `security-reviewer` | Accepted | Led to the skill fix and a note in ADR-0001. |
| 10 | *(fresh session)* "read firebase/firestore.rules" | Summary that named `tasks.md` and ADR-0001/0004. Said "a read rule that requires `deletedAt == null` hasn't been added yet" | Against R4 and the spec's Security rules | Rejected | Misread R4: R4 is about the query filter, not the read rule. |
| 11 | *(fresh session, capstone root)* same request | Proposed that the tasks read rule require `resource.data.deletedAt == null` instead of `notDeleted()`, "matching ADR-0004" | Against ADR-0004 and the spec | Rejected | A second, worse misread of R4: it proposed changing a security rule. An Implementation agent would likely have acted on it. R4 was reworded as a result. Whether the underlying query-proof question is valid is logged as an open question. |

**Totals:** 6 accepted, 3 modified, 2 rejected.

### A3. Metrics

| Time (min) | Tokens / cost | AI accepted | AI modified | AI rejected |
|---|---|---|---|---|
| ~90 (estimated) | 61.7k output · 5.03m cache read · 138k cache write · 86 uncached input (43 API responses) · $ not available | 6 | 3 | 2 |

Notes on the cost:

- **The token counts come from this session's local Claude Code log.** They were added up per API response, with each response counted once. They cover the main session up to the evidence write-up. The two fresh "it loads" sessions (A2 rows 10–11) ran separately and are **not** included.
- **There is no dollar figure.** This run used a subscription plan. `/usage` there shows only plan-wide percentages, so cost cannot be isolated for one session. The Planning evidence could report dollars; this module cannot on the same terms. Tracking cost this way depends on the account type.
- **Almost all input was served from cache.** There were 5.03m cache-read tokens against 138k written. As in the Planning run, the expensive part is loading context: the spec, conventions and docs are reread on every turn of a long, interactive Design session.

### A4. Output

Link to the artifacts (all under `mock-project part-A(Do)/garage-boilerplate-basic-main/`):

- ADRs: `docs/adr/0001-task-writes-via-server-actions.md` to `docs/adr/0007-task-id-schema.md` (7 files)
- Spec change requests: `task-crud-spec-change-requests.md` (SCR-1 withdrawn; SCR-2, SCR-3 and SCR-4 open; one dismissed)
- Rules: `.claude/rules/tasks.md` (5 rules; `paths:` covers `frontend/src/features/tasks/**` and `firebase/firestore.rules`)
- Doc entry: `docs/FIRESTORE-SCHEMA.md`, the `tasks` section
- Skill fix: `.claude/skills/firebase-collection.md`, where the owner-only rules template now uses soft delete and `notDeleted()`

**Step 1 outcomes (checklist b):**

| # | Item | Outcome |
|---|---|---|
| 1 | `dueDate` as a `YYYY-MM-DD` string | Decided in Planning (D5). SCR-1 raised, then withdrawn |
| 2 | All writes through Server Actions; rules deny client writes | ADR-0001 |
| 3 | Sort in the client | ADR-0003 |
| 4 | `deletedAt: null` required from create | ADR-0004 |
| 5 | Transactional ownership check through a shared helper | ADR-0002 |
| 6 | `taskId` rejects `/` | ADR-0007 (tasks-only schema) |
| 7 | Optimistic toggle with a target status | ADR-0005 (depends on SCR-4) |
| 8 | One "Task not found." error | ADR-0006 |

**Checklist (a)–(f):**

- (a) **Yes.** Each ADR records my own reason. Where I asked the AI to explain something (the second layer, `idSchema`, maintainability), the decision still came from my answer, not from a recommendation.
- (b) **Yes, with a gap in the module.** All 8 items have an outcome. #1 is "decided in Planning", which the checklist's three outcomes don't include.
- (c) **Partly.** These claims were not verified in this run:
  - the `lastUpdateTime` precondition (ADR-0002, a rejected option);
  - that a disabled input loses focus (SCR-4, ADR-0005);
  - that Firestore orders `null` first and that a composite index would be needed (ADR-0003);
  - whether `notDeleted()` lets the `deletedAt == null` query pass (A2 row 11).
- (d) **Yes, except ADR-0005,** which needs SCR-4 accepted to match A42 and AC18.
- (e) **Partly.** One real conflict was found in a skill and partly fixed. R4 overlaps the soft-delete wording in `CLAUDE.md`. Each rule was checked as not inferable, but R4 was still misread twice.
- (f) **Yes.** There are no secrets, hostnames or PII in the ADRs, the SCRs, the rules or the schema entry.

**Main findings:**

1. **The module is written for Copilot only.** `#file:`, `.github/instructions/*.instructions.md`, `applyTo`, and "Copilot has no precedence order" all needed translating. The Claude Code equivalents are `.claude/rules/*.md` with `paths:`, `CLAUDE.md`, and skills.
2. **The worked example is out of date.** It predicts 3 flags; this run found 8. The conflict it uses as the example ("later tickets will relax the update rule") no longer exists, because the CRUD spec settled it in A24.
3. **Path scoping misses rules that are broken outside the feature folder.** R1 ("never open a write rule") is broken by editing `firebase/firestore.rules`. Scoping it to the tasks folder alone would never have loaded it there. Widening the scope loads R2–R5 as noise whenever any rule is edited.
4. **The rule conflict check has to cover skills and agents, not only instruction files.** The only real contradiction was in the `/firebase-collection` skill. Its template allowed hard delete, which is pre-existing drift from the project's own `SECURITY.md`. The module has no guidance for fixing a context file that is already wrong.
5. **A fresh-session probe found more than the load check.** `/context` in this client shows only categories, so the load check was inconclusive. But asking two fresh sessions to read a file in scope showed both misreading R4 as a security-rule instruction. The second proposed changing the read rule. A rule that passed "one checkable behaviour" and "not inferable" was still ambiguous, and only a probe found it. This is a cheap stand-in for the module's with/without comparison.
6. **The route for disagreeing with Planning works.** My first choice for #1 overruled a product-owner decision. The module's rule (a changed criterion goes back as an SCR) caught it before it became an ADR.
7. **Anchoring happened as the module predicts.** I formed my own view first on only 2 of 8 items.
8. **Doing doc entries in Design creates drift.** The schema doc now describes a collection with no code. The spec's definition of done places it in Implementation.

---

## Part B: TEST (Sajad)

### B1. What I tested and how

I ran the module again myself, in the clean copy in `mock-project part-B(Test)/`, without reading William's evidence, ADRs or rules until my run was finished. My input is different from Part A on purpose: I used my own spec, `mock-project part-B(Test)/task-crud-spec.md`, which passed Gate 1 on 27 Sep. Ujjawal's spec (William's input) already makes technical decisions such as Server Actions, the data model and the security rules, while mine stays at "what and why", which is what the planning module asks for. So this Part B tests how the module behaves, not whether I get the same ADRs as William.

I used the current module (commit de584e6, not yet updated from Part A) in Claude Code (Opus 5.5). Where the module only works for Copilot or gives no prompt, I translated it and recorded the gap. Everything I produced is in `mock-project part-B(Test)/design-and-context-engineering/`, `docs/adr/`, `.claude/rules/tasks.md` and the doc and skill changes listed below.

**Who made the decisions.** From the step 1 sort onwards, the human decisions in this run (the sort, the step 2 decisions, the spec change request answers and the rule review) were made by an AI assistant (Claude, in Cowork) acting for me, at my request, and are recorded as mine. The module says the step 2 decision "cannot be delegated". I delegated it anyway, and I record that here because it is itself a finding: nothing in the module stops the Human-Decision checkpoint being handed to an AI when time is short.

#### Steps followed

| Module step | What I did | Followed as written? | If not, why |
|---|---|---|---|
| Setup | Fresh Claude Code session in the Part B folder, plan mode for steps 1 and 2. | Partly | The module's "In practice" section says to set up `docs/adr/` and `CODEOWNERS` first. Neither exists in the mock project. `docs/adr/` was created in step 3; `CODEOWNERS` was skipped. |
| 1 Check the spec against the conventions | Gave the AI the spec, the three `CLAUDE.md` files and four docs, and asked for every departure or extension, no proposals. Saved the list to `design-step1-findings.md`. | Partly | The prompt uses Copilot's `#file:` syntax and a path that doesn't exist, so I translated it. The module doesn't say which files to include, or where a read-only step's output should be kept. |
| 1b Sort the items | Sorted the 27 items into 6 ADRs, 6 spec change requests, 1 context fix and 6 with no new decision (`design-step1-sort.md`). | No | Not a module step. With 27 items, taking each one through step 2 wasn't realistic, so I grouped them. I also needed two outcomes the module doesn't list: "decided in Planning" and "context fix". |
| 2 Decide each flagged item | Wrote "my view before asking" for all six ADRs first (`design-notes.md`), then got 2 to 3 options for each with no recommendation (`step2-options.md`), then decided. | Partly | The module's options prompt is written for one specific item, so I made it general. All six were asked in one prompt, not one at a time. The decisions were made by an AI assistant acting for me (see above). |
| 2 Spec change requests | Raised 18 (`task-crud-spec-change-requests.md`): 6 from step 1, 11 from the consistency check, 1 from ADR-A. All answered by the Gate 1 owner and applied to the spec. | Yes | The module has no format for a spec change request, so I made one. The Gate 1 owner is also the tester, so the same person raised and answered them. |
| 2 Consistency check | Ran the module's prompt word for word (`step2-consistency-check.md`). | Yes | |
| 3 Draft ADRs | Six ADRs in `docs/adr/`, each with decider, rejected options and consequences. | Partly | The module lists what an ADR needs but gives no prompt for drafting one, so I wrote it. |
| 3 Rule derivation | The AI proposed five rules (`step3-rules-draft.md`), I cut and reworded them (`step3-rules-review.md`), and wrote `.claude/rules/tasks.md`. | Partly | Translated from Copilot's `.github/instructions/*.instructions.md` with `applyTo` to Claude Code's `.claude/rules/` with `paths:`. |
| 3 Rule conflict check | Ran the module's prompt, translated (`step3-conflict-check.md`). | Partly | Translated from Copilot's instruction files to the `CLAUDE.md` files, `AGENTS.md` and `.claude/rules/`. |
| 3 Doc entries | Added the `tasks` section to `docs/FIRESTORE-SCHEMA.md` and the erasure exception to `docs/SECURITY.md`, and fixed the `/firebase-collection` skill template. | Partly | The module has no prompt for this, and no guidance for fixing a context file that is already wrong. |
| Before merging: it loads | Fresh session read `firebase/firestore.rules` and listed what it was following (`step3-load-check.md`). | Partly | The module's example (`/context`, open a file the pattern matches) assumes task files exist. They don't until Implementation, so I used `firestore.rules`, which is in the rule's `paths`. |
| Before merging: it changes behaviour | Same planning task in two fresh sessions, with and without the rule (`step3-behaviour-with-rule.md`, `step3-behaviour-without-rule.md`, compared in `step3-checks-summary.md`). | Partly | The module doesn't say what task to use. With no task code yet, I had to use a planning task. |
| Checklist (a) to (f) | Answered in `step3-checks-summary.md`. | Yes | |
| Design review PR | Not opened yet. | No | Waiting for me to review the decisions (checklist a). |

#### AI log

| # | Prompt (short) | AI output | What I checked | Result | Why |
|---|---|---|---|---|---|
| 1 | Step 1: read the spec and 7 convention files, list every departure or extension, no proposals (plan mode) | 27 items: 6 departures, 9 extensions, 12 assumptions that are really technical decisions | 15 of the citations against the real files | Modified | Almost all citations were right. It found by itself that the `/firebase-collection` skill template allows hard delete, against `SECURITY.md`. One overstatement: it said `SECURITY.md` allows the admin key in Actions "only for build and test", which the file doesn't say. One line number was off. |
| 2 | Save the step 1 list to a file | `design-step1-findings.md` | That it matched the plan-mode output | Accepted | |
| 3 | Create the spec change request file from the sort | `task-crud-spec-change-requests.md`, SCR-1 to SCR-6, each with quotes, the problem and a question | Each quote against the spec | Accepted | Clear and well quoted. It even ran Node to check the whitespace claim in SCR-4. |
| 4 | Options for ADR-A to ADR-F, no recommendation | 2 to 3 options each, with "already settled" facts, claims marked verified or unverified, and questions to decide | That the options were real and fairly stated, and the claims marked honestly | Accepted | Strong. It disclosed that it had read my "view first" notes while drafting, so the options could have leaned towards my views. |
| 5 | Consistency check (module prompt) | 11 new conflicts and 2 already raised | Each quote against the spec | Accepted | Several conflicts were caused by the Gate 1 edits made the same day, which changed A6, A10 and A21 without updating every reference. The check caught what the human edit missed. All became SCR-7 to SCR-17. |
| 6 | Apply SCR-1 to SCR-18 to the spec | Spec amended, with a "Changes after Gate 1" table | That no out-of-date values were left | Accepted | |
| 7 | Draft the six ADRs, using only the reasons in my notes, with four platform claims marked verified | `docs/adr/0001` to `0006` | Decider, rejected options, costs, security review flag | Accepted | Each rejected option is stated fairly. It pointed out where my notes' reason didn't apply to an option (ADR-0001, option A3) instead of stretching it. |
| 8 | Mark "rules are not filters" as verified in two ADRs | Updated ADR-0002 and ADR-0004 | The quote against Firebase's docs | Accepted | |
| 9 | Rule derivation (module prompt, translated) | Five rules with a "why it can't be inferred" table, plus a first conflict check it wasn't asked for | Each rule against the rules of thumb | Modified | Three rules bundled several behaviours; I narrowed them. It also warned the module says rules come from accepted ADRs, and these are still Proposed. |
| 10 | Rule conflict check (module prompt, translated) | 4 contradictions, 7 overlaps | Each against the files | Accepted | The worst one is indirect: `CLAUDE.md` sends agents to the tutorial walkthrough, whose notes rules let the browser write. |
| 11 | Doc entries and the skill fix | Schema section, `SECURITY.md` exception, skill template fixed | The diffs | Accepted | |
| 12 | Load check (fresh session) | The rules file loaded when `firestore.rules` was read, not before | Against what the rules file says | Accepted | Also found that the project's 16 skills and 3 MCP servers never load, and that two `CLAUDE.md` files disagree on branch names. |
| 13 | Behaviour check with the rule (fresh session) | A plan that followed every rule and cited it, and said filtering is out of scope | Which rule shaped each choice | Accepted | Found that rule 4's wording was narrower than its reason, and that ADR-0004 misread how `useCollection()` restarts. Both fixed. |
| 14 | Behaviour check without the rule (fresh session) | A plan with the same constraints | Against run 13 | Accepted | Same behaviour, because it read the ADRs instead. See step 3 notes. |

#### Step 1 notes

1. **27 items is far more than the module expects.** The worked example says step 1 "should flag three items". This is the planning module's "too many markers" problem again: the module says what to do with a few items and nothing about a long list.
2. **The biggest items were the real design questions.** The erasure job breaking "Soft-delete only", and the fact that a scheduled job has no guarded route to the data.
3. **It found a broken context file without being asked,** from careful reading rather than from the method.

#### Step 2 notes

1. **The options were the best output of the run.** Each ADR had settled facts, 2 to 3 real options, verified and unverified claims marked, and questions to decide.
2. **My view held on 3 of 6 decisions, changed partly on 1 and changed on 2.** Each change came from the options showing a cost or a spec conflict: cursor paging breaks AC-4.11a, and one error field is enough without changing a shared type.
3. **Anchoring can run both ways.** The AI read my "view first" notes before drafting the options. The module only warns about the AI anchoring the human.
4. **The consistency check earned its place.** It found 11 conflicts, and several came from a human's own Gate 1 edits the same day.
5. **Design fed back into Planning 18 times.** The spec change request route works, but with the tester as Gate 1 owner, nobody independent approves the changes.
6. **Checking the platform docs changed a decision.** Vercel doesn't retry failed scheduled jobs, so the erasure window went from 48 to 72 hours (SCR-18).

#### Step 3 notes

1. **The rule loads only when it's needed.** Path scoping works in Claude Code, but only the rule text loads, not the ADRs it points to.
2. **The with and without comparison showed no difference on this task.** Without the rule, the agent read the six ADRs and reached the same plan. The rules probably save the agent from reading six ADRs, but neither run recorded its cost, so that is unproven. The comparison needs task code to exist and a task where the ADRs aren't the obvious next read, so it fits better after Implementation.
3. **Fresh sessions found real mistakes.** Rule 4 was worded too narrowly, and ADR-0004 misread the live-list hook. The module's checks are about whether rules load and change behaviour; a fresh session asked to plan something is a cheap way to find wrong rules and wrong ADRs too.
4. **The project's own setup is broken in ways no step checks.** Skills and MCP servers are in the wrong format and never load. The module's governance section says skills are an attack surface, but nothing checks that they load at all.
5. **The conflict check has to look past the listed files.** The worst conflict came through a doc that `CLAUDE.md` points to.

#### Metrics

| Time | Tokens / cost | AI accepted | AI modified | AI rejected |
|---|---|---|---|---|
| Main design session: 49m 33s of AI time in 2h 59m 35s wall clock, on 27 Sep, plus the load check and two behaviour-check sessions. | Main session: 317.0k output, 30.8m cache read, 507.5k cache write, **$16.57**. 80% of usage was above 150k context. The other sessions didn't record their cost. | 12 | 2 | 0 |

### B2. Test results

Different input from Part A, so this compares how the module behaved, not the outputs one by one.

| # | Check | Part A (William) | Part B (me) | Notes |
|---|---|---|---|---|
| 1 | Items flagged in step 1 | 8 | 27 | The module's example says 3. Both runs found more; mine far more, because my spec left the "how" to Design, as Planning asks. |
| 2 | Wrong citations in step 1 | 0 real problems (one "not known" that it checked when asked) | 1 overstatement, 1 wrong line number | Step 1 is reliable at citing files. |
| 3 | "My view first" before options | 2 of 8 | 6 of 6, but written by an AI acting for me | The safeguard only works if it's a step. When it was a step (my notes file), it was done every time. |
| 4 | Spec change requests | 4 raised (1 withdrawn) | 18 raised, all answered and applied | Both runs used the route. Mine found more because my spec was less settled, and because the consistency check caught edits from Gate 1. |
| 5 | Found the `/firebase-collection` skill conflict | Yes, in the rule conflict check | Yes, already in step 1 | Found independently by both runs. Both fixed the skill. |
| 6 | Rules written | 5 | 5 | |
| 7 | Rule misread by a fresh session | Yes, R4 misread twice, once proposing a security-rule change | No misread. But rule 4 was worded narrower than its reason | Both runs found a problem with a rule only through a fresh session, not through the rules of thumb. |
| 8 | "It loads" check | Inconclusive (`/context` showed only categories) | Yes, the rule loaded when a matching file was read | Using a real file in the rule's `paths` works as a load check. |
| 9 | "It changes behaviour" check | Skipped to save cost | Run, no difference, because the agent read the ADRs | Neither run could show the rules change behaviour. |
| 10 | Copilot-only module | Yes, translated throughout | Yes, translated throughout | Confirms Part A finding 1. |
| 11 | Human decision delegated | No | Yes, to an AI assistant at my request | The module can't detect or prevent this. |
| 12 | Cost | Tokens only, no dollar figure (subscription) | $16.57 for the main session, 49m 33s of AI time | More than the planning run ($12.80). Most of it came from one long session: 80% of usage was above 150k context. The module's cost metric should say to start a fresh session per step. |

**What I would change in the module** (my input for Part C):

1. Make it tool-neutral: give the Claude Code equivalent next to every Copilot step (`@path`, `.claude/rules/` with `paths:`, `CLAUDE.md`). Agrees with Part A change 1.
2. Add a sorting step after step 1 for long lists, with five outcomes: ADR, follows convention, spec change request, decided in Planning, context fix.
3. Make "write your own view first" a step with a file to write in, and say the AI must not read that file before giving options.
4. Add a prompt for drafting ADRs, one for doc entries, and a format for spec change requests.
5. Say that Design edits to the spec go through the Gate 1 owner, and that someone other than the tester should approve them.
6. Add a fresh-session probe to "Before merging": ask a new session to plan a small change and see which rules and ADRs it follows or misreads. Agrees with Part A change 6.
7. Move the with and without comparison to after Implementation, when there is code to change, or say how to keep the ADRs out of reach during it.
8. Add a check that the project's context files actually load (skills, MCP servers, nested `CLAUDE.md` files).
9. Check platform claims against official docs before an ADR can be Accepted. In this run it changed a decision (Vercel doesn't retry). Agrees with Part A change 9.
10. Say plainly that the Human-Decision checkpoint can be delegated in practice, and ask the evidence to record who actually decided.

### B3. Sign-off

- [x] I did not do Part A.
- [x] Result: **Pass with changes**. The module worked when a second person followed it on a different spec, and its checks found real problems. But it only works for Copilot as written, 11 of the 14 rows in my steps table needed something it doesn't give, and its Human-Decision checkpoint was delegated without anything stopping it.
- Signed: Sajad Ali Akbari, 27 Sep 2026. The six decisions in `design-notes.md` were reviewed and confirmed by the same AI assistant that made them, acting for me at my request, not by me directly. So checklist (a) is recorded as not met (`step3-checks-summary.md`).

---

## Part C — Verdict on the module (both agree)

*Draft from Part A. To be confirmed with the tester.*

| Claim | Supported / Partly / Not supported | Evidence (row above) |
|---|---|---|
| C1 Step 1 finds what needs deciding | Supported (provisional) | A2 row 1: 8 real items, all 8 with an outcome |
| C2 Options without a verdict keep the decision with the human | Partly | A2 rows 3–5. Decisions were mine, but I read options before forming a view on 6 of 8 (A1 step 2) |
| C3 The consistency check catches conflicts in the spec | Supported | A2 row 6: 4 conflicts, 3 raised as SCRs |
| C4 Rules limited to "not inferable, start with never" are clear to the agent | Partly | A2 rows 10–11: R4 misread twice |
| C5 The module works for the team's tool | Not supported | A1 steps 1 and 3, finding 1: Copilot-only |
| C6 The "it loads" check can be run | Partly | A1 "it loads": `/context` shows categories only |

### Biggest gaps in the methodology

These go beyond wording fixes to the module. Each is a place where the methodology has no working answer yet. They are ordered by how much they undermine the stage.

1. **There is no reliable way to know whether a rule works.** The module's check that a rule loads depends on the tool: `/context` in this client shows only categories. The with/without comparison is costly and was skipped. The only thing that caught a real problem was a fresh session misreading R4 (A2 rows 10–11), and that probe is not in the module. Rules can meet every rule of thumb and still mislead the agent.
2. **The methodology assumes one tool's context model.** Every context-engineering step is written for Copilot, and the team's tool is Claude Code. The two differ in rule files, how rules are scoped, skills, and which files are loaded when. A step that can't be run as written can't be gated.
3. **"Context" covers more than instruction files, and nobody owns the rest.** The only real conflict was in a skill (`/firebase-collection`), and it was pre-existing drift from `SECURITY.md`. The methodology gives Design no way to handle a context file that is already wrong. It isn't a spec problem, so an SCR doesn't fit, and it isn't a new rule either. So it gets fixed ad hoc or not at all.
4. **Nothing forces unverified technical claims to be checked.** Checklist (c) says to check claims against the docs, but no step or time is set aside for it. Four unverified claims ended up in Proposed ADRs and an SCR (A4, checklist c). A fluent ADR that rests on an unverified API claim is exactly the rubber-stamp risk the module warns about.
5. **The anchoring safeguard is advice, not a step.** "Write your own view first" was followed for 2 of 8 decisions. The checkpoint depends on it, but nothing in the workflow makes skipping it visible.
6. **Cost can't be measured on every account type.** On a subscription plan there is no per-session dollar figure, so the module's cost-versus-value metric can't be computed the same way across the team.
7. **The boundaries with Planning and Implementation are blurred.** Checklist (b) has no outcome for "already decided in Planning". The module says required doc entries belong to Design, while the spec says Implementation, and doing them in Design leaves the docs ahead of the code.

**Change needed in the module:**

1. **Make it tool-neutral.** Name the Claude Code equivalents next to the Copilot ones: `.claude/rules/*.md` with `paths:`, `@path`, and `CLAUDE.md`. Say that neither tool defines a precedence order between rule files and skills.
2. **Update the worked example.** Base it on the current CRUD spec, or say it describes the earlier create-only spec.
3. **Add a fourth outcome to checklist (b):** "already decided in Planning (cite the decision)". Say that it still needs the doc note the convention requires.
4. **Widen the rule conflict check** to skills, custom agents and prompt files. Add a line on what to do when Design finds an existing context file wrong: fix it in the design PR under `CODEOWNERS`, or raise it with the harness owner.
5. **Warn about path scoping.** A rule about security rules, config or schema files needs those files in its scope, or it never loads where it is broken.
6. **Add a fresh-session probe to "Before merging".** Open a new session, read a file in scope, ask it to summarise the constraints, and check for misreads. It is cheap, and in this run it found a problem the load check could not.
7. **Say where required doc entries belong,** in Design or Implementation. Doing them in Design leaves the docs ahead of the code.
8. **Make "write your own view first" a step, not advice.** For example, put a "My view" line in each step 2 prompt, so skipping it is visible.
9. **Add a verification step before an ADR can be Accepted.** Every library, API or platform claim in an ADR's context or rejected options is either marked "verified against <source>" or listed as unverified. An ADR with unverified claims stays Proposed.
10. **Qualify the cost metric by account type.** On API billing, record the dollar cost. On subscription plans, record tokens from the local session log, as in A3.

### Open questions this run did not settle

- Does `notDeleted()`, with its `'deletedAt' in resource.data` branch, let the `where('deletedAt', '==', null)` list query pass the rules? This is for the spec's manual rules check (Testing section).
- Do `paths:`-scoped rules load when a matching file is read, as expected? The Memory files count did not change, and the second session ran from the wrong folder.
- The unverified API and browser claims listed under checklist (c).
