# Step 3 load check: which rules load for `firebase/firestore.rules`

**Test:** a new Claude Code session, started in `mock-project part-B(Test)/`, read `firebase/firestore.rules` and listed every project rule or instruction in its context, with the file each came from. Run on 2026-09-27 with an AI assistant (Claude Code). The session made no edits to `firestore.rules`.

## Result

- **`.claude/rules/tasks.md` loaded, and only after the agent read `firebase/firestore.rules`.** It wasn't in context at session start, so its `paths` entry for `firebase/firestore.rules` works.
- **The whole file loads, without its frontmatter.** The agent got the heading and all five rules, but not the `paths` list. Rules 1 and 2 apply to this file. Rules 3 to 5 are about app code.
- **Four other sources were in context from session start:** the mock project's `CLAUDE.md`, `.claude/rules/development-workflow.md`, the repo-root `../CLAUDE.md`, and the SessionStart hook's message.
- **Not loaded:** `frontend/CLAUDE.md`, `backend/CLAUDE.md`, any `AGENTS.md`, the ADRs and docs that `tasks.md` and `CLAUDE.md` point to, the project skills, and the project MCP servers.

## When each source loaded

| Source | When | Why |
|---|---|---|
| `CLAUDE.md` | Session start | The working directory's CLAUDE.md. |
| `../CLAUDE.md` (GROUP-19-NBN-SDLC repo root) | Session start | Claude Code also loads CLAUDE.md files from parent folders. |
| `.claude/rules/development-workflow.md` | Session start | No `paths` frontmatter, so it always loads. |
| SessionStart hook in `.claude/settings.json` | Session start | Its `echo` output is added to context. |
| `.claude/agents/*.md` | Session start, descriptions only | `doc-auditor`, `security-reviewer` and `test-writer` show in the agent list. Their full prompts load only if invoked. |
| `.claude/rules/tasks.md` | With the results of the first tool calls, which included the read of `firebase/firestore.rules` | Its `paths` list includes `firebase/firestore.rules`. That read was the only matching file touched. |

## Rules followed while working on `firebase/firestore.rules`

### From `.claude/rules/tasks.md`

| # | Rule | Applies here? |
|---|---|---|
| 1 | No create, update or delete rule for `tasks` in `firebase/firestore.rules`; no `isAdmin()` or `hasCustomClaim()` in any `tasks` rule; no task writes with the client SDK (ADR-0002) | Yes. It names this file. |
| 2 | Create tasks with `deletedAt: null`, and query `tasks` only with `where('deletedAt', '==', null)`, because security rules are not filters (ADR-0004) | Yes, indirectly. A `tasks` read rule that checks `deletedAt` only works if every query filters the same way. |
| 3 | Write to an existing task only in a transaction that reads it and checks the owner and `deletedAt` (ADR-0005) | No. Server Action code. |
| 4 | Never format a due date on the server (ADR-0003) | No. UI code. |
| 5 | Never show or return a library error message for tasks (ADR-0006) | No. Action and UI code. |

### From `CLAUDE.md`

- **Every collection has security rules in `firebase/firestore.rules`**, a typed collection in `frontend/src/lib/firebase/firestore.ts`, and an entry in `docs/FIRESTORE-SCHEMA.md` (Critical Conventions, Firestore).
- **Soft delete:** "Use the soft-delete pattern (add `deletedAt: Timestamp`) instead of hard deletes." The file's `allow delete: if false` and `notDeleted()` follow it.
- **`_schemaVersion: 1`** on every collection type (Codebase Map, `types/firestore.ts`). The rules' `hasAll` key lists check for it.
- **Use the existing helpers:** the Codebase Map lists `isAuthenticated()`, `isOwner(uid)`, `isAdmin()`, `hasCustomClaim(claim)` and `notDeleted()`.
- **No `firebase deploy` without explicit approval** (Agent Permissions). Deploying the rules counts.
- **No CI changes without approval** (Agent Permissions). `.github/workflows/deploy.yml` deploys this file.
- **No local Firebase emulators** (What To Avoid), so rule changes can't be tested against the emulator in this setup.
- **Harness integrity:** if a change alters a pattern documented in `.claude/skills/` or `docs/`, update those files in the same session. If a helper is added or renamed, update the Codebase Map.
- **Before a PR:** the `security-reviewer` agent audits Firestore rules.
- **Firebase MCP tip:** "Use the Firebase MCP to inspect Firestore data or deploy rules." The MCP server isn't loaded (see below), so this can't be followed here.
- **Git:** branch from `main` as `feature/*` or `hotfix/*`, use Conventional Commits, and never commit to `main`.

### From `.claude/rules/development-workflow.md`

- **Step 0:** check the Codebase Map first, then search the codebase, then library docs through context7 (for rules syntax), then `docs/`. context7 isn't loaded (see below).
- **Plan first** if the change touches more than 3 files. Adding a `tasks` block with its type, collection function and schema doc is 4 files.
- **Verify** with typecheck, lint and test. None of these checks `firestore.rules`. Only `firebase.json` and the deploy workflow reference it.
- **Commits:** Conventional Commits, one logical change per commit, `pnpm run validate` before committing, never commit to `main`.

### From `../CLAUDE.md` (repo root)

- **Git:** branch as `<type>/<short-kebab-description>`, use Conventional Commits with `docs`, `feat`, `fix` or `chore`, open PRs with `.github/pull_request_template.md`, and never push to `main`.
- The rest doesn't apply to this file: the Sprint 2 focus, "don't change `platform/`", and "keep `white-paper/` and `research/` prose LLM-agnostic".

### From the SessionStart hook (`.claude/settings.json`)

- "Always use pnpm." Its pointers to `frontend/CLAUDE.md`, `backend/CLAUDE.md` and `docs/DESIGN.md` don't apply to `firestore.rules`.

### Enforced by `.claude/settings.json`, not read as instructions

These run on tool calls whether or not the agent knows about them.

- **PreToolUse (Bash):** blocks `firebase deploy`, which includes `firebase deploy --only firestore:rules`. Also blocks pushes to `main`, `--force` and `--no-verify`.
- **PostToolUse (Edit and Write):** every hook filters on `.ts`, `.tsx`, `.json`, `.css`, `.md` or `.env*`, or on `frontend/src/` and `backend/src/`. None matches `firestore.rules`, so an edit to it gets no automatic lint, format or check.
- **Deny list:** `npm install`, `yarn`, `rm -rf`, force pushes and hard resets, among others.

## Not loaded

| Source | Why |
|---|---|
| `frontend/CLAUDE.md`, `backend/CLAUDE.md` | Nested CLAUDE.md files load when the agent works on files in those folders. `firebase/` has no CLAUDE.md. The SessionStart hook tells the agent to check them, but doesn't load them. |
| `frontend/AGENTS.md`, `../AGENTS.md` | Claude Code doesn't load AGENTS.md. `../CLAUDE.md` links to `AGENTS.md` as a plain Markdown link, not an `@` import. |
| `docs/adr/0002` to `0006` | `tasks.md` points to them with "See …", which doesn't load them. The agent has the one-line rules, not the reasons or the verified details. |
| `docs/TUTORIAL-WALKTHROUGH.md`, `docs/FIRESTORE-SCHEMA.md`, `docs/DESIGN.md` | Pointed to, not loaded. |
| `.claude/skills/*.md` (16 files, including `firebase-collection.md`) | Not in the session's skill list. They're flat `.md` files, and Claude Code expects each skill in its own folder as `<name>/SKILL.md`, which is the likely reason. So `/firebase-collection`, which `CLAUDE.md` offers for "type + rules + hook + docs", can't be invoked. |
| MCP servers `context7`, `firebase`, `stitch` | None of their tools are available in the session. They're defined under `mcpServers` in `.claude/settings.json`, and Claude Code reads project MCP servers from `.mcp.json`, which is the likely reason. |
| `.claude/identity.json` | Not a file Claude Code loads. Its "Minimal" verbosity setting wasn't in context. |
| Auto memory | The memory folder for this repo is empty. |

## What this means for step 3

- **The path-scoped load works for this file.** An agent working on `firestore.rules` gets rule 1 without being told to look for it.
- **The read rule is only implied.** ADR-0002 says the rules "allow owner-only reads of non-deleted tasks". `tasks.md` says what the rules must not allow, not what they must. The file has no `tasks` block yet, so the default deny also blocks the live reads ADR-0002 needs. From loaded context alone, an agent has to work out the read rule from `CLAUDE.md` ("every collection has security rules"), rule 2 and the `notes` block.
- **The nearest example is in the same file.** The `notes` block (`firebase/firestore.rules:61-73`) lets the browser create and update notes. `step3-conflict-check.md` found this pattern through the walkthrough (finding 3). Here it sits in the file the agent is editing, next to where a `tasks` block would go. Rule 1 is what stops it being copied.
- **The `firebase-collection` skill clash can't happen in this setup.** `step3-conflict-check.md` notes that the skill's template breaks rule 1. The skill isn't loaded, so it can't be invoked, unless it moves to `firebase-collection/SKILL.md` or an agent reads the file directly.
- **The two CLAUDE.md files give different branch names.** `CLAUDE.md` says `feature/*` or `hotfix/*`. `../CLAUDE.md` says `<type>/<short-kebab-description>`. Both are loaded. The mock project sits inside the GROUP-19-NBN-SDLC repo, and the current branch (`docs/design-and-context-engineering-part-b`) follows `../CLAUDE.md`.
- **Rules 3 to 5 load here without applying.** That's the cost of one rules file covering three paths.
- **Step 0's "use context7" can't be followed** while the MCP servers aren't loaded.
