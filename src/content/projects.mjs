// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CONTENT
//
// Every project page, card, archive entry and the sitemap are generated from
// this file. Array order = project number (01, 02, …) and default archive order.
// See CONTENT.md for the full field reference and how to add a project.
//
// Text fields support **bold** and [links](https://…).
// `null` means "not filled in yet" and renders as a visible TO ADD marker
// on case-study pages, or as "—" in compact metadata.
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
];

export const PROJECTS = [
  // ── 01 ────────────────────────────────────────────────────────────────────
  {
    slug: 'wolt-plus',
    title: 'Wolt+',
    subtitle: 'Subscription product across 30+ markets',
    summary:
      "Wolt+ is Wolt's subscription product, operating across more than 30 markets. It's what I currently work on.",
    role: 'Product Manager',
    year: null,
    status: 'Current',
    context: 'Wolt',
    categories: ['product'],
    highlights: ['Subscription product', '30+ markets', 'Product management'],
    tools: [],
    featured: true,
    cover: null,
    poster: { tone: 'blue', stamp: 'Case study in progress' },
    hero: null,
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        heading: 'A subscription product, live in more than 30 markets.',
        body: [
          "Wolt+ is Wolt's subscription product. I currently work on it on the product side.",
          'This is ongoing work, so this page only covers what is publicly shareable.',
        ],
      },
      {
        type: 'placeholder',
        label: 'My role',
        note: 'Add a public-safe description of your responsibilities: the areas you own, the teams you work with, how you work cross-functionally.',
      },
      {
        type: 'placeholder',
        label: 'Approach',
        note: 'Product strategy, customer experience and delivery: describe themes, not internal data. Keep anything confidential out.',
      },
      {
        type: 'placeholder',
        label: 'Outcomes',
        note: 'Only results that are approved for publication (e.g. publicly announced launches or market expansions).',
      },
    ],
  },

  // ── 02 ────────────────────────────────────────────────────────────────────
  {
    slug: 'frontier',
    title: 'Frontier',
    subtitle: 'Cooperative survival RPG',
    summary:
      "A cooperative survival RPG I'm developing independently: world-building, building systems, exploration, combat and settlement progression.",
    role: 'Independent developer',
    year: null,
    status: 'In development',
    context: 'Independent game',
    categories: ['games', 'development', '3d'],
    highlights: ['Co-op survival RPG', 'Systems & world-building', 'Unity'],
    tools: ['Unity'],
    featured: true,
    cover: null,
    poster: { tone: 'ink', stamp: 'In development' },
    hero: null,
    links: [],
    sections: [
      {
        type: 'text',
        label: 'Overview',
        heading: 'Explore, build, fight and grow a settlement together.',
        body: [
          'Frontier is a cooperative survival RPG that I design and develop independently. The game combines world-building, building systems, exploration, combat and settlement progression.',
        ],
      },
      {
        type: 'list',
        label: 'Core systems',
        items: [
          { title: 'World-building' },
          { title: 'Building systems' },
          { title: 'Exploration' },
          { title: 'Combat' },
          { title: 'Settlement progression' },
        ],
      },
      {
        type: 'placeholder',
        label: 'Development',
        note: 'Screenshots, gameplay clips or editor captures. Systems design notes, procedural generation, technical challenges and trade-offs.',
      },
      {
        type: 'placeholder',
        label: 'Status',
        note: 'Current stage of development, what is playable, and what comes next.',
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
    year: null,
    context: 'IDBM Industry Project, Aalto University · 7 months',
    client: 'Doublepoint',
    categories: ['ux', 'product', 'interactive'],
    highlights: ['Service design', 'Accessibility', 'Wearable XR'],
    tools: ['Double Diamond', 'User interviews', 'Prototyping', 'Business modeling', 'Touch SDK'],
    featured: true,
    cover: { src: '/images/covers/doublepoint.jpg', alt: 'Hand wearing a smartwatch running the Doublepoint touch prototype', grayscale: true },
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
        src: '/images/doublepoint/userrstory.png',
        alt: 'Illustrated user story: struggles in basic tasks, tedious practice, lack of motivation',
        caption: 'Key pain points from user research',
        size: 'wide',
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
        type: 'image',
        src: '/images/doublepoint/userrstory1.png',
        alt: 'User story storyboard for the rehabilitation concept',
        size: 'full',
        bg: 'white',
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
        size: 'wide',
        bg: 'white',
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
    year: null,
    context: 'Personal project · VR indie game',
    categories: ['games', 'interactive', '3d', 'development'],
    highlights: ['VR development', 'Physics interaction', '3D environment'],
    tools: ['Unity', 'C#', 'Oculus SDK', 'Blender', 'Substance Painter'],
    featured: true,
    cover: { src: '/images/covers/sauna-simulator-vr.jpg', alt: 'Interior render of the virtual sauna with benches and stove' },
    hero: { src: '/images/sauna/coverkuva.png', alt: 'Sauna Simulator key art: lakeside cabin at sunset' },
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
            body: 'Built the 3D assets in Blender and textured them in Substance Painter for a stylized yet grounded “Nordic summer night” look.',
          },
        ],
      },
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
        type: 'image',
        src: '/images/sauna/saunadev.png',
        alt: 'Sauna Simulator in the Unity editor and Blender during development',
        caption: 'Unity & Blender: development',
        size: 'full',
      },
    ],
  },

  // ── 05 ────────────────────────────────────────────────────────────────────
  {
    slug: 'bugbear',
    title: 'Bugbear',
    subtitle: 'Wreckfest · Ridge Racer Unbounded',
    summary:
      "Work with Bugbear Entertainment, the Finnish studio behind FlatOut, Ridge Racer Unbounded and Wreckfest: game testing, QA, bug fixing, graphic design and trailer production.",
    role: 'Game Tester & Additional Assistance',
    year: null,
    context: 'Game studio · multiple engagements',
    client: 'Bugbear Entertainment',
    categories: ['games'],
    highlights: ['Game testing & QA', 'Trailer production', 'Wreckfest'],
    tools: ['Game testing', 'QA', 'Graphic design', 'Video production', 'Bug fixing'],
    featured: true,
    cover: { src: '/images/covers/bugbear.jpg', alt: 'Wreckfest console release trailer frame', position: '30% 60%' },
    hero: { src: '/images/covers/bugbear.jpg', alt: 'Wreckfest console release trailer frame' },
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
          "Bugbear Entertainment is one of Finland's best-known video game studios, famous for the **FlatOut series**, **Ridge Racer Unbounded** and the critically acclaimed **Wreckfest**. I contributed as a Game Tester during Ridge Racer Unbounded's development and provided Additional Assistance for Wreckfest.",
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

  // ── 06 ────────────────────────────────────────────────────────────────────
  {
    slug: 'sustainably-yours',
    title: 'Sustainably Yours',
    subtitle: 'Making fashion sustainability transparent',
    summary:
      "A UI/UX project addressing fashion's environmental impact: a platform that makes brand sustainability transparent and motivates people to donate and recycle clothes.",
    role: 'UX Researcher & Designer',
    year: null,
    context: 'UI/UX course project, SUTD Singapore · 4 months',
    categories: ['ux'],
    highlights: ['UX research', 'Prototyping', 'Usability testing'],
    tools: ['Figma', 'Useberry', 'Prototyping', 'User research'],
    featured: true,
    cover: { src: '/images/covers/sustainably-yours.jpg', alt: 'Sustainably Yours app screens', position: '50% 40%', scrim: 'strong' },
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
        alt: 'Survey statistics',
        size: 'inset',
        bg: 'white',
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
        bg: 'white',
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
        size: 'wide',
        bg: 'white',
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
        bg: 'white',
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
