# Evidence — Module 1: Planning and Spec Authoring

| | |
|---|---|
| Pilot feature | Task CRUD on the Simple Task Dashboard |
| Module followed | `white-paper/modules/planning-and-spec-authoring.md` |
| **Done by** | Ujjawal Mittal (BA/UX) |
| **Tested by** | *(Part B — not yet assigned)* |
| Dates | Do: 25 Sep 2026 · Test: — |
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

## Part B — TEST

*Not yet assigned. Per the template, the tester must not be the person who did Part A.*

### B1. What I tested and how

### B2. Test results

### B3. Sign-off

- [ ] I did not do Part A.
- [ ] Result: **Pass** / **Pass with changes** / **Fail — sent back**
- Signed:

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