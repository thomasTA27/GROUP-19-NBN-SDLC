# white-paper/

The white paper: how developers work when they use AI across the software
development lifecycle. This page lists everything the project produced and
where it lives.

**Read it online:** https://group-19-nbn-sdlc.vercel.app/

---

## The lifecycle

Six phases and three gates. Nothing passes a gate unless a named person acts.

```
Planning → [Gate 1: Plan Approved] → Design → Implementation → Testing and QA
→ [Gate 2: Security] → Deployment → [Gate 3: Release Approved] → Maintenance
```

The agreed map is in [`lifecycle-map/`](lifecycle-map/), with a PDF export and
the four original proposals.

## Modules

One file per phase and per gate. See [`modules/README.md`](modules/README.md)
for the template and the one deliberate exception.

| Phase | File |
| --- | --- |
| Planning and Spec Authoring | [`modules/planning-and-spec-authoring.md`](modules/planning-and-spec-authoring.md) |
| Gate 1: Plan Approved | [`modules/plan-approved.md`](modules/plan-approved.md) |
| Design and Context Engineering | [`modules/design-and-context-engineering.md`](modules/design-and-context-engineering.md) |
| Implementation | [`modules/implementation.md`](modules/implementation.md) |
| Testing and QA | [`modules/testing-and-qa.md`](modules/testing-and-qa.md) |
| Gate 2: Security | [`modules/security.md`](modules/security.md) |
| Deployment | [`modules/deployment.md`](modules/deployment.md) |
| Gate 3: Release Approved | [`modules/release-approved.md`](modules/release-approved.md) |
| Maintenance and Operations | [`modules/maintenance-and-operations.md`](modules/maintenance-and-operations.md) |

## Evidence

Each phase was run on a practice project by its author (Part A), repeated by a
second developer from the module alone (Part B), then compared and the module
revised (Part C).

| Phase | Evidence | Result |
| --- | --- | --- |
| Planning and Spec Authoring | [`evidence/planning-and-spec-authoring.md`](evidence/planning-and-spec-authoring.md) | Pass with changes |
| Design and Context Engineering | [`evidence/design-and-context-engineering.md`](evidence/design-and-context-engineering.md) | Pass with changes |
| Implementation | [`evidence/implementation.md`](evidence/implementation.md) | Pass with changes |
| Testing and QA | [`evidence/testing-and-qa.md`](evidence/testing-and-qa.md) | Pass with changes |
| Deployment | — | Not trialled |
| Maintenance and Operations | — | Not trialled |

The working outputs are in `mock-project part-A(Do)/` and
`mock-project part-B(Test)/` at the repository root.

## Usability testing

A developer from outside the team followed a module unaided while a facilitator
watched and explained nothing.

**Report:** [`evidence/usability-testing.md`](evidence/usability-testing.md)

| Item | Where |
| --- | --- |
| Test plans | [`usability/planning-and-spec-authoring-test-plan.md`](usability/planning-and-spec-authoring-test-plan.md), [`usability/implementation-test-plan.md`](usability/implementation-test-plan.md) |
| Facilitator sheets | [`usability/planning-facilitator-sheet.md`](usability/planning-facilitator-sheet.md), [`usability/implementation-facilitator-sheet.md`](usability/implementation-facilitator-sheet.md) |
| Questionnaire and scoring | [`usability/module-usability-questionnaire.md`](usability/module-usability-questionnaire.md), [`usability/module-usability-scoring.md`](usability/module-usability-scoring.md) |
| Session data, 15 Oct 2026 | [`usability/planning-session-2026-10-15/`](usability/planning-session-2026-10-15/) and [`usability/csv/`](usability/csv/) |
| Session findings | [`usability/planning-and-spec-authoring-session-findings.md`](usability/planning-and-spec-authoring-session-findings.md) |
| Observations | [`observations/planning-and-spec-authoring-observations.md`](observations/planning-and-spec-authoring-observations.md) |
| What changed as a result | [`usability/planning-module-revision-log.md`](usability/planning-module-revision-log.md) |

One of two planned sessions ran. The Planning module scored 5 out of 100 on an
adapted usability scale and the specification did not pass Gate 1. Ten problems
were found and all ten were fixed. The revision has not been retested.

## Everything else

| What | Where |
| --- | --- |
| Governance research: attribution, accountability, risk tiers | [`governance/research.md`](governance/research.md) |
| Developer storyboard, one feature through every phase | [`storyboard/storyboard.md`](storyboard/storyboard.md) |
| Two page showcase paper | [`showcase/research-paper.md`](showcase/research-paper.md) |
| Raw research per module | `research/modules/` at the repository root |
| Individual research captures | `research/ai-in-sdlc/` at the repository root |
| The site that renders all of this | `platform/` at the repository root |

## Known gaps at handover

- **Learning paths** were descoped. [`learning-paths/`](learning-paths/) holds
  only a README.
- **The two governance pages** on the platform are placeholders. The research
  behind them is complete.
- **The Security Gate** is written but not linked from the lifecycle map on the
  site.
- **Deployment and Maintenance and Operations** were not trialled on the
  practice project.
- **The Implementation usability session** did not run.
- **`modules/security-review.md`** is a leftover stub that duplicates
  `modules/security.md`. It should be deleted.