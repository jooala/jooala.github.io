// Procedural assets for the hero scene: concrete textures, decals and the
// rally car. Everything is generated at runtime, so no model files to load.
import * as THREE from 'three';

export function rng(seed = 1) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

// ── Concrete ────────────────────────────────────────────────────────────────
// Board-formed concrete: mottled tone, plank bands, tie holes, water streaks,
// pits and grain. Drawn with wrap-around so it tiles seamlessly.
export function makeConcreteTexture(seed = 11, size = 1024) {
  const r = rng(seed);
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#a9a7a1';
  ctx.fillRect(0, 0, size, size);

  const wrap = (x, y, rad, draw) => {
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        const px = x + dx;
        const py = y + dy;
        if (px + rad < 0 || px - rad > size || py + rad < 0 || py - rad > size) continue;
        draw(px, py);
      }
    }
  };

  // Large mottling
  for (let i = 0; i < 420; i++) {
    const x = r() * size;
    const y = r() * size;
    const rad = 30 + r() * 160;
    const l = Math.round(115 + r() * 90);
    const a = 0.05 + r() * 0.07;
    wrap(x, y, rad, (px, py) => {
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, `rgba(${l},${l},${l - 5},${a})`);
      g.addColorStop(1, `rgba(${l},${l},${l - 5},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    });
  }

  // Board-form plank bands
  const band = size / 8;
  for (let y = 0; y < size; y += band) {
    const l = r() < 0.5 ? 0 : 255;
    ctx.fillStyle = `rgba(${l},${l},${l},${0.025 + r() * 0.045})`;
    ctx.fillRect(0, y, size, band);
    ctx.fillStyle = 'rgba(35,35,33,0.22)';
    ctx.fillRect(0, y, size, 1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, y + 1.5, size, 1);
    // plank wood-grain streaks
    for (let k = 0; k < 14; k++) {
      const yy = y + r() * band;
      ctx.fillStyle = `rgba(60,60,58,${0.025 + r() * 0.04})`;
      ctx.fillRect(r() * size, yy, 40 + r() * 260, 1);
    }
  }

  // Tie holes on the formwork grid
  for (let y = band / 2; y < size; y += band * 2) {
    for (let x = size / 8; x < size; x += size / 4) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 1.5, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(28,28,26,0.62)';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Water staining: dark vertical streaks running down
  for (let i = 0; i < 70; i++) {
    const x = r() * size;
    const w = 3 + r() * 26;
    const y0 = r() * size;
    const len = 80 + r() * 420;
    const a = 0.05 + r() * 0.12;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0]) {
        const g = ctx.createLinearGradient(0, y0 + dy, 0, y0 + dy + len);
        g.addColorStop(0, `rgba(40,40,36,${a})`);
        g.addColorStop(1, 'rgba(40,40,36,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + dx, y0 + dy, w, len);
      }
    }
  }

  // Grain
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 30;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  // Air pockets / pits
  for (let i = 0; i < 4200; i++) {
    const x = r() * size;
    const y = r() * size;
    ctx.fillStyle = `rgba(22,22,20,${0.2 + r() * 0.45})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + r() * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Box-projected UVs in object space so texel density is the same on every
// face of every block, regardless of size. Random offset per block.
export function projectUVs(geometry, scale, r) {
  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const ou = r();
  const ov = r();
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i));
    const ay = Math.abs(nor.getY(i));
    const az = Math.abs(nor.getZ(i));
    let u;
    let v;
    if (ax >= ay && ax >= az) {
      u = pos.getZ(i);
      v = pos.getY(i);
    } else if (ay >= az) {
      u = pos.getX(i);
      v = pos.getZ(i);
    } else {
      u = pos.getX(i);
      v = pos.getY(i);
    }
    uv[i * 2] = u * scale + ou;
    uv[i * 2 + 1] = v * scale + ov;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

// Broken concrete chunk
export function rubbleGeometry(r, size) {
  const g = new THREE.IcosahedronGeometry(1, 0);
  const pos = g.attributes.position;
  const sx = size * (0.8 + r() * 0.6);
  const sy = size * (0.45 + r() * 0.4);
  const sz = size * (0.8 + r() * 0.6);
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) * sx * (0.8 + r() * 0.35),
      pos.getY(i) * sy * (0.8 + r() * 0.35),
      pos.getZ(i) * sz * (0.8 + r() * 0.35)
    );
  }
  const flat = g.toNonIndexed();
  flat.computeVertexNormals();
  return projectUVs(flat, 0.5, r);
}

// ── Sign ────────────────────────────────────────────────────────────────────
export function makeSignTexture() {
  const [c, ctx] = canvas(256, 320);
  ctx.fillStyle = '#ff6a3d';
  ctx.fillRect(0, 0, 256, 320);
  // weathering
  const r = rng(5);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(90,30,10,${r() * 0.12})`;
    ctx.fillRect(r() * 256, r() * 320, 1 + r() * 3, 1 + r() * 3);
  }
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 26;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(62, 92);
  ctx.lineTo(178, 208);
  ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.moveTo(204, 112);
  ctx.lineTo(204, 234);
  ctx.lineTo(82, 234);
  ctx.closePath();
  ctx.fill();
  // bolts
  ctx.fillStyle = '#3a2a22';
  [[18, 18], [238, 18], [18, 302], [238, 302]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── Rally car ───────────────────────────────────────────────────────────────
// Boxy 80s rally hatchback, modelled from extruded side profiles.
// Units: metres; front at x = 0, rear at x = 4.0, ground at y = 0.

const L = 4.0;
const W = 1.72;
const WC = 1.46; // cabin width (tumblehome)
const BODY_PTS = [
  [0.04, 0.26], [0.0, 0.58], [0.12, 0.73], [1.3, 0.85], [3.95, 0.87], [4.02, 0.8], [4.0, 0.26],
];
const ARCHES = [3.22, 0.78]; // rear, front wheel centres (x)
const ARCH_Y = 0.32;
const ARCH_R = 0.44;
const ARCH_A = Math.asin((0.26 - ARCH_Y) / ARCH_R);

function bodyPath(target) {
  target.moveTo(...BODY_PTS[0]);
  BODY_PTS.slice(1).forEach((p) => target.lineTo(...p));
  ARCHES.forEach((cx) => {
    target.lineTo(cx + ARCH_R * Math.cos(ARCH_A), 0.26);
    target.absarc(cx, ARCH_Y, ARCH_R, ARCH_A, Math.PI - ARCH_A, false);
  });
  target.lineTo(...BODY_PTS[0]);
}

function makeLiveryTexture({ stripe, accent, number, name }) {
  // Covers the body side from x 0.02→3.98 and y 0.26→0.88
  const PX = 420; // pixels per metre
  const x0 = 0.02;
  const y1 = 0.88;
  const w = Math.round(3.96 * PX);
  const h = Math.round(0.62 * PX);
  const [c, ctx] = canvas(w, h);
  const X = (x) => (x - x0) * PX;
  const Y = (y) => (y1 - y) * PX;

  // Clip to the body silhouette (inset so decals never overhang)
  ctx.save();
  ctx.beginPath();
  const proxy = {
    moveTo: (x, y) => ctx.moveTo(X(x), Y(y)),
    lineTo: (x, y) => ctx.lineTo(X(x), Y(y)),
    absarc: (cx, cy, rad, a0, a1) => ctx.arc(X(cx), Y(cy), rad * PX, -a0, -a1, true),
  };
  bodyPath(proxy);
  ctx.closePath();
  ctx.clip();

  // Blue band + orange pinstripe
  ctx.fillStyle = stripe;
  ctx.fillRect(0, Y(0.81), w, (0.81 - 0.655) * PX);
  ctx.fillStyle = accent;
  ctx.fillRect(0, Y(0.635), w, 0.028 * PX);
  // Black sill
  ctx.fillStyle = '#151515';
  ctx.fillRect(0, Y(0.335), w, 0.1 * PX);

  // Driver name in the band
  ctx.fillStyle = '#f4f2ec';
  ctx.font = `700 ${Math.round(0.07 * PX)}px "Arial Narrow", Arial, sans-serif`;
  ctx.textBaseline = 'middle';
  if (name) ctx.fillText(name, X(2.72), Y(0.733));

  // Number roundel on the door
  const cx = X(1.98);
  const cy = Y(0.47);
  ctx.fillStyle = '#f7f6f2';
  ctx.beginPath();
  ctx.arc(cx, cy, 0.155 * PX, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 0.014 * PX;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.font = `900 ${Math.round(0.19 * PX)}px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(number, cx, cy + 0.008 * PX);

  // Rally dirt: road grime rising from the sills
  const r = rng(3);
  const g = ctx.createLinearGradient(0, Y(0.26), 0, Y(0.55));
  g.addColorStop(0, 'rgba(92,80,66,0.55)');
  g.addColorStop(1, 'rgba(92,80,66,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, Y(0.55), w, (0.55 - 0.26) * PX);
  for (let i = 0; i < 2600; i++) {
    const yy = 0.26 + Math.pow(r(), 2.2) * 0.42;
    ctx.fillStyle = `rgba(80,68,54,${0.12 + r() * 0.35})`;
    ctx.beginPath();
    ctx.arc(r() * w, Y(yy), 0.6 + r() * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeRimTexture() {
  const [c, ctx] = canvas(128);
  ctx.fillStyle = '#efede7';
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a2a';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(64 + Math.cos(a) * 36, 64 + Math.sin(a) * 36, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#c9c7c1';
  ctx.beginPath();
  ctx.arc(64, 64, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(64, 64, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const CAR_DEFAULTS = {
  body: '#ebe8e0',
  stripe: '#1769e0',
  accent: '#ff6a3d',
  number: '26',
  name: 'J. ALANENPÄÄ',
};

export function buildCar(options = {}) {
  const opts = { ...CAR_DEFAULTS, ...options };
  const car = new THREE.Group();
  const wheels = [];
  const add = (geo, mat, pos = [0, 0, 0], rot = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.castShadow = true;
    m.receiveShadow = true;
    car.add(m);
    return m;
  };

  const paint = new THREE.MeshPhysicalMaterial({ color: opts.body, roughness: 0.42, clearcoat: 0.9, clearcoatRoughness: 0.22 });
  const dark = new THREE.MeshStandardMaterial({ color: '#191919', roughness: 0.62 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#14171b', roughness: 0.06, metalness: 0.2, clearcoat: 1 });
  const blue = new THREE.MeshPhysicalMaterial({ color: opts.stripe, roughness: 0.4, clearcoat: 0.8 });
  const orange = new THREE.MeshStandardMaterial({ color: opts.accent, roughness: 0.7 });
  const tire = new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.92 });
  const lamp = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#fff1c8', emissiveIntensity: 0.55, roughness: 0.2 });
  const red = new THREE.MeshStandardMaterial({ color: '#b3231a', emissive: '#6d0d06', emissiveIntensity: 0.4, roughness: 0.3 });
  const rim = new THREE.MeshStandardMaterial({ map: makeRimTexture(), transparent: true, roughness: 0.4, metalness: 0.25 });
  const livery = new THREE.MeshPhysicalMaterial({
    map: makeLiveryTexture(opts),
    transparent: true,
    roughness: 0.42,
    clearcoat: 0.9,
    clearcoatRoughness: 0.22,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });

  // Lower body
  const bodyShape = new THREE.Shape();
  bodyPath(bodyShape);
  const bt = 0.07;
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: W - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: 0.05, bevelSegments: 4, curveSegments: 24,
  });
  bodyGeo.translate(0, 0, -(W - 2 * bt) / 2);
  add(bodyGeo, paint);

  // Cabin
  const cab = new THREE.Shape();
  cab.moveTo(1.3, 0.84);
  cab.lineTo(1.98, 1.36);
  cab.lineTo(3.28, 1.38);
  cab.lineTo(3.9, 1.02);
  cab.lineTo(3.93, 0.84);
  cab.lineTo(1.3, 0.84);
  const ct = 0.06;
  const cabGeo = new THREE.ExtrudeGeometry(cab, {
    depth: WC - 2 * ct, bevelEnabled: true, bevelThickness: ct, bevelSize: 0.045, bevelSegments: 4, curveSegments: 8,
  });
  cabGeo.translate(0, 0, -(WC - 2 * ct) / 2);
  add(cabGeo, paint);

  // Side glass: one slab through the cabin, slightly wider so it shows on both sides
  const g1 = new THREE.Shape([
    new THREE.Vector2(1.47, 0.9), new THREE.Vector2(1.99, 1.29), new THREE.Vector2(2.56, 1.3), new THREE.Vector2(2.56, 0.9),
  ]);
  const g2 = new THREE.Shape([
    new THREE.Vector2(2.67, 0.9), new THREE.Vector2(2.67, 1.3), new THREE.Vector2(3.24, 1.31), new THREE.Vector2(3.74, 1.01), new THREE.Vector2(3.76, 0.9),
  ]);
  const glassGeo = new THREE.ExtrudeGeometry([g1, g2], { depth: WC + 0.012, bevelEnabled: false });
  glassGeo.translate(0, 0, -(WC + 0.012) / 2);
  add(glassGeo, glass);

  // Windscreen + rear window, laid on the cabin slopes
  const slopeGlass = (a, b, inset, width) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const sign = ny < 0 ? -1 : 1; // keep the normal pointing up/out
    const off = 0.052;
    add(
      new THREE.BoxGeometry(len - inset, 0.012, width),
      glass,
      [(a[0] + b[0]) / 2 + nx * off * sign, (a[1] + b[1]) / 2 + ny * off * sign, 0],
      [0, 0, Math.atan2(dy, dx)]
    );
  };
  slopeGlass([1.3, 0.84], [1.98, 1.36], 0.12, WC - 0.16);
  slopeGlass([3.28, 1.38], [3.9, 1.02], 0.14, WC - 0.2);

  // Livery decals on both flanks
  const decal = new THREE.PlaneGeometry(3.96, 0.62);
  add(decal, livery, [2.0, 0.57, W / 2 + 0.004]);
  add(decal, livery, [2.0, 0.57, -W / 2 - 0.004], [0, Math.PI, 0]);

  // Blue stripe over bonnet and roof
  add(new THREE.BoxGeometry(1.08, 0.012, 0.4), blue, [0.71, 0.847, 0], [0, 0, Math.atan2(0.12, 1.18)]);
  add(new THREE.BoxGeometry(1.26, 0.012, 0.4), blue, [2.62, 1.43, 0], [0, 0, 0.015]);

  // Wheels
  const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 36);
  tireGeo.rotateX(Math.PI / 2);
  const rimGeo = new THREE.CircleGeometry(0.215, 36);
  ARCHES.forEach((x) => {
    [1, -1].forEach((side) => {
      const t = add(tireGeo, tire, [x, 0.34, side * 0.73]);
      const rm = add(rimGeo, rim, [x, 0.34, side * 0.862], [0, side > 0 ? 0 : Math.PI, 0]);
      wheels.push({ tire: t, rim: rm, side, front: x < L / 2, base: side > 0 ? 0 : Math.PI });
    });
  });

  // Wheel-arch flares (black plastic)
  ARCHES.forEach((cx) => {
    const f = new THREE.Shape();
    f.absarc(0, 0, 0.53, -0.08, Math.PI + 0.08, false);
    f.absarc(0, 0, 0.43, Math.PI + 0.08, -0.08, true);
    const fg = new THREE.ExtrudeGeometry(f, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 20 });
    add(fg, dark, [cx, ARCH_Y, W / 2 - 0.03]);
    add(fg, dark, [cx, ARCH_Y, -W / 2 - 0.04]);
  });

  // Bumpers, grille, rally lamp pod, tail lights
  add(new THREE.BoxGeometry(0.16, 0.18, W + 0.03), dark, [0.03, 0.36, 0]);
  add(new THREE.BoxGeometry(0.14, 0.18, W + 0.03), dark, [3.99, 0.36, 0]);
  add(new THREE.BoxGeometry(0.03, 0.09, 0.86), dark, [0.0, 0.52, 0]);
  const lampGeo = new THREE.CylinderGeometry(0.088, 0.088, 0.08, 24);
  lampGeo.rotateZ(Math.PI / 2);
  const lensGeo = new THREE.CircleGeometry(0.072, 24);
  [-0.54, -0.18, 0.18, 0.54].forEach((z) => {
    add(lampGeo, dark, [-0.05, 0.665, z]);
    add(lensGeo, lamp, [-0.092, 0.665, z], [0, -Math.PI / 2, 0]);
  });
  add(new THREE.BoxGeometry(0.04, 0.03, 1.3), dark, [-0.02, 0.6, 0]);
  [0.6, -0.6].forEach((z) => add(new THREE.BoxGeometry(0.03, 0.12, 0.34), red, [4.025, 0.68, z]));

  // Rear wing, roof scoop, mirrors, mud flaps, tow strap
  add(new THREE.BoxGeometry(0.38, 0.035, 1.56), dark, [3.63, 1.5, 0], [0, 0, -0.14]);
  [0.79, -0.79].forEach((z) => add(new THREE.BoxGeometry(0.4, 0.15, 0.025), dark, [3.62, 1.46, z]));
  [0.42, -0.42].forEach((z) => add(new THREE.BoxGeometry(0.06, 0.12, 0.05), dark, [3.58, 1.41, z]));
  add(new THREE.BoxGeometry(0.3, 0.075, 0.34), paint, [2.15, 1.445, 0]);
  [0.8, -0.8].forEach((z) => add(new THREE.BoxGeometry(0.09, 0.07, 0.13), paint, [1.52, 1.0, z]));
  [1.25, 3.69].forEach((x) => [0.73, -0.73].forEach((z) => add(new THREE.BoxGeometry(0.025, 0.22, 0.28), orange, [x, 0.15, z])));
  add(new THREE.BoxGeometry(0.035, 0.08, 0.07), orange, [-0.06, 0.37, 0.48]);

  // Centre the car on its footprint
  car.children.forEach((m) => {
    m.position.x -= L / 2;
  });
  car.userData.wheels = wheels;
  return car;
}

// Car wrapped for driving: root (position + heading) > tilt (pitch/roll) > body.
// The body faces -x, so it is turned a quarter so that heading 0 drives along +z.
export function buildCarRig(options) {
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const body = buildCar(options);
  body.rotation.y = Math.PI / 2;
  body.scale.setScalar(0.95);
  tilt.add(body);
  root.add(tilt);
  root.userData = { tilt, body, wheels: body.userData.wheels };
  return root;
}

// Where the car parks on the hero ledge
export const HERO_CAR = { x: -1.95, y: 3.91, z: 0.8, heading: 1.3 - Math.PI / 2 };

export function placeOnLedge(root) {
  root.position.set(HERO_CAR.x, HERO_CAR.y, HERO_CAR.z);
  root.rotation.set(0, HERO_CAR.heading, 0);
  root.userData.tilt.rotation.set(0, 0, 0);
  root.userData.wheels.forEach((w) => {
    w.tire.rotation.y = 0;
    w.rim.rotation.set(0, w.base, 0);
  });
}

// Hero camera framing (the game transition starts from here)
export const HERO_CAM = {
  position: new THREE.Vector3(8.6, 5.0, 13.0),
  target: new THREE.Vector3(-0.55, 5.35, 0.3),
  fov: 33,
};
