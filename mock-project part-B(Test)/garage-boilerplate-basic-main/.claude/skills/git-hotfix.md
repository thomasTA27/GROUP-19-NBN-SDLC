---
description: Create a hotfix branch from main for an urgent fix. Use when something is broken and needs fixing ASAP.
argument-hint: "[hotfix-name]"
---

# Skill: /git-hotfix

Create a hotfix branch from `main` for an urgent fix. Functionally identical to `/git-feature` —
the `hotfix/*` name just flags to reviewers that this is urgent.

## Step 1 — Gather requirements

Ask the user:
1. **Issue/bug** — brief description of what's broken
2. **Hotfix name** — short kebab-case (e.g., `auth-token-expiry`, `null-ref-crash`)

## Step 2 — Execute

```bash
# Ensure we're on a clean, up-to-date main
git fetch origin
git checkout main
git pull origin main

# Create hotfix branch from main
git checkout -b hotfix/{hotfix-name}

# Push immediately
git push -u origin hotfix/{hotfix-name}

# Open PR targeting main
gh pr create \
  --title "fix: {hotfix-name}" \
  --body "## Problem\n{describe the bug}\n\n## Fix\n{describe the fix}\n\n## Test plan\n- [ ] Regression test added\n- [ ] Tested against a dev Firebase project\n\n🤖 Generated with Claude Code" \
  --base main
```

## Important

- Keep the fix minimal — only the critical change, no opportunistic cleanup
- Once merged, the branch is deleted automatically by GitHub
