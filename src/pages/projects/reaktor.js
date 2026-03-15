import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Target', value: 'Reaktor Pre-assignment' },
  { label: 'Role', value: 'UI/UX Designer' },
];

const TOOLS = ['Figma', 'UI/UX Design', 'Map Interfaces', 'Prototyping'];

export default function Reaktor() {
  return (
    <ProjectLayout
      pageTitle="Reaktor Case Study — Joonas Alanenpää"
      noIndex
      category="UX Design"
      title="Reaktor Case Assignment"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">

        {/* Intro */}
        <div className="callout-box mb-16 max-w-4xl mx-auto">
          <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
            [ The Assignment ]
          </p>
          <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
            Design a user-friendly interface for checking prescription validity and locating
            the nearest pharmacies that have the medication <strong className="text-white">available in stock</strong>.
          </p>
        </div>

        {/* Cover — full bleed */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 overflow-hidden border-y border-[#333333] bg-[#050505] flex justify-center py-12">
          <img
            src="/images/reaktor/bloodpressure.png"
            className="w-full max-w-5xl object-contain hover:scale-[1.02] transition-transform duration-700"
            alt="Blood pressure medication tracking app interface"
          />
        </div>

        {/* Problem */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">The Problem</h2>
          <p className="text-[#EAEAEA] text-lg leading-relaxed mb-6 font-inter">
            Finding a pharmacy with your exact prescribed medication in stock is historically opaque —
            users typically call pharmacies one by one or drive between them, wasting time and energy.
            This pain is sharpest for elderly patients and those with chronic prescriptions.
          </p>
        </div>

        {/* Key Design Decision */}
        <div className="project-section max-w-4xl mx-auto border-t border-[#333333] pt-16">
          <h2 className="mb-8">The Solution: A Color-Coded Map</h2>
          <p className="text-[#EAEAEA] text-lg font-inter leading-relaxed mb-6">
            Rather than a list of results, I designed a <strong className="text-white">Google Maps–style view</strong> where
            pharmacies are instantly color-coded: <span className="text-[#ccff00]">green</span> for in-stock,
            grey for unavailable. One tap on any green pin surfaces stock details and a "Get Directions" button
            using the device's GPS.
          </p>

          <em className="block border-l-4 border-[#ccff00] pl-6 py-2 text-[#EAEAEA] font-mono text-base italic leading-relaxed mb-16">
            "The key insight: don't make users read a list — let the map answer the question at a glance."
          </em>
        </div>

        {/* Map — full bleed */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-[#050505] flex justify-center py-12">
          <img
            src="/images/reaktor/map.png"
            className="w-full max-w-5xl object-contain hover:scale-[1.02] transition-transform duration-700"
            alt="Pharmacy Map Locator UI"
          />
        </div>

      </div>
    </ProjectLayout>
  );
}
