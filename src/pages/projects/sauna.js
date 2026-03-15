import ProjectLayout from './ProjectLayout';

const META = [
  { label: 'Role', value: 'Lead Developer & 3D Generalist' },
  { label: 'Type', value: 'Personal Project / VR Indie Game' },
];

const TOOLS = ['Unity 3D', 'C#', 'Oculus SDK', 'Blender', 'Substance Painter'];

export default function Sauna() {
  return (
    <ProjectLayout
      pageTitle="Sauna Simulator VR — Joonas Alanenpää"
      category="VR / Unity"
      title="Sauna Simulator VR"
      meta={META}
      tools={TOOLS}
    >
      <div className="project-body">
        {/* Intro */}
        <div className="callout-box mb-16 max-w-4xl mx-auto">
          <p className="text-sm font-semibold font-mono tracking-widest mb-2 text-[#ccff00]">
            [ The Concept ]
          </p>
          <p className="text-[#EAEAEA] text-xl leading-relaxed m-0 font-inter">
            A Virtual Reality simulation of a traditional Finnish summer cabin and sauna experience.
            The goal was to create a highly immersive, physics-heavy environment where users can chop wood,
            heat up a stove, throw water on the rocks for steam (löyly), and relax by the lake.
          </p>
        </div>

        <div className="project-section max-w-5xl mx-auto mb-24">
          <img
            src="/images/sauna/coverkuva.png"
            className="w-full h-auto object-contain rounded-sm"
            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}
            alt="Sauna Simulator screenshot"
          />
        </div>

        <div className="project-section max-w-4xl mx-auto mb-6">
          <h2 className="mb-8">Demo Video</h2>
          <div className="aspect-video w-full border border-[#333333] bg-black">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/Uj53fOqBb94?si=T2Ll71upCIAdbl3v"
              title="Sauna Simulator VR Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <div className="mb-24" />

        <div className="project-section max-w-4xl mx-auto">
          <h2>Development Highlights</h2>
          <p className="text-xl leading-relaxed text-[#AEAEAE] mb-8">
            Built from the ground up using <strong className="text-white">Unity and the Oculus VR SDK</strong>.
            The core gameplay loop centers around realistic interactions and physics, requiring
            custom C# scripting for object grabbing, hinge joints (doors, windows), and particle systems.
          </p>

          <ul className="list-disc pl-5 my-12 space-y-6 text-[#EAEAEA] text-lg font-inter marker:text-[#ccff00]">
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Physics-Based Interaction:</strong>
              Every log, bucket, and tool has a rigidbody. Players must physically swing an axe with momentum to split wood, mimicking real-life effort.
            </li>
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Dynamic Steam System:</strong>
              When water collides with the heated rocks of the kiuas (stove), custom particle systems trigger "löyly", paired with authentic spatial audio recorded in a real sauna.
            </li>
            <li>
              <strong className="text-white font-mono uppercase text-sm block mb-1">Environmental Storytelling:</strong>
              Built the 3D assets in Blender and textured them using Substance Painter to achieve a stylized yet grounded "Nordic summer night" aesthetic.
            </li>
          </ul>
        </div>

        {/* Image gallery — framed panels */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] grid grid-cols-1 lg:grid-cols-2 border-y border-[#333333] bg-[#050505]">
          <div className="border-b lg:border-b-0 lg:border-r border-[#333333] p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Environment Assets ]</h3>
            <img
              src="/images/sauna/kauha.png"
              className="w-full object-contain grayscale hover:grayscale-0 transition-all duration-700 max-h-[400px]"
              alt="Sauna bucket and ladle 3D asset"
            />
          </div>
          <div className="p-8 hover:bg-[#111111] transition-colors duration-500">
            <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest mb-6">[ Sauna Building Exterior ]</h3>
            <img
              src="/images/sauna/finnish-sauna-building.png"
              className="w-full object-contain grayscale hover:grayscale-0 transition-all duration-700 max-h-[400px]"
              alt="Finnish Sauna Building Exterior 3D Asset"
            />
          </div>
        </div>

        {/* Final Dev Shot */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-0 border-t border-[#333333] bg-[#050505]">
          <h3 className="text-[#ccff00] font-mono uppercase text-sm tracking-widest px-8 pt-8 mb-6">[ Unity Engine — Development ]</h3>
          <img
            src="/images/sauna/saunadev.png"
            className="w-full h-[60vh] object-cover grayscale hover:grayscale-0 transition-all duration-700"
            alt="Sauna Unity Engine VR development"
          />
        </div>

      </div>
    </ProjectLayout>
  );
}
