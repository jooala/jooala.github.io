import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { PROFILE } from '../../content/profile.mjs';
import Arrow from '../ui/Arrow';
import { getGame, setGame, useGame, actions } from '../rally/gameStore';
import { initAudio, stopAudio } from '../rally/audio';
import { readInvite, setPendingJoin } from '../rally/invite';

// Three.js needs `window`: load client-side only, after first paint.
const MonolithScene = dynamic(() => import('./MonolithScene'), { ssr: false });
const RallyHud = dynamic(() => import('../rally/RallyHud'), { ssr: false });

// Pre-rendered frame of the 3D scene. Shown instantly, on small screens,
// and when WebGL is unavailable. Regenerate after changing the scene (see CONTENT.md).
const POSTER = '/images/hero/monolith.webp';

// Must match the intro expansion in RallyWorld
const UNFOLD_MS = 1500;

// Run cb once the hero title has animated in and the browser is idle.
// Building the 3D scene blocks the main thread for a moment; doing it while
// the name animates in makes the name stall. The poster covers the wait.
const TITLE_MS = 1300;
function afterIntro(cb) {
  const root = document.documentElement;
  let timer;
  let idle;
  let observer;
  const idleThen = () => {
    if (window.requestIdleCallback) idle = window.requestIdleCallback(cb, { timeout: 1200 });
    else timer = setTimeout(cb, 50);
  };
  const start = () => {
    observer?.disconnect();
    timer = setTimeout(idleThen, TITLE_MS);
  };
  if (root.classList.contains('fonts')) start();
  else {
    observer = new MutationObserver(() => root.classList.contains('fonts') && start());
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
  return () => {
    observer?.disconnect();
    clearTimeout(timer);
    if (idle) window.cancelIdleCallback?.(idle);
  };
}

function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Hero() {
  const [use3d, setUse3d] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState('off'); // off | on | leaving
  const [clip, setClip] = useState(null);
  // Small screens show the poster; the 3D scene (and the game) loads on demand
  const [mobilePlay, setMobilePlay] = useState(false);
  const [pending, setPending] = useState(false);
  const pendingStart = useRef(false);
  const artRef = useRef(null);
  const unfold = useRef({ started: false, timer: null });
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1000px)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forcePoster = new URLSearchParams(window.location.search).has('poster');
    setInteractive(!reduced);
    const finishLoader = () => window.__heroDone?.();
    // Opened from an invite link (?join=CODE): start the game as soon as the
    // scene is ready and join that room (sound starts on the first tap/key)
    const invite = canUseWebGL() ? readInvite() : null;
    if (invite) {
      setPendingJoin(invite);
      pendingStart.current = true;
      setPending(true);
      window.addEventListener('pointerdown', initAudio, { once: true });
      window.addEventListener('keydown', initAudio, { once: true });
    }
    if (!wide || forcePoster || !canUseWebGL()) {
      if (!wide && !forcePoster && canUseWebGL()) {
        setMobilePlay(true);
        if (invite) setUse3d(true);
      }
      finishLoader();
      return undefined;
    }
    // First load: the page waits behind the loader (see _document), so build
    // the scene straight away. Coming back to the page later: poster first,
    // 3D once the title has animated in.
    if (document.documentElement.classList.contains('preload')) {
      setUse3d(true);
      return undefined;
    }
    return afterIntro(() => setUse3d(true));
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
    window.__heroDone?.();
  }, []);

  // Mobile: tapping play loads the scene first, then starts the game
  const playOnMobile = useCallback(() => {
    initAudio();
    pendingStart.current = true;
    setPending(true);
    setUse3d(true);
  }, []);

  // ── Rally minigame ──────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (!artRef.current || getGame().phase !== 'off' || getGame().preparing) return;
    initAudio(); // inside the click, so the browser allows sound
    document.body.style.cursor = '';
    document.activeElement?.blur?.();
    const go = () => {
      if (!artRef.current) return;
      const r = artRef.current.getBoundingClientRect();
      setGame({ preparing: false, phase: 'loading', heroRect: { left: r.left, top: r.top, width: r.width, height: r.height }, results: null });
    };
    // Build the race world first if the background warm-up hasn't yet: the
    // tag shows a spinner (CSS, so it keeps turning while the page is busy)
    // and the unfold only starts once everything is ready
    if (!actions.prepareGame || actions.isGameReady?.()) {
      go();
      return;
    }
    setGame({ preparing: true });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        actions.prepareGame().catch(() => {}).then(go);
      })
    );
  }, []);

  const exitGame = useCallback(() => {
    if (getGame().phase === 'off' || getGame().phase === 'exiting') return;
    setGame({ phase: 'exiting' });
    setView('leaving');
    stopAudio();
    clearTimeout(unfold.current.timer);
    unfold.current.started = false;
    unfold.current.pinned = false;
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

  useEffect(() => {
    if (ready && pendingStart.current) {
      pendingStart.current = false;
      setPending(false);
      startGame();
    }
  }, [ready, startGame]);

  // The game world is ready: pin the art to the viewport, clipped to where the
  // hero frame was, then unfold it to full screen. The timers live in a ref
  // (not effect cleanup) so the re-render this triggers can't cancel them.
  useEffect(() => {
    const u = unfold.current;
    // Pin as soon as the game starts loading: the canvas goes full screen
    // behind a clip that matches the hero frame exactly, so its (expensive)
    // resize happens now, while nothing moves, not as the unfold begins
    if ((phase === 'loading' || phase === 'intro') && !u.pinned && getGame().heroRect) {
      u.pinned = true;
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
    }
    if (phase === 'intro' && u.pinned && !u.started) {
      u.started = true;
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
      // The first-load intro only applies once; coming back later animates normally
      document.documentElement.classList.remove('game-on', 'hero-preloaded');
      if (getGame().phase !== 'off') setGame({ phase: 'off', heroRect: null });
      stopAudio();
    },
    []
  );

  // Scroll to the work without putting #work in the URL (a refresh would jump there)
  const scrollToWork = (e) => {
    const target = document.getElementById('work');
    if (!target) return;
    e.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const gameOn = view !== 'off';
  const canPlay = use3d && ready;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__head wrap">
        <h1 id="hero-title" className="hero__name display ink">
          <span className="hero__line">
            <span className="hero__line-in">{PROFILE.firstName}</span>
          </span>
          <span className="hero__line">
            <span className="hero__line-in">{PROFILE.lastName}</span>
          </span>
          <span className="sr-only">. {PROFILE.roles.join(', ')}.</span>
        </h1>
      </div>

      <div className="hero__backdrop" aria-hidden="true">
        <span className="hero__blue hero__blue--a" />
        <span className="hero__blue hero__blue--b" />
        <span className="hero__blue hero__blue--c" />
        <span className="hero__blue hero__blue--d" />
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
          <a href={`mailto:${PROFILE.email}`} className="hero__contact">
            <span className="mono">Contact me</span>
            <Arrow dir="up-right" size={16} strokeWidth={2} />
          </a>
          <a href="#work" className="hero__cta" onClick={scrollToWork}>
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

        {canPlay && !mobilePlay && (
          <button type="button" className="hero__play" onClick={startGame}>
            ▶ Play the rally minigame
          </button>
        )}
        {mobilePlay && (
          <button
            type="button"
            className="race-tag hero__play-mobile"
            onClick={canPlay ? startGame : playOnMobile}
            disabled={pending}
            aria-label="Play the rally minigame"
          >
            <span className="race-tag__kicker mono">{pending ? 'Loading the circuit…' : 'Rally · Minigame'}</span>
            <span className="race-tag__label display">Take it for a spin</span>
            <span className="race-tag__go" aria-hidden="true">
              <Arrow size={20} strokeWidth={2} />
            </span>
          </button>
        )}
      </div>

      {phase !== 'off' && typeof document !== 'undefined' && createPortal(<RallyHud />, document.body)}
    </section>
  );
}
