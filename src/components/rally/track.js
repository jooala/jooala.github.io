// The circuit: a closed concrete street course around the hero tower.
// Pure data (no DOM): centre line, elevation, road width, zones (tunnel,
// narrow old-town streets) and the AI racing line. The 3D world built on top
// of it lives in world.js.
import * as THREE from 'three';
import { rng } from '../hero/sceneAssets';
import { TOTAL_LAPS, TRACK_DEFAULTS, dayKey, nextDayAt } from './settings';

export { TOTAL_LAPS, TRACK_DEFAULTS, dayKey, nextDayAt };

export const HALF_WIDTH = 7;
export const NARROW_WIDTH = 5.2;

// Zone per track sample
export const ZONE = { open: 0, tunnel: 1, narrow: 2 };
export const TUNNEL_HEIGHT = 6.4;

// ── Daily layout ────────────────────────────────────────────────────────────
// Every day (in Finland) gets its own circuit, generated from the date. The start
// straight is fixed (west, in front of the tower, so the car can jump onto the
// grid); the rest of the loop is randomised around the north side.
const START = { x: -12, z: 16 };
const STRAIGHT = [[40, 16], [0, 16], [-40, 16]];
const CENTER = { x: 0, z: -34 };
// Used if no generated layout passes the checks
const FALLBACK = [
  [40, 16], [0, 16], [-40, 16], [-68, 12], [-84, -8], [-80, -32], [-64, -46],
  [-74, -64], [-62, -88], [-30, -98], [5, -98], [40, -98], [70, -90], [86, -64],
  [78, -44], [56, -44], [44, -30], [56, -14], [82, -8], [92, 8], [74, 18],
];

// AI speed profile along the racing line (tuned against physics.js)
const AI_VMAX = 49;
const AI_LAT = 23;
const AI_BRAKE = 23;

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) % 2147483646 + 1;
}

function generatePoints(seed, o) {
  const r = rng(seed);
  const n = Math.max(5, Math.min(26, Math.round((8 + Math.floor(r() * 5)) * o.twist)));
  const a0 = (140 / 180) * Math.PI;
  const a1 = (400 / 180) * Math.PI;
  const pts = [...STRAIGHT];
  let prev = 80;
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5 + (r() - 0.5) * 0.45) / n;
    const ang = a0 + (a1 - a0) * t;
    let rad = 58 + r() * 46;
    if (r() < 0.25 * o.twist) rad = 36 + r() * 10; // pinch: a tight corner or hairpin
    rad = Math.max(prev - 42, Math.min(prev + 42, rad));
    prev = rad;
    pts.push([CENTER.x + Math.cos(ang) * rad * 1.18 * o.size, CENTER.z + Math.sin(ang) * rad * 0.95 * o.size]);
  }
  return pts;
}

function sampleLoop(points) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    true,
    'centripetal'
  );
  const length = curve.getLength();
  const N = Math.round(length);
  let pts = curve.getSpacedPoints(N).slice(0, N);

  // Index 0 = start line
  let best = 0;
  let bd = Infinity;
  pts.forEach((p, i) => {
    const d = (p.x - START.x) ** 2 + (p.z - START.z) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  });
  pts = [...pts.slice(best), ...pts.slice(0, best)];
  return { pts, length, N };
}

// Reject layouts that overlap themselves, clip the tower or corner too tight
function validLayout({ pts, N }, o) {
  const step = 3;
  const clear = HALF_WIDTH * o.width * 2 + 4;
  for (let i = 0; i < N; i += step) {
    const p = pts[i];
    if (p.z < 9 && Math.hypot(p.x, p.z) < 22) return false;
    for (let j = i + 36; j < N; j += step) {
      if (N - (j - i) < 36) continue;
      const q = pts[j];
      if ((p.x - q.x) ** 2 + (p.z - q.z) ** 2 < clear * clear) return false;
    }
  }
  for (let i = 0; i < N; i++) {
    const a = pts[(i - 4 + N) % N];
    const b = pts[i];
    const c = pts[(i + 4) % N];
    const h1 = Math.atan2(b.x - a.x, b.z - a.z);
    const h2 = Math.atan2(c.x - b.x, c.z - b.z);
    if (Math.abs(wrap(h2 - h1)) / 8 > 0.15) return false;
  }
  // The daily track keeps to its usual length; custom ones scale with size
  return o.custom ? N > 260 && N < 2600 : N > 420 && N < 900;
}

// Circular distance between two sample indices
const gap = (a, b, N) => {
  const d = Math.abs(a - b) % N;
  return Math.min(d, N - d);
};

// Smooth rolling hills: a few whole-lap sine waves, flattened around the
// start/finish, kept above street level (high parts become viaducts) and
// limited to a 13 % grade.
function elevation(N, r, hills = 1) {
  const raw = new Float32Array(N);
  if (hills <= 0) return raw;
  const waves = [
    { k: 2, a: (5 + r() * 3) * hills, p: r() * Math.PI * 2 },
    { k: 3, a: (3 + r() * 2.5) * hills, p: r() * Math.PI * 2 },
    { k: 5 + Math.floor(r() * 2), a: (1 + r() * 1.5) * hills, p: r() * Math.PI * 2 },
  ];
  const bias = (2 + r() * 3) * hills;
  for (let i = 0; i < N; i++) {
    let v = bias;
    waves.forEach((w) => {
      v += w.a * Math.sin((Math.PI * 2 * w.k * i) / N + w.p);
    });
    const flat = 1 - smooth(50, 170, gap(i, 0, N));
    v = v * (1 - flat) - 3 * flat;
    raw[i] = Math.log(1 + Math.exp(v)); // soft floor at street level
  }
  for (let pass = 0; pass < 3; pass++) {
    const copy = raw.slice();
    for (let i = 0; i < N; i++) {
      let s = 0;
      for (let k = -6; k <= 6; k++) s += copy[(i + k + N) % N];
      raw[i] = s / 13;
    }
  }
  // Grade limit: shave the climbs (like a speed profile, both directions,
  // twice so it wraps), then round off the kinks
  const g = Math.min(0.32, 0.13 * hills);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < N; i++) raw[(i + 1) % N] = Math.min(raw[(i + 1) % N], raw[i] + g);
    for (let i = N - 1; i >= 0; i--) raw[i] = Math.min(raw[i], raw[(i + 1) % N] + g);
  }
  for (let pass = 0; pass < 2; pass++) {
    const copy = raw.slice();
    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (let k = -10; k <= 10; k++) sum += copy[(i + k + N) % N];
      raw[i] = sum / 21;
    }
  }
  const floor = Math.min(...raw);
  for (let i = 0; i < N; i++) raw[i] -= floor;
  return raw;
}

// Best window of `len` samples whose every sample passes ok(i), scored by score(i)
function pickWindow(N, len, ok, score, r) {
  let best = -1;
  let bestScore = -Infinity;
  for (let a = 0; a < N; a += 3) {
    let s = 0;
    let good = true;
    for (let k = 0; k < len; k += 2) {
      const i = (a + k) % N;
      if (!ok(i)) {
        good = false;
        break;
      }
      s += score(i);
    }
    s += r() * len * 0.05;
    if (good && s > bestScore) {
      bestScore = s;
      best = a;
    }
  }
  return best;
}

// `day` is the seed: the date (dayKey) for the daily circuit, anything else for
// free play. `opts` scales the layout (see TRACK_DEFAULTS).
export function buildTrack(day = dayKey(), opts = {}) {
  const o = { ...TRACK_DEFAULTS, ...opts };
  o.custom = Object.keys(TRACK_DEFAULTS).some((k) => o[k] !== TRACK_DEFAULTS[k]);
  let layout = null;
  for (let attempt = 0; attempt < (o.custom ? 120 : 60) && !layout; attempt++) {
    const candidate = sampleLoop(generatePoints(hashString(`${day}:${attempt}`), o));
    if (validLayout(candidate, o)) layout = candidate;
  }
  if (!layout) layout = sampleLoop(FALLBACK);
  const { pts, length, N } = layout;
  const r = rng(hashString(`${day}:shape`));

  const ds = length / N;
  const px = new Float32Array(N);
  const pz = new Float32Array(N);
  const tx = new Float32Array(N);
  const tz = new Float32Array(N);
  const nx = new Float32Array(N);
  const nz = new Float32Array(N);
  const heading = new Float32Array(N);
  const curv = new Float32Array(N);
  const turn = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    px[i] = pts[i].x;
    pz[i] = pts[i].z;
  }
  for (let i = 0; i < N; i++) {
    const a = (i - 1 + N) % N;
    const b = (i + 1) % N;
    const dx = px[b] - px[a];
    const dz = pz[b] - pz[a];
    const len = Math.hypot(dx, dz) || 1;
    tx[i] = dx / len;
    tz[i] = dz / len;
    // n points to the driver's right
    nx[i] = -tz[i];
    nz[i] = tx[i];
    heading[i] = Math.atan2(tx[i], tz[i]);
  }
  for (let i = 0; i < N; i++) {
    const d = wrap(heading[(i + 5) % N] - heading[(i - 5 + N) % N]);
    turn[i] = d;
    curv[i] = Math.abs(d) / (10 * ds);
  }

  // Hills
  const e = elevation(N, r, o.hills);
  const h = e.slice();

  // Crest jump on the straightest stretch away from the start
  let jump = Math.round(N / 2);
  let bestCurve = Infinity;
  for (let i = 80; i < N - 80; i++) {
    let sum = 0;
    for (let k = -34; k <= 20; k += 2) sum += curv[(i + k + N) % N];
    if (sum < bestCurve) {
      bestCurve = sum;
      jump = i;
    }
  }
  for (let k = -30; k <= 8; k++) {
    const i = (jump + k + N) % N;
    const s = k * ds;
    h[i] += 2.3 * o.jump * (s <= 0 ? smooth(-26, 0, s) : 1 - smooth(0, 5, s));
  }

  // Zones: one tunnel through a concrete megastructure and up to two narrow
  // old-town streets, clear of the start, the jump and each other.
  const zone = new Uint8Array(N);
  const free = (i, pad) => gap(i, 0, N) > 55 + pad && gap(i, jump, N) > 45 + pad && zone[i] === ZONE.open;
  const tunnels = [];
  const narrows = [];
  // Looser and shorter until one fits
  let tLen = 0;
  let ta = -1;
  for (const [len, maxCurv] of [[60 + Math.floor(r() * 30), 0.07], [50, 0.1], [42, 0.16]]) {
    tLen = len;
    ta = pickWindow(N, len, (i) => free(i, 0) && curv[i] < maxCurv, (i) => -curv[i] * 40 - Math.abs(e[i] - 2) * 0.2, r);
    if (ta >= 0) break;
  }
  if (ta >= 0) {
    for (let k = -20; k < tLen + 20; k++) zone[(ta + k + N) % N] = 9; // keep a margin round the tunnel
    for (let k = 0; k < tLen; k++) zone[(ta + k) % N] = ZONE.tunnel;
    tunnels.push({ a: ta, len: tLen });
  }
  for (let n = 0; n < 2; n++) {
    let len = 70 + Math.floor(r() * 35);
    let a = pickWindow(N, len, (i) => free(i, 10) && e[i] < 5, (i) => curv[i] * 10 - e[i] * 0.3, r);
    if (a < 0 && !narrows.length) {
      len = 55;
      a = pickWindow(N, len, (i) => free(i, 0), (i) => curv[i] * 10 - e[i] * 0.3, r);
    }
    if (a < 0) break;
    for (let k = -20; k < len + 20; k++) if (zone[(a + k + N) % N] === ZONE.open) zone[(a + k + N) % N] = 9;
    for (let k = 0; k < len; k++) zone[(a + k) % N] = ZONE.narrow;
    narrows.push({ a, len });
  }
  for (let i = 0; i < N; i++) if (zone[i] === 9) zone[i] = ZONE.open;

  // Road half-width: narrow zones squeeze in over 25 m
  const hw = new Float32Array(N).fill(HALF_WIDTH * o.width);
  narrows.forEach(({ a, len }) => {
    for (let k = -25; k < len + 25; k++) {
      const t = Math.min(smooth(-25, 0, k), 1 - smooth(len, len + 25, k));
      const i = (a + k + N) % N;
      hw[i] = Math.min(hw[i], (HALF_WIDTH + (NARROW_WIDTH - HALF_WIDTH) * t) * o.width);
    }
  });

  // Slope along the track, and the underside of the deck where the road is
  // raised (below it the barriers run down to the ground as a retaining wall)
  const slope = new Float32Array(N);
  const base = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    slope[i] = (h[(i + 1) % N] - h[(i - 1 + N) % N]) / (2 * ds);
    base[i] = Math.max(0, h[i] - 0.9) * smooth(2.2, 3.6, e[i]);
  }

  const track = {
    day, opts: o, N, ds, length, px, pz, tx, tz, nx, nz, h, e, hw, base, slope, heading, curv, turn, jump, zone, tunnels, narrows,
  };
  racingLine(track);
  return track;
}

// Minimum-curvature racing line (lateral offset per sample) and the AI
// target speed along it.
function racingLine(track) {
  const { N, ds, px, pz, nx, nz, hw } = track;
  const line = new Float32Array(N);
  const lim = (i) => hw[i] - 2.3;
  for (let iter = 0; iter < 500; iter++) {
    const span = iter < 350 ? 4 : 1;
    for (let i = 0; i < N; i++) {
      const a = (i - span + N) % N;
      const b = (i + span) % N;
      const mx = (px[a] + nx[a] * line[a] + px[b] + nx[b] * line[b]) / 2;
      const mz = (pz[a] + nz[a] * line[a] + pz[b] + nz[b] * line[b]) / 2;
      const d = (mx - px[i] - nx[i] * line[i]) * nx[i] + (mz - pz[i] - nz[i] * line[i]) * nz[i];
      line[i] = Math.max(-lim(i), Math.min(lim(i), line[i] + d * 0.6));
    }
  }
  const lx = new Float32Array(N);
  const lz = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    lx[i] = px[i] + nx[i] * line[i];
    lz[i] = pz[i] + nz[i] * line[i];
  }
  const vline = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i - 5 + N) % N;
    const b = (i + 5) % N;
    const h1 = Math.atan2(lx[i] - lx[a], lz[i] - lz[a]);
    const h2 = Math.atan2(lx[b] - lx[i], lz[b] - lz[i]);
    const len = Math.hypot(lx[i] - lx[a], lz[i] - lz[a]) + Math.hypot(lx[b] - lx[i], lz[b] - lz[i]);
    const k = Math.abs(wrap(h2 - h1)) / Math.max(len, 1e-3);
    // Over a crest the car goes light and has less grip
    const kv = (track.h[b] - 2 * track.h[i] + track.h[a]) / (25 * ds * ds);
    vline[i] = Math.min(AI_VMAX, Math.sqrt(AI_LAT / Math.max(k - (AI_LAT * Math.min(0, kv)) / 23, 1e-4)));
  }
  // Brake ahead of corners (two passes so it wraps around the start line)
  for (let pass = 0; pass < 2; pass++) {
    for (let i = N - 1; i >= 0; i--) {
      const next = (i + 1) % N;
      vline[i] = Math.min(vline[i], Math.sqrt(vline[next] ** 2 + 2 * AI_BRAKE * ds));
    }
  }
  // Don't take the jump flat out: the landing kicks
  for (let k = -40; k <= 4; k++) {
    const i = (track.jump + k + N) % N;
    vline[i] = Math.min(vline[i], 40);
  }
  track.line = line;
  track.vline = vline;
}

// Nearest sample, searching around a hint (or everywhere without one)
export function locate(track, x, z, hint) {
  const { N, px, pz } = track;
  let best = hint ?? 0;
  let bd = Infinity;
  if (hint === undefined || hint === null) {
    for (let i = 0; i < N; i++) {
      const d = (px[i] - x) ** 2 + (pz[i] - z) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }
  for (let k = -24; k <= 24; k++) {
    const i = (hint + k + N) % N;
    const d = (px[i] - x) ** 2 + (pz[i] - z) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

// Road surface under a world point, starting from a nearby sample i:
// height, the sample it belongs to, lateral offset (positive = right), half
// width and slope. Works for points a few metres from sample i. Beyond the
// barriers of open sections the surface is the city floor (y = 0); tunnels
// and narrow streets are walled in (solid).
export function surface(track, i, x, z, out = {}) {
  const { N, px, pz, tx, tz, nx, nz, h, ds } = track;
  const f = ((x - px[i]) * tx[i] + (z - pz[i]) * tz[i]) / ds;
  const fl = Math.floor(f);
  const t = f - fl;
  const a = (((i + fl) % N) + N) % N;
  const b = (a + 1) % N;
  const j = t < 0.5 ? a : b;
  out.h = h[a] + (h[b] - h[a]) * t;
  out.j = j;
  out.lat = (x - px[j]) * nx[j] + (z - pz[j]) * nz[j];
  out.hw = track.hw[j];
  out.slope = track.slope[j];
  out.roadH = out.h;
  out.solid = track.zone[j] !== ZONE.open;
  out.off = !out.solid && Math.abs(out.lat) > out.hw + 0.62;
  if (out.off) {
    out.h = 0;
    out.slope = 0;
  }
  return out;
}

export function groundAt(track, i, x, z) {
  return surface(track, i, x, z, _s).h;
}
const _s = {};

// Point on the track at sample i, offset sideways (positive = right)
export function trackPoint(track, i, lateral = 0) {
  const { N, px, pz, nx, nz, h } = track;
  const k = ((i % N) + N) % N;
  return { x: px[k] + nx[k] * lateral, z: pz[k] + nz[k] * lateral, y: h[k], heading: track.heading[k] };
}

// Grid slots for 10 cars (5 rows of 2): metres behind the start line and
// lateral offset (positive = tower side). Pole position first.
export const GRID_SIZE = 10;
export const GRID = Array.from({ length: GRID_SIZE }, (_, k) => ({
  back: 7 + Math.floor(k / 2) * 7.5,
  lateral: k % 2 ? 3.2 : -3.2,
}));
