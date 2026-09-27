# Evidence — Module 1: Planning and Spec Authoring

| | |
|---|---|
| Pilot feature | Task CRUD on the Simple Task Dashboard |
| Module followed | `white-paper/modules/planning-and-spec-authoring.md` |
| **Done by** | Ujjawal Mittal (BA/UX) |
| **Tested by** | Sajad Ali Akbari (Developer) |
| Dates | Do: 25 Sep 2026 · Test: 26 to 27 Sep 2026 |
| Planner card | [Mock evidence] — Do part A for 'planning and spec authoring' and tailor back the module |

*Prompts 1 and 2 were run against an earlier mock project (a service status API) before the team
replaced it with the Simple Task Dashboard. They are kept in the log because the findings are about
the method, not the feature.*

---

## Part A — DO (Ujjawal)

### A1. Steps followed

| Module step | What I did | Followed as written? | If not, why |
|---|---|---|---|
| 1 Load the context | Ran the first two prompts with no context at all — the mock project folder held only a readme. Loaded the project's `CLAUDE.md` and `docs/` at prompt 3. | Partly | The module assumes context already exists. On a new project it does not, so this step is really "create or find the context", which the module does not say. |
| 2 Ask for a first pass with markers | Gave the ticket and asked for acceptance criteria with `[NEEDS CLARIFICATION]` markers and no guessing. | Yes | |
| 3 Read what comes back | Read all 126 lines. Checked for invented requirements and untestable criteria. | Yes | |
| 4 Cut what it invented | Nothing was invented in the sense the module warns about. The problem was the opposite — 22 markers on the first ticket, 31 on the second. | Partly | The module has no guidance on what to do when there are too many markers. |
| 5 Take the questions to a person | No product owner exists for a mock project. I decided the six questions myself as BA, using the team's design mock-up to settle two of them. | Partly | The module assumes someone else answers. |
| 6 Run the checklist | Used the ISO 29148 characteristics. "Verifiable" caught three criteria that said "as specified" instead of stating behaviour. | Yes | The checklist earned its place here. |
| 7 Sign off | Not done. Part B is the sign-off and has not been assigned. | No | Blocked on Part B. |

### A2. AI log

Run in Claude Code (Opus 5.5) from inside the mock project folder.

| # | Prompt (short) | AI output | What I checked | Result | Why |
|---|---|---|---|---|---|
| 1 | Turn the ticket into acceptance criteria, mark anything unspecified, do not guess | 9 criteria, 22 markers | Every criterion against the 29148 checklist | Modified | No invented requirements — good. But 22 markers is more than anyone can act on, and AC5, AC7 and AC8 said "the response handles them as specified", which is not testable. |
| 2 | Cut to 7 markers, make reasonable decisions on the rest and list them as assumptions | 16 numbered assumptions, each listing the criteria depending on it | Whether the assumptions were reasonable | Modified | The assumptions table is a better pattern than markers alone. But it invented a 5-minute data freshness rule and a 2-second timeout — real engineering constraints presented as defaults. Telling the AI to assume rather than ask moved the guessing, it did not remove it. |
| 3 | Read `CLAUDE.md` and `docs/`, then say which of my assumptions the project already answers or contradicts | 11 answered, 8 contradicted, 7 not covered | The list against the source files | Accepted | The single most valuable prompt. See A4. |
| 4 | Rewrite using Server Actions; six answers to the open questions; add anything the conventions require | 275-line spec | Whether the contradictions were fixed and the missing requirements added | Accepted | Added the data model, implementation constraints, testing and definition-of-done sections that a blind spec had no way to know about. |
| 5 | Extend to full CRUD with soft delete | 449-line spec | The security reasoning | Accepted | Reversed its own earlier plan to relax the update rule, and explained why. See A4. |
| 6 | Add marking a task complete | 617-line spec | The new assumptions A40–A45 | Accepted | |

**Totals:** 4 accepted, 2 modified, 0 rejected.

### A3. Metrics

| Time (min) | Tokens / cost | AI accepted | AI modified | AI rejected |
|---|---|---|---|---|
| ~60 (estimated, not timed continuously) | 43.5k output · 1.6m cache read · **$1.86** | 4 | 2 | 0 |

Notes on the cost, since our module currently says this cannot be measured:

- The first spec, written with no context loaded, cost **$0.32**.
- The context-aware rewrite took it to **$1.54** — roughly five times as much, because reading the codebase and docs pulled a large amount of context through.
- Extending that to full CRUD and status toggling added only **$0.32** more, because 95% of the input was served from cache.

So the expensive part is loading context once. Extending an existing spec is cheap.

Claude Code reported 6m 26s of API time inside a 16m 19s session, inside roughly 60 minutes of my time. The AI did the writing; the deciding and reading took the rest.

### A4. Output

`mock-project part-A(Do)/garage-boilerplate-basic-main/task-crud-spec.md` — 617 lines.

**The main finding: what loading the project context actually changed.**

Prompts 1 and 2 produced a spec written blind. Prompt 3 checked it against the project's own `CLAUDE.md` and `docs/`. Of 23 assumptions, **8 were contradicted**, and one of those was architectural:

- The spec described HTTP status codes — 401, 400, 404. This project creates things through Server Actions, which never return HTTP status codes. Three acceptance criteria described behaviour that cannot exist in this codebase.
- `orderBy('dueDate')` silently omits documents with no due date, so tasks without one would have vanished from the list rather than sorting last.
- Storing the due date as a Firestore Timestamp would shift the date across midnight for users in some time zones.

It also found **five requirements the project mandates on every feature** that a blind spec had no way to know: `uid`, `createdAt`, `updatedAt` and `_schemaVersion` on every document; a collection added in four separate places; the Server Action pattern; loading, empty and error states; and the testing conventions.

**A second finding came from widening the scope.** When the spec was extended from create-only to full CRUD, the AI reversed a decision it had made earlier. The create-only draft said a later ticket would relax the Firestore update rule. On extending, it worked out that this would let a client bypass the Server Action's validation entirely — so the rule stays closed and the ownership checks move into the Server Actions, inside a transaction. That is a real security decision that only surfaced because the scope widened.

---

## Part B: TEST (Sajad)

### B1. What I tested and how

I ran the whole module again myself, on the same ticket, in the clean copy in `mock-project part-B(Test)/`. I did not read Ujjawal's spec or his AI log until my run was finished, so his results would not steer mine. I followed the updated module (commit 45ab05b): its eight steps from "Practical angle" and its prompts from "What to ask the AI". I used Claude Code (Opus 5.5), run from inside the project folder, the same tool Ujjawal used. Where the module did not give me a prompt or a decision, I filled the gap and wrote down what I did. Then I compared my result with Part A (B2).

My spec: `mock-project part-B(Test)/task-crud-spec.md`

#### Steps followed

| Module step | What I did | Followed as written? | If not, why |
|---|---|---|---|
| 1 Load the context | Context files already existed (`CLAUDE.md`, `frontend/CLAUDE.md`, `backend/CLAUDE.md`, `docs/`). I told the AI to read them in the same prompt as step 2. | Partly | The module has no prompt for this step, so I joined it to step 2. |
| 2 Ask for a first pass with markers | Gave the ticket and asked for acceptance criteria, with `[NEEDS CLARIFICATION]` for anything the ticket does not say, no guessing and no code. | Partly | The module's prompt says "and the current API response format". That is left over from the old service status example and does not fit this feature, so I swapped it for the project's context files. |
| 3 Read what comes back | Read the whole spec. Counted criteria and markers, checked every project rule it cited against the real files, and checked each criterion for testability and made-up rules. Then ran the module's "Push back on it" prompt. | Yes | |
| 4 Cut the markers down | Sorted the 25 markers with the module's rule (a question is blocking if you cannot write a testable criterion without the answer). Kept 6. The other 19 became assumptions. Then asked the AI which of its assumptions were weakest. | Partly | I drafted the blocking list with help from an AI assistant (Claude, outside the project) and then checked and agreed it myself, so it was not a purely human call. The module says to ask which assumptions are weakest but has no prompt for it, so I wrote one. |
| 5 Check the spec against the project | Ran the module's prompt word for word (check only, no rewrite). Then asked it to fix every contradiction, correct sources it had overstated, and add anything the project requires on every feature. | Partly | The module says "do not rewrite the spec yet" but never says when to rewrite, so I wrote that prompt myself. |
| 6 Take the questions to a person | I answered the 6 questions myself as product owner, because the feature was my idea. Three answers needed a second look before I gave them to the AI (see step 6 notes). | Partly | The module expects someone other than the spec writer to answer. Here the tester and the product owner are the same person, which takes away some of the independence Part B is meant to give. |
| 7 Run the checklist | Ran the module's checklist prompt, then asked it to fix what it flagged plus the problems I had found myself, and to list every assumption that adds a number or feature nobody asked for. | Partly | The module's prompt checks 4 of the 10 qualities in its own table and does not say who checks the other 6. There is also no spec template in the repo, so "conforming" cannot be checked. |
| 8 Sign off | Asked the AI to make sure the spec has every artifact the module lists and to add a sign-off line. | Partly | The sign-off line is there but not dated or signed yet, because 20 "additions to confirm" still need my decision as product owner. Signing before that would approve numbers nobody has agreed. |

#### AI log

| # | Prompt (short) | AI output | What I checked | Result | Why |
|---|---|---|---|---|---|
| 1 | Read the context files, turn the ticket into acceptance criteria, mark anything unspecified, do not guess, no code | 122 lines: 48 criteria in 9 sections, 25 markers, a ticket coverage table | Every criterion for testability and source, and every project rule it cited against the real files | Modified | Loading context first worked: no HTTP codes or other clashes with the architecture, and every project rule I checked was real. No made-up requirements. But 25 markers is too many to act on, and a few criteria needed fixing (step 3 notes). |
| 2 | "Push back on it" and "Cut the questions down" sent in one message | 168 lines: exactly 6 markers, 25 assumptions, test prerequisites, every criterion given a pass or fail result | Marker count, the assumptions table, every source, anything added beyond what I asked | Modified | It did what I asked and listed its own extra edits. But to make everything testable it filled gaps with numbers nobody asked for (step 4 notes). Sending two prompts in one message was my mistake: I cannot tell which prompt caused which change. |
| 3 | Which of your assumptions are weakest, and why? Do not change the spec | All 25 ranked (8 weak, 7 moderate, 10 strong), and it admitted 4 sources it had overstated | Its corrections against the code | Accepted | Worth running. Its weakest ones matched what I would challenge, and the corrections I checked were right: the project does have a pagination building block, and the notes list does lose line breaks. |
| 4 | Module prompt "Check my spec against the project", then fix contradictions, correct sources, add anything the project requires | 192 lines, 54 criteria plus 3 delivery requirements. Still 6 markers and 25 assumptions | The source of every new criterion, and whether anything changed that I had not asked for | Accepted | Found six requirements the project sets for every feature that were missing, fixed three contradictions, and labelled every assumption as Rule, Precedent, Ticket or Decision (step 5 notes). |
| 5 | My 6 product owner answers, with instructions to rewrite the affected criteria and flag any clash with project rules | Markers gone, a "Resolved questions" table (R1 to R6) with who answered, and a "Conflicts" section | Each answer against how it was applied, and the conflicts it raised | Accepted | It did not quietly pick a side. It flagged that my 30-day erasure clashes with the "Soft-delete only" rule and with the free-plan rule, and explained how the spec handles both (step 6 notes). |
| 6 | Module checklist prompt (necessary, unambiguous, singular, verifiable) | A list of criteria that failed, and which quality each failed on | Whether the failures were real | Accepted | The flags were fair. It caught repeated checks and design details written as requirements. |
| 7 | Fix everything flagged, plus my own list (wrong [Ticket] tags, a criterion citing another criterion as its source, mixed criteria), and list every added number or feature | 346 lines: criteria split so each states one rule, 38 assumptions, an "Additions to confirm" list of 20, and a "What was cut and why" table | The fixes I asked for, the new assumptions, and the cut list | Modified | All my fixes were made and the sources are now honest. But the spec keeps growing: 13 new assumptions, including more numbers nobody asked for (1,000 tasks for capacity, a 5-second clock tolerance, erasure within 24 hours). The cut table also says 29 open questions were raised when there were 25. |
| 8 | Check every artifact the module lists is there and add a sign-off line | Sign-off line added, nothing else changed | That all five artifacts are present | Accepted | Spec, assumptions table, resolved questions, cut record and sign-off line are all there. |

#### Step 3 notes: the first pass

1. **Loading context first changed the first pass.** Because the AI read the project docs in the first prompt, the spec cites real project rules in 11 places and stays at "what and why". It only mentions the notes feature's limits as a reference inside a question, instead of quietly copying them.
2. **Too many markers again.** 25 markers across 48 criteria, so about half the criteria were just a question. Part A hit the same problem (22 and 31), which backs up module change 1.
3. **Not testable.** AC-8.3 ("works on a phone-sized screen") did not say what "works" means or at what size. Fixed in prompt 2.
4. **Wrong sources.** Two criteria were tagged `[Ticket]` for things the ticket never says, and one cited another criterion as its "project" source. Fixed in prompt 7.
5. **Two rules under one ID.** Three criteria mixed a requirement and an open question. Fixed in prompt 7.

#### Step 4 notes: cutting markers and the assumptions table

1. **The filter rule works.** 6 of 25 markers survived (24%). The module says about a fifth survived in Part A. Four of my six are the same examples the module gives (required fields, date or date and time, past dates, starting status).
2. **The assumptions table works as the module says.** Every assumption lists the criteria that depend on it, and every criterion lists its assumptions.
3. **The module's warning came true.** To make everything testable, the AI added things nobody asked for: list updates within 3 seconds (the same kind of rule as Part A's made-up 2-second timeout), due dates up to the year 9999, screen widths of 320px and 1920px, and a delete confirmation step.
4. **New finding: "Push back on it" and "assume" pull the same way.** Asking for every criterion to be testable makes the AI fill every gap with a number, and those numbers show up as assumptions that look well thought out. The module lists these prompts separately and does not warn about using them together.
5. **"Which assumptions are weakest?" is worth a real prompt.** It found the same weak spots I did, plus two I had not checked. The module only mentions the idea.

#### Step 5 notes: checking against the project

1. **I was wrong about this step.** I expected it to find little, because context was loaded in the first prompt. It found six requirements the project sets for every feature (an expired session counts as signed out, field rules also apply to direct requests, unknown fields are refused, errors show no internal details, every record has a schema version, every record has created and updated times) plus three delivery requirements. Part A found five with a blind first pass. So loading context early narrows the gap but does not close it. The check is still needed as its own step.
2. **The Rule, Precedent, Ticket and Decision labels are worth adding to the module.** They show the difference between what the project requires and what the notes tutorial happens to do. Several of my "project conventions" turned out to be tutorial habits, not rules.
3. **This step changed a product behaviour.** Paging went from "no paging" to 20 per page because the project already has a pagination building block. The module does not say step 5 can overturn step 4, but it did.

#### Step 6 notes: answering as product owner

1. **One of my answers handed the decision back to the AI.** For "which fields are required" I first said "use your best judgement". The module says the AI must not make these calls, so I made the decision myself: title and due date required, description optional.
2. **Some answers created new questions.** "Move it to progress manually" could have meant a third status, which would change the ticket. I confirmed there is no third status. "Kept as a record for 30 days" meant deleted tasks get erased after 30 days, which the spec had ruled out. I confirmed the erasure is part of this ticket.
3. **The AI flagged real conflicts instead of picking a side.** My 30-day erasure breaks the project's "Soft-delete only" rule, and running anything on a schedule needs the paid Firebase plan, which breaks the "free-tier only" rule. The spec now records the erasure as a justified exception and adds delivery requirements for both. That is exactly the kind of decision this stage exists to catch, and it came from a product owner answer, not from the AI.

#### Step 7 and 8 notes: checklist and sign-off

1. **The checklist prompt was useful but the spec kept growing.** From 168 to 346 lines and from 25 to 38 assumptions. Each round of "make it testable" added more numbers. The AI did list all 20 of them under "Additions to confirm", which makes them easy to review, but the module has no guidance on when to stop adding.
2. **Sign-off is waiting on me.** The spec is complete, but I will not sign Gate 1 until I have confirmed or removed the 20 additions.

#### Metrics

| Time | Tokens / cost | AI accepted | AI modified | AI rejected |
|---|---|---|---|---|
| AI time 45m 51s. Session open 3h 28m (wall clock, including breaks) | 300.9k output, 16.5m cache read, 434.8k cache write. **$12.80** | 5 | 3 | 0 |

The cost is about seven times Part A's $1.86, and the AI time is about seven times Part A's 6m 26s. The difference is not context loading, which the module calls the expensive part. Almost all of it came from repeated rewrites: 685 lines added and 375 removed across eight prompts, most of it at a very large context (Claude Code reported 85% of usage above 150k tokens). The module's cost section should say that each "make it testable" pass costs more than the one before.

### B2. Test results

My run compared with Part A, same ticket, same tool.

| # | Check | Part A (Ujjawal) | Part B (me) | Notes |
|---|---|---|---|---|
| 1 | Markers raised in the first pass | 22 (and 31 on the wider ticket) | 25 | Same problem both times: too many to act on. |
| 2 | Markers kept after the cut | 6 | 6 | Both about a fifth. The filter rule gives a steady result. |
| 3 | Same blocking questions? | Required fields (asked for each of the three fields), date or date and time, past dates, starting status | Same four topics, plus admin access and what deleted tasks are kept for | Four topics match. The module's examples steer people to the same questions. Mine added two about access and data that Part A left as assumptions. |
| 4 | Mandated requirements missed before the project check | 5 | 6 (plus 3 delivery requirements) | Found even with context loaded first. The project check earns its place. |
| 5 | Made-up rules in the assumptions | 5-minute freshness, 2-second timeout | 3-second updates, year 9999, 320px to 1920px, delete confirmation, and later 1,000-task capacity and a 5-second tolerance | Both runs confirm the module's warning. Mine had more, because I pushed harder for testability. |
| 6 | Same core product decisions? | Title required, description and due date optional, date only, past dates allowed, starts pending | Title and due date required, description optional, date and time, no past dates on create, starts pending, 30-day erasure | Different product owners gave different answers, so the specs differ. That is expected and shows the answers matter more than the AI. |
| 7 | Size of the final spec | 488 lines, 19 criteria (each with several checks), 37 assumptions | 346 lines, 78 criteria (one rule each), 38 assumptions | Similar amount of content, organised differently. Not a quality difference. |
| 8 | Spec buildable without asking the author? | Not tested in Part A | Yes for criteria with a Rule or Resolved source. The 20 additions still need a product owner decision first | C3 is partly supported. |
| 9 | Prompts, AI time, cost | 6 prompts, 6m 26s, $1.86 | 8 prompts, 45m 51s, $12.80 | See metrics. Repeated rewrites, not context, drove the cost. |
| 10 | Did the module's steps work when someone else followed them? | n/a | Yes, with gaps: 6 of 8 steps needed something the module did not give me | See steps table. |

**What I would change in the module** (my input for Part C):

1. Put the prompts inside the steps, in the same order, so a first-time reader does not have to match them up.
2. Fix the first prompt ("current API response format" is left over from the old example) and add a prompt for loading context.
3. Keep step 5 even when context is loaded first, and say why: it still found six missing requirements in my run.
4. Add a prompt for "which assumptions are weakest", and one for applying the step 5 findings.
5. Warn that "push back" plus "assume" makes the AI invent numbers, and that each testability pass adds more. Say when to stop.
6. Add the Rule, Precedent, Ticket, Decision labels for assumptions.
7. Say who answers the questions and who signs off, especially when there is no separate product owner.
8. The checklist prompt covers 4 of the 10 qualities. Either check all 10 or say who checks the rest.
9. Update the cost section: context loading is not the only expensive part. My run cost $12.80, mostly from rewrites.

### B3. Sign-off

- [x] I did not do Part A.
- [x] Result: **Pass with changes.** The module works when a second person follows it, and it produced a solid spec, but 6 of its 8 steps needed something the module did not give, and the changes above should go in.
- Signed: Sajad Ali Akbari, 27 Sep 2026

---

## Part C — Verdict on the module

*To be completed with the tester.*

| Claim | Supported / Partly / Not supported | Evidence |
|---|---|---|
| C1 The clarification-marker rule stops the AI inventing requirements | Supported (provisional) | A2 rows 1 and 2 — no invented requirements in either draft |
| C2 Loading context first materially changes the output | Supported | A4 — 8 of 23 assumptions contradicted, 5 mandated requirements missing |
| C3 A spec is buildable without asking the author | *Needs Part B* | |
| C4 Cost cannot be measured at this stage | **Not supported** | A3 — $1.86, broken down by stage |

### Changes needed in the module

Five, all evidenced above.

**1. Add guidance on too many markers.** The module says a spec with no markers is a warning sign. It says nothing about 22 or 31 markers, which is equally unusable. The practical rule that worked: keep only the questions that block writing the spec, and make the AI decide the rest as stated assumptions.

**2. Add the assumptions table as a pattern.** Numbered assumptions, each listing which criteria depend on it, so a reviewer can correct one and see exactly what to update. This is not in the module and it is the single most useful structure that came out of the run.

**3. Say that telling the AI to assume rather than ask moves the invention.** Prompt 2 produced a 5-minute freshness rule and a 2-second timeout that nobody asked for, presented as reasonable defaults. The marker rule prevents guessing; the assumptions instruction reintroduces it in a more respectable form. The module should say so.

**4. Replace the "cost cannot be measured" claim with the real figures.** $0.32 without context, $1.54 with, $0.32 to extend. The module's Metrics section currently says a developer finishes this stage with no idea what it cost. That is no longer true.

**5. Strengthen the context-loading step.** The module says to load context. It does not say what happens if you do not — and the answer, measured here, is a spec that contradicts the architecture in eight places and omits five mandatory requirements. It also does not cover the case where no context file exists yet, which is what happens on a new project.

### Open questions this run did not settle

- Whether the clarification-marker rule is worth making mandatory, or whether the assumptions pattern replaces it.
- Whether the six product decisions I made as BA would survive a real product owner. Two were settled by the team's design mock-up; four were my judgement.
- The AI stated it had reasoned, not tested, that the Firestore list query fails without a `deletedAt` filter. That is flagged in the spec's testing section for manual verification.