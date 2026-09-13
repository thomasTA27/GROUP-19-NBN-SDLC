import type { IconId } from "@/components/icons";

/**
 * The lifecycle map rendered on the home page.
 *
 * This is the team's agreed map (redrawn 2026-09-10, see the board below).
 * Three layers: phases (rectangles, where work happens), gates (diamonds,
 * blocking controls between phases; no work happens in a gate), and a
 * governance band (applies across every phase, belongs to none of them).
 *
 * `slug` must match a file at white-paper/<source>/<slug>.md.
 */

export type PhaseRole = "decision" | "verification";
export type GateSeverity = "normal" | "blocking";

type NodeBase = {
  /** Position in the sequence (phases/gates) or band (governance). */
  order: number;
  /** Matches <slug>.md under white-paper/<source>/. */
  slug: string;
  title: string;
  /** One-line description shown on the card and as placeholder-page context. */
  summary: string;
  /** Longer rationale for why this node exists, shown in the "why" list. */
  why: string;
  /** Icon shown on the node. */
  icon: IconId;
  /** Which white-paper/ subfolder holds this node's content. */
  source: "modules" | "governance";
};

export type LifecycleNode =
  | (NodeBase & {
      kind: "phase";
      /** Who's accountable: a human decides, or an AI-drafted result needs human verification. */
      role: PhaseRole;
    })
  | (NodeBase & {
      kind: "gate";
      /** A normal human sign-off, or an automated check that blocks the pipeline. */
      severity: GateSeverity;
    })
  | (NodeBase & { kind: "governance" });

export const lifecycleMap: LifecycleNode[] = [
  {
    kind: "phase",
    order: 1,
    slug: "planning-and-spec-authoring",
    title: "Planning and Spec Authoring",
    summary: "Decide what to build and write the spec down clearly enough for an agent to act on.",
    why: "The spec is the main artifact a human still produces. It carries intent across sessions, so a wrong one propagates into everything downstream.",
    icon: "planning",
    source: "modules",
    role: "decision",
  },
  {
    kind: "gate",
    order: 2,
    slug: "plan-approved",
    title: "Plan Approved",
    summary: "A person signs off the plan before an agent starts building against it.",
    why: "Cheap to do, and it catches a wrong spec before it can propagate into design, code, and tests.",
    icon: "gate-check",
    source: "modules",
    severity: "normal",
  },
  {
    kind: "phase",
    order: 3,
    slug: "design-and-context-engineering",
    title: "Design and Context Engineering",
    summary: "Shape the solution and prepare the repo so agents work from accurate context.",
    why: "Architecture and context preparation are merged into one phase because both are about giving the work a shape before generation starts, including deciding what to leave out of the files an agent loads.",
    icon: "design",
    source: "modules",
    role: "decision",
  },
  {
    kind: "phase",
    order: 4,
    slug: "implementation",
    title: "Implementation",
    summary: "The AI generates, the developer directs and checkpoints.",
    why: "Runs as a tight prompt, read the diff, re-prompt loop, repeated many times an hour, so oversight happens continuously rather than only at the end.",
    icon: "implementation",
    source: "modules",
    role: "verification",
  },
  {
    kind: "phase",
    order: 5,
    slug: "testing-and-qa",
    title: "Testing and QA",
    summary: "Review the change and review the tests, two different jobs, both here.",
    why: "High coverage is no longer evidence of quality. Generated tests can restate what the code already does instead of asserting real behaviour.",
    icon: "testing",
    source: "modules",
    role: "verification",
  },
  {
    kind: "gate",
    order: 6,
    slug: "security-review",
    title: "Security Gate",
    summary:
      "Automated and blocking: injection, XSS, secrets, weak crypto, hallucinated dependencies. Applied to every AI-authored change, not just the ones that look risky.",
    why: "Developers using AI assistants write less secure code while feeling more confident it is secure, a confidence inversion that breaks the judgement shift-left relies on. With flaws in roughly 40 to 45 percent of AI-generated code across independent studies, this cannot be left to discretion, so it blocks automatically on every change.",
    icon: "security",
    source: "modules",
    severity: "blocking",
  },
  {
    kind: "gate",
    order: 7,
    slug: "release-approved",
    title: "Release Approved",
    summary: "A human owns the decision to ship, separate from a clean security scan.",
    why: "A clean security scan is not the same as a decision to ship. Putting a change in front of customers is a call a human should own, separate from the automated check.",
    icon: "gate-flag",
    source: "modules",
    severity: "normal",
  },
  {
    kind: "phase",
    order: 8,
    slug: "deployment",
    title: "Deployment",
    summary: "Ship it, with a person approving what reaches production and owning that call.",
    why: "AI can read the deploy plan and flag blast radius, but a person approves what reaches production and owns that call.",
    icon: "deployment",
    source: "modules",
    role: "decision",
  },
  {
    kind: "phase",
    order: 9,
    slug: "maintenance-and-operations",
    title: "Maintenance and Operations",
    summary: "Run it, watch it, and respond when it breaks, feeding the next cycle's intent back to Planning.",
    why: "AI triages and proposes, humans approve mitigations. Incidents and telemetry from here become the next cycle's intent, which is what closes the loop back to Planning.",
    icon: "maintenance",
    source: "modules",
    role: "decision",
  },
  {
    kind: "governance",
    order: 1,
    slug: "attribution",
    title: "Attribution",
    summary: "Who or what wrote this line, recorded at commit time.",
    why: "Recorded at every commit: who or what wrote this line, at the granularity the work actually happens.",
    icon: "attribution",
    source: "governance",
  },
  {
    kind: "governance",
    order: 2,
    slug: "accountability",
    title: "Accountability",
    summary: "Who owns the change when it fails, recorded at review and tested at incident.",
    why: "Assigned at review and tested at incident. Ownership has to survive past the point the code was written.",
    icon: "accountability",
    source: "governance",
  },
];

/** The 9 phases and gates, in map order: the main ring. */
export const sequenceNodes = lifecycleMap
  .filter((node): node is Extract<LifecycleNode, { kind: "phase" | "gate" }> =>
    node.kind === "phase" || node.kind === "gate"
  )
  .sort((a, b) => a.order - b.order);

/** Attribution and Accountability: the governance band, not part of the sequence. */
export const governanceNodes = lifecycleMap
  .filter((node): node is Extract<LifecycleNode, { kind: "governance" }> => node.kind === "governance")
  .sort((a, b) => a.order - b.order);

export function getBoxBySlug(slug: string): LifecycleNode | undefined {
  return lifecycleMap.find((node) => node.slug === slug);
}

export const miroBoardUrl = "https://miro.com/app/board/uXjVHoqoc8o=/";
