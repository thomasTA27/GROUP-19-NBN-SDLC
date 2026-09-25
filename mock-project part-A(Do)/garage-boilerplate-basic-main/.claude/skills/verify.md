---
description: Run the full verification pipeline — lint, typecheck, tests, and console.log scan — and output a READY or NOT READY verdict. Use before opening a PR or after a significant implementation.
argument-hint: "[--fix]"
---

# Skill: /verify

Run the full verification pipeline and output a clear READY / NOT READY verdict.

## Pipeline

Run all steps. Collect failures — do not stop on first failure.

### Step 1 — Placeholder check

```bash
pnpm run validate
```

Pass condition: exits 0 with "No unreplaced placeholders found."

### Step 2 — ESLint

```bash
pnpm run lint
```

Pass condition: zero errors (warnings are acceptable).
If `--fix` was passed: run `pnpm run lint --fix` first, then re-run to check.

### Step 3 — TypeScript typecheck

```bash
pnpm run typecheck
```

Pass condition: zero type errors in both `frontend/` and `backend/`.

### Step 4 — Unit tests

```bash
pnpm run test
```

Pass condition: all backend unit tests pass.

```bash
pnpm run test:component
```

Pass condition: all frontend unit tests pass.

### Step 5 — console.log scan

Scan all TypeScript source files that have been modified (use `git diff --name-only`) for `console.log` statements:

```bash
git diff --name-only HEAD | grep -E '\.(ts|tsx)$' | xargs grep -l 'console\.log' 2>/dev/null
```

Also scan the full `src/` directories:
```bash
grep -r 'console\.log' frontend/src/ backend/src/ --include='*.ts' --include='*.tsx' -l 2>/dev/null
```

Pass condition: no `console.log` in `src/` files (debug statements must be removed before merge).
Exception: `console.error` and `console.warn` in error handlers are acceptable.

---

## Output format

After all steps complete, output:

```
## Verification Results

| Check | Status | Detail |
|-------|--------|--------|
| Placeholders | ✅ PASS | — |
| ESLint | ✅ PASS | — |
| TypeScript | ✅ PASS | — |
| Unit tests | ✅ PASS | — |
| console.log | ✅ PASS | — |

## Verdict: ✅ READY TO MERGE
```

Or if any check failed:

```
## Verdict: ❌ NOT READY — fix the following before opening a PR:

1. TypeScript: frontend/src/components/layout/Navbar.tsx — Property 'x' does not exist on type 'Y'
2. console.log: backend/src/routes/users.ts line 42
```

Do not open a PR until all checks pass. Fix each issue and re-run `/verify`.
