import { useEffect, useState } from 'react';
import Head from 'next/head';

const LINES = ['Product', 'Manager', '& UX Designer'];
const STRIP_COUNT = 7;
const STRIP_STAGGER_MS = 26;
const SHUTTER_DURATION_MS = 580;
const LINE_DELAYS_MS = [180, 680, 1180];

const CSS = `
  .gh-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0;
    user-select: none;
  }
  .gh-line {
    position: relative;
    display: block;
  }
  .gh-text {
    display: block;
    font-family: 'Barlow Condensed', 'Impact', sans-serif;
    font-weight: 800;
    font-size: clamp(3.6rem, 8.8vw, 9.5rem);
    color: #ffffff;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    line-height: 0.93;
    position: relative;
    z-index: 0;
  }
  .gh-shutters {
    position: absolute;
    top: -4px; left: -10px; right: -10px; bottom: -4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    pointer-events: none;
    z-index: 2;
  }
  .gh-strip {
    flex: 1;
    background: #080808;
    will-change: transform;
  }
  .gh-line.active .gh-strip {
    animation: gh-open ${SHUTTER_DURATION_MS}ms cubic-bezier(0.86, 0, 0.07, 1) forwards;
  }
  @keyframes gh-open {
    0%   { transform: translateX(0%); }
    6%   { transform: translateX(-4px); }
    12%  { transform: translateX(3px); }
    18%  { transform: translateX(0%); }
    100% { transform: translateX(104%); }
  }
  .gh-line.active .gh-text {
    animation: gh-glitch 0.48s ease-out forwards;
  }
  @keyframes gh-glitch {
    0%   { transform: translateX(-5px); text-shadow: 4px 0 rgba(255,25,70,0.95), -4px 0 rgba(0,150,255,0.95); filter: brightness(2.2); }
    18%  { transform: translateX(3px);  text-shadow: -2px 0 rgba(255,25,70,0.65), 2px 0 rgba(0,150,255,0.65); filter: brightness(1.5); }
    35%  { transform: translateX(-2px); text-shadow: 1px 0 rgba(255,25,70,0.35), -1px 0 rgba(0,150,255,0.35); filter: brightness(1.2); }
    58%  { transform: translateX(1px);  text-shadow: none; filter: brightness(1.05); }
    100% { transform: translateX(0);    text-shadow: none; filter: brightness(1); }
  }
`;

export default function GlitchHeadline() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Inject styles client-side only — avoids SSR hydration mismatch
    const el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);

    const t = setTimeout(() => setActive(true), 60);
    return () => {
      clearTimeout(t);
      el.remove();
    };
  }, []);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="gh-wrapper">
        {LINES.map((line, li) => {
          const glitchDelay =
            LINE_DELAYS_MS[li] + (STRIP_COUNT - 1) * STRIP_STAGGER_MS + SHUTTER_DURATION_MS;

          return (
            <div key={line} className={`gh-line${active ? ' active' : ''}`}>
              <span
                className="gh-text"
                style={active ? { animationDelay: `${glitchDelay}ms` } : {}}
              >
                {line}
              </span>
              <div className="gh-shutters">
                {Array.from({ length: STRIP_COUNT }, (_, si) => (
                  <div
                    key={si}
                    className="gh-strip"
                    style={{
                      animationDelay: `${LINE_DELAYS_MS[li] + si * STRIP_STAGGER_MS}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
