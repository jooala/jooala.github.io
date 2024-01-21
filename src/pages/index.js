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
  const cardSubtitleSustis = useRef(null);
  const cardSubtitleSauna = useRef(null);
  const cardSubtitleDouble = useRef(null);

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
      'Several different type of work with Bugbear Entertainment behind video games in Wreckfest, Ridge Racer Unbounded and FlatOut-series.',
      cardSubtitleBugbear
    );

    createSubtitle(
      'Health Care mobile app UX Design assignment for Reaktor 2022 Designer Trainee position.',
      cardSubtitleReaktor
    );
    createSubtitle(
      'UI Design Task for Grocery Store pickup system for Wolt UI Designer role.',
      cardSubtitleWolt
    );
    createSubtitle(
      "University software development course project with UX design involved for Sukeltajaliitto in my CS Bachelor's degree.",
      cardSubtitleSukeltaja
    );
    createSubtitle(
      'Graphic Design and branding work for Finnish E-Sports Organization Botnia Vikings, competing in video games such as Counter-Strike Global Offensive & VALORANT. ',
      cardSubtitleBotnia
    );
    createSubtitle(
      'UI/UX Project: Addressing fashions environmental impact by solving lack of transparency and consumer wastefulness. ',
      cardSubtitleSustis
    );
    createSubtitle(
      'VR Project made in Unity, which is aiming to simulate sauna experience.',
      cardSubtitleSauna
    );
    createSubtitle(
      'Service Design project in IDBM Industry Project with Doublepoint: innovating with touch detection tech for enhanced independence in disabilities.',
      cardSubtitleDouble
    );
  };

  useLayoutEffect(() => {
    updateText();
  }, []);

  return (
    <div>
      <section className="min-h-screen relative">
        {/* Background Image */}
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-center bg-contain">
          <img src="/images/backdrop.png" alt="" />
        </div>
        <div className="container justify-center pt-24 md:pt-24 mx-auto flex flex-wrap flex-col lg:flex-row items-center relative z-10">
          <div className="flex flex-col w-full xl:w-5/12 justify-center items-start mx-4">
            <h1 className="my-20 text-3xl md:text-4xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Hello, I'm Joonas!
              </span>
              <p className="text-xl font-normal mt-5 text-left">
                International Design Business Management Master's
                degree student with a background in software and
                service engineering. Bachelor's in Computer Science.
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
              className="mx-auto w-3/5 xl:w-3/5 xl:block transform -rotate-6 transition hover:scale-105 duration-700 ease-in-out hover:rotate-6"
              src="./images/profile.png"
            />
          </div>
          <div className="flex flex-col w-full justify-center items-center mx-4 md:items-start">
            <h1 className="my-20 text-3xl md:text-4xl sm:text-3xl text-white font-bold leading-tight text-center mt-28">
              <span className="bg-clip-text font-poppins">
                Projects
              </span>
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-12 md:gap-24 2xl:gap-24">
              <Link href="/projects/doublepoint">
                <div
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/doublepointlab.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-xl text-shadow-lg">
                      Doublepoint
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleDouble}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/sustainablyyours">
                <div
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/sustis.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-xl ">
                      Sustainably Yours
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleSustis}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/reaktor">
                <div
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi3.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-xl">
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
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi4.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-xl">
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
              <Link href="/projects/sauna">
                <div
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/sauna.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-2xl mx-1">
                      Sauna Simulator
                    </h3>
                    <h4
                      className="card-subtitle text-base"
                      ref={cardSubtitleSauna}
                    ></h4>
                  </div>
                  <i className="fa-solid fa-hat-witch card-icon"></i>
                </div>
              </Link>
              <Link href="/projects/bugbear">
                <div
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-2xl mx-1">
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
              <Link href="/projects/botnia">
                <div
                  className="card "
                  style={{
                    background: `linear-gradient(
                      rgb(0 90 255 / 50%), 
                      rgb(0 0 0)
                    ), url(/images/testi5.png) no-repeat center`,
                  }}
                >
                  <div className="card-content">
                    <h3 className="card-title xl:text-3xl font-poppins text-xl">
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
        {/* Header */}
        <div className="w-full bg-opacity-50 absolute top-0 z-20">
          <Header />
        </div>
      </section>
    </div>
  );
}

export default App;
