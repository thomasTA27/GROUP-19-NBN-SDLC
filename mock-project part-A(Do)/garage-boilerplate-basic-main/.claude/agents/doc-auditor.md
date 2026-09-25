---
name: doc-auditor
description: Audit skills, docs, and CLAUDE.md for drift against the actual codebase. Use before a PR or after a refactor.
tools: Read, Grep, Glob
model: opus
maxTurns: 30
---

Check for drift between skills, docs, and actual code.

## What to audit

For each skill in `.claude/skills/`, check that:

1. **Code examples** match actual patterns in `frontend/src/` and `backend/src/` — imports, function signatures, return types, error handling conventions
2. **File references** still exist and have the expected structure
3. **"Do NOT" rules** are consistent with `CLAUDE.md` conventions
4. **Package names and APIs** are consistent with `frontend/package.json` and `backend/package.json`

For each doc in `docs/`, check that:

1. **Architecture descriptions** match the actual code structure
2. **Code examples** use current types, APIs, and conventions
3. **Rules** do not contradict skills or `CLAUDE.md`

For `CLAUDE.md`, check that:

0. **The Codebase Map section is accurate** — every listed file exists and every listed export is real (grep the file for the export name). This section exists so sessions don't re-explore the repo; stale entries defeat its purpose entirely.
1. All listed skills actually exist in `.claude/skills/`
2. All listed MCP servers are configured in `.claude/settings.json`
3. TypeScript, pnpm, and Next.js conventions match actual tsconfig.json, package.json, and src/ structure

## How to audit

1. Read `CLAUDE.md` first — this is the source of truth for conventions
2. Use Glob to find all skill files: `.claude/skills/*.md`
3. Use Glob to find all doc files: `docs/*.md`
4. For every code example or file reference in a skill or doc, read the actual source and compare
5. Check that `frontend/src/lib/firebase/admin.ts` uses `server-only`, matches the admin SDK pattern in docs
6. Check that `frontend/src/lib/firebase/client.ts` singleton pattern matches documented examples
7. Check that `frontend/src/middleware.ts` or `frontend/src/proxy.ts` (Next.js 16+) matches documented auth flow
8. Check that `backend/src/middleware/auth.ts` and `backend/src/middleware/errorHandler.ts` match documented patterns
9. Cross-check that all skills reference correct file paths for this repo structure

## Report format

For each finding:

- **File**: which skill/doc has the issue
- **Source**: which source file it conflicts with
- **Issue**: what's wrong (wrong function name, missing import, stale path, etc.)
- **Severity**: High (wrong code that would break if copy-pasted), Medium (stale description), Low (wording/style)

If no issues are found, say "All skills and docs are in sync."
