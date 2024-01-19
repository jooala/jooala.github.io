import Header from '../Header';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function Sauna() {
  return (
    <div>
      <section className="min-h-screen">
        <Header />
        <div id="main" className="container mx-auto px-4">
          <div className="pt-24 md:pt-24 flex flex-wrap flex-col md:flex-row items-center">
            <div className="mb-4 w-full md:w-full">
              <Link href="/">
                <div className="text-white text-xl md:text-2xl xl:text-3xl flex items-center cursor-pointer hover:underline">
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="mr-2"
                  />
                </div>
              </Link>
            </div>
            <h1 className="my-20 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Sauna Simulator
              </span>
            </h1>
            <br />
            <br />
            <div className="grid grid-cols-4 text-xl text-white leading-tight text-left">
              <div className="col-span-4 mr-10">
                <p>
                  The Sauna Simulator is a VR game designed to provide
                  an immersive and educational experience of
                  traditional Finnish sauna culture. Developed in
                  Unity, this project aims to bridge the gap for
                  individuals unfamiliar with Finnish saunas, offering
                  a realistic and enjoyable virtual environment.
                  <br /> <br />
                  The goal was to create a tool that not only educates
                  users about Finnish sauna practices but also
                  reassures and guides them through the experience. In
                  an era of rising anxiety and limited opportunities
                  for global travel, the Sauna Simulator brings the
                  beauty and history of Finnish saunas to a global
                  audience.
                </p>
              </div>
            </div>
            <img
              src="/images/sauna/coverkuva.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
              alt="Cover"
            />

            {/* Problem Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl text-white leading-tight text-left mt-10">
              <h1 className="md:col-span-2 text-1xl md:text-4xl text-white font-bold leading-tight text-left">
                Problem: Introducing Sauna Culture
              </h1>
              <div className="col-span-2 md:col-span-1 mt-5 mr-10">
                <p>
                  The traditional Finnish sauna is a unique
                  environment integral to Finnish culture, but for
                  those unfamiliar, it can be intimidating. The Sauna
                  Simulator addresses the discomfort and anxiety
                  associated with trying a sauna for the first time.
                  Through realistic graphics and user interactions,
                  the VR game guides users on sauna etiquette,
                  clothing, and the overall Finnish sauna experience.
                </p>
              </div>
              <img
                src="/images/sauna/finnish-sauna-building.png"
                alt="Sauna Building"
                className="col-span-2 md:col-span-1 h-10/12 object-cover -mt-20 "
              />
            </div>

            {/* Approach Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl text-white leading-tight text-left mt-10 relative">
              <img
                src="/images/sauna/kauha.png"
                alt="Scoop"
                className="col-span-2 md:col-span-1 h-4/5 object-cover z-0"
              />
              <div className="col-span-2 md:col-span-1 mt-5 text-center">
                <h1 className="text-1xl md:text-4xl text-white font-bold leading-tight text-center z-10">
                  Approach: Immersive Sauna Experience
                </h1>
                <p className="mt-10">
                  The approach involved showcasing the sauna
                  environment immersively. Realistic graphics, unique
                  assets, and user interactions were prioritized. The
                  VR game guides users through the Finnish sauna
                  culture, addressing concerns and providing a safe
                  space to learn and experience sauna functionalities.
                  The use of subtitles and narration enhances the user
                  journey, making the Sauna Simulator not just a game
                  but an educational tool emphasizing Finnish culture.
                </p>
              </div>
            </div>

            {/* Implementation Section */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-xl text-white leading-tight text-center mt-10">
              <h1 className="md:col-span-2 text-2xl md:text-4xl text-white font-bold leading-tight text-center">
                Implementation: Bringing Sauna to Virtual Reality
              </h1>
              <div className="col-span-2 md:col-span-1 mt-5 mr-10">
                <p>
                  The VR application was developed in Unity using the
                  High Definition Render Pipeline (HDRP) for advanced
                  3D real-time rendering. The implementation included
                  a collider system for the sauna stove, XR
                  Interaction Toolkit for object interactions, and
                  DLSS technology to optimize performance. The virtual
                  environment was modeled using height mapping from
                  Google Maps, ensuring a realistic Finnish lakeside
                  setting. Subtitles, audio narration, and a tutorial
                  guiding system were implemented to assist users in
                  understanding the virtual sauna experience, with a
                  focus on providing an enjoyable and educational
                  journey.
                </p>
              </div>
            </div>

            {/* Larger Picture Below */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-xl text-white leading-tight text-left mt-10">
              <img
                src="/images/sauna/saunadev.png"
                alt="Development"
                className="col-span-1 md:col-span-1 h-full object-cover rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-xl text-white leading-tight text-center mt-10">
              <h1 className="mt-10 col-span-4 text-2xl md:text-4xl text-white font-bold leading-tight text-center">
                Results: A Realistic and Educational Sauna Experience
              </h1>
              <div className="col-span-2 mt-5 text-center">
                <p>
                  The final AR/VR application successfully combines
                  Unity's powerful development capabilities with
                  advanced features such as HDRP, XR Interaction
                  Toolkit, DLSS, and a tutorial guiding system. The
                  application includes features like a collider system
                  for the sauna stove, realistic 3D model assets, and
                  enhanced lighting and realism with HDRP. The
                  tutorial system, subtitles, and audio narrator
                  contribute to making the virtual sauna experience
                  both enjoyable and educational, providing users with
                  a comprehensive understanding of Finnish sauna
                  practices.
                </p>
              </div>
            </div>

            {/* Larger Picture Below */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-xl text-white leading-tight text-center mt-10 mb-10">
              <div className="md:col-span-1 mx-auto">
                <iframe
                  width="1200"
                  height="700"
                  src="https://www.youtube.com/embed/Uj53fOqBb94?si=T2Ll71upCIAdbl3v"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  style={{ display: 'block' }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
