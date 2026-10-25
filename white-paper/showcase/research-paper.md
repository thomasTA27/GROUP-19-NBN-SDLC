# An AI-Integrated Software Development Lifecycle for Critical Infrastructure

**Team 19, RMIT University** · Thomas Phu Thai Ta, Ujjawal Mittal, Sajad Ali
Akbari, William Lor · Client: NBN Co · October 2026

---

## The problem

Published guides from Google, Microsoft, Atlassian and Anthropic all agree that
a person must review AI-written code. None say who is accountable, at which
point, or what that person has to check. For a company running critical
infrastructure, that gap is the whole question.

We built a six-phase lifecycle with three human gates, tested every phase on a
working project, then gave the guidance to a developer who had not seen it.

## The framework

```
Planning → [Gate 1: Plan Approved] → Design → Implementation → Testing and QA
→ [Gate 2: Security] → Deployment → [Gate 3: Release Approved] → Maintenance
```

Nothing passes a gate unless a named person acts. AI drafts, explores,
summarises and scans. What stays with people is set per phase:

| Phase | What stays with people |
| --- | --- |
| Planning | Deciding scope and answering the open questions |
| Design | Choosing. The named person owns the decision record |
| Implementation | Checking every change, writing the commit message by hand |
| Testing and QA | Sorting the mutation results, the go or no-go |
| Deployment | All promote and rollback decisions |
| Maintenance | Severity, reporting, mitigation, every fix |

Underneath sits a governance band: the tool is recorded at commit time, the
person at review and merge.

## What we found

**Every phase reached the same boundary on its own.** Design puts the line at
the decision record, Implementation at the handwritten commit message,
Deployment and Maintenance at promote, rollback and severity. Nobody
coordinated those choices. That they agree is the finding.

**Getting ready matters more than prompt wording.** A working baseline, checked
controls and short instruction files in the repository changed Implementation
results more than better prompts did, and that cost is paid once.

**Reviewing each change is not enough.** In our Testing run, 124 tests had each
passed review during Implementation. Mutation testing on the finished suite
still found 40 real gaps among 83 survivors, every one a test that ran only one
easy case. A suite can be green, reviewed, and still catch nothing.

**Cost comes from rewriting, not first drafts.** Two runs of the Planning module
on the same ticket cost $1.86 and $12.80, the difference being repeated revision
passes on a large context where each rewrite pays again for the whole session.
Design recorded 80 percent of its usage above 150k context, and Implementation
was the most expensive phase at 222 active minutes across nine work packages.

## Testing the method on itself

Guidance that tells other people how to work should survive being handed to
someone who did not write it.

A computer science student who had never seen the Planning module was given it,
the gate document and a deliberately vague ticket, with a facilitator present
under instruction to explain nothing.

It went badly. The module scored **5 out of 100** on an adapted usability scale.
The specification produced met one of the gate's six criteria, partly met four
and failed one. The participant was blocked at five of the eight steps.

The reason was narrow. Every step that handed him a prompt worked. Every step
that asked for judgement without one stopped him. Step 3 named three checks and
explained none. Step 4 had a placeholder he was meant to fill in himself, and
the module never said what went in it.

Ten problems were recorded and all ten have been fixed. The revision has not
been retested, so no improvement has been measured.

## Limits and conclusion

One practice project, built by the people who wrote the guidance. One
participant, a student rather than a senior engineer. Implementation has not
been usability tested, the revised Planning module has not been retested, and
model settings were not held constant. The figures above come from single runs.
None of this shows the framework produces better software. It shows that it can
be followed, where it cannot, and what following it cost us once.

The useful result is not that AI makes development faster. It is that the
accountability question has a concrete answer: a named person, at a named point,
checking a named thing. Every phase arrived at that boundary on its own
evidence, and the one phase handed to an outsider failed exactly where it asked
for judgement without saying how to use it.


**Repository:** `GROUP-19-NBN-SDLC` · Modules in `white-paper/modules/`,
evidence in `white-paper/evidence/`, usability in `white-paper/usability/`.