# Claude Certification Notes — Ujjawal

## My certificates

Claude 101: https://verify.skilljar.com/c/57hz4iip4hyt
Claude Code 101: https://verify.skilljar.com/c/hotj5vqwejuh

Both completed through Anthropic Academy.

---

## The features

### Projects

A dedicated workspace in Claude that holds uploaded documents, custom instructions, and chat history. Everything inside a project shares the same context automatically.

**Where it fits:** requirements, design, onboarding.

**Why it is useful for us:** a project is essentially a knowledge hub for a team working on the same thing. For our methodology, this is how you give the AI the right context at the start of a stage rather than repeating yourself every session. Upload the brief, the requirements doc, the design specs — and everyone on the team works from the same foundation.

It also has a direct governance angle. The instructions field is where a team writes down how the AI should behave for this specific workstream. That is a human decision, recorded and visible, which matters for accountability.

**Still unsure about:** how you keep project knowledge current as a project evolves. Stale documents in the knowledge base could produce confidently wrong outputs.

---

### Artifacts

Standalone outputs Claude creates alongside the conversation — code, documents, diagrams, interactive components — that can be shared, published, or downloaded directly.

**Where it fits:** design, documentation, handoff.

**Why it is useful for us:** from a UX perspective, artifacts are interesting because they are not just text in a chat window. They are actual deliverables. A flowchart, a prototype, a report — these are things that move between roles in a real SDLC. Our methodology should probably say something about when AI output becomes a handoff artifact and what review that requires before it does.

**Worth flagging:** the distinction between an artifact and a finished deliverable matters. An artifact is what Claude produced. A deliverable is what a human reviewed and approved. Our paper should not treat them as the same thing.

---

### Plan Mode

Claude analyzes the codebase and writes out a step-by-step plan before making any changes. Nothing gets edited until you approve the plan.

**Where it fits:** design, start of development, code review.

**Why it is useful for us:** every methodology needs explicit decision points where a human says yes or no before work proceeds. Plan Mode makes that point visible and forces it to happen. Without something like this, the AI just starts doing things and the developer either keeps up or does not.

This is also useful for the dual-audience angle. A junior developer or student benefits more from seeing the plan — it teaches them what the AI is about to do. A senior developer might skip straight to execution. Our paper could recommend Plan Mode as a default for less experienced users and an option for experienced ones.

---

### Skills

Reusable instruction packages that teach Claude a specific workflow. The team creates them once, commits them, and Claude invokes them automatically when relevant.

**Where it fits:** anywhere the team repeats the same task — code review, documentation, testing, requirements analysis.

**Why it is useful for us:** this directly addresses the prompt engineering standardisation problem in our problem statement. Instead of each developer writing their own prompts and getting inconsistent results, the team writes the workflow once and everyone uses the same one. Skills turn prompting from a personal skill into something the team owns and improves together.

It also connects to governance. A skill is a documented, version-controlled decision about how the AI should behave for a particular task. That is reviewable in a PR the same way code is.

**Still unsure about:** how you decide when a workflow is stable enough to turn into a skill versus keeping it flexible in conversation.

---

### Approval Modes

Settings that control how much Claude does autonomously versus asking for permission at each step.

**Where it fits:** everywhere, but the right setting changes by stage and by user.

**Why it is useful for us:** this is one of the clearest places our paper can say something concrete about human oversight. Rather than a general statement like "developers should stay in the loop," we can say what that actually means at each stage. Rough position: tighter approval settings near production, looser when exploring or prototyping.

This is also where the dual-audience angle is most obvious. A student or junior developer needs tighter settings not just for safety but for learning — seeing each step helps build understanding. An experienced developer can afford looser settings because they can spot a bad change quickly. Our learning path section should probably recommend different defaults for different experience levels.

---

### Context Management

The practice of controlling what information Claude can see at any point — what is loaded, what is summarised, and what is cleared.

**Where it fits:** everywhere, but especially important at stage transitions.

**Why it is useful for us:** almost no one writes this down as a deliberate practice, which means almost no one does it well. If our paper says what should be in context at each SDLC stage — and what should not be — that is genuinely useful guidance that is not obvious from the tools alone.

There is also a cost angle. Poor context habits waste tokens, and at team scale that is a real budget problem. Our governance module should connect context discipline to cost management.

---

### CLAUDE.md

A file in the repo that Claude reads automatically at the start of every session. It holds the project stack, the team conventions, and any rules the AI should always follow.

**Where it fits:** everywhere. It is the persistent layer underneath all the other features.

**Why it is useful for us:** from a governance perspective, CLAUDE.md is where team standards live in a form the AI actually uses. Without it, standards exist in a wiki somewhere that Claude has never read. With it, the standards are active every session and version-controlled in Git.

It also answers a question Alessio raised about consistency across the team. Four developers using Claude without a shared CLAUDE.md will get four different behaviours. With one, the AI behaves the same way for everyone by default.

**Connecting to hooks:** CLAUDE.md sets the preferences. Hooks enforce the non-negotiables. Together they cover both the soft conventions and the hard rules.

---

### Research Feature

An agentic multi-source investigation capability. Claude runs multiple searches that build on each other, synthesises findings, and returns a cited report.

**Where it fits:** requirements, competitive analysis, literature review.

**Why it is useful for us:** for the white paper itself, Research is immediately practical — it can do the kind of cross-source synthesis that would otherwise take hours. For the methodology, it maps to the research and requirements phases where a team needs to understand the landscape before making design decisions.

The citation requirement is worth highlighting in our paper. A Research output with citations is much easier to verify and attribute than a response that just asserts things. That matters for the credibility of AI-assisted deliverables.

---

## Where I think these fit

Starting point for the synthesis session. Stage names are placeholders until Week 2.

| Stage        | Possible mechanisms                                                            |
| ------------ | ------------------------------------------------------------------------------ |
| Requirements | Projects (knowledge hub), Research (landscape analysis), Skills (standardised prompts) |
| Design       | Plan Mode, Artifacts (prototype handoffs), Projects (design specs)             |
| Development  | CLAUDE.md, Approval modes, Context management, Skills                          |
| Testing      | Approval modes (tight), Skills (standardised test prompts)                     |
| Code review  | Plan Mode, Artifacts (review outputs), Skills                                  |
| Deployment   | Approval modes (tightest), CLAUDE.md (production rules)                        |
| All stages   | CLAUDE.md, Approval modes, Context management, Projects                        |

---

## What the certification did not answer

**Handoff criteria.** The certifications explain how to create artifacts and outputs but say nothing about what makes an AI output ready to hand off to the next role or stage. That threshold is a human decision and our methodology needs to define it.

**Role boundaries.** As a BA and UX designer, I kept asking where my role ends and the developer's begins when both of us are using AI on the same project. The tools do not answer that. Our paper will need to say something about how AI changes — or does not change — role responsibilities.

**Versioning AI behaviour.** CLAUDE.md and Skills sit in Git, which helps. But the model itself changes. If Anthropic updates Claude, the same instructions might produce different outputs. Our methodology should acknowledge that and say how teams handle it.



