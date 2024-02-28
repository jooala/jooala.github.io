import Header from '../Header';
import Link from 'next/link';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';
import { trackPageTime } from '../../utils/googleAnalytics';

export default function Wolt() {
  useEffect(() => {
    const stopTracking = trackPageTime();

    return () => {
      stopTracking();
    };
  }, []);
  return (
    <div>
      <Head>
        <title>Wolt - Joonas Alanenpää</title>
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
                Wolt 2022: UI Designer Assignment
              </span>
            </h1>
            <br />
            <br />
            <div className="grid grid-cols-4 text-xl text-white leading-tight text-left">
              <div className="col-span-4 mr-10">
                <p>
                  As an applicant for UI/UX designer position for
                  Wolt, my assignment was to design a new interface
                  for a fulfillment app to be used by our grocery
                  partners. The app is aimed to enable the grocery
                  partners to collect and fulfill orders in a more
                  efficient and effective way. The preparation and
                  collection process of food and grocery items differs
                  greatly, thus the need for new tools to support our
                  grocery partners.
                  <br /> <br />
                  My approach for this task was to create a design
                  that is intuitive and easy to use for the grocery
                  partners. I had the freedom to create custom
                  components and explore various visual styles, while
                  keeping in mind the consistency with the rest of
                  Wolt's applications. I aimed to create an interface
                  that feels like an integral part of the Wolt
                  ecosystem.
                </p>
              </div>
            </div>
            <img
              src="/images/wolt/coverkuva.png"
              className=" h-10/12 duration-500 mt-20 rounded-3xl		"
            />
            <div className=" grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-let">
                Problem 1: Overview of current orders
              </h1>
              <div className="col-span-4 md:col-span-2 mt-5 text-left">
                <p>
                  My solution for the task of creating a landing view
                  with a list of incoming orders was to divide the
                  orders into three different sections: New, Packing,
                  and Ready. This approach would allow for a clear and
                  organized overview of the orders, and make it easy
                  for the user to quickly access the information they
                  need.
                  <br /> <br />
                  The "New" section is intended for orders that are
                  incoming and require confirmation and time estimates
                  before moving to the "Packing" screen, where the
                  collecting and packing of the orders takes place.
                  <br /> <br />
                  The "Packing" section is for orders that are
                  currently being collected and packed, giving the the
                  end-user real-time information about the progress of
                  the order.
                  <br /> <br />
                  The "Ready" section is for orders that have been
                  collected, packed and marked as ready for the
                  courier to pick up. Idea behind this to help the
                  grocery store worker to easily identify and keep
                  track of the orders that are ready for delivery to
                  the client.
                </p>
              </div>
              <img
                src="/images/wolt/orders.png"
                className="col-span-4 md:col-span-2 h-10/12 object-cover md:ml-20 md:-mt-20 "
              />
            </div>
            <div className=" grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-right">
                Problem 2: Amount of items
              </h1>
              <img
                src="/images/wolt/collection.png"
                className=" col-span-4 md:col-span-2 h-10/12 object-cover md:-mt-56 "
              />
              <div className="col-span-4 md:col-span-2 mt-5 text-right">
                <p>
                  Visualizing the missing items from the order was to
                  help fastening the collection processes. Manually
                  adding items one by one also couldn't be the answer
                  as this would be slowing the collection phase too
                  much. For the work task of adding items as collected
                  was to include a button that allows the user to mark
                  items as collected in the app. This feature would
                  first automatically mark all items in the full
                  quantity that the client ordered.
                  <br /> <br />
                  In case an item is out of stock or there isn't
                  enough of a certain item, the user would have the
                  ability to reduce the amount of the items. This
                  would help keeping the collection phase faster than
                  adding items one by one with "add"-button and
                  simplifies communication of missing items for
                  grocery partner company and in later phase for the
                  client that ordered the groceries. The app would
                  show a little notification of the item's status,
                  indicating if the item is out of stock fully or
                  partly, helping the user to understand the
                  situation. This same component could also be used
                  for UI of the customers to visualize missing items.
                </p>
              </div>
            </div>

            <div className=" grid grid-cols-4 text-xl text-white mt-10 leading-tight text-left">
              <h1 className="mt-10 col-span-4 text-1xl md:text-4xl text-white font-bold  leading-tight text-let">
                Problem 3: Power-users!
              </h1>
              <div className="col-span-4 md:col-span-2 mt-5 text-left">
                <p>
                  My approach to improve efficiency for more
                  experienced workers was to create a feature that
                  enables power-users to easily access and manage
                  multiple active orders at once. Specifically, I
                  added a button located on the header of the
                  collection order screen that, when clicked, opens a
                  menu displaying all current active and ready orders.
                  This allows power-users to quickly browse through
                  the orders while multitasking and collecting items
                  for multiple different orders at the same time,
                  eliminating the need to navigate back and forth
                  multiple screens.
                  <br /> <br />
                  This feature is designed to be intuitive and
                  user-friendly, ensuring that power-users are able to
                  take full advantage of the app's features and
                  improve their workflow. It allows power-users to
                  manage multiple orders more efficiently, saving them
                  time and increasing their productivity.
                  <br /> <br />
                </p>
              </div>
              <img
                src="/images/wolt/animation.gif"
                className=" col-span-4 md:col-span-2 h-5/6 object-cover md:ml-40 md:-mt-20 "
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
