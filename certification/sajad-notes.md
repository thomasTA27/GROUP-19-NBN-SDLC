# Claude Certification Notes — Sajad

## My certificates

Claude Code 101: https://verify.skilljar.com/c/g32y99axuksm
Claude 101: https://verify.skilljar.com/c/785mrpnhkkfy

Both completed through Anthropic Academy. They are free and anyone can verify them from those links.

---

## What this file is

Notes on the Claude Code features I think are actually useful for the white paper we are writing.

Our paper has to say what a developer does at each stage of building software when they are using AI. To answer that we need real mechanisms, not general advice. There is a big difference between writing "developers should check AI output" and writing "a hook runs the tests and blocks the commit if they fail". The second one is something a team can actually follow.

So these are the features that could become part of our methodology.

One thing to keep in mind. We have not named our lifecycle stages yet, that happens in Week 2. So when I say a feature fits a certain stage, that is me guessing. Argue with it in the synthesis session.

---

## The features

### CLAUDE.md

A markdown file in the repo that Claude reads automatically. It holds the project context and the team's conventions.

**Where it fits:** everywhere, not one specific stage.

**Why it is useful for us:** this is how a team writes down its standards so everyone's AI behaves the same way. Without it, four developers on the same codebase get four different results. With it, the rules sit in Git, get reviewed in a PR, and apply to everyone.

It is also useful for governance. If someone asks why the AI wrote code a certain way, this file is part of the answer.

**Still unsure about:** whether one file at the root is enough for a big codebase, or whether you need one per area.

---

### Hooks

Scripts that run automatically at certain points, like before a commit or after a file gets edited.

**Where it fits:** git commits, testing, code review.

**Why it is useful for us:** hooks enforce things without anyone having to remember. That matters a lot for a methodology, because a rule people are asked to follow and a rule the system actually enforces are two very different things.

Things you could do with them:

1. Block a commit if the tests fail
2. Enforce the commit message format
3. Run a linter on whatever the AI just edited
4. Record that a file was AI-modified, which helps with the attribution problem

That last one is worth paying attention to. Alessio asked how we know who wrote a piece of code. A hook that records it automatically turns that from a trust question into a recorded fact.

**Worth being honest about:** local hooks can be skipped with `--no-verify`. If our paper recommends them we have to say that, and pair them with something server side.

---

### Slash commands

Custom commands saved in the repo that package up a prompt you use often.

**Where it fits:** anywhere you repeat the same task. Code review, testing, and documentation are the obvious ones.

**Why it is useful for us:** our problem statement says we need to standardise prompt engineering. This is how you actually do it. Instead of telling people to write good prompts, the team writes the prompt once, commits it, and everyone uses the same one.

It turns prompting from a personal skill into something the team owns and improves together through PRs.

---

### Plan Mode

Claude writes out a plan first and waits for you to approve it before changing anything.

**Where it fits:** design, and the start of writing code.

**Why it is useful for us:** every methodology needs a point where a human decides whether to go ahead. This makes that point obvious instead of assumed.

Also useful for the accountability side. If a developer read and approved a plan before any code got written, that is a real decision, not just accepting whatever showed up.

---

### Subagents

Separate agents that handle one specific job with their own context.

**Where it fits:** testing, code review, research.

**Why it might be useful for us:** worth testing whether having one agent review another agent's work is any good. It is the same idea as our rule that a developer never tests their own code, so the separation might carry over.

**Flagging clearly:** I have not tried this properly. Someone should test it in the Week 2 experiments before we put it in the paper.

---

### Approval modes

Settings that control how much Claude does on its own versus asking first.

**Where it fits:** everywhere.

**Why it is useful for us:** our paper should probably say how much freedom the AI gets at each stage instead of treating it as one setting for everything. Rough starting position: tight control near production, looser when you are just exploring.

This is also one of the clearest places our two audiences split. A student or junior developer needs tighter settings than someone experienced who can spot a bad change straight away. Good material for the dual-audience learning path.

---

### Context management

Commands and habits for controlling what the model can actually see.

**Where it fits:** everywhere.

**Why it is useful for us:** the quality of what you get out depends heavily on what you put in, and almost nobody writes this down as a practice. If our paper says what should be in context at each stage, that is genuinely useful and not obvious.

It also connects to tokens. Bad context habits cost real money once a whole team is doing it, which ties the practical side to the governance side.

---

### MCP

A way of connecting Claude to outside tools and data sources.

**Where it fits:** requirements, design, testing, deployment. Anywhere the work depends on something outside the codebase.

**Why it is useful for us:** real development in a big company touches issue trackers, docs, CI, and monitoring. A methodology that assumes the AI only sees code will not hold up in that environment.

**Scope note:** our proposal says we are not integrating with NBN's systems. We can describe MCP as an approach without building anything.

---

## Where I think these fit

First guess at the mapping. This is a starting point for the synthesis session, not a decision.

| Stage        | Possible mechanisms                                                      |
| ------------ | ------------------------------------------------------------------------ |
| Requirements | MCP for issue tracker context, slash commands for analysing requirements |
| Design       | Plan Mode, CLAUDE.md conventions                                         |
| Development  | CLAUDE.md, approval modes, context management                            |
| Testing      | Slash commands, subagents, hooks                                         |
| Code review  | Slash commands, subagents                                                |
| Git commits  | Hooks for message format and attribution                                 |
| Deployment   | Hooks, MCP for CI context                                                |
| All stages   | CLAUDE.md, approval modes, context management, token tracking            |

---

## What the certification did not answer

Writing these down because the gaps are just as useful as the findings, and they tell us where the Week 2 research needs to look.

**Token budgets across a team.** The certification covers using the tools, not running them across a company. How you allocate and track a token budget per person is still open, and it is part of our governance module.

**Attribution in practice.** Hooks look like they could record AI authorship, but I have not seen anyone document how they actually do it. Worth checking during benchmarking whether Google, Microsoft, Atlassian or Anthropic have published anything.

**Liability.** Nothing in the certification touches who is responsible when AI-generated code breaks something. That is a policy question, not a tooling one, so our paper will have to take its own position rather than quote someone else's.

---

## For the rest of the team

Do not add to this file, it has my name on it. Create your own file in this folder instead, like `thomas-notes.md`, and put your certificate links and your own observations in there.

Two or three features each is plenty. Different people notice different things, which is the whole point of us all doing the certification.

Same format works fine: what the feature is, where you think it fits, why it matters for us, and anything you are not sure about.
