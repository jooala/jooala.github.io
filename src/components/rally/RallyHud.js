import { useEffect, useRef, useState } from 'react';
import { useGame, getGame, live, actions, setGame, toggleFullscreen } from './gameStore';
import { LAB_FIELDS, LAB_CODE, TRACK_DEFAULTS, RACE_DEFAULTS, WEATHERS, pickWeather, dayKey, nextDayAt } from './settings';
import { setMuted } from './audio';
import { ONLINE, fetchLeaderboard, submitTime, savedName, savedLivery, normaliseCode } from './net';
import { shareInvite, takePendingJoin } from './invite';
import { CAR_DEFAULTS } from '../hero/sceneAssets';
import { PROFILE } from '../../content/profile.mjs';
import Arrow from '../ui/Arrow';

const PAINT = {
  body: ['#ebe8e0', '#111111', '#1769e0', '#ff6a3d', '#a19f99', '#2b3a4a', '#7a2f2f', '#c8a032', '#5b6b4a'],
  stripe: ['#1769e0', '#ff6a3d', '#111111', '#f2efe8', '#c8a032', '#7a2f2f'],
  accent: ['#ff6a3d', '#1769e0', '#111111', '#f2efe8', '#c8a032'],
};
const PAINT_LABELS = { body: 'Body', stripe: 'Stripe', accent: 'Accent' };

export function formatTime(t) {
  if (t === null || t === undefined) return '--:--.--';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const c = Math.floor((t * 100) % 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

const dayLabel = (day) =>
  day ? new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

// Countdown to the next daily circuit (midnight Finnish time). It rolls over
// to the following day by itself; RallyWorld swaps the track in.
function NextCircuit() {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    let next = nextDayAt();
    const tick = () => {
      if (Date.now() >= next) next = nextDayAt();
      setLeft(Math.max(0, Math.ceil((next - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (left === null) return null;
  const pad = (n) => String(n).padStart(2, '0');
  const clock = `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
  return (
    <p className="rally__next mono" role="timer" aria-label={`Next daily circuit in ${clock}`}>
      <span>Next circuit in</span>
      <span className="rally__next-time">{clock}</span>
    </p>
  );
}

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

// On-screen controls for touch devices. Each pad captures its own pointer,
// so several fingers work at once (gas + steer) and sliding a finger off a
// pad doesn't drop the input until it lifts.
function TouchControls() {
  useEffect(
    () => () => {
      live.touch = {};
    },
    []
  );
  const set = (key, on) => {
    live.touch = { ...(live.touch || {}), [key]: on };
  };
  const bind = (key) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.currentTarget.classList.add('is-down');
      set(key, true);
      navigator.vibrate?.(8);
    },
    onPointerUp: (e) => {
      e.currentTarget.classList.remove('is-down');
      set(key, false);
    },
    onPointerCancel: (e) => {
      e.currentTarget.classList.remove('is-down');
      set(key, false);
    },
    onContextMenu: (e) => e.preventDefault(),
  });
  return (
    <div className="rally__touch">
      <div className="rally__touch-steer">
        <button type="button" aria-label="Reset car" className="is-reset" onClick={() => actions.reset?.()}>
          <span className="mono">Reset</span>
        </button>
        <button type="button" aria-label="Steer left" {...bind('left')}>
          <Arrow dir="left" size={30} strokeWidth={2.4} />
        </button>
        <button type="button" aria-label="Steer right" {...bind('right')}>
          <Arrow size={30} strokeWidth={2.4} />
        </button>
      </div>
      <div className="rally__touch-pedals">
        <button type="button" aria-label="Handbrake" className="is-hand" {...bind('hand')}>
          <span className="mono">Hand</span>
        </button>
        <button type="button" aria-label="Brake and reverse" className="is-brake" {...bind('brake')}>
          <span className="mono">Brake</span>
        </button>
        <button type="button" aria-label="Accelerate" className="is-gas" {...bind('gas')}>
          <span className="mono">Gas</span>
        </button>
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

// Paint job and race number behind a toggle, previewed live on the car
// behind the menu
function Garage({ name }) {
  const [livery, setLivery] = useState(null);
  const [open, setOpen] = useState(false);
  // Spin the car on the grid while the panel is open
  useEffect(() => {
    setGame({ garage: open });
    return () => setGame({ garage: false });
  }, [open]);
  useEffect(() => {
    setLivery({ ...CAR_DEFAULTS, ...savedLivery() });
  }, []);
  useEffect(() => {
    if (!livery) return undefined;
    const t = setTimeout(() => actions.livery?.(livery, name), 120);
    return () => clearTimeout(t);
  }, [livery, name]);
  if (!livery) return null;
  const set = (patch) => setLivery((l) => ({ ...l, ...patch }));
  return (
    <div className="rally__garage-wrap">
      <button
        type="button"
        className="rally__btn rally__garage-toggle"
        aria-expanded={open}
        aria-controls="rally-garage"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{open ? '▾' : '▸'} Customise car</span>
        <span className="rally__garage-preview" aria-hidden="true">
          {['body', 'stripe', 'accent'].map((k) => (
            <i key={k} style={{ background: livery[k] }} />
          ))}
          <b className="display">{livery.number || CAR_DEFAULTS.number}</b>
        </span>
      </button>
      {open && (
        <fieldset id="rally-garage" className="rally__garage">
          <legend className="sr-only">Your car</legend>
          {Object.keys(PAINT).map((key) => (
            <div key={key} className="rally__swatches" role="radiogroup" aria-label={`${PAINT_LABELS[key]} colour`}>
              <span className="mono">{PAINT_LABELS[key]}</span>
              {PAINT[key].map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={livery[key] === c}
                  aria-label={c}
                  className="rally__swatch"
                  style={{ background: c }}
                  onClick={() => set({ [key]: c })}
                />
              ))}
            </div>
          ))}
          <label className="rally__number">
            <span className="mono">Number</span>
            <input
              className="display"
              inputMode="numeric"
              maxLength={2}
              value={livery.number}
              onChange={(e) => set({ number: e.target.value.replace(/\D/g, '').slice(0, 2) })}
              onBlur={() => !livery.number && set({ number: CAR_DEFAULTS.number })}
              aria-label="Race number"
            />
          </label>
        </fieldset>
      )}
    </div>
  );
}

// Only the daily circuit, with the normal laps and AI field, is ranked
const isRanked = (track, race) =>
  !!track?.daily && (!race || LAB_FIELDS.every((f) => f.group !== 'race' || race[f.key] === RACE_DEFAULTS[f.key]));

// Which track the next race is on. Solo players and room hosts can switch
// to a random free-play track (not ranked) and back to the daily circuit.
function TrackChooser({ canChange }) {
  const track = useGame((s) => s.track);
  const race = useGame((s) => s.race);
  const busy = useGame((s) => s.busy);
  if (!track) return null;
  const ranked = isRanked(track, race);
  return (
    <div className="rally__track">
      <p className="rally__track-name">
        <span className="mono">
          {ranked ? 'Ranked' : 'Free play'}
          {track.weatherLabel && ` · ${track.weatherLabel}`}
        </span>
        <span className="title">{track.daily ? `Daily circuit · ${dayLabel(track.key)}` : track.label}</span>
      </p>
      {canChange && (
        <div className="rally__track-actions">
          <button type="button" className="rally__btn" onClick={() => actions.newTrack?.()} disabled={!!busy}>
            ⟳ New random track
          </button>
          {!track.daily && (
            <button type="button" className="rally__btn" onClick={() => actions.dailyTrack?.()} disabled={!!busy}>
              Back to daily
            </button>
          )}
        </div>
      )}
      <p className="rally__board-note mono">
        {ranked ? 'Times on the daily circuit go on today’s leaderboard.' : 'Just for fun: times here aren’t ranked.'}
      </p>
    </div>
  );
}

// Admin track lab: every layout and race setting on sliders. Hidden until
// LAB_CODE is typed in the menu; only solo players and room hosts see it
// (the host's settings are sent to everyone in the room).
function TrackLab() {
  const track = useGame((s) => s.track);
  const race = useGame((s) => s.race);
  const busy = useGame((s) => s.busy);
  const [values, setValues] = useState(null);
  // 'auto' = the seed's own weather (what a normal track gets)
  const [sky, setSky] = useState('auto');
  // Follow the current track (and pick up the settings it was built with)
  useEffect(() => {
    setValues({ ...TRACK_DEFAULTS, ...(track?.opts || {}), ...RACE_DEFAULTS, ...(race || {}) });
    setSky(!track || track.weather === pickWeather(track.key) ? 'auto' : track.weather);
  }, [track, race]);
  if (!values) return null;
  const split = () => {
    const opts = {};
    const raceOpts = {};
    LAB_FIELDS.forEach((f) => {
      (f.group === 'track' ? opts : raceOpts)[f.key] = values[f.key];
    });
    return [opts, raceOpts];
  };
  const skyKey = sky === 'auto' ? null : sky;
  return (
    <fieldset className="rally__lab">
      <legend className="mono">Track lab · admin</legend>
      {LAB_FIELDS.map((f) => (
        <label key={f.key} className="rally__lab-row">
          <span className="mono">{f.label}</span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
          />
          <output className="mono">{f.step >= 1 ? values[f.key] : values[f.key].toFixed(2)}</output>
        </label>
      ))}
      <label className="rally__lab-row">
        <span className="mono">Weather</span>
        <select className="rally__lab-select mono" value={sky} onChange={(e) => setSky(e.target.value)}>
          <option value="auto">Track’s own</option>
          {Object.entries(WEATHERS).map(([key, w]) => (
            <option key={key} value={key}>
              {w.label}
            </option>
          ))}
        </select>
      </label>
      <div className="rally__lab-actions">
        <button
          type="button"
          className="rally__btn rally__btn--primary"
          disabled={!!busy}
          onClick={() => actions.labTrack?.(...split(), false, skyKey)}
        >
          Build new track
        </button>
        <button type="button" className="rally__btn" disabled={!!busy} onClick={() => actions.labTrack?.(...split(), true, skyKey)}>
          Apply to this track
        </button>
        <button
          type="button"
          className="rally__btn"
          onClick={() => {
            setValues({ ...TRACK_DEFAULTS, ...RACE_DEFAULTS });
            setSky('auto');
          }}
        >
          Defaults
        </button>
      </div>
    </fieldset>
  );
}

// Typing LAB_CODE in the menu or lobby (not in a text field) toggles the lab.
// It's a fun easter egg, not access control: it lives in the page's code.
function useLabCode() {
  useEffect(() => {
    try {
      setGame({ lab: window.localStorage.getItem('ja-rally-lab') === '1' });
    } catch {
      /* storage unavailable */
    }
    let typed = '';
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '')) return;
      if (!['menu', 'lobby'].includes(getGame().phase) || e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-LAB_CODE.length);
      if (typed !== LAB_CODE) return;
      typed = '';
      const on = !getGame().lab;
      setGame({ lab: on });
      try {
        window.localStorage.setItem('ja-rally-lab', on ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function Menu({ day, totalLaps, cars, touch }) {
  const busy = useGame((s) => s.busy);
  const error = useGame((s) => s.menuError);
  const track = useGame((s) => s.track);
  const race = useGame((s) => s.race);
  const lab = useGame((s) => s.lab);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const soloRef = useRef(null);

  useEffect(() => {
    const saved = savedName();
    setName(saved);
    // Opened from an invite link: join that room straight away
    const invite = takePendingJoin();
    if (invite) {
      setCode(invite);
      actions.joinRoom?.(invite, saved || 'Driver');
      return;
    }
    soloRef.current?.focus();
  }, []);

  return (
    <div className="rally__menu" role="dialog" aria-labelledby="rally-menu-title">
      <div className="rally__panel">
        <p className="rally__kicker mono">
          <span>{track && !track.daily ? track.label : `Daily circuit · ${dayLabel(day)}`}</span>
          <span>{totalLaps} laps · {(race?.ai ?? cars - 1) + 1} cars</span>
        </p>
        <h2 id="rally-menu-title" className="rally__menu-title display">Rally</h2>
        <p className="rally__menu-lede">A new concrete circuit every day. Beat the AI, post a time, or race your friends.</p>
        <NextCircuit />

        <label className="rally__field">
          <span className="mono">Driver name</span>
          <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>

        <Garage name={name} />

        <TrackChooser canChange />
        {lab && <TrackLab />}

        <button
          ref={soloRef}
          type="button"
          className="rally__btn rally__btn--primary rally__btn--big"
          onClick={() => actions.solo?.(name)}
          disabled={busy}
        >
          ▶ Race solo{(race?.ai ?? cars - 1) > 0 ? ` vs ${race?.ai ?? cars - 1} AI` : ''}
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
        {busy && <p className="rally__board-note mono">{typeof busy === 'string' ? busy : 'Connecting…'}</p>}
        {error && <p className="rally__error mono">{error}</p>}

        <p className="rally__keys mono">
          {touch
            ? 'Left thumb steers · right thumb gas, brake and handbrake · turn your phone sideways for the best view'
            : 'W/↑ gas · S/↓ brake · A D/← → steer · Space handbrake · R reset · F fullscreen · Esc exit'}
        </p>
      </div>
      <aside className="rally__panel rally__panel--board" aria-label="Today’s leaderboard">
        <Leaderboard day={day} limit={10} highlight={name} />
      </aside>
    </div>
  );
}

function Lobby() {
  const room = useGame((s) => s.room);
  const error = useGame((s) => s.menuError);
  const busy = useGame((s) => s.busy);
  const race = useGame((s) => s.race);
  const lab = useGame((s) => s.lab);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(null);
  if (!room) return null;
  const invite = async () => {
    const r = await shareInvite(room.code);
    setInvited(r);
    if (r) setTimeout(() => setInvited(null), 1800);
  };
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
        <div className="rally__invite">
          <button type="button" className="rally__btn rally__btn--primary" onClick={invite}>
            {invited === 'copied' ? 'Link copied' : invited === 'shared' ? 'Shared' : 'Copy invite link'}
          </button>
          <button type="button" className="rally__btn" onClick={copy}>
            {copied ? 'Copied' : 'Copy code'}
          </button>
        </div>
        <p className="rally__menu-lede">Send friends the invite link: it opens the game straight into this room. Or they can click the car and join with the code. Empty slots are filled by AI drivers.</p>
        <ol className="rally__players">
          {players.map((p) => (
            <li key={p.id}>
              <span className="title">{p.name}</span>
              <span className="mono">{p.host ? 'Host' : 'Ready'}</span>
            </li>
          ))}
        </ol>
        <TrackChooser canChange={room.isHost} />
        {room.isHost && lab && <TrackLab />}
        {room.isHost ? (
          <button
            type="button"
            className="rally__btn rally__btn--primary rally__btn--big"
            onClick={() => actions.hostStart?.()}
            disabled={!!busy}
          >
            ▶ Start race ({players.length} + {Math.min(race?.ai ?? 9, Math.max(0, 10 - players.length))} AI)
          </button>
        ) : (
          <p className="rally__board-note mono">Waiting for the host to start the race…</p>
        )}
        {typeof busy === 'string' && <p className="rally__board-note mono">{busy}</p>}
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

  const { place, time, bestLap, rows, newBest, previousBest, day, online, isHost, track } = results;
  // Free play and track-lab races aren't ranked: no posting, no personal best
  const ranked = results.ranked !== false;
  const boardDay = ranked ? day : dayKey();

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
          <span>{ranked ? `Daily circuit · ${dayLabel(day)}` : `${track?.label || 'Free play'} · not ranked`}</span>
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
          {ranked && (
            <div>
              <dt className="mono">{newBest ? 'New personal best' : 'Personal best'}</dt>
              <dd>{formatTime(newBest ? time : previousBest)}</dd>
            </div>
          )}
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
        <a
          className="rally__btn rally__btn--contact"
          href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(`Hello from RALLY (P${place}, ${formatTime(time)})`)}`}
        >
          <span>Enjoyed the drive? Contact me</span>
          <Arrow dir="up-right" size={16} strokeWidth={2} />
        </a>
      </div>

      <div className="rally__results-board">
        <Leaderboard day={boardDay} refresh={refresh} highlight={submit.state === 'done' ? name : null} />
        {!ranked ? (
          <p className="rally__board-note mono">Free play: just for fun, this time isn’t posted.</p>
        ) : submit.state !== 'done' ? (
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
  useLabCode();
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
  const resetHint = useGame((s) => s.resetHint);
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
    <div className={`rally rally--${phase} ${touch ? 'rally--touch' : ''}`}>
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
              {isFull ? (touch ? '⤡' : 'Exit fullscreen') : touch ? '⤢' : 'F · Fullscreen'}
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
            {touch ? (muted ? '♪ off' : '♪ on') : `Sound ${muted ? 'off' : 'on'}`}
          </button>
          {phase === 'race' && !touch && (
            <button type="button" className="rally__btn" onClick={() => actions.reset?.()}>
              {touch ? 'Reset' : 'R · Reset car'}
            </button>
          )}
          <button type="button" className="rally__btn rally__btn--exit" onClick={() => actions.exit()}>
            {touch ? '✕' : 'Esc · Exit'}
          </button>
        </div>
      </div>

      {phase === 'loading' && (
        <p className="rally__loading mono" role="status">
          Building today’s circuit…
        </p>
      )}
      {phase === 'intro' && (
        <div className="rally__title">
          <p className="mono">Joonas Alanenpää presents</p>
          <p className="display">Rally</p>
          <p className="mono">
            Daily circuit · {dayLabel(day)} · {totalLaps} laps · {cars} cars
          </p>
        </div>
      )}

      {phase === 'menu' && <Menu day={day} totalLaps={totalLaps} cars={cars} touch={touch} />}
      {phase === 'lobby' && <Lobby />}

      {phase === 'countdown' && countdown > 0 && (
        <div className="rally__count display" key={countdown}>
          {countdown}
        </div>
      )}
      {go && phase === 'race' && <div className="rally__count rally__count--go display">Go</div>}
      {wrongWay && phase === 'race' && !resetHint && <div className="rally__warn display">Wrong way</div>}
      {resetHint && phase === 'race' && (
        <div className="rally__reset" role="status">
          <span className="display">{resetHint.reason === 'flipped' ? 'Car flipped' : 'Stuck?'}</span>
          <span className="mono">{touch ? 'Tap Reset' : 'Press R to reset'} · auto in {resetHint.auto}s</span>
        </div>
      )}
      {racing && notice && <p className="rally__notice mono">{notice}</p>}

      {(phase === 'intro' || phase === 'countdown') && touch && (
        <p className="rally__help mono">
          <span>Left thumb · Steer</span>
          <span>Right thumb · Gas / Brake / Hand</span>
        </p>
      )}
      {(phase === 'intro' || phase === 'countdown') && !touch && (
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
      {touch && (phase === 'countdown' || phase === 'race') && <TouchControls />}

      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
    </div>
  );
}
