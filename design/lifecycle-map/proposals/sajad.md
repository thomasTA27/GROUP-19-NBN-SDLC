# Lifecycle map:

**Board Link:** https://miro.com/app/board/uXjVHqzkstM=/?share_link_id=900852880632

## What this is

A map of how software gets built when developers use AI all the time.

It has eight steps in a loop, plus four things that run underneath all of them. Each step could become one module of the white paper.

## How to read the board

Steps 1 to 4 go left to right along the top. The flow then drops down on the right. Steps 5 to 8 go right to left along the bottom. A green arrow on the left takes you back to step 1.

So it is a loop, not a line.

The colours mean:

**Cyan.** The step already existed, but AI changed what you produce in it.

**Purple.** The step is new. It only exists because of AI.

**Blue.** Same name as before, but the work inside it changed.

## The eight steps

**1. Intent and Spec Authoring**
Decide what to build and write it down clearly. When the AI writes the code, the spec is the main thing a human still makes. If the spec is wrong, everything after it is wrong too.

**2. Context Engineering**
Set up the repo so the AI understands it. Build commands, code style, rules, project conventions. The AI only knows what you give it.

**3. Implementation and Generation**
The AI writes the code and the developer steers. This part is fast and cheap now, so it is not the slow part any more.

**4. AI Output Verification**
Check the AI's work before it goes anywhere. This is the important one. Normally a reviewer catches the author's mistakes. Here the author and the reviewer can be the same AI, so a human has to actually look.

**5. Testing and QA**
AI can write a lot of tests very fast. The hard part is checking that the tests actually test something, instead of just going green.

**6. Security Review**
AI code has a high rate of security bugs. In Veracode's testing, about 45 percent of AI generated code had a vulnerability. So AI written code gets its own security check.

**7. Deployment and Release**
Ship it. AI can read the deploy plan and warn you what a change will do, but a human still approves what goes to production.

**8. Operations and Incident Response**
Run it, watch it, fix it when it breaks. Google and Meta both use AI here and both published real numbers on how much it helped.

## The yellow band underneath

Four things that do not belong to any single step, because they happen everywhere:

**Attribution.** Who or what wrote this line of code.

**Accountability.** Who is responsible when it breaks.

**Cost.** How many tokens the team is burning, and who is burning them.

**Metrics.** How we know if any of this is actually working.

The client raised attribution and cost twice, so they matter. But they are not a step. Attribution happens when you commit. Cost happens on every AI call. That is why they run underneath everything instead of sitting in the loop.

## Why it is a loop

Step 8 feeds back into step 1. When something breaks in production, that becomes a new thing to build.

This is not a new idea. Agile and DevOps already worked this way. AI just makes the loop spin faster, because checking happens constantly instead of at the end.

## What I am least sure about

Two boxes are worth arguing about:

**Context Engineering (step 2).** Some people will say writing a README is not a phase.

**AI Output Verification (step 4).** Some people will say we already have code review, so this is double counting.

I have reasons for both, but these are the two I expect to defend.

## Where the classic SDLC fits

The old six phases were requirements, design, implementation, testing, deployment and maintenance.

In this map, requirements became step 1. Implementation became step 3. Testing split into steps 4, 5 and 6. Deployment became step 7. Maintenance became step 8.

Design does not have its own box, which is a gap I know about.
