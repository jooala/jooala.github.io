# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Build for production (outputs static files to /out)
npm run lint     # Run ESLint
```

The site is deployed as a **static export** (`output: 'export'` in next.config.js). After `npm run build`, the `/out` directory contains the deployable static files.

## Architecture

This is a **Next.js personal portfolio site** using the Pages Router (not App Router). Source is in `src/`.

**Page routing:**
- `src/pages/index.js` — home page with hero + project list
- `src/pages/projects/*.js` — individual project case-study pages (doublepoint, sustainablyyours, sauna, bugbear, wolt, botnia, sukeltaja, reaktor)
- `src/pages/_app.js` — global wrapper: imports CSS, sets up route-change transitions (react-transition-group) and Google Analytics

**Shared layout:**
- `src/pages/projects/ProjectLayout.js` — reusable layout for all project pages. Accepts `pageTitle`, `category`, `title`, `meta[]`, `tools[]`, and `children`. All project pages should use this component.

**Key components (`src/components/`):**
- `ThreeBackground.js` — Three.js/R3F animated wireframe boxes in the hero. Loaded via `next/dynamic` with `ssr: false` because it requires `window`. Mouse movement spawns ephemeral box clusters.
- `HeroHeadline.js` — GSAP-animated hero text lines
- `AnimatedProjectRow.js` — AOS-animated row for each project on the home page
- `CustomCursor.js` — Custom cursor replacing the native cursor (native cursor is hidden globally via `cursor: none` in CSS)

**Styling:**
- Tailwind CSS + custom CSS files (`App.css`, `index.css`, `card.css`)
- Design system: dark background `#111111`, light text `#EAEAEA`, accent color `#d5ff3f` (yellow-green)
- Fonts: Oswald (headings/display), Space Grotesk (mapped as `font-poppins`), Inter (body), Space Mono (monospace/labels)
- Headings are globally uppercase via CSS

**Analytics:** `src/utils/googleAnalytics.js` wraps react-ga4. `initGA()` is called once in `_app.js`; `trackPageTime()` is used in pages/layouts and returns a cleanup function.
