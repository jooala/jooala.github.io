// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL INFO: used by the masthead, hero, about section/page, contact
// page, footer and SEO. `null` = not filled in yet (renders as a TO ADD marker).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://jooala.github.io';

export const PROFILE = {
  name: 'Joonas Alanenpää',
  firstName: 'Joonas',
  lastName: 'Alanenpää',
  location: 'Helsinki, Finland',
  timeZone: 'Europe/Helsinki',
  email: 'joonas.alanenpaa@aalto.fi',

  roles: ['Product Manager', 'Designer', 'Developer', 'Game Maker'],
  disciplines: ['Products', 'Interfaces', 'Games'],

  // Hero introduction (serif line under the name)
  intro: 'I build products, interfaces and game worlds, from the first sketch to working software.',

  // Shown in the home page About column
  shortBio: [
    "I'm a product-minded builder working across software, design and games.",
    "Right now I work on Wolt+, Wolt's subscription product across 30+ markets. On my own time I'm building Frontier, a co-op survival RPG.",
  ],

  // Portrait for the About sections. Set to e.g. { src: '/images/about/portrait.jpg', alt: '…' }
  photo: null,

  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joonas-alanenpaa/' },
    { label: 'GitHub', href: 'https://github.com/jooala' },
    { label: 'MobyGames', href: 'https://www.mobygames.com/developer/sheet/view/developerId,516527/' },
  ],

  // ── About page ────────────────────────────────────────────────────────────
  about: {
    headline: "I'm a product-minded builder working across software, design and games.",
    body: [
      "My background is a mix: computer science studies at Aalto University, design and business through IDBM, game-industry work with Bugbear Entertainment, and UX projects ranging from accessibility tech to sustainable fashion.",
      "What ties it together is that I like taking an idea the whole way: figuring out what's worth building, designing how it should work, and then actually building it.",
    ],
    now: [
      { label: 'Day job', title: 'Wolt+', text: "Product work on Wolt's subscription product, operating across more than 30 markets.", href: '/work/wolt-plus/' },
      { label: 'Own time', title: 'Frontier', text: 'A cooperative survival RPG with world-building, building systems, exploration, combat and settlement progression.', href: '/work/frontier/' },
    ],
    principles: [
      {
        title: 'Find the real problem first',
        text: 'At Doublepoint we spent months on research and immersion trips before committing, and ended up somewhere none of us expected: rehabilitation.',
      },
      {
        title: 'Prototype early, test often',
        text: 'Whiteboard, low-fi, high-fi. Every round of Sustainably Yours went in front of users before the next one started.',
      },
      {
        title: 'Build it for real',
        text: "I'm comfortable in the engine and the editor: Unity, C#, React Native, Blender. Making the thing teaches you what the spec didn't.",
      },
    ],
    expertise: [
      { area: 'Product', items: ['Product management', 'Product strategy', 'Cross-functional delivery'] },
      { area: 'Design', items: ['UX/UI & interaction design', 'Service design', 'User research & testing', 'Prototyping'] },
      { area: 'Development', items: ['React / React Native', 'Node.js', 'Unity & C#'] },
      { area: 'Games & 3D', items: ['Game design & systems', 'VR', 'Blender', 'Substance Painter'] },
    ],
    // Experience index. `role` / `period` = null shows a TO ADD marker.
    experience: [
      { org: 'Wolt', role: 'Product Manager · Wolt+', period: 'Now', href: '/work/wolt-plus/' },
      { org: 'Frontier', role: 'Independent game developer', period: 'Ongoing', href: '/work/frontier/' },
      { org: 'Doublepoint (Port 6)', role: 'IDBM industry project: service design', period: null, href: '/work/doublepoint/' },
      { org: 'Bugbear Entertainment', role: 'Game tester & additional assistance', period: null, href: '/work/bugbear/' },
      { org: 'Sanoma', role: null, period: null },
      { org: 'Elisa', role: null, period: null },
    ],
    education: [
      { org: 'Aalto University', role: 'Computer Science', period: null },
      { org: 'Aalto University: IDBM', role: 'International Design Business Management', period: null },
      { org: 'SUTD, Singapore', role: 'UI/UX course project', period: null },
    ],
  },
};
