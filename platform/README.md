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

## The lifecycle map is a placeholder right now

`src/data/lifecycle-map.ts` currently ships with generic `Stage 1`…`Stage
8` fixture entries. **This is not the agreed team map.** The real map is
authored live on Miro (`design/lifecycle-map/README.md`) and hadn't been
finalised by the team as of this platform's Sprint 1 build.

Once the team agrees the map, update `src/data/lifecycle-map.ts`:
`title`/`order`/`category` describe each box, and `slug` must match the
filename the corresponding module will be written as under
`white-paper/modules/` (or `white-paper/governance/` for the band items).

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

Deployed URL: TBD — add it here and in the root `README.md` once live.

## What does not belong here

- The methodology definition itself — that lives in
  [white-paper/](../white-paper/), as plain markdown
- Research, design, or project-management content — those have their own
  top-level folders
