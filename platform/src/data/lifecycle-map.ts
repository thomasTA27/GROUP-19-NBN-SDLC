/**
 * The lifecycle map rendered on the home page.
 *
 * This is the team's agreed map (finalised 2026-09-10). See
 * design/lifecycle-map/README.md for the live Miro board this mirrors.
 *
 * `slug` must match a file at white-paper/<source>/<slug>.md.
 */

export type LifecycleBox = {
  /** Position in the loop. */
  order: number;
  /** Matches <slug>.md under white-paper/<source>/. */
  slug: string;
  title: string;
  /** One-line description shown on the card and as placeholder-page context. */
  summary: string;
  /** Which white-paper/ subfolder holds this box's content. */
  source: "modules" | "governance";
  /** Loop box vs. a cross-cutting item that runs underneath every stage. */
  type: "stage" | "cross-cutting";
};

export const lifecycleMap: LifecycleBox[] = [
  {
    order: 1,
    slug: "planning-and-spec-authoring",
    title: "Planning and Spec Authoring",
    summary: "Decide what to build and write the spec down clearly.",
    source: "modules",
    type: "stage",
  },
  {
    order: 2,
    slug: "design-and-context-engineering",
    title: "Design and Context Engineering",
    summary: "Shape the approach and set up the repo so the AI understands it.",
    source: "modules",
    type: "stage",
  },
  {
    order: 3,
    slug: "implementation",
    title: "Implementation",
    summary: "The AI writes the code and the developer steers.",
    source: "modules",
    type: "stage",
  },
  {
    order: 4,
    slug: "testing-and-qa",
    title: "Testing and QA",
    summary: "Tests green, open PR — where the team process restarts.",
    source: "modules",
    type: "stage",
  },
  {
    order: 5,
    slug: "security-review",
    title: "Security Review",
    summary: "Compliance passed.",
    source: "modules",
    type: "stage",
  },
  {
    order: 6,
    slug: "deployment",
    title: "Deployment",
    summary: "Ship it, with a human approving what goes to production.",
    source: "modules",
    type: "stage",
  },
  {
    order: 7,
    slug: "maintenance-and-operations",
    title: "Maintenance and Operations",
    summary: "Run it, watch it, fix it when it breaks.",
    source: "modules",
    type: "stage",
  },
];

export const stageBoxes = lifecycleMap
  .filter((box) => box.type === "stage")
  .sort((a, b) => a.order - b.order);

export const crossCuttingBoxes = lifecycleMap
  .filter((box) => box.type === "cross-cutting")
  .sort((a, b) => a.order - b.order);

export function getBoxBySlug(slug: string): LifecycleBox | undefined {
  return lifecycleMap.find((box) => box.slug === slug);
}

export const miroBoardUrl =
  "https://miro.com/welcomeonboard/L0I2b3FaTnJBOXZ1dU5hV3hyNTdidkpmMkdvMklWNU5HZ2taS0hYNk9RMXkrNTVYWHFKQWd5YnRmMFMxU05hSG1pamNZRVMyV2tHTjRvdmpZVzdSQ3gzTmZGUnFUR2NudUhlVGpoRUxoaUY1RGFHSmJNbzdzWkhJRDdiWHVyYzY3QTNVZXpxSXBObEppZ0UxYUMzQnV3PT0hdjE=?share_link_id=414717993149";
