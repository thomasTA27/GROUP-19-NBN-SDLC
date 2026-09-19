import path from "path";
import { getBoxBySlug } from "@/data/lifecycle-map";

// Where the repo lives and which branch GitHub links should point at.
// Keep both here so they only need to change in one place.
const GITHUB_REPO_URL = "https://github.com/thomasTA27/GROUP-19-NBN-SDLC";
const GITHUB_BRANCH = "main";

export type LinkResolution =
  | { kind: "internal"; href: string }
  | { kind: "github"; href: string }
  | { kind: "unchanged" };

// Matches a URI scheme like http:, https:, mailto:, and so on.
const SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Works out what a markdown link should become when it is rendered in the
 * app, given the repo-relative posix path of the file the link appears in.
 *
 * Authors write normal GitHub-style relative links. This function is what
 * lets the app translate them, instead of authors having to think about
 * which base path a link will be served from.
 */
export function resolveMarkdownLink(
  href: string,
  sourcePath: string
): LinkResolution {
  if (
    href === "" ||
    href.startsWith("#") ||
    href.startsWith("//") ||
    href.startsWith("/") ||
    SCHEME_PATTERN.test(href)
  ) {
    return { kind: "unchanged" };
  }

  // Split off the fragment now so it can be carried through untouched,
  // whichever of the two outcomes below the link ends up as.
  const hashIndex = href.indexOf("#");
  const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? "" : href.slice(hashIndex);
  const endedInSlash = pathPart.endsWith("/");

  const sourceDir = path.posix.dirname(sourcePath);
  const resolved = path.posix.normalize(path.posix.join(sourceDir, pathPart));

  // A link that climbs above the repo root cannot be resolved to anything
  // real, so leave it as written rather than pointing somewhere wrong.
  if (resolved === ".." || resolved.startsWith("../")) {
    return { kind: "unchanged" };
  }

  const moduleMatch = resolved.match(
    /^white-paper\/(modules|governance)\/([^/]+)\.md$/
  );

  if (moduleMatch) {
    const [, folder, slug] = moduleMatch;
    const box = getBoxBySlug(slug);

    // Only treat it as an internal route if the lifecycle map actually
    // places that slug in the same folder the link resolved to. That
    // guards against a slug that happens to match something else.
    if (box && box.source === folder) {
      return { kind: "internal", href: `/modules/${slug}${fragment}` };
    }
  }

  const githubSegment = endedInSlash
    ? `tree/${GITHUB_BRANCH}`
    : `blob/${GITHUB_BRANCH}`;

  return {
    kind: "github",
    href: `${GITHUB_REPO_URL}/${githubSegment}/${resolved}${fragment}`,
  };
}
