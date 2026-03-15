import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Client', value: 'Sukeltajaliitto ry' },
  { label: 'Role', value: 'Lead UX/UI Designer' },
  { label: 'Context', value: "Aalto CS Bachelor's course (10cr / 4 mos)" },
];

const TOOLS = ['Figma', 'Photoshop', 'React Native', 'Expo', 'Node.js', 'Express'];

export default function Sukeltaja() {
  return (
    <ProjectLayout
      pageTitle="Sukeltaja App UX — Joonas Alanenpää"
      noIndex
      category="UX Design"
      title="Sukeltaja-App UX Redesign"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">

        {/* Intro */}
        <div className="callout-box mb-16 max-w-4xl mx-auto">
          <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
            [ The Challenge ]
          </p>
          <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
            Redesign the mobile app for the Finnish Diver's Federation (Sukeltajaliitto) —
            adding backlog features while simplifying the UX, all within an agile team with
            <strong className="text-white"> no prior UX design experience</strong>.
          </p>
        </div>

        {/* Context + Phone mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 max-w-6xl mx-auto px-4">
          <div>
            <h2 className="text-4xl font-bold mb-6 font-oswald uppercase text-[#EAEAEA]">Context & My Role</h2>
            <p className="text-[#AEAEAE] text-lg leading-relaxed mb-6 font-inter">
              Completed as part of a 10-credit software development course at the University of Helsinki
              over 4 months. Our team ran agile sprints and gathered user feedback throughout.
            </p>
            <p className="text-[#EAEAEA] text-lg leading-relaxed font-inter">
              I stepped up to lead UX and UI. I designed all flows in <strong className="text-white">Figma and Photoshop</strong> before
              any code was written, then helped implement the frontend using <strong className="text-white">React Native and Expo</strong>,
              backed by a Node.js / Express API.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[280px] bg-[#050505] p-4 border border-[#333333] relative">
              <div className="w-full aspect-[1/2] overflow-hidden bg-black">
                <img
                  src="/images/sukeltaja/sukeltaja cover kuva.png"
                  alt="Sukeltaja-App mobile UI"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video walkthrough */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-4">Video Walkthrough</h2>
          <p className="text-[#AEAEAE] text-lg leading-relaxed mb-8 font-inter">
            A before-and-after comparison showing the initial state versus the final delivered product.
          </p>
        </div>

        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-black">
          <iframe
            className="w-full aspect-video"
            src="https://www.youtube.com/embed/ytfsuFhI6-A"
            title="Sukeltaja-App Comparison"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Figma mockups */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-6">Design Process & Figma Mockups</h2>
          <p className="text-[#AEAEAE] text-lg leading-relaxed mb-8 font-inter">
            Although this was primarily a software development course, we pinpointed usability problems
            through user interviews and iterated on them. The implemented result evolved further from
            the original plan as we discovered improvements during development.
          </p>
        </div>

        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-[#050505] py-12 flex justify-center">
          <img
            src="/images/sukeltaja/sukeltajafigma.png"
            alt="Figma design screens for Sukeltaja-app"
            className="w-full max-w-6xl object-contain hover:scale-[1.02] transition-transform duration-700"
          />
        </div>

        {/* Outcome */}
        <div className="project-section max-w-4xl mx-auto">
          <em className="block border-l-4 border-[#ccff00] pl-6 py-2 text-[#EAEAEA] font-mono text-base italic leading-relaxed mb-4">
            "The client was highly satisfied with the final result, and deploying to production was a success."
          </em>
          <p className="text-[#666666] font-mono text-sm leading-relaxed pl-6 font-inter">
            This project was the spark that shifted my focus from pure software engineering toward UX/UI design.
          </p>
        </div>

      </div>
    </ProjectLayout>
  );
}
