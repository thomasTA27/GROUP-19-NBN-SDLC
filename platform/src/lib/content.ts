import { readFile } from "fs/promises";
import path from "path";
import type { LifecycleNode } from "@/data/lifecycle-map";

export type ModuleContent =
  | { exists: true; markdown: string }
  | { exists: false };

/**
 * Reads a box's content from white-paper/<source>/<slug>.md, which lives
 * outside platform/. Content stays in white-paper/ as the single source
 * of truth, this app only renders it.
 */
export async function getModuleContent(
  box: Pick<LifecycleNode, "slug" | "source">
): Promise<ModuleContent> {
  const filePath = path.join(
    process.cwd(),
    "..",
    "white-paper",
    box.source,
    `${box.slug}.md`
  );

  try {
    const markdown = await readFile(filePath, "utf-8");
    return { exists: true, markdown };
  } catch {
    return { exists: false };
  }
}
