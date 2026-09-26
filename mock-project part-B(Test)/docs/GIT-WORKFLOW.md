# Git Workflow

A single `main` branch — no `develop`, no release branches. Simple enough for a capstone team:
branch, build, PR, merge.

## Branch Structure

```
main         ← production (protected, deploys automatically on push)
  ↑
feature/*    ← new features (branched from main, PR back to main)
hotfix/*     ← urgent fixes (branched from main, PR back to main)
```

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/{kebab-case}` | `feature/notes` |
| Hotfix | `hotfix/{kebab-case}` | `hotfix/auth-token-expiry` |

## Workflow

```
git checkout main && git pull
git checkout -b feature/{name}
# ...make changes, commit...
git push -u origin feature/{name}
gh pr create --base main
# review, merge, GitHub deletes the branch automatically
```

`/git-feature` and `/git-hotfix` (Claude Code skills) automate exactly this. There's no
functional difference between the two branch types — `hotfix/*` is just a naming convention to
flag "this is an urgent fix" to reviewers.

## Commit Messages (Conventional Commits)

The `commit-msg` hook enforces this format:

```
type(scope): description

Examples:
feat: add notes feature
fix(auth): handle token expiry on refresh
docs: update Firestore schema for notes
refactor(backend): extract auth middleware
test: add integration tests for health route
chore: upgrade firebase-admin to v13
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `build` · `ci` · `perf` · `revert`

## Merge Strategy

Squash merge every PR into `main` — keeps history linear and each merge maps to one logical
change.

## Protected Branch

`main` is protected — no direct pushes. All changes go through a pull request.

CI must pass before merge:
- Lint + typecheck
- Unit tests
- Dependency vulnerability audit (`pnpm audit`)

## Tagging a milestone (optional)

If you want to mark a submission or checkpoint, tag `main` directly — no release branch needed:

```bash
git checkout main && git pull origin main
git tag v0.1.0 -m "Milestone: <what this is>"
git push origin v0.1.0
```
