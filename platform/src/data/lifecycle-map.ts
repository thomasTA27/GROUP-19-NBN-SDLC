/**
 * The lifecycle map rendered on the home page.
 *
 * This is the team's agreed map (redrawn 2026-09-10, see the board below).
 * Three layers: phases (rectangles, where work happens), gates (diamonds,
 * blocking controls between phases — no work happens in a gate), and a
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
    source: "modules",
    role: "decision",
  },
  {
    kind: "gate",
    order: 2,
    slug: "plan-approved",
    title: "Plan Approved",
    summary: "A person signs off the plan before an agent starts building against it.",
    source: "modules",
    severity: "normal",
  },
  {
    kind: "phase",
    order: 3,
    slug: "design-and-context-engineering",
    title: "Design and Context Engineering",
    summary: "Shape the solution and prepare the repo so agents work from accurate context.",
    source: "modules",
    role: "decision",
  },
  {
    kind: "phase",
    order: 4,
    slug: "implementation",
    title: "Implementation",
    summary: "The AI generates, the developer directs and checkpoints.",
    source: "modules",
    role: "verification",
  },
  {
    kind: "phase",
    order: 5,
    slug: "testing-and-qa",
    title: "Testing and QA",
    summary: "Review the change and review the tests — two different jobs, both here.",
    source: "modules",
    role: "verification",
  },
  {
    kind: "gate",
    order: 6,
    slug: "security-review",
    title: "Security Gate",
    summary:
      "Automated and blocking — injection, XSS, secrets, weak crypto, hallucinated dependencies. Applied to every AI-authored change, not just the ones that look risky.",
    source: "modules",
    severity: "blocking",
  },
  {
    kind: "gate",
    order: 7,
    slug: "release-approved",
    title: "Release Approved",
    summary: "A human owns the decision to ship — separate from a clean security scan.",
    source: "modules",
    severity: "normal",
  },
  {
    kind: "phase",
    order: 8,
    slug: "deployment",
    title: "Deployment",
    summary: "Ship it, with a person approving what reaches production and owning that call.",
    source: "modules",
    role: "decision",
  },
  {
    kind: "phase",
    order: 9,
    slug: "maintenance-and-operations",
    title: "Maintenance and Operations",
    summary: "Run it, watch it, respond when it breaks — feeds the next cycle's intent back to Planning.",
    source: "modules",
    role: "decision",
  },
  {
    kind: "governance",
    order: 1,
    slug: "attribution",
    title: "Attribution",
    summary: "Who or what wrote this line, recorded at commit time.",
    source: "governance",
  },
  {
    kind: "governance",
    order: 2,
    slug: "accountability",
    title: "Accountability",
    summary: "Who owns the change when it fails, recorded at review and tested at incident.",
    source: "governance",
  },
];

/** The 9 phases + gates, in map order — the main ring. */
export const sequenceNodes = lifecycleMap
  .filter((node): node is Extract<LifecycleNode, { kind: "phase" | "gate" }> =>
    node.kind === "phase" || node.kind === "gate"
  )
  .sort((a, b) => a.order - b.order);

/** Attribution + Accountability — the governance band, not part of the sequence. */
export const governanceNodes = lifecycleMap
  .filter((node): node is Extract<LifecycleNode, { kind: "governance" }> => node.kind === "governance")
  .sort((a, b) => a.order - b.order);

export function getBoxBySlug(slug: string): LifecycleNode | undefined {
  return lifecycleMap.find((node) => node.slug === slug);
}

export const miroBoardUrl = "https://miro.com/app/board/uXjVHoqoc8o=/";
