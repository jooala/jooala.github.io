import React from 'react';

// Just the "in" letterform — no background square
const LinkedInIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M6.94 5a2 2 0 1 1-4-.002A2 2 0 0 1 6.94 5zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
  </svg>
);

const Header = () => (
  <div className="w-full container mx-auto">
    <div className="w-full flex items-center justify-between mx-auto px-6 py-6 border-b border-white/5 bg-transparent backdrop-blur-md">

      {/* Monogram logo */}
      <div className="flex w-1/2">
        <a
          href="/"
          className="font-mono text-xs tracking-[0.22em] text-[#ccff00] border border-[#ccff00]/40
                     px-3 py-1.5 uppercase no-underline
                     hover:border-[#ccff00] hover:bg-[#ccff00]/5
                     transition-all duration-200"
          aria-label="Joonas Alanenpää — home"
        >
          JOONAS ALANENPÄÄ
        </a>
      </div>

      {/* Nav icons */}
      <div className="flex items-center gap-4">
        <a
          className="text-[#555555] no-underline transition-all duration-200
                     hover:text-[#ccff00] hover:[filter:drop-shadow(0_0_8px_rgba(213,255,63,0.65))]"
          href="https://www.linkedin.com/in/joonas-alanenpaa/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          {LinkedInIcon}
        </a>
      </div>

    </div>
  </div>
);

export default Header;
