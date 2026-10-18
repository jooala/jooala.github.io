import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  rng, makeConcreteTexture, makeSignTexture, projectUVs, rubbleGeometry, buildCarRig, placeOnLedge, HERO_CAR, HERO_CAM,
} from './sceneAssets';
import { getGame, useGame } from '../rally/gameStore';

// The rally minigame is its own chunk, loaded when the car is clicked
const loadRally = () => import('../rally/RallyWorld');
const RallyWorld = lazy(loadRally);

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

// The player's car: click it (or its tag) to start the rally minigame
function Car({ carRoot, onStart }) {
  const [hover, setHover] = useState(false);
  const phase = useGame((s) => s.phase);
  const { invalidate } = useThree();
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
        document.body.style.cursor = 'pointer';
        invalidate();
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = '';
        invalidate();
      }}
    >
      <primitive object={carRoot} />
      {onStart && idle && (
        <Html position={[HERO_CAR.x + 0.6, HERO_CAR.y + 2.35, HERO_CAR.z + 0.4]} center zIndexRange={[4, 0]}>
          <button type="button" tabIndex={-1} className={hover ? 'race-tag is-hover' : 'race-tag'} onClick={start}>
            Race me
          </button>
        </Html>
      )}
    </group>
  );
}

// ── Camera rig: pointer + scroll parallax, rendered on demand ──────────────
const CAM_POS = HERO_CAM.position;
const CAM_TARGET = HERO_CAM.target;

function Rig({ containerRef, interactive, onReady }) {
  const { camera, invalidate, gl, scene } = useThree();
  const target = useRef({ x: 0, y: 0, s: 0 });
  const current = useRef({ x: 0, y: 0, s: 0 });
  const visible = useRef(true);

  useEffect(() => {
    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_TARGET);
    invalidate();
    // Signal readiness after the first frame has been drawn
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => onReady?.());
    });

    if (process.env.NODE_ENV !== 'production') {
      window.__captureHero = () => {
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/png');
      };
    }
    return () => cancelAnimationFrame(raf);
  }, [camera, gl, scene, invalidate, onReady]);

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
    if (getGame().phase !== 'off') return;
    const c = current.current;
    const t = target.current;
    const k = 1 - Math.exp(-dt * 3.2);
    c.x += (t.x - c.x) * k;
    c.y += (t.y - c.y) * k;
    c.s += (t.s - c.s) * k;
    camera.position.set(CAM_POS.x - c.x * 0.9, CAM_POS.y + c.y * 0.35 + c.s * 1.6, CAM_POS.z);
    camera.lookAt(CAM_TARGET.x, CAM_TARGET.y + c.s * 0.9, CAM_TARGET.z);
    if (Math.abs(t.x - c.x) + Math.abs(t.y - c.y) + Math.abs(t.s - c.s) > 0.0005) invalidate();
  });

  return null;
}

function Scene({ containerRef, interactive, onReady, onStartGame }) {
  const phase = useGame((s) => s.phase);
  const carRoot = useMemo(() => {
    const root = buildCarRig();
    placeOnLedge(root);
    return root;
  }, []);

  // Warm up the game chunk once the hero has settled
  useEffect(() => {
    if (!onStartGame) return undefined;
    const t = setTimeout(() => {
      loadRally().catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, [onStartGame]);

  const concrete = useMemo(() => {
    const map = makeConcreteTexture();
    return TINTS.map(
      (color) => new THREE.MeshStandardMaterial({ color, map, bumpMap: map, bumpScale: 1.6, roughness: 0.94 })
    );
  }, []);

  return (
    <>
      <hemisphereLight args={['#f4f2ec', '#57564f', 0.55]} />
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
      <directionalLight position={[12, 5, -8]} intensity={0.45} color="#dfe7ff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.42}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 6]} scale={[24, 8, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.7} color="#1769e0" position={[12, 3, 0]} scale={[8, 12, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} position={[-12, 3, 6]} scale={[10, 8, 1]} rotation-y={Math.PI / 2} />
      </Environment>

      <Structure concrete={concrete} />
      <Steel />
      <Sign />
      <Car carRoot={carRoot} onStart={onStartGame} />
      <Rig containerRef={containerRef} interactive={interactive} onReady={onReady} />
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
  return (
    <div ref={containerRef} className={className}>
      <Canvas
        frameloop={playing ? 'always' : 'demand'}
        shadows="soft"
        dpr={playing ? [1, 1.35] : [1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: HERO_CAM.fov, near: 0.5, far: 600, position: CAM_POS.toArray() }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Scene containerRef={containerRef} interactive={interactive} onReady={onReady} onStartGame={onStartGame} />
      </Canvas>
    </div>
  );
}
