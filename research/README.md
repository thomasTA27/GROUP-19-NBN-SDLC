# research/

Source material and findings that back the white paper. Four people are
capturing research in parallel — everything here uses
`ai-in-sdlc/TEMPLATE.md` so the output is comparable no matter who wrote
it.

## What belongs here

- `ai-in-sdlc/` — one findings file per person (e.g. `sajad.md`), covering
  any AI-in-SDLC topic — SDLC fundamentals, AI-assisted coding, AI-assisted
  testing, tool benchmarks — plus the capture template (`TEMPLATE.md`) and
  the cross-person rollup (`synthesis.md`)
- `modules/` — Sprint 2 research targeted at a specific white paper module
  (named after the lifecycle phase, e.g. `code-review.md`)

## What does not belong here

- The white paper's actual content — findings get cited into
  [white-paper/](../white-paper/), not duplicated there
- Lifecycle map content — that goes in
  [white-paper/lifecycle-map/](../white-paper/lifecycle-map/)

## How to add a source

1. Open your personal file in `ai-in-sdlc/` (or the relevant file in
   `modules/` if the research is for a specific stage) — create it if it
   doesn't exist yet, named `firstname.md`
2. Append a new entry using every field in `ai-in-sdlc/TEMPLATE.md` —
   source, date, reviewer, key findings, lifecycle stage mapping,
   relevance to our methodology
3. Once there's enough findings across people to draw a conclusion, add it
   to `ai-in-sdlc/synthesis.md`
