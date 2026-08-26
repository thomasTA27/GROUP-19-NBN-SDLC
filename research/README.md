# research/

Source material and findings that back the white paper. Four people are
capturing research in parallel — everything here uses `TEMPLATE.md` so
the output is comparable no matter who wrote it.

## What belongs here

- `TEMPLATE.md` — the capture format; copy its fields for each new source
- `ai-in-sdlc/` — one findings file per person (e.g. `sajad.md`), covering
  any AI-in-SDLC topic — SDLC fundamentals, AI-assisted coding, AI-assisted
  testing, tool benchmarks
- `modules/` — Sprint 2 research targeted at a specific white paper module
  (named after the lifecycle phase, e.g. `code-review.md`)
- `synthesis.md` — the rollup that pulls findings across everyone's
  captures into conclusions that feed the white paper

## What does not belong here

- The white paper's actual content — findings get cited into
  [white-paper/](../white-paper/), not duplicated there
- Design/lifecycle map content — that goes in [design/](../design/)

## How to add a source

1. Open your personal file in `ai-in-sdlc/` (or the relevant file in
   `modules/` if the research is for a specific stage) — create it if it
   doesn't exist yet, named `firstname.md`
2. Append a new entry using every field in `TEMPLATE.md` — source, date,
   reviewer, key findings, lifecycle stage mapping, relevance to our
   methodology
3. Once there's enough findings across people to draw a conclusion, add it
   to `synthesis.md`
