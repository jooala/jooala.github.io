import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Target', value: 'Wolt Product Manager Pre-assignment' },
  { label: 'Role', value: 'Product Manager / UX Strategy' },
];

const TOOLS = ['Figma', 'UX Strategy', 'Product Management'];

export default function Wolt() {
  return (
    <ProjectLayout
      pageTitle="Wolt Pre-assignment — Joonas Alanenpää"
      category="Product Management"
      title="Wolt Grocery Pickup"
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
            A Product Manager pre-assignment for Wolt: conceptualize a <strong className="text-white">Grocery Store Pickup</strong> system,
            map out how couriers and store employees communicate on collection orders, and handle edge cases
            like missing or substituted items.
          </p>
        </div>

        {/* Cover — full bleed */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 overflow-hidden border-y border-[#333333] bg-[#050505] flex justify-center py-12">
          <img
            src="/images/wolt/coverkuva.png"
            className="w-full max-w-5xl object-contain hover:scale-[1.02] transition-transform duration-700"
            alt="Wolt Grocery Pickup App Concept"
          />
        </div>

        {/* Problem */}
        <div className="project-section max-w-4xl mx-auto">
          <h2 className="mb-8">The Problem</h2>
          <p className="text-xl leading-relaxed text-[#AEAEAE] mb-8 font-inter">
            Experienced couriers (power-users) frequently handle multiple simultaneous pickup orders.
            The existing app forced them to navigate back and forth between individual order screens —
            a slow, error-prone workflow that hurt both speed and accuracy.
          </p>
        </div>

        {/* Solution */}
        <div className="project-section max-w-4xl mx-auto border-t border-[#333333] pt-16">
          <h2 className="mb-8">Streamlining Multi-Order Workflows</h2>
          <p className="text-[#EAEAEA] text-lg leading-relaxed mb-6 font-inter">
            I added a persistent button in the header of the collection order screen. Tapping it surfaces
            a quick-access overlay listing all active and ready orders — letting power-users jump between
            them without losing context or navigating back.
          </p>
          <p className="text-[#EAEAEA] text-lg leading-relaxed mb-12 font-inter">
            The solution required no new mental model: the overlay mirrors the existing order card
            structure, just surfaced on demand.
          </p>
        </div>

        {/* Prototype demo — panel */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-[#050505] py-16 flex justify-center">
          <img
            src="/images/wolt/animation.gif"
            className="w-[300px] rounded-sm shadow-[0_0_40px_rgba(204,255,0,0.05)]"
            alt="Prototype animation of the multi-order feature"
          />
        </div>

        {/* Orders screen */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-24 border-y border-[#333333] bg-[#050505] flex justify-center py-12">
          <img
            src="/images/wolt/orders.png"
            className="w-full max-w-5xl object-contain hover:scale-[1.02] transition-transform duration-700"
            alt="Orders interface"
          />
        </div>

        {/* Outcome */}
        <div className="project-section max-w-4xl mx-auto border-t border-[#333333] pt-16 pb-8">
          <em className="block border-l-4 border-[#ccff00] pl-6 py-2 text-[#EAEAEA] font-mono text-base italic leading-relaxed">
            "The design prioritizes power-users — people who already know the system well —
            by reducing the number of taps between orders from ~5 to 1."
          </em>
        </div>

      </div>
    </ProjectLayout>
  );
}
