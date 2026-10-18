// The circuit: a closed concrete street course around the hero tower.
// Everything here is generated: spline, road, barriers, signs and city.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { rng, projectUVs, makeConcreteTexture } from '../hero/sceneAssets';
import { PROJECTS } from '../../content/projects.mjs';

export const HALF_WIDTH = 7;
export const TOTAL_LAPS = 3;

// ── Daily layout ────────────────────────────────────────────────────────────
// Every UTC day gets its own circuit, generated from the date. The start
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

// AI speed profile
const VMAX = 46;
const A_LAT = 26;
const BRAKE = 24;

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// UTC date, so everyone races (and ranks on) the same circuit each day
export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) % 2147483646 + 1;
}

function generatePoints(seed) {
  const r = rng(seed);
  const n = 8 + Math.floor(r() * 5);
  const a0 = (140 / 180) * Math.PI;
  const a1 = (400 / 180) * Math.PI;
  const pts = [...STRAIGHT];
  let prev = 80;
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5 + (r() - 0.5) * 0.45) / n;
    const ang = a0 + (a1 - a0) * t;
    let rad = 58 + r() * 46;
    if (r() < 0.25) rad = 36 + r() * 10; // pinch: a tight corner or hairpin
    rad = Math.max(prev - 42, Math.min(prev + 42, rad));
    prev = rad;
    pts.push([CENTER.x + Math.cos(ang) * rad * 1.18, CENTER.z + Math.sin(ang) * rad * 0.95]);
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
function validLayout({ pts, N }) {
  const step = 3;
  const clear = HALF_WIDTH * 2 + 4;
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
  return N > 420 && N < 900;
}

export function buildTrack(day = dayKey()) {
  let layout = null;
  for (let attempt = 0; attempt < 60 && !layout; attempt++) {
    const candidate = sampleLoop(generatePoints(hashString(`${day}:${attempt}`)));
    if (validLayout(candidate)) layout = candidate;
  }
  if (!layout) layout = sampleLoop(FALLBACK);
  const { pts, length, N } = layout;

  const ds = length / N;
  const px = new Float32Array(N);
  const pz = new Float32Array(N);
  const tx = new Float32Array(N);
  const tz = new Float32Array(N);
  const nx = new Float32Array(N);
  const nz = new Float32Array(N);
  const h = new Float32Array(N);
  const heading = new Float32Array(N);
  const curv = new Float32Array(N);
  const turn = new Float32Array(N);
  const vmax = new Float32Array(N);

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
    vmax[i] = Math.min(VMAX, Math.sqrt(A_LAT / Math.max(curv[i], 1e-4)));
  }
  // Brake ahead of corners (two passes so it wraps around the start line)
  for (let pass = 0; pass < 2; pass++) {
    for (let i = N - 1; i >= 0; i--) {
      const next = (i + 1) % N;
      vmax[i] = Math.min(vmax[i], Math.sqrt(vmax[next] ** 2 + 2 * BRAKE * ds));
    }
  }

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
    h[i] = s <= 0 ? 2.3 * smooth(-26, 0, s) : 2.3 * (1 - smooth(0, 5, s));
  }

  return { day, N, ds, length, px, pz, tx, tz, nx, nz, h, heading, curv, turn, vmax, jump };
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

export function groundAt(track, i, x, z) {
  const { N, px, pz, tx, tz, h, ds } = track;
  const f = ((x - px[i]) * tx[i] + (z - pz[i]) * tz[i]) / ds;
  const j = f >= 0 ? (i + 1) % N : (i - 1 + N) % N;
  return h[i] + (h[j] - h[i]) * Math.min(1, Math.abs(f));
}

// Point on the track at sample i, offset sideways (positive = right)
export function trackPoint(track, i, lateral = 0) {
  const { N, px, pz, nx, nz, h } = track;
  const k = ((i % N) + N) % N;
  return { x: px[k] + nx[k] * lateral, z: pz[k] + nz[k] * lateral, y: h[k], heading: track.heading[k] };
}

// ── Textures ────────────────────────────────────────────────────────────────

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, repeat = false) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function roadTexture() {
  const r = rng(31);
  const [c, ctx] = canvas(512, 1024);
  ctx.fillStyle = '#5b5a56';
  ctx.fillRect(0, 0, 512, 1024);
  const img = ctx.getImageData(0, 0, 512, 1024);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 34;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  // Concrete slab joints
  ctx.fillStyle = 'rgba(30,30,28,0.35)';
  ctx.fillRect(0, 0, 512, 3);
  ctx.fillRect(255, 0, 2, 1024);
  // Rubber on the racing line
  for (let k = 0; k < 90; k++) {
    const x = 150 + r() * 210;
    const g = ctx.createLinearGradient(x - 18, 0, x + 18, 0);
    g.addColorStop(0, 'rgba(20,20,20,0)');
    g.addColorStop(0.5, `rgba(20,20,20,${0.05 + r() * 0.06})`);
    g.addColorStop(1, 'rgba(20,20,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 18, r() * 1024, 36, 200 + r() * 600);
  }
  // Painted edge lines
  ctx.fillStyle = '#e9e6de';
  ctx.fillRect(14, 0, 9, 1024);
  ctx.fillRect(489, 0, 9, 1024);
  return tex(c, true);
}

function stripeTexture(a, b) {
  const [c, ctx] = canvas(64, 128);
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = b;
  ctx.fillRect(0, 64, 64, 64);
  return tex(c, true);
}

function groundTexture() {
  const r = rng(77);
  const [c, ctx] = canvas(512);
  ctx.fillStyle = '#b4b0a7';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    const x = r() * 512;
    const y = r() * 512;
    const rad = 10 + r() * 60;
    const l = Math.round(150 + r() * 50);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(${l},${l - 4},${l - 10},0.16)`);
    g.addColorStop(1, `rgba(${l},${l - 4},${l - 10},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const img = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 26;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  ctx.strokeStyle = 'rgba(60,58,54,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 512);
  return tex(c, true);
}

function checkerTexture() {
  const [c, ctx] = canvas(256, 32);
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 2; y++) {
      ctx.fillStyle = (x + y) % 2 ? '#111' : '#f2efe8';
      ctx.fillRect(x * 16, y * 16, 16, 16);
    }
  }
  const t = tex(c);
  t.magFilter = THREE.NearestFilter;
  return t;
}

function billboardTexture(title, line, bg, fg) {
  const [c, ctx] = canvas(1024, 340);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 340);
  ctx.fillStyle = fg;
  ctx.font = '210px Anton, Impact, "Arial Narrow", sans-serif';
  ctx.textBaseline = 'alphabetic';
  let size = 210;
  while (ctx.measureText(title.toUpperCase()).width > 940 && size > 80) {
    size -= 10;
    ctx.font = `${size}px Anton, Impact, "Arial Narrow", sans-serif`;
  }
  ctx.fillText(title.toUpperCase(), 40, 250);
  ctx.font = '500 26px "IBM Plex Mono", monospace';
  ctx.fillText(line.toUpperCase(), 44, 305);
  ctx.fillRect(44, 34, 26, 26);
  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillText('JOONAS ALANENPÄÄ / WORK', 86, 56);
  return tex(c);
}

function bannerTexture() {
  const [c, ctx] = canvas(1024, 128);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 1024, 128);
  ctx.fillStyle = '#1769e0';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#f2efe8';
  ctx.font = '84px Anton, Impact, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('JA', 26, 68);
  ctx.fillText('START · FINISH', 170, 68);
  ctx.font = '500 26px "IBM Plex Mono", monospace';
  ctx.fillText('RALLY 26 / HELSINKI', 760, 68);
  return tex(c);
}

function chevronTexture(dir) {
  const [c, ctx] = canvas(128, 160);
  ctx.fillStyle = '#ff6a3d';
  ctx.fillRect(0, 0, 128, 160);
  ctx.fillStyle = '#111';
  ctx.save();
  ctx.translate(64, 80);
  if (dir < 0) ctx.scale(-1, 1);
  ctx.beginPath();
  ctx.moveTo(-30, -50);
  ctx.lineTo(14, 0);
  ctx.lineTo(-30, 50);
  ctx.lineTo(-6, 50);
  ctx.lineTo(38, 0);
  ctx.lineTo(-6, -50);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  return tex(c);
}

function facadeTexture(seed) {
  const r = rng(seed);
  const base = makeConcreteTexture(seed, 512).image;
  const [c, ctx] = canvas(512);
  ctx.drawImage(base, 0, 0);
  // Ribbon windows: dark horizontal slots with mullions
  for (let y = 40; y < 512; y += 128) {
    ctx.fillStyle = 'rgba(20,22,26,0.88)';
    ctx.fillRect(0, y, 512, 34);
    ctx.fillStyle = 'rgba(160,170,180,0.18)';
    for (let x = 0; x < 512; x += 64) ctx.fillRect(x, y, 4, 34);
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = `rgba(255,236,190,${0.05 + r() * 0.12})`;
      ctx.fillRect(Math.floor(r() * 8) * 64 + 4, y, 60, 34);
    }
  }
  return tex(c, true);
}

// ── Geometry builders ───────────────────────────────────────────────────────

// Strip between two lateral offsets, optionally only where include(i) is true
function ribbon(track, a, b, lift, vScale, include = () => true) {
  const { N, px, pz, nx, nz, h, ds } = track;
  const pos = [];
  const uv = [];
  const idx = [];
  let base = 0;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    if (!include(i)) continue;
    const s0 = (i * ds) / vScale;
    const s1 = ((i + 1) * ds) / vScale;
    const quad = [
      [i, a, 0, s0],
      [i, b, 1, s0],
      [j, a, 0, s1],
      [j, b, 1, s1],
    ];
    quad.forEach(([k, off, u, v]) => {
      pos.push(px[k] + nx[k] * off, h[k] + lift, pz[k] + nz[k] * off);
      uv.push(u, v);
    });
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    base += 4;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Continuous jersey barrier along one edge (side = +1 right, -1 left)
function barrier(track, side) {
  const { N, px, pz, nx, nz, h, ds } = track;
  // [outward offset from edge, height]; bottom vertices sit on the ground
  const profile = [
    [0, 0], [0, 0.22], [0.14, 0.5], [0.2, 0.92], [0.42, 0.92], [0.48, 0.5], [0.62, 0.22], [0.62, 0],
  ];
  const P = profile.length;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= N; i++) {
    const k = i % N;
    profile.forEach(([o, y], p) => {
      const off = side * (HALF_WIDTH + o);
      const yy = y === 0 ? 0 : h[k] + y;
      pos.push(px[k] + nx[k] * off, yy, pz[k] + nz[k] * off);
      uv.push(p / (P - 1), (i * ds) / 3);
    });
  }
  for (let i = 0; i < N; i++) {
    for (let p = 0; p < P - 1; p++) {
      const a = i * P + p;
      const b = a + P;
      if (side > 0) idx.push(a, a + 1, b, a + 1, b + 1, b);
      else idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function minDistToTrack(track, x, z) {
  let d = Infinity;
  for (let i = 0; i < track.N; i += 3) d = Math.min(d, (track.px[i] - x) ** 2 + (track.pz[i] - z) ** 2);
  return Math.sqrt(d);
}

// ── World ───────────────────────────────────────────────────────────────────

export function buildWorld(track) {
  const r = rng(hashString(`city:${track.day}`));
  const group = new THREE.Group();
  const risers = [];
  const disposables = [];
  const keep = (x) => {
    disposables.push(x);
    return x;
  };
  const addRiser = (obj, delay) => {
    group.add(obj);
    risers.push({ obj, baseY: obj.position.y, delay });
    return obj;
  };
  const mesh = (geo, mat, opts = {}) => {
    const m = new THREE.Mesh(keep(geo), mat);
    m.castShadow = opts.cast ?? true;
    m.receiveShadow = true;
    return m;
  };

  const concreteMap = keep(makeConcreteTexture(91, 512));
  const concrete = keep(new THREE.MeshStandardMaterial({ map: concreteMap, color: '#e4e1da', roughness: 0.95 }));
  const concreteDark = keep(new THREE.MeshStandardMaterial({ map: concreteMap, color: '#bdbab2', roughness: 0.95 }));
  const steel = keep(new THREE.MeshStandardMaterial({ color: '#2c2c2b', metalness: 0.55, roughness: 0.5 }));

  // Ground
  const groundMap = keep(groundTexture());
  groundMap.repeat.set(36, 36);
  const groundMat = keep(new THREE.MeshStandardMaterial({ map: groundMap, roughness: 1, transparent: true, opacity: 0 }));
  const ground = mesh(new THREE.PlaneGeometry(900, 900), groundMat, { cast: false });
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -40);
  group.add(ground);

  // Road + curbs + barriers (one riser so the circuit rises as a piece)
  const circuit = new THREE.Group();
  const roadMat = keep(new THREE.MeshStandardMaterial({ map: keep(roadTexture()), roughness: 0.88 }));
  circuit.add(mesh(ribbon(track, -HALF_WIDTH, HALF_WIDTH, 0.02, 16), roadMat, { cast: false }));

  const curbMat = keep(new THREE.MeshStandardMaterial({ map: keep(stripeTexture('#1769e0', '#f2efe8')), roughness: 0.7 }));
  const corner = (i) => track.curv[i] > 0.018;
  circuit.add(mesh(ribbon(track, HALF_WIDTH - 1.1, HALF_WIDTH - 0.05, 0.05, 4, corner), curbMat, { cast: false }));
  circuit.add(mesh(ribbon(track, -HALF_WIDTH + 0.05, -HALF_WIDTH + 1.1, 0.05, 4, corner), curbMat, { cast: false }));

  const barrierMat = keep(new THREE.MeshStandardMaterial({ map: concreteMap, color: '#efece6', roughness: 0.92, side: THREE.DoubleSide }));
  circuit.add(mesh(barrier(track, 1), barrierMat));
  circuit.add(mesh(barrier(track, -1), barrierMat));

  // Start line + grid boxes
  const { px, pz, nx, nz, heading, N } = track;
  const lineMat = keep(new THREE.MeshStandardMaterial({ map: keep(checkerTexture()), roughness: 0.8 }));
  const line = mesh(new THREE.PlaneGeometry(HALF_WIDTH * 2, 2), lineMat, { cast: false });
  line.rotation.order = 'YXZ';
  line.rotation.set(-Math.PI / 2, heading[0], 0);
  line.position.set(px[0], 0.04, pz[0]);
  circuit.add(line);
  const white = keep(new THREE.MeshStandardMaterial({ color: '#ece9e2', roughness: 0.8 }));
  GRID.forEach(({ back, lateral }) => {
    const i = (N - back) % N;
    const box = mesh(new THREE.PlaneGeometry(2.4, 0.35), white, { cast: false });
    box.rotation.order = 'YXZ';
    box.rotation.set(-Math.PI / 2, heading[i], 0);
    box.position.set(px[i] + nx[i] * lateral - track.tx[i] * 2.4, 0.04, pz[i] + nz[i] * lateral - track.tz[i] * 2.4);
    circuit.add(box);
  });

  // Start gantry with countdown lights
  const gantry = new THREE.Group();
  const span = HALF_WIDTH + 1.6;
  [-1, 1].forEach((s) => {
    const post = mesh(new THREE.BoxGeometry(0.4, 7.2, 0.4), steel);
    post.position.set(s * span, 3.6, 0);
    gantry.add(post);
  });
  const beam = mesh(new THREE.BoxGeometry(span * 2 + 0.4, 1.3, 0.5), steel);
  beam.position.set(0, 6.8, 0);
  gantry.add(beam);
  const bannerMat = keep(new THREE.MeshStandardMaterial({ map: keep(bannerTexture()), roughness: 0.7 }));
  const bannerGeo = keep(new THREE.PlaneGeometry(span * 2, 1.15));
  [1, -1].forEach((s) => {
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 6.8, s * 0.26);
    if (s < 0) banner.rotation.y = Math.PI;
    gantry.add(banner);
  });
  const lights = [];
  const lightGeo = keep(new THREE.BoxGeometry(0.7, 0.7, 0.2));
  for (let k = 0; k < 3; k++) {
    const mat = keep(new THREE.MeshStandardMaterial({ color: '#1a1a1a', emissive: '#000', roughness: 0.4 }));
    [1, -1].forEach((s) => {
      const l = new THREE.Mesh(lightGeo, mat);
      l.position.set((k - 1) * 1.1, 5.7, s * 0.2);
      gantry.add(l);
    });
    lights.push(mat);
  }
  gantry.position.set(px[0], 0, pz[0]);
  gantry.rotation.y = heading[0];
  circuit.add(gantry);
  addRiser(circuit, 0.18);

  // Billboards advertising the actual projects
  const featured = PROJECTS.filter((p) => p.featured);
  const palettes = [
    ['#1769e0', '#f7f6f2'],
    ['#111111', '#f7f6f2'],
    ['#ebe8e1', '#111111'],
    ['#ff6a3d', '#111111'],
  ];
  const postGeo = keep(new THREE.BoxGeometry(0.3, 4.2, 0.3));
  const boardGeo = keep(new THREE.BoxGeometry(10, 3.3, 0.25));
  const spots = 9;
  for (let k = 0; k < spots; k++) {
    const i = Math.floor(((k + 0.35) / spots) * N);
    if (track.curv[i] > 0.03 || Math.abs(i - track.jump) < 40) continue;
    const side = k % 2 ? 1 : -1;
    const p = featured[k % featured.length];
    const [bg, fg] = palettes[k % palettes.length];
    const map = keep(billboardTexture(p.title, p.subtitle, bg, fg));
    const faceMat = keep(new THREE.MeshStandardMaterial({ map, roughness: 0.6 }));
    const board = new THREE.Group();
    const panel = mesh(boardGeo, [steel, steel, steel, steel, faceMat, steel]);
    panel.position.y = 4.6;
    board.add(panel);
    [-3.6, 3.6].forEach((x) => {
      const post = mesh(postGeo, steel);
      post.position.set(x, 2.1, -0.1);
      board.add(post);
    });
    const off = side * (HALF_WIDTH + 4.5);
    board.position.set(px[i] + nx[i] * off, 0, pz[i] + nz[i] * off);
    // face the track
    board.rotation.y = Math.atan2(-nx[i] * side, -nz[i] * side);
    addRiser(board, 0.1 + r() * 0.2);
  }

  // Chevron boards on the outside of the tighter corners
  const chevGeo = keep(new THREE.BoxGeometry(1.4, 1.75, 0.12));
  const chevMats = {
    1: keep(new THREE.MeshStandardMaterial({ map: keep(chevronTexture(1)), roughness: 0.6 })),
    '-1': keep(new THREE.MeshStandardMaterial({ map: keep(chevronTexture(-1)), roughness: 0.6 })),
  };
  let lastApex = -100;
  for (let i = 0; i < N; i++) {
    const c = track.curv[i];
    if (c < 0.035 || i - lastApex < 30) continue;
    if (c < track.curv[(i + 1) % N] || c < track.curv[(i - 1 + N) % N]) continue;
    lastApex = i;
    const turnLeft = track.turn[i] > 0;
    const outer = turnLeft ? 1 : -1;
    for (let k = -2; k <= 2; k++) {
      const j = (i + k * 5 + N) % N;
      const off = outer * (HALF_WIDTH + 1.3);
      const sign = new THREE.Group();
      const board = mesh(chevGeo, [steel, steel, steel, steel, chevMats[turnLeft ? -1 : 1], steel]);
      board.position.y = 1.9;
      sign.add(board);
      sign.position.set(px[j] + nx[j] * off, track.h[j], pz[j] + nz[j] * off);
      sign.rotation.y = Math.atan2(-nx[j] * outer, -nz[j] * outer);
      addRiser(sign, 0.15);
    }
  }

  // Brutalist city around the circuit
  const facades = [keep(facadeTexture(5)), keep(facadeTexture(8))];
  const facadeMats = facades.map((m) => keep(new THREE.MeshStandardMaterial({ map: m, roughness: 0.9 })));
  const placed = [];
  let tries = 0;
  while (placed.length < 70 && tries < 3000) {
    tries++;
    const x = -190 + r() * 380;
    const z = -230 + r() * 330;
    const tower = r() < 0.35;
    const w = tower ? 9 + r() * 7 : 12 + r() * 16;
    const d = tower ? 9 + r() * 7 : 9 + r() * 12;
    const hgt = tower ? 22 + r() * 30 : 5 + r() * 12;
    const rad = Math.hypot(w, d) / 2;
    if (Math.abs(x) < 16 && z > -14 && z < 10) continue; // hero tower
    if (Math.hypot(x - 40, z - 64) < 34 + rad) continue; // keep the intro camera view clear
    if (minDistToTrack(track, x, z) < HALF_WIDTH + 9 + rad) continue;
    if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.rad + rad + 4)) continue;
    placed.push({ x, z, rad });

    const b = new THREE.Group();
    const geo = projectUVs(new RoundedBoxGeometry(w, hgt, d, 2, 0.08), tower ? 0.08 : 0.25, r);
    const mat = tower ? facadeMats[placed.length % 2] : r() < 0.5 ? concrete : concreteDark;
    const body = mesh(geo, mat);
    body.position.y = hgt / 2;
    b.add(body);
    if (!tower && r() < 0.45) {
      // cantilevered upper block
      const cw = w * (0.6 + r() * 0.5);
      const ch = 3 + r() * 4;
      const cd = d * (0.7 + r() * 0.4);
      const cg = projectUVs(new RoundedBoxGeometry(cw, ch, cd, 2, 0.08), 0.25, r);
      const top = mesh(cg, concrete);
      top.position.set((r() - 0.5) * w * 0.5, hgt + ch / 2, (r() - 0.5) * d * 0.4);
      b.add(top);
    }
    b.position.set(x, 0, z);
    b.rotation.y = Math.floor(r() * 4) * (Math.PI / 2) + (r() - 0.5) * 0.2;
    const dist = Math.hypot(x, z);
    addRiser(b, Math.min(0.7, 0.12 + dist / 420));
  }

  return {
    group,
    risers,
    ground,
    groundMat,
    lights,
    dispose() {
      disposables.forEach((x) => x.dispose?.());
    },
  };
}

// Grid slots for 10 cars (5 rows of 2): metres behind the start line and
// lateral offset (positive = tower side). Pole position first.
export const GRID_SIZE = 10;
export const GRID = Array.from({ length: GRID_SIZE }, (_, k) => ({
  back: 7 + Math.floor(k / 2) * 7.5,
  lateral: k % 2 ? 3.2 : -3.2,
}));
