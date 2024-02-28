import Header from '../Header';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';

export default function Reaktor() {
  return (
    <div>
      <Head>
        <title>Reaktor - Joonas Alanenpää</title>
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
                Reaktor 2022 UX Designer Assignment
              </span>
            </h1>
            <br />
            <br />
            <div className="grid grid-cols-4 text-xl text-white leading-tight text-left">
              <div className="col-span-4 md:col-span-2 mr-10">
                <p>
                  As a candidate for the Reaktor UX Designer role for
                  Summer 2022, I was tasked with streamlining the user
                  experience of a digital healthcare mobile
                  application for an imaginary company.
                  <br /> <br />
                  The challenge was to choose two tasks from four
                  different options, and create a user flow for chosen
                  tasks.
                  <br /> <br />
                  The goal of Case C: Monitoring was to design a
                  user-friendly interface that allows users to easily
                  report their blood pressure to their doctor. The
                  difficulty here was that user should be measuring
                  their blood pressure twice and the average number
                  then would be submitted for the doctor.
                  <br /> <br />
                  In Case D: Prescriptions, the goal was to create a
                  user-friendly interface for checking the validity of
                  a user's prescription and locating the nearest
                  pharmacy that has the medication available.
                  <br /> <br />
                  I used Figma to create the user interface for this
                  assignment, which allowed me to create high-fidelity
                  wireframes and interactive prototypes that
                  effectively convey the proposed design solutions.
                  This helped me to validate my design choices and
                  prototype my design with actual device on your
                  hands.
                  <br /> <br />
                  This assignment was an excellent opportunity for me
                  to showcase my skills as a UX designer and
                  demonstrate my ability to improve the user
                  experience of a digital healthcare mobile
                  application. I am confident that my solutions would
                  have a positive impact on the overall user
                  experience of the digital healthcare mobile
                  application.
                  <br /> <br />
                  Now I'll explain couple of issues and my way of
                  thought process to solve these issues.
                </p>
              </div>
              <img
                src="/images/reaktor/cover.png"
                className=" col-span-4 md:col-span-2 w-3/4 h-3/4 object-cover ml-20 mt-20 "
              />
            </div>
            <img
              src="/images/reaktor/coverkuva.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
            />
            <div className=" grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-right">
                Case C: Problem 1 - Measuring blood pressure
              </h1>
              <img
                src="/images/reaktor/bloodpressure.png"
                className=" col-span-4 md:col-span-2 "
              />
              <div className="col-span-4 md:col-span-2 mt-5 text-right">
                <p>
                  As I began working on the Case C -assignment, which
                  involved designing a user-friendly interface for
                  reporting blood pressure to doctors, I quickly
                  identified an issue that needed to be addressed. The
                  problem was that the task of measuring blood
                  pressure was being assumed to be a known process for
                  all patients, however, measuring blood pressure
                  might not be a familiar process for everyone. This
                  presented a challenge as it was important to ensure
                  that the application was able to cater to the needs
                  of all users, regardless of their level of
                  familiarity with blood pressure measurement.
                  <br /> <br />
                  To address this issue, I proposed a solution that
                  involved providing an opt-out option for
                  instructions on the correct way to measure blood
                  pressure. This would ensure that new users who may
                  not have had the opportunity to receive guidance on
                  blood pressure measurement, would still be able to
                  use the application effectively. The instructions
                  could be presented as their own app screen or as a
                  pop-off notification when the user opens the blood
                  pressure measurement feature.
                  <br /> <br />
                  This solution was especially relevant given the
                  current Covid-19 pandemic, where remote appointments
                  for health checks have become more common. The
                  absence of face-to-face guidance from healthcare
                  professionals has highlighted the importance of
                  providing clear and easy-to-understand instructions
                  within digital health applications to ensure that
                  all users are able to use the application
                  effectively.
                </p>
              </div>
            </div>
            <div className=" grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-left">
                Case C: Problem 2 - Submitting the numbers
              </h1>
              <div className="col-span-4 md:col-span-2 mt-5 text-left">
                <p>
                  As I continued to work on the Case C -assignment, I
                  identified an additional issue that needed to be
                  addressed. The problem was that the process of
                  measuring blood pressure and submitting the results
                  to the doctor was unnecessarily complex and
                  confusing for the users. The issue was that the
                  users were required to enter the same information
                  multiple times, which led to confusion and a poor
                  user experience.
                  <br /> <br />
                  To solve this issue, I proposed a solution that
                  involved creating a seamless flow that guides the
                  users through the process of measuring and
                  submitting their blood pressure results. The
                  solution involved using a 2-step input screen and a
                  results screen that are divided by animations to
                  clearly illustrate the user's progress. This would
                  help users to understand the process and make it
                  more intuitive.
                  <br /> <br />
                  The input format for blood pressure was chosen to be
                  a "calculator-like" component that most smart device
                  users are already accustomed to. This design
                  decision was made to make it easy for users to
                  understand and use the feature, and to minimize the
                  chance of errors.
                </p>
              </div>
              <img
                src="/images/reaktor/bloodpressure2.png"
                className=" col-span-4 md:col-span-2 ml-20 "
              />
            </div>

            <div className=" grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-left">
                Case D: Problem 3 - Get your medications!
              </h1>
              <div className="col-span-4 mt-5 text-left">
                <p>
                  As I delved deeper into the Case D -assignment,
                  which involved designing a user-friendly interface
                  for checking the validity of prescriptions and
                  locating the nearest pharmacies that have the
                  medication available, I encountered a challenging
                  issue that required a thoughtful solution. The
                  problem was that it was difficult for users to
                  quickly and easily find the closest pharmacies that
                  had the medication they needed in stock. This
                  presented a problem as it could lead to users
                  wasting time and resources searching for medication
                  that may not be available.
                  <br /> <br />
                  For this case I ideated that using a "Google
                  Maps"-like service to display the closest pharmacies
                  on a map would be the best. The map would be
                  color-coded, with green indicating pharmacies that
                  have the medication in stock, and grey indicating
                  those that do not. Additionally, the map would
                  display additional information such as the opening
                  hours of the different pharmacies. This would help
                  users to quickly and easily identify the closest
                  pharmacies that have the medication they need in
                  stock, and also plan their visit accordingly.
                  <br /> <br />
                  In addition to this, I also incorporated the use of
                  GPS data from the user's device to help locate the
                  closest pharmacies, and an integration with the
                  device's navigation application. This would allow
                  users to easily navigate to the pharmacy of their
                  choice with the help of a "Get Directions" button.
                  This solution would not only save users time and
                  resources but also help them to find the medication
                  they need more efficiently and faster.
                </p>
              </div>
              <img
                src="/images/reaktor/map.png"
                className=" col-span-4 h-10/12 object-cover my-20 rounded-3xl	"
              />
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
