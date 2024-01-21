import Header from '../Header';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function SustainablyYours() {
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
            <h1 className="my-20 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
              <span className="bg-clip-text font-poppins">
                Sustainably Yours
              </span>
            </h1>
            <br />
            <br />
            <div className="grid grid-cols-4 text-xl text-white leading-tight text-left">
              <div className="col-span-4 mr-10">
                <p>
                  The fashion industry, a major contributor to carbon
                  emissions, often conceals its operational practices
                  despite promoting sustainability. Transparency is
                  lacking, and consumers contribute by discarding
                  clothes after minimal use, worsening environmental
                  damage. The challenge is clear: create a platform
                  that raises awareness of fashion brands'
                  sustainability and motivates consumers to recycle
                  and donate.
                  <br /> <br />
                  This project, undertaken as part of a UI/UX course
                  at Singapore University of Technology and Design,
                  spans approximately four months. As participants in
                  this course, we engage in developing solutions to
                  sustainability-themed problem. The journey involves
                  extensive data gathering from research and surveys,
                  identification of target users, creation of multiple
                  prototypes, and user evaluations.
                </p>
              </div>
            </div>
            <img
              src="/images/sustainablyyours/coverkuva.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
              alt="Cover"
            />

            <div className="grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold leading-tight text-let">
                Data Gathering
              </h1>
              <p className="mt-5 col-span-4">
                Our approach to data gathering combined extensive
                literature research and targeted surveys among young
                adults in Singapore. This allowed us to understand
                sustainability challenges in the fashion industry,
                specifically tailored to the context of young adults
                in Singapore.
              </p>
              <div className="col-span-4 mt-5 text-left">
                <p>
                  <b>Literature Research:</b> The fashion industry,
                  contributing 10% of global carbon emissions, lacks
                  transparency in sustainability practices, with over
                  90% of companies not disclosing essential processes.
                  In addition, in the U.S., individuals discard 37 kg
                  of clothes annually, with 66% ending up in
                  landfills, typically after only 7 wears.
                  <br /> <br />
                  <b>Survey insights:</b> Surveys targeting
                  individuals aged 15-24 revealed that 51.6% discard
                  clothing, and only 4% is recycled in Singapore.
                  Barriers to recycling include a lack of convenient
                  options (82.4%), uncertainty about processes
                  (58.8%), and concerns about transparency (61.8%).
                  The demand for recycling incentives and knowledge
                  about sustainable brands was notably high.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 text-xl text-white leading-tight text-left mt-10">
              <img
                src="/images/sustainablyyours/stats.png"
                className="col-span-1 md:col-span-1 h-full object-cover rounded-lg "
                alt="Statistics"
              />
            </div>

            <div className="grid grid-cols-4 text-xl text-white mt-20 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold leading-tight text-let">
                Target Users
              </h1>
              <p className="mt-5 col-span-4 ">
                Creating user personas is vital for tailoring our
                platform to diverse user needs. By understanding
                distinct groups, like those interested in donations or
                sustainability rankings, we ensure precise information
                delivery. This approach caters to both primary and
                secondary users, fostering an inclusive and impactful
                experience. We also recognize the opportunity to
                engage non-interested users, influencing positive
                change through incentivizing rewards.
              </p>
              {/* Primary Users */}
              <div className="col-span-4 md:col-span-2 mt-28 text-left mr-10">
                <h2 className="text-2xl md:text-3xl text-white font-bold mb-3">
                  Primary Users:
                </h2>
                <p>
                  Our primary users fall into two distinct groups:
                  those interested in donations but not sustainability
                  rankings, and those interested in sustainability
                  rankings but not donations. Our goal is to cater to
                  both by providing precise information on fashion
                  companies' sustainability. <br /> <br />
                  The app takes an integrated approach, encouraging
                  users to sustain donation efforts and make
                  eco-conscious shopping decisions, bridging the gap
                  between their interests and promoting exploration of
                  features they might not initially prioritize.
                </p>
              </div>
              <div className="col-span-4 md:col-span-2 mt-24 ml-30">
                <img
                  src="/images/sustainablyyours/test.png"
                  alt="Primary User Persona"
                  className="w-full h-auto rounded-xl"
                />
              </div>

              {/* Secondary Users */}
              <div className="col-span-4 md:col-span-2 mt-20 text-left mr-10">
                <h2 className="text-2xl md:text-3xl text-white font-bold mb-3">
                  Secondary Users (Interested in Both):
                </h2>
                <p>
                  Our platform caters to users interested in
                  sustainability rankings and donations, offering
                  in-depth statistics on sustainable fashion brands,
                  encouraging active community engagement through
                  brand reviews and constructive feedback. This
                  creates a more comprehensive and engaging experience
                  for users with dual interests.
                </p>
              </div>
              <div className="col-span-4 md:col-span-2 mt-5">
                <img
                  src="/images/sustainablyyours/persona2.png"
                  alt="Secondary User Persona"
                  className="w-full h-auto rounded-xl"
                />
              </div>

              {/* Supplemental Users */}
              <div className="col-span-4 md:col-span-2 mt-20 text-left mr-10">
                <h2 className="text-2xl md:text-3xl text-white font-bold mb-3">
                  Supplemental Users (Non-interested Users):
                </h2>
                <p>
                  While our focus is on serving interested users, we
                  also recognize the presence of non-interested users.
                  However, seizing the attention of some of these
                  users presents an opportunity, particularly through
                  incentivizing rewards. Additionally, we acknowledge
                  that certain fast-fashion brands, often disregarding
                  sustainable practices, may fall into this category.
                  Our platform aims to influence positive change even
                  among those initially uninterested.
                </p>
              </div>
              <div className="col-span-4 md:col-span-2 mt-5">
                <img
                  src="/images/sustainablyyours/persona3.png"
                  alt="Supplemental User Persona"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
            {/* VI. PROTOTYPING */}
            {/* VI. PROTOTYPING Content */}
            {/* VI. PROTOTYPING Content */}
            <div className=" grid grid-cols-4 text-xl text-white mt-20 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-let">
                Prototyping: First Version
              </h1>
              <div className="col-span-4 md:col-span-2 mt-5 text-left">
                <p>
                  We started our prototyping journey from a whiteboard
                  prototype to a low-fidelity prototype which has been
                  created through the Figma App. We had three user
                  flows: donating clothes, searching for
                  sustainability ratings and receiving rewards.
                  <br /> <br />
                  Through our homepage, we aimed to reflect the two
                  goals of our app: to raise awareness of the
                  sustainability of fashion brands and to encourage
                  users to donate their clothes. As homepage was our
                  most crucial part of user journeys, we created
                  different variations which we in later stages
                  evaluated and received feedback in our user
                  evaluation.
                </p>
              </div>
              <img
                src="/images/sustainablyyours/proto1.png"
                className=" col-span-4 md:col-span-2 h-5/6 object-cover ml-20 "
                alt="First Prototypes"
              />
            </div>
            <div className=" grid grid-cols-4 text-xl text-white leading-tight text-left">
              <h1 className="-mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-right">
                User Testing & Evaluation
              </h1>
              <img
                src="/images/sustainablyyours/evaluation.png"
                className=" col-span-4 md:col-span-2 h- object-cover "
                alt="User Evaluation"
              />
              <div className="col-span-4 md:col-span-2 mt-5 text-right">
                <p>
                  We conducted tests after each prototype to
                  understand our user preferences, beahviors and
                  expectations. The iterative nature of the testing
                  process allowed for refinement based on user
                  feedback to improve the app's functionality and user
                  experience.
                  <br /> <br />
                  <b>User Testing and Evaluation I:</b>
                  <br />
                  Two tests, Sustainability Rating Awareness and
                  Donation Behavior, revealed insights into user
                  preferences. Valuable insights were gained for
                  refining design elements in the next iteration such
                  as improving feedback of the app and simplifiying
                  user journeys.
                  <br /> <br />
                  <b>User Testing and Evaluation II:</b>
                  <br />
                  The second round assessed usability and user
                  experience using Useberry, involving diverse
                  personas. The System Usability Score (SUS) of 79.8
                  reflected decent usability, with potential
                  enhancements for sustainability-focused users.
                  Exploration paths diverged among personas,
                  emphasizing the need for a versatile app. Aesthetics
                  and readability evaluations showed positive scores
                  for text clarity and icon relevance.
                </p>
              </div>
            </div>

            <div className=" grid grid-cols-4 text-xl text-white mt-20 leading-tight text-left">
              <h1 className="mt-20 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-let">
                Prototyping: Second Version
              </h1>
              <div className="col-span-4 md:col-span-2 mt-5 text-left">
                <p>
                  Following the initial prototype and user feedback,
                  we developed the second prototype, incorporating
                  insights from end-users for a more polished
                  appearance. This iteration involved exploring
                  various color schemes and adhering to improved
                  accessibility guidelines. User Evaluation II
                  assessed usability alongside feedback. Subsequent to
                  this evaluation, we implemented relevant changes,
                  culminating in our final prototype as the course
                  outcome.
                </p>
              </div>
              <img
                src="/images/sustainablyyours/proto2.png"
                className=" col-span-4 md:col-span-2 h-5/6 object-cover ml-20 "
                alt="Second Prototypes"
              />
            </div>
            <div className="grid grid-cols-4 text-xl text-white  leading-tight text-left -mt-40">
              <h1 className="col-span-4 text-1xl md:text-4xl text-white font-bold leading-tight text-let">
                Results
              </h1>
              <p className="mt-5 col-span-4">
                After completing the design and user testing phases
                for Sustainably Yours, we fine-tuned the user
                interface and overall experience. The final product
                received top marks for its comprehensive report. My
                primary responsibilities included overseeing the
                design process of the prototypes and deriving
                meaningful insights from the collected data. We also
                acknowledge that there is room for future
                improvements, especially in the visual design side.
                <br />
                <br />
                Here's the refined and successful final version of
                Sustainably Yours.
                <br />
              </p>
            </div>
            <img
              src="/images/sustainablyyours/results_1.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
              alt="Results"
            />
            <img
              src="/images/sustainablyyours/results_2.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
              alt="Results"
            />
            <img
              src="/images/sustainablyyours/results_3.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
              alt="Results"
            />
            <img
              src="/images/sustainablyyours/results_4.png"
              className=" h-10/12 duration-500 mt-20 mb-10 rounded-3xl		"
              alt="Results"
            />
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
