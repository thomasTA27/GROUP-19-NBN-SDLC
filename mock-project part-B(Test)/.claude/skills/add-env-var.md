---
description: Add an environment variable to the single root .env template, wire it through scripts/sync-env.js to the right package, and document it in docs/ENV-VARS.md. Use when a new configuration value is needed.
argument-hint: "[VAR_NAME] [frontend|backend|both]"
---

# Skill: /add-env-var

Add a new environment variable. This project uses a **single root `.env`** as the source of truth — `scripts/sync-env.js` generates `frontend/.env.local` and `backend/.env` from it. A new variable therefore touches three files: `.env.example`, `scripts/sync-env.js`, and `docs/ENV-VARS.md`.

## Step 1 — Gather requirements

Ask the user:
1. **Variable name** (e.g., `STRIPE_SECRET_KEY`)
2. **Which package(s) need it** — `frontend`, `backend`, or both?
3. **Is it secret?** — if yes, it must NOT have a `NEXT_PUBLIC_` prefix (a hook blocks this)
4. **Does the browser need it?** — only then use the `NEXT_PUBLIC_` prefix
5. **Description** — what is this variable for?
6. **Example value or format** (used in the `.env.example` comment)

## Step 2 — Files to update

### 1. `.env.example` — add under the appropriate section with a comment

```bash
# {Description}
{VAR_NAME}=
```

### 2. `scripts/sync-env.js` — route it to the package(s) that need it

- **Frontend, browser-safe**: nothing to do — all `NEXT_PUBLIC_*` keys pass through to `frontend/.env.local` automatically
- **Frontend, server-only** (Server Actions / Route Handlers): add a line to the `frontendLines` block:
  ```javascript
  frontendLines.push(`{VAR_NAME}=${get('{VAR_NAME}')}`)
  ```
- **Backend**: add a line to the `backendLines` array:
  ```javascript
  `{VAR_NAME}=${get('{VAR_NAME}')}`,
  ```
- **Root-only** (e.g. MCP keys read from `.env` directly): nothing to do

### 3. `docs/ENV-VARS.md` — add a row to the variables table

| Variable | Secret | Required | Description |
|---------|--------|----------|-------------|
| `{VAR_NAME}` | Yes/No | Yes/No | {Description} |

### 4. If it's a secret

Add a note to `docs/SECURITY.md` about how to rotate it if compromised, and remind the user to add it as a GitHub Actions secret for CI/CD.

## Step 3 — Remind user

> "Add the actual value to the root `.env`, then run `pnpm run env:sync` (or just restart `pnpm run dev`)."
> "For CI/CD, add it as a GitHub Actions secret — the root `.env` is local-only."

## Checklist

- [ ] Added to `.env.example` with a descriptive comment, under the right section
- [ ] Routed in `scripts/sync-env.js` if a package needs it (NEXT_PUBLIC_* is automatic)
- [ ] `NEXT_PUBLIC_` prefix used only for truly browser-safe values
- [ ] Documented in `docs/ENV-VARS.md`
- [ ] Secret variables noted in `docs/SECURITY.md`
- [ ] Code accessing the variable has a fallback or clear error if missing
