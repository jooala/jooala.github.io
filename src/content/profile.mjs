// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL INFO: used by the masthead, hero, about section/page, contact
// page, footer and SEO. `null` = not filled in yet (a TO ADD marker on the dev
// server; left out of the built site).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://jooala.github.io';

export const PROFILE = {
  name: 'Joonas Alanenpää',
  firstName: 'Joonas',
  lastName: 'Alanenpää',
  location: 'Helsinki, Finland',
  timeZone: 'Europe/Helsinki',
  email: 'joonas.alanenpaa@gmail.com',

  roles: ['Product Manager', 'Designer', 'Developer', 'Game Maker'],
  disciplines: ['Products', 'UX design', 'Games'],

  // Hero introduction (serif line under the name)
  intro: 'I like building things. Products, games, tools, whatever the idea is.',

  // Shown in the home page About column
  shortBio: [
    "I'm a product manager who loves combining design, technology and curiosity to build products that feel amazing.",
    "Right now I'm Product Lead for Wolt+, Wolt's subscription product. On my own time I'm building Project Frontier, a co-op fantasy survival game I'm making solo, along with other fun game projects.",
  ],

  // Portrait for the About sections. Set to e.g. { src: '/images/about/portrait.jpg', alt: '…' }
  photo: { src: '/images/about/portrait.jpg', alt: 'Portrait of Joonas Alanenpää' },

  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joonas-alanenpaa/' },
  ],

  // ── About page ────────────────────────────────────────────────────────────
  about: {
    headline: 'A product manager who loves combining design, technology and curiosity to build products that feel amazing.',
    body: [
      'My background is a mix: a Bachelor’s in Computer Science from the University of Helsinki, a Master’s in International Design Business Management (IDBM) at Aalto University, an exchange semester at the Singapore University of Technology and Design, and game-industry work with Bugbear Entertainment.',
      'Today I’m Product Lead (product manager) for Wolt+, Wolt’s subscription product, where I drive the product and new initiatives from 0 to 1. Before that I worked on short-form video and content discovery at Sanoma Media Finland, service design with Doublepoint, and full-stack development at Elisa.',
      'What ties it together is that I like taking an idea the whole way: figuring out what’s worth building, designing how it should work, and then actually building it. At Wolt that often means prototyping, documentation, doing analysis and even implementing features myself with AI tools.',
      'On my own time I make games: Project Frontier, a co-op fantasy survival game I’m building solo, plus smaller game projects, mods and tools along the way.',
    ],
    now: [
      { title: 'Wolt+', text: 'Product Lead for Wolt’s subscription product: growth, value proposition, retention, and hands-on AI-native product work.', href: '/work/wolt-plus/' },
      { title: 'Project Frontier', text: 'A co-op fantasy survival game I’m making solo: village life, exploration, crafting, building and combat.', href: '/work/frontier/' },
    ],
    expertise: [
      { area: 'Product', items: ['Product discovery & roadmapping', 'Product strategy', 'Growth & engagement', 'Analytics & experimentation'] },
      { area: 'Research & design', items: ['User & market research', 'UX/UI & service design', 'Prototyping', 'Figma & Miro'] },
      { area: 'Development', items: ['Software development', 'AI tools & agents (Claude, Cursor, Codex)', 'SQL', 'Git'] },
      { area: 'Data & delivery', items: ['Snowflake', 'Looker', 'Mixpanel', 'Conductrics', 'Jira & Linear'] },
      { area: 'Games & 3D', items: ['Game design', 'Unity & Unreal', 'Blender'] },
      { area: 'Languages', items: ['Finnish: native', 'English: fluent', 'Swedish: good', 'Japanese: basic'] },
    ],
    // Experience index. `role` / `period` = null shows a TO ADD marker.
    experience: [
      { org: 'Wolt', role: 'Product Lead / Product Manager · Wolt+', period: '2025–now', href: '/work/wolt-plus/' },
      { org: 'Wolt', role: 'Product Management Trainee · Wolt+', period: '2025' },
      { org: 'Sanoma Media Finland', role: 'Product Manager Trainee, Storytelling · IS Nopeat', period: '2024', href: '/work/is-nopeat/' },
      { org: 'Doublepoint (acquired by Oura)', role: 'Service designer · IDBM capstone industry project', period: '2022–2023', href: '/work/doublepoint/' },
      { org: 'Elisa', role: 'Software Developer Trainee · Elisa Viihde streaming', period: '2021' },
      { org: 'Bugbear Entertainment', role: 'Summer intern: game tester & content creation · Wreckfest', period: '2019', href: '/work/bugbear/' },
      { org: 'Project Frontier', role: 'Co-op fantasy survival game, solo developer', period: 'Ongoing', href: '/work/frontier/' },
    ],
    education: [
      { org: 'Aalto University', role: 'Master’s, International Design Business Management (Industrial Engineering)', period: '2022–now' },
      { org: 'Singapore University of Technology and Design', role: 'Exchange: Information Systems Technology and Design, incl. Game Design', period: '2023' },
      { org: 'University of Helsinki', role: 'Bachelor’s, Computer Science', period: '2016–2022' },
    ],
  },
};
