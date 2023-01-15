import Header from '../Header';
import kuva from '../imgs/bugbear/logo.png';
import Image from 'next/image';

export default function Bugbear() {
  return (
    <div>
      <section className="min-h-screen">
        <Header />
        <div id="main">
          <div className="container pt-24 md:pt-24 px-24 mx-auto flex flex-wrap flex-col md:flex-row items-center">
            <h1 className="my-20 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Bugbear Entertainment
              </span>
            </h1>
            <br />
            <br />
            <div className="grid grid-cols-3 text-xl text-white leading-tight text-left">
              <div className="col-span-2 mr-20">
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
              <Image
                src={kuva}
                className="w-full h-full bg-center bg-cover col-span-1 flex-nowrap -mt-2 hidden xl:block"
                unoptimized
              />
            </div>
            <div className="image-main items-center grid grid-rows-3 my-4">
              <iframe
                width="960"
                height="540"
                className="my-10"
                src="https://www.youtube.com/embed/eRBofi1ZR14"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <iframe
                width="960"
                height="540"
                src="https://www.youtube.com/embed/-m3tAeseBNE"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
              <iframe
                width="960"
                height="540"
                src="https://www.youtube.com/embed/E-p1mQg6KuM"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}