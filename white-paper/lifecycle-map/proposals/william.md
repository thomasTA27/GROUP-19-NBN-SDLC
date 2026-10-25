# Rationale

This diagram is structured similar to a DevOps Lifecycle, however, our contribution is not the phase sequences but embedded human-in-the-loop control layers, adjusted per phases where AI tooling is strong and prevalent versus where human judgment remains irreplaceable. Popular frameworks such as Agile, Waterfall and DevOps lack such specification. With our goal of integrating AI in the SDLC, it can be concluded that each phase of development requires a form of human involvement to ensure quality, but not all human involvement is the same kind, which the two checkpoint types below make explicit.

## Human-Decision Checkpoints (Red Shield)

Human-Decision checkpoints apply where a human is originating a judgment for which no established standard yet exists. The human is setting the reference point, not checking against one. These decisions are typically made under ambiguity, draw on context (business priorities, stakeholder relationships, tacit knowledge, organizational risk) that AI cannot access, and are costly or difficult to reverse once acted on.

This is why Planning/Requirements, Design/Architecture, Deployment, and Maintenance & Operations carry this checkpoint type:

- Requirements elicitation depends on tacit, unstated stakeholder knowledge that only surfaces through interactive dialogue.
- Microsoft's own ten-month case study of Copilot Coding Agent found it "relatively poor at architecting solutions, especially in large codebases that require broad understanding".
- Deployment approval is an accountability-bearing decision requiring traceable audit evidence a black-box AI system cannot produce.
- Maintenance decisions, such as recognising when a recurring incident pattern justifies a structural redesign rather than another patch, all require judgment about organizational priorities and technical-debt tradeoffs that have no predefined answer.

## AI-Assisted Human-Verification Checkpoints (Teal Shield)

AI-Assisted Human-Verification checkpoints apply where AI produces a first-pass output that a human then checks against a standard already established earlier in the loop. The human is verifying conformance, not originating judgment.

This is why Implementation and Testing/Quality Assurance carry this checkpoint type: a code reviewer checks a pull request against coding standards and design decisions set upstream, and a tester checks results against acceptance criteria defined during Planning.

These phases show the strongest documented AI capability in the research (DORA 2025 found writing new code to be the top AI use case at 71% of code-writing respondents), but this is precisely where risk is most easily hidden. Veracode's 2025 GenAI Code Security Report found 45% of AI-generated code samples introduced OWASP Top-10 vulnerabilities, and Stack Overflow's 2025 survey found "almost right, but not quite" AI output to be developers' top frustration.

The checkpoint here is therefore lighter per item than a Human-Decision gate, but must scale with AI-generated volume. DORA's research (2024, reconfirmed 2025) found AI adoption consistently correlated with increased delivery instability, and this risk grows if verification capacity is not deliberately planned alongside AI-driven output volume.

## Why the Loop Shape Follows DevOps, Not Agile or Waterfall

Waterfall's linear, single-pass structure treats Maintenance as a terminal phase rather than a source of feedback, which conflicts with how AI-assisted development actually behaves: production evidence (incidents, usage patterns, technical debt) needs to feed back into Planning continuously, not at the end of a fixed project timeline.

## Why Human-in-the-Loop Cannot Be Represented as Its Own Phase

Modelling human oversight as a discrete stage between two others (for example, between Testing and Deployment) would misrepresent it as a one-time gate, implying AI operates unsupervised throughout the rest of the lifecycle.

## Conclusion

To integrate AI into the SDLC responsibly, it is first necessary to determine where human judgment is structurally irreplaceable and where it instead functions as verification of AI output, then specify each phase's checkpoint accordingly. This is not a limitation on AI adoption but the mechanism that makes it viable at enterprise scale: DORA's own framing describes AI as an "amplifier" that magnifies both the strengths and the dysfunctions of the organization applying it, and the METR randomized controlled trial found experienced developers were measurably slower with AI despite believing themselves faster.

Without specification, the same research findings that motivate AI adoption result in instability, hidden defects, architectural drift and become the risks it introduces instead. Separating decision checkpoints from verification checkpoints is what keeps AI's productivity gains from being undermined by its documented failure modes.
