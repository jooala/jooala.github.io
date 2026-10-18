// The rally minigame. Mounted inside the hero canvas when the car is clicked:
// unfolds the hero frame to full screen, raises today's circuit, jumps the car
// onto the grid, then runs solo races against 9 AI drivers or online races
// with friends (Supabase Realtime rooms), and restores the hero on unmount.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { buildCarRig, placeOnLedge, HERO_CAM, HERO_CAR } from '../hero/sceneAssets';
import { buildTrack, buildWorld, trackPoint, dayKey, GRID, GRID_SIZE, TOTAL_LAPS } from './track';
import {
  createCar, stepCar, aiInput, collideCars, updateLap, progressOf, respawn, VMAX,
} from './physics';
import { getGame, setGame, live, actions, toggleFullscreen } from './gameStore';
import {
  updateEngine, silenceEngine, beep, thud, crash, updateScrape, setMuted, isMuted,
} from './audio';
import { openRoom, makeRoomCode, clientId, cleanName, saveName } from './net';
import Effects from './particles';
import Skids from './skids';

const AI_SPECS = [
  { name: 'Routa', livery: { body: '#1769e0', stripe: '#f2efe8', accent: '#111111', number: '12', name: 'ROUTA' }, skill: 0.99, bias: 1.2, phase: 2.1 },
  { name: 'Betoni', livery: { body: '#a19f99', stripe: '#111111', accent: '#ff6a3d', number: '07', name: 'BETONI' }, skill: 0.97, bias: -1.4, phase: 0.4 },
  { name: 'Kivi', livery: { body: '#1d1d1c', stripe: '#ff6a3d', accent: '#f2efe8', number: '33', name: 'KIVI' }, skill: 0.95, bias: 0.3, phase: 4.0 },
  { name: 'Halla', livery: { body: '#f2efe8', stripe: '#ff6a3d', accent: '#1769e0', number: '04', name: 'HALLA' }, skill: 0.96, bias: -0.6, phase: 1.3 },
  { name: 'Sora', livery: { body: '#6b6a64', stripe: '#1769e0', accent: '#f2efe8', number: '19', name: 'SORA' }, skill: 0.93, bias: 0.9, phase: 3.3 },
  { name: 'Teräs', livery: { body: '#2b3a4a', stripe: '#f2efe8', accent: '#ff6a3d', number: '88', name: 'TERÄS' }, skill: 0.94, bias: -1.0, phase: 5.2 },
  { name: 'Usva', livery: { body: '#cfccc4', stripe: '#111111', accent: '#1769e0', number: '21', name: 'USVA' }, skill: 0.91, bias: 1.5, phase: 0.9 },
  { name: 'Kuura', livery: { body: '#ff6a3d', stripe: '#111111', accent: '#f2efe8', number: '55', name: 'KUURA' }, skill: 0.92, bias: -1.8, phase: 2.7 },
  { name: 'Rouhe', livery: { body: '#3d3c38', stripe: '#cfccc4', accent: '#ff6a3d', number: '61', name: 'ROUHE' }, skill: 0.89, bias: 0.0, phase: 4.6 },
];
const HUMAN_COLORS = ['#111111', '#1769e0', '#ff6a3d', '#5b6b4a', '#7a2f2f', '#2e5f7a', '#c8a032', '#593c7a'];
const PLAYER_AUTOPILOT = { skill: 0.82, bias: 0, phase: 1 };
const SOLO_SLOT = GRID_SIZE - 1;

const INTRO = { expand: 1.5, jumpAt: 1.15, jump: 1.7, end: 3.9 };
const ESTABLISH = { position: new THREE.Vector3(56, 46, 84), target: new THREE.Vector3(0, 2, 6), fov: 52 };
const FOG = new THREE.Color('#d6d3cc');
const SEND_STATE = 1 / 12;
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
    handbrake: keys.hand,
  };
}

function poseCar(root, car) {
  root.position.set(car.x, car.y, car.z);
  root.rotation.y = car.h;
  const { tilt, wheels } = root.userData;
  tilt.rotation.x = car.pitch;
  tilt.rotation.z = -car.roll;
  wheels.forEach((w) => {
    const yaw = w.front ? -car.steer * 0.42 : 0;
    w.tire.rotation.y = yaw;
    w.rim.rotation.set(0, w.base + yaw, car.wheelSpin * w.side);
  });
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

export default function RallyWorld({ carRoot }) {
  const { scene, camera, gl } = useThree();
  const keys = useRef({});
  const sim = useRef(null);
  const [tags, setTags] = useState([]);
  const day = useMemo(() => dayKey(), []);

  const data = useMemo(() => {
    const track = buildTrack(day);
    const world = buildWorld(track);
    const fx = new Effects();
    world.group.add(fx.group);
    const skids = new Skids();
    world.group.add(skids.mesh);

    const aiRoots = AI_SPECS.map((spec) => {
      const root = buildCarRig(spec.livery);
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

    return { track, world, fx, skids, aiRoots, humanRoots: new Map(), map };
  }, [day]);

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
        name: (p.name || 'DRIVER').toUpperCase(),
      });
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
      } else if (k < AI_SPECS.length) {
        const spec = AI_SPECS[k];
        const car = createCar(track, GRID[slot], {
          id: `ai${slot}`,
          name: spec.name,
          ai: { skill: spec.skill, bias: spec.bias, phase: spec.phase },
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
    const { world, fx, skids, aiRoots, map } = data;
    const sun = scene.getObjectByName('sun');
    const saved = {
      fog: scene.fog,
      sun: sun && {
        position: sun.position.clone(),
        bounds: [sun.shadow.camera.left, sun.shadow.camera.right, sun.shadow.camera.top, sun.shadow.camera.bottom],
        far: sun.shadow.camera.far,
      },
    };
    scene.fog = new THREE.Fog(FOG, 80, 340);
    if (sun) {
      Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, far: 160 });
      sun.shadow.camera.updateProjectionMatrix();
    }
    camera.manual = true;

    const field = setupField([{ id: clientId, name: 'You', slot: SOLO_SLOT }], { online: false, isHost: true });

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

    try {
      gl.compile(scene, camera);
    } catch {
      /* not fatal */
    }

    // QA hook (dev builds, or ?rallydebug): jump to the crest or the finish
    if (process.env.NODE_ENV !== 'production' || window.location.search.includes('rallydebug')) {
      const place = (idx, speed) => {
        const { player } = sim.current;
        const p = trackPoint(data.track, idx, 0);
        Object.assign(player, { x: p.x, z: p.z, y: p.y, h: p.heading, idx, prevIdx: idx, prevGround: p.y, vy: 0 });
        player.vx = Math.sin(p.heading) * speed;
        player.vz = Math.cos(p.heading) * speed;
      };
      window.__rally = {
        state: () => sim.current,
        toJump: () => place(data.track.jump - 40, 36),
        toFinish: () => {
          const { player } = sim.current;
          player.lap = TOTAL_LAPS;
          player.cp = true;
          place(data.track.N - 25, 34);
        },
      };
    }

    setGame({
      phase: 'intro',
      day,
      totalLaps: TOTAL_LAPS,
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
      sim.current?.room?.leave();
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
      placeOnLedge(carRoot);
      silenceEngine();
      live.map = null;
      fx.dispose();
      skids.dispose();
      const disposeRig = (root) =>
        root.traverse((o) => {
          if (o.isMesh) {
            o.geometry.dispose();
            [].concat(o.material).forEach((m) => {
              m.map?.dispose();
              m.dispose();
            });
          }
        });
      aiRoots.forEach(disposeRig);
      data.humanRoots.forEach(disposeRig);
      world.dispose();
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
      setGame({ phase: 'countdown', countdown: 3, lap: 0, position: field.cars.length, cars: field.cars.length, results: null, wrongWay: false });
    };

    const toLobby = () => {
      const st = s();
      st.phase = 'lobby';
      silenceEngine();
      updateScrape(0);
      st.room?.setStatus('lobby');
      setGame({ phase: 'lobby', results: null, wrongWay: false });
    };

    const attachRoom = (room) => {
      const st = s();
      st.room = room;
      st.online = true;
      st.isHost = room.isHost;
      room.on('players', (players) => {
        const cur = getGame().room;
        setGame({ room: { ...(cur || {}), code: room.code, isHost: room.isHost, players } });
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
        room.on('start', (p) => begin(p.roster));
        room.on('lobby', () => toLobby());
      }
      setGame({ phase: 'lobby', room: { code: room.code, isHost: room.isHost, players: room.players() }, menuError: null, busy: false });
      st.phase = 'lobby';
    };

    actions.solo = (name) => {
      const n = cleanName(name) || 'You';
      saveName(n);
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
        attachRoom(await openRoom(makeRoomCode(), { name: n, host: true }));
      } catch (e) {
        setGame({ busy: false, menuError: e.message });
      }
    };

    actions.joinRoom = async (code, name) => {
      const n = cleanName(name) || 'Driver';
      saveName(n);
      setGame({ busy: true, menuError: null });
      try {
        attachRoom(await openRoom(code, { name: n, host: false }));
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
      const roster = players.map((p, i) => ({ id: p.id, name: p.name, slot: GRID_SIZE - 1 - i }));
      st.room.setStatus('racing');
      st.room.send('start', { roster, day });
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
      if (e.code === 'KeyR' && s()?.phase === 'race') respawn(s().player, data.track);
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
      ['solo', 'createRoom', 'joinRoom', 'leaveRoom', 'hostStart', 'toLobby'].forEach((k) => delete actions[k]);
      actions.restart = () => {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Frame loop ──────────────────────────────────────────────────────────
  useFrame((state, rawDt) => {
    const s = sim.current;
    if (!s) return;
    const dt = Math.min(rawDt, 0.1);
    const { track, world, fx, skids, aiRoots } = data;
    const { size } = state;
    s.t += dt;

    const fwdOf = (car) => [Math.sin(car.h), Math.cos(car.h)];
    const chase = (() => {
      const car = s.player;
      const [fx_, fz] = fwdOf(car);
      const speed = Math.abs(car.vF);
      const back = 8.4 + speed * 0.045;
      return {
        pos: new THREE.Vector3(car.x - fx_ * back, car.y + 3.2 + (car.grounded ? 0 : 0.8), car.z - fz * back),
        look: new THREE.Vector3(car.x + fx_ * 6, car.y + 1.1, car.z + fz * 6),
      };
    })();

    // ── Intro ──
    if (s.phase === 'intro') {
      const t = s.t;
      const rect = getGame().heroRect;
      const p = ease(clamp01(t / INTRO.expand));

      const w = (t - 0.1) / 1.8;
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

    // ── Menu / lobby: idle on the grid, engine ticking over ──
    if (s.phase === 'menu' || s.phase === 'lobby') {
      updateEngine(3, false, 0);
    }

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
        car.y += (snap.y - car.y) * k;
        car.h = lerpAngle(car.h, snap.h, k);
        car.vx = snap.vx;
        car.vz = snap.vz;
        car.steer = snap.s;
        car.pitch = snap.p;
        car.roll = snap.r;
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
            const gap = pProg - progressOf(car, track);
            const rubber = car.isPlayer ? 1 : 1 + Math.max(-0.07, Math.min(0.08, gap / 260));
            input = aiInput(car, track, rubber, active);
          } else {
            input = readKeys(keys.current);
          }
          stepCar(car, input, h, track);
          car.input = input;
          if (updateLap(car, track, s.raceTime) && car.lap > TOTAL_LAPS && !car.finished) {
            car.finished = true;
            car.finishTime = s.raceTime;
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

        // Walls: sparks on hits, a shower while scraping
        if (car.wallHit) {
          const w = car.wallHit;
          if (w.strength > 1.5) {
            fx.sparks(w.x, car.y + 0.5, w.z, car.vx, car.vz, Math.round(6 + w.strength * 1.5), 4 + w.strength * 0.3);
            fx.debris(w.x, car.y + 0.4, w.z, car.vx * 0.2, car.vz * 0.2, 3);
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
            fx.sparks(car.wall.x, car.y + 0.45, car.wall.z, car.vx, car.vz, 1, 3);
          }
          if (car.isPlayer) scrape = car.wall.scrape;
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
          s.room.send('state', {
            id: c.id, x: r2(c.x), z: r2(c.z), y: r2(c.y), h: r2(c.h), vx: r2(c.vx), vz: r2(c.vz),
            s: r2(c.steer), p: r2(c.pitch), r: r2(c.roll), l: c.lap, i: c.idx, g: c.grounded ? 1 : 0,
            f: c.finished ? 1 : 0, ft: c.finishTime, bl: c.bestLap,
          });
        }
        if (s.isHost) {
          s.sendAiT += dt;
          if (s.sendAiT >= SEND_AI) {
            s.sendAiT = 0;
            s.room.send('ai', {
              cars: cars.filter((c) => c.ai && !c.human).map((c) => ({
                id: c.id, x: r2(c.x), z: r2(c.z), y: r2(c.y), h: r2(c.h), vx: r2(c.vx), vz: r2(c.vz),
                s: r2(c.steer), p: r2(c.pitch), r: r2(c.roll), l: c.lap, i: c.idx, g: c.grounded ? 1 : 0,
                f: c.finished ? 1 : 0, ft: c.finishTime,
              })),
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
        let best = null;
        try {
          best = Number(window.localStorage.getItem('ja-rally-best')) || null;
          if (!best || player.finishTime < best) window.localStorage.setItem('ja-rally-best', String(player.finishTime));
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
            newBest: !best || player.finishTime < best,
            day,
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
        const lap = Math.min(TOTAL_LAPS, Math.max(1, player.lap));
        const [pfx, pfz] = fwdOf(player);
        const along = pfx * track.tx[player.idx] + pfz * track.tz[player.idx];
        const wrongWay = along < -0.3 && Math.abs(player.vF) > 4;
        if (position !== s.position || lap !== s.lap || wrongWay !== s.wrongWay) {
          s.position = position;
          s.lap = lap;
          s.wrongWay = wrongWay;
          setGame({ position, lap, wrongWay });
        }
        updateEngine(player.vF, player.input?.throttle, player.slip);
        live.time = s.raceTime;
      }
      live.speed = Math.abs(player.vF) * 3.6;
    }

    // ── Pose cars ──
    if (s.phase !== 'intro') {
      s.cars.forEach((car) => {
        const root = s.rigs.get(car.id);
        if (!root) return;
        root.visible = !car.stale;
        poseCar(root, car);
      });
    }
    live.cars = s.cars.map((c) => ({ x: c.x - data.map.minX, z: c.z - data.map.minZ, p: c.isPlayer, h: !!c.human }));

    // ── Camera follow ──
    if (s.phase !== 'intro') {
      s.camPos.lerp(chase.pos, 1 - Math.exp(-dt * 4.2));
      s.camLook.lerp(chase.look, 1 - Math.exp(-dt * 9));
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
      s.sun.position.set(c.x - 28, 60, c.z + 34);
      s.sun.target.position.set(c.x, 0, c.z);
      s.sun.target.updateMatrixWorld();
    }

    const scale = size.height * state.viewport.dpr * 0.5;
    fx.update(dt, scale);
    skids.update(dt);
  });

  return (
    <>
      <primitive object={data.world.group} />
      {tags.map((t) => t.root && <NameTag key={t.id} root={t.root} name={t.name} />)}
    </>
  );
}

function standings(cars, track) {
  return [...cars].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return progressOf(b, track) - progressOf(a, track);
  });
}
