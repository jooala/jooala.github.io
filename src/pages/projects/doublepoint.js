import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Client', value: 'Doublepoint' },
  { label: 'Context', value: 'IDBM Industry Project (7 months)' },
  { label: 'Focus', value: 'Service Design, Accessibility, Wearable XR' },
];

const TOOLS = ['Double Diamond', 'User Interviews', 'Prototyping', 'Business Modeling', 'Touch SDK'];

export default function Doublepoint() {
  return (
    <ProjectLayout
      pageTitle="Doublepoint — Joonas Alanenpää"
      description="Service Design project in IDBM Industry Project with Doublepoint: innovating with touch detection technology for enhanced independence for people with disabilities."
      coverImage="/images/doublepointlab.png"
      category="Service Design"
      title="Doublepoint"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">
        {/* Intro */}
        <div className="callout-box mb-16 max-w-4xl mx-auto">
          <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
            [ Overview ]
          </p>
          <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
            During the IDBM Industry Project course at Aalto University, our interdisciplinary team
            collaborated with <strong className="text-white">Doublepoint</strong>, a startup specializing in touch detection
            technology. Our goal was to find innovative, accessible applications for their wearable
            sensors — specifically to enhance independence for individuals with fine motor disabilities.
          </p>
        </div>

        <div className="project-section max-w-5xl mx-auto mb-24">
          <img
            src="/images/doublepoint/coverkuva.png"
            className="w-full h-auto object-contain rounded-sm"
            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}
            alt="Doublepoint cover"
          />
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">The Design Process</h2>
          <p className="text-xl leading-relaxed text-[#AEAEAE] mb-8 font-inter">
            The 7-month design process involved an immersive exploration of the startup and XR industry
            landscape, followed by user needs discovery and research on inclusive technologies.
          </p>

          <p className="text-[#EAEAEA] text-lg leading-relaxed mb-6 font-inter">
            Our team conducted global industry immersion trips to <strong className="text-white">California and Tokyo</strong>, engaging
            with professionals and attending XR-related events. We concluded that while the XR industry
            is heavily dominated by big tech, there is a massive unserved niche market in accessibility.
          </p>

          <p className="text-[#EAEAEA] text-lg leading-relaxed mb-16 font-inter">
            Applying the <strong className="text-white">Double Diamond</strong> framework, thorough field research and interviews were conducted
            with seven diverse user groups and associations. Thematic analysis revealed three main design
            directions for the touch technology: Independent home life, Safety alerts, and Learning/Rehabilitation.
          </p>
        </div>

        <div className="project-section max-w-4xl mx-auto border-t border-[#333333] pt-16">
          <h2 className="mb-8">Evaluating Solutions</h2>
          <p className="mb-12 text-[#EAEAEA] text-lg font-inter">
            We evaluated our three core directions against desirability, feasibility, and viability:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-[#050505] border border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
              <h3 className="text-2xl font-bold font-oswald text-[#666666] uppercase tracking-tight mb-4">1. Smart Home</h3>
              <p className="text-[#AEAEAE] font-inter text-base m-0 leading-relaxed">
                Controlling smart home environments using wrist gestures. Concerns about the cost barriers
                and financial accessibility deemed this solution unfeasible for our target demographic.
              </p>
            </div>
            <div className="bg-[#050505] border border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
              <h3 className="text-2xl font-bold font-oswald text-[#666666] uppercase tracking-tight mb-4">2. Safety Alerts</h3>
              <p className="text-[#AEAEAE] font-inter text-base m-0 leading-relaxed">
                Pinch-to-trigger emergency alerts. We found this faced heavy challenges integrating with
                the wider medical service system, rendering it unfeasible for a startup timeline.
              </p>
            </div>
            <div className="bg-[#050505] border border-[#ccff00] p-8 shadow-[0_0_30px_rgba(204,255,0,0.1)]">
              <h3 className="text-2xl font-bold font-oswald text-[#ccff00] uppercase tracking-tight mb-4">3. Rehabilitation</h3>
              <p className="text-[#EAEAEA] font-inter text-base m-0 leading-relaxed">
                Utilizing the touch technology in gamified rehabilitation. Deemed the <strong className="text-white">most desirable,
                  feasible, and viable</strong> solution after careful evaluation with users.
              </p>
            </div>
          </div>

          <h3 className="text-[#EAEAEA] font-oswald text-4xl uppercase mb-6">The Pivot & Innovation</h3>
          <p className="text-[#EAEAEA] text-lg font-inter leading-relaxed mb-12">
            Fine motor skills, crucial for tasks requiring dexterity and hand-eye coordination, align
            perfectly with Doublepoint's touch detection sensor. The design challenge became:
            <br /><br />
            <em className="block border-l-4 border-[#ccff00] pl-6 py-2 text-[#EAEAEA] font-mono text-base italic leading-relaxed">
              "How might Doublepoint's touch detection technology make people with fine motor
              disabilities more independent?"
            </em>
          </p>
        </div>

        {/* Full Bleed User Story */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 overflow-hidden border-y border-[#333333] bg-[#050505] py-20 flex justify-center">
          <img
            src="/images/doublepoint/userrstory1.png"
            className="w-full max-w-6xl object-contain hover:scale-105 transition-transform duration-700"
            alt="User story visualization"
          />
        </div>

        {/* The Solution */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">The Solution: Gamified Physiotherapy</h2>

          <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mt-12 mb-4">[ For the End-User ]</h3>
          <p className="text-[#EAEAEA] text-lg font-inter leading-relaxed mb-6">
            We designed a gamified physiotherapy concept where users with fine motor disabilities carry out
            their daily exercises by playing a game. The game is controlled dynamically with specified hand
            gestures (like pinches or clenches), tracked entirely by a standard smartwatch running Doublepoint's
            touch algorithm.
          </p>
          <p className="text-[#EAEAEA] text-lg font-inter leading-relaxed mb-16">
            The algorithm is heavily customizable, meaning the system can register a "clench" even from users
            with very limited muscle power. We prototyped this tap-based game and showcased it at events like
            the <strong className="text-white">Impact Gala</strong> and <strong className="text-white">Service Design Day</strong>, receiving highly positive feedback.
          </p>
        </div>

        {/* Edge-to-Edge Double Feature */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 grid grid-cols-1 lg:grid-cols-2 border-y border-[#333333] bg-[#050505]">
          <div className="border-b lg:border-b-0 lg:border-r border-[#333333] flex items-center justify-center p-12">
            <img
              src="/images/doublepoint/userrstory2.png"
              className="w-full max-w-2xl object-contain hover:scale-105 transition-transform duration-700 hover:grayscale-0 grayscale"
              alt="End user product ecosystem"
            />
          </div>
          <div className="flex items-center justify-center p-12 bg-black">
            <img
              src="/images/doublepoint/prototype.gif"
              className="w-full max-w-md object-contain shadow-[0_0_40px_rgba(204,255,0,0.1)]"
              alt="Prototype game interaction demo"
            />
          </div>
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mt-12 mb-4">[ For Doublepoint (The Business Model) ]</h3>
          <p className="text-[#EAEAEA] text-lg font-inter leading-relaxed mb-6">
            The business model revolves around licensing the <strong className="text-white">Accessibility Touch SDK</strong> to game developers
            and physiotherapy platforms (like Rehaboo). This allows B2B clients to integrate touch detection into
            their own physiotherapy experiences, without Doublepoint needing to develop the games themselves in-house.
          </p>
          <p className="text-[#EAEAEA] text-lg font-inter leading-relaxed mb-16">
            Because the SDK already targets the Unity game engine, pushing it toward accessibility features creates a
            rapid go-to-market strategy that bypasses the saturated consumer mobile gaming space.
          </p>
        </div>

        {/* Full Bleed Canvas */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] border-t border-[#333333] bg-black flex justify-center">
          <img
            src="/images/doublepoint/businessmodel.png"
            className="w-full max-w-6xl object-contain grayscale hover:grayscale-0 transition-all duration-700"
            alt="B2B Business Model Canvas"
          />
        </div>

      </div>
    </ProjectLayout>
  );
}
