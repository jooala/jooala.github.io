import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Role', value: 'Brand Identity & Visual Design' },
  { label: 'Client', value: 'Botnia Vikings Esports' },
];

const TOOLS = ['Photoshop', 'Illustrator', 'Figma', 'Brand Guidelines'];

export default function Botnia() {
  return (
    <ProjectLayout
      pageTitle="Botnia Vikings — Joonas Alanenpää"
      noIndex
      category="Esports Branding"
      title="Botnia Vikings"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">

        {/* Intro */}
        <div className="callout-box mb-16 max-w-4xl mx-auto">
          <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
            [ The Brief ]
          </p>
          <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
            Build a <strong className="text-white">cohesive visual identity</strong> for Botnia Vikings, a Finnish esports
            organization — covering logo, social media templates, typography, and brand guidelines.
            The identity had to feel competitive and professional while reflecting a distinct Nordic edge.
          </p>
        </div>

        {/* Logo — dark panel */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-[#050505] flex justify-center py-16">
          <img
            src="/images/botnia/logo.png"
            className="w-1/3 max-w-xs object-contain grayscale hover:grayscale-0 transition-all duration-700"
            alt="Botnia Vikings Logo"
          />
        </div>

        {/* Brand foundations */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">Brand Guidelines & Social Assets</h2>
          <p className="text-[#EAEAEA] text-lg leading-relaxed mb-12 font-inter">
            The deliverables established a consistent visual language across all touchpoints —
            from match-day announcements to stream overlays. A strict color palette and typography
            system kept every asset instantly recognizable as Botnia Vikings.
          </p>
        </div>

        {/* 2×2 brand foundations grid */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-0 grid grid-cols-1 md:grid-cols-2 border-y border-[#333333] bg-[#050505]">
          <div className="border-b md:border-b-0 md:border-r border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Banner Design ]</h3>
            <img src="/images/botnia/banner3.png" className="w-full object-contain" alt="Banner design" />
          </div>
          <div className="border-b md:border-b-0 border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Victory Screen ]</h3>
            <img src="/images/botnia/victory2.png" className="w-full object-contain" alt="Victory Screen template" />
          </div>
        </div>

        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-0 grid grid-cols-1 md:grid-cols-2 border-b border-[#333333] bg-[#050505]">
          <div className="border-b md:border-b-0 md:border-r border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Colour Palette ]</h3>
            <img src="/images/botnia/colors.png" className="w-full object-contain" alt="Color palette" />
          </div>
          <div className="p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Typography ]</h3>
            <img src="/images/botnia/fontfamily.png" className="w-full object-contain" alt="Typography selection" />
          </div>
        </div>

        {/* Team roster — full bleed */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-0 border-b border-[#333333] bg-[#111111]">
          <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest px-8 pt-8 mb-6">[ Team Roster Graphic ]</h3>
          <img src="/images/botnia/eagles.jpg" className="w-full object-cover max-h-[60vh]" alt="Team Roster Graphic" />
        </div>

        {/* Platform assets */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 grid grid-cols-2 md:grid-cols-4 border-b border-[#333333] bg-[#050505]">
          {[
            { src: '/images/botnia/botniabanner.jpg', label: 'Banner' },
            { src: '/images/botnia/twitter.jpg', label: 'Twitter' },
            { src: '/images/botnia/youtube_leftside.jpg', label: 'YouTube' },
            { src: '/images/botnia/discord.jpg', label: 'Discord' },
          ].map(({ src, label }) => (
            <div key={label} className="border-r last:border-r-0 border-[#333333] p-6 hover:bg-[#111111] transition-colors duration-500">
              <h3 className="text-[#666666] font-mono uppercase text-xs tracking-widest mb-4">[ {label} ]</h3>
              <img src={src} className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={`${label} asset`} />
            </div>
          ))}
        </div>

        {/* Outcome */}
        <div className="project-section max-w-4xl mx-auto">
          <em className="block border-l-4 border-[#ccff00] pl-6 py-2 text-[#EAEAEA] font-mono text-base italic leading-relaxed">
            "The guidelines gave the team's social presence a professional, unified look —
            reducing production time for new assets and making Botnia Vikings immediately
            distinguishable across platforms."
          </em>
        </div>

      </div>
    </ProjectLayout>
  );
}
