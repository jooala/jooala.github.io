import Header from '../Header';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function Botnia() {
  return (
    <div>
      <section className="min-h-screen relative">
        {/* Background Image */}
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-center bg-contain">
          <img src="/images/backdrop.png" alt="" />
        </div>

        <div
          id="main"
          className="container mx-auto px-4 relative z-10"
        >
          <div className="pt-24 md:pt-24 flex flex-wrap flex-col md:flex-row items-center">
            <div className="mb-4 mt-20 w-full md:w-full">
              <Link href="/">
                <div className="text-white text-xl md:text-2xl xl:text-3xl flex items-center cursor-pointer hover:text-blue-700 transform duration-300 ease-in-out">
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="mr-2"
                  />
                </div>
              </Link>
            </div>
            <h1 className="my-10 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Botnia Vikings
              </span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 text-xl text-white leading-tight text-left">
              <div className="col-span-1 md:col-span-2 mr-10">
                <p>
                  The project at hand entailed working with a Finnish
                  Esports organization, Botnia Vikings, to develop and
                  enhance their visual identity. The client, Botnia
                  Vikings, is an Esports organization based in
                  Finland, focused on fostering a competitive and
                  dynamic gaming community.
                  <br /> <br />
                  My role in this project was to create a cohesive
                  visual language that effectively represents the
                  team's values and objectives. The scope of work
                  included designing various creative assets such as
                  images and templates for social media, website
                  concept art, and branding guidelines. These
                  deliverables were instrumental in establishing a
                  consistent visual identity for the team and its
                  members, across various touchpoints. The images and
                  templates for social media were crafted to be
                  visually engaging, while also aligning with the
                  team's brand guidelines, to effectively communicate
                  the team's message and create a sense of unity among
                  its followers.
                  <br /> <br />
                  The branding guidelines were developed to ensure
                  that all future communications and designs produced
                  by the team adhered to a consistent visual language,
                  creating a cohesive and recognizable brand identity.
                  Overall, the project was a great opportunity for me
                  to showcase my design skills and contribute to the
                  growth of a dynamic and competitive Esports
                  organization. The deliverables produced were
                  well-received by the client and helped to establish
                  a strong and recognizable visual identity for the
                  team.
                </p>
              </div>
              <img
                src="/images/botnia/logo.png"
                className="w-full bg-center md:col-span-1 flex-nowrap -mt-12 "
              />
            </div>
            <div className="image-main items-center grid grid-col-1 my-20 gap-4">
              <img src="/images/botnia/banner3.png" />
              <img
                src="/images/botnia/colors.png"
                className="justify-self-center	"
              />
              <img
                src="/images/botnia/fontfamily.png"
                className="justify-self-center	"
              />
              <img src="/images/botnia/victory2.png" />
              <img src="/images/botnia/Defeat_Screen2.png" />
            </div>
            <div className="grid grid-cols-3">
              <div className="grid-span-2">
                <img src="/images/botnia/eagles.jpg" />
              </div>
              <div className="image-main items-center grid grid-span-2 mx-auto pb-10 flex ">
                <img src="/images/botnia/botniabanner.jpg" />
                <img src="/images/botnia/twitter.jpg" />
                <img src="/images/botnia/youtube_leftside.jpg" />
                <img src="/images/botnia/discord.jpg" />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="w-full bg-opacity-50 absolute top-0 z-20">
          <Header />
        </div>
      </section>
    </div>
  );
}
