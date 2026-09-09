/**
 * The lifecycle map rendered on the home page.
 *
 * This is a PLACEHOLDER fixture, not the agreed team map. The real map is
 * authored on Miro (see design/lifecycle-map/README.md) and has not been
 * finalised yet — white-paper/modules/README.md is explicit that stage
 * names aren't invented ahead of that session.
 *
 * Once the team agrees the map, replace the entries below: `order`/`type`
 * set each box's position in the loop or the cross-cutting band, `slug`
 * must match a file at white-paper/<source>/<slug>.md, and `category`
 * mirrors the Miro legend (existing-changed = cyan, new = purple,
 * renamed = blue).
 */

export type LifecycleBoxCategory = "existing-changed" | "new" | "renamed";

export type LifecycleBox = {
  /** Position in the loop (1-8) for stages, or 1-4 for the band. */
  order: number;
  /** Matches <slug>.md under white-paper/<source>/. */
  slug: string;
  title: string;
  /** One-line description shown on the card and as placeholder-page context. */
  summary: string;
  category: LifecycleBoxCategory;
  /** Which white-paper/ subfolder holds this box's content. */
  source: "modules" | "governance";
  /** Loop box (top/bottom row) vs. the cross-cutting band underneath. */
  type: "stage" | "cross-cutting";
};

export const lifecycleMap: LifecycleBox[] = [
  {
    order: 1,
    slug: "stage-1",
    title: "Stage 1",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "existing-changed",
    source: "modules",
    type: "stage",
  },
  {
    order: 2,
    slug: "stage-2",
    title: "Stage 2",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "existing-changed",
    source: "modules",
    type: "stage",
  },
  {
    order: 3,
    slug: "stage-3",
    title: "Stage 3",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "new",
    source: "modules",
    type: "stage",
  },
  {
    order: 4,
    slug: "stage-4",
    title: "Stage 4",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "new",
    source: "modules",
    type: "stage",
  },
  {
    order: 5,
    slug: "stage-5",
    title: "Stage 5",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "renamed",
    source: "modules",
    type: "stage",
  },
  {
    order: 6,
    slug: "stage-6",
    title: "Stage 6",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "existing-changed",
    source: "modules",
    type: "stage",
  },
  {
    order: 7,
    slug: "stage-7",
    title: "Stage 7",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "renamed",
    source: "modules",
    type: "stage",
  },
  {
    order: 8,
    slug: "stage-8",
    title: "Stage 8",
    summary: "Placeholder — replace once the team agrees the lifecycle map.",
    category: "new",
    source: "modules",
    type: "stage",
  },
  {
    order: 1,
    slug: "attribution",
    title: "Attribution",
    summary: "Placeholder cross-cutting item — who or what wrote this line.",
    category: "new",
    source: "governance",
    type: "cross-cutting",
  },
  {
    order: 2,
    slug: "accountability",
    title: "Accountability",
    summary: "Placeholder cross-cutting item — who owns it when it fails.",
    category: "new",
    source: "governance",
    type: "cross-cutting",
  },
  {
    order: 3,
    slug: "cost",
    title: "Cost",
    summary: "Placeholder cross-cutting item — token and API spend, tracked per team.",
    category: "new",
    source: "governance",
    type: "cross-cutting",
  },
  {
    order: 4,
    slug: "metrics",
    title: "Metrics",
    summary: "Placeholder cross-cutting item — whether any of this is working.",
    category: "new",
    source: "governance",
    type: "cross-cutting",
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
