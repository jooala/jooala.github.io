import ProjectLayout from './ProjectLayout';

// Static section content hoisted outside component (rendering-hoist-jsx)
const META = [
  { label: 'Company', value: 'Bugbear Entertainment' },
  { label: 'My Role', value: 'Game Tester & Additional Assistance' },
  { label: 'Games', value: 'Ridge Racer Unbounded, Wreckfest' },
];

const TOOLS = ['Game Testing', 'QA', 'Graphic Design', 'Video Production', 'Bug Fixing'];

export default function Bugbear() {
  return (
    <ProjectLayout
      pageTitle="Bugbear Entertainment — Joonas Alanenpää"
      category="Game Industry"
      title="Bugbear Entertainment"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-6xl mx-auto">
          <div className="md:col-span-2">
            <div className="callout-box mb-12">
              <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
                [ Overview ]
              </p>
              <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
                I had the opportunity to work with Bugbear Entertainment multiple times on a variety of tasks
                related to game development — from graphics design and video production to testing, quality
                assurance, and bug fixing.
              </p>
            </div>
            <p className="text-[#AEAEAE] text-lg leading-relaxed mb-8 font-inter">
              Bugbear Entertainment is one of Finland's most well-known video game studios, famous for
              creating the <strong className="text-white">FlatOut series</strong>, <strong className="text-white">Ridge Racer Unbounded</strong>, and the
              critically acclaimed <strong className="text-white">Wreckfest</strong>. I had the privilege of contributing as a
              Game Tester during Ridge Racer Unbounded's development and providing Additional Assistance
              for Wreckfest.
            </p>
            <p>
              <a
                href="https://www.mobygames.com/developer/sheet/view/developerId,516527/"
                className="underline font-mono text-sm tracking-widest font-bold hover:text-white transition-colors text-[#ccff00]"
                target="_blank"
                rel="noopener noreferrer"
              >
                [ VIEW MY GAME CREDITS ON MOBYGAMES ]
              </a>
            </p>
          </div>
          <div className="flex items-center justify-center p-8 bg-[#050505] border border-[#333333] hover:bg-[#111111] transition-colors duration-500">
            <img
              src="/images/bugbear/logo.png"
              className="w-full max-w-xs object-contain grayscale hover:grayscale-0 transition-all duration-700"
              alt="Bugbear Entertainment logo"
            />
          </div>
        </div>

        {/* Video section */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">Video Production Work</h2>
          <p className="text-xl leading-relaxed text-[#AEAEAE] mb-12 font-inter">
            Below are a few trailers I was heavily involved in producing, published on social media
            as part of Wreckfest's marketing campaign.
          </p>
        </div>

        {/* Full Bleed Video Grid */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 lg:grid-cols-3 border-y border-[#333333] bg-[#050505]">
          <div className="border-b lg:border-b-0 lg:border-r border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Console Release Trailer ]</h3>
            <iframe
              className="w-full aspect-video grayscale hover:grayscale-0 transition-all duration-700"
              src="https://www.youtube.com/embed/eRBofi1ZR14"
              title="Wreckfest — Console Release Date Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="border-b lg:border-b-0 lg:border-r border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Season 2 Trailer ]</h3>
            <iframe
              className="w-full aspect-video grayscale hover:grayscale-0 transition-all duration-700"
              src="https://www.youtube.com/embed/-m3tAeseBNE"
              title="Wreckfest — Season 2 Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Update Trailer ]</h3>
            <iframe
              className="w-full aspect-video grayscale hover:grayscale-0 transition-all duration-700"
              src="https://www.youtube.com/embed/E-p1mQg6KuM"
              title="Wreckfest — Update Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </ProjectLayout>
  );
}
