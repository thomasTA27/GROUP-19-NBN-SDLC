# Stage: Planning and Spec Authoring

_Sample placeholder content, added to test the platform's rendering pipeline. Not the researched module content — replace with real research in Sprint 2._

## What the developer does at this stage

The developer turns a feature request into a written spec: what is being built, why, and what "done" looks like. This is the main artefact a human still authors end to end, since it sets the intent that everything downstream — including the AI — works from.

## What to ask the AI

- Ask it to draft a first-pass spec from a rough description, then edit it rather than write from scratch
- Ask it to list edge cases or ambiguities the spec doesn't cover yet
- Ask it to restate the spec back in its own words, as a check that it understood the intent

## What to verify before accepting output

- The spec reflects what was actually meant, not a plausible-sounding guess
- Ambiguous requirements are flagged, not silently resolved one way
- Acceptance criteria are concrete enough to test against later

## How authorship is recorded

The human owns and signs off the final spec. AI-drafted sections are marked as such in the PR description until merged.

## Open questions

- How much of the spec review itself should be AI-assisted vs. fully human?
- Where does this stage's output get stored so later stages can reference it?
