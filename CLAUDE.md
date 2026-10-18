# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Regenerate public/sitemap.xml, then static export to /out
npm run cover -- <image> <slug>   # Write optimized covers to public/images/covers/
```

The site is deployed as a **static export** (`output: 'export'`, `trailingSlash: true` in next.config.js) to GitHub Pages via `.github/workflows/nextjs.yml` on push to `master`. Every route is emitted as `<route>/index.html`.

## Architecture

**Next.js Pages Router** portfolio. Brutalist editorial design: off-white paper, black condensed type, industrial blue accent. Source is in `src/`.

**Content is data-driven.** Editing guide: `CONTENT.md`.
- `src/content/projects.mjs`: all projects (array order = project number). Case studies are a `sections` array of typed blocks rendered by `src/components/case/CaseBlocks.js`.
- `src/content/profile.mjs`: personal info, About page content, links. `null` fields render as "TO ADD" markers.
- These are plain `.mjs` data files (no imports) so `scripts/build-sitemap.mjs` can import them in Node.
- `src/lib/projects.js`: derived fields (`no`, `href`, `yearLabel`, `categoryLabels`), filtering/sorting, prev/next.

**Routes (`src/pages/`):** `index.js` (hero, featured, archive preview + about, contact footer), `work/index.js` (filterable/searchable archive, URL-synced), `work/[slug].js` (case studies via getStaticPaths), `about.js`, `contact.js`, `404.js`, `projects/[slug].js` (meta-refresh redirects from the old URLs). Only page components belong in `pages/`.

**3D hero:** `src/components/hero/MonolithScene.js` (R3F, `frameloop="demand"`, pointer/scroll parallax, loaded via `next/dynamic` with `ssr: false`). Procedural textures and the rally car are in `sceneAssets.js`. `public/images/hero/monolith.webp` is a pre-rendered frame used as the instant poster and the fallback (screens <1000px, no WebGL, `/?poster`). Regenerate it after scene changes (see CONTENT.md).

**Rally minigame (`src/components/rally/`):** clicking the hero car sets `phase` in `gameStore.js` (a tiny external store shared by the canvas and the DOM HUD; high-frequency values go through `live`, not React state). `MonolithScene` lazy-mounts `RallyWorld` inside the same canvas, so the hero car (`buildCarRig` in `sceneAssets.js`) is the player car. `Hero.js` pins `.hero__art` to the viewport and animates its `clip-path` while `RallyWorld` uses `camera.setViewOffset` to keep the hero framing during the unfold. The Canvas `frameloop`/`dpr` props are driven by the game phase. Don't set them imperatively, because a re-render resets them. `track.js` and `physics.js` are pure JS with no React and can be simulated outside the browser. The circuit is generated per UTC day (`buildTrack(dayKey())`). `net.js` holds the Supabase leaderboard and Realtime rooms; keys live in `src/content/online.mjs` and the table and policies in `supabase/rally.sql`. Without keys it falls back to localStorage, and the Supabase client is only dynamically imported.

**Styling:** global CSS in `src/styles/` (tokens → base → layout → hero → projects → pages → case → about), imported in `_app.js`. Tailwind is only used for its preflight reset. Tokens are CSS variables in `tokens.css`. Fonts load from Google Fonts in `_document.js` (Anton display, Barlow Condensed titles, Inter body, Newsreader serif, IBM Plex Mono labels). `next/font/google` is not used: Turbopack in this setup rejects the last loader call in each file.

**Motion:** `useReveal` adds `.is-in` to `.reveal` / `.wipe` elements on scroll. These are gated by an `html.js` class so content is visible without JS. All motion respects `prefers-reduced-motion`.

**Analytics:** `src/utils/googleAnalytics.js` (react-ga4), initialised in `_app.js` in production builds only.
