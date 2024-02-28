import Header from '../Header';
import Link from 'next/link';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import { trackPageTime } from '../../utils/googleAnalytics';

export default function Doublepoint() {
  useEffect(() => {
    const stopTracking = trackPageTime();

    return () => {
      stopTracking();
    };
  }, []);
  return (
    <div>
      <Head>
        <title>Doublepointlab - Joonas Alanenpää</title>
      </Head>
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
            <h1 className="my-20 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Doublepoint
              </span>
            </h1>
            <br />
            <br />
            <div className="grid grid-cols-4 text-xl text-white leading-tight text-left">
              <div className="col-span-4 mr-10">
                <p>
                  This project highlights our collaboration during the
                  IDBM Industry Project course at Aalto University,
                  where our interdisciplinary team worked with
                  Doublepoint, a startup specializing in touch
                  detection technology. Focused on entrepreneurship
                  and startups, our project aimed to find innovative
                  applications for Doublepoint's technology,
                  particularly in enhancing independence for
                  individuals with disabilities. <br />
                  <br />
                  Here is only a summarized version of our full report
                  which included our design process, the chosen
                  solution, and its validation, emphasizing the
                  potential impact on user experiences and business
                  prospects. The goal is to showcase how Doublepoint's
                  technology can contribute to inclusivity and
                  independence for people with disabilities.
                </p>
              </div>
            </div>
            <img
              src="/images/doublepoint/coverkuva.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl"
            />
            <div className="grid grid-cols-4 text-xl text-white leading-tight mt-20 text-left">
              <div className="col-span-4 mr-10">
                <p>
                  The 7-month design process involved an immersive
                  exploration of the startup and XR industry
                  landscape, followed by user needs discovery and
                  research on inclusive technologies. The design
                  challenge was redefined, leading to a solution
                  through ideation and prototyping using the double
                  diamond process framework.
                  <br />
                  <br />
                  Our team conducted industry immersion, with trips to
                  California and Tokyo, engaging with professionals
                  and attending XR-related events in Helsinki.
                  Valuable insights were gained, leading to
                  conclusions about the XR industry's relevance,
                  dominance by big tech companies, and the importance
                  of user-friendly integration. The team identified a
                  niche market in accessibility, focusing on mobile
                  people with assistants.
                  <br />
                  <br />
                  Thorough research included desktop and field
                  research, involving interviews with seven user
                  groups and associations. Thematic analysis revealed
                  three main design directions: Independent home life,
                  Safety, Education and rehabilitation, and
                  Navigation. Navigation was eliminated due to
                  technological constraints.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 text-xl text-white leading-tight mt-20 text-left">
              <div className="col-span-4 mr-10">
                <p>
                  The 7-month design process involved an immersive
                  exploration of the startup and XR industry
                  landscape, followed by user needs discovery and
                  research on inclusive technologies. The design
                  challenge was redefined, leading to a solution
                  through ideation and prototyping using the double
                  diamond process framework.
                  <br />
                  <br />
                  Our team conducted industry immersion, with trips to
                  California and Tokyo, engaging with professionals
                  and attending XR-related events in Helsinki.
                  Valuable insights were gained, leading to
                  conclusions about the XR industry's relevance,
                  dominance by big tech companies, and the importance
                  of user-friendly integration. The team identified a
                  niche market in accessibility, focusing on mobile
                  people with assistants.
                  <br />
                  <br />
                  Thorough research included desktop and field
                  research, involving interviews with seven user
                  groups and associations. Thematic analysis revealed
                  three main design directions: Independent home life,
                  Safety, Education and rehabilitation, and
                  Navigation. Navigation was eliminated due to
                  technological constraints.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 text-xl text-white leading-tight mt-20 text-left">
              <div className="col-span-4 mr-10">
                <h2 className="text-2xl text-white font-bold mb-6">
                  Finding the Solution
                </h2>

                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-3 md:col-span-1">
                    <div
                      className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                      style={{
                        background:
                          'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                        border: '0.2vmin solid rgb(3, 169, 244)',
                      }}
                    >
                      <h3 className="text-xl font-bold font-poppins">
                        Independent Home Life
                      </h3>
                      <br />
                      <p>
                        Smart home environments using Doublepoint's
                        technology to control surroundings. Concerns
                        about cost and financial accessibility deemed
                        this solution unfeasible.
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-1">
                    <div
                      className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                      style={{
                        background:
                          'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                        border: '0.2vmin solid rgb(3, 169, 244)',
                      }}
                    >
                      <h3 className="text-xl font-bold font-poppins">
                        Safety
                      </h3>
                      <br />
                      <p>
                        Emergency alerts solution faced challenges in
                        the wider service system, rendering it
                        unfeasible.
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 md:col-span-1">
                    <div
                      className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                      style={{
                        background:
                          'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                        border: '0.2vmin solid rgb(3, 169, 244)',
                      }}
                    >
                      <h3 className="text-xl font-bold font-poppins">
                        Learning and Rehabilitation
                      </h3>
                      <br />
                      <p>
                        Utilizing Doublepoint’s touch technology in
                        learning and rehabilitation for people with
                        disabilities. Deemed the most desirable,
                        feasible, and viable solution after careful
                        evaluation.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl text-white font-bold mt-6">
                  Innovation
                </h3>
                <p>
                  Fine motor skills, crucial for tasks requiring
                  dexterity, hand-eye coordination, and finger
                  manipulation, align with Doublepoint's touch
                  detection technology. The design challenge emerged:
                  "How might Doublepoint's touch detection technology
                  make people with fine motor disabilities more
                  independent?" We shifted the focus to individuals
                  with fine motoric skills, including those
                  post-stroke, with brain injuries, CP, neuromuscular
                  disorders, or developmental coordination disorders.
                </p>
                {/* Centered image */}
                <div className="flex justify-center items-center">
                  <img
                    src="/images/doublepoint/userrstory1.png"
                    className="h-10/12 duration-500 mt-20 rounded-3xl"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 text-xl text-white leading-tight mt-20 text-left">
              <div className="col-span-4 mr-10">
                {/* ... (previous code) */}
                <h2 className="text-2xl text-white font-bold mb-6">
                  Solution
                </h2>
                <h3 className="text-xl text-white font-bold mb-4">
                  Solution for the User (End-Product)
                </h3>
                <p>
                  We identified the need for gamified physiotherapy,
                  making exercises interactive and enjoyable.
                  Collaborating with Rehaboo, a gamified exercise game
                  platform, was explored. Our innovation process
                  included brainstorming, defining core value
                  propositions, creating a business model, and
                  prototyping. The tap-based game prototype showcased
                  Doublepoint's technology at events like Impact Gala
                  and Service Design Day at Miltton, receiving
                  positive feedback with considerations for graphic
                  improvements. The emphasis was on creating a product
                  catering to various user demographics.
                </p>
                <br />
                <br />
                <p>
                  The key idea behind the product concept is to gamify
                  fine motor physiotherapy with the help of touch
                  detection technology. This way, people with fine
                  motor disabilities can carry out their physiotherapy
                  exercises by playing a game. The game is controlled
                  with specified hand gestures, such as pinches or
                  clenches, which are tracked by a wearable smart
                  device on the user’s wrist. The touch detection
                  sensor is highly sensitive, and the algorithm is
                  trainable and customizable, making the product
                  suitable for those with limited muscle power or
                  imprecise motions.
                </p>
                <div className="flex justify-center items-center">
                  <img
                    src="/images/doublepoint/userrstory2.png"
                    className="h-10/12 duration-500 mt-20 rounded-3xl"
                  />
                </div>
                <br />
                <br />
                <p>
                  The touch detection technology can be connected to
                  various games through the SDK, enhancing inclusivity
                  and attractiveness to a wider user group. The game
                  can be played in healthcare settings or at home
                  using any smartwatch with the touch SDK installed,
                  connected to a computer or mobile device. The SDK
                  and the game can be installed on the user’s own
                  devices or provided by healthcare services.
                </p>
                <br />
                <br />
                <p>
                  In the best-case scenario, the entire physiotherapy
                  plan could be built on the game platform, making
                  exercising an engaging journey. This may enhance the
                  user’s motivation while making progress more
                  trackable and tangible. Social elements in the game
                  could allow users to practice with others, providing
                  peer support and reducing the feeling of isolation,
                  common among those with motor disabilities.
                </p>
                <br />
                <br />
                <p>
                  Several key design principles for the end-product
                  include the ability to control the game with
                  specified hand gestures, regardless of the user's
                  fine motor capabilities, individualized game
                  journeys covering their physiotherapy plan, progress
                  tracking, motivational notifications, and
                  lightweight, customizable, and sensitive devices.
                </p>
                <div className="flex justify-center mt-20 items-center">
                  <img
                    src="/images/doublepoint/prototype.gif"
                    className="h-10/12 duration-500 rounded-3xl"
                  />
                </div>
                <h3 className="text-xl text-white mt-10 font-bold mt-6">
                  Solution for Doublepoint (Business Model)
                </h3>
                <p>
                  On the other side of the coin, there is the solution
                  that implements this user end-product, while
                  addressing Doublepoint’s needs in terms of business
                  development (i.e., business model). This side of the
                  coin strives to answer the initial brief – to
                  present a novel use case for Doublepoint’s touch
                  detection technology, and to argue for its
                  desirability, feasibility, and desirability.
                </p>
                <br />
                <br />
                <p>
                  The business model revolves around providing client
                  companies with the touch SDK for their physiotherapy
                  game development. The SDK allows for the integration
                  of touch detection technology into various
                  physiotherapy games, offering a novel and inclusive
                  way for individuals with fine motor disabilities to
                  engage in their rehabilitation.
                </p>
                <br />
                <br />
                <p>
                  Doublepoint’s touch detection technology is highly
                  adaptable, making it suitable for integration with
                  existing games through partnerships with game
                  developers. This extends the variety of games
                  available, addressing the need for diverse options
                  highlighted in feedback. Particularly, the mobile
                  gaming industry can benefit from incorporating
                  accessibility features through Doublepoint’s
                  existing SDK, given its integration with the Unity
                  game engine.
                </p>
                <br />
                <br />
                <p>
                  The business model aims to make the touch SDK
                  accessible to healthcare services, allowing them to
                  provide devices and games to users. This creates
                  opportunities for partnerships and collaborations
                  with healthcare providers, further expanding the
                  reach and impact of Doublepoint’s technology.
                </p>
                <div className="flex justify-center items-center">
                  <img
                    src="/images/doublepoint/businessmodel.png"
                    className="h-10/12 duration-500 rounded-3xl"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-8 text-white">
              <div className="col-span-4 md:col-span-1">
                <div
                  className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                  style={{
                    background:
                      'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                    border: '0.2vmin solid rgb(3, 169, 244)',
                  }}
                >
                  <h3 className="text-xl font-bold font-poppins">
                    Validation
                  </h3>
                  <br />
                  <p>
                    The success of the solution hinges on its
                    desirability, technical feasibility, and financial
                    viability. While this report serves as an initial
                    screening, deeper considerations are essential if
                    the concept moves to implementation.
                  </p>
                </div>
              </div>

              <div className="col-span-4 md:col-span-1">
                <div
                  className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                  style={{
                    background:
                      'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                    border: '0.2vmin solid rgb(3, 169, 244)',
                  }}
                >
                  <h3 className="text-xl font-bold font-poppins">
                    Desirability
                  </h3>
                  <br />
                  <p>
                    The end-users, physiotherapists, and game
                    developers stand to benefit from the value
                    proposition. The game, emphasizing engagement,
                    motivation, and fun, promises to improve
                    physiotherapy outcomes and reduce healthcare
                    costs, making it a desirable solution for various
                    stakeholders.
                  </p>
                </div>
              </div>

              <div className="col-span-4 md:col-span-1">
                <div
                  className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                  style={{
                    background:
                      'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                    border: '0.2vmin solid rgb(3, 169, 244)',
                  }}
                >
                  <h3 className="text-xl font-bold font-poppins">
                    Feasibility
                  </h3>
                  <br />
                  <p>
                    Integrating touch-interaction and gesture-based
                    features presents challenges, but the
                    Accessibility SDK's flexibility, technological
                    expertise, and potential collaborations offer
                    solutions. Limitations, including emotional
                    engagement and hardware constraints, are
                    acknowledged and can be addressed through
                    continuous improvement and partnerships.
                  </p>
                </div>
              </div>

              <div className="col-span-4 md:col-span-1">
                <div
                  className="rounded-md p-4 mb-6 shadow-lg hover:transform hover:scale-105 transition-transform duration-300"
                  style={{
                    background:
                      'linear-gradient(0deg, rgb(4 9 20) 0%, rgba(14,27,64,1) 100%)',
                    border: '0.2vmin solid rgb(3, 169, 244)',
                  }}
                >
                  <h3 className="text-xl font-bold font-poppins">
                    Viability
                  </h3>
                  <br />
                  <p>
                    Business viability involves assessing market
                    demand, research and development growth, user
                    feedback, and potential partnerships.
                    Doublepoint's capabilities, including Touch SDK
                    experience, machine-learning algorithms, and
                    strategic collaborations, position the solution
                    for success. However, deeper analysis and customer
                    interviews are essential to refine the business
                    model and explore alternative partnerships.
                  </p>
                </div>
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
