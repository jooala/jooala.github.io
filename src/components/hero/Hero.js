import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PROFILE } from '../../content/profile.mjs';
import Arrow from '../ui/Arrow';
import { getGame, setGame, useGame, actions } from '../rally/gameStore';
import { initAudio, stopAudio } from '../rally/audio';

// Three.js needs `window`: load client-side only, after first paint.
const MonolithScene = dynamic(() => import('./MonolithScene'), { ssr: false });
const RallyHud = dynamic(() => import('../rally/RallyHud'), { ssr: false });

// Pre-rendered frame of the 3D scene. Shown instantly, on small screens,
// and when WebGL is unavailable. Regenerate after changing the scene (see CONTENT.md).
const POSTER = '/images/hero/monolith.webp';

// Must match the intro expansion in RallyWorld
const UNFOLD_MS = 1500;

function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Hero({ inset }) {
  const [use3d, setUse3d] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('off'); // off | on | leaving
  const [clip, setClip] = useState(null);
  const artRef = useRef(null);
  const unfold = useRef({ started: false, timer: null });
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1000px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forcePoster = new URLSearchParams(window.location.search).has('poster');
    if (wide && !forcePoster && canUseWebGL()) setUse3d(true);
    setInteractive(!reduced);
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  // ── Rally minigame ──────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (!artRef.current || getGame().phase !== 'off') return;
    const r = artRef.current.getBoundingClientRect();
    initAudio();
    document.body.style.cursor = '';
    document.activeElement?.blur?.();
    setGame({ phase: 'loading', heroRect: { left: r.left, top: r.top, width: r.width, height: r.height }, results: null });
  }, []);

  const exitGame = useCallback(() => {
    if (getGame().phase === 'off' || getGame().phase === 'exiting') return;
    setGame({ phase: 'exiting' });
    setView('leaving');
    stopAudio();
    clearTimeout(unfold.current.timer);
    unfold.current.started = false;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setTimeout(() => {
      setGame({ phase: 'off', heroRect: null, results: null });
      setClip(null);
      setView('off');
      document.documentElement.classList.remove('game-on');
    }, 420);
  }, []);

  useEffect(() => {
    actions.exit = exitGame;
  }, [exitGame]);

  // The game world is ready: pin the art to the viewport, clipped to where the
  // hero frame was, then unfold it to full screen. The timers live in a ref
  // (not effect cleanup) so the re-render this triggers can't cancel them.
  useEffect(() => {
    const u = unfold.current;
    if (phase === 'intro' && !u.started) {
      u.started = true;
      const r = getGame().heroRect;
      const W = window.innerWidth;
      const H = window.innerHeight;
      document.documentElement.classList.add('game-on');
      setView('on');
      const top = Math.max(0, r.top);
      const right = Math.max(0, W - r.left - r.width);
      const bottom = Math.max(0, H - r.top - r.height);
      setClip({
        clipPath: `inset(${top}px ${right}px ${bottom}px ${Math.max(0, r.left)}px)`,
        transition: 'none',
      });
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setClip({
            clipPath: 'inset(0px 0px 0px 0px)',
            transition: `clip-path ${UNFOLD_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          })
        )
      );
      // Drop the clip entirely once unfolded
      u.timer = setTimeout(() => setClip(null), UNFOLD_MS + 150);
    }
    // Safety net: once racing, the game is never clipped
    if (u.started && ['menu', 'lobby', 'countdown', 'race', 'finished'].includes(phase)) setClip(null);
  }, [phase]);

  // Leaving the page mid-game (e.g. browser back) should not leave it locked
  useEffect(
    () => () => {
      clearTimeout(unfold.current.timer);
      document.documentElement.classList.remove('game-on');
      if (getGame().phase !== 'off') setGame({ phase: 'off', heroRect: null });
      stopAudio();
    },
    []
  );

  const gameOn = view !== 'off';
  const canPlay = use3d && ready;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__head wrap">
        <h1 id="hero-title" className="hero__name display ink">
          <span className="hero__line">{PROFILE.firstName}</span>
          <span className="hero__line">{PROFILE.lastName}</span>
          <span className="sr-only">. {PROFILE.roles.join(', ')}.</span>
        </h1>
        <ul className="hero__roles mono" aria-label="Disciplines">
          {PROFILE.roles.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="hero__backdrop" aria-hidden="true">
        <span className="hero__blue hero__blue--a" />
      </div>

      <div
        ref={artRef}
        className={[
          'hero__art',
          ready && 'is-3d',
          gameOn && 'is-game',
          gameOn && phase !== 'loading' && 'is-sky',
          view === 'leaving' && 'is-leaving',
        ]
          .filter(Boolean)
          .join(' ')}
        style={clip || undefined}
        aria-hidden="true"
      >
        <span className="hero__blue hero__blue--a" />
        <img className="hero__poster" src={POSTER} alt="" fetchPriority="high" decoding="async" />
        {use3d && (
          <MonolithScene
            className="hero__canvas"
            interactive={interactive}
            onReady={onReady}
            onStartGame={startGame}
          />
        )}
      </div>

      <div className="hero__foot wrap">
        <p className="hero__lede serif">{PROFILE.intro}</p>

        <div className="hero__cta-col">
          <p className="hero__loc mono">
            {PROFILE.location}
            <br />
            Now: Wolt+ · Frontier
          </p>
          <a href="#work" className="hero__cta">
            <span className="hero__cta-dot" aria-hidden="true">
              <Arrow dir="down" size={15} />
            </span>
            <span className="mono">
              Selected work
              <br />
              Scroll to explore
            </span>
          </a>
        </div>

        {inset && (
          <Link href={inset.href} className="hero__inset">
            <span className="hero__inset-img">
              <img src={inset.cover.src} alt={inset.cover.alt} decoding="async" />
            </span>
            <span className="hero__inset-cap mono">
              {inset.no} · {inset.title}
              <Arrow size={10} />
            </span>
          </Link>
        )}

        <p className="hero__edition" aria-label="Portfolio, 2026 edition">
          <span className="mono">Portfolio</span>
          <span className="display">20</span>
          <span className="hero__edition-rule" />
          <span className="display">26</span>
        </p>

        {canPlay && (
          <button type="button" className="hero__play" onClick={startGame}>
            ▶ Play the rally minigame
          </button>
        )}
      </div>

      {phase !== 'off' && typeof document !== 'undefined' && createPortal(<RallyHud />, document.body)}
    </section>
  );
}
