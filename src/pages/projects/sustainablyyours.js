import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Role', value: 'UX Researcher & Designer' },
  { label: 'Type', value: 'UI/UX Course Project (SUTD)' },
];

const TOOLS = ['Figma', 'Useberry', 'Prototyping', 'User Research'];

export default function SustainablyYours() {
  return (
    <ProjectLayout
      pageTitle="Sustainably Yours — Joonas Alanenpää"
      description="UI/UX design project addressing fashion's environmental impact by solving lack of transparency and consumer wastefulness through a sustainable fashion app."
      coverImage="/images/sustis.png"
      category="UX Design"
      title="Sustainably Yours"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">
        {/* Intro */}
        <div className="callout-box mb-16 max-w-4xl mx-auto">
          <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
            [ The Problem ]
          </p>
          <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
            The fashion industry contributes 10% of global carbon emissions yet hides its practices behind sustainability marketing. Consumers discard clothes after an average of 7 wears — 66% end up in landfills. The challenge: build a platform that makes brand sustainability <strong className="text-white">transparent and actionable</strong>, and motivates consumers to donate and recycle.
          </p>
          <p className="text-[#AEAEAE] text-base leading-relaxed mt-4 m-0 font-inter">
            UI/UX course project at Singapore University of Technology and Design (SUTD) — 4 months, including research, prototyping, and user evaluation rounds.
          </p>
        </div>

        {/* Cover image */}
        <div className="project-section max-w-5xl mx-auto mb-24">
          <img
            src="/images/sustainablyyours/coverkuva.png"
            className="w-full h-auto object-contain rounded-sm"
            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}
            alt="Sustainably Yours Cover"
          />
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">Data Gathering</h2>
          <p className="text-xl leading-relaxed text-[#EAEAEA] mb-8 font-inter">
            Our approach to data gathering combined extensive literature research and targeted surveys among young adults in Singapore. This allowed us to understand sustainability challenges in the fashion industry, specifically tailored to the context of young adults in Singapore.
          </p>

          <ul className="list-disc pl-5 my-12 space-y-6 text-[#EAEAEA] text-lg font-inter marker:text-[#ccff00]">
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Literature Research:</strong> The fashion industry, contributing 10% of global carbon emissions, lacks transparency in sustainability practices, with over 90% of companies not disclosing essential processes. In addition, in the U.S., individuals discard 37 kg of clothes annually, with 66% ending up in landfills, typically after only 7 wears.
            </li>
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Survey insights:</strong> Surveys targeting individuals aged 15-24 revealed that 51.6% discard clothing, and only 4% is recycled in Singapore. Barriers to recycling include a lack of convenient options (82.4%), uncertainty about processes (58.8%), and concerns about transparency (61.8%). The demand for recycling incentives and knowledge about sustainable brands was notably high.
            </li>
          </ul>

        </div>

        {/* Edge-to-Edge Single Feature */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-[#050505] py-20">
          <img
            src="/images/sustainablyyours/stats.png"
            className="w-full max-w-5xl mx-auto h-auto object-contain hover:scale-105 transition-transform duration-700"
            alt="Statistics"
          />
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">Target Users</h2>
          <p className="text-xl leading-relaxed text-[#EAEAEA] mb-8 font-inter">
            We identified three user groups with distinct motivations — each requiring a different
            entry point into the platform.
          </p>

          <ul className="list-disc pl-5 my-12 space-y-6 text-[#EAEAEA] text-lg font-inter marker:text-[#ccff00]">
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Primary Users:</strong> Our primary users fall into two distinct groups: those interested in donations but not sustainability rankings, and those interested in sustainability rankings but not donations.
            </li>
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Secondary Users:</strong> Interested in both sustainability rankings and donations, these users benefit from in-depth statistics and active community engagement through brand reviews.
            </li>
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Supplemental Users:</strong> While our focus is on serving interested users, we also recognize the presence of non-interested users. Our platform aims to influence positive change even among those initially uninterested.
            </li>
          </ul>
        </div>

        {/* Full Bleed Persona Grid */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 grid grid-cols-1 md:grid-cols-3 border-y border-[#333333]">
          <div className="p-12 border-b md:border-b-0 md:border-r border-[#333333] hover:bg-[#050505] transition-colors duration-500">
            <img src="/images/sustainablyyours/test.png" className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-700" alt="Primary User Persona" />
          </div>
          <div className="p-12 border-b md:border-b-0 md:border-r border-[#333333] hover:bg-[#050505] transition-colors duration-500">
            <img src="/images/sustainablyyours/persona2.png" className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-700" alt="Secondary User Persona" />
          </div>
          <div className="p-12 hover:bg-[#050505] transition-colors duration-500">
            <img src="/images/sustainablyyours/persona3.png" className="w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-700" alt="Supplemental User Persona" />
          </div>
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">Prototyping & User Testing</h2>
          <p className="text-xl leading-relaxed text-[#EAEAEA] mb-8 font-inter">
            From whiteboard sketches to Figma low-fi prototypes, we designed and tested three core flows:
            donating clothes, searching sustainability ratings, and receiving rewards.
          </p>
        </div>

        {/* Full Bleed Proto 1 */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 py-16 bg-[#050505] border-y border-[#333333]">
          <img src="/images/sustainablyyours/proto1.png" className="w-full h-auto max-w-6xl mx-auto object-contain grayscale hover:grayscale-0 transition-all duration-700" alt="First Prototypes" />
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <p className="text-xl leading-relaxed text-[#EAEAEA] mb-12 font-inter">
            We conducted tests after each prototype to understand our user preferences, behaviors and expectations. The iterative nature of the testing process allowed for refinement based on user feedback to improve the app's functionality and user experience.
          </p>

          <ul className="list-disc pl-5 my-12 space-y-6 text-[#EAEAEA] text-lg font-inter marker:text-[#ccff00]">
            <li><strong className="text-white font-mono uppercase text-sm block mb-1">User Testing and Evaluation I:</strong> Two tests, Sustainability Rating Awareness and Donation Behavior, revealed insights into user preferences. Valuable insights were gained for refining design elements such as improving feedback of the app and simplifying user journeys.</li>
            <li><strong className="text-white font-mono uppercase text-sm block mb-1">User Testing and Evaluation II:</strong> The second round assessed usability and user experience using Useberry, involving diverse personas. The System Usability Score (SUS) of 79.8 reflected decent usability, with potential enhancements for sustainability-focused users.</li>
          </ul>
        </div>

        {/* Full Bleed Testing Grid */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 grid grid-cols-1 md:grid-cols-2 border-y border-[#333333] bg-[#050505]">
          <div className="p-16 border-b md:border-b-0 md:border-r border-[#333333]">
            <img src="/images/sustainablyyours/evaluation.png" className="w-full h-auto object-contain hover:scale-[1.03] transition-transform duration-700" alt="User Evaluation" />
          </div>
          <div className="p-16">
            <img src="/images/sustainablyyours/proto2.png" className="w-full h-auto object-contain hover:scale-[1.03] transition-transform duration-700" alt="Second Prototypes" />
          </div>
        </div>

        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">Results</h2>
          <p className="text-xl leading-relaxed text-[#AEAEAE] mb-8 font-inter">
            After two rounds of user testing and iteration, we fine-tuned the interface and overall experience.
            The final product received top marks. My primary responsibilities were leading the prototyping process
            and deriving insights from evaluation data.
          </p>
          <div className="flex gap-16 mb-16 font-mono">
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-bold font-oswald text-[#ccff00]">79.8</span>
              <span className="text-[#666666] uppercase text-sm">System Usability Score</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-bold font-oswald text-[#EAEAEA]">3</span>
              <span className="text-[#666666] uppercase text-sm">User Flows Designed</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-bold font-oswald text-[#EAEAEA]">2×</span>
              <span className="text-[#666666] uppercase text-sm">Testing Rounds</span>
            </div>
          </div>
        </div>

        {/* Full Bleed Results Board */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] pb-24 grid w-full sm:grid-cols-2 lg:grid-cols-4 border-t border-[#333333]">
          <div className="border-r border-b lg:border-b-0 border-[#333333] hover:bg-[#151515] transition-colors duration-500 py-12 px-6">
            <img src="/images/sustainablyyours/results_1.png" className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500" alt="Results 1" />
          </div>
          <div className="border-r border-b lg:border-b-0 border-[#333333] hover:bg-[#151515] transition-colors duration-500 py-12 px-6">
            <img src="/images/sustainablyyours/results_2.png" className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500" alt="Results 2" />
          </div>
          <div className="border-r border-b lg:border-b-0 border-[#333333] hover:bg-[#151515] transition-colors duration-500 py-12 px-6">
            <img src="/images/sustainablyyours/results_3.png" className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500" alt="Results 3" />
          </div>
          <div className="hover:bg-[#151515] transition-colors duration-500 py-12 px-6">
            <img src="/images/sustainablyyours/results_4.png" className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500" alt="Results 4" />
          </div>
        </div>

      </div>
    </ProjectLayout>
  );
}
