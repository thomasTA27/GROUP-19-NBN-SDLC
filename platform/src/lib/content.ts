import { readFile } from "fs/promises";
import path from "path";
import type { LifecycleNode } from "@/data/lifecycle-map";

export type ModuleContent =
  | { exists: true; markdown: string; sourcePath: string }
  | { exists: false };

/**
 * Reads a box's content from white-paper/<source>/<slug>.md, which lives
 * outside platform/. Content stays in white-paper/ as the single source
 * of truth, this app only renders it.
 */
export async function getModuleContent(
  box: Pick<LifecycleNode, "slug" | "source">
): Promise<ModuleContent> {
  // Repo-relative posix path, used both to read the file below and to let
  // MarkdownContent translate relative links written against this same
  // path, since the file is read from a different base path than the one
  // it is served from.
  const sourcePath = path.posix.join(
    "white-paper",
    box.source,
    `${box.slug}.md`
  );
  const filePath = path.join(process.cwd(), "..", ...sourcePath.split("/"));

  try {
    const markdown = await readFile(filePath, "utf-8");
    return { exists: true, markdown, sourcePath };
  } catch {
    return { exists: false };
  }
}
