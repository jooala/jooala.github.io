// Online layer for the rally game, built on Supabase:
// - daily leaderboard (Postgres table `rally_times`, see supabase/rally.sql)
// - race-with-friends rooms (Realtime channels: presence + broadcast)
// Everything degrades gracefully when no keys are configured.
import { SUPABASE_URL, SUPABASE_KEY } from '../../content/online.mjs';

export const ONLINE = Boolean(SUPABASE_URL && SUPABASE_KEY);

let clientPromise = null;
function supabase() {
  if (!ONLINE) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { params: { eventsPerSecond: 40 } },
      })
    );
  }
  return clientPromise;
}

// ── Identity ────────────────────────────────────────────────────────────────

export const clientId =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `p${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export function cleanName(name) {
  return (name || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 16);
}

export function savedName() {
  try {
    return window.localStorage.getItem('ja-rally-name') || '';
  } catch {
    return '';
  }
}

export function saveName(name) {
  try {
    window.localStorage.setItem('ja-rally-name', name);
  } catch {
    /* storage unavailable */
  }
}

// ── Daily leaderboard ───────────────────────────────────────────────────────

const LOCAL_KEY = 'ja-rally-board';

function localBoard() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

// Best time per driver for the day, fastest first
function bestPerName(rows, limit) {
  const best = new Map();
  rows.forEach((r) => {
    const key = r.name.toLowerCase();
    if (!best.has(key) || r.time_ms < best.get(key).time_ms) best.set(key, r);
  });
  return [...best.values()].sort((a, b) => a.time_ms - b.time_ms).slice(0, limit);
}

export async function fetchLeaderboard(day, limit = 10) {
  const sb = await supabase();
  if (!sb) return { online: false, rows: bestPerName(localBoard()[day] || [], limit) };
  const { data, error } = await sb
    .from('rally_times')
    .select('name, time_ms, best_lap_ms')
    .eq('day', day)
    .order('time_ms', { ascending: true })
    .limit(200);
  if (error) throw error;
  return { online: true, rows: bestPerName(data || [], limit) };
}

export async function submitTime({ day, name, timeMs, bestLapMs }) {
  const row = { day, name: cleanName(name) || 'Anonymous', time_ms: Math.round(timeMs), best_lap_ms: bestLapMs ? Math.round(bestLapMs) : null };
  // Always keep a local copy too
  try {
    const board = localBoard();
    board[day] = [...(board[day] || []), row];
    Object.keys(board)
      .filter((d) => d < day)
      .slice(0, -7)
      .forEach((d) => delete board[d]);
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(board));
  } catch {
    /* storage unavailable */
  }
  const sb = await supabase();
  if (!sb) return { online: false };
  const { error } = await sb.from('rally_times').insert(row);
  if (error) throw error;
  return { online: true };
}

// ── Rooms ───────────────────────────────────────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function makeRoomCode() {
  let c = '';
  for (let i = 0; i < 4; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}

export function normaliseCode(code) {
  return (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
}

// Opens a room channel. Returns a small API; throws if the room can't be
// joined (no host found, race already running, full).
export async function openRoom(code, { name, host }) {
  const sb = await supabase();
  if (!sb) throw new Error('Online play is not set up yet.');
  const handlers = {};
  const emit = (ev, data) => (handlers[ev] || []).forEach((cb) => cb(data));
  const channel = sb.channel(`rally-${code}`, {
    config: { broadcast: { self: false, ack: false }, presence: { key: clientId } },
  });
  const meta = { id: clientId, name: cleanName(name) || 'Driver', host: !!host, status: 'lobby', joinedAt: Date.now() };

  const players = () => {
    const state = channel.presenceState();
    return Object.values(state)
      .map((metas) => metas[metas.length - 1])
      .filter(Boolean)
      .sort((a, b) => (b.host ? 1 : 0) - (a.host ? 1 : 0) || a.joinedAt - b.joinedAt);
  };

  channel.on('presence', { event: 'sync' }, () => emit('players', players()));
  ['start', 'state', 'ai', 'lobby'].forEach((ev) =>
    channel.on('broadcast', { event: ev }, ({ payload }) => emit(ev, payload))
  );

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Could not connect. Check your connection and try again.')), 10000);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timer);
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(timer);
        reject(new Error('Could not connect to the room.'));
      }
    });
  });
  await channel.track(meta);

  const room = {
    code,
    id: clientId,
    isHost: !!host,
    players,
    on(ev, cb) {
      (handlers[ev] = handlers[ev] || []).push(cb);
      return room;
    },
    send(event, payload) {
      channel.send({ type: 'broadcast', event, payload });
    },
    setStatus(status) {
      meta.status = status;
      channel.track(meta);
    },
    async leave() {
      try {
        await channel.untrack();
        await sb.removeChannel(channel);
      } catch {
        /* already gone */
      }
    },
  };

  if (!host) {
    // Give presence a moment to sync, then check there is a host to race with
    await new Promise((r) => setTimeout(r, 1200));
    const list = players();
    const hostMeta = list.find((p) => p.host);
    if (!hostMeta) {
      await room.leave();
      throw new Error(`No room with code ${code}.`);
    }
    if (hostMeta.status === 'racing') {
      await room.leave();
      throw new Error('That race has already started. Ask the host to wait for you.');
    }
    if (list.length > 10) {
      await room.leave();
      throw new Error('That room is full (10 drivers).');
    }
  }
  return room;
}
