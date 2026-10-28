# white-paper/modules/

One file per phase and per gate of the lifecycle. See
[`../README.md`](../README.md) for the full index.

## The template

Every module follows [`TEMPLATE.md`](TEMPLATE.md), in this order:

- What changes: traditional vs AI-native
- Artifacts generated
- The AI-assisted workflow
- What to ask the AI
- What to verify before accepting output
- Governance and security touchpoints
- How authorship is recorded
- In practice
- Metrics for success
- How this differs by experience level
- What this stage does not cover
- Open questions
- Key takeaways

A reader who learns the shape of one module can navigate any of them.

## One deliberate exception

**Planning and Spec Authoring does not follow the template.** It was rewritten
after usability testing, and seven template sections were removed or merged.
Each change answers a specific finding from that session.

The reasoning is recorded finding by finding in
[`../usability/planning-module-revision-log.md`](../usability/planning-module-revision-log.md).

This is a decision, not an oversight. Anyone revising the modules should read
that log before pulling Planning back into the template, because doing so would
undo changes made on evidence.

## Files

| Phase or gate | File |
| --- | --- |
| Planning and Spec Authoring | `planning-and-spec-authoring.md` |
| Gate 1: Plan Approved | `plan-approved.md` |
| Design and Context Engineering | `design-and-context-engineering.md` |
| Implementation | `implementation.md` |
| Testing and QA | `testing-and-qa.md` |
| Gate 2: Security | `security.md` |
| Deployment | `deployment.md` |
| Gate 3: Release Approved | `release-approved.md` |
| Maintenance and Operations | `maintenance-and-operations.md` |

`security-review.md` is a leftover stub that duplicates `security.md` and
should be deleted.

## Writing a module

Content lives here, never in `platform/`. The site reads these files at build
time, so this folder stays the single source of truth.

Use normal relative links between modules. The platform rewrites them to site
routes, so the same link works on GitHub and on the site.
