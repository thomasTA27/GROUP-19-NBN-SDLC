# GROUP-19-NBN-SDLC

## What this is

This is a capstone project for **NBN Co**, advised by **Alessio Bonti**.
We are writing a technical white paper that defines what each phase of
the software development lifecycle (SDLC) looks like when developers use
AI (LLMs) continuously throughout it — not "AI can help you code faster,"
but a concrete definition of what a developer does, what they ask the AI,
what they check before accepting its output, and how authorship gets
recorded, at every stage from requirements through deployment.

The white paper is the deliverable. Everything else in this repository —
research, the lifecycle map, the demonstration platform — exists to
produce and support it.

**This is a documentation project, not a code project.** With one
exception (the demo platform in [platform/](platform/), built in Sprint
2), there is no application code, no `package.json`, and no build
configuration anywhere in this repository, including the root. Every
change is a markdown file, or an exported design asset.

### Team

| Name | Role |
|---|---|
| Thomas Phu Thai Ta | Project Manager |
| Ujjawal Mittal | Business Analyst / UX |
| William Lor | Developer |
| Sajad Ali Akbari | Developer |

### Boards

- **Miro board** (lifecycle map source of truth): https://miro.com/welcomeonboard/L0I2b3FaTnJBOXZ1dU5hV3hyNTdidkpmMkdvMklWNU5HZ2taS0hYNk9RMXkrNTVYWHFKQWd5YnRmMFMxU05hSG1pamNZRVMyV2tHTjRvdmpZVzdSQ3gzTmZGUnFUR2NudUhlVGpoRUxoaUY1RGFHSmJNbzdzWkhJRDdiWHVyYzY3QTNVZXpxSXBObEppZ0UxYUMzQnV3PT0hdjE=?share_link_id=414717993149
- **Planner board** (task tracking): TBD — add link here once created
- **Deployed platform** (Sprint 2 demo site): TBD — add link here once deployed

If you only remember one rule from this README: **everything except the
Planner board itself lives in this repository, and gets linked from the
relevant Planner card** — see [Planner and this repo](#planner-and-this-repo).

## Where does my work go?

Not sure where to put something you just produced? Find it here.

| I produced... | It goes in... |
|---|---|
| Research findings from a source I read | `research/ai-in-sdlc/<firstname>.md` |
| Research specifically for one white paper module (Sprint 2) | `research/modules/<phase-name>.md` |
| A rollup of findings into a conclusion | `research/synthesis.md` |
| My own proposed lifecycle diagram | `design/lifecycle-map/proposals/<firstname>.md` (or `.png`/`.pdf`) |
| The team-agreed lifecycle map | `design/lifecycle-map/README.md` (holds the Miro link) — exports go alongside it |
| Meeting minutes | `project/meetings/<yyyy-mm-dd>-<topic>.md` |
| A sprint plan or review | `project/sprints/sprint-<n>.md` |
| Certification notes / completion proof | `project/certification/<firstname>-notes.md` |
| Governance / AI-use policy research | `white-paper/governance/` |
| The white paper storyboard / presentation flow | `white-paper/storyboard/` |
| A white paper module (one lifecycle phase) | `white-paper/modules/<phase-name>.md` |
| A learning path / onboarding guide | `white-paper/learning-paths/` |
| Platform (Next.js demo site) code | `platform/` |

If it still isn't obvious, check that folder's own `README.md` — every
folder in this repo has one that says what belongs there and what
doesn't. If it's genuinely ambiguous, ask in the team channel rather than
guessing; update this table afterward so the next person doesn't have to
ask.

## Folder-by-folder walkthrough

### `research/`

Source material and findings backing the white paper, captured by four
people in parallel so everyone uses the same format
([`research/TEMPLATE.md`](research/TEMPLATE.md)).

- `ai-in-sdlc/` — one findings file per person, any AI-in-SDLC topic
- `modules/` — Sprint 2 research targeted at a specific white paper module
- `synthesis.md` — cross-person conclusions that feed the white paper

**Does not belong here:** white paper prose (that's `white-paper/`),
lifecycle map content (that's `design/`).

### `design/`

The lifecycle map and everyone's proposals toward it.

- `lifecycle-map/README.md` — the link to the live Miro board (the
  **agreed** map — Miro is the source of truth, not this repo)
- `lifecycle-map/proposals/` — everyone's own draft diagram, made before
  the team converges on the agreed map

**Does not belong here:** an editable copy of the agreed map (only exists
on Miro), white paper content, general research.

### `white-paper/`

The deliverable itself.

- `modules/` — one file per lifecycle phase, following
  `modules/TEMPLATE.md`. Stage names aren't invented here ahead of time —
  they come from the agreed lifecycle map first
- `governance/` — cross-cutting oversight, approval, and AI-use policy
  content
- `learning-paths/` — onboarding material for teams adopting the
  methodology
- `storyboard/` — the narrative flow of the white paper as a presentable
  artifact

**Does not belong here:** raw research (cite it instead, from
`research/`), lifecycle map source or exports (`design/`), meeting or
sprint records (`project/`).

### `platform/`

The Next.js demonstration site, built in Sprint 2 to show the methodology
in practice. This is the **only** folder allowed to contain application
code, `package.json`, or build configuration — nowhere else in the repo,
including the root. Empty/placeholder until Sprint 2.

**Does not belong here:** the methodology definition itself (`white-paper/`).

### `project/`

Administrative records for how the project is run — not the deliverable.

- `certification/` — Claude certification completion proof and notes
  (already has `sajad-notes.md` — add your own `<firstname>-notes.md`
  alongside it, don't edit someone else's)
- `meetings/` — meeting notes and minutes
- `sprints/` — sprint plans and reviews

**Does not belong here:** any white paper, research, or design content —
link to it from here instead of copying it in.

## How to contribute

You do not need to be a developer to contribute to this repository —
most of what goes here is writing, not code.

1. **Create a branch.** Name it `<type>/<short-kebab-description>`, e.g.
   `docs/certification-notes-firstname`. See
   [CONTRIBUTING.md](CONTRIBUTING.md) for the type prefixes.
2. **Make your change.** Add or edit a markdown file in the right folder
   (see the table above).
3. **Commit using [Conventional Commits](https://www.conventionalcommits.org/)**,
   e.g. `docs: add certification notes for firstname`.
4. **Open a pull request** from your branch into `main`.
5. **Merge once it looks right.** A teammate can review it, but it isn't
   required to merge.

**`main` is protected** — nobody, including admins, pushes to it
directly. A direct push will be rejected; everything goes through a
branch and a pull request. This is enforced on GitHub's side, not just by
convention.

**You don't need Git installed to do any of this.** If you edit a file
directly on GitHub's website (click the pencil icon), GitHub will not let
you save straight to `main` — it automatically offers to create a branch
and open a pull request for you. Use that flow. Two of us work this way
day to day, so it's a fully supported path, not a workaround.

Full details — commit message types, branch naming, local git hooks — are
in [CONTRIBUTING.md](CONTRIBUTING.md).

## File naming conventions

- **Lowercase, hyphenated, no spaces.** `code-review.md`, not
  `Code Review.md` or `code_review.md`.
- **Personal files use `firstname.md`** (e.g. `sajad.md`, `thomas.md`,
  `ujjawal.md`, `william.md`) so four people can work in the same folder
  without colliding. This applies to research findings, lifecycle map
  proposals, and certification notes (as `firstname-notes.md`).
- **Dated files use `yyyy-mm-dd-topic.md`**, e.g.
  `2026-08-23-client-checkin.md`.

## Planner and this repo

The Planner board is for tracking tasks only — it is not where
deliverables live. Every research capture, white paper draft, design
export, and meeting note lives in **this repository**, and is **linked
from** the relevant Planner card, never pasted or attached there. If it
isn't in this repo, it doesn't exist as far as the white paper is
concerned.

When you move a Planner card to the next role, leave a comment in this
format so the next person doesn't have to chase you down:

```
Done: <what you completed>
Deliverable: <link to the file/folder in this repo>
Note for next role: <anything they need to know before they start>
```
