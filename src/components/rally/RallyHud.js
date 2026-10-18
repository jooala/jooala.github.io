import { useEffect, useRef, useState } from 'react';
import { useGame, live, actions, setGame, toggleFullscreen } from './gameStore';
import { setMuted } from './audio';
import { ONLINE, fetchLeaderboard, submitTime, savedName, normaliseCode } from './net';

export function formatTime(t) {
  if (t === null || t === undefined) return '--:--.--';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const c = Math.floor((t * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

const dayLabel = (day) =>
  day ? new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

function Minimap({ count }) {
  const svgRef = useRef(null);
  const [map, setMap] = useState(live.map);

  useEffect(() => {
    let raf;
    const tick = () => {
      if (!map && live.map) setMap(live.map);
      const svg = svgRef.current;
      if (svg && live.cars) {
        const dots = svg.querySelectorAll('circle');
        live.cars.forEach((c, i) => {
          const d = dots[i];
          if (!d) return;
          d.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.z.toFixed(1)})`);
          const cls = c.p ? 'is-player' : c.h ? 'is-human' : '';
          if (d.getAttribute('class') !== cls) d.setAttribute('class', cls);
          d.setAttribute('r', c.p ? 7 : 5);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [map]);

  if (!map) return null;
  const pad = 10;
  return (
    <div className="rally__map" aria-hidden="true">
      <svg ref={svgRef} viewBox={`${-pad} ${-pad} ${map.w + pad * 2} ${map.h + pad * 2}`}>
        <path d={map.path} className="rally__map-road" />
        <path d={map.path} className="rally__map-line" />
        {Array.from({ length: count }, (_, i) => (
          <circle key={i} r={5} />
        ))}
      </svg>
      <span className="mono">Daily circuit</span>
    </div>
  );
}

function useReadouts() {
  const timeRef = useRef(null);
  const speedRef = useRef(null);
  useEffect(() => {
    let raf;
    const tick = () => {
      if (timeRef.current) timeRef.current.textContent = formatTime(live.time);
      if (speedRef.current) speedRef.current.textContent = String(Math.round(live.speed));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return { timeRef, speedRef };
}

function TouchControls() {
  const bind = (key) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      live.touch = { ...(live.touch || {}), [key]: true };
    },
    onPointerUp: () => {
      live.touch = { ...(live.touch || {}), [key]: false };
    },
    onPointerLeave: () => {
      live.touch = { ...(live.touch || {}), [key]: false };
    },
  });
  return (
    <div className="rally__touch">
      <div>
        <button type="button" aria-label="Steer left" {...bind('left')}>◀</button>
        <button type="button" aria-label="Steer right" {...bind('right')}>▶</button>
      </div>
      <div>
        <button type="button" aria-label="Brake" {...bind('brake')}>BRK</button>
        <button type="button" aria-label="Accelerate" className="is-gas" {...bind('gas')}>GAS</button>
      </div>
    </div>
  );
}

// Today's leaderboard (Supabase when configured, otherwise this browser)
function Leaderboard({ day, refresh = 0, highlight, limit = 10 }) {
  const [state, setState] = useState({ loading: true, rows: [], online: ONLINE, error: null });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    fetchLeaderboard(day, limit)
      .then((r) => alive && setState({ loading: false, rows: r.rows, online: r.online, error: null }))
      .catch(() => alive && setState({ loading: false, rows: [], online: ONLINE, error: 'Leaderboard unavailable right now.' }));
    return () => {
      alive = false;
    };
  }, [day, refresh, limit]);

  return (
    <div className="rally__board">
      <p className="rally__board-head mono">
        <span>{state.online ? 'Today’s leaderboard' : 'Your best today'}</span>
        <span>{dayLabel(day)}</span>
      </p>
      {state.loading && <p className="rally__board-note mono">Loading…</p>}
      {state.error && <p className="rally__board-note mono">{state.error}</p>}
      {!state.loading && !state.error && state.rows.length === 0 && (
        <p className="rally__board-note mono">No times yet today. Be the first.</p>
      )}
      <ol>
        {state.rows.map((r, i) => (
          <li key={`${r.name}-${r.time_ms}`} className={highlight && r.name.toLowerCase() === highlight.toLowerCase() ? 'is-me' : ''}>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <span className="title">{r.name}</span>
            <span className="mono">{formatTime(r.time_ms / 1000)}</span>
          </li>
        ))}
      </ol>
      {!state.online && <p className="rally__board-note mono">Saved in this browser only.</p>}
    </div>
  );
}

function Menu({ day, totalLaps, cars }) {
  const busy = useGame((s) => s.busy);
  const error = useGame((s) => s.menuError);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const soloRef = useRef(null);

  useEffect(() => {
    setName(savedName());
    soloRef.current?.focus();
  }, []);

  return (
    <div className="rally__menu" role="dialog" aria-labelledby="rally-menu-title">
      <div className="rally__panel">
        <p className="rally__kicker mono">
          <span>Daily circuit · {dayLabel(day)}</span>
          <span>{totalLaps} laps · {cars} cars</span>
        </p>
        <h2 id="rally-menu-title" className="rally__menu-title display">Rally 26</h2>
        <p className="rally__menu-lede">A new concrete circuit every day. Beat the AI, post a time, or race your friends.</p>

        <label className="rally__field">
          <span className="mono">Driver name</span>
          <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>

        <button
          ref={soloRef}
          type="button"
          className="rally__btn rally__btn--primary rally__btn--big"
          onClick={() => actions.solo?.(name)}
          disabled={busy}
        >
          ▶ Race solo vs {cars - 1} AI
        </button>

        <p className="rally__divider mono">Race with friends</p>
        {ONLINE ? (
          <div className="rally__online">
            <button type="button" className="rally__btn" onClick={() => actions.createRoom?.(name)} disabled={busy}>
              Create room
            </button>
            <form
              className="rally__join"
              onSubmit={(e) => {
                e.preventDefault();
                if (normaliseCode(code).length === 4) actions.joinRoom?.(normaliseCode(code), name);
              }}
            >
              <input
                value={code}
                onChange={(e) => setCode(normaliseCode(e.target.value))}
                placeholder="CODE"
                aria-label="Room code"
                className="mono"
              />
              <button type="submit" className="rally__btn" disabled={busy || normaliseCode(code).length !== 4}>
                Join
              </button>
            </form>
          </div>
        ) : (
          <p className="rally__board-note mono">Online rooms switch on once the site’s online service is connected.</p>
        )}
        {busy && <p className="rally__board-note mono">Connecting…</p>}
        {error && <p className="rally__error mono">{error}</p>}

        <p className="rally__keys mono">
          W/↑ gas · S/↓ brake · A D/← → steer · Space handbrake · R reset · F fullscreen · Esc exit
        </p>
      </div>
      <div className="rally__panel rally__panel--board">
        <Leaderboard day={day} limit={8} highlight={name} />
      </div>
    </div>
  );
}

function Lobby() {
  const room = useGame((s) => s.room);
  const error = useGame((s) => s.menuError);
  const [copied, setCopied] = useState(false);
  if (!room) return null;
  const players = room.players || [];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <div className="rally__menu" role="dialog" aria-labelledby="rally-lobby-title">
      <div className="rally__panel">
        <p className="rally__kicker mono">
          <span>Room</span>
          <span>{players.length}/10 drivers</span>
        </p>
        <h2 id="rally-lobby-title" className="rally__code display">
          {room.code}
        </h2>
        <button type="button" className="rally__btn" onClick={copy}>
          {copied ? 'Copied' : 'Copy code'}
        </button>
        <p className="rally__menu-lede">Friends open this page, click the car and join with the code. Empty slots are filled by AI drivers.</p>
        <ol className="rally__players">
          {players.map((p) => (
            <li key={p.id}>
              <span className="title">{p.name}</span>
              <span className="mono">{p.host ? 'Host' : 'Ready'}</span>
            </li>
          ))}
        </ol>
        {room.isHost ? (
          <button type="button" className="rally__btn rally__btn--primary rally__btn--big" onClick={() => actions.hostStart?.()}>
            ▶ Start race ({players.length} + {Math.max(0, 10 - players.length)} AI)
          </button>
        ) : (
          <p className="rally__board-note mono">Waiting for the host to start the race…</p>
        )}
        {error && <p className="rally__error mono">{error}</p>}
        <button type="button" className="rally__btn" onClick={() => actions.leaveRoom?.()}>
          Leave room
        </button>
      </div>
    </div>
  );
}

function Results({ results }) {
  const firstRef = useRef(null);
  const [name, setName] = useState('');
  const [submit, setSubmit] = useState({ state: 'idle', error: null });
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setName(savedName());
    firstRef.current?.focus({ preventScroll: true });
  }, []);

  const { place, time, bestLap, rows, newBest, previousBest, day, online, isHost } = results;

  const send = async (e) => {
    e.preventDefault();
    setSubmit({ state: 'sending', error: null });
    try {
      await submitTime({ day, name, timeMs: time * 1000, bestLapMs: bestLap ? bestLap * 1000 : null });
      setSubmit({ state: 'done', error: null });
      setRefresh((r) => r + 1);
    } catch {
      setSubmit({ state: 'idle', error: 'Could not save your time. Try again.' });
    }
  };

  return (
    <div className="rally__results" role="dialog" aria-modal="true" aria-labelledby="rally-results-title">
      <div className="rally__results-main">
        <p className="rally__kicker mono">
          <span>Results</span>
          <span>Daily circuit · {dayLabel(day)}</span>
        </p>
        <h2 id="rally-results-title" className="rally__results-title display">
          {place === 1 ? 'Winner.' : `P${place}.`}
        </h2>
        <dl className="rally__results-stats">
          <div>
            <dt className="mono">Total</dt>
            <dd>{formatTime(time)}</dd>
          </div>
          <div>
            <dt className="mono">Best lap</dt>
            <dd>{formatTime(bestLap)}</dd>
          </div>
          <div>
            <dt className="mono">{newBest ? 'New personal best' : 'Personal best'}</dt>
            <dd>{formatTime(newBest ? time : previousBest)}</dd>
          </div>
        </dl>
        <ol className="rally__results-table">
          {rows.map((r) => (
            <li key={`${r.name}-${r.position}`} className={r.isPlayer ? 'is-player' : r.human ? 'is-human' : ''}>
              <span className="mono">P{r.position}</span>
              <span className="title">{r.name}</span>
              <span className="mono">{r.time !== null ? formatTime(r.time) : 'Racing…'}</span>
            </li>
          ))}
        </ol>
        <div className="rally__results-actions">
          {!online && (
            <button ref={firstRef} type="button" className="rally__btn rally__btn--primary" onClick={() => actions.restart()}>
              Race again
            </button>
          )}
          {online && isHost && (
            <button ref={firstRef} type="button" className="rally__btn rally__btn--primary" onClick={() => actions.restart()}>
              Back to lobby
            </button>
          )}
          {online && !isHost && <p className="rally__board-note mono">Waiting for the host…</p>}
          {online && (
            <button type="button" className="rally__btn" onClick={() => actions.leaveRoom?.()}>
              Leave room
            </button>
          )}
          <button type="button" className="rally__btn" onClick={() => actions.exit()}>
            Back to portfolio
          </button>
        </div>
      </div>

      <div className="rally__results-board">
        <Leaderboard day={day} refresh={refresh} highlight={submit.state === 'done' ? name : null} />
        {submit.state !== 'done' ? (
          <form className="rally__submit" onSubmit={send}>
            <label className="rally__field">
              <span className="mono">Post your time as</span>
              <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </label>
            <button type="submit" className="rally__btn rally__btn--primary" disabled={submit.state === 'sending' || !name.trim()}>
              {submit.state === 'sending' ? 'Posting…' : 'Post time'}
            </button>
            {submit.error && <p className="rally__error mono">{submit.error}</p>}
          </form>
        ) : (
          <p className="rally__board-note mono">Time posted: {formatTime(time)}</p>
        )}
      </div>
    </div>
  );
}

export default function RallyHud() {
  const phase = useGame((s) => s.phase);
  const day = useGame((s) => s.day);
  const countdown = useGame((s) => s.countdown);
  const lap = useGame((s) => s.lap);
  const totalLaps = useGame((s) => s.totalLaps);
  const position = useGame((s) => s.position);
  const cars = useGame((s) => s.cars);
  const wrongWay = useGame((s) => s.wrongWay);
  const results = useGame((s) => s.results);
  const muted = useGame((s) => s.muted);
  const notice = useGame((s) => s.menuError);
  const { timeRef, speedRef } = useReadouts();
  const [go, setGo] = useState(false);
  const [touch, setTouch] = useState(false);
  const [fsAvailable, setFsAvailable] = useState(false);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
    setFsAvailable(!!document.fullscreenEnabled);
    const onChange = () => setIsFull(!!document.fullscreenElement);
    onChange();
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (phase !== 'race') return undefined;
    setGo(true);
    const t = setTimeout(() => setGo(false), 900);
    return () => clearTimeout(t);
  }, [phase]);

  const racing = phase === 'race' || phase === 'finished';
  const showStats = phase === 'countdown' || racing;
  const announce =
    phase === 'countdown' ? `${countdown}` : phase === 'race' && go ? 'Go' : phase === 'finished' && results ? `Finished in position ${results.place}` : '';

  return (
    <div className={`rally rally--${phase}`}>
      <div className="rally__top">
        <div className="rally__plates" style={{ visibility: showStats ? 'visible' : 'hidden' }}>
          <div className="rally__plate">
            <span className="mono">Lap</span>
            <span className="display">
              {Math.max(1, lap)}/{totalLaps}
            </span>
          </div>
          <div className="rally__plate">
            <span className="mono">Pos</span>
            <span className="display">
              {position}/{cars}
            </span>
          </div>
          <div className="rally__plate rally__plate--time">
            <span className="mono">Time</span>
            <span ref={timeRef} className="rally__time">
              00:00.00
            </span>
          </div>
        </div>
        <div className="rally__buttons">
          {fsAvailable && (
            <button type="button" className="rally__btn" aria-pressed={isFull} onClick={toggleFullscreen}>
              {isFull ? 'Exit fullscreen' : 'F · Fullscreen'}
            </button>
          )}
          <button
            type="button"
            className="rally__btn"
            aria-pressed={!muted}
            onClick={() => {
              setMuted(!muted);
              setGame({ muted: !muted });
            }}
          >
            Sound {muted ? 'off' : 'on'}
          </button>
          <button type="button" className="rally__btn rally__btn--exit" onClick={() => actions.exit()}>
            Esc · Exit
          </button>
        </div>
      </div>

      {(phase === 'loading' || phase === 'intro') && (
        <div className="rally__title">
          <p className="mono">Joonas Alanenpää presents</p>
          <p className="display">Rally 26</p>
          <p className="mono">
            Daily circuit · {dayLabel(day)} · {totalLaps} laps · {cars} cars
          </p>
        </div>
      )}

      {phase === 'menu' && <Menu day={day} totalLaps={totalLaps} cars={cars} />}
      {phase === 'lobby' && <Lobby />}

      {phase === 'countdown' && countdown > 0 && (
        <div className="rally__count display" key={countdown}>
          {countdown}
        </div>
      )}
      {go && phase === 'race' && <div className="rally__count rally__count--go display">Go</div>}
      {wrongWay && phase === 'race' && <div className="rally__warn display">Wrong way</div>}
      {racing && notice && <p className="rally__notice mono">{notice}</p>}

      {(phase === 'intro' || phase === 'countdown') && (
        <p className="rally__help mono">
          <span>W / ↑ Gas</span>
          <span>S / ↓ Brake</span>
          <span>A D / ← → Steer</span>
          <span>Space Handbrake</span>
          <span>R Reset</span>
          <span>F Fullscreen</span>
          <span>Esc Exit</span>
        </p>
      )}

      {showStats && <Minimap count={cars} />}

      <div className={`rally__speed ${racing ? '' : 'is-idle'}`}>
        <span ref={speedRef} className="display">
          0
        </span>
        <span className="mono">km/h</span>
      </div>

      {phase === 'finished' && results && <Results results={results} />}
      {touch && racing && phase !== 'finished' && <TouchControls />}

      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
    </div>
  );
}
