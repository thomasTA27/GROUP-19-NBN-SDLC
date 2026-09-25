# Development Workflow Rules

## Step 0 — Research before implementing (mandatory)

Before writing any non-trivial code, always research first:

0. **Check the Codebase Map in CLAUDE.md first** — for standard feature work (collections, pages, actions, routes) it lists every building block and its exports; a worked example lives in `docs/TUTORIAL-WALKTHROUGH.md`. Only fall through to searching when the map doesn't cover what you need.
1. **Search the codebase** — the pattern may already exist (`Grep`, `Glob`)
2. **Check library docs** — use `context7` MCP ("use context7") for Next.js, Firebase, Tailwind, Zod APIs before guessing
3. **Check `docs/`** — architecture decisions, schema, env vars, testing conventions are documented
4. **Check `node_modules`** — read actual type definitions rather than assuming APIs from training data

**Never write code based on memory of an API when you can verify the actual signature in under 30 seconds.**

## Implementation order

1. Read the relevant source files first
2. Understand existing patterns before introducing new ones
3. Write the code
4. Verify: `pnpm run typecheck` → `pnpm run lint` → `pnpm run test`
5. Use `/verify` for a full pre-PR check

## Planning for non-trivial tasks

For tasks that touch more than 3 files or involve architectural decisions:
1. State your plan before writing code
2. Get confirmation before executing
3. Use `/checkpoint create` before starting, and after each logical milestone

## Context management

- Use `/compact` after research phases, after planning, after a major debugging session — not mid-implementation
- What survives compaction: CLAUDE.md, task lists, git state, memory files
- What gets cleared: intermediate reasoning, read file contents
- If approaching context limit mid-task, use `/save-session` before compacting

## Commit discipline

- Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- One logical change per commit
- Run `pnpm run validate` before committing (checks for unreplaced template placeholders)
- Never commit directly to `main` — use feature branches via `/git-feature`
