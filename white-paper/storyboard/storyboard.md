# Developer storyboard

**Purpose:** walk a single feature through the whole lifecycle map from a
developer's point of view, answering the question Alessio posed: *I am a
developer, this is how I am going to build today's feature.*

**Map this follows:** [design/lifecycle-map/README.md](../../design/lifecycle-map/README.md)
— six phases, three gates, and a governance band underneath.

**Status:** first walkthrough. The gaps it found are recorded at the end rather
than written around.

---

## The feature

A ticket arrives in my queue.

> **NBN-4471** — The service status API tells a customer whether their service
> is down right now, but not whether a planned outage is scheduled. Add planned
> outage information to the existing response.

This is a small, realistic task. It is big enough to pass through every phase,
and small enough that the phases stay visible. It also touches customer-facing
data, which matters later when the map asks how closely a person should
supervise the AI.

---

## 1. Planning and Spec Authoring

*Human decision. Orange on the map.*

**What I do.** I read the ticket and work out what is actually being asked for.
The ticket says to add planned outage information, but it does not say which
fields to include, what happens when several outages are scheduled, or what the
response should look like when there are none.

**What I ask the AI.** I give it the ticket and the current response format, and
ask it to turn the request into acceptance criteria and to list anything that is
unclear.

It returns a sensible set of criteria — return the start time, end time and
reason, and return an empty list when nothing is scheduled. It also raises three
questions I had not considered. What happens if a scheduled outage is cancelled.
What timezone the dates should use. Whether an outage that has already started
belongs here or in the current outage field.

**What I check before accepting.** That it has not invented requirements. It
suggested adding a notification when an outage is scheduled, which nobody asked
for, so I removed it.

The three questions are genuine, so I take them to the product owner rather than
guessing. That conversation is the real work of this phase.

**What comes out.** A specification written clearly enough that an AI agent can
work from it, with the unclear parts resolved rather than left for
implementation to discover.

---

## Gate 1: Plan approved

*A blocking checkpoint. A person signs off before any code is written.*

**What happens.** I show the specification to the tech lead. She disagrees with
one part. Cancelled outages should disappear from the response entirely rather
than appearing with a cancelled label, because the other systems that read this
API will not know what to do with a label they have never seen before.

That took five minutes of her time. If the same problem had surfaced during code
review instead, the work would already have been built the wrong way.

**Pass condition.** A named person has read the specification and agrees it is
what should be built.

---

## 2. Design and Context Engineering

*Human decision. Orange on the map.*

**What I do.** Two things that used to be treated separately.

First, the design. Which service owns this, where the planned outage data is
stored, and whether I am joining two data sources or calling another internal
service.

Second, preparing the repository so the AI works from accurate information. I
check the context file for this service and find it is out of date. It still
describes a database layer we moved away from four months ago.

**What I ask the AI.** Nothing for the context part, because context is
something I supply rather than request. For the design, I ask it to summarise
how the existing endpoint builds its response so that I can follow the same
pattern.

**What I check.** That the context file matches how the service actually works
now. Out-of-date context is worse than no context, because the AI will follow it
confidently.

**What comes out.** An approach, and a repository the AI can work in without
being misled.

**Worth noting.** Fixing the context file took longer than building the feature
will. That is not a failure of the process. It surfaced work that was already
overdue. But it does show that keeping context current is real work rather than
a quick step.

---

## 3. Implementation

*Human verification. Blue on the map.*

**What I do.** I direct the work and check it as it goes. The AI writes the
code, and I read everything it produces before accepting any of it.

**What I ask the AI.** Not "build NBN-4471." I break the work into pieces and
ask for one at a time. First the data access, then the response assembly, then
the case where nothing is scheduled.

**The loop.** Prompt, read the change, then either accept it or ask again. This
happens many times an hour, and most of the time I ask again. The first version
of the data access ignored the cancelled outage rule from Gate 1. I caught it
because I was reading the change as it appeared rather than reviewing everything
at the end.

**What I check before accepting.** Whether the code does what the specification
says, and whether it matches how this codebase already does things. The AI wrote
a new date formatting function when one already exists two directories away.

**How much freedom the AI gets.** This is customer-facing data, so I read every
line. If it were an internal admin screen I would supervise less closely. The
map says supervision varies with risk, and this is what that means in practice.

**Governance at this point.** I commit in small steps, and each commit records
that the change was written with AI assistance.

---

## 4. Testing and QA

*Human verification. Blue on the map.*

**What I do.** Two separate jobs. Review the change, and review the tests.

**What I ask the AI.** To write tests covering the cases in the specification,
including the empty response and the cancelled outage rule.

**What I check.** Whether the tests actually test something. Two of the six it
wrote only checked that the function returned a result, not whether the result
was correct. Those tests would pass whether the code worked or not.

This is the part I would have skipped a year ago. High test coverage is not
evidence of quality when the tests were written from the same understanding as
the code.

**What comes out.** A change and a set of tests, both reviewed by a person, with
a pull request open for the team to see.

---

## Gate 2: Security gate

*A blocking, automated checkpoint. Red on the map.*

**What happens.** Automated scanning runs against the change, looking for
injection, cross-site scripting, exposed secrets, weak encryption settings, and
dependencies that do not exist.

It flags one problem. The address parameter is being inserted directly into a
database query rather than being handled safely. The AI wrote it that way and I
did not notice, which is exactly why this check is automated. It does not depend
on me spotting the problem.

**Pass condition.** A clean scan. Not "I looked at it and it seemed fine."

---

## Gate 3: Release approved

*A blocking checkpoint. A person owns the decision to ship.*

**What happens.** A clean security scan is not the same as a decision to
release. The person who owns this service decides whether the change goes out
now or waits for the next scheduled release window.

This change goes out now. It only adds a new field, and nothing else depends on
that field yet.

**Pass condition.** A named person has agreed to put this in front of customers
and owns that decision.

---

## 5. Deployment

*Human decision. Orange on the map.*

**What I do.** Release the change, and make sure I know how to reverse it.

**What I ask the AI.** To summarise what is actually in this release and what to
watch afterwards. It lists the changed endpoint, the new field, and notes that
the response will be larger for addresses with many scheduled outages.

**What I check.** That the summary matches what actually changed. It does.

**What a person needs before approving.** Who else uses this endpoint, what
happens if the new field is wrong, and how quickly the change can be reversed.

---

## 6. Maintenance and Operations

*Human decision. Orange on the map.*

**What I do.** Watch it in production. Two days later an alert appears. Response
times for this endpoint have increased.

**What I ask the AI.** I give it the monitoring dashboard and the relevant logs,
and ask what changed.

It suggests that the join against the planned outage table has no index, and
proposes adding one. That turns out to be correct, but I confirm it against the
actual database query plan before acting, rather than applying the suggestion
because it sounded convincing.

**What comes out.** A fix, and something learned. The missing index becomes work
for the next cycle, which is the arrow that loops back to Planning.

---

## Governance, running underneath all of it

Two things, and neither of them is a phase.

**Attribution.** Every commit in this feature records that AI was involved. Not
which specific lines, because that question has no clean answer after six rounds
of re-prompting, but that the change was produced with AI assistance.

**Accountability.** My name is on the pull request. If the missing index had
brought the endpoint down at peak time, that would have been mine to answer for,
regardless of which part a model wrote.

---

## Gaps this walkthrough found

The point of writing this was to find where the map cannot yet answer the
question. There are six.

**1. Nothing tells me what this cost.** I re-prompted roughly forty times during
implementation. No phase asks what that consumed, and no phase asks whether
building the feature this way was cheaper than building it by hand. Cost and
metrics were proposed for the governance band and dropped, because we could not
find evidence of how organisations track it. Walking a feature through makes the
absence obvious. A developer finishes the whole cycle with no idea what they
spent.

**2. There is no definition of what counts as risky code.** I said this was
customer-facing so I read every line. That was my judgement, not a rule. The map
says supervision varies with risk but does not say who decides what risky means.
That definition has to come from NBN.

**3. Nobody owns keeping context current.** Fixing the out-of-date context file
took longer than the feature. The map has a Design and Context Engineering
phase, but nothing says who maintains context between features, or when.

**4. There is no path backwards.** Gate 2 failed and I went back to fix the
problem. Every arrow on the map points forwards. In practice a failed gate sends
the work back to an earlier phase, and which phase depends on what failed. The
map does not show this.

**5. Attribution is stated but not specified.** "Recorded at commit time" is the
principle. It does not say recorded how — in the commit message, in a trailer,
in the pull request template. Two developers would do it differently, which
defeats the purpose.

**6. Compliance is not on the map.** NBN has obligations under the Security of
Critical Infrastructure Act, confirmed publicly by their chief security officer.
Gate 2 covers security scanning and Gate 3 covers a release decision. Neither
produces evidence that a regulatory obligation was met. Whether that belongs as
a fourth gate or as something the governance band records is still open.

---

## What this walkthrough confirmed

Three parts of the map held up well.

**Gate 1 earns its place.** Five minutes of a tech lead's time caught a wrong
assumption before any code existed. That is the cheapest correction available
anywhere in the cycle.

**Separating the review of the code from the review of the tests matters.** Two
of the six generated tests checked nothing useful. A phase labelled only
"testing" would not have prompted me to look.

**The security gate has to be automated.** I missed the unsafe query. If that
check had depended on me deciding the change was worth scanning, the problem
would have shipped.