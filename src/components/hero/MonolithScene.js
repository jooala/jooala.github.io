import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  rng, loadConcreteTexture, makeSignTexture, projectUVs, rubbleGeometry, buildCarRig, placeOnLedge, HERO_CAR, HERO_CAM,
} from './sceneAssets';
import { getGame, useGame, actions } from '../rally/gameStore';
import Arrow from '../ui/Arrow';

// The rally minigame is its own chunk. It's fetched, built and its shaders
// compiled in idle time once the hero has settled (or as soon as the car is
// hovered), so clicking the car doesn't stall.
let rallyModule = null;
const loadRally = () =>
  import('../rally/RallyWorld').then((m) => {
    rallyModule = m;
    return m;
  });
const RallyWorld = lazy(loadRally);
// The hero intro (name, blue field, blocks, 3D fade) is done by then
const INTRO_MS = 3500;
const whenIdle = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 60));
let warming = null;
// Building the world is a long main-thread task: never run it while the
// visitor is hovering the car or the camera is easing in/out (it would stutter)
function whenCalm(cb) {
  whenIdle(() => {
    if (focus.target === 0 && focus.value < 0.01) cb();
    else setTimeout(() => whenCalm(cb), 400);
  });
}
function warmRallyWorld(gl, scene, camera) {
  if (!warming) {
    warming = loadRally()
      .then((m) => new Promise((done) => whenCalm(() => done(m.warmRally(gl, scene, camera)))))
      .catch(() => {})
      .finally(() => {
        warming = null;
      });
  }
  return warming;
}

// ── Composition ─────────────────────────────────────────────────────────────
// [width, height, depth], [x, y, z], optional rotation and tint index.
const BLOCKS = [
  // Core tower + fins
  { s: [2.2, 8.2, 2.4], p: [1.3, 4.0, -0.8] },
  { s: [0.24, 5.4, 0.5], p: [0.42, 5.1, 0.62], t: 1 },
  { s: [0.24, 5.4, 0.5], p: [2.18, 5.1, 0.62], t: 1 },
  // Recessed slot in the core
  { s: [0.9, 2.6, 0.12], p: [1.3, 5.6, 0.42], t: 2 },
  // Top cantilever + crown + downstand beams
  { s: [7.4, 0.78, 3.3], p: [0.0, 8.45, -0.55] },
  { s: [3.6, 1.15, 2.7], p: [1.95, 9.4, -0.95], t: 1 },
  { s: [0.5, 0.62, 3.3], p: [-3.35, 7.76, -0.55], t: 2 },
  { s: [0.5, 0.62, 3.3], p: [-1.4, 7.76, -0.55], t: 2 },
  // Car ledge + edge upstand + supporting blade
  { s: [5.8, 0.62, 4.3], p: [-1.55, 3.6, 0.6] },
  { s: [0.75, 3.6, 3.1], p: [-3.95, 1.6, 0.15], t: 1 },
  { s: [0.6, 2.4, 2.0], p: [-0.9, 2.1, -0.4], t: 2 },
  // Plinth, stepped
  { s: [7.6, 1.5, 5.2], p: [0.3, 0.25, 0.3], t: 2 },
  { s: [3.6, 0.9, 2.2], p: [3.2, 1.2, 1.4], t: 1 },
  // Broken slabs at the foot
  { s: [2.6, 0.38, 1.7], p: [4.6, 1.15, 3.1], r: [0.28, 0.5, 0.22] },
  { s: [2.0, 0.34, 1.3], p: [-3.2, 1.05, 3.4], r: [-0.18, -0.4, -0.3], t: 1 },
  { s: [1.4, 0.3, 1.0], p: [1.0, 1.0, 3.6], r: [0.12, 0.9, -0.12], t: 2 },
];

// Stair from the ledge down onto the plinth
const STEPS = Array.from({ length: 7 }, (_, i) => {
  const top = 3.91 - (i + 1) * 0.4;
  const bottom = 1.0;
  return { s: [0.46, top - bottom, 1.7], p: [1.62 + i * 0.46, (top + bottom) / 2, 1.42], t: i % 2 };
});

const TINTS = ['#f1efe9', '#e1ded6', '#cfccc4'];

function Structure({ concrete }) {
  const items = useMemo(() => {
    const r = rng(42);
    return [...BLOCKS, ...STEPS].map((b) => {
      const [w, h, d] = b.s;
      const radius = Math.min(0.045, Math.min(w, h, d) / 2.5);
      const geo = projectUVs(new RoundedBoxGeometry(w, h, d, 2, radius), 0.42, r);
      return { geo, ...b };
    });
  }, []);

  const rubble = useMemo(() => {
    const r = rng(7);
    const out = [];
    const zones = [
      { x: [-4.5, 5.5], z: [3.0, 5.4], y: 0.9, n: 30, size: [0.12, 0.42] },
      { x: [3.6, 6.5], z: [-1.5, 3.0], y: 1.0, n: 14, size: [0.15, 0.5] },
    ];
    zones.forEach((zone) => {
      for (let i = 0; i < zone.n; i++) {
        const size = zone.size[0] + r() * (zone.size[1] - zone.size[0]);
        out.push({
          geo: rubbleGeometry(r, size),
          p: [zone.x[0] + r() * (zone.x[1] - zone.x[0]), zone.y + r() * 0.15, zone.z[0] + r() * (zone.z[1] - zone.z[0])],
          r: [r() * 3, r() * 3, r() * 3],
          t: Math.floor(r() * 3),
        });
      }
    });
    return out;
  }, []);

  return (
    <group>
      {items.map((b, i) => (
        <mesh
          key={i}
          geometry={b.geo}
          material={concrete[b.t || 0]}
          position={b.p}
          rotation={b.r || [0, 0, 0]}
          castShadow
          receiveShadow
        />
      ))}
      {rubble.map((b, i) => (
        <mesh key={`r${i}`} geometry={b.geo} material={concrete[b.t]} position={b.p} rotation={b.r} castShadow receiveShadow />
      ))}
    </group>
  );
}

function Steel() {
  const { steel, rust } = useMemo(
    () => ({
      steel: new THREE.MeshStandardMaterial({ color: '#2c2c2b', metalness: 0.55, roughness: 0.5 }),
      rust: new THREE.MeshStandardMaterial({ color: '#b8401f', metalness: 0.3, roughness: 0.6 }),
    }),
    []
  );

  // Billboard truss on the cantilever
  const truss = useMemo(() => {
    const parts = [];
    const x0 = -3.6;
    const x1 = -0.6;
    const yb = 9.85;
    const yt = 11.5;
    const z = -1.4;
    const t = 0.1;
    [x0, x1].forEach((x) => parts.push({ s: [0.14, 3.0, 0.14], p: [x, 10.3, z] }));
    parts.push({ s: [x1 - x0 + t, t, t], p: [(x0 + x1) / 2, yb, z] });
    parts.push({ s: [x1 - x0 + t, t, t], p: [(x0 + x1) / 2, yt, z] });
    const dx = x1 - x0;
    const dy = yt - yb;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    parts.push({ s: [len, 0.06, 0.06], p: [(x0 + x1) / 2, (yb + yt) / 2, z], r: [0, 0, ang] });
    parts.push({ s: [len, 0.06, 0.06], p: [(x0 + x1) / 2, (yb + yt) / 2, z], r: [0, 0, -ang] });
    parts.push({ s: [0.06, dy, 0.06], p: [(x0 + x1) / 2, (yb + yt) / 2, z] });
    // walkway
    parts.push({ s: [dx + 0.6, 0.05, 0.5], p: [(x0 + x1) / 2, yb - 0.05, z + 0.35] });
    return parts;
  }, []);

  // Railing along the crown and cantilever edge
  const rails = useMemo(() => {
    const parts = [];
    const z = 1.05;
    const y0 = 8.84;
    for (let x = -3.5; x <= 3.6; x += 0.5) parts.push({ s: [0.045, 0.9, 0.045], p: [x, y0 + 0.45, z] });
    parts.push({ s: [7.15, 0.05, 0.05], p: [0.05, y0 + 0.9, z] });
    parts.push({ s: [7.15, 0.035, 0.035], p: [0.05, y0 + 0.48, z] });
    return parts;
  }, []);

  // Rebar sticking out of the broken slabs
  const rebar = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: 9 }, (_, i) => ({
      s: [0.03, 0.5 + r() * 0.7, 0.03],
      p: [5.5 + r() * 0.5, 1.4 + r() * 0.3, 2.4 + i * 0.12],
      r: [0.4 + r() * 0.6, 0, -0.6 - r() * 0.7],
    }));
  }, []);

  return (
    <group>
      {truss.map((b, i) => (
        <mesh key={`t${i}`} position={b.p} rotation={b.r || [0, 0, 0]} material={steel} castShadow receiveShadow>
          <boxGeometry args={b.s} />
        </mesh>
      ))}
      {rails.map((b, i) => (
        <mesh key={`r${i}`} position={b.p} material={rust} castShadow>
          <boxGeometry args={b.s} />
        </mesh>
      ))}
      {rebar.map((b, i) => (
        <mesh key={`b${i}`} position={b.p} rotation={b.r} material={rust} castShadow>
          <boxGeometry args={b.s} />
        </mesh>
      ))}
    </group>
  );
}

function Sign() {
  const mat = useMemo(() => (() => { const map = makeSignTexture(); return new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: '#ffffff', emissiveIntensity: 0.22, roughness: 0.75 }); })(), []);
  return (
    <mesh position={[2.43, 6.5, -0.15]} rotation={[0, Math.PI / 2, 0]} material={mat} castShadow receiveShadow>
      <boxGeometry args={[1.25, 1.55, 0.05]} />
    </mesh>
  );
}

// Hovering the car or its tag swings the camera round to the left and in
// towards the car, as if picking it. The rig turns and closes in about the
// car itself, so the car stays put on screen while it grows and turns (and
// the pointer stays on it). Shared by Car (pointer) and Rig (camera).
const focus = { target: 0, value: 0, timer: null };
function setFocus(on, invalidate) {
  clearTimeout(focus.timer);
  if (on) focus.target = 1;
  // a brief grace period so moving between the car and its tag doesn't snap back
  else focus.timer = setTimeout(() => {
    focus.target = 0;
    invalidate();
  }, 80);
  invalidate();
}

// The player's car: click it (or its tag) to start the rally minigame
function Car({ carRoot, onStart }) {
  const [hover, setHover] = useState(false);
  const phase = useGame((s) => s.phase);
  const preparing = useGame((s) => s.preparing);
  const { invalidate, gl, scene, camera } = useThree();
  // Pointing at the car is a strong hint: fetch the game code now (network
  // only; the world itself is built once the pointer has left, see whenCalm)
  useEffect(() => {
    if (hover) loadRally().catch(() => {});
  }, [hover]);
  const idle = phase === 'off';

  const start = (e) => {
    e?.stopPropagation?.();
    if (getGame().phase === 'off') onStart?.();
  };

  return (
    <group
      onClick={onStart ? start : undefined}
      onPointerOver={(e) => {
        if (!onStart || !idle) return;
        e.stopPropagation();
        setHover(true);
        setFocus(true, invalidate);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        setFocus(false, invalidate);
        document.body.style.cursor = '';
      }}
    >
      <primitive object={carRoot} />
      {onStart && idle && (
        // Invisible hover area over the car and down to its tag, so moving
        // from one to the other never drops the hover
        <mesh position={[HERO_CAR.x, HERO_CAR.y + 0.4, HERO_CAR.z + 0.2]} rotation={[0, HERO_CAR.heading, 0]}>
          <boxGeometry args={[2.1, 1.9, 4.3]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
      )}
      {onStart && idle && (
        <Html position={[HERO_CAR.x, HERO_CAR.y - 0.75, HERO_CAR.z + 0.4]} center zIndexRange={[4, 0]}>
          <button
            type="button"
            tabIndex={-1}
            className={['race-tag', hover && 'is-hover', preparing && 'is-loading'].filter(Boolean).join(' ')}
            onClick={start}
            onPointerEnter={() => {
              setHover(true);
              setFocus(true, invalidate);
            }}
            onPointerLeave={() => {
              setHover(false);
              setFocus(false, invalidate);
            }}
          >
            <span className="race-tag__kicker mono">{preparing ? 'Loading the circuit' : 'Rally · Minigame'}</span>
            <span className="race-tag__label display">Take it for a spin</span>
            <span className="race-tag__go" aria-hidden="true">
              {preparing ? <span className="race-tag__spin" /> : <Arrow size={20} strokeWidth={2} />}
            </span>
          </button>
        </Html>
      )}
    </group>
  );
}

// ── Camera rig: pointer + scroll parallax, rendered on demand ──────────────
const CAM_POS = HERO_CAM.position;
const FADE_MS = 650; // matches the canvas fade in hero.css
const CAM_TARGET = HERO_CAM.target;

// Focused view: the whole rig turned 26° to the left about the car and
// pulled in to 62 % of the distance
const FOCUS_PIVOT = new THREE.Vector3(HERO_CAR.x, HERO_CAR.y + 0.55, HERO_CAR.z);
const FOCUS_TURN = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.45);
const toFocus = (v) => v.clone().sub(FOCUS_PIVOT).applyQuaternion(FOCUS_TURN).multiplyScalar(0.62).add(FOCUS_PIVOT);
const FOCUS_POS = toFocus(CAM_POS);
const FOCUS_TARGET = toFocus(CAM_TARGET);
const LOOK = new THREE.Vector3();

function Rig({ containerRef, interactive, onReady, onWarm }) {
  const { camera, invalidate, gl, scene } = useThree();
  const target = useRef({ x: 0, y: 0, s: 0 });
  const current = useRef({ x: 0, y: 0, s: 0 });
  const visible = useRef(true);
  // No parallax while the canvas fades in over the matching poster
  const settleUntil = useRef(Infinity);

  useEffect(() => {
    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_TARGET);
    // Compile the shaders first (in parallel, off the main thread where the
    // browser supports it), then draw the first frame, then signal readiness
    let alive = true;
    let settle;
    let raf;
    const warm = gl.compileAsync ? gl.compileAsync(scene, camera) : Promise.resolve();
    warm
      .catch(() => {})
      .then(() => {
        if (!alive) return;
        onWarm?.();
        raf = requestAnimationFrame(() => {
          invalidate();
          raf = requestAnimationFrame(() => {
            raf = requestAnimationFrame(() => {
              onReady?.();
              settleUntil.current = performance.now() + FADE_MS;
              settle = setTimeout(invalidate, FADE_MS + 20);
            });
          });
        });
      });

    if (process.env.NODE_ENV !== 'production') {
      window.__captureHero = () => {
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/png');
      };
    }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [camera, gl, scene, invalidate, onReady, onWarm]);

  useEffect(() => {
    if (!interactive) return undefined;
    const el = containerRef.current;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    if (el) io.observe(el);

    const onMove = (e) => {
      if (!visible.current || getGame().phase !== 'off') return;
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    const onScroll = () => {
      if (!visible.current) return;
      target.current.s = Math.min(1, window.scrollY / window.innerHeight);
      invalidate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [interactive, containerRef, invalidate]);

  // Back from the game: redraw the hero once
  const phase = useGame((s) => s.phase);
  useEffect(() => {
    if (phase === 'off') invalidate();
  }, [phase, invalidate]);

  useFrame((_, dt) => {
    if (getGame().phase !== 'off') {
      focus.target = 0;
      focus.value = 0;
      return;
    }
    if (performance.now() < settleUntil.current) return;
    const c = current.current;
    const t = target.current;
    const k = 1 - Math.exp(-dt * 3.2);
    c.x += (t.x - c.x) * k;
    c.y += (t.y - c.y) * k;
    c.s += (t.s - c.s) * k;
    // ease in calmly, ease back out quickly
    const rate = focus.target < focus.value ? 9 : 3.4;
    focus.value += (focus.target - focus.value) * (1 - Math.exp(-dt * rate));
    const f = focus.value * focus.value * (3 - 2 * focus.value);
    // parallax offsets ride on top of the (focused or not) framing
    camera.position.lerpVectors(CAM_POS, FOCUS_POS, f);
    camera.position.x -= c.x * 0.9;
    camera.position.y += c.y * 0.35 + c.s * 1.6;
    LOOK.lerpVectors(CAM_TARGET, FOCUS_TARGET, f);
    camera.lookAt(LOOK.x, LOOK.y + c.s * 0.9, LOOK.z);
    const moving = Math.abs(t.x - c.x) + Math.abs(t.y - c.y) + Math.abs(t.s - c.s) + Math.abs(focus.target - focus.value);
    if (moving > 0.0005) invalidate();
  });

  return null;
}

function Scene({ containerRef, interactive, onReady, onWarm, onStartGame }) {
  const phase = useGame((s) => s.phase);
  const { gl, scene, camera } = useThree();
  const carRoot = useMemo(() => {
    const root = buildCarRig();
    placeOnLedge(root);
    // Headlights for night races: always in the scene (off here) so adding
    // them never changes the light count and recompiles every shader
    const head = new THREE.SpotLight('#fff0d4', 0, 60, 0.42, 0.8, 1.6);
    head.name = 'headlight';
    head.position.set(0, 0.75, 1.7);
    head.target.position.set(0, -0.6, 20);
    root.add(head, head.target);
    return root;
  }, []);

  // Prepare the game once the hero has settled. Building the race world is
  // heavy main-thread work, so it waits until the page's intro animation has
  // played out: on first load that's after the loader lifts (see
  // _document.js), not a fixed time after this mounts.
  useEffect(() => {
    if (!onStartGame) return undefined;
    const root = document.documentElement;
    let t;
    const schedule = () => {
      observer.disconnect();
      t = setTimeout(() => warmRallyWorld(gl, scene, camera), INTRO_MS);
    };
    const observer = new MutationObserver(() => {
      if (!root.classList.contains('preload')) schedule();
    });
    if (root.classList.contains('preload')) observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    else schedule();
    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, [onStartGame, gl, scene, camera]);

  // Hero.startGame asks these first, so the race world is built and compiled
  // before the transition starts instead of in the middle of it
  useEffect(() => {
    actions.isGameReady = () => !!rallyModule?.isRallyReady();
    actions.prepareGame = () => loadRally().then((m) => m.warmRally(gl, scene, camera));
    return () => {
      delete actions.isGameReady;
      delete actions.prepareGame;
    };
  }, [gl, scene, camera]);

  // After a race, build the next one in the background so a rematch starts instantly
  const wasPlaying = useRef(false);
  useEffect(() => {
    if (phase !== 'off') {
      wasPlaying.current = true;
      return undefined;
    }
    if (!wasPlaying.current || !onStartGame) return undefined;
    wasPlaying.current = false;
    const t = setTimeout(() => warmRallyWorld(gl, scene, camera), 4000);
    return () => clearTimeout(t);
  }, [phase, onStartGame, gl, scene, camera]);

  // The concrete texture is drawn in a worker; the scene starts once it's in
  const [concreteMap, setConcreteMap] = useState(null);
  useEffect(() => {
    let alive = true;
    loadConcreteTexture().then((map) => (alive ? setConcreteMap(map) : map.dispose()));
    return () => {
      alive = false;
    };
  }, []);
  const concrete = useMemo(
    () =>
      concreteMap &&
      TINTS.map(
        (color) => new THREE.MeshStandardMaterial({ color, map: concreteMap, bumpMap: concreteMap, bumpScale: 1.6, roughness: 0.94 })
      ),
    [concreteMap]
  );
  if (!concrete) return null;

  return (
    <>
      <hemisphereLight name="hemi" args={['#f4f2ec', '#57564f', 0.55]} />
      <directionalLight
        name="sun"
        position={[-9, 16, 12]}
        intensity={3.1}
        color="#fff8ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.035}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={13}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      <directionalLight name="fill" position={[12, 5, -8]} intensity={0.45} color="#dfe7ff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.42}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 6]} scale={[24, 8, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.7} color="#1769e0" position={[12, 3, 0]} scale={[8, 12, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} position={[-12, 3, 6]} scale={[10, 8, 1]} rotation-y={Math.PI / 2} />
      </Environment>

      <Structure concrete={concrete} />
      <Steel />
      <Sign />
      <Car carRoot={carRoot} onStart={onStartGame} />
      <Rig containerRef={containerRef} interactive={interactive} onReady={onReady} onWarm={onWarm} />
      {phase !== 'off' && (
        <Suspense fallback={null}>
          <RallyWorld carRoot={carRoot} />
        </Suspense>
      )}
    </>
  );
}

export default function MonolithScene({ interactive = true, onReady, onStartGame, className = '' }) {
  const containerRef = useRef(null);
  // The game renders continuously; the hero only when something changes
  const playing = useGame((st) => st.phase !== 'off');
  // Drop the resolution for the game only once the unfold is over: resizing
  // the canvas mid-transition is a visible hitch
  const gameRes = useGame((st) => !['off', 'loading', 'intro'].includes(st.phase));
  const [touch] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches);
  // Nothing is drawn until the shaders are compiled (see Rig)
  const [warm, setWarm] = useState(false);
  const onWarm = useCallback(() => setWarm(true), []);
  return (
    <div ref={containerRef} className={className}>
      <Canvas
        frameloop={playing ? 'always' : warm ? 'demand' : 'never'}
        // 'percentage' (PCF), not 'soft': three.js deprecated PCF-soft and swaps it
        // for PCF on the first shadow pass, but R3F re-applies 'soft' whenever the
        // canvas props change (e.g. when the game starts). That flip changes every
        // shader and recompiles the whole scene mid-transition.
        shadows="percentage"
        dpr={gameRes ? (touch ? [1, 1.15] : [1, 1.35]) : [1, touch ? 1.5 : 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: HERO_CAM.fov, near: 0.5, far: 600, position: CAM_POS.toArray() }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Scene containerRef={containerRef} interactive={interactive} onReady={onReady} onWarm={onWarm} onStartGame={onStartGame} />
      </Canvas>
    </div>
  );
}
