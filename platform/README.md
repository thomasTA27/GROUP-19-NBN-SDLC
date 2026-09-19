# platform/

The demonstration platform: a Next.js site that renders the white
paper's lifecycle map and its modules, deployed on Vercel.

**This is the one exception to "no code" in this repository.**
`package.json`, build config, and application code live here — nowhere
else in the repo.

## What this does

- The home page (`src/app/page.tsx`) renders the lifecycle map as a set
  of clickable boxes, defined in `src/data/lifecycle-map.ts`.
- Clicking a box opens `/modules/<slug>`, which reads and renders
  `white-paper/modules/<slug>.md` (or `white-paper/governance/<slug>.md`
  for the cross-cutting band items) — see `src/lib/content.ts`.
- **Content itself never lives in `platform/`.** It's read at build time
  from `white-paper/`, which stays the single source of truth. This app
  only renders it.
- A box with no matching `.md` file yet renders a "research not started"
  placeholder instead of a broken link.

## Links in markdown

Authors write normal relative links, the same way they would on GitHub,
for example `[see](../governance/research.md)`. The app translates them
at render time instead of asking authors to think about which base path
a link is served from.

`getModuleContent` in `src/lib/content.ts` builds the repo-relative path
of the file being rendered (for example `white-paper/modules/deployment.md`)
and passes it to `MarkdownContent` as `sourcePath`. The pure helper in
`src/lib/links.ts` resolves each link's href against that path and
returns one of three outcomes:

- **Internal route.** The link resolves to `white-paper/modules/<slug>.md`
  or `white-paper/governance/<slug>.md`, and that slug exists in the
  lifecycle map under the matching folder. Rendered as `/modules/<slug>`
  with `next/link`, so any basePath is respected.
- **GitHub.** Anything else that resolves to a real path inside the repo,
  for example a research file or `governance/research.md`. Rendered as a
  link to the repo on GitHub, using `/blob/main/<path>` for a file or
  `/tree/main/<path>` for a folder, opened in a new tab.
- **Unchanged.** Empty hrefs, `#anchors`, links with a scheme such as
  `http:` or `mailto:`, root-relative links, and anything that would
  resolve outside the repo. Rendered exactly as written.

The repo URL and branch used for GitHub links are constants near the top
of `src/lib/links.ts`. If a `sourcePath` is not passed at all,
`MarkdownContent` does no rewriting and renders every link as written.

## The lifecycle map

`src/data/lifecycle-map.ts` holds the team's agreed map (finalised
2026-09-10): Planning and Spec Authoring, Design and Context
Engineering, Implementation, Testing and QA, Security Review,
Deployment, Maintenance and Operations. It mirrors the live Miro board
(`white-paper/lifecycle-map/README.md`), which stays the source of truth —
if the board changes, update this file to match.

Only `planning-and-spec-authoring.md` has real (sample) content so far;
the other six modules are placeholders until Sprint 2 research fills
them in — each one renders the "research not started" state.

If the map itself changes shape (stages added, renamed, or reordered),
update the entries in `src/data/lifecycle-map.ts` — `title`/`order`
describe each box, and `slug` must match the filename of the
corresponding file under `white-paper/modules/` (or
`white-paper/governance/` for any future cross-cutting items, e.g.
attribution/accountability/cost/metrics — not part of the agreed map
yet).

## Development

```bash
npm install
npm run dev
```

Runs at http://localhost:3000. Content is read relative to this folder
(`../white-paper/...`), so run these commands from inside `platform/`,
not the repo root.

```bash
npm run build   # production build — also validates static generation
npm run lint
```

## Deployment (Vercel)

- Project root directory: `platform/`
- **Enable "Include source files outside of the Root Directory in the
  Build Step"** in the Vercel project's build settings — required
  because this app reads `../white-paper/**`, which sits outside the
  configured root directory.
- Framework preset: Next.js (auto-detected). No environment variables
  needed.

Deployed URL: https://group-19-nbn-sdlc.vercel.app/

## What does not belong here

- The methodology definition itself — that lives in
  [white-paper/](../white-paper/), as plain markdown
- Research, sprint, or certification content — those have their own
  top-level folders
