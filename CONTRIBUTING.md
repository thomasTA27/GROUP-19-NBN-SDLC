# Contributing

This is a documentation repository. There is no build, no package manager,
and no application code — every change is a markdown (or exported asset)
change. The rules below exist so four people produce work that is
consistent and easy to find.

## Setup

After cloning, enable the local git hooks (one-time, per clone):

```sh
git config core.hooksPath .githooks
```

This gets you fast local feedback — a check on your commit message
format and a block on pushing directly to `main` — before you even push.
See [.githooks/README.md](.githooks/README.md) for details.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>

[optional body]
```

Types used in this repo:

| Type | Use for |
|---|---|
| `docs` | White paper content, research notes, templates, README changes |
| `feat` | New structural additions — a new module, a new folder, the platform site |
| `fix` | Correcting factual errors, broken links, wrong stage mappings |
| `chore` | Repo housekeeping (folder structure, templates, PR template) |

Examples:

```
docs: add benchmarking findings for code review stage

feat: scaffold platform project structure for sprint 2

docs: fix broken link to lifecycle map export in design/README.md
```

## Branch naming

`<type>/<short-kebab-description>`, matching the commit type, e.g.

```
docs/planning-stage-module
docs/research-ai-in-sdlc-week3
feat/platform-scaffold
chore/pr-template
```

## Working without the command line

You don't need Git installed to contribute. Open the file on GitHub's
website and click the pencil (edit) icon. GitHub will not let you commit
straight to `main` — it automatically offers to create a new branch and
open a pull request for you instead. Fill in a commit message following
the [Conventional Commits](#commit-messages) format above, let it create
the branch, and open the PR it offers. From there it's the same review and
merge process as anyone else's change.

## Branch protection

`main` is protected: nobody pushes to it directly (not even admins, by
convention — see below). All work goes through a branch and a pull
request. The local `pre-push` hook (see [Setup](#setup)) will refuse a
push while you're on `main`, but the real enforcement is a GitHub
repository ruleset applied server-side, since local hooks can be bypassed
with `--no-verify`. The ruleset's config lives in
[.github/rulesets/](.github/rulesets/) — see that folder's README for
what it enforces and how it's applied.

## Everything lives in this repo

The Planner board is for tracking tasks only. Every deliverable —
research capture, white paper draft, design export, meeting note — lives
in this repository and is **linked from** the relevant Planner card, not
pasted or attached there. If it isn't in this repo, it doesn't exist as
far as the white paper is concerned.

## Handoff comments on Planner cards

When you move a card to the next role, leave a comment in this structure
so the next person doesn't have to chase you down:

```
Done: <what you completed>
Deliverable: <link to the file/folder in this repo>
Note for next role: <anything they need to know before they start>
```

## Where does this go?

See the root [README.md](README.md#where-does-my-work-go) for the full
"where does my work go" table. Quick reference:

| Artifact type | Folder |
|---|---|
| Personal research findings | `research/ai-in-sdlc/<firstname>.md` |
| Module-specific Sprint 2 research | `research/modules/` |
| Cross-person research rollup | `research/synthesis.md` |
| Your own lifecycle diagram proposal | `design/lifecycle-map/proposals/<firstname>.md` |
| Agreed lifecycle map (link + exports) | `design/lifecycle-map/` |
| White paper stage module | `white-paper/modules/` |
| Governance / oversight content | `white-paper/governance/` |
| Learning path / onboarding material | `white-paper/learning-paths/` |
| Storyboard / presentation flow | `white-paper/storyboard/` |
| Platform (Next.js demo site) code | `platform/` |
| Meeting notes | `project/meetings/` |
| Sprint plans and reviews | `project/sprints/` |
| Certification notes / completion proof | `project/certification/` |
