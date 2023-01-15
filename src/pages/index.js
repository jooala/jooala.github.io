import React, { useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from './Header';
import image from './imgs/testi.png';

function App() {
  const cardSubtitleBugbear = useRef(null);
  const cardSubtitleReaktor = useRef(null);
  const cardSubtitleWolt = useRef(null);
  const cardSubtitleSukeltaja = useRef(null);
  const cardSubtitleBotnia = useRef(null);

  const updateText = () => {
    const createWord = (text, index) => {
      const word = document.createElement('span');

      word.innerHTML = `${text} `;

      word.classList.add('card-subtitle-word');

      word.style.transitionDelay = `${index * 40}ms`;

      return word;
    };

    const addWord = (text, index, cardSubtitle) => {
      if (cardSubtitle.current) {
        cardSubtitle.current.appendChild(createWord(text, index));
      }
    };

    const createSubtitle = (text, cardSubtitle) => {
      text
        .split(' ')
        .map((word, index) => addWord(word, index, cardSubtitle));
    };

    createSubtitle(
      'Video Game Company behind Wreckfest and Flatout-series.',
      cardSubtitleBugbear
    );

    createSubtitle('Design Agency.', cardSubtitleReaktor);
    createSubtitle(
      'UX Design Challenge for Grocery Store pickup system.',
      cardSubtitleWolt
    );
    createSubtitle(
      'Course project work for SukeltajaLiitto in my Bachelor degree',
      cardSubtitleSukeltaja
    );
    createSubtitle(
      'Graphic Design and branding work for Finnish E-Sports Organization Botnia Vikings, competing in video games Counter-Strike Global Offensive & VALORANT. ',
      cardSubtitleBotnia
    );
  };

  useLayoutEffect(() => {
    updateText();
  }, []);

  return (
    <div>
      <section className="min-h-screen">
        <Header />
        <div className="container pt-24 md:pt-24 mx-auto flex flex-wrap flex-col md:flex-row items-center">
          <div className="flex flex-col w-full xl:w-2/4 justify-center items-start mx-4">
            <h1 className="my-20 text-3xl md:text-4xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Hello, I'm Joonas!
              </span>
              <p className="text-xl font-medium text-left">
                International Design Business Management Master's
                degree student with background in software
                development. Enthustiastic in designing and video
                games.
              </p>
            </h1>
            <a
              href="mailto: joonas.alanenpaa@aalto.fi"
              className="btn text-xl text-white font-bold font-poppins text-center"
            >
              Get in Touch!
            </a>
          </div>
          <div className="p-8">
            <img
              className="mx-auto hidden w-3/5 xl:w-3/5 xl:block transform -rotate-6 transition hover:scale-105 duration-700 ease-in-out hover:rotate-6"
              src="./images/profile.png"
            />
          </div>
          <div>
            <h1 className="my-20 text-34xl md:text-5xl text-white font-bold leading-tight text-left mt-28">
              <span className="bg-clip-text font-poppins">
                Projects
              </span>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-12 md:gap-24 2xl:gap-32">
              <Link href="/projects/bugbear">
                <div
                  className="card w-80"
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl text-xl">
                      Bugbear Entertainment
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleBugbear}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/reaktor">
                <div
                  className="card w-80"
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi3.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl text-xl">
                      Reaktor
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleReaktor}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/wolt">
                <div
                  className="card w-80"
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi4.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl text-xl">
                      Wolt
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleWolt}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/sukeltaja">
                <div
                  className="card w-80"
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi2.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl text-xl">
                      Sukeltajaliitto
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleSukeltaja}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/botnia">
                <div
                  className="card w-80"
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi5.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl text-xl">
                      Botnia Vikings
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleBotnia}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
