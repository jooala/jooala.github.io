# Editing the portfolio

All content lives in two files. You never need to touch layout components to
add, remove or update work.

| File | What it controls |
| --- | --- |
| `src/content/projects.mjs` | Every project: cards, archive, case-study pages, sitemap |
| `src/content/profile.mjs` | Name, intro, bio, About page, experience, links, email |

Text fields support `**bold**` and `[link text](https://…)`.
A field set to `null` renders as a visible **TO ADD** marker on case-study and
About pages while you run `npm run dev` (and is simply hidden on cards), so
gaps are easy to spot. The built site never shows these markers or
`placeholder` blocks: the empty field is left out instead.

---

## Add a project

1. **Make a cover image** (optional but recommended):

   ```bash
   npm run cover -- path/to/image.png my-project
   # optional crop: --crop=left,top,width,height
   ```

   This writes `public/images/covers/my-project.jpg` (1600px) and
   `my-project-sm.jpg` (720px, used in archive grids).

2. **Put any case-study images** in `public/images/my-project/`.

3. **Add an entry** to the `PROJECTS` array in `src/content/projects.mjs`:

   ```js
   {
     slug: 'my-project',                 // URL: /work/my-project/
     title: 'My Project',
     subtitle: 'One-line description',   // shown under featured cards
     summary: 'Two or three sentences for the case-study hero and SEO.',
     role: 'Designer & developer',
     year: 2025,                         // or null
     status: null,                       // e.g. 'Current', 'In development' (used when year is null)
     context: 'Client work · 3 months',
     client: 'Company',                  // optional
     categories: ['ux', 'development'],  // ids from CATEGORIES at the top of the file
     highlights: ['Three', 'short', 'lines'], // overlaid on featured cards
     tools: ['Figma', 'React'],
     featured: false,
     cover: { src: '/images/covers/my-project.jpg', alt: 'Describe the image' },
     hero: null,                         // big image on the case page; falls back to cover, false = none
     links: [{ label: 'Live site', href: 'https://…' }],
     sections: [ /* see "Case-study sections" */ ],
   },
   ```

4. Run `npm run dev` and open `/work/my-project/`.

**Order = numbering.** The position in the array sets the project number
(01, 02, …) and the default archive order.

### Optional fields

| Field | Effect |
| --- | --- |
| `noIndex: true` | Page is published but hidden from search engines and the sitemap |
| `listed: false` | Hidden from the home page, archive and prev/next (URL still works) |
| `cover.position` | CSS `object-position` for cropping, e.g. `'30% 60%'` |
| `cover.thumbPosition` | Optional `object-position` for archive thumbnails only (they crop differently from the big cards) |
| `cover.grayscale` | Black-and-white treatment on cards (full colour on hover, like every cover) |
| `cover.scrim: 'strong'` | Darker overlay for light/busy images so card titles stay readable |
| `poster: { tone: 'blue' \| 'ink', stamp: 'Text', word: 'Text' }` | Typographic poster used when `cover` is `null` (`word` replaces the title on it) |

## Choose featured projects

Set `featured: true`. The home page shows featured projects in the order of
`FEATURED_ORDER` (a list of slugs at the top of `projects.mjs`; featured
projects not in it follow in array order): the first three in the large top
row, the next three in the second row.
Six is the designed number; more will continue in a three-column grid.

## Categories

Categories are defined once in `CATEGORIES` at the top of `projects.mjs`.
A project can have several. Filter buttons only appear for categories that
have at least one project, so adding a category is just adding an entry.

## Case-study sections

`sections` is an array of blocks rendered top to bottom. Blocks with a
`label` get a numbered margin label (`[01] OVERVIEW`). Images are numbered
as figures automatically.

```js
{ type: 'text', label: 'Overview', heading: 'Optional heading', body: ['Paragraph', 'Paragraph'], lead: true }
{ type: 'list', label: 'Systems', heading: '…', intro: '…', items: [{ title: 'Item', body: 'Optional' }] }
{ type: 'cards', label: 'Options', heading: '…', items: [{ title, body, highlight: true }] }
{ type: 'quote', text: 'Pull quote', cite: 'Optional source' }
{ type: 'stats', label: 'Results', intro: '…', items: [{ value: '79.8', label: 'SUS score' }] }
{ type: 'image', src, alt, caption, size: 'full' | 'wide' | 'inset' | 'narrow', bg: 'white' | 'ink' }
{ type: 'gallery', columns: 2 | 3 | 4, bg: 'white' | 'ink', items: [{ src, alt, caption }] }
{ type: 'video', label: 'Demo', youtube: 'VIDEO_ID', title: '…', caption: '…' }
{ type: 'videos', label: 'Trailers', intro: '…', items: [{ youtube: 'ID', title: '…' }] }
{ type: 'split', label: 'Solution', heading: '…', body: ['…'], image: { src, alt } }
{ type: 'placeholder', label: 'Process', note: 'What still needs to be written or shot' }
{ type: 'related', slugs: ['other-project-slug', '…'] }  // banners linking to other case studies
```

`lead: true` sets the text in the larger serif. YouTube videos load only when
clicked. `bg: 'white'` is good for UI screenshots on white backgrounds.

## Update About / contact info

Edit `src/content/profile.mjs`:

- `intro`: the serif line in the hero
- `shortBio`: the About column on the home page
- `photo`: set to `{ src: '/images/about/portrait.jpg', alt: '…' }` to replace the portrait slot
- `about.*`: About page sections (now, background, expertise, experience, education)
- `email`, `social`: used in the footer, contact page and structured data

## The 3D hero

`src/components/hero/MonolithScene.js` builds the scene (procedural concrete,
rally car, lighting, camera). The car and textures are generated in
`src/components/hero/sceneAssets.js`; there are no model files.

On a first visit to the home page on a screen that can run it (1000px+ wide,
WebGL), a loader (markup and script in `src/pages/_document.js`, styles at the
end of `hero.css`) covers the page until the 3D scene has drawn its first
frame, then lifts and the hero animates in. It gives up after 10 s.

`public/images/hero/monolith.webp` is a pre-rendered frame of the scene. It
shows instantly while three.js loads, and is used on screens under 1000px,
when WebGL is unavailable, and via `/?poster`. **If you change the scene,
regenerate it:** run `npm run dev`, open the home page at a wide window (about
1920×1080), then in the browser console run:

```js
copy(window.__captureHero())  // PNG data URL of the current canvas
```

Paste the data URL into a new tab, save it, convert to WebP and replace
`public/images/hero/monolith.webp`.

## The rally minigame

Click the car in the hero (or the **Take it for a spin!** button under it; keyboard users get a
"Play the rally minigame" button by tabbing into the hero). The city rises,
the car jumps onto the grid and a menu offers a **solo race against 9 AI
drivers** or **online rooms** to race friends. Desktop only (it needs the 3D
hero, which runs on screens 1000px and wider).

- **Daily circuit:** a new layout is generated every day at midnight Finnish time, so
  everyone races the same track and the leaderboard resets daily. Each layout
  has rolling hills (high parts become viaducts), a crest jump, a tunnel
  through a concrete megastructure, narrow old-town streets, motorway
  overpasses and a brutalist city. Races are 5 laps.
- **Weather:** each track has a time of day / weather: day, morning, sunset,
  night, fog or night fog. The daily circuit's comes from the date (same for
  everyone); free tracks roll their own. At night the city's windows, street
  lamps and car headlights light up. Presets (sky, fog, sun, lights) and how
  often each comes up are `WEATHERS` / `WEATHER_WEIGHTS` in
  `src/components/rally/settings.js`.
- **Physics:** each car is a rigid body on four springs, so hard hits spin,
  roll and flip cars. A car on its roof or stuck shows a hint; **R** (or the
  HUD button) resets it, otherwise it resets itself after a few seconds.
- **Your car:** the menu has body/stripe/accent colours and a race number,
  saved in the browser and shown to other drivers in online rooms.
- **Free play:** **New random track** in the menu (or the room host's lobby)
  builds a fresh random circuit; **Back to daily** returns to the daily one.
  Free tracks are just for fun: times aren't posted or counted as personal
  bests. In a room the host's track is sent to everyone.
- **Track lab (admin):** type `jooala` in the menu or lobby (not in a text
  field) to show or hide sliders for size, twistiness, hills, jump, road
  width, laps, AI cars, AI skill and the weather. Solo players and room hosts only; it's
  remembered in the browser. The code is `LAB_CODE` in
  `src/components/rally/settings.js`. It's an easter egg, not access
  control: anyone reading the site's JavaScript could find it. Lab races are
  never ranked.
- **Controls:** **W/↑** gas, **S/↓** brake/reverse, **A D / ← →** steer,
  **Space** handbrake, **R** reset to the road, **F** fullscreen, **M** sound,
  **Esc** exit.

| File | What it does |
| --- | --- |
| `src/components/rally/track.js` | Track layout from a seed (the date, or a free-play seed) and optional settings: centre line, hills, jump, zones (tunnel, narrow streets), road width, AI racing line, grid. Pure data |
| `src/components/rally/settings.js` | Laps, default track/race settings, the track lab sliders, `LAB_CODE`, weather presets |
| `src/components/rally/weather.js` | Applies a weather preset: re-tunes the hero scene's lights, fog and exposure, sky colours, night lights; blends between presets |
| `src/components/rally/world.js` | 3D world built from the track: road, barriers, viaducts, tunnel, motorways, footbridges, lamps, signs, billboards, city |
| `src/components/rally/physics.js` | Rigid-body car (springs, tyres, body contacts), car-vs-car impulses, resets, AI driver |
| `src/components/rally/RallyWorld.js` | Intro, menu/lobby, countdown, race loop, effects, netcode. AI drivers in `AI_SPECS` |
| `src/components/rally/RallyHud.js` | HUD, menu, lobby, results, leaderboard, touch controls |
| `src/components/rally/particles.js` / `skids.js` | Dust, tyre smoke, debris, sparks / tyre marks |
| `src/components/rally/net.js` | Supabase: daily leaderboard + Realtime rooms |
| `src/components/rally/audio.js` | Synthesised engine, skid, scrape, crash and beep sounds |

### Turning on the leaderboard and online rooms (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, run `supabase/rally.sql` (creates the
   `rally_times` table and its security policies).
3. In **Project Settings → API**, copy the **Project URL** and the
   **anon / publishable key** into `src/content/online.mjs`. Both are meant to
   be public; the database policies only allow reading and adding times.
4. Rebuild / redeploy. Online rooms use Supabase Realtime (broadcast +
   presence), which needs no extra setup.

Without keys the game still works: times are kept in the visitor's browser
and the online buttons are hidden.

Rooms: one player creates a room and shares the 4-letter code; up to 10
drivers can join, AI drivers fill the empty grid slots. Each player drives
their own car; the host also drives the AI cars for everyone.

Adding `?rallydebug` to the URL exposes `window.__rally.toJump()`,
`toFinish()` and `toIdx(sample, speed)` (plus `track`, `state()` and
`worlds()`, which should always be 1) for testing.

Tuning: AI pace is `AI_LAT` / `AI_BRAKE` in `track.js` and `skill` per driver
in `AI_SPECS`; handling constants are at the top of `physics.js` (`TRIP` and
the `lift`/`kick` factors control how easily cars roll in crashes).

## Deploying (GitHub Pages)

Push to `master`. `.github/workflows/nextjs.yml` runs `npm run build`
(which regenerates `public/sitemap.xml`, then runs the static export) and
publishes `out/` to GitHub Pages.

To check the export locally: `npm run build`, then serve `out/` with any
static server (e.g. `npx serve out`).

URLs use trailing slashes (`/work/frontier/` → `out/work/frontier/index.html`)
so deep links and refreshes work on GitHub Pages without a server. Old
`/projects/…` URLs redirect to their `/work/…` pages
(`src/pages/projects/[slug].js`).
