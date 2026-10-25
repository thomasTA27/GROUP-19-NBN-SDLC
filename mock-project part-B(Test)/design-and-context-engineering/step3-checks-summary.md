# Before-merging checks and checklist (a) to (f)

Written on 2026-09-27 by an AI assistant acting for Sajad Ali Akbari.

## It loads (`step3-load-check.md`)

**Result: yes.** In a fresh session, `.claude/rules/tasks.md` was not in context at the start and loaded the moment the agent read `firebase/firestore.rules`, one of its `paths`. The rules load without their front matter, and the "See docs/adr/..." links are not loaded, so the agent gets the rule text but not the reasons.

The same check showed three problems in the project's own setup that no step of the module looks for:
- The 16 skills in `.claude/skills/` never load, because they are flat `.md` files and Claude Code expects `<name>/SKILL.md`.
- The three MCP servers never load, because they are declared in `.claude/settings.json` instead of `.mcp.json`.
- The capstone repo's root `CLAUDE.md` also loads, because the mock project sits inside it, and it gives a different branch-naming rule from the mock project's `CLAUDE.md`.

## It changes behaviour (`step3-behaviour-with-rule.md` and `step3-behaviour-without-rule.md`)

Same task in two fresh sessions: plan a "due this week" filter on the task list, no code.

| What we looked for | With the rule | Without the rule |
|---|---|---|
| Noticed filtering is out of scope in the spec (§9) | Yes | Yes, and proposed raising SCR-19 |
| Kept the owner and `deletedAt == null` filters | Yes, citing rule 2 | Yes, citing ADR-0004 |
| No rules change, no write path | Yes, citing rule 1 | Yes, citing ADR-0004 |
| Worked out the week in the browser | Yes, citing rule 4's reason | Yes, citing A5 and AC-2.5 |
| Fixed error wording, never raw Firestore text | Yes, citing rule 5 | Yes, citing ADR-0006 and AC-8.5 |
| Files it read | Rules file loaded automatically, plus code files | Read the spec, all six ADRs, the schema doc and code files |
| Cost | Not recorded | Not recorded |

**Result: no difference in behaviour on this task.** Without the rule, the agent went and read the ADRs and the spec, which say everything the rules say. So this comparison can't show that the rules change behaviour. What it does show:
- The rules give the same constraints without the agent having to find and read six ADRs. That probably saves context and cost, but neither run recorded its cost, so this is unproven.
- The test task was weak: it was out of scope and the task code doesn't exist yet. The module's comparison only makes sense once there is code to change and the ADRs aren't the obvious next read.
- The with-rule run found that rule 4's wording was narrower than its reason, and rule 4 was widened. It also found that ADR-0004 misread how `useCollection()` restarts, and ADR-0004 now carries a correction.

## Checklist (a) to (f)

| Check | Result | Evidence |
|---|---|---|
| (a) A named human can defend every decision without deferring to the AI | **No** | Every step 2 decision was made by an AI assistant acting for Sajad, at his request, and the final review of those decisions was also done by that assistant on his behalf (`design-notes.md`). No human has reviewed them independently. The security reviewer on ADR-A, B and E is the first human check. |
| (b) Every step 1 item ends as an ADR, "follows convention" or an SCR | Yes, with two extra outcomes | 27 items: 6 ADRs, 6 SCRs, 1 context fix, 6 with no new decision (`design-step1-sort.md`). "Decided in Planning" and "context fix" aren't outcomes the module lists. |
| (c) Rejected options are real and fairly stated; library, API and platform claims checked against official docs | Partly | Checked against official docs: Vercel cron secret header, no retries and best-effort delivery, Hobby once a day, Firestore TTL needs billing, security rules are not filters. Still unverified: whether `deletedAt == null` skips tasks with no `deletedAt` field (left to Testing), Hobby function time limits and free quotas. One ADR claim was wrong and was corrected (ADR-0004, `useCollection()`). |
| (d) Each ADR still meets the acceptance criteria | Yes, after changes | The consistency check found 11 conflicts in the spec and one design risk (ADR-A against the 48-hour window). All went back as SCR-7 to SCR-18 and were applied before the ADRs were drafted. |
| (e) New rules don't conflict with existing files, and each is something the agent couldn't infer | Partly | 4 contradictions and 7 overlaps found (`step3-conflict-check.md`). The skill template was fixed; the other three are accepted and recorded (`step3-rules-review.md`). Each rule goes against a nearby precedent, so none is inferable. |
| (f) No secrets, internal hostnames or personal data in ADRs, rules or specs | Yes | Searched the ADRs, rules and design files for keys, service account text, Firebase and Vercel hostnames and email addresses. Only the variable name `CRON_SECRET` appears, never a value. |
