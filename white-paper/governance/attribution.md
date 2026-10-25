# Attribution

## What is code attribution?

It is identifying who or what tool wrote a specific piece of source code.

## How is AI code attributed?

Attribution happens at the commit and build layer.

### Attribution mechanisms

**Tagging**

Linux kernel policy states: "AI agents MUST NOT add Signed-off-by tags. Only humans can legally certify the Developer Certificate of Origin (DCO)" [1]. The human submitter is responsible for reviewing all AI-generated code, ensuring licensing compliance, adding their own Signed-off-by tag, and "[t]aking full responsibility for the contribution" [1].

The kernel's v7.2 documentation specifies an Assisted-by: tag in the format `Assisted-by: AGENT_NAME:MODEL_VERSION [TOOL1] [TOOL2]`, where AGENT_NAME is "the name of the AI tool or framework", MODEL_VERSION is "the specific model version used", and the bracketed items are "optional specialized analysis tools used" (e.g., coccinelle, sparse, smatch, clang-tidy). "Basic development tools (git, gcc, make, editors) should not be listed." Example: `Assisted-by: Claude:claude-3-opus coccinelle sparse` [1]. The in-development kernel documentation (7.3.0) has since simplified this to `Assisted-by: LLM [TOOL1] [TOOL2]` and no longer mentions the model version, so the exact format may change in a future release.

**Developer Certificate of Origin (DCO)**

The Signed-off-by: tag asserts the DCO, whose clause (a) reads: "The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file" [2]. This convention isn't inherently tied to AI-generated code; this methodology adopts the same mechanism and defines a custom DCO matching NBN's policy. Example: "By signing off, I certify that I am the accountable human for this change, that I have reviewed any AI-assisted content in it, and that it complies with NBN's secure coding and compliance standards." The Signed-off-by: tag is the signal that the committer is making the certification; the DCO document itself is what they are certifying by adding that signal.

**Sigstore/gitsign**

Bare tags can be faked; a developer can lie about their commit. Gitsign applies Sigstore's keyless signing to Git commits [3]: the developer authenticates with an OpenID Connect provider (e.g., GitHub or Google), Sigstore's Fulcio certificate authority "issues short-lived certificates binding an ephemeral key to an OpenID Connect identity", the private key is destroyed shortly after signing, and the signing event is logged in Rekor, a public transparency log [31]. This ties the commit to a cryptographically verified identity, not just a self-reported comment.

**SLSA (Supply-chain Levels for Software Artifacts)**

SLSA defines levels of build integrity based on provenance, which "describes what entity built the artifact, what process they used, and what the inputs were" [4]. When code is compiled or packaged into something deployable, the build produces this provenance as a metadata receipt recording, for example, that an artifact was built from commit 123 using a specific build script, on a specific build server, at a specific time.

The guarantees depend on the level [4]:

- Build L1: provenance exists but "may be incomplete and/or unsigned" and is "trivial to bypass or forge".
- Build L2: a hosted build platform ties provenance to its infrastructure "through a digital signature", so forging it takes a deliberate attack, not just editing a commit message.
- Build L3: forging provenance requires "exploiting a vulnerability that is beyond the capabilities of most adversaries", giving "strong confidence that the package was built from the official source and build process."

SLSA doesn't defend against AI-generated code directly, but it does let that code be traced via provenance. It reinforces the build itself against tampering and supports transparency.

## Framework alignment

See `framework-alignment.md` for how these mechanisms map to the Australian Government National AI Centre guidance and the NIST AI RMF.
