import Header from '../Header';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function Bugbear() {
  return (
    <div>
      <section className="min-h-screen">
        <Header />
        <div id="main" className="container mx-auto px-4">
          <div className="pt-8 md:pt-24 flex flex-wrap flex-col md:flex-row items-center">
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
                className="w-full h-full bg-center bg-cover md:col-span-1 w-3/4 h-3/4 object-cover hidden xl:block"
                unoptimized
              />
            </div>
            <div className="image-main items-center grid grid-rows-3 my-4">
              <iframe
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '960px',
                  maxHeight: '760px',
                }}
                className="my-10"
                src="https://www.youtube.com/embed/eRBofi1ZR14"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <iframe
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '960px',
                  maxHeight: '760px',
                }}
                src="https://www.youtube.com/embed/-m3tAeseBNE"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <iframe
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '960px',
                  maxHeight: '760px',
                }}
                src="https://www.youtube.com/embed/E-p1mQg6KuM"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
