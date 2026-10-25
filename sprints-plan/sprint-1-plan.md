# Sprint 1 Plan — Weeks 2 and 3

**Team:** 19-NBN — SDLC Using AI — Team 1
**Done already:** Week 1, Claude certifications
**Remaining:** two weeks, 4 hours each per week, 32 hours total

---

## What we are building

Worth restating plainly, because the tasks have been confusing.

The software development lifecycle has phases. A feature request comes in, someone writes requirements, someone designs, someone writes code, someone tests, it gets reviewed, it ships. Our job is to work out what each of those phases looks like when developers are using AI throughout, and write it down properly.

The steps:

1. Everyone researches AI in the software development lifecycle separately, and each of us draws our own version of the phases as boxes
2. We meet, everyone presents their boxes, and we combine them into one agreed map
3. Each box becomes a research topic in Sprint 2
4. That research becomes a white paper, one module per box
5. We deliver the paper through a Next.js site where each box is a module you can click into

Sprint 1 covers steps 1 and 2, and builds enough of the platform to prove step 5 works.

Whatever comes out of the research may look like an established lifecycle model with AI layered on, or it may end up being something meaningfully different. We are not deciding that in advance. Let the research tell us.

---

## Where everything goes

```
research/
├── TEMPLATE.md                  format for research findings
├── ai-in-sdlc/                  Week 2, one file per person
│   ├── thomas.md
│   ├── ujjawal.md
│   ├── william.md
│   └── sajad.md
├── modules/
│   └── TEMPLATE.md              format for Sprint 2 module research
└── synthesis.md                 what we agreed and rejected in the brainstorm

design/
└── lifecycle-map/
    ├── README.md                link to the final Miro map
    └── proposals/               everyone's own diagram from Week 2

white-paper/
├── storyboard/                  the developer walkthrough
└── governance/                  attribution, accountability, tokens

platform/                        the Next.js site

project/
├── certification/               done
├── meetings/                    minutes and client feedback
└── sprints/                     sprint plans
```

Rule stays the same. Everything except the Planner board lives in the repo and gets linked from the board.

---

## Week 2 — Research and brainstorm

### Everyone researches, 3 hours each

Research what happens to the software development lifecycle when AI is part of it. Understand the standard phases first, then look at what changes when developers are using AI at each one.

Then draw your own version of the lifecycle as a set of boxes. It does not need to be neat. A Miro board, a whiteboard photo, or a sketch is fine. What matters is that you can explain why you picked those boxes and that order.

Everyone does this same task deliberately. The brainstorm only works if four people turn up with views they formed independently, so do not split it up or work on it together.

Each person also takes a different angle so we do not end up with four identical documents:

**Thomas** looks at how organisations document a lifecycle methodology in practice. What a real methodology document looks like, how it is structured, roughly how long.

**Ujjawal** looks at published frameworks. Agile, Waterfall, DevOps, SAFe. What phases they name and where they disagree with each other.

**William** looks at where AI tooling exists today. Which phases already have AI tools in common use and which have almost nothing.

**Sajad** looks at what developers actually do at each phase with AI, as opposed to what the tools can do.

### Brainstorming session, 1 hour, whole team

The pivot point of the sprint. It is only an hour, so everyone needs to arrive prepared.

Running order:
1. Five minutes each, present your diagram uninterrupted
2. List every box anyone proposed on one board
3. Merge the ones that are the same thing under different names
4. Decide keep or drop on the boxes only one person had
5. Agree the order, and whether it forms a cycle
6. Write down what we rejected and why
7. Split the boxes between us for Sprint 2

Step 6 matters. If we cannot say why a box was dropped, someone will propose it again in a fortnight.

---

## Week 3 — Consolidate and close the sprint

**Ujjawal, 4 hours.** Draw the agreed map properly on Miro, since this is what Alessio sees. Then write the developer storyboard, walking one feature through the whole map from a developer's point of view.

**Thomas, 4 hours.** Write up what the brainstorm decided, meet Alessio to show him the map, storyboard and platform, and write the Sprint 2 plan.

**William, 4 hours.** Governance research, which is one of our four named deliverables and has had no owner until now. How AI-written code gets attributed, who is accountable when it fails, how token budgets are tracked. Then define the template for Sprint 2 module research.

**Sajad, 4 hours.** Build the delivery platform. Home page listing the modules, clicking one opens its markdown content, deployed with a live URL.

---

## What we hand over at the end

1. An agreed lifecycle map on Miro, with a written record of what we rejected and why
2. Everyone's research in the repo
3. A developer storyboard
4. Governance research started
5. A working platform with a live URL
6. A module research template ready for Sprint 2
7. Alessio's feedback on all of it, recorded

---

## Three things to watch

**Thirty-two hours is not much.** The three week version had room for a first pass at module research. This one does not. That work moves entirely to Sprint 2, which makes the module template in Week 3 more important, since Sprint 2 has to start fast.

**The platform can eat the paper.** The white paper is what gets marked. The platform is how it gets read. A polished site with three modules written is worse than a plain site with twelve. If the build runs over four hours, the build gets cut, not the research.

**The platform is a change from the approved proposal.** Part A lists a production-ready platform as out of scope. What we are building is a way to read the white paper rather than a separate product, which is different, but Alessio should hear it from us at the Week 3 review rather than find out in Sprint 2.

---

## How we work, unchanged

Everything except the Planner board lives in the repo and gets linked from the board.

Commit messages follow Conventional Commits, `type(scope): description`.

Work on a branch, open a PR. Main is protected.

Before moving a Planner card, write the handoff in the Notes field:

```
Done: what you completed
Deliverable: link to the file or PR
Note for next role: assumptions, gaps, what you left out
```

Only Thomas marks a card Done.
