import Header from '../Header';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function Bugbear() {
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
            <h1 className="my-8 md:my-20 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Bugbear Entertainment
              </span>
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 text-xl text-white leading-tight text-left">
              <div className="col-span-1 md:col-span-2 mr-10">
                <p>
                  I have had the opportunity to work with Bugbear
                  Entertainment multiple times on a variety of tasks
                  related to game development, such as graphics
                  design, video production, testing, quality
                  assurance, and bug fixing. Bugbear Entertainment is
                  a well-known video game company in Finland and is
                  known for creating popular games such as the
                  FlatOut-series, Ridge Racer Unbounded, and
                  Wreckfest. I had the privilege of being a game
                  tester during the development of Ridge Racer
                  Unbounded and providing additional assistance for
                  Wreckfest. <br />
                  <br /> Here is the link to my credits page on
                  MobyGames:
                </p>
                <p>
                  <a
                    href="https://www.mobygames.com/developer/sheet/view/developerId,516527/"
                    className="text-blue-600"
                  >
                    https://www.mobygames.com/developer/sheet/view/developerId,516527/
                  </a>
                </p>
                <br />
                <p>
                  Below are a few trailers that I was heavily involved
                  in the video production of which were published on
                  social media.
                </p>
              </div>
              <img
                src="/images/bugbear/logo.png"
                className="w-full bg-center md:col-span-1 object-cover -mt-20"
                unoptimized
              />
            </div>
            <div className="image-main items-center grid w-3/4 mx-auto grid-rows-3 my-4">
              <div>
                <iframe
                  class="w-full aspect-video p-3"
                  src="https://www.youtube.com/embed/eRBofi1ZR14"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div>
                <iframe
                  class="w-full aspect-video p-3"
                  src="https://www.youtube.com/embed/-m3tAeseBNE"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write;
                  encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="w-full">
                <iframe
                  class="w-full aspect-video p-3"
                  src="https://www.youtube.com/embed/E-p1mQg6KuM"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
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
