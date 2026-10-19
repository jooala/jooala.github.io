// The rally minigame. Mounted inside the hero canvas when the car is clicked:
// unfolds the hero frame to full screen, raises today's circuit, jumps the car
// onto the grid, then runs solo races against 9 AI drivers or online races
// with friends (Supabase Realtime rooms), and restores the hero on unmount.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { buildCarRig, placeOnLedge, applyLivery, CAR_DEFAULTS, HERO_CAM, HERO_CAR } from '../hero/sceneAssets';
import { buildTrack, groundAt, dayKey, GRID, GRID_SIZE } from './track';
import { RACE_DEFAULTS, TRACK_DEFAULTS, WEATHERS, pickWeather } from './settings';
import { createWeather, addCarLights } from './weather';
import { buildWorld } from './world';
import {
  createCar, stepCar, aiInput, collideCars, updateLap, progressOf, respawn, placeCar, VMAX, COM_H,
} from './physics';
import { getGame, setGame, live, actions, toggleFullscreen } from './gameStore';
import {
  updateEngine, silenceEngine, beep, thud, crash, updateScrape, setMuted, isMuted,
} from './audio';
import {
  openRoom, makeRoomCode, clientId, cleanName, saveName, savedName, savedLivery, saveLivery, cleanLivery,
} from './net';
import Effects from './particles';
import Skids from './skids';

const AI_SPECS = [
  { name: 'Routa', livery: { body: '#1769e0', stripe: '#f2efe8', accent: '#111111', number: '12', name: 'ROUTA' }, skill: 1.0, bias: 1.2, phase: 2.1 },
  { name: 'Betoni', livery: { body: '#a19f99', stripe: '#111111', accent: '#ff6a3d', number: '07', name: 'BETONI' }, skill: 0.995, bias: -1.4, phase: 0.4 },
  { name: 'Kivi', livery: { body: '#1d1d1c', stripe: '#ff6a3d', accent: '#f2efe8', number: '33', name: 'KIVI' }, skill: 0.985, bias: 0.3, phase: 4.0 },
  { name: 'Halla', livery: { body: '#f2efe8', stripe: '#ff6a3d', accent: '#1769e0', number: '04', name: 'HALLA' }, skill: 0.99, bias: -0.6, phase: 1.3 },
  { name: 'Sora', livery: { body: '#6b6a64', stripe: '#1769e0', accent: '#f2efe8', number: '19', name: 'SORA' }, skill: 0.975, bias: 0.9, phase: 3.3 },
  { name: 'Teräs', livery: { body: '#2b3a4a', stripe: '#f2efe8', accent: '#ff6a3d', number: '88', name: 'TERÄS' }, skill: 0.98, bias: -1.0, phase: 5.2 },
  { name: 'Usva', livery: { body: '#cfccc4', stripe: '#111111', accent: '#1769e0', number: '21', name: 'USVA' }, skill: 0.965, bias: 1.5, phase: 0.9 },
  { name: 'Kuura', livery: { body: '#ff6a3d', stripe: '#111111', accent: '#f2efe8', number: '55', name: 'KUURA' }, skill: 0.97, bias: -1.8, phase: 2.7 },
  { name: 'Rouhe', livery: { body: '#3d3c38', stripe: '#cfccc4', accent: '#ff6a3d', number: '61', name: 'ROUHE' }, skill: 0.955, bias: 0.0, phase: 4.6 },
];
const HUMAN_COLORS = ['#111111', '#1769e0', '#ff6a3d', '#5b6b4a', '#7a2f2f', '#2e5f7a', '#c8a032', '#593c7a'];
const PLAYER_AUTOPILOT = { skill: 0.85, bias: 0, phase: 1 };
// Seconds on the roof/side (or stuck) before a car is put back on the road
const AUTO_RESET = { player: 4, ai: 1.6 };
const STUCK_RESET = { player: 7, ai: 3 };
const SOLO_SLOT = GRID_SIZE - 1;

const INTRO = { expand: 1.5, jumpAt: 1.15, jump: 1.7, end: 3.9 };
const ESTABLISH = { position: new THREE.Vector3(56, 46, 84), target: new THREE.Vector3(0, 2, 6), fov: 52 };
const SEND_STATE = 1 / 12;
const LAYOUT_KEYS = Object.keys(TRACK_DEFAULTS);
const SEND_AI = 1 / 10;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const lerp = (a, b, t) => a + (b - a) * t;
const lerpAngle = (a, b, t) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * t;
const r2 = (v) => Math.round(v * 100) / 100;

function readKeys(keys) {
  const t = live.touch || {};
  return {
    throttle: keys.up || t.gas,
    brake: keys.down || t.brake,
    steer: (keys.right || t.right ? 1 : 0) - (keys.left || t.left ? 1 : 0),
    handbrake: keys.hand || t.hand,
  };
}

const OFFSET = new THREE.Vector3();
const TMPQ = new THREE.Quaternion();
const SPIN = new THREE.Quaternion();
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const UPV = new THREE.Vector3();

// Rig origin sits on the road under the centre of mass; the body follows the
// full physics orientation, wheels follow the springs and the steering
function poseCar(root, car) {
  OFFSET.set(0, -COM_H, 0).applyQuaternion(car.q);
  root.position.set(car.x + OFFSET.x, car.cy + OFFSET.y, car.z + OFFSET.z);
  root.quaternion.copy(car.q);
  const { tilt, wheels } = root.userData;
  tilt.rotation.set(0, 0, 0);
  wheels.forEach((w) => {
    const yaw = w.front ? -(car.steerAngle || 0) * 1.1 : 0;
    // physics wheels: 0 FL, 1 FR, 2 RL, 3 RR (side +1 = left)
    const k = (w.front ? 0 : 2) + (w.side > 0 ? 0 : 1);
    const y = w.baseY + (car.susp?.[k] || 0) / 0.95;
    w.tire.rotation.y = yaw;
    w.tire.position.y = y;
    w.rim.position.y = y;
    w.rim.rotation.set(0, w.base + yaw, car.wheelSpin * w.side);
  });
}

// The player's paint job: saved colours/number, their name on the flanks
function playerLivery(livery, name) {
  const n = cleanName(name ?? savedName());
  return { ...CAR_DEFAULTS, ...(cleanLivery(livery) || {}), name: n ? n.toUpperCase() : CAR_DEFAULTS.name };
}

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Floating name tags over other human drivers (online races)
function NameTag({ root, name }) {
  const ref = useRef(null);
  useFrame(() => {
    if (ref.current) ref.current.position.set(root.position.x, root.position.y + 2.9, root.position.z);
  });
  return (
    <group ref={ref}>
      <Html center zIndexRange={[20, 0]}>
        <span className="rally-tag">{name}</span>
      </Html>
    </group>
  );
}

// ── Prepared world ──────────────────────────────────────────────────────────
// Building the day's circuit and compiling its shaders takes a few hundred
// milliseconds. The hero does both in idle time before the car is clicked
// (prepareRally + warmRally), so starting the game doesn't stall the unfold.
let prepared = null;

function buildData(day, opts = {}, weather = null) {
  const track = buildTrack(day, opts);
  const world = buildWorld(track);
  world.group.name = 'rally-world';
  const fx = new Effects();
  world.group.add(fx.group);
  const skids = new Skids();
  world.group.add(skids.mesh);

  const aiRoots = AI_SPECS.map((spec) => {
    const root = buildCarRig(spec.livery);
    addCarLights(root);
    world.group.add(root);
    world.risers.push({ obj: root, baseY: 0, delay: 0.05 });
    return root;
  });

  // Minimap outline for the HUD
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < track.N; i++) {
    minX = Math.min(minX, track.px[i]);
    maxX = Math.max(maxX, track.px[i]);
    minZ = Math.min(minZ, track.pz[i]);
    maxZ = Math.max(maxZ, track.pz[i]);
  }
  let path = '';
  for (let i = 0; i < track.N; i += 5) path += `${i ? 'L' : 'M'}${(track.px[i] - minX).toFixed(1)},${(track.pz[i] - minZ).toFixed(1)}`;
  const map = { path: `${path}Z`, w: maxX - minX, h: maxZ - minZ, minX, minZ };

  // Weather: each seed has its own (the daily one is the same for everyone);
  // the track lab can pick one
  const sky = WEATHERS[weather] ? weather : pickWeather(day);
  return { day, opts, weather: sky, track, world, fx, skids, aiRoots, humanRoots: new Map(), map, warm: null };
}

const disposeRig = (root) => {
  root.userData.tails?.mat.dispose();
  root.traverse((o) => {
    if (o.isMesh && !o.userData.shared) {
      o.geometry.dispose();
      [].concat(o.material).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    }
  });
};

function disposeData(d) {
  d.fx.dispose();
  d.skids.dispose();
  d.aiRoots.forEach(disposeRig);
  d.humanRoots.forEach(disposeRig);
  d.world.dispose();
}

// ── Track & race settings ───────────────────────────────────────────────────
// The daily circuit (seeded by the date in Finland) is the ranked one. Free
// play builds random tracks with their own seeds, and the admin track lab can
// also change the layout settings, laps and AI. None of those are ranked.

// `day`: the day to check against (a race keeps the day it started on)
const isDaily = (d, day = dayKey()) => d.day === day && !d.track.opts.custom && d.weather === pickWeather(d.day);

function trackInfo(d) {
  const daily = isDaily(d);
  return {
    key: d.day,
    opts: d.opts,
    weather: d.weather,
    weatherLabel: WEATHERS[d.weather].label,
    daily,
    // the daily layout with lab settings or another weather keeps its name
    label: daily ? 'Daily circuit' : d.day.startsWith('free-') ? `Free track · ${d.day.slice(5).toUpperCase()}` : 'Daily layout · custom',
  };
}

const randomKey = () => `free-${Math.random().toString(36).slice(2, 6)}`;

export function prepareRally() {
  const day = dayKey();
  if (!prepared || prepared.day !== day) prepared = buildData(day);
  return prepared;
}

function takePrepared() {
  const data = prepareRally();
  prepared = null;
  return data;
}

// Compile the world's shaders against the hero scene's lights without
// drawing anything (compile covers hidden objects too)
// Draw the world once into a tiny off-screen target. Compiling alone doesn't
// upload geometry and textures to the GPU or build the shadow-pass shaders;
// without this, all of that lands on the first game frame and the hero's
// unfold freezes for a moment. Everything is drawn: culling is off and hidden
// objects are shown for this one render, then restored.
function preRender(gl, scene, camera, group) {
  const rt = new THREE.WebGLRenderTarget(32, 32);
  const prevTarget = gl.getRenderTarget();
  const restore = [];
  group.traverse((o) => {
    restore.push([o, o.visible, o.frustumCulled]);
    o.visible = true;
    o.frustumCulled = false;
  });
  scene.add(group);
  try {
    gl.shadowMap.needsUpdate = true;
    gl.setRenderTarget(rt);
    gl.render(scene, camera);
  } catch {
    /* not fatal: the first game frame just does this instead */
  } finally {
    gl.setRenderTarget(prevTarget);
    scene.remove(group);
    restore.forEach(([o, v, c]) => {
      o.visible = v;
      o.frustumCulled = c;
    });
    rt.dispose();
  }
}

// The game turns fog on (weather.js), and fog changes the shader of every
// material, the hero's own included. Warm up under the same conditions (the
// fog type matters, not its values) so the game's first frame reuses these
// shaders instead of compiling everything again right as the hero unfolds.
const GAME_FOG = new THREE.Fog('#ffffff', 80, 340);
function withGameFog(scene, fn) {
  const fog = scene.fog;
  scene.fog = GAME_FOG;
  try {
    return fn();
  } finally {
    scene.fog = fog;
  }
}

const idle = (cb) => (typeof window !== 'undefined' && window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 30));

export function warmRally(gl, scene, camera, data = prepareRally()) {
  if (!data.warm) {
    const compile = (obj, target) => (gl.compileAsync ? gl.compileAsync(obj, camera, target) : Promise.resolve(gl.compile(obj, camera, target)));
    // compile() collects and starts the programs synchronously, so the fog only
    // needs to be in place for this call; compileAsync then just waits
    data.warm = withGameFog(scene, () => Promise.all([compile(data.world.group, scene), compile(scene)]))
      .catch(() => {})
      .then(
        () =>
          new Promise((done) =>
            idle(() => {
              // Only while the world isn't on screen yet (RallyWorld adds it itself)
              // Without KHR_parallel_shader_compile (Firefox on some systems,
              // software GL) a compiled program is only finished when first
              // used. Finish them all now; reading the uniforms forces it.
              gl.info.programs?.forEach((program) => {
                try {
                  program.getUniforms();
                } catch {
                  /* a broken program reports itself on first use anyway */
                }
              });
              if (!data.world.group.parent) withGameFog(scene, () => preRender(gl, scene, camera, data.world.group));
              done();
            })
          )
      )
      .then(() => {
        data.ready = true;
      });
  }
  return data.warm;
}

// Built and compiled already (so starting the game won't stall)?
export function isRallyReady() {
  return !!(prepared && prepared.ready && prepared.day === dayKey());
}

export default function RallyWorld({ carRoot }) {
  const { scene, camera, gl } = useThree();
  const keys = useRef({});
  const sim = useRef(null);
  const [tags, setTags] = useState([]);
  // Built ahead of time (see prepareRally); this component owns and disposes it
  const data = useMemo(() => takePrepared(), []);
  // The track can be swapped while the game runs (free play, track lab):
  // `data` is updated in place and this re-renders the scene with the new world
  const [worldGroup, setWorldGroup] = useState(() => data.world.group);
  // Laps and AI field for the next race (daily: the defaults)
  const settings = useRef({ ...RACE_DEFAULTS });
  // Lighting for the track's weather (see weather.js)
  const weather = useRef(null);

  // Rig for another human driver, built on demand and reused
  const humanRig = (p) => {
    const { humanRoots, world } = data;
    if (!humanRoots.has(p.id)) {
      const color = HUMAN_COLORS[hashId(p.id) % HUMAN_COLORS.length];
      const root = buildCarRig({
        body: color,
        stripe: color === '#111111' ? '#ff6a3d' : '#f2efe8',
        accent: '#111111',
        number: String(p.slot + 1).padStart(2, '0'),
        ...(cleanLivery(p.livery) || {}),
        name: (p.name || 'DRIVER').toUpperCase(),
      });
      addCarLights(root);
      world.group.add(root);
      humanRoots.set(p.id, root);
    }
    return humanRoots.get(p.id);
  };

  // Build the field: humans in their slots, AI drivers fill the rest
  const setupField = (roster, { online, isHost }) => {
    const { track, aiRoots, humanRoots } = data;
    const bySlot = new Map(roster.map((p) => [p.slot, p]));
    const cars = [];
    const rigs = new Map();
    let k = 0;
    for (let slot = 0; slot < GRID_SIZE; slot++) {
      const p = bySlot.get(slot);
      if (p) {
        const isLocal = p.id === clientId;
        const car = createCar(track, GRID[slot], { id: p.id, name: p.name, isPlayer: isLocal, remote: !isLocal });
        car.human = true;
        cars.push(car);
        rigs.set(car.id, isLocal ? carRoot : humanRig(p));
      } else if (k < Math.min(AI_SPECS.length, settings.current.ai)) {
        const spec = AI_SPECS[k];
        const car = createCar(track, GRID[slot], {
          id: `ai${slot}`,
          name: spec.name,
          ai: { skill: spec.skill * settings.current.aiSkill, bias: spec.bias, phase: spec.phase },
          remote: online && !isHost,
        });
        cars.push(car);
        rigs.set(car.id, aiRoots[k]);
        k++;
      }
    }
    aiRoots.forEach((r, i) => {
      r.visible = i < k;
    });
    humanRoots.forEach((r, id) => {
      r.visible = roster.some((p) => p.id === id && p.id !== clientId);
    });
    cars.forEach((c) => poseCar(rigs.get(c.id), c));
    return { cars, rigs, player: cars.find((c) => c.isPlayer) };
  };

  // ── Mount: take over the canvas ─────────────────────────────────────────
  useLayoutEffect(() => {
    const { world, map } = data;
    const sun = scene.getObjectByName('sun');
    const saved = {
      fog: scene.fog,
      sun: sun && {
        position: sun.position.clone(),
        bounds: [sun.shadow.camera.left, sun.shadow.camera.right, sun.shadow.camera.top, sun.shadow.camera.bottom],
        far: sun.shadow.camera.far,
      },
    };
    weather.current = createWeather(scene, gl, carRoot);
    if (sun) {
      Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, far: 160 });
      sun.shadow.camera.updateProjectionMatrix();
    }
    camera.manual = true;

    const field = setupField([{ id: clientId, name: 'You', slot: SOLO_SLOT }], { online: false, isHost: true });
    applyLivery(carRoot, playerLivery(savedLivery()));
    // setupField parked the player's car on the grid; it stays on the hero's
    // ledge (in view) until the intro jumps it down there
    placeOnLedge(carRoot);

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const look = camera.position.clone().addScaledVector(dir, camera.position.distanceTo(HERO_CAM.target));
    sim.current = {
      phase: 'intro',
      t: 0,
      raceTime: 0,
      ...field,
      roster: null,
      room: null,
      online: false,
      isHost: true,
      snaps: new Map(),
      sendT: 0,
      sendAiT: 0,
      landed: false,
      shake: 0,
      camPos: camera.position.clone(),
      camLook: look.clone(),
      camStart: camera.position.clone(),
      lookStart: look,
      fovStart: camera.fov,
      lastCount: null,
      position: GRID_SIZE,
      lap: 0,
      wrongWay: false,
      sun,
    };
    live.map = map;
    live.time = 0;
    live.speed = 0;

    // Stay on the hero (phase 'loading') until the world's shaders are ready,
    // then start the unfold. The world stays hidden until then.
    world.group.visible = false;
    let alive = true;
    // Ready to go once the shaders are warm (or after a fallback timeout); the
    // frame loop then waits until the canvas has finished growing to full
    // screen before starting the intro (see the !s.ready branch below)
    const go = () => {
      if (!alive || !sim.current || sim.current.ready) return;
      sim.current.warmed = true;
    };
    sim.current.startIntro = () => {
      if (!alive || !sim.current || sim.current.ready) return;
      world.group.visible = true;
      // Dusk falls (or the fog rolls in) while the city rises
      weather.current.set(data.weather);
      sim.current.ready = true;
      sim.current.t = 0;
      setGame({ phase: 'intro' });
    };
    // Last resort: start anyway, whatever the warm-up or the resize is doing
    const fallback = setTimeout(() => sim.current?.startIntro?.(), 5000);
    warmRally(gl, scene, camera, data).then(() => requestAnimationFrame(go));

    // QA hook (dev builds, or ?rallydebug): jump to the crest or the finish
    if (process.env.NODE_ENV !== 'production' || window.location.search.includes('rallydebug')) {
      const place = (idx, speed) => placeCar(sim.current.player, data.track, idx, 0, speed);
      window.__rally = {
        state: () => sim.current,
        // how many race worlds are in the scene (should always be 1)
        worlds: () => scene.children.filter((o) => o.name === 'rally-world').length,
        toJump: () => place(data.track.jump - 40, 36),
        toIdx: (idx, speed = 0) => place(idx, speed),
        get track() {
          return data.track;
        },
        toFinish: () => {
          const { player } = sim.current;
          player.lap = settings.current.laps;
          player.cp = true;
          place(data.track.N - 25, 34);
        },
      };
    }

    setGame({
      day: data.day,
      track: trackInfo(data),
      race: { ...settings.current },
      totalLaps: settings.current.laps,
      cars: GRID_SIZE,
      lap: 0,
      position: GRID_SIZE,
      results: null,
      room: null,
      menuError: null,
      busy: false,
      muted: isMuted(),
    });

    return () => {
      alive = false;
      clearTimeout(fallback);
      sim.current?.room?.leave();
      weather.current.dispose([carRoot, ...data.aiRoots, ...data.humanRoots.values()]);
      weather.current = null;
      scene.fog = saved.fog;
      if (sun && saved.sun) {
        sun.position.copy(saved.sun.position);
        sun.target.position.set(0, 0, 0);
        sun.target.updateMatrixWorld();
        const [l, r, t, b] = saved.sun.bounds;
        Object.assign(sun.shadow.camera, { left: l, right: r, top: t, bottom: b, far: saved.sun.far });
        sun.shadow.camera.updateProjectionMatrix();
      }
      camera.clearViewOffset();
      camera.manual = false;
      camera.fov = HERO_CAM.fov;
      camera.position.copy(HERO_CAM.position);
      camera.lookAt(HERO_CAM.target);
      camera.updateProjectionMatrix();
      carRoot.visible = true;
      applyLivery(carRoot, CAR_DEFAULTS);
      placeOnLedge(carRoot);
      silenceEngine();
      live.map = null;
      // `data` may hold a swapped-in track by now (free play, track lab)
      disposeData(data);
      delete window.__rally;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Race control: solo, rooms, starts ───────────────────────────────────
  useEffect(() => {
    const s = () => sim.current;

    const begin = (roster) => {
      const st = s();
      const field = setupField(roster, { online: st.online, isHost: st.isHost });
      Object.assign(st, field, {
        roster,
        phase: 'countdown',
        raceDay: dayKey(),
        t: 0,
        raceTime: 0,
        lastCount: null,
        lap: 0,
        position: field.cars.length,
        sendT: 0,
        sendAiT: 0,
      });
      st.snaps.clear();
      data.skids.clear();
      data.world.lights.forEach((m) => {
        m.color.set('#1a1a1a');
        m.emissive.set('#000000');
        m.emissiveIntensity = 0;
      });
      setTags(
        roster
          .filter((p) => p.id !== clientId)
          .map((p) => ({ id: p.id, name: p.name, root: field.rigs.get(p.id) }))
      );
      setGame({
        phase: 'countdown', countdown: 3, lap: 0, totalLaps: settings.current.laps, position: field.cars.length, cars: field.cars.length, results: null, wrongWay: false, resetHint: null,
      });
    };

    // Put the field back on the grid of the current track (menu / lobby view)
    const refreshField = () => {
      const st = s();
      Object.assign(st, setupField([{ id: clientId, name: 'You', slot: SOLO_SLOT }], { online: false, isHost: true }));
      setGame({ totalLaps: settings.current.laps, race: { ...settings.current }, cars: GRID_SIZE });
    };

    // Swap in another track (free play / track lab). The new world is built
    // and its shaders compiled before the swap, so the swap itself is one
    // frame; the old world is disposed once nothing renders it any more.
    let switching = Promise.resolve();
    const switchTrack = (key, opts = {}, race = RACE_DEFAULTS, sky = null) => {
      settings.current = { ...RACE_DEFAULTS, ...race };
      const nextSky = WEATHERS[sky] ? sky : pickWeather(key);
      const sameOpts = (a, b) => LAYOUT_KEYS.every((k) => (a[k] ?? TRACK_DEFAULTS[k]) === (b[k] ?? TRACK_DEFAULTS[k]));
      if (key === data.day && sameOpts(opts, data.opts)) {
        // Same layout: only the weather (if anything) changes
        if (nextSky !== data.weather) {
          data.weather = nextSky;
          weather.current?.set(nextSky);
        }
        refreshField();
        setGame({ track: trackInfo(data) });
        return switching;
      }
      setGame({ busy: 'Building the track…', menuError: null });
      switching = new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        .then(() => {
          const next = buildData(key, opts, sky);
          return warmRally(gl, scene, camera, next).then(() => next);
        })
        .then((next) => {
          const ground = next.world.groundMat;
          ground.opacity = 1;
          ground.transparent = false;
          ground.needsUpdate = true;
          const old = { ...data };
          Object.assign(data, next);
          live.map = data.map;
          setWorldGroup(data.world.group);
          weather.current?.set(data.weather);
          requestAnimationFrame(() => requestAnimationFrame(() => disposeData(old)));
          refreshField();
          setGame({ busy: false, track: trackInfo(data) });
        });
      return switching;
    };

    // Solo: just swap. Host: swap, then send it to the room so everyone races it.
    const setTrack = (key, opts, race, sky) => {
      const st = s();
      if (st.online && !st.isHost) return;
      switchTrack(key, opts, race, sky).then(() => {
        if (st.room?.isHost) st.room.send('track', currentTrack());
      });
    };
    const currentTrack = () => ({ key: data.day, opts: data.opts, race: { ...settings.current }, weather: data.weather });

    actions.newTrack = () => setTrack(randomKey(), {}, RACE_DEFAULTS);
    actions.dailyTrack = () => setTrack(dayKey(), {}, RACE_DEFAULTS);
    // Track lab: same seed with new settings, or a fresh seed. sky: a weather
    // key, or null for the seed's own
    actions.labTrack = (opts, race, sameSeed, sky = null) => setTrack(sameSeed ? data.day : randomKey(), opts, race, sky);

    // A new daily circuit comes out at midnight Finnish time. The menu (or the
    // host's lobby) then switches to it; a race under way finishes on the old
    // one first, and its time still counts for the day it started on.
    let today = dayKey();
    const rollover = setInterval(() => {
      const now = dayKey();
      const { phase } = getGame();
      if (now === today || (phase !== 'menu' && phase !== 'lobby')) return;
      const onDaily = data.day === today && !data.track.opts.custom;
      today = now;
      setGame({ day: now });
      if (onDaily) setTrack(now, {}, RACE_DEFAULTS);
      else setGame({ track: trackInfo(data) });
    }, 2000);

    const toLobby = () => {
      const st = s();
      st.phase = 'lobby';
      silenceEngine();
      updateScrape(0);
      st.room?.setStatus('lobby');
      setGame({ phase: 'lobby', results: null, wrongWay: false, resetHint: null });
    };

    const attachRoom = (room) => {
      const st = s();
      st.room = room;
      st.online = true;
      st.isHost = room.isHost;
      room.on('players', (players) => {
        const cur = getGame().room;
        setGame({ room: { ...(cur || {}), code: room.code, isHost: room.isHost, players } });
        // newcomers get the host's track (free play / track lab) while still in the lobby
        if (room.isHost) room.send('track', currentTrack());
        if (!room.isHost && !players.some((p) => p.host)) {
          if (st.phase === 'lobby') {
            room.leave();
            st.room = null;
            st.online = false;
            setGame({ phase: 'menu', room: null, menuError: 'The host left the room.' });
          } else {
            setGame({ menuError: 'The host left: AI cars have stopped.' });
          }
        }
      });
      room.on('state', (p) => st.snaps.set(p.id, { ...p, at: performance.now() }));
      room.on('ai', (p) => {
        const at = performance.now();
        p.cars.forEach((c) => st.snaps.set(c.id, { ...c, at }));
      });
      if (!room.isHost) {
        room.on('track', (p) => {
          if (st.phase === 'lobby' || st.phase === 'menu') switchTrack(p.key, p.opts, p.race, p.weather);
        });
        room.on('start', (p) => {
          const ready = p.track ? switchTrack(p.track.key, p.track.opts, p.track.race, p.track.weather) : Promise.resolve();
          ready.then(() => begin(p.roster));
        });
        room.on('lobby', () => toLobby());
      }
      setGame({ phase: 'lobby', room: { code: room.code, isHost: room.isHost, players: room.players() }, menuError: null, busy: false });
      st.phase = 'lobby';
    };

    // Menu preview and save of the paint job
    actions.livery = (livery, name) => {
      saveLivery(livery);
      applyLivery(carRoot, playerLivery(livery, name));
    };

    // Back on the road after a crash (R, the HUD button or automatically)
    actions.reset = () => {
      const st = s();
      if (st?.phase !== 'race' || st.player.finished) return;
      respawn(st.player, data.track);
      setGame({ resetHint: null });
    };

    actions.solo = (name) => {
      const n = cleanName(name) || 'You';
      saveName(n);
      applyLivery(carRoot, playerLivery(savedLivery(), n));
      const st = s();
      st.online = false;
      st.isHost = true;
      begin([{ id: clientId, name: n, slot: SOLO_SLOT }]);
    };

    actions.createRoom = async (name) => {
      const n = cleanName(name) || 'Host';
      saveName(n);
      setGame({ busy: true, menuError: null });
      try {
        applyLivery(carRoot, playerLivery(savedLivery(), n));
        attachRoom(await openRoom(makeRoomCode(), { name: n, host: true, livery: savedLivery() }));
      } catch (e) {
        setGame({ busy: false, menuError: e.message });
      }
    };

    actions.joinRoom = async (code, name) => {
      const n = cleanName(name) || 'Driver';
      saveName(n);
      setGame({ busy: true, menuError: null });
      try {
        applyLivery(carRoot, playerLivery(savedLivery(), n));
        attachRoom(await openRoom(code, { name: n, host: false, livery: savedLivery() }));
      } catch (e) {
        setGame({ busy: false, menuError: e.message });
      }
    };

    actions.leaveRoom = () => {
      const st = s();
      st.room?.leave();
      Object.assign(st, { room: null, online: false, isHost: true, phase: 'menu' });
      const field = setupField([{ id: clientId, name: 'You', slot: SOLO_SLOT }], { online: false, isHost: true });
      Object.assign(st, field);
      setTags([]);
      setGame({ phase: 'menu', room: null, menuError: null, results: null });
    };

    // Host: everyone currently in the room gets the back rows, AI fill the front
    actions.hostStart = () => {
      const st = s();
      if (!st.room?.isHost) return;
      const players = st.room.players().slice(0, GRID_SIZE);
      const roster = players.map((p, i) => ({ id: p.id, name: p.name, slot: GRID_SIZE - 1 - i, livery: p.livery || null }));
      st.room.setStatus('racing');
      st.room.send('start', { roster, day: data.day, track: currentTrack() });
      begin(roster);
    };

    actions.restart = () => {
      const st = s();
      if (st.online) {
        if (st.isHost) {
          st.room.send('lobby', {});
          toLobby();
        }
        return;
      }
      begin(st.roster || [{ id: clientId, name: 'You', slot: SOLO_SLOT }]);
    };

    actions.toLobby = toLobby;

    // Keyboard
    const map = {
      ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'hand',
    };
    const typing = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName || '');
    const down = (e) => {
      if (typing(e)) {
        if (e.code === 'Escape') e.target.blur();
        return;
      }
      if (map[e.code]) {
        keys.current[map[e.code]] = true;
        e.preventDefault();
      }
      if (e.code === 'KeyR') actions.reset();
      if (e.code === 'KeyM') {
        const m = !getGame().muted;
        setMuted(m);
        setGame({ muted: m });
      }
      if (e.code === 'KeyF') toggleFullscreen();
      if (e.code === 'Escape') actions.exit();
    };
    const up = (e) => {
      if (map[e.code]) keys.current[map[e.code]] = false;
    };
    const blur = () => {
      keys.current = {};
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      clearInterval(rollover);
      ['solo', 'createRoom', 'joinRoom', 'leaveRoom', 'hostStart', 'toLobby', 'livery', 'reset', 'newTrack', 'dailyTrack', 'labTrack'].forEach((k) => delete actions[k]);
      actions.restart = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Frame loop ──────────────────────────────────────────────────────────
  useFrame((state, rawDt) => {
    const s = sim.current;
    if (!s || !s.ready) {
      // Waiting to start: the canvas goes full screen behind the hero's clip
      // (see Hero), so keep drawing the hero's own framing in that rect
      const rect = getGame().heroRect;
      if (s && rect) {
        const { size } = state;
        camera.aspect = rect.width / rect.height;
        camera.setViewOffset(rect.width, rect.height, -(rect.left - size.left), -(rect.top - size.top), size.width, size.height);
        camera.updateProjectionMatrix();
        // Start the intro only after a frame has been drawn at full size, so
        // the canvas resize isn't part of the unfold
        // (the canvas has grown past the hero frame it started in)
        const full = size.width > rect.width + 1 || size.height > rect.height + 1;
        if (s.warmed && full) {
          s.fullFrames = (s.fullFrames || 0) + 1;
          if (s.fullFrames >= 2) s.startIntro();
        }
      }
      return;
    }
    const dt = Math.min(rawDt, 0.1);
    const { track, world, fx, skids, aiRoots } = data;
    const { size } = state;
    s.t += dt;

    const fwdOf = (car) => [Math.sin(car.h), Math.cos(car.h)];
    const chase = (() => {
      const car = s.player;
      // Follow the nose; while the car tumbles, follow where it is going
      const tumbling = car.upright < 0.6;
      const aim = tumbling && Math.hypot(car.vx, car.vz) > 3 ? Math.atan2(car.vx, car.vz) : car.h;
      s.camH = s.camH === undefined ? aim : lerpAngle(s.camH, aim, 1 - Math.exp(-dt * (tumbling ? 2 : 8)));
      const fx_ = Math.sin(s.camH);
      const fz = Math.cos(s.camH);
      const speed = Math.abs(car.vF);
      const back = 8.4 + speed * 0.045;
      const base = car.cy - COM_H;
      const cx = car.x - fx_ * back;
      const cz = car.z - fz * back;
      const floor = groundAt(track, car.idx, cx, cz) + 1.8;
      return {
        pos: new THREE.Vector3(cx, Math.max(floor, base + 3.2 + (car.grounded ? 0 : 0.6)), cz),
        look: new THREE.Vector3(car.x + fx_ * 6, base + 1.1, car.z + fz * 6),
      };
    })();

    // ── Intro ──
    if (s.phase === 'intro') {
      const t = s.t;
      const rect = getGame().heroRect;
      const p = ease(clamp01(t / INTRO.expand));

      // the city rises during the unfold, so the frame never shows empty paper
      const w = (t - 0.05) / 1.3;
      world.risers.forEach((r) => {
        const k = clamp01((w - r.delay) / 0.45);
        r.obj.visible = k > 0.001;
        r.obj.position.y = r.baseY - (1 - easeOutBack(k)) * 26;
      });
      world.groundMat.opacity = clamp01((t - 0.15) / 1.1);

      // Car leaps off the ledge onto the back of the grid
      const slot = s.player;
      const u = clamp01((t - INTRO.jumpAt) / INTRO.jump);
      if (u > 0) {
        const eu = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
        carRoot.position.set(
          lerp(HERO_CAR.x, slot.x, eu),
          lerp(HERO_CAR.y, slot.y, u) + 26 * u * (1 - u),
          lerp(HERO_CAR.z, slot.z, eu)
        );
        carRoot.rotation.y = lerpAngle(HERO_CAR.heading, slot.h, ease(u));
        carRoot.userData.tilt.rotation.x = lerp(-0.32, 0.22, u) * Math.sin(Math.PI * u);
        carRoot.userData.tilt.rotation.z = Math.sin(u * Math.PI * 2) * 0.12;
        if (u >= 1 && !s.landed) {
          s.landed = true;
          s.shake = 0.7;
          fx.impact(slot.x, slot.y + 0.2, slot.z, 1.4, true);
          thud(3);
          carRoot.userData.tilt.rotation.set(0, 0, 0);
        }
      } else {
        carRoot.userData.tilt.rotation.x = Math.sin(t * 40) * 0.01 * clamp01(t / INTRO.jumpAt);
      }

      const cam = new THREE.Vector3();
      const look = new THREE.Vector3();
      let fov;
      if (t < INTRO.expand) {
        cam.lerpVectors(s.camStart, ESTABLISH.position, p);
        look.lerpVectors(s.lookStart, ESTABLISH.target, p);
        fov = lerp(s.fovStart, ESTABLISH.fov, p);
      } else {
        const q = ease(clamp01((t - INTRO.expand) / (INTRO.end - INTRO.expand)));
        cam.lerpVectors(ESTABLISH.position, chase.pos, q);
        look.lerpVectors(ESTABLISH.target, carRoot.position, Math.min(1, q * 1.6));
        look.lerp(chase.look, q * q);
        fov = lerp(ESTABLISH.fov, 56, q);
      }
      s.camPos.copy(cam);
      s.camLook.copy(look);
      camera.fov = fov;

      if (rect && p < 1) {
        const vx = lerp(rect.left - size.left, 0, p);
        const vy = lerp(rect.top - size.top, 0, p);
        const vw = lerp(rect.width, size.width, p);
        const vh = lerp(rect.height, size.height, p);
        camera.aspect = vw / vh;
        camera.setViewOffset(vw, vh, -vx, -vy, size.width, size.height);
      } else {
        camera.clearViewOffset();
        camera.aspect = size.width / size.height;
      }

      if (t >= INTRO.end) {
        world.risers.forEach((r) => {
          r.obj.position.y = r.baseY;
          r.obj.visible = true;
        });
        aiRoots.forEach((root) => {
          root.visible = [...s.rigs.values()].includes(root);
        });
        world.groundMat.opacity = 1;
        world.groundMat.transparent = false;
        world.groundMat.needsUpdate = true;
        s.phase = 'menu';
        s.t = 0;
        setGame({ phase: 'menu' });
      }
    } else {
      camera.clearViewOffset();
      camera.aspect = size.width / size.height;
    }

    // ── Menu / lobby: parked on the grid, engines off until the countdown ──
    if (s.phase === 'menu' || s.phase === 'lobby') silenceEngine();

    // ── Countdown ──
    if (s.phase === 'countdown') {
      const n = 3 - Math.floor(s.t);
      if (n !== s.lastCount && n > 0) {
        s.lastCount = n;
        setGame({ countdown: n });
        beep(440, 0.16);
      }
      world.lights.forEach((m, k) => {
        const on = s.t >= k;
        m.color.set(on ? '#c8281b' : '#1a1a1a');
        m.emissive.set(on ? '#ff2a14' : '#000000');
        m.emissiveIntensity = on ? 1.6 : 0;
      });
      const intent = readKeys(keys.current);
      updateEngine(intent.throttle ? 22 : 4, intent.throttle, 0);
      // Revving on the line: wheelspin smoke
      if (intent.throttle && Math.random() < dt * 20) {
        const c = s.player;
        const [fx_, fz] = fwdOf(c);
        fx.smoke(c.x - fx_ * 1.6, c.y + 0.3, c.z - fz * 1.6, 0, 0, 0.6);
      }
      if (s.t >= 3) {
        world.lights.forEach((m) => {
          m.color.set('#1fbf4a');
          m.emissive.set('#36ff6e');
          m.emissiveIntensity = 1.8;
        });
        beep(880, 0.45, 0.22);
        s.phase = 'race';
        s.t = 0;
        setGame({ phase: 'race', countdown: 0 });
      }
    }

    // ── Race (and cool-down after the player finishes) ──
    const racing = s.phase === 'race' || s.phase === 'finished';
    if (racing) {
      const { player, cars } = s;
      const now = performance.now();

      // Remote cars: follow their latest network state (extrapolated + smoothed)
      cars.forEach((car) => {
        if (!car.remote) return;
        const snap = s.snaps.get(car.id);
        if (!snap) return;
        const age = Math.min(0.35, (now - snap.at) / 1000);
        car.stale = now - snap.at > 4000;
        const tx = snap.x + snap.vx * age;
        const tz = snap.z + snap.vz * age;
        const k = 1 - Math.exp(-dt * 14);
        if (Math.hypot(tx - car.x, tz - car.z) > 10) {
          car.x = tx;
          car.z = tz;
        } else {
          car.x += (tx - car.x) * k;
          car.z += (tz - car.z) * k;
        }
        car.cy += (snap.y - car.cy) * k;
        if (snap.q) car.q.slerp(TMPQ.set(snap.q[0], snap.q[1], snap.q[2], snap.q[3]).normalize(), k);
        car.h = lerpAngle(car.h, snap.h, k);
        car.vx = snap.vx;
        car.vz = snap.vz;
        car.v.set(snap.vx, 0, snap.vz);
        car.steerAngle = snap.s;
        car.upright = UPV.set(0, 1, 0).applyQuaternion(car.q).y;
        car.y = car.cy - car.upright * COM_H;
        car.lap = snap.l;
        car.idx = snap.i;
        car.finished = !!snap.f;
        car.finishTime = snap.ft ?? null;
        car.bestLap = snap.bl ?? null;
        car.grounded = !!snap.g;
        const sinH = Math.sin(car.h);
        const cosH = Math.cos(car.h);
        car.vF = car.vx * sinH + car.vz * cosH;
        car.vR = -car.vx * cosH + car.vz * sinH;
        car.slip = Math.abs(car.vR);
        car.wheelSpin += (car.vF / 0.34) * dt;
      });

      // Fixed ~1/60 s physics sub-steps so slow frames don't slow the race
      const steps = Math.min(6, Math.ceil(dt / (1 / 60)));
      const h = dt / steps;
      const active = cars.filter((c) => !c.stale);
      const contacts = new Map();
      for (let n = 0; n < steps; n++) {
        s.raceTime += h;
        const pProg = progressOf(player, track);
        active.forEach((car) => {
          if (car.remote) return;
          let input;
          if (car.ai) {
            // AI behind the player get a touch more power, AI ahead a touch less
            if (!car.isPlayer) car.power = 1 + Math.max(-0.03, Math.min(0.07, (pProg - progressOf(car, track)) / 300));
            input = aiInput(car, track, active, h);
          } else {
            input = readKeys(keys.current);
          }
          stepCar(car, input, h, track);
          car.input = input;
          if (updateLap(car, track, s.raceTime) && car.lap > settings.current.laps && !car.finished) {
            car.finished = true;
            car.finishTime = s.raceTime;
          }
          // Crashed cars go back on the road: AI quickly, the player after a
          // few seconds (or straight away with R)
          const who = car.ai ? 'ai' : 'player';
          if (car.lost || car.flipT > AUTO_RESET[who] || car.stuckT > STUCK_RESET[who] || (car.ai && car.wrongT > 2.5)) {
            respawn(car, track);
          }
        });
        collideCars(active).forEach((c) => {
          const key = `${c.a.id}|${c.b.id}`;
          if (!contacts.has(key) || contacts.get(key).strength < c.strength) contacts.set(key, c);
        });
      }

      // Effects for every car
      let scrape = 0;
      cars.forEach((car) => {
        if (car.stale) return;
        const speed = Math.abs(car.vF);
        const [fx_, fz] = fwdOf(car);
        const rx = -fz;
        const rz = fx_;
        const wheels = [
          [car.x - fx_ * 1.55 + rx * 0.72, car.z - fz * 1.55 + rz * 0.72],
          [car.x - fx_ * 1.55 - rx * 0.72, car.z - fz * 1.55 - rz * 0.72],
        ];
        const near = Math.hypot(car.x - s.player.x, car.z - s.player.z) < 30;

        if (car.grounded) {
          // rally dust
          if (speed > 5) {
            car.dustAcc = (car.dustAcc || 0) + dt * (speed * 0.5 + car.slip * 3);
            while (car.dustAcc > 1) {
              car.dustAcc -= 1;
              const [wx, wz] = wheels[Math.random() < 0.5 ? 0 : 1];
              fx.dust(wx, car.y + 0.25, wz, -car.vx * 0.12, -car.vz * 0.12, speed);
            }
          }
          // tyre smoke from slides, handbrake and wheelspin
          const hand = car.input?.handbrake && speed > 6 ? 0.6 : 0;
          const smoke = Math.max(0, (car.slip - 3.5) / 6) + (car.burnout || 0) * 0.9 + hand;
          if (smoke > 0.05) {
            car.smokeAcc = (car.smokeAcc || 0) + dt * smoke * 24;
            while (car.smokeAcc > 1) {
              car.smokeAcc -= 1;
              const [wx, wz] = wheels[Math.random() < 0.5 ? 0 : 1];
              fx.smoke(wx, car.y + 0.3, wz, -car.vx * 0.06, -car.vz * 0.06, Math.min(1.4, smoke));
            }
            if (Math.random() < dt * 10 * smoke) {
              const [wx, wz] = wheels[Math.random() < 0.5 ? 0 : 1];
              fx.debris(wx, car.y + 0.2, wz, -car.vx * 0.15, -car.vz * 0.15, 1);
            }
          }
          const braking = car.input?.brake && car.vF > 10 ? 0.5 : 0;
          const mark = Math.max(Math.min(1, smoke), braking);
          skids.add(`${car.id}L`, wheels[0][0], car.y, wheels[0][1], mark);
          skids.add(`${car.id}R`, wheels[1][0], car.y, wheels[1][1], mark);
        } else {
          skids.add(`${car.id}L`, 0, 0, 0, 0);
          skids.add(`${car.id}R`, 0, 0, 0, 0);
        }

        // Landings: dust ring, debris and sparks
        if (car.landed) {
          fx.impact(car.x, car.y + 0.1, car.z, car.landed, car.landed > 0.6);
          if (car.isPlayer) {
            s.shake = Math.max(s.shake, 0.45 * car.landed);
            thud(2.2 * car.landed);
          }
          car.landed = 0;
        }

        // Body on the road (rolls, roof landings): dust, debris, sparks
        if (car.bodyHit) {
          const b = car.bodyHit;
          fx.impact(b.x, b.y + 0.1, b.z, Math.min(1.6, b.strength / 7), b.strength > 5);
          fx.debris(b.x, b.y + 0.2, b.z, car.vx * 0.2, car.vz * 0.2, 4);
          if (car.isPlayer) {
            s.shake = Math.max(s.shake, Math.min(0.7, b.strength * 0.06));
            crash(b.strength * 0.8);
          } else if (near) crash(b.strength * 0.3);
          car.bodyHit = null;
        }
        if (car.scrape) {
          const sc = car.scrape;
          car.roofAcc = (car.roofAcc || 0) + dt * sc.speed * 2;
          while (car.roofAcc > 1) {
            car.roofAcc -= 1;
            fx.sparks(sc.x, sc.y + 0.1, sc.z, car.vx, car.vz, 1, 3);
          }
          if (car.isPlayer) scrape = Math.max(scrape, sc.speed);
          car.scrape = null;
        }

        // Walls: sparks on hits, a shower while scraping
        if (car.wallHit) {
          const w = car.wallHit;
          if (w.strength > 1.5) {
            fx.sparks(w.x, w.y, w.z, car.vx, car.vz, Math.round(6 + w.strength * 1.5), 4 + w.strength * 0.3);
            fx.debris(w.x, w.y - 0.1, w.z, car.vx * 0.2, car.vz * 0.2, 3);
            if (car.isPlayer) {
              s.shake = Math.max(s.shake, Math.min(0.6, w.strength * 0.05));
              thud(Math.min(3, w.strength * 0.18));
            } else if (near) thud(Math.min(1.2, w.strength * 0.08));
          }
          car.wallHit = null;
        }
        if (car.wall && car.wall.scrape > 4) {
          car.scrapeAcc = (car.scrapeAcc || 0) + dt * car.wall.scrape * 1.4;
          while (car.scrapeAcc > 1) {
            car.scrapeAcc -= 1;
            fx.sparks(car.wall.x, car.wall.y, car.wall.z, car.vx, car.vz, 1, 3);
          }
          if (car.isPlayer) scrape = Math.max(scrape, car.wall.scrape);
        }
        car.impact = 0;
      });
      updateScrape(scrape);

      // Car-on-car hits
      contacts.forEach((c) => {
        if (c.strength < 1.2) return;
        fx.crash(c.x, c.y, c.z, c.strength);
        const involved = c.a.isPlayer || c.b.isPlayer;
        if (involved) {
          s.shake = Math.max(s.shake, Math.min(0.65, c.strength * 0.06));
          crash(c.strength);
        } else if (Math.hypot(c.x - player.x, c.z - player.z) < 25) {
          crash(c.strength * 0.4);
        }
      });

      // Network: own car for everyone, AI cars from the host
      if (s.room) {
        s.sendT += dt;
        if (s.sendT >= SEND_STATE) {
          s.sendT = 0;
          const c = player;
          s.room.send('state', { ...snapshot(c), bl: c.bestLap });
        }
        if (s.isHost) {
          s.sendAiT += dt;
          if (s.sendAiT >= SEND_AI) {
            s.sendAiT = 0;
            s.room.send('ai', {
              cars: cars.filter((c) => c.ai && !c.human).map(snapshot),
            });
          }
        }
      }

      // Player finished: hand the wheel to the autopilot and show results
      if (player.finished && s.phase === 'race') {
        s.phase = 'finished';
        player.ai = PLAYER_AUTOPILOT;
        const results = standings(cars, track).map((c, k) => ({
          position: k + 1,
          name: c.name,
          isPlayer: c.isPlayer,
          human: !!c.human,
          time: c.finished ? c.finishTime : null,
        }));
        const place = results.find((r) => r.isPlayer).position;
        // Only the daily circuit with the normal laps and field is ranked
        const ranked = isDaily(data, s.raceDay) && JSON.stringify(settings.current) === JSON.stringify(RACE_DEFAULTS);
        let best = null;
        try {
          best = Number(window.localStorage.getItem('ja-rally-best')) || null;
          if (ranked && (!best || player.finishTime < best)) window.localStorage.setItem('ja-rally-best', String(player.finishTime));
        } catch {
          /* storage unavailable */
        }
        setGame({
          phase: 'finished',
          results: {
            rows: results,
            place,
            time: player.finishTime,
            bestLap: player.bestLap,
            previousBest: best,
            newBest: ranked && (!best || player.finishTime < best),
            day: data.day,
            ranked,
            track: trackInfo(data),
            online: s.online,
            isHost: s.isHost,
          },
        });
        silenceEngine();
        updateScrape(0);
      }

      // Results keep updating as the others cross the line
      if (s.phase === 'finished') {
        s.resultsT = (s.resultsT || 0) + dt;
        if (s.resultsT > 0.5) {
          s.resultsT = 0;
          const cur = getGame().results;
          if (cur) {
            const rows = standings(cars, track).map((c, k) => ({
              position: k + 1, name: c.name, isPlayer: c.isPlayer, human: !!c.human, time: c.finished ? c.finishTime : null,
            }));
            const changed = rows.some((r, k) => r.time !== cur.rows[k]?.time || r.name !== cur.rows[k]?.name);
            if (changed) setGame({ results: { ...cur, rows } });
          }
        }
      }

      // HUD values
      if (s.phase === 'race') {
        const ranked = standings(cars, track);
        const position = ranked.indexOf(player) + 1;
        const lap = Math.min(settings.current.laps, Math.max(1, player.lap));
        const [pfx, pfz] = fwdOf(player);
        const along = pfx * track.tx[player.idx] + pfz * track.tz[player.idx];
        const wrongWay = along < -0.3 && Math.abs(player.vF) > 4;
        if (position !== s.position || lap !== s.lap || wrongWay !== s.wrongWay) {
          s.position = position;
          s.lap = lap;
          s.wrongWay = wrongWay;
          setGame({ position, lap, wrongWay });
        }
        // Flipped or stuck: tell the player how to get going again
        let hint = null;
        if (player.flipT > 0.6) hint = { reason: 'flipped', auto: Math.max(1, Math.ceil(AUTO_RESET.player - player.flipT)) };
        else if (player.stuckT > 2.5) hint = { reason: 'stuck', auto: Math.max(1, Math.ceil(STUCK_RESET.player - player.stuckT)) };
        const hintKey = hint ? `${hint.reason}${hint.auto}` : '';
        if (hintKey !== s.hintKey) {
          s.hintKey = hintKey;
          setGame({ resetHint: hint });
        }
        updateEngine(player.vF, player.input?.throttle, player.grounded ? player.slip : 0);
        live.time = s.raceTime;
      }
      live.speed = Math.abs(player.vF) * 3.6;
    }

    // ── Pose cars ──
    if (s.phase !== 'intro') {
      s.cars.forEach((car) => {
        const root = s.rigs.get(car.id);
        if (!root) return;
        // Blink while invulnerable after a reset
        root.visible = !car.stale && !(car.ghost > 0 && Math.floor(car.ghost * 8) % 2);
        poseCar(root, car);
        if (car.isPlayer && s.spin) root.quaternion.multiply(SPIN.setFromAxisAngle(UP_AXIS, s.spin));
      });
    }

    // Customising in the menu: the player's car turns on the spot, and
    // eases back to facing the start when the panel closes
    const garage = s.phase === 'menu' && getGame().garage;
    if (garage) s.spin = (s.spin || 0) + dt * 0.7;
    else if (s.spin) {
      s.spin = lerpAngle(s.spin, 0, 1 - Math.exp(-dt * 5));
      if (Math.abs(s.spin) < 0.002) s.spin = 0;
    }
    live.cars = s.cars.map((c) => ({ x: c.x - data.map.minX, z: c.z - data.map.minZ, p: c.isPlayer, h: !!c.human }));

    // ── Camera follow ──
    if (s.phase !== 'intro') {
      let view = chase;
      if (garage) {
        // Closer, higher three-quarter view with the car right of the menu
        const car = s.player;
        const a = car.h + Math.PI + 0.55;
        const base = car.cy - COM_H;
        const pos = new THREE.Vector3(car.x + Math.sin(a) * 7, base + 2.6, car.z + Math.cos(a) * 7);
        const dx = car.x - pos.x;
        const dz = car.z - pos.z;
        const len = Math.hypot(dx, dz) || 1;
        view = { pos, look: new THREE.Vector3(car.x + (dz / len) * 1.8, base + 0.6, car.z - (dx / len) * 1.8) };
      }
      s.camPos.lerp(view.pos, 1 - Math.exp(-dt * 4.2));
      s.camLook.lerp(view.look, 1 - Math.exp(-dt * 9));
      const speed = Math.abs(s.player.vF);
      camera.fov = lerp(camera.fov, 56 + Math.min(1, speed / VMAX) * 16, 1 - Math.exp(-dt * 3));
    }
    s.shake *= Math.exp(-dt * 7);
    camera.position.copy(s.camPos);
    if (s.shake > 0.01) {
      camera.position.x += (Math.random() - 0.5) * s.shake;
      camera.position.y += (Math.random() - 0.5) * s.shake;
    }
    camera.lookAt(s.camLook);
    camera.updateProjectionMatrix();

    if (s.sun) {
      const c = s.phase === 'intro' ? carRoot.position : s.player;
      const o = weather.current.sunOffset;
      s.sun.position.set(c.x + o.x, o.y, c.z + o.z);
      s.sun.target.position.set(c.x, 0, c.z);
      s.sun.target.updateMatrixWorld();
    }

    weather.current.update(dt, world, s.rigs, s.cars);

    const scale = size.height * state.viewport.dpr * 0.5;
    fx.update(dt, scale);
    skids.update(dt);
  });

  return (
    <>
      {/* keyed: a new object alone doesn't make R3F swap a primitive */}
      <primitive key={worldGroup.uuid} object={worldGroup} />
      {tags.map((t) => t.root && <NameTag key={t.id} root={t.root} name={t.name} />)}
    </>
  );
}

// What other clients need to draw a car
function snapshot(c) {
  const r3 = (v) => Math.round(v * 1000) / 1000;
  return {
    id: c.id, x: r2(c.x), z: r2(c.z), y: r2(c.cy), h: r2(c.h), vx: r2(c.vx), vz: r2(c.vz),
    s: r2(c.steerAngle || 0), q: [r3(c.q.x), r3(c.q.y), r3(c.q.z), r3(c.q.w)], l: c.lap, i: c.idx, g: c.grounded ? 1 : 0,
    f: c.finished ? 1 : 0, ft: c.finishTime,
  };
}

function standings(cars, track) {
  return [...cars].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return progressOf(b, track) - progressOf(a, track);
  });
}
