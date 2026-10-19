// The 3D world around the circuit, generated from the track data: road,
// curbs, barriers and viaducts, start gantry, tunnel through a concrete
// megastructure, motorway overpasses, footbridges, street lamps, signs,
// billboards and a brutalist city. Static city blocks are merged per map
// cell so the whole city costs a few dozen draw calls.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rng, projectUVs, makeConcreteTexture } from '../hero/sceneAssets';
import { GRID, ZONE, TUNNEL_HEIGHT, hashString } from './track';

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

// Motorway deck: darker asphalt with dashed lane lines
function motorwayTexture() {
  const r = rng(44);
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = '#4a4946';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const l = 50 + r() * 40;
    ctx.fillStyle = `rgba(${l},${l},${l - 3},0.5)`;
    ctx.fillRect(r() * 512, r() * 512, 2, 2);
  }
  ctx.fillStyle = '#e9e6de';
  ctx.fillRect(20, 0, 8, 512);
  ctx.fillRect(484, 0, 8, 512);
  [170, 338].forEach((x) => ctx.fillRect(x, 0, 6, 220));
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

function hazardTexture() {
  const [c, ctx] = canvas(256, 64);
  ctx.fillStyle = '#ff6a3d';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#111';
  for (let x = -64; x < 256; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x + 24, 64);
    ctx.lineTo(x + 88, 0);
    ctx.lineTo(x + 64, 0);
    ctx.closePath();
    ctx.fill();
  }
  return tex(c, true);
}

// Tunnel ceiling lights: bright dashes on black
function dashTexture() {
  const [c, ctx] = canvas(16, 64);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 16, 64);
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(0, 0, 16, 26);
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
  ctx.fillText('RALLY 26 / OFFICIAL PARTNER', 86, 56);
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

// Blue motorway direction sign
function roadSignTexture(lines, arrow) {
  const [c, ctx] = canvas(768, 320);
  ctx.fillStyle = '#1d4fa3';
  ctx.fillRect(0, 0, 768, 320);
  ctx.strokeStyle = '#f2efe8';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 740, 292);
  ctx.fillStyle = '#f2efe8';
  ctx.textBaseline = 'middle';
  lines.forEach((t, k) => {
    ctx.font = `600 ${k ? 64 : 92}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    ctx.fillText(t, 56, 98 + k * 104);
  });
  if (arrow) {
    ctx.save();
    ctx.translate(650, 160);
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(56, -20);
    ctx.lineTo(20, -20);
    ctx.lineTo(20, 90);
    ctx.lineTo(-20, 90);
    ctx.lineTo(-20, -20);
    ctx.lineTo(-56, -20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
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

function facadeTexture(seed, { rows = 4, dark = 0.88, lit = 0.12 } = {}) {
  const r = rng(seed);
  const base = makeConcreteTexture(seed, 512).image;
  const [c, ctx] = canvas(512);
  ctx.drawImage(base, 0, 0);
  const pitch = 512 / rows;
  // Ribbon windows: dark horizontal slots with mullions
  for (let y = pitch * 0.3; y < 512; y += pitch) {
    ctx.fillStyle = `rgba(20,22,26,${dark})`;
    ctx.fillRect(0, y, 512, pitch * 0.27);
    ctx.fillStyle = 'rgba(160,170,180,0.18)';
    for (let x = 0; x < 512; x += 64) ctx.fillRect(x, y, 4, pitch * 0.27);
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = `rgba(255,236,190,${0.05 + r() * lit})`;
      ctx.fillRect(Math.floor(r() * 8) * 64 + 4, y, 60, pitch * 0.27);
    }
  }
  return tex(c, true);
}

// Night: the same window slots as facadeTexture / panelTexture, black except
// for the lit ones (used as the emissive map, so it only shows after dark)
const WARM = ['255,214,150', '255,226,178', '255,240,214', '214,228,255'];
function facadeGlow(seed, { rows = 4 } = {}) {
  const r = rng(seed + 500);
  const [c, ctx] = canvas(512);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 512, 512);
  const pitch = 512 / rows;
  for (let y = pitch * 0.3; y < 512; y += pitch) {
    for (let x = 0; x < 512; x += 64) {
      if (r() > 0.42) continue;
      ctx.fillStyle = `rgba(${WARM[Math.floor(r() * WARM.length)]},${0.45 + r() * 0.55})`;
      ctx.fillRect(x + 4, y, 60, pitch * 0.27);
    }
  }
  return tex(c, true);
}

function panelGlow(seed) {
  const r = rng(seed + 500);
  const [c, ctx] = canvas(512);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 128) {
    for (let x = 0; x < 512; x += 128) {
      if (r() > 0.38) continue;
      ctx.fillStyle = `rgba(${WARM[Math.floor(r() * WARM.length)]},${0.45 + r() * 0.55})`;
      ctx.fillRect(x + 32, y + 36, 64, 52);
    }
  }
  return tex(c, true);
}

// Soft round light pool for the street lamps at night
function poolTexture() {
  const [c, ctx] = canvas(128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,214,150,1)');
  g.addColorStop(0.45, 'rgba(255,190,120,0.45)');
  g.addColorStop(1, 'rgba(255,170,100,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return tex(c);
}

// Precast panel grid with deep square windows (housing blocks)
function panelTexture(seed) {
  const r = rng(seed);
  const base = makeConcreteTexture(seed + 3, 512).image;
  const [c, ctx] = canvas(512);
  ctx.drawImage(base, 0, 0);
  for (let y = 0; y < 512; y += 128) {
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = 'rgba(35,34,32,0.35)';
      ctx.fillRect(x, y, 128, 3);
      ctx.fillRect(x, y, 3, 128);
      ctx.fillStyle = 'rgba(18,20,24,0.9)';
      ctx.fillRect(x + 30, y + 34, 68, 56);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x + 30, y + 90, 68, 5);
      if (r() < 0.25) {
        ctx.fillStyle = `rgba(255,232,180,${0.1 + r() * 0.15})`;
        ctx.fillRect(x + 32, y + 36, 64, 52);
      }
    }
  }
  return tex(c, true);
}

// ── Track-following geometry ────────────────────────────────────────────────

const fn = (v) => (typeof v === 'function' ? v : () => v);

// Horizontal strip between lateral offsets a(k) and b(k) at height y(k)
function ribbon(track, a, b, y, vScale, include = () => true) {
  const { N, px, pz, nx, nz, ds } = track;
  const A = fn(a);
  const B = fn(b);
  const Y = fn(y);
  const pos = [];
  const uv = [];
  const idx = [];
  let base = 0;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    if (!include(i)) continue;
    const s0 = (i * ds) / vScale;
    const s1 = ((i + 1) * ds) / vScale;
    [[i, A, 0, s0], [i, B, 1, s0], [j, A, 0, s1], [j, B, 1, s1]].forEach(([k, off, u, v]) => {
      const o = off(k);
      pos.push(px[k] + nx[k] * o, Y(k), pz[k] + nz[k] * o);
      uv.push(u, v);
    });
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    base += 4;
  }
  return finish(pos, uv, idx);
}

// Vertical strip at lateral offset off(k), from y0(k) to y1(k)
function wall(track, off, y0, y1, vScale, include = () => true) {
  const { N, px, pz, nx, nz, ds } = track;
  const O = fn(off);
  const Y0 = fn(y0);
  const Y1 = fn(y1);
  const pos = [];
  const uv = [];
  const idx = [];
  let base = 0;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    if (!include(i)) continue;
    [[i, Y0], [i, Y1], [j, Y0], [j, Y1]].forEach(([k, Y], n) => {
      const o = O(k);
      const y = Y(k);
      pos.push(px[k] + nx[k] * o, y, pz[k] + nz[k] * o);
      uv.push(((n < 2 ? i : i + 1) * ds) / vScale, y / vScale);
    });
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    base += 4;
  }
  return finish(pos, uv, idx);
}

function finish(pos, uv, idx) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Continuous jersey barrier along one edge (side = +1 right, -1 left). Its
// foot runs down to the ground (or the deck underside on viaducts).
function barrier(track, side) {
  const { N, px, pz, nx, nz, h, hw, base, ds } = track;
  // [outward offset from edge, height]; y 0 = foot
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
      const off = side * (hw[k] + o);
      const yy = y === 0 ? base[k] : h[k] + y;
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
  return finish(pos, uv, idx);
}

// ── Static batching ─────────────────────────────────────────────────────────

const CELL = 80;
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3(1, 1, 1);
const tmpP = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function placeMatrix(x, y, z, yaw) {
  tmpQ.setFromAxisAngle(Y_AXIS, yaw);
  return tmpM.compose(tmpP.set(x, y, z), tmpQ, tmpS);
}

class Batch {
  constructor() {
    this.cells = new Map();
  }

  // geo is consumed. Rounded boxes are non-indexed, so everything is.
  add(source, mat, matrix, cellX, cellZ) {
    const geo = source.index ? source.toNonIndexed() : source;
    if (geo !== source) source.dispose();
    geo.applyMatrix4(matrix);
    const key = `${Math.floor(cellX / CELL)},${Math.floor(cellZ / CELL)}`;
    if (!this.cells.has(key)) this.cells.set(key, new Map());
    const cell = this.cells.get(key);
    if (!cell.has(mat)) cell.set(mat, []);
    cell.get(mat).push(geo);
  }

  build(keep, addRiser, delayOf) {
    this.cells.forEach((cell, key) => {
      const [cx, cz] = key.split(',').map(Number);
      const group = new THREE.Group();
      cell.forEach((geos, mat) => {
        const merged = mergeGeometries(geos, false);
        geos.forEach((g) => g.dispose());
        if (!merged) return;
        const m = new THREE.Mesh(keep(merged), mat);
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
      });
      addRiser(group, delayOf((cx + 0.5) * CELL, (cz + 0.5) * CELL));
    });
  }
}

// Box parts, already positioned in building space
const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const rbox = (w, h, d, x, y, z) => new RoundedBoxGeometry(w, h, d, 1, Math.min(0.12, Math.min(w, h, d) / 4)).translate(x, y, z);

// ── Buildings ───────────────────────────────────────────────────────────────
// Each returns [geometry, material key, uv scale] parts in building space,
// footprint centred on the origin, ground at y = 0.

// Like the hero tower: a core with fins, a big cantilevered top slab with
// downstand beams and a crown, a mid ledge and a stepped plinth
function towerParts(r, w, d, hgt) {
  const parts = [];
  const cw = w * (0.5 + r() * 0.15);
  const cd = d * (0.6 + r() * 0.2);
  parts.push([rbox(cw, hgt, cd, 0, hgt / 2, 0), r() < 0.5 ? 'facadeA' : 'facadeB', 0.08]);
  const finH = hgt * (0.5 + r() * 0.3);
  [-1, 1].forEach((s) => parts.push([box(0.5, finH, cd * 0.3, s * (cw / 2 + 0.25), hgt - finH / 2 - 1.5, cd * 0.32), 'dark', 0.25]));
  const sw = w * (1.25 + r() * 0.45);
  const st = 1.4 + r() * 1.2;
  const shift = (r() - 0.5) * w * 0.45;
  parts.push([rbox(sw, st, d, shift, hgt + st / 2, 0), 'light', 0.25]);
  [-0.42, -0.05, 0.38].forEach((k) => parts.push([box(0.6, 0.9, d * 0.96, shift + sw * k, hgt - 0.45, 0), 'dark', 0.25]));
  const crownW = sw * (0.35 + r() * 0.2);
  const crownH = 2 + r() * 3;
  parts.push([rbox(crownW, crownH, d * 0.75, shift + (r() < 0.5 ? -1 : 1) * sw * 0.22, hgt + st + crownH / 2, -d * 0.08), 'mid', 0.25]);
  if (r() < 0.75) {
    const ly = hgt * (0.28 + r() * 0.25);
    parts.push([rbox(w * (0.9 + r() * 0.3), 0.9, d * 1.15, (r() - 0.5) * w * 0.3, ly, d * 0.05), 'light', 0.25]);
  }
  const ph = 3 + r() * 2.5;
  parts.push([rbox(w * 1.25, ph, d * 1.2, 0, ph / 2, 0), 'mid', 0.25]);
  if (r() < 0.5) parts.push([box(w * 0.7, 1.2, d * 0.5, w * 0.35, ph + 0.6, d * 0.45), 'light', 0.25]);
  return parts;
}

// Long housing slab on pilotis with end stair cores
function slabParts(r, w, d, hgt) {
  const parts = [];
  const lift = r() < 0.5 ? 3.5 : 0;
  parts.push([rbox(w, hgt - lift, d, 0, lift + (hgt - lift) / 2, 0), r() < 0.5 ? 'panel' : 'facadeA', 0.07]);
  if (lift) {
    for (let x = -w / 2 + 2; x <= w / 2 - 2; x += 6) parts.push([box(0.9, lift, 0.9, x, lift / 2, 0), 'dark', 0.25]);
  }
  parts.push([box(w * 0.3, 2.4, d * 0.5, (r() - 0.5) * w * 0.4, hgt + 1.2, 0), 'mid', 0.25]);
  if (r() < 0.6) {
    [-1, 1].forEach((s) => parts.push([rbox(3, hgt + 2.5, 3.6, s * (w / 2 + 1.3), (hgt + 2.5) / 2, 0), 'dark', 0.25]));
  }
  return parts;
}

// Ziggurat: stacked blocks shrinking and shifting as they rise
function steppedParts(r, w, d, hgt) {
  const parts = [];
  const n = 3 + Math.floor(r() * 2);
  const sh = hgt / n;
  let y = 0;
  let cw = w;
  let cd = d;
  let ox = 0;
  for (let k = 0; k < n; k++) {
    parts.push([rbox(cw, sh, cd, ox, y + sh / 2, 0), k % 2 ? 'light' : 'facadeB', k % 2 ? 0.25 : 0.08]);
    y += sh;
    cw *= 0.72 + r() * 0.1;
    cd *= 0.78 + r() * 0.1;
    ox += (r() - 0.5) * cw * 0.3;
  }
  return parts;
}

// Low concrete block with a cantilevered upper storey
function lowParts(r, w, d, hgt) {
  const parts = [[rbox(w, hgt, d, 0, hgt / 2, 0), r() < 0.5 ? 'light' : 'mid', 0.25]];
  if (r() < 0.6) {
    const cw = w * (0.6 + r() * 0.5);
    const ch = 3 + r() * 4;
    const cd = d * (0.7 + r() * 0.4);
    parts.push([rbox(cw, ch, cd, (r() - 0.5) * w * 0.5, hgt + ch / 2, (r() - 0.5) * d * 0.4), 'facadeA', 0.08]);
  }
  return parts;
}

const KINDS = { tower: towerParts, slab: slabParts, stepped: steppedParts, low: lowParts };

// ── World ───────────────────────────────────────────────────────────────────

const GENERIC_ADS = [
  ['Betoni', 'Ready-mix concrete · since 1962'],
  ['Rengas', 'Gravel tyres for every stage'],
  ['Kahvi', 'Strong coffee · open 24h'],
  ['Rally 26', 'A new circuit every day'],
  ['Polttoaine 98', 'High octane · low drama'],
  ['Teräs', 'Structural steel works'],
  ['Drive fast', 'Stay brutal'],
  ['Radio 26', 'Noise for the city · 92.6 FM'],
  ['Sauna', 'Public sauna · next exit'],
  ['Asfaltti', 'Roads, ramps and runways'],
];
const AD_COLORS = [
  ['#1769e0', '#f7f6f2'],
  ['#111111', '#f7f6f2'],
  ['#ebe8e1', '#111111'],
  ['#ff6a3d', '#111111'],
];

export function buildWorld(track) {
  const r = rng(hashString(`city:${track.day}`));
  const { N, px, pz, nx, nz, tx, tz, h, hw, base, heading, zone } = track;
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
  const delayOf = (x, z) => Math.min(0.7, 0.12 + Math.hypot(x, z) / 420);

  // Materials
  const concreteMap = keep(makeConcreteTexture(91, 512));
  const mat = (o) => keep(new THREE.MeshStandardMaterial(o));
  const M = {
    light: mat({ map: concreteMap, color: '#e4e1da', roughness: 0.95 }),
    mid: mat({ map: concreteMap, color: '#cfccc4', roughness: 0.95 }),
    dark: mat({ map: concreteMap, color: '#a9a69e', roughness: 0.95 }),
    // emissiveIntensity is raised at night (see RallyWorld's weather)
    facadeA: mat({ map: keep(facadeTexture(5)), emissiveMap: keep(facadeGlow(5)), emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.9 }),
    facadeB: mat({ map: keep(facadeTexture(8, { rows: 5 })), emissiveMap: keep(facadeGlow(8, { rows: 5 })), emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.9 }),
    panel: mat({ map: keep(panelTexture(12)), emissiveMap: keep(panelGlow(12)), emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.92 }),
    steel: mat({ color: '#2c2c2b', metalness: 0.55, roughness: 0.5 }),
    struct: mat({ map: concreteMap, color: '#dad7cf', roughness: 0.95, side: THREE.DoubleSide }),
    lamp: keep(new THREE.MeshBasicMaterial({ color: '#fff4dc' })),
    hazard: mat({ map: keep(hazardTexture()), roughness: 0.7 }),
  };
  const poolMat = keep(
    new THREE.MeshBasicMaterial({
      map: keep(poolTexture()),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    })
  );
  const tmpMatrix = new THREE.Matrix4();
  const roadMap = keep(roadTexture());

  // Ground
  const groundMap = keep(groundTexture());
  groundMap.repeat.set(36, 36);
  const groundMat = keep(new THREE.MeshStandardMaterial({ map: groundMap, roughness: 1, transparent: true, opacity: 0 }));
  const ground = mesh(new THREE.PlaneGeometry(900, 900), groundMat, { cast: false });
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -40);
  group.add(ground);

  // ── Circuit (one riser so it rises as a piece) ──
  const circuit = new THREE.Group();
  const roadMat = mat({ map: roadMap, roughness: 0.88 });
  circuit.add(mesh(ribbon(track, (k) => -hw[k], (k) => hw[k], (k) => h[k] + 0.02, 16), roadMat, { cast: false }));

  const curbMat = mat({ map: keep(stripeTexture('#1769e0', '#f2efe8')), roughness: 0.7 });
  const corner = (i) => track.curv[i] > 0.018;
  circuit.add(mesh(ribbon(track, (k) => hw[k] - 1.1, (k) => hw[k] - 0.05, (k) => h[k] + 0.05, 4, corner), curbMat, { cast: false }));
  circuit.add(mesh(ribbon(track, (k) => -hw[k] + 0.05, (k) => -hw[k] + 1.1, (k) => h[k] + 0.05, 4, corner), curbMat, { cast: false }));

  const barrierMat = mat({ map: concreteMap, color: '#efece6', roughness: 0.92, side: THREE.DoubleSide });
  circuit.add(mesh(barrier(track, 1), barrierMat));
  circuit.add(mesh(barrier(track, -1), barrierMat));

  // Viaducts: deck underside, columns wherever the deck is off the ground,
  // hammerhead piers where it is high
  const raised = (i) => base[i] > 0.05 || base[(i + 1) % N] > 0.05;
  circuit.add(mesh(ribbon(track, (k) => -hw[k] - 0.62, (k) => hw[k] + 0.62, (k) => base[k], 8, raised), M.struct));
  const piers = [];
  for (let i = 0; i < N; i += 1) {
    if (base[i] < 0.3 || i % 12 !== 0 || zone[i] === ZONE.tunnel) continue;
    const top = base[i];
    const high = top >= 2.4;
    const colH = high ? top - 1.1 : top;
    const g = box(1.8, colH, 2.6, 0, colH / 2, 0);
    piers.push(projectUVs(g, 0.25, r).applyMatrix4(placeMatrix(px[i], 0, pz[i], heading[i])));
    if (high) {
      const cap = box(2 * hw[i] + 0.6, 1.1, 2.2, 0, top - 0.55, 0);
      piers.push(projectUVs(cap, 0.25, r).applyMatrix4(placeMatrix(px[i], 0, pz[i], heading[i])));
    }
  }
  if (piers.length) circuit.add(mesh(mergeGeometries(piers), M.mid));
  piers.forEach((g) => g.dispose());

  // Start line + grid boxes
  const lineMat = mat({ map: keep(checkerTexture()), roughness: 0.8 });
  const line = mesh(new THREE.PlaneGeometry(hw[0] * 2, 2), lineMat, { cast: false });
  line.rotation.order = 'YXZ';
  line.rotation.set(-Math.PI / 2, heading[0], 0);
  line.position.set(px[0], h[0] + 0.04, pz[0]);
  circuit.add(line);
  const white = mat({ color: '#ece9e2', roughness: 0.8 });
  GRID.forEach(({ back, lateral }) => {
    const i = (N - back) % N;
    const b = mesh(new THREE.PlaneGeometry(2.4, 0.35), white, { cast: false });
    b.rotation.order = 'YXZ';
    b.rotation.set(-Math.PI / 2, heading[i], 0);
    b.position.set(px[i] + nx[i] * lateral - tx[i] * 2.4, h[i] + 0.04, pz[i] + nz[i] * lateral - tz[i] * 2.4);
    circuit.add(b);
  });

  // Start gantry with countdown lights
  const gantry = new THREE.Group();
  const span = hw[0] + 1.6;
  [-1, 1].forEach((s) => {
    const post = mesh(new THREE.BoxGeometry(0.4, 7.2, 0.4), M.steel);
    post.position.set(s * span, 3.6, 0);
    gantry.add(post);
  });
  const beam = mesh(new THREE.BoxGeometry(span * 2 + 0.4, 1.3, 0.5), M.steel);
  beam.position.set(0, 6.8, 0);
  gantry.add(beam);
  const bannerMat = mat({ map: keep(bannerTexture()), roughness: 0.7 });
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
    const m = mat({ color: '#1a1a1a', emissive: '#000', roughness: 0.4 });
    [1, -1].forEach((s) => {
      const l = new THREE.Mesh(lightGeo, m);
      l.position.set((k - 1) * 1.1, 5.7, s * 0.2);
      gantry.add(l);
    });
    lights.push(m);
  }
  gantry.position.set(px[0], h[0], pz[0]);
  gantry.rotation.y = heading[0];
  circuit.add(gantry);

  // ── Tunnels: a concrete megastructure the road runs through ──
  const TH = TUNNEL_HEIGHT;
  const inTunnel = (i) => zone[i] === ZONE.tunnel && zone[(i + 1) % N] === ZONE.tunnel;
  const tunnelBlocks = [];
  if (track.tunnels.length) {
    const inner = (s) => (k) => s * (hw[k] + 0.7);
    const outer = (s) => (k) => s * (hw[k] + 2.4);
    [-1, 1].forEach((s) => {
      circuit.add(mesh(wall(track, inner(s), (k) => base[k], (k) => h[k] + TH, 4, inTunnel), M.struct));
      circuit.add(mesh(wall(track, outer(s), 0, (k) => h[k] + TH + 1.4, 4, inTunnel), M.struct));
    });
    circuit.add(mesh(ribbon(track, inner(-1), inner(1), (k) => h[k] + TH, 6, inTunnel), M.struct));
    circuit.add(mesh(ribbon(track, outer(-1), outer(1), (k) => h[k] + TH + 1.4, 6, inTunnel), M.struct));
    // ceiling light strips
    const dashMat = keep(new THREE.MeshBasicMaterial({ map: keep(dashTexture()), side: THREE.DoubleSide }));
    [-1, 1].forEach((s) => {
      circuit.add(mesh(ribbon(track, s * 2.4, s * 2.0, (k) => h[k] + TH - 0.04, 5, inTunnel), dashMat, { cast: false }));
    });
    track.tunnels.forEach(({ a, len }) => {
      [a, (a + len - 1) % N].forEach((i, end) => {
        const portal = new THREE.Group();
        const w = 2 * (hw[i] + 2.6);
        const lintel = mesh(new THREE.BoxGeometry(w, 2.4, 1.4), M.mid);
        lintel.position.set(0, TH + 0.6, 0);
        portal.add(lintel);
        const stripe = mesh(new THREE.PlaneGeometry(w - 1, 0.7), M.hazard, { cast: false });
        stripe.position.set(0, TH + 0.4, end ? 0.71 : -0.71);
        if (!end) stripe.rotation.y = Math.PI;
        portal.add(stripe);
        [-1, 1].forEach((s) => {
          const pier = mesh(new THREE.BoxGeometry(2.0, TH + 1.8 + h[i], 1.6), M.dark);
          pier.position.set(s * (hw[i] + 1.6), (TH + 1.8 - h[i]) / 2, 0);
          portal.add(pier);
        });
        portal.position.set(px[i], h[i], pz[i]);
        portal.rotation.y = heading[i];
        circuit.add(portal);
      });
      // Blocks sitting on the roof
      for (let f = 0.15; f < 0.95; f += 0.28 + r() * 0.1) {
        const i = (a + Math.floor(len * f)) % N;
        tunnelBlocks.push({ i, w: 2 * (hw[i] + 2.4) + 2 + r() * 8, d: 12 + r() * 10, hgt: 8 + r() * 26, y: h[i] + TH + 1.4 });
      }
    });
  }

  // ── Street lamps on the barriers (instanced) ──
  const lampSpots = [];
  for (let i = 8; i < N - 8; i += 13) {
    if (zone[i] === ZONE.tunnel) continue;
    const narrow = zone[i] === ZONE.narrow;
    if (!narrow && i % 26 !== 8) continue;
    const sides = narrow ? [1, -1] : [(i / 26) % 2 < 1 ? 1 : -1];
    sides.forEach((s) => lampSpots.push({ i, s }));
  }
  if (lampSpots.length) {
    const poleGeo = keep(new THREE.BoxGeometry(0.18, 7, 0.18).translate(0, 3.5, 0));
    const armGeo = keep(new THREE.BoxGeometry(2.4, 0.12, 0.16).translate(-1.1, 7, 0));
    const headGeo = keep(new THREE.BoxGeometry(0.9, 0.14, 0.36).translate(-2.0, 6.92, 0));
    const poles = new THREE.InstancedMesh(poleGeo, M.steel, lampSpots.length);
    const arms = new THREE.InstancedMesh(armGeo, M.steel, lampSpots.length);
    const heads = new THREE.InstancedMesh(headGeo, M.lamp, lampSpots.length);
    lampSpots.forEach(({ i, s }, n) => {
      const off = s * (hw[i] + 0.31);
      // local +x points away from the road, so the arm (local -x) hangs over it
      const m = placeMatrix(px[i] + nx[i] * off, h[i] + 0.92, pz[i] + nz[i] * off, Math.atan2(-nz[i] * s, nx[i] * s));
      poles.setMatrixAt(n, m);
      arms.setMatrixAt(n, m);
      heads.setMatrixAt(n, m);
    });
    [poles, arms].forEach((im) => {
      im.castShadow = true;
      circuit.add(im);
    });
    circuit.add(heads);
    // Light pools on the road under the heads, shown at night
    const poolGeo = keep(new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2).translate(-3.2, -0.86, 0));
    const pools = new THREE.InstancedMesh(poolGeo, poolMat, lampSpots.length);
    lampSpots.forEach((_, n) => {
      heads.getMatrixAt(n, tmpMatrix);
      pools.setMatrixAt(n, tmpMatrix);
    });
    pools.renderOrder = 2;
    circuit.add(pools);
  }

  // ── Overhead direction signs ──
  const signSpots = [];
  if (track.tunnels.length) signSpots.push({ i: (track.tunnels[0].a - 45 + N) % N, lines: ['TUNNELI', 'Tunnel 300 m'], arrow: false });
  {
    let best = -1;
    let bh = -1;
    for (let i = 60; i < N - 60; i++) {
      if (zone[i] !== ZONE.open || Math.abs(i - track.jump) < 50) continue;
      if (signSpots.some((s) => Math.abs(s.i - i) < 80)) continue;
      if (h[i] > bh) {
        bh = h[i];
        best = i;
      }
    }
    if (best >= 0) signSpots.push({ i: best, lines: ['KESKUSTA', 'Centrum · Ring II'], arrow: true });
  }
  signSpots.forEach(({ i, lines, arrow }) => {
    const g = new THREE.Group();
    const w = hw[i] + 1.2;
    [-1, 1].forEach((s) => {
      const post = mesh(new THREE.BoxGeometry(0.35, 7.6, 0.35), M.steel);
      post.position.set(s * w, 3.8 - 0.92, 0);
      g.add(post);
    });
    const truss = mesh(new THREE.BoxGeometry(2 * w + 0.4, 0.6, 0.6), M.steel);
    truss.position.set(0, 6.4, 0);
    g.add(truss);
    const signMat = mat({ map: keep(roadSignTexture(lines, arrow)), roughness: 0.55 });
    const panel = mesh(new THREE.BoxGeometry(7.2, 3, 0.15), [M.steel, M.steel, M.steel, M.steel, M.steel, signMat]);
    panel.position.set(-hw[i] * 0.35, 6.9, -0.4);
    g.add(panel);
    g.position.set(px[i], h[i] + 0.92, pz[i]);
    g.rotation.y = heading[i];
    circuit.add(g);
  });
  addRiser(circuit, 0.18);

  // ── Obstacle bookkeeping for everything placed off the road ──
  const placed = [];
  const segments = [];
  // Distance from (x, z) to the nearest road edge (negative = on the road)
  const edgeDist = (x, z) => {
    let best = Infinity;
    for (let i = 0; i < N; i += 2) {
      const d = Math.hypot(px[i] - x, pz[i] - z) - hw[i];
      if (d < best) best = d;
    }
    return best;
  };
  const segDist = (x, z, s) => {
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(s.ax + dx * t - x, s.az + dz * t - z);
  };
  const reserved = (x, z, rad) =>
    (Math.abs(x) < 16 + rad && z > -14 - rad && z < 10 + rad) || // hero tower
    Math.hypot(x - 40, z - 64) < 34 + rad; // keep the intro camera view clear
  const free = (x, z, rad, edge = 6) =>
    !reserved(x, z, rad) &&
    edgeDist(x, z) > edge + rad &&
    !placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.rad + rad + 3) &&
    !segments.some((s) => segDist(x, z, s) < s.half + rad + 2);

  // ── Billboards (generic ads) ──
  const postGeo = keep(new THREE.BoxGeometry(0.3, 4.2, 0.3));
  const boardGeo = keep(new THREE.BoxGeometry(10, 3.3, 0.25));
  const spots = 9;
  for (let k = 0; k < spots; k++) {
    const i = Math.floor(((k + 0.35) / spots) * N);
    if (track.curv[i] > 0.03 || Math.abs(i - track.jump) < 40 || zone[i] !== ZONE.open || base[i] > 0.5) continue;
    const side = k % 2 ? 1 : -1;
    const off = side * (hw[i] + 4.5);
    const x = px[i] + nx[i] * off;
    const z = pz[i] + nz[i] * off;
    if (reserved(x, z, 5)) continue;
    const [title, sub] = GENERIC_ADS[(k + hashString(track.day)) % GENERIC_ADS.length];
    const [bg, fg] = AD_COLORS[k % AD_COLORS.length];
    const faceMat = mat({ map: keep(billboardTexture(title, sub, bg, fg)), roughness: 0.6 });
    const board = new THREE.Group();
    const panel = mesh(boardGeo, [M.steel, M.steel, M.steel, M.steel, faceMat, M.steel]);
    panel.position.y = 4.6;
    board.add(panel);
    [-3.6, 3.6].forEach((px_) => {
      const post = mesh(postGeo, M.steel);
      post.position.set(px_, 2.1, -0.1);
      board.add(post);
    });
    board.position.set(x, 0, z);
    board.rotation.y = Math.atan2(-nx[i] * side, -nz[i] * side);
    placed.push({ x, z, rad: 5.5 });
    addRiser(board, 0.1 + r() * 0.2);
  }

  // Chevron boards on the outside of the tighter corners
  const chevGeo = keep(new THREE.BoxGeometry(1.4, 1.75, 0.12));
  const chevMats = {
    1: mat({ map: keep(chevronTexture(1)), roughness: 0.6 }),
    '-1': mat({ map: keep(chevronTexture(-1)), roughness: 0.6 }),
  };
  let lastApex = -100;
  for (let i = 0; i < N; i++) {
    const c = track.curv[i];
    if (c < 0.035 || i - lastApex < 30 || zone[i] === ZONE.tunnel) continue;
    if (c < track.curv[(i + 1) % N] || c < track.curv[(i - 1 + N) % N]) continue;
    lastApex = i;
    const turnLeft = track.turn[i] > 0;
    const outer = turnLeft ? 1 : -1;
    for (let k = -2; k <= 2; k++) {
      const j = (i + k * 5 + N) % N;
      if (zone[j] === ZONE.tunnel) continue;
      const off = outer * (hw[j] + 0.31);
      const sign = new THREE.Group();
      const board = mesh(chevGeo, [M.steel, M.steel, M.steel, M.steel, chevMats[turnLeft ? -1 : 1], M.steel]);
      board.position.y = 0.92 + 0.95;
      sign.add(board);
      sign.position.set(px[j] + nx[j] * off, h[j], pz[j] + nz[j] * off);
      sign.rotation.y = Math.atan2(-nx[j] * outer, -nz[j] * outer);
      addRiser(sign, 0.15);
    }
  }

  // ── Motorways: long straight viaducts crossing over the circuit ──
  const batch = new Batch();
  const motorwayMat = mat({ map: keep(motorwayTexture()), roughness: 0.9 });
  const mwCandidates = [];
  for (let i = 0; i < N; i += 3) {
    if (zone[i] !== ZONE.open || track.curv[i] > 0.03) continue;
    if (Math.min(i, N - i) < 40 || Math.abs(i - track.jump) < 45) continue;
    mwCandidates.push(i);
  }
  const motorways = [];
  for (let attempt = 0; attempt < 40 && motorways.length < 2 && mwCandidates.length; attempt++) {
    const i = mwCandidates[Math.floor(r() * mwCandidates.length)];
    if (motorways.some((m) => Math.min(Math.abs(m.i - i), N - Math.abs(m.i - i)) < N / 4)) continue;
    const ang = heading[i] + Math.PI / 2 + (r() - 0.5) * 0.7;
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    // Extend each way until something is in the way (or 230 m)
    const reach = (dir) => {
      let t = 0;
      for (; t < 230; t += 4) {
        const x = px[i] + dx * t * dir;
        const z = pz[i] + dz * t * dir;
        if (reserved(x, z, 9)) break;
        let blocked = false;
        for (let k = 0; k < N; k += 2) {
          if (zone[k] === ZONE.tunnel && Math.hypot(px[k] - x, pz[k] - z) < hw[k] + 22) blocked = true;
          if (k < 14 || k > N - 14) if (Math.hypot(px[k] - x, pz[k] - z) < 16) blocked = true; // start gantry
        }
        if (blocked) break;
      }
      return t;
    };
    const t1 = reach(1);
    const t0 = reach(-1);
    if (t0 < 30 || t1 < 30) continue;
    // Deck height clears every part of the circuit it passes over
    let top = 0;
    for (let k = 0; k < N; k++) {
      const seg = { ax: px[i] - dx * t0, az: pz[i] - dz * t0, bx: px[i] + dx * t1, bz: pz[i] + dz * t1 };
      if (segDist(px[k], pz[k], seg) < hw[k] + 9) top = Math.max(top, h[k]);
    }
    const Y = top + 8.6;
    motorways.push({ i, ang, dx, dz, t0, t1, Y });
    segments.push({ ax: px[i] - dx * t0, az: pz[i] - dz * t0, bx: px[i] + dx * t1, bz: pz[i] + dz * t1, half: 9 });
  }
  motorways.forEach(({ i, ang, dx, dz, t0, t1, Y }) => {
    const len = t0 + t1;
    const cx = px[i] + (dx * (t1 - t0)) / 2;
    const cz = pz[i] + (dz * (t1 - t0)) / 2;
    const mw = new THREE.Group();
    const deck = mesh(projectUVs(new THREE.BoxGeometry(15, 1.4, len), 0.25, r), M.mid);
    deck.position.y = Y - 0.7;
    mw.add(deck);
    const surf = new THREE.PlaneGeometry(14, len);
    const uv = surf.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setY(k, uv.getY(k) * (len / 14));
    const top = mesh(surf, motorwayMat, { cast: false });
    top.rotation.x = -Math.PI / 2;
    top.position.y = Y + 0.01;
    mw.add(top);
    [-1, 1].forEach((s) => {
      const parapet = mesh(new THREE.BoxGeometry(0.5, 1.2, len), M.light);
      parapet.position.set(s * 7.25, Y + 0.6, 0);
      mw.add(parapet);
    });
    // Static traffic
    const carMats = ['#f2efe8', '#111111', '#1769e0', '#ff6a3d', '#6b6a64'].map((c) => mat({ color: c, roughness: 0.5 }));
    for (let k = 0; k < Math.floor(len / 26); k++) {
      const truck = r() < 0.3;
      const v = mesh(new THREE.BoxGeometry(2, truck ? 3 : 1.5, truck ? 10 : 4.3), carMats[Math.floor(r() * carMats.length)]);
      v.position.set((r() < 0.5 ? -1 : 1) * (r() < 0.5 ? 2.1 : 5.2), Y + (truck ? 1.5 : 0.75), -len / 2 + 8 + r() * (len - 16));
      mw.add(v);
    }
    mw.position.set(cx, 0, cz);
    mw.rotation.y = ang;
    addRiser(mw, 0.3);
    // Piers about every 20 m, nudged along the deck to dodge the circuit,
    // and always one right at each end so nothing hangs in the air
    const pierAt = (t) => {
      const x = px[i] + dx * t;
      const z = pz[i] + dz * t;
      const colH = Y - 2.6;
      const parts = [box(2.4, colH, 3.2, 0, colH / 2, 0), box(13, 1.2, 2.8, 0, Y - 2.0, 0)];
      parts.forEach((g) => batch.add(projectUVs(g, 0.25, r), M.mid, placeMatrix(x, 0, z, ang), x, z));
    };
    const clear = (t) => edgeDist(px[i] + dx * t, pz[i] + dz * t) > 3 && !reserved(px[i] + dx * t, pz[i] + dz * t, 2);
    const ends = [-t0 + 2, t1 - 2];
    ends.forEach((t, k) => {
      for (let d = 0; d < 14; d += 2) {
        const tt = t + (k ? -d : d);
        if (clear(tt)) {
          pierAt(tt);
          ends[k] = tt;
          break;
        }
      }
    });
    for (let t = ends[0] + 20; t < ends[1] - 10; t += 20) {
      const tt = [0, 4, -4, 8, -8].map((o) => t + o).find(clear);
      if (tt !== undefined) pierAt(tt);
    }
  });

  // ── Footbridges over the narrow streets ──
  track.narrows.forEach(({ a, len }) => {
    const i = (a + Math.floor(len * (0.35 + r() * 0.3))) % N;
    const w = 2 * (hw[i] + 3.2);
    const fb = new THREE.Group();
    const deck = mesh(new THREE.BoxGeometry(w, 0.55, 2.6), M.light);
    deck.position.y = 5.8;
    fb.add(deck);
    [-1.2, 1.2].forEach((z) => {
      const rail = mesh(new THREE.BoxGeometry(w, 1.0, 0.12), M.mid);
      rail.position.set(0, 6.55, z);
      fb.add(rail);
    });
    // Stair towers at both ends carry it down to the ground
    [-1, 1].forEach((side) => {
      const towerH = 5.8 + 0.3 + h[i];
      const tower = mesh(new THREE.BoxGeometry(3.2, towerH, 3.6), M.mid);
      tower.position.set(side * (hw[i] + 3.2), 6.1 - towerH / 2, 0);
      fb.add(tower);
    });
    fb.position.set(px[i], h[i], pz[i]);
    fb.rotation.y = heading[i];
    circuit.add(fb);
  });

  // ── City ──
  const addBuilding = (kind, x, z, yaw, w, d, hgt, y = 0) => {
    const parts = KINDS[kind](r, w, d, hgt);
    const m = placeMatrix(x, y, z, yaw).clone();
    parts.forEach(([g, key, scale]) => batch.add(projectUVs(g, scale, r), M[key], m, x, z));
  };

  // Blocks on the tunnel roof
  tunnelBlocks.forEach(({ i, w, d, hgt, y }) => {
    addBuilding(r() < 0.5 ? 'slab' : 'stepped', px[i], pz[i], heading[i], w, d, hgt, y);
    placed.push({ x: px[i], z: pz[i], rad: Math.hypot(w, d) / 2 });
  });

  // Street frontage along the narrow zones: tall blocks right behind the barriers
  track.narrows.forEach(({ a, len }) => {
    [-1, 1].forEach((s) => {
      let k = -8;
      while (k < len + 8) {
        const along = 9 + r() * 9;
        const depth = 10 + r() * 6;
        const i = (a + k + Math.round(along / 2) + N) % N;
        const off = s * (hw[i] + 2.4 + depth / 2);
        const x = px[i] + nx[i] * off;
        const z = pz[i] + nz[i] * off;
        const rad = Math.hypot(along, depth) / 2;
        // all four corners must stay off the road
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => [
          x + tx[i] * (u * along) / 2 + nx[i] * (v * depth) / 2,
          z + tz[i] * (u * along) / 2 + nz[i] * (v * depth) / 2,
        ]);
        const ok =
          !reserved(x, z, rad) &&
          corners.every(([cx, cz]) => edgeDist(cx, cz) > 1.6) &&
          !placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.rad * 0.7 + rad * 0.7) &&
          !segments.some((sg) => segDist(x, z, sg) < sg.half + rad);
        if (ok) {
          const hgt = 12 + r() * 26;
          addBuilding(r() < 0.6 ? 'slab' : 'tower', x, z, heading[i], depth, along - 1, hgt);
          placed.push({ x, z, rad: rad * 0.8 });
        }
        k += Math.round(along + 0.5 + r() * 1.5);
      }
    });
  });

  // Everything else: a dense brutalist city out to the fog
  let tries = 0;
  let count = 0;
  while (count < 170 && tries < 6000) {
    tries++;
    const x = -270 + r() * 540;
    const z = -340 + r() * 480;
    const roll = r();
    const kind = roll < 0.25 ? 'tower' : roll < 0.55 ? 'slab' : roll < 0.7 ? 'stepped' : 'low';
    const dims = {
      tower: [9 + r() * 6, 9 + r() * 6, 24 + r() * 34],
      slab: [24 + r() * 26, 9 + r() * 5, 12 + r() * 16],
      stepped: [16 + r() * 12, 14 + r() * 10, 14 + r() * 18],
      low: [12 + r() * 16, 9 + r() * 12, 5 + r() * 10],
    }[kind];
    const [w, d, hgt] = dims;
    const rad = Math.hypot(w, d) / 2 + (kind === 'tower' ? 4 : 1);
    // Taller blocks further from the road, low ones can come close
    const edge = kind === 'low' ? 4 : 7;
    if (!free(x, z, rad, edge)) continue;
    placed.push({ x, z, rad });
    addBuilding(kind, x, z, Math.floor(r() * 4) * (Math.PI / 2) + (r() - 0.5) * 0.25, w, d, hgt);
    count++;
  }

  batch.build(keep, addRiser, delayOf);

  return {
    group,
    risers,
    ground,
    groundMat,
    lights,
    // Weather hooks: window glow and lamp pools (RallyWorld sets them)
    night: { windows: [M.facadeA, M.facadeB, M.panel], lamp: M.lamp, pools: poolMat },
    dispose() {
      disposables.forEach((x) => x.dispose?.());
    },
  };
}
