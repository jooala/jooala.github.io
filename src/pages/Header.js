const Header = (cardSubtitle) => {
  return (
    <div className="w-full container mx-auto">
      <div className="w-full flex items-center justify-between">
        <a
          className="flex items-center text-zinc-50 my-6 no-underline font-poppins hover:text-blue-700 transform hover:scale-105 font-bold text-2xl lg:text-4xl duration-300 ease-in-out"
          href="/"
        >
          Joonas Alanenpää
        </a>

        <div className="flex w-1/2 justify-end content-center">
          <a
            className="inline-block text-zinc-50 no-underline hover:text-blue-700 hover:text-underline text-center h-10 p-2 md:h-auto md:p-4 transform hover:scale-125 duration-300 ease-in-out"
            href="https://www.linkedin.com/in/joonas-alanenpaa/"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="#fff"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
