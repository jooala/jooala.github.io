// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CONTENT
//
// Every project page, card, archive entry and the sitemap are generated from
// this file. Array order = project number (01, 02, …) and default archive order.
// See CONTENT.md for the full field reference and how to add a project.
//
// Text fields support **bold** and [links](https://…).
// `null` means "not filled in yet": a visible TO ADD marker on case-study pages
// on the dev server (left out of the built site), or "—" in compact metadata.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'product', label: 'Product' },
  { id: 'ux', label: 'UX/UI' },
  { id: 'games', label: 'Games' },
  { id: 'development', label: 'Development' },
  { id: 'interactive', label: 'Interactive' },
  { id: '3d', label: '3D' },
  { id: 'brand', label: 'Brand' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'tools', label: 'Tools' },
  { id: 'mods', label: 'Game Mods' },
];

// Order of the featured cards on the home page (projects with featured: true).
// Featured projects not listed here follow in project order.
export const FEATURED_ORDER = [
  'wolt-plus',
  'frontier',
  'doublepoint',
  'game-designer-hub',
  'blender-3d-workflow-tools',
  'nemurai-visuals',
];

export const PROJECTS = [
  // ── 01 ────────────────────────────────────────────────────────────────────
  {
    slug: 'wolt-plus',
    title: 'Wolt+',
    subtitle: 'Driving Wolt’s subscription product from 0 to 1',
    summary:
      "Wolt+ is Wolt's subscription product. As its Product Lead (product manager), I drive the product and new initiatives from 0 to 1 across the whole subscription lifecycle: how people discover it, why they join, how they see its value and what makes them stay.",
    role: 'Product Lead / Product Manager',
    year: null,
    status: 'Current',
    context: 'Wolt · since 2025',
    categories: ['product'],
    highlights: ['Growth & retention', 'Experimentation', 'AI-native product work'],
    tools: ['Jira', 'Linear', 'Figma', 'Snowflake', 'Looker', 'Mixpanel', 'Conductrics', 'Claude', 'Cursor', 'Codex'],
    featured: true,
    cover: null,
    poster: { tone: 'blue', stamp: 'Product Lead · Wolt+' },
    hero: null,
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        heading: 'What makes someone feel value, and when.',
        body: [
          "Wolt+ is the subscription inside Wolt's consumer app. I work on it as **Product Lead** (product manager): I drive the product and new initiatives from 0 to 1, from the first idea through discovery and experiments to launch, and my job is to understand what makes someone feel the value of a membership, and when.",
          'People can use Wolt perfectly well without a membership. Getting someone to change their behaviour and subscribe needs a clear extra value that outweighs the commitment, and keeping them needs that value to show up again and again.',
          'I started on Wolt+ as a Product Management Trainee in January 2025 and moved into the Product Lead role in May 2025.',
        ],
      },
      {
        type: 'list',
        label: 'The lifecycle',
        heading: 'From first sight to staying.',
        intro: 'I work across the full subscription lifecycle. This is ongoing work, so this page only covers what is publicly shareable.',
        items: [
          { title: 'Awareness', body: 'How people come across Wolt+ in the first place: the entry points across the app, from checkout to a sticky banner to the user profile, and when each one is the right moment.' },
          { title: 'Value proposition', body: 'How we communicate what a membership gives you, so the value is clear before someone joins and visible once they have.' },
          { title: 'Growth & conversion', body: 'What makes someone decide to sign up. I drove the launch of new subscription campaign capabilities, so markets can run offers that make joining genuinely worth it while also growing the business.' },
          { title: 'Engagement', body: 'What keeps members using their benefits, and how different offers and segments change behaviour over time.' },
          { title: 'Retention', body: 'What makes people stay, including the cancel flow: understanding why members leave and making sure the value of staying is clear at that moment.' },
        ],
      },
      {
        type: 'text',
        label: 'How I work',
        heading: 'Hypotheses, experiments, iteration.',
        body: [
          'Together with design, analytics and engineering I come up with hypotheses, run A/B tests, read the results across markets and segments, and use them to decide what we improve or scale next. Product decisions are about balancing short-term commercial results with long-term retention.',
          'Work runs from 0→1 discovery, user research and product definition, through UX design and experimentation, to international rollout. As a trainee I ran user research on how customers see Wolt+ membership benefits and their value, which fed into the product strategy.',
        ],
      },
      {
        type: 'list',
        label: 'AI-native',
        heading: 'Hands-on, not just documentation.',
        intro: 'With a computer science background, I use AI much more hands-on than for writing or documentation. It lets me test ideas quickly and get things done instead of only planning them.',
        items: [
          { title: 'Production features', body: 'I’ve prototyped and shipped consumer-facing features and code changes in Wolt’s production apps myself, with AI-assisted development.' },
          { title: 'Internal tools & dashboards', body: 'Tools and dashboards that give the team faster answers and reduce work that used to be manual.' },
          { title: 'Automation', body: 'Automated operational workflows such as creating Wolt+ campaigns, so business and operations teams spend far less time on repetitive work.' },
          { title: 'Sharing it', body: 'I regularly share what I learn about using AI with the rest of the company.' },
        ],
      },
      {
        type: 'list',
        label: 'Teams',
        heading: 'A lot of people around one product.',
        intro: 'Much of the job is getting teams aligned around an opportunity, often without direct authority, making decisions with incomplete information, and making sure ideas actually get shipped and measured.',
        items: [
          { title: 'Engineering', body: 'I work with two engineering teams in Europe to take initiatives from idea to launch, and have earlier worked with teams in Japan and with external consultants.' },
          { title: 'Cross-functional', body: 'Day to day with design, analytics, business, marketing, CRM, legal and local market teams across countries.' },
          { title: 'Across the group', body: 'International stakeholders at DoorDash and Deliveroo.' },
        ],
      },
      {
        type: 'related',
        label: 'Read more',
        links: [
          {
            href: 'https://careers.wolt.com/en/blog/tech/product-intern-to-product-lead-joonas-wolt',
            kicker: 'Wolt Careers blog · Jan 2026',
            title: 'From product intern to Product Lead',
            sub: 'How I went from intern to leading Wolt+, in my own words on the Wolt Careers blog.',
            image: { src: '/images/wolt-plus/career-story.jpg', alt: 'Joonas Alanenpää', position: '50% 35%' },
          },
        ],
      },
    ],
  },

  // ── IS Nopeat ─────────────────────────────────────────────────────────────
  {
    slug: 'is-nopeat',
    title: 'IS Nopeat',
    subtitle: 'Short vertical video news for Ilta-Sanomat',
    summary:
      'IS Nopeat is Ilta-Sanomat’s short-form video news: vertical clips you swipe up through on is.fi and in the IS app. As a Product Manager Trainee at Sanoma Media Finland, I worked on launching it, from the product decisions to how it was measured.',
    role: 'Product Manager Trainee, Storytelling',
    year: 2024,
    status: null,
    context: 'Sanoma Media Finland · May–Dec 2024',
    client: 'Sanoma Media Finland',
    categories: ['product'],
    highlights: ['Product launch', 'Swipe-up video feed', 'Engagement metrics'],
    tools: [],
    featured: false,
    cover: { src: '/images/covers/is-nopeat.jpg', alt: 'The IS mark next to a phone with a vertical video feed and an arrow pointing up, on Ilta-Sanomat red' },
    hero: null,
    links: [{ label: 'Ilta-Sanomat', href: 'https://www.is.fi/' }],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          'Ilta-Sanomat is one of Finland’s biggest news sites. **IS Nopeat** (“IS Quick”) brings its news to the format people already scroll every day: short, vertical videos in a feed you swipe through, on the web and in the IS app.',
          'I led and launched it as a Product Manager Trainee in Sanoma Media Finland’s Storytelling team in 2024, where I worked on the front page and content discovery for Helsingin Sanomat and Ilta-Sanomat.',
        ],
      },
      {
        type: 'list',
        label: 'Why',
        heading: 'Meet younger readers where they already are.',
        items: [
          { title: 'A younger audience', body: 'More and more news was being read on social media instead of on news sites. Nopeat was a way to reach younger readers in a format they already use every day.' },
          { title: 'Reuse what was already made', body: 'Sanoma’s video team was already producing short vertical videos for social media. Nopeat makes those same videos visible on Ilta-Sanomat’s own platform too, so the work reaches readers in both places.' },
        ],
      },
      {
        type: 'text',
        label: 'Key decision',
        heading: 'Swipe up, not sideways.',
        body: [
          'One of the main product decisions was how to move between clips. We chose a TikTok-style feed where you swipe **up** to the next video, instead of Instagram Stories-style tapping or swiping from left to right.',
          'Swiping up keeps you in a continuous flow from one clip to the next, so the format holds attention and keeps engagement up.',
        ],
      },
      {
        type: 'image',
        src: '/images/is-nopeat/swipe.jpg',
        alt: 'Diagram: a stories-style phone moving sideways compared to the IS Nopeat feed moving up',
        caption: 'Stories move sideways; Nopeat moves up, one clip after another',
        size: 'inset',
      },
      {
        type: 'list',
        label: 'Measuring',
        heading: 'What we tracked.',
        items: [
          { title: 'Front page impressions', body: 'How often the Nopeat entry point on the front page was seen.' },
          { title: 'Click-through rate', body: 'How many of those impressions turned into opens: the share of people who saw the entry point and tapped into the feed.' },
          { title: 'Views', body: 'How many clips were actually watched.' },
          { title: 'Engagement & 5-second retention', body: 'Especially the retention curve over the first five seconds: does a clip hold people long enough to keep watching?' },
          { title: 'Scroll depth', body: 'How many videos people swipe through in one go, a direct measure of how interesting the feed stays.' },
        ],
      },
      {
        type: 'list',
        label: 'My role',
        heading: 'Working across the whole team.',
        items: [
          { title: 'Launching the format', body: 'Taking Nopeat from an idea to a live product on is.fi and in the IS app.' },
          { title: 'Discovery & prioritisation', body: 'Clarifying needs, success metrics and release plans across the editorial, design and development teams.' },
          { title: 'Data & analytics', body: 'Defining what success looks like for a new video format and setting up the metrics above.' },
          { title: 'Collaboration', body: 'Working with designers, developers and business, and especially closely with the journalists in the video team.' },
        ],
      },
      {
        type: 'text',
        label: 'Today',
        heading: 'Still one of Ilta-Sanomat’s core products.',
        body: [
          'Nopeat is still one of Ilta-Sanomat’s core products: it sits in the sixth position on the is.fi front page and has its own section in the IS mobile app.',
        ],
      },
    ],
  },

  // ── 02 ────────────────────────────────────────────────────────────────────
  {
    slug: 'frontier',
    title: 'Project Frontier',
    subtitle: 'Co-op fantasy survival game for 1–10 players',
    summary:
      "A co-op fantasy survival game I'm making solo: restore a struggling frontier village, recruit residents, craft gear and head out into a dangerous, handcrafted world. Playable solo or with up to ten players.",
    role: 'Solo developer: design, code & art',
    year: null,
    status: 'In development',
    context: 'Independent game · Unity',
    categories: ['games', 'development', '3d'],
    highlights: ['1–10 player co-op', 'Village & expeditions', 'Unity'],
    tools: ['Unity', 'C#', 'Blender', 'Aseprite'],
    featured: true,
    cover: null,
    poster: { tone: 'ink', word: 'Frontier', stamp: 'In development' },
    hero: null,
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Concept',
        lead: true,
        heading: 'Build a home for adventurers, then survive what lies beyond it.',
        body: [
          'Project Frontier is a co-op fantasy survival game for one to ten players that I’m making solo. You restore a struggling frontier village, recruit new residents, build relationships, craft equipment and explore a dangerous handcrafted world.',
          'Time is split between village life and expeditions. You gather resources, find ruins, rescue travellers, hunt creatures and bring materials and knowledge home so the village can grow.',
        ],
      },
      {
        type: 'quote',
        text: 'Home should feel warm, social and safe. The wilderness should feel mysterious, dangerous and lonely. Coming back should feel like a reward, not a chore.',
        cite: 'Design document, player fantasy',
      },
      {
        type: 'list',
        label: 'Design pillars',
        items: [
          {
            title: 'A village worth returning to',
            body: 'The village is the main long-term progression. Residents have schedules, personalities, relationships, requests and stories, and the place visibly grows from a damaged settlement into a working community.',
          },
          {
            title: 'Handcrafted exploration',
            body: 'Villages, castles, ruins, caves, forests and dungeons are designed by hand. Procedural systems only handle secondary detail like foliage, clutter, weather and small encounters.',
          },
          {
            title: 'Deliberate, learnable combat',
            body: 'Authored attacks, committed timing, stamina, lock-on spacing, rolls and readable enemy recovery. Players get better through timing and positioning. Stats matter, but they never replace skill.',
          },
          {
            title: 'Co-op without compromise',
            body: 'Fully playable solo, and built for shared expeditions and shared village progression when friends join.',
          },
        ],
      },
      {
        type: 'list',
        label: 'Systems',
        heading: 'A lot of interlocking parts.',
        intro: 'Each system is designed and documented on its own, then tied into one progression.',
        items: [
          { title: 'Crafting & smelting', body: 'Hands-on crafting at benches, furnaces with upgrade tiers, and recipes taught by quests and dungeons.' },
          { title: 'Building', body: 'Snapping building pieces with a hologram preview, plus settlement plots and tiers.' },
          { title: 'Gathering & professions', body: 'Mining, farming, fishing, cooking and hunting, each with its own skill and perk tree.' },
          { title: 'World & dungeons', body: 'Regions, routes and points of interest, with dungeons that have their own rooms, fights and bosses.' },
          { title: 'Story & NPCs', body: 'Quests, milestones, dialogue and resident daily routines.' },
        ],
      },
      {
        type: 'text',
        label: 'Tooling',
        heading: 'Building the tools to build the game.',
        body: [
          "A game this size needs its own tools. I've built a [Game Designer Hub](/work/game-designer-hub/) of editor tools for the world, dungeons, quests and progression, and [Blender 3D Workflow Tools](/work/blender-3d-workflow-tools/) that keep every asset consistent with the pixel-art look. Both have their own case studies.",
        ],
      },
      { type: 'related', slugs: ['game-designer-hub', 'blender-3d-workflow-tools'] },
    ],
  },

  // ── 03 ────────────────────────────────────────────────────────────────────
  {
    slug: 'game-designer-hub',
    title: 'Game Designer Hub',
    subtitle: 'A suite of Unity editor tools for designing a whole game',
    summary:
      'The design toolset behind Project Frontier: a World Designer, Dungeon Designer, World Director, NPC Schedules and Cinematic Director, joined by one hub that maps the whole progression and catches problems across all of them.',
    role: 'Designer & tools developer',
    year: 2026,
    status: null,
    context: 'Project Frontier · Unity editor tooling',
    categories: ['tools', 'games', 'ux', 'development'],
    highlights: ['World & dungeon design', 'Quests & progression', 'Unity editor tools'],
    tools: ['Unity', 'C#', 'UI Toolkit', 'GraphView', 'Timeline', 'Cinemachine'],
    featured: true,
    cover: { src: '/images/covers/game-designer-hub.jpg', alt: 'Illustration of a progression map: steps across, system bands down, with one highlighted chain of what an item needs and opens' },
    hero: { src: '/images/game-designer-hub/hero.jpg', alt: 'Two Game Designer Hub windows: the overview and the progression map' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          "[Project Frontier](/work/frontier/) is a big game for one person: a world to explore, dungeons, quests, villagers with daily lives, crafting, building and skills. To design it I built my own set of editor tools inside Unity, one for each part of the game, and a hub that ties them together.",
          'Content flows through the tools in order: the world decides where things are, dungeons decide what is inside them, the director turns it all into quests and story, and the hub shows how everything connects, from the first step of a new game to the last.',
          '**Note:** the screenshots show placeholder content. The regions, quests, items and numbers are test data while the game is in development, not the final design.',
        ],
      },
      {
        type: 'image',
        src: '/images/game-designer-hub/overview-video-poster.jpg',
        video: '/videos/game-designer-hub/overview.mp4',
        alt: 'Motion graphic: the World Designer, Dungeon Designer, World Director and progression map, tiling into one hub',
        caption: 'The hub in 17 seconds (placeholder content)',
        size: 'wide',
      },
      {
        type: 'image',
        src: '/images/game-designer-hub/overview.png',
        alt: 'Hub overview: each design tool in the order content flows, with counts and problems, and the progression step by step',
        caption: 'The hub’s front door: every tool in the order content flows (placeholder content)',
        size: 'inset',
        window: 'Design Hub · Overview',
      },
      {
        type: 'text',
        label: 'World Designer',
        heading: 'Handcraft the reasons to travel, vary the journey.',
        body: [
          'The World Designer is where the world’s structure is drawn: continents, regions, the connections between them (roads, valleys, mountain passes, boat routes, story gates), barriers like mountain ranges, rivers, biomes, resources and points of interest such as dungeons, mines and camps.',
          'Each region has a **freedom** value from 0 to 100 %. Important places are hard anchors with exact positions; everything else can move and change shape with the seed. A deterministic generator turns the design plus a seed into a world, so co-op players only need to share the seed.',
          'It also checks itself. A progression validator compares the intended route through the world with what the generated land actually allows, and draws the leak path when there is a shortcut. Seed pages, a 4-up compare view and batch tests over 100 to 10,000 seeds show how robust the rules are, and overlays show danger, buildability, travel time and resource density. Click any piece of land to ask *why is this here?*',
        ],
      },
      {
        type: 'image',
        src: '/images/game-designer-hub/world-poi.png',
        alt: 'World Designer: a generated world map with regions, routes and POIs, and the inspector for a dungeon POI',
        caption: 'World Designer: regions, routes and points of interest, with a POI’s place in the game (placeholder content)',
        size: 'inset',
        window: 'World Designer',
      },
      {
        type: 'text',
        label: 'Dungeon Designer',
        heading: 'Dungeons, caves and mines as graphs.',
        body: [
          'Dungeons are designed graph-first. A dungeon is a flow of rooms (entrance, combat, exploration, key, checkpoint, boss, treasure, secret, exit) built from one of eight archetypes, or authored by hand with procedural pools. The generator then assembles real rooms from a modular kit: corridors, stairs, junctions, lifts and loops.',
          'A validator makes sure keys come before their locks, secrets stay optional and shortcuts can’t skip the boss. Each seed shows up as a layout map with the critical path, and **Play this seed** jumps straight into it. A stress test runs thousands of seeds and writes a report.',
          'The same system drives cave dungeons and mine levels: deeper mine floors are reached by lift cages, with a guardian waiting at the bottom.',
        ],
      },
      {
        type: 'image',
        src: '/images/game-designer-hub/dungeon-designer.png',
        alt: 'Dungeon Designer: a room graph from entrance to exit, the generated layout map and the dungeon’s settings',
        caption: 'Dungeon Designer: the room graph, a generated layout and what the dungeon gives in the game (placeholder content)',
        size: 'inset',
        window: 'Dungeon Designer',
      },
      {
        type: 'text',
        label: 'World Director',
        heading: 'One language for quests, story and unlocks.',
        body: [
          'The World Director turns the game’s systems into progression. Quests, NPCs, dialogue, unlocks and story all use the same conditions (has this item, knows this recipe, reached this skill level, finished this quest, it is winter, it is night) and the same effects (set a milestone, start a quest, give an item, teach a recipe, play a cinematic).',
          'Quests are visual graphs of stages and objectives. Every lock can explain itself: **Why?** tells you in one sentence what is missing, **Simulate** answers what-if questions without playing, and validation jumps straight to a broken node.',
        ],
      },
      {
        type: 'image',
        src: '/images/game-designer-hub/director-quest.png',
        alt: 'World Director: a quest graph with stages from start to completion, and the quest inspector',
        caption: 'World Director: a quest as stages, with its giver, journal text and place in the whole game (placeholder content)',
        size: 'inset',
        window: 'World Director',
      },
      {
        type: 'list',
        label: 'More tools',
        items: [
          {
            title: 'NPC Schedules',
            body: 'A 24-hour timeline for every villager: where they are through the day and the seasons. It flags missing places and clashing times, path-finds the walks between places, and a scrubber previews where everyone is at any hour.',
          },
          {
            title: 'Cinematic Director',
            body: 'Cutscenes on top of Timeline and Cinemachine, written for roles instead of objects, so one scene works for any party from one to ten players. Beats can repeat per player or change with party size, and skipping still applies everything the scene was meant to change.',
          },
          {
            title: 'Crafting, building & skills',
            body: 'Recipes, smelting, building pieces, settlement plots and tiers come from their own catalogs. Skills got a page of their own in the hub: the levelling curve, where experience comes from in code, and the perk tree, edited in place.',
          },
        ],
      },
      {
        type: 'text',
        label: 'The hub',
        heading: 'When does the player get X, and what does X open?',
        body: [
          'Each tool knew its own piece. The hub reads all of them and builds one map of the game: every item, recipe, building, plot, skill, perk, quest, NPC, dungeon and region, linked by what it needs and what it gives. It then works out the step at which each thing first becomes possible from a real new game.',
          'Click anything on the map and what it needs lights up amber, what it opens violet, with its route from a new game and a button to the tool that edits it. In play mode, **Live** ticks off what the current player already has.',
          'The **Issues** page gathers every cross-system problem in one list: missing ids, things nothing can give, skills without a page, broken quest links. And the other tools now show their place in the whole game too, with an **In the game** section that links back to the map.',
        ],
      },
      {
        type: 'image',
        src: '/images/game-designer-hub/map-selected.png',
        alt: 'Progression map with one item selected: what it needs in amber, what it opens in violet',
        caption: 'The progression map: columns are steps from a new game, bands are systems (placeholder content)',
        size: 'inset',
        window: 'Design Hub · Progression map',
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          { src: '/images/game-designer-hub/skills.png', alt: 'Skills page with levelling curve and perk tree', caption: 'Skills: levelling curve, experience sources and perk tree', window: 'Design Hub · Skills' },
          { src: '/images/game-designer-hub/issues.png', alt: 'Issues page listing cross-system problems', caption: 'Issues: every cross-system problem, one click from its cause', window: 'Design Hub · Issues' },
        ],
      },
    ],
  },

  // ── 04 ────────────────────────────────────────────────────────────────────
  {
    slug: 'blender-3d-workflow-tools',
    title: 'Blender 3D Workflow Tools',
    subtitle: 'Pixel-art asset pipeline and Blender workflow tools',
    summary:
      'A set of Blender add-ons and Aseprite extensions that take a model from Blender, through hand-painted pixel textures in Aseprite, into Unity. Every asset ends up at the same pixel density, without the busywork.',
    role: 'Tools developer & technical artist',
    year: 2026,
    status: null,
    context: 'Project Frontier · art pipeline',
    categories: ['tools', '3d', 'games', 'development'],
    highlights: ['Blender add-ons', 'Aseprite extensions', 'Live Blender ↔ Aseprite link'],
    tools: ['Blender', 'Aseprite', 'Unity', 'Claude Code', 'Python', 'Lua', 'C#'],
    featured: true,
    cover: { src: '/images/covers/blender-3d-workflow-tools.jpg', alt: 'Illustration in a Blender-style viewport with the Blender logo: the plank UV template, half guide and half painted, next to the finished pixel-textured plank' },
    hero: null,
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          '[Project Frontier](/work/frontier/) uses 3D models with hand-painted pixel-art textures. That look only works if every asset matches: the same pixel size everywhere, square pixels, small palettes. Doing that by hand for hundreds of assets is slow and easy to get wrong, so I built a pipeline around it.',
          'The path is always the same: model in Blender, lay out UVs, texture in Aseprite, export to Unity. The tools take care of the routine steps in between, and I keep the artistic decisions.',
          'I work AI-native, and this project is a good example: I designed the tools and built them with Claude Code, going from my designs to working tools and iterating until the workflow fit exactly how I make assets.',
        ],
      },
      {
        type: 'image',
        src: '/images/blender-3d-workflow-tools/overview-video-poster.jpg',
        video: '/videos/blender-3d-workflow-tools/overview.mp4',
        alt: 'Motion graphic: the Blender to Aseprite to Unity pipeline, pixel UVs being painted, Material Studio presets and finished assets',
        caption: 'The pipeline in 16 seconds',
        size: 'wide',
      },
      {
        type: 'list',
        label: 'The rules',
        heading: 'Rules that make assets match.',
        items: [
          { title: 'One pixel size per kind of asset', body: '24 px/m for the world, 48 px/m for handheld items, and millimetre-exact sizes for characters and faces. The tools enforce it.' },
          { title: 'Square pixels', body: 'No stretched or sheared texels. An overlay and a validator show exactly where they happen.' },
          { title: 'The look comes from the texture', body: 'Geometry stays clean and low to mid poly; the texture draws the detail.' },
          { title: 'Shipped art is hand-made', body: 'Generated layers are only a starting point to paint over, and they are tagged so a validator can tell them apart from hand-painted pixels.' },
          { title: 'Never edit originals', body: 'UV changes go to a new UV map with a backup, and bought models are copied before anything touches them.' },
        ],
      },
      {
        type: 'list',
        label: 'The tools',
        items: [
          { title: 'Pixel Tools (Blender add-on)', body: 'One panel for pixel-perfect UVs: pick an asset type, prepare UVs at the right density, see a score, a stretch overlay and a pixel checker, give important faces 2× pixels, and export a layered template to Aseprite.' },
          { title: 'Pixel Link (Blender + Aseprite)', body: 'Live two-way painting. Every stroke in Aseprite updates the model in Blender immediately, and Blender strokes come back to Aseprite as one undo step. Built on a small WebSocket server inside Blender.' },
          { title: 'Material Studio (Aseprite extension)', body: 'A procedural pixel-material generator for wood, stone, leather, cloth, metal and more, output as separate editable layers on top of your own painting. It can also retexture flat colours you painted, keeping their hues, outlines and small details.' },
          { title: 'Asset Forge (Blender add-on)', body: 'Converts bought or old models into the Project Frontier style, working on copies: texel density, bakes, a first pixel texture, previews under several lighting setups, validation and Unity export. It also runs headless from the command line.' },
          { title: 'Unity importer', body: 'Picks up the exported FBX and textures, sets point filtering and no compression, builds the material, and checks the scale against what Blender exported.' },
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        bg: 'ink',
        items: [
          { src: '/images/blender-aseprite-unity-pipeline/plank.png', alt: 'Wooden plank with a generated pixel wood texture', caption: 'Material Studio: wood' },
          { src: '/images/blender-aseprite-unity-pipeline/stone.png', alt: 'Stone with a generated pixel stone texture', caption: 'Material Studio: stone' },
        ],
      },
      {
        type: 'list',
        label: 'The workflow',
        heading: 'From a cube to an asset in the game.',
        items: [
          { title: '1. Block out in Unity', body: 'A cube of the planned size next to the player settles the scale before any detail work.' },
          { title: '2. Model in Blender', body: 'Low to mid poly, origin at the base, moving parts as separate objects.' },
          { title: '3. Pixel UVs', body: 'Pixel Tools prepares UVs at the asset type’s density and scores them. Red faces in the stretch overlay need a seam.' },
          { title: '4. Texture in Aseprite', body: 'Export the template, generate a base material with Material Studio, then paint highlights, wear and edges by hand. Pixel Link shows every stroke on the model live.' },
          { title: '5. Validate and export', body: 'Fix every fail, then Export to Unity. Re-exporting under the same name updates every placed copy in the game.' },
        ],
      },
      {
        type: 'text',
        label: 'Why it matters',
        body: [
          'Changing pixel size or UVs after painting is safe: the painting is re-sampled into the new layout automatically, and the old files are kept. I can change my mind late without repainting, and that is what makes a consistent art style realistic for one person.',
        ],
      },
    ],
  },

  // ── 03 ────────────────────────────────────────────────────────────────────
  {
    slug: 'doublepoint',
    title: 'Doublepoint',
    subtitle: 'Gamified fine-motor physiotherapy',
    summary:
      'An IDBM industry project with Doublepoint, a touch-detection startup: finding accessible uses for their wearable sensor technology to make people with fine motor disabilities more independent.',
    role: 'Service design (team project)',
    year: 2023,
    context: 'IDBM capstone industry project, Aalto University · Nov 2022–Jun 2023',
    client: 'Doublepoint (acquired by Oura)',
    categories: ['ux', 'product', 'interactive'],
    highlights: ['Service design', 'Accessibility', 'Wearable XR'],
    tools: ['Double Diamond', 'User interviews', 'Prototyping', 'Business modeling', 'Touch SDK'],
    featured: true,
    cover: { src: '/images/covers/doublepoint.jpg', alt: 'Hand wearing a smartwatch running the Doublepoint touch prototype', position: '60% 62%', thumbPosition: '47% 96%' },
    hero: { src: '/images/doublepoint/coverkuva.png', alt: 'Doublepoint: Gamified fine motor physiotherapy, IDBM project cover' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          'During the IDBM Industry Project course at Aalto University, our interdisciplinary team collaborated with **Doublepoint**, a startup specializing in touch detection technology. Our goal was to find innovative, accessible applications for their wearable sensors, specifically to enhance independence for individuals with fine motor disabilities.',
        ],
      },
      {
        type: 'text',
        label: 'Process',
        heading: 'Seven months, three continents, seven user groups.',
        body: [
          'The 7-month design process involved an immersive exploration of the startup and XR industry landscape, followed by user needs discovery and research on inclusive technologies.',
          'Our team conducted global industry immersion trips to **California and Tokyo**, engaging with professionals and attending XR-related events. We concluded that while the XR industry is heavily dominated by big tech, there is a massive unserved niche market in accessibility.',
          'Applying the **Double Diamond** framework, thorough field research and interviews were conducted with seven diverse user groups and associations. Thematic analysis revealed three main design directions for the touch technology: independent home life, safety alerts, and learning / rehabilitation.',
        ],
      },
      {
        type: 'image',
        src: '/images/doublepoint/userrstory1.png',
        alt: 'User story storyboard: Amanda struggles with everyday tasks, finds home physiotherapy tedious and lacks motivation',
        caption: 'User story: Amanda today',
        size: 'inset',
      },
      {
        type: 'cards',
        label: 'Evaluation',
        heading: 'Three directions, tested for desirability, feasibility and viability.',
        items: [
          {
            title: 'Smart home',
            body: 'Controlling smart home environments using wrist gestures. Cost barriers and financial accessibility made this unfeasible for our target demographic.',
          },
          {
            title: 'Safety alerts',
            body: 'Pinch-to-trigger emergency alerts. Integrating with the wider medical service system made this unfeasible on a startup timeline.',
          },
          {
            title: 'Rehabilitation',
            body: 'Using the touch technology in gamified rehabilitation. Deemed the **most desirable, feasible and viable** direction after evaluation with users.',
            highlight: true,
          },
        ],
      },
      {
        type: 'quote',
        text: "How might Doublepoint's touch detection technology make people with fine motor disabilities more independent?",
        cite: 'Design challenge',
      },
      {
        type: 'text',
        label: 'Solution',
        heading: 'Gamified physiotherapy, controlled with a smartwatch.',
        body: [
          'We designed a gamified physiotherapy concept where users with fine motor disabilities carry out their daily exercises by playing a game. The game is controlled with specified hand gestures (like pinches or clenches), tracked entirely by a standard smartwatch running Doublepoint’s touch algorithm.',
          'The algorithm is heavily customizable, meaning the system can register a “clench” even from users with very limited muscle power. We prototyped this tap-based game and showcased it at events like the **Impact Gala** and **Service Design Day**, receiving highly positive feedback.',
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          { src: '/images/doublepoint/userrstory2.png', alt: 'End-user product ecosystem', caption: 'End-user ecosystem' },
          { src: '/images/doublepoint/prototype.gif', alt: 'Prototype game controlled with hand gestures', caption: 'Working prototype' },
        ],
      },
      {
        type: 'text',
        label: 'Business model',
        body: [
          'The business model revolves around licensing an **Accessibility Touch SDK** to game developers and physiotherapy platforms (like Rehaboo). B2B clients integrate touch detection into their own physiotherapy experiences, without Doublepoint needing to develop the games in-house.',
          'Because the SDK already targets the Unity game engine, pushing it toward accessibility creates a rapid go-to-market strategy that bypasses the saturated consumer mobile gaming space.',
        ],
      },
      {
        type: 'image',
        src: '/images/doublepoint/businessmodel.png',
        alt: 'B2B business model canvas',
        size: 'inset',
      },
    ],
  },

  // ── 04 ────────────────────────────────────────────────────────────────────
  {
    slug: 'sauna-simulator-vr',
    title: 'Sauna Simulator VR',
    subtitle: 'A Finnish sauna, in virtual reality',
    summary:
      'A VR simulation of a traditional Finnish summer cabin and sauna, built in Unity: chop wood, heat the stove, throw water on the rocks for löyly, and relax by the lake.',
    role: 'Lead Developer & 3D Generalist',
    year: 2023,
    context: 'University project · XR course',
    categories: ['games', 'interactive', '3d', 'development'],
    highlights: ['VR development', 'Physics interaction', '3D environment'],
    tools: ['Unity', 'C#', 'Oculus SDK', 'Blender'],
    featured: false,
    cover: { src: '/images/covers/sauna-simulator-vr.jpg', alt: 'Interior render of the virtual sauna with benches and stove' },
    hero: false,
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Concept',
        lead: true,
        body: [
          'A Virtual Reality simulation of a traditional Finnish summer cabin and sauna experience. The goal was to create a highly immersive, physics-heavy environment where users can chop wood, heat up a stove, throw water on the rocks for steam (löyly), and relax by the lake.',
        ],
      },
      { type: 'video', youtube: 'Uj53fOqBb94', title: 'Sauna Simulator VR: demo video' },
      {
        type: 'gallery',
        columns: 2,
        bg: 'ink',
        items: [
          { src: '/images/sauna/kauha.png', alt: 'Sauna bucket and ladle 3D asset', caption: 'Environment assets' },
          { src: '/images/sauna/finnish-sauna-building.png', alt: 'Sauna interior 3D environment', caption: 'Sauna interior' },
        ],
      },
      {
        type: 'list',
        label: 'Development',
        heading: 'Built from the ground up with Unity and the Oculus VR SDK.',
        intro:
          'The core gameplay loop centers on realistic interactions and physics, requiring custom C# scripting for object grabbing, hinge joints (doors, windows) and particle systems.',
        items: [
          {
            title: 'Physics-based interaction',
            body: 'Every log, bucket and tool has a rigidbody. Players physically swing an axe with momentum to split wood, mimicking real-life effort.',
          },
          {
            title: 'Dynamic steam system',
            body: 'When water collides with the heated rocks of the kiuas (stove), custom particle systems trigger löyly, paired with spatial audio recorded in a real sauna.',
          },
          {
            title: 'Environmental storytelling',
            body: 'Built the 3D assets in Blender for a stylized yet grounded “Nordic summer night” look.',
          },
        ],
      },
      {
        type: 'image',
        src: '/images/sauna/saunadev.png',
        alt: 'Sauna Simulator in the Unity editor and Blender during development',
        caption: 'Unity & Blender: development',
        size: 'wide',
      },
    ],
  },

  // ── 05 ────────────────────────────────────────────────────────────────────
  {
    slug: 'bugbear',
    title: 'Wreckfest',
    subtitle: 'Game testing and trailers at Bugbear Entertainment',
    summary:
      "Work with Bugbear Entertainment, the Finnish studio behind FlatOut, Ridge Racer Unbounded and Wreckfest: game testing and QA, plus marketing content and trailers for Wreckfest's full release.",
    role: 'Summer intern: game tester & content creation',
    year: 2019,
    context: 'Game studio · summer 2019 and earlier',
    client: 'Bugbear Entertainment',
    categories: ['games'],
    highlights: ['Game testing & QA', 'Trailer production', 'Bugbear Entertainment'],
    tools: ['Game testing', 'QA', 'Graphic design', 'Video production', 'Bug fixing'],
    featured: true,
    cover: { src: '/images/covers/wreckfest.jpg', alt: 'Wreckfest key art: a stack of wrecked cars at a race track' },
    hero: { src: '/images/bugbear/wreckfest-hero.jpg', alt: 'Wreckfest key art with the game logo and a stack of wrecked cars' },
    links: [
      { label: 'Game credits on MobyGames', href: 'https://www.mobygames.com/developer/sheet/view/developerId,516527/' },
    ],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          'I had the opportunity to work with Bugbear Entertainment multiple times on a variety of tasks related to game development, from graphic design and video production to testing, quality assurance and bug fixing.',
        ],
      },
      {
        type: 'text',
        label: 'Contribution',
        body: [
          "Bugbear Entertainment is one of Finland's best-known video game studios, famous for the **FlatOut series**, **Ridge Racer Unbounded** and the critically acclaimed **Wreckfest**. I'm credited as a Tester on Ridge Racer Unbounded and for Additional Assistance on Wreckfest.",
          "In summer 2019 I was a summer intern: I supported Wreckfest's marketing with content creation, gameplay capture and social media for the announcement trailers of its full release, and helped with quality assurance for the console release.",
          '[View my game credits on MobyGames](https://www.mobygames.com/developer/sheet/view/developerId,516527/)',
        ],
      },
      {
        type: 'videos',
        label: 'Video production',
        intro: "A few trailers I was heavily involved in producing, published on social media as part of Wreckfest's marketing campaign.",
        items: [
          { youtube: 'eRBofi1ZR14', title: 'Wreckfest: Console release date trailer' },
          { youtube: '-m3tAeseBNE', title: 'Wreckfest: Season 2 trailer' },
          { youtube: 'E-p1mQg6KuM', title: 'Wreckfest: Update trailer' },
        ],
      },
    ],
  },

  // ── Game mods ─────────────────────────────────────────────────────────────
  {
    slug: 'repo-modding',
    title: 'R.E.P.O. Modding',
    subtitle: 'Cosmetics and valuables mods, 100K+ downloads',
    summary:
      'Mods for the co-op horror game R.E.P.O., published on Thunderstore as Embers: Karjala Hat, a cosmetic pack with more than 100,000 downloads, and Ember’s Valuables, which adds new loot to haul out.',
    role: 'Modder: modelling, texturing & packaging',
    year: null,
    status: 'Released',
    context: 'R.E.P.O. mods · Thunderstore',
    categories: ['mods', 'games', '3d'],
    highlights: ['108K+ downloads', '2 mods', 'R.E.P.O.'],
    tools: ['Blender', 'Unity', 'Thunderstore'],
    featured: false,
    cover: { src: '/images/covers/repo-modding.jpg', alt: 'R.E.P.O. key art: three robots with a flashlight' },
    hero: { src: '/images/repo-mods/hero.jpg', alt: 'R.E.P.O. key art with the game logo and three robots' },
    links: [
      { label: 'Karjala Hat on Thunderstore', href: 'https://thunderstore.io/c/repo/p/Embers/Karjala_Hat/' },
      { label: 'Ember’s Valuables on Thunderstore', href: 'https://thunderstore.io/c/repo/p/Embers/EmbersValuables/' },
    ],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          'R.E.P.O. is a co-op horror game where a squad of little robots hauls valuables out of haunted places. Its modding community on Thunderstore is huge, and cosmetics and new valuables are two of the most popular categories.',
          'I’ve published two mods there under the name Embers, both with a Finnish twist.',
        ],
      },
      {
        type: 'stats',
        label: 'Reception',
        items: [
          { value: '106K+', label: 'Karjala Hat downloads' },
          { value: '2.2K', label: 'Ember’s Valuables downloads' },
          { value: '11', label: 'mods and modpacks that depend on them' },
        ],
      },
      {
        type: 'text',
        label: 'Karjala Hat',
        heading: 'Two Finnish hats for your robot.',
        body: [
          'A cosmetic mod with a black cap carrying the Karjala beer crest and, as a bonus, a red “liekkipipo” beanie with flames. It is by far the more popular of the two, with more than 100,000 downloads and seven other mods and modpacks that include it. Suomi perkele.',
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          { src: '/images/repo-mods/karjala-hat.jpg', alt: 'Robot wearing the Karjala cap', caption: 'Karjala cap' },
          { src: '/images/repo-mods/liekkipipo.jpg', alt: 'Robot wearing a red beanie with flames', caption: 'Bonus: the liekkipipo' },
        ],
      },
      {
        type: 'text',
        label: 'Ember’s Valuables',
        heading: 'New loot to carry out without breaking it.',
        body: [
          'In R.E.P.O. the whole point is getting valuables out without breaking them. Ember’s Valuables adds my own: a case of **Sandels** beer that spawns in levels alongside the game’s own loot, with more planned.',
          'It is a small mod, but it covers the whole loop of modding a game you don’t have the source for: modelling and texturing the asset, setting it up so the game treats it like its own valuables, and packaging and publishing it for the community.',
        ],
      },
      {
        type: 'image',
        src: '/images/repo-mods/sandels.jpg',
        alt: 'First-person view in R.E.P.O. with the Sandels beer case in the cart',
        caption: 'The Sandels case in the extraction cart',
        size: 'inset',
      },
    ],
  },

  {
    slug: 'nemurai-visuals',
    // non-breaking spaces keep the phrases together when the title wraps
    title: 'Nemurai (Art Direction & Live Visuals)',
    subtitle: 'Live concert visuals made in Blender, After Effects and Resolume',
    summary:
      'Live visuals for Nemurai’s concerts: the Nemurai logo and its animations, 3D scenes rendered in Blender and compositing in After Effects, all performed live in Resolume to the music.',
    role: 'Visual artist & VJ',
    year: 2026,
    status: null,
    context: 'Live concerts · Nemurai',
    categories: ['3d', 'brand', 'interactive'],
    highlights: ['Concert visuals', 'Logo & motion', 'Live in Resolume'],
    tools: ['Blender', 'After Effects', 'Resolume Arena'],
    featured: false,
    cover: { src: '/images/covers/nemurai-visuals.jpg', alt: 'Nemurai on stage, silhouetted against the glitching Nemurai logo on the screen' },
    hero: { src: '/images/nemurai/live-stage.jpg', alt: 'Nemurai on stage, silhouetted against the glitching Nemurai logo on the screen' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        lead: true,
        body: [
          'I make the visuals for Nemurai’s live shows: everything on the screens behind the decks, including the Nemurai logo itself. The aim is a world that matches the music, performed live so it can follow the room in real time.',
        ],
      },
      {
        type: 'text',
        label: 'Logo',
        heading: 'A logo made for the screen.',
        body: [
          'I designed the Nemurai logos and built them to move: glitching, tearing and flickering in sync with the music, or set into a 3D scene. Both clips were recorded straight out of Resolume.',
        ],
      },
      {
        type: 'image',
        src: '/images/nemurai/logo-shrine-poster.jpg',
        video: '/videos/nemurai/logo-shrine.mp4',
        alt: 'Blue Nemurai logo over a dark 3D shrine scene with HUD framing',
        caption: 'Logo over a 3D scene, recorded in Resolume',
        size: 'wide',
      },
      {
        type: 'image',
        src: '/images/nemurai/logo-glitch-poster.jpg',
        video: '/videos/nemurai/logo-glitch.mp4',
        alt: 'Nemurai logo glitching over VHS-style noise',
        caption: 'Glitch logo, recorded in Resolume',
        size: 'inset',
      },
      {
        type: 'list',
        label: 'Process',
        heading: 'From a scene to a set.',
        items: [
          { title: 'Blender', body: '3D scenes built and animated for specific tracks: a city, a room, a tunnel of pixel panels. Rendered as loops so they can run for as long as the song needs.' },
          { title: 'After Effects', body: 'The logo animations, compositing, glitch and colour work on top of the renders, and the transitions between songs.' },
          { title: 'Resolume', body: 'Everything comes together in Resolume Arena. Most tracks have their own clips for the build-up and the drop, so I can perform the visuals live and hit the drop with the music instead of playing back a fixed video.' },
        ],
      },
      {
        type: 'image',
        src: '/images/nemurai/live-booth.jpg',
        alt: 'Nemurai at the decks seen from behind, light beams crossing over the crowd',
        caption: 'Live at the decks. Photo: [Jasu](https://www.instagram.com/jazoophotography). Top photo: [erkko](https://www.instagram.com/lampimedia)',
        size: 'inset',
      },
    ],
  },

  // ── 06 ────────────────────────────────────────────────────────────────────
  {
    slug: 'sustainably-yours',
    title: 'Sustainably Yours',
    subtitle: 'Making fashion sustainability transparent',
    summary:
      "A UI/UX project addressing fashion's environmental impact: a platform that makes brand sustainability transparent and motivates people to donate and recycle clothes.",
    role: 'UX Researcher & Designer',
    year: 2023,
    context: 'UI/UX course project, SUTD Singapore · 4 months',
    categories: ['ux'],
    highlights: ['UX research', 'Prototyping', 'Usability testing'],
    tools: ['Figma', 'Useberry', 'Prototyping', 'User research'],
    featured: false,
    cover: { src: '/images/covers/sustainably-yours.jpg', alt: 'Sustainably Yours logo next to two phones showing the donation screens, on a green blueprint grid' },
    hero: { src: '/images/sustainablyyours/coverkuva.png', alt: 'Sustainably Yours app cover' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Problem',
        lead: true,
        body: [
          'The fashion industry contributes 10% of global carbon emissions yet hides its practices behind sustainability marketing. Consumers discard clothes after an average of 7 wears, and 66% end up in landfills. The challenge: build a platform that makes brand sustainability **transparent and actionable**, and motivates consumers to donate and recycle.',
        ],
      },
      {
        type: 'text',
        label: 'Research',
        heading: 'Literature research and surveys among young adults in Singapore.',
        body: [
          'The fashion industry lacks transparency in sustainability practices, with over 90% of companies not disclosing essential processes. In the U.S., individuals discard 37 kg of clothes annually, with 66% ending up in landfills, typically after only 7 wears.',
          'Surveys targeting people aged 15–24 revealed that 51.6% discard clothing, and only 4% is recycled in Singapore. Barriers to recycling include a lack of convenient options (82.4%), uncertainty about processes (58.8%) and concerns about transparency (61.8%).',
        ],
      },
      {
        type: 'image',
        src: '/images/sustainablyyours/stats.png',
        alt: 'Survey results: why 15–24 year olds don’t recycle. Lack of convenient options 82.4%, uncertainty of processes 58.8%, concerns about transparency 61.8%',
        size: 'inset',
      },
      {
        type: 'list',
        label: 'Target users',
        intro: 'Three user groups with distinct motivations, each requiring a different entry point into the platform.',
        items: [
          { title: 'Primary', body: 'Two distinct groups: those interested in donations but not sustainability rankings, and those interested in rankings but not donations.' },
          { title: 'Secondary', body: 'Interested in both rankings and donations: in-depth statistics and community engagement through brand reviews.' },
          { title: 'Supplemental', body: 'Non-interested users. The platform aims to influence positive change even among those initially uninterested.' },
        ],
      },
      {
        type: 'gallery',
        columns: 3,
        items: [
          { src: '/images/sustainablyyours/test.png', alt: 'Primary user persona' },
          { src: '/images/sustainablyyours/persona2.png', alt: 'Secondary user persona' },
          { src: '/images/sustainablyyours/persona3.png', alt: 'Supplemental user persona' },
        ],
      },
      {
        type: 'text',
        label: 'Prototyping',
        heading: 'From whiteboard to Figma, tested after every round.',
        body: [
          'We designed and tested three core flows: donating clothes, searching sustainability ratings and receiving rewards. Testing after each prototype revealed user preferences, behaviours and expectations, and the iterative process let us refine the app based on feedback.',
          'The first round (sustainability rating awareness and donation behaviour) led to clearer feedback and simpler user journeys. The second round assessed usability with Useberry across personas, reaching a **System Usability Score of 79.8**.',
        ],
      },
      {
        type: 'image',
        src: '/images/sustainablyyours/proto1.png',
        alt: 'First prototypes',
        size: 'inset',
      },
      {
        type: 'stats',
        label: 'Results',
        intro:
          'After two rounds of testing and iteration the final product received top marks. My primary responsibilities were leading the prototyping process and deriving insights from evaluation data.',
        items: [
          { value: '79.8', label: 'System Usability Score' },
          { value: '3', label: 'User flows designed' },
          { value: '2×', label: 'Testing rounds' },
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        items: [
          { src: '/images/sustainablyyours/results_1.png', alt: 'Final app screens 1' },
          { src: '/images/sustainablyyours/results_2.png', alt: 'Final app screens 2' },
          { src: '/images/sustainablyyours/results_3.png', alt: 'Final app screens 3' },
          { src: '/images/sustainablyyours/results_4.png', alt: 'Final app screens 4' },
        ],
      },
    ],
  },

  // ── 07 ────────────────────────────────────────────────────────────────────
  {
    slug: 'sukeltaja',
    title: 'Sukeltaja-App',
    subtitle: 'UX redesign for the Finnish Divers’ Federation',
    summary:
      "Redesigning the mobile app of the Finnish Divers' Federation (Sukeltajaliitto): adding backlog features while simplifying the UX, then helping build it in React Native.",
    role: 'Lead UX/UI Designer',
    year: null,
    context: 'Software development course · 10 cr · 4 months',
    client: 'Sukeltajaliitto ry',
    categories: ['ux', 'development'],
    highlights: ['UX/UI redesign', 'React Native', 'Shipped to production'],
    tools: ['Figma', 'Photoshop', 'React Native', 'Expo', 'Node.js', 'Express'],
    featured: false,
    noIndex: true,
    listed: false, // private: reachable only by direct URL
    cover: { src: '/images/covers/sukeltaja.jpg', alt: 'Sukeltaja-App old UI 1.0 next to new UI 2.0' },
    hero: { src: '/images/sukeltaja/coverKuva.png', alt: 'Sukeltaja-App cover' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Challenge',
        lead: true,
        body: [
          "Redesign the mobile app for the Finnish Divers' Federation (Sukeltajaliitto): add backlog features while simplifying the UX, within an agile team with **no prior UX design experience**.",
        ],
      },
      {
        type: 'split',
        label: 'Context & role',
        body: [
          'Completed as part of a 10-credit software development course over 4 months. Our team ran agile sprints and gathered user feedback throughout.',
          'I stepped up to lead UX and UI. I designed all flows in **Figma and Photoshop** before any code was written, then helped implement the frontend using **React Native and Expo**, backed by a Node.js / Express API.',
        ],
        image: { src: '/images/sukeltaja/mockup.png', alt: 'Sukeltaja-App mobile UI mockup' },
      },
      {
        type: 'video',
        label: 'Walkthrough',
        youtube: 'ytfsuFhI6-A',
        title: 'Sukeltaja-App: before and after',
        caption: 'Before-and-after comparison: the initial state versus the delivered product.',
      },
      {
        type: 'text',
        label: 'Design process',
        body: [
          'Although this was primarily a software development course, we pinpointed usability problems through user interviews and iterated on them. The implemented result evolved further from the original plan as we discovered improvements during development.',
        ],
      },
      {
        type: 'image',
        src: '/images/sukeltaja/sukeltajafigma.png',
        alt: 'Figma design screens for Sukeltaja-App',
        size: 'wide',
        bg: 'white',
      },
      {
        type: 'quote',
        text: 'The client was highly satisfied with the final result, and deploying to production was a success.',
        cite: 'This project was the spark that shifted my focus from pure software engineering toward UX/UI design.',
      },
    ],
  },

  // ── 08 ────────────────────────────────────────────────────────────────────
  {
    slug: 'wolt-grocery-pickup',
    title: 'Wolt Grocery Pickup',
    subtitle: 'Product Manager pre-assignment',
    summary:
      'A pre-assignment for Wolt: conceptualize a grocery store pickup system, map how couriers and store employees communicate on collection orders, and handle edge cases like missing or substituted items.',
    role: 'Product Manager / UX Strategy',
    year: null,
    context: 'Wolt Product Manager pre-assignment',
    categories: ['product', 'ux'],
    highlights: ['Product concept', 'Power-user workflow', 'Prototype'],
    tools: ['Figma', 'UX strategy', 'Product management'],
    featured: false,
    noIndex: true,
    listed: false, // private: reachable only by direct URL
    cover: { src: '/images/covers/wolt-grocery-pickup.jpg', alt: 'Order management screens for grocery pickup', position: '50% 30%' },
    hero: { src: '/images/wolt/coverkuva.png', alt: 'Wolt UI design task cover' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Assignment',
        lead: true,
        body: [
          'A Product Manager pre-assignment for Wolt: conceptualize a **Grocery Store Pickup** system, map out how couriers and store employees communicate on collection orders, and handle edge cases like missing or substituted items.',
        ],
      },
      {
        type: 'text',
        label: 'Problem',
        body: [
          'Experienced couriers (power users) frequently handle multiple simultaneous pickup orders. The existing app forced them to navigate back and forth between individual order screens: a slow, error-prone workflow that hurt both speed and accuracy.',
        ],
      },
      {
        type: 'split',
        label: 'Solution',
        heading: 'Streamlining multi-order workflows.',
        body: [
          'I added a persistent button in the header of the collection order screen. Tapping it surfaces a quick-access overlay listing all active and ready orders, letting power users jump between them without losing context or navigating back.',
          'The solution required no new mental model: the overlay mirrors the existing order card structure, just surfaced on demand.',
        ],
        image: { src: '/images/wolt/animation.gif', alt: 'Prototype animation of the multi-order feature' },
      },
      {
        type: 'image',
        src: '/images/wolt/orders.png',
        alt: 'Orders interface',
        size: 'inset',
        bg: 'white',
      },
      {
        type: 'quote',
        text: 'The design prioritizes power users, people who already know the system well, by reducing the number of taps between orders from ~5 to 1.',
      },
    ],
  },

  // ── 09 ────────────────────────────────────────────────────────────────────
  {
    slug: 'reaktor',
    title: 'Reaktor Case Assignment',
    subtitle: 'Prescription & pharmacy stock finder',
    summary:
      'Designing a user-friendly interface for checking prescription validity and locating the nearest pharmacies that have the medication in stock.',
    role: 'UI/UX Designer',
    year: null,
    context: 'Reaktor pre-assignment',
    categories: ['ux'],
    highlights: ['Map interface', 'Healthcare UX', 'Prototype'],
    tools: ['Figma', 'UI/UX design', 'Map interfaces', 'Prototyping'],
    featured: false,
    noIndex: true,
    listed: false, // private: reachable only by direct URL
    cover: { src: '/images/covers/reaktor.jpg', alt: 'Pharmacy map locator screens' },
    hero: { src: '/images/reaktor/cover.png', alt: 'Health app screens' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Assignment',
        lead: true,
        body: [
          'Design a user-friendly interface for checking prescription validity and locating the nearest pharmacies that have the medication **available in stock**.',
        ],
      },
      {
        type: 'text',
        label: 'Problem',
        body: [
          'Finding a pharmacy with your exact prescribed medication in stock is historically opaque: users typically call pharmacies one by one or drive between them, wasting time and energy. This pain is sharpest for elderly patients and those with chronic prescriptions.',
        ],
      },
      {
        type: 'image',
        src: '/images/reaktor/bloodpressure.png',
        alt: 'Blood pressure medication tracking screens',
        size: 'inset',
        bg: 'white',
      },
      {
        type: 'text',
        label: 'Solution',
        heading: 'A colour-coded map.',
        body: [
          'Rather than a list of results, I designed a map view where pharmacies are instantly colour-coded: green for in stock, grey for unavailable. One tap on any green pin surfaces stock details and a “Get directions” button using the device’s GPS.',
        ],
      },
      {
        type: 'quote',
        text: "The key insight: don't make users read a list. Let the map answer the question at a glance.",
      },
      {
        type: 'image',
        src: '/images/reaktor/map.png',
        alt: 'Pharmacy map locator UI',
        size: 'wide',
        bg: 'white',
      },
    ],
  },

  // ── 10 ────────────────────────────────────────────────────────────────────
  {
    slug: 'botnia-vikings',
    title: 'Botnia Vikings',
    subtitle: 'Esports brand identity',
    summary:
      'A cohesive visual identity for Botnia Vikings, a Finnish esports organization: logo, social media templates, typography and brand guidelines.',
    role: 'Brand Identity & Visual Design',
    year: null,
    context: 'Botnia Vikings Esports',
    client: 'Botnia Vikings Esports',
    categories: ['brand'],
    highlights: ['Visual identity', 'Social templates', 'Guidelines'],
    tools: ['Photoshop', 'Illustrator', 'Figma', 'Brand guidelines'],
    featured: false,
    noIndex: true,
    listed: false, // private: reachable only by direct URL
    cover: { src: '/images/covers/botnia-vikings.jpg', alt: 'Botnia Vikings victory screen template' },
    hero: { src: '/images/botnia/banner3.png', alt: 'Botnia Vikings banner' },
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Brief',
        lead: true,
        body: [
          'Build a **cohesive visual identity** for Botnia Vikings, a Finnish esports organization, covering logo, social media templates, typography and brand guidelines. The identity had to feel competitive and professional while reflecting a distinct Nordic edge.',
        ],
      },
      {
        type: 'image',
        src: '/images/botnia/logo.png',
        alt: 'Botnia Vikings logo',
        size: 'narrow',
        bg: 'ink',
      },
      {
        type: 'text',
        label: 'Guidelines',
        heading: 'One visual language across every touchpoint.',
        body: [
          'The deliverables established a consistent visual language from match-day announcements to stream overlays. A strict colour palette and typography system kept every asset instantly recognizable as Botnia Vikings.',
        ],
      },
      {
        type: 'gallery',
        columns: 2,
        bg: 'ink',
        items: [
          { src: '/images/botnia/banner3.png', alt: 'Banner design', caption: 'Banner' },
          { src: '/images/botnia/victory2.png', alt: 'Victory screen template', caption: 'Victory screen' },
          { src: '/images/botnia/colors.png', alt: 'Colour palette', caption: 'Colour palette' },
          { src: '/images/botnia/fontfamily.png', alt: 'Typography selection', caption: 'Typography' },
        ],
      },
      {
        type: 'image',
        src: '/images/botnia/eagles.jpg',
        alt: 'Game-day graphic: Botnia Vikings versus Eagles',
        caption: 'Game-day graphic',
        size: 'narrow',
        bg: 'ink',
      },
      {
        type: 'gallery',
        columns: 4,
        bg: 'ink',
        items: [
          { src: '/images/botnia/botniabanner.jpg', alt: 'Banner asset', caption: 'Banner' },
          { src: '/images/botnia/twitter.jpg', alt: 'Twitter asset', caption: 'Twitter' },
          { src: '/images/botnia/youtube_leftside.jpg', alt: 'YouTube asset', caption: 'YouTube' },
          { src: '/images/botnia/discord.jpg', alt: 'Discord asset', caption: 'Discord' },
        ],
      },
      {
        type: 'quote',
        text: "The guidelines gave the team's social presence a professional, unified look, reducing production time for new assets and making Botnia Vikings immediately distinguishable across platforms.",
      },
    ],
  },
];
