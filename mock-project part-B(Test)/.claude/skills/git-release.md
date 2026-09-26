---
description: Tag the current main branch as a milestone/submission checkpoint. Use when you want to mark a point in history (e.g., before a capstone submission deadline) without a formal release process.
argument-hint: "[version e.g. 0.1.0]"
---

# Skill: /git-release

This project doesn't use release branches — `main` always deploys, so there's nothing to
"prepare" separately. This skill just tags the current state of `main` so you can point back to
it later (useful before a submission deadline or grading checkpoint).

## Step 1 — Gather requirements

Ask the user:
1. **Version/tag name** — e.g., `0.1.0`, or something descriptive like `capstone-submission-1`
2. **What this milestone represents** — one line, becomes the tag message

## Step 2 — Execute

```bash
git checkout main
git pull origin main
git tag v{version} -m "{description}"
git push origin v{version}
```

That's it — no branch, no version bump, no PR. The tag is a permanent pointer to this exact
commit on `main` that you can always come back to (`git checkout v{version}`).
