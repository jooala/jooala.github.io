// Weather and time of day for the race (presets in settings.js). The hero
// scene's own lights are re-tuned rather than replaced, so the light count
// (and with it every compiled shader) stays the same. Changes blend over a
// second or two; the sky is a CSS gradient behind the transparent canvas.
import * as THREE from 'three';
import { WEATHERS } from './settings';

// Light beam on the road in front of each car at night (headlights). One
// shared material, so a single opacity drives all of them.
let beamMat = null;
let beamGeo = null;
function beamAssets() {
  if (!beamMat) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 256;
    const ctx = c.getContext('2d');
    // Fades in at the bumper and out well before the end, with soft sides,
    // so where the road bends away from the flat beam there's no hard edge
    const g = ctx.createLinearGradient(0, 256, 0, 0);
    g.addColorStop(0, 'rgba(255,240,210,0)');
    g.addColorStop(0.12, 'rgba(255,240,210,0.8)');
    g.addColorStop(0.35, 'rgba(255,236,200,0.45)');
    g.addColorStop(0.7, 'rgba(255,230,190,0.12)');
    g.addColorStop(1, 'rgba(255,230,190,0)');
    ctx.fillStyle = g;
    ctx.filter = 'blur(10px)';
    ctx.beginPath();
    ctx.moveTo(48, 250);
    ctx.lineTo(80, 250);
    ctx.lineTo(112, 10);
    ctx.lineTo(16, 10);
    ctx.closePath();
    ctx.fill();
    const map = new THREE.CanvasTexture(c);
    map.colorSpace = THREE.SRGBColorSpace;
    beamMat = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -8,
    });
    // Flat on the road, from the front bumper forwards (+z is the car's nose)
    beamGeo = new THREE.PlaneGeometry(8, 12).rotateX(-Math.PI / 2).translate(0, 0.1, 1.4 + 6);
  }
  return { beamMat, beamGeo };
}

// Red glow behind each tail light: brake lights, and the tail lights at night.
// One material per car (each brakes on its own), one shared texture.
let tailMap = null;
let tailGeo = null;
function tailAssets() {
  if (!tailMap) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,90,70,1)');
    g.addColorStop(0.3, 'rgba(255,40,25,0.55)');
    g.addColorStop(1, 'rgba(255,20,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    tailMap = new THREE.CanvasTexture(c);
    tailMap.colorSpace = THREE.SRGBColorSpace;
    // faces backwards (-z)
    tailGeo = new THREE.PlaneGeometry(0.95, 0.55).rotateY(Math.PI);
  }
  return { tailMap, tailGeo };
}

const P = new THREE.Vector3();

// Headlight beam + tail light glows on a car rig (removed again with
// removeCarLights; the hero car only has them during the game). The
// player's car has a real spotlight instead of the beam.
export function addCarLights(root, { beam: withBeam = true } = {}) {
  if (root.userData.tails) return;
  if (withBeam) {
    const { beamMat: m, beamGeo: g } = beamAssets();
    const beam = new THREE.Mesh(g, m);
    beam.userData.shared = true; // not disposed with the rig
    beam.renderOrder = 2;
    root.add(beam);
    root.userData.beam = beam;
  }

  // Glows sit on the tail lamps, in the tilt group so they pitch and roll with the body
  const { body, tilt } = root.userData;
  const { red } = body.userData.mats;
  const { tailMap: map, tailGeo: geo } = tailAssets();
  const mat = new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  body.updateMatrix();
  const tails = [];
  body.traverse((o) => {
    if (o.isMesh && o.material === red) {
      const t = new THREE.Mesh(geo, mat);
      t.userData.shared = true;
      t.position.copy(P.copy(o.position).applyMatrix4(body.matrix));
      t.position.z -= 0.06;
      t.renderOrder = 3;
      tilt.add(t);
      tails.push(t);
    }
  });
  root.userData.tails = { mat, meshes: tails, lastV: 0, hold: 0 };
}

export function removeCarLights(root) {
  const { beam, tails } = root.userData;
  if (beam) root.remove(beam);
  if (tails) {
    tails.meshes.forEach((t) => t.parent?.remove(t));
    tails.mat.dispose();
  }
  delete root.userData.beam;
  delete root.userData.tails;
}

// Brake lights: the input when we have it (local and AI cars), otherwise a
// hard drop in speed (other players' cars, from the network)
function braking(car, tails, dt) {
  const v = car.vF || 0;
  let on;
  if (car.input) on = !!car.input.brake && v > 0.5;
  else {
    if (dt > 0 && (tails.lastV - v) / dt > 6 && v > 1) tails.hold = 0.35;
    on = tails.hold > 0;
  }
  tails.hold = Math.max(0, tails.hold - dt);
  tails.lastV = v;
  return on;
}

// Numbers that blend between presets
function stateOf(w) {
  return {
    fog: new THREE.Color(w.fog[0]),
    near: w.fog[1],
    far: w.fog[2],
    sun: new THREE.Color(w.sun.color),
    sunI: w.sun.intensity,
    offset: new THREE.Vector3(...w.sun.offset),
    hemiSky: new THREE.Color(w.hemi[0]),
    hemiGround: new THREE.Color(w.hemi[1]),
    hemiI: w.hemi[2],
    fill: w.fill,
    env: w.env,
    exposure: w.exposure,
    night: w.night,
  };
}

function mix(a, b, k) {
  const out = {};
  Object.keys(a).forEach((key) => {
    const x = a[key];
    out[key] = typeof x === 'number' ? x + (b[key] - x) * k : x.clone().lerp(b[key], k);
  });
  return out;
}

const BLEND_S = 1.8;
const SKY_VARS = ['--sky-a', '--sky-b', '--sky-c'];

// Owns the scene's lighting while the game runs
export function createWeather(scene, gl, carRoot) {
  const sun = scene.getObjectByName('sun');
  const hemi = scene.getObjectByName('hemi');
  const fill = scene.getObjectByName('fill');
  const head = carRoot.getObjectByName('headlight');
  const saved = {
    sun: sun && [sun.color.clone(), sun.intensity],
    hemi: hemi && [hemi.color.clone(), hemi.groundColor.clone(), hemi.intensity],
    fill: fill && fill.intensity,
    env: scene.environmentIntensity,
    exposure: gl.toneMappingExposure,
  };
  const fog = new THREE.Fog(WEATHERS.day.fog[0], WEATHERS.day.fog[1], WEATHERS.day.fog[2]);
  scene.fog = fog;
  addCarLights(carRoot, { beam: false });

  let key = 'day';
  let from = stateOf(WEATHERS.day);
  let to = from;
  let k = 1;
  let cur = from;

  const apply = (st, world, rigs, cars, dt = 0) => {
    fog.color.copy(st.fog);
    fog.near = st.near;
    fog.far = st.far;
    if (sun) {
      sun.color.copy(st.sun);
      sun.intensity = st.sunI;
    }
    if (hemi) {
      hemi.color.copy(st.hemiSky);
      hemi.groundColor.copy(st.hemiGround);
      hemi.intensity = st.hemiI;
    }
    if (fill) fill.intensity = st.fill;
    scene.environmentIntensity = st.env;
    gl.toneMappingExposure = st.exposure;
    const n = st.night;
    if (head) head.intensity = n * 110;
    const { beamMat: bm } = beamAssets();
    bm.opacity = n * 0.38;
    if (world?.night) {
      world.night.windows.forEach((m) => {
        m.emissiveIntensity = n * 1.25;
      });
      world.night.pools.opacity = n * 0.55;
    }
    rigs?.forEach((root) => {
      const mats = root.userData.body?.userData.mats;
      if (!mats?.lamp) return;
      mats.lamp.emissiveIntensity = 0.55 + n * 3.5;
      mats.red.emissiveIntensity = 0.4 + n * 2.6;
    });
    // Tail lights glow at night, brighter on the brakes (day or night)
    cars?.forEach((car) => {
      const root = rigs.get(car.id);
      const tails = root?.userData.tails;
      if (!tails) return;
      const brake = braking(car, tails, dt);
      const target = (brake ? 0.95 : 0) + n * (brake ? 0.2 : 0.4);
      tails.mat.opacity += (target - tails.mat.opacity) * Math.min(1, dt * 18);
      root.userData.body.userData.mats.red.emissiveIntensity = 0.4 + n * 2.6 + (brake ? 5 : 0);
    });
  };

  return {
    get key() {
      return key;
    },
    // Sun position for this frame (it follows the player for the shadows)
    get sunOffset() {
      return cur.offset;
    },
    set(next, instant = false) {
      const w = WEATHERS[next] || WEATHERS.day;
      key = WEATHERS[next] ? next : 'day';
      from = cur;
      to = stateOf(w);
      k = instant ? 1 : 0;
      if (instant) cur = to;
      const root = document.documentElement;
      root.classList.toggle('rally-night', w.night >= 0.5);
      w.sky.forEach((c, i) => root.style.setProperty(SKY_VARS[i], c));
    },
    // Every frame: blend towards the target and keep newly added cars lit
    update(dt, world, rigs, cars) {
      if (k < 1) {
        k = Math.min(1, k + dt / BLEND_S);
        const e = k * k * (3 - 2 * k);
        cur = mix(from, to, e);
      }
      apply(cur, world, rigs, cars, dt);
    },
    dispose(rigs) {
      apply(stateOf(WEATHERS.day), null, rigs);
      removeCarLights(carRoot);
      if (head) head.intensity = 0;
      if (sun && saved.sun) {
        sun.color.copy(saved.sun[0]);
        sun.intensity = saved.sun[1];
      }
      if (hemi && saved.hemi) {
        hemi.color.copy(saved.hemi[0]);
        hemi.groundColor.copy(saved.hemi[1]);
        hemi.intensity = saved.hemi[2];
      }
      if (fill) fill.intensity = saved.fill;
      scene.environmentIntensity = saved.env;
      gl.toneMappingExposure = saved.exposure;
      const root = document.documentElement;
      root.classList.remove('rally-night');
      SKY_VARS.forEach((v) => root.style.removeProperty(v));
    },
  };
}
