import Header from '../Header';
import React from 'react';
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Link from 'next/link';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import { trackPageTime } from '../../utils/googleAnalytics';

export default function Sukeltaja() {
  useEffect(() => {
    const stopTracking = trackPageTime();

    return () => {
      stopTracking();
    };
  }, []);
  return (
    <div>
      <Head>
        <title>Sukeltaja - Joonas Alanenpää</title>
      </Head>
      <section className="min-h-screen">
        <Header />
        <div className="container pt-24 md:pt-24 mx-auto px-24 flex flex-wrap flex-col md:flex-row items-center">
          <div className="mb-4 w-full">
            <Link href="/">
              <div className="text-white text-2xl xl:text-3xl flex items-center cursor-pointer hover:underline">
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  className="mr-2"
                />
              </div>
            </Link>
          </div>
          <h1 className="my-20 text-3xl md:text-5xl text-white font-bold leading-tight text-left">
            <span className="bg-clip-text font-poppins">
              Sukeltaja-App UX
            </span>
          </h1>
          <div className="grid grid-cols-3">
            <div className="text-xl font-medium text-white font-bold leading-tight text-left col-span-2">
              <p>
                In this project, I had the opportunity to work with a
                team to improve the user interface and user experience
                of a mobile application for Sukeltaja Liitto. The
                project was completed as part of a software
                development course at the University of Helsinki in
                2019, which I took for a total of 10 academic credits
                over a period of 4 months. This course was part of
                Bachelor's degree in Computer Science, which means
                that we didn't have any prior experience with UX.
                <br />
                <br />
                Our primary objective was to add new features from the
                backlog and simplify the user experience of the app,
                while still retaining the essential features that the
                client requested. To accomplish this, we utilized
                design tools Figma and Photoshop to design and
                prototype the user experience, and we implemented the
                frontend using React Native and Expo, and the backend
                with Node and the Express library.
                <br />
                <br />
                Throughout the project, we worked closely with the
                client to ensure that their needs and preferences were
                being met. I am pleased to report that the client was
                very satisfied with the final result. From my personal
                view this work was the spark for me to get interested
                more with UX/UI design than software development.
                <br />
                <br />
                However as this wasn't a supposed to be UX course and
                the course was mostly about learning software
                development in agile teams than designing, we still
                managed to pinpoint problems and create solutions from
                our team's perspective and with the help of the user
                feedback.
              </p>
            </div>
            <img
              src="/images/sukeltaja/mockup.png"
              className="w-10/12 h-full bg-center bg-cover col-span-1 flex-nowrap -mt-12 "
            />
          </div>
          <img
            src="/images/sukeltaja/coverKuva.png"
            className="w-full h-full bg-center bg-cover duration-500 mt-20 rounded-3xl"
          />
          <h1 className="mt-20 text-1xl md:text-4xl text-white font-bold leading-tight text-left">
            Problem 1: Creating event
          </h1>
          <h2 className="mt-5 text-1xl md:text-xl text-white leading-tight text-left my-20">
            Based on feedback from clients, we identified an
            opportunity to streamline the process of creating an event
            within our app. The previous process required users to
            navigate through multiple screens and complete multiple
            steps, including marking an event as "active" before being
            able to interact with it. <br /> <br />
            To address this issue, we redesigned the event creation
            flow by reducing the number of steps and screen
            transitions required. We achieved this by integrating the
            event creation form directly within the map screen,
            allowing users to easily find the location and create an
            event in one step. We also removed the need for an
            additional step of marking an event as "active" before
            interacting with it. <br /> <br /> To visualize the new
            flow, we created wireframes on a whiteboard which helped
            us to validate the new process before implementing it. The
            new flow now allows users to simply:
            <br />
            <br />
            1. Open the map screen
            <br />
            2. Find the location you want to travel and go diving
            <br />
            3. Click on the location and click "Add Event"-button on
            popup
            <br />
            4. Fill the form with information and submit
            <br />
            5. Event opens automatically after submitting or you can
            open it from the list
            <br />
            6. Now you can do actions like dive, chat, change settings
            etc. with the event
            <br />
            <br />
            This redesign not only simplifies the event creation
            process but also enhances the user experience by removing
            unnecessary steps and making it more intuitive and
            efficient.
          </h2>

          <Swiper
            modules={[
              Navigation,
              Pagination,
              Scrollbar,
              A11y,
              Autoplay,
            ]}
            spaceBetween={50}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 4000 }}
            onSwiper={(swiper) => console.log(swiper)}
            onSlideChange={() => console.log('slide change')}
          >
            <SwiperSlide>
              <img
                src="/images/sukeltaja/concept_1.png"
                className="rounded-3xl"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src="/images/sukeltaja/concept_2.png"
                className="rounded-3xl"
              />
            </SwiperSlide>
          </Swiper>

          <h1 className="mt-20 text-1xl md:text-4xl text-white font-bold leading-tight text-left">
            Problem 2: Visualization
          </h1>
          <h2 className="mt-5 text-1xl md:text-xl text-white leading-tight text-left my-20">
            In order to address the issue of a cluttered visual design
            and difficulty accessing information within the app, we
            leveraged previously collected feedback from our users to
            understand their specific pain points and needs. Based on
            this feedback, we implemented a clean and minimalistic
            visual design, using clear typography, ample white space,
            and intuitive icons to guide the user. Additionally, we
            reorganized the information architecture of the app to
            make it more logical and easy to navigate, using clear
            headings, grouping related information together and
            providing a search function. These changes were directly
            informed by the feedback we received, and allowed us to
            improve the usability and accessibility of the app,
            resulting in a better user experience.
          </h2>

          <div className="items-center">
            <iframe
              width="960"
              height="540"
              src="https://www.youtube.com/embed/ytfsuFhI6-A"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
