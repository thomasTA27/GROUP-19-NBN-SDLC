# Contributing

This is a documentation repository. There is no build, no package manager,
and no application code — every change is a markdown (or exported asset)
change. The rules below exist so four people produce work that is
consistent and easy to find.

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
| `feat` | New structural additions — a new module, a new research stream, the demo project |
| `fix` | Correcting factual errors, broken links, wrong stage mappings |
| `chore` | Repo housekeeping (folder structure, templates, PR template) |

Examples:

```
docs: add benchmarking findings for code review stage

feat: scaffold demo project structure for sprint 2

docs: fix broken link to lifecycle map export in design/README.md
```

## Branch naming

`<type>/<short-kebab-description>`, matching the commit type, e.g.

```
docs/planning-stage-module
research/ai-in-testing-week3
feat/demo-project-scaffold
chore/pr-template
```

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

| Artifact type | Folder |
|---|---|
| White paper stage module | `white-paper/modules/` |
| Governance / oversight content | `white-paper/governance/` |
| Learning path / onboarding material | `white-paper/learning-paths/` |
| Storyboard / presentation flow | `white-paper/storyboard/` |
| Research capture (source, article, paper) | `research/<stream>/` |
| Cross-stream research rollup | `research/synthesis.md` |
| Lifecycle map exports | `design/lifecycle-map/` |
| Design validation evidence | `design/validation/` |
| Demo / sample project | `demo/` |
| Proposal documents | `project/proposal/` |
| Meeting notes | `project/meetings/` |
| Sprint plans and reviews | `project/sprints/` |
| Certification badges / completion proof | `project/certification/` |
