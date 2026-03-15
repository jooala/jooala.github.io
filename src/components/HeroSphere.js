import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── Spring physics ───────────────────────────────────────────────────────────
class Spring {
  constructor(val = 0, k = 0.055, damp = 0.76) {
    this.v = val; this.vel = 0; this.target = val; this.k = k; this.damp = damp;
  }
  step() {
    this.vel = this.vel * this.damp + (this.target - this.v) * this.k;
    this.v += this.vel;
    return this.v;
  }
}

// ─── Fixed sphere config ──────────────────────────────────────────────────────
const SPHERE = {
  preset: 0, colorTheme: 0,
  rotSpeed: 0.85, wobble: 0.27, dotSize: 0.80, pointCount: 500,
};

const BURST = { effect: 0, intensity: 0.25, speed: 0.80, param: 1.00 };

// ─── Spawn-in defaults ────────────────────────────────────────────────────────
const DEFAULT_SPAWN = { duration: 2.5, softness: 0.08 };

// ─── Shaders ──────────────────────────────────────────────────────────────────
const VERT = `
  attribute float aSize;
  attribute float aRand;

  uniform float uTime;
  uniform float uWobble;
  uniform float uExplode;
  uniform int   uEffect;
  uniform float uIntensity;
  uniform float uParam;
  uniform float uReveal;      // 0 → 1 spawn-in progress
  uniform float uRevealSoft;  // per-particle transition softness

  varying float vRim;
  varying float vAlpha;
  varying float vReveal;

  void main() {
    vec3 pos  = position;
    vec3 norm = normalize(position);
    const float PI = 3.14159265;

    float w = sin(uTime * 1.7 + norm.x * 3.8)
            * cos(uTime * 1.3 + norm.y * 2.9)
            * uWobble;
    pos += norm * w;

    if (uExplode > 0.001) {
      if (uEffect == 0) {
        float spread = 0.6 + aRand * max(uParam, 0.01);
        pos += norm * sin(uExplode * PI) * uIntensity * spread;
      } else if (uEffect == 1) {
        float freq = 3.0 + uParam * 9.0;
        float wave = sin(norm.y * freq - uExplode * PI * 3.0)
                   * sin(uExplode * PI) * uIntensity;
        pos += norm * wave;
      } else if (uEffect == 2) {
        float lat   = acos(clamp(norm.y, -1.0, 1.0));
        float front = uExplode * PI;
        float edge  = 3.0 + uParam * 12.0;
        float ring  = exp(-pow((lat - front) * edge, 2.0));
        pos += norm * ring * sin(uExplode * PI) * uIntensity * 2.2;
      } else {
        float twist    = sin(uExplode * PI) * uIntensity * 2.5;
        float gradient = 1.0 + abs(norm.y) * uParam * 3.5;
        float angle    = twist * gradient;
        float cosA = cos(angle); float sinA = sin(angle);
        float nx = pos.x * cosA - pos.z * sinA;
        float nz = pos.x * sinA + pos.z * cosA;
        pos.x = nx; pos.z = nz;
      }
    }

    vec4  worldPos = modelMatrix  * vec4(pos, 1.0);
    vec3  wNorm    = normalize((modelMatrix * vec4(norm, 0.0)).xyz);
    vec3  viewDir  = normalize(cameraPosition - worldPos.xyz);
    float rim      = 1.0 - abs(dot(wNorm, viewDir));
    vRim   = pow(clamp(rim, 0.0, 1.0), 1.5);
    vAlpha = mix(0.06, 1.0, vRim);

    // Per-particle reveal: particles with aRand near 0 appear first
    vReveal = smoothstep(aRand - uRevealSoft, aRand + uRevealSoft, uReveal);

    vec4 mvPos   = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (360.0 / -mvPos.z) * vReveal;
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const FRAG = `
  precision highp float;
  uniform vec3  uColor;
  uniform vec3  uRim;
  uniform float uPulse;

  varying float vRim;
  varying float vAlpha;
  varying float vReveal;

  void main() {
    vec2  c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;

    float alpha = smoothstep(0.5, 0.08, length(c)) * vAlpha * vReveal;
    vec3  col   = mix(uColor * 0.45, uRim, vRim);
    col += uRim * pow(vRim, 2.5) * 0.9;
    col  = mix(col, vec3(1.0), uPulse * pow(vRim, 0.5));

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Color themes ─────────────────────────────────────────────────────────────
const COLOR_THEMES = [
  { base: new THREE.Color('#7db000'), rim: new THREE.Color('#d5ff3f') },
  { base: new THREE.Color('#008844'), rim: new THREE.Color('#00ff88') },
  { base: new THREE.Color('#1144bb'), rim: new THREE.Color('#44aaff') },
  { base: new THREE.Color('#aa0066'), rim: new THREE.Color('#ff44cc') },
  { base: new THREE.Color('#555555'), rim: new THREE.Color('#ffffff') },
];

// ─── Geometry builders ────────────────────────────────────────────────────────
const R = 1.8;
function geom(positions, sizes, rands) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  g.setAttribute('aSize',    new THREE.BufferAttribute(new Float32Array(sizes), 1));
  g.setAttribute('aRand',    new THREE.BufferAttribute(new Float32Array(rands), 1));
  return g;
}
function buildNebula(count, ds) {
  const p = [], s = [], r = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1), theta = Math.random() * Math.PI * 2;
    p.push(R * Math.sin(phi) * Math.cos(theta), R * Math.sin(phi) * Math.sin(theta), R * Math.cos(phi));
    s.push(ds * (0.7 + Math.random() * 0.6)); r.push(Math.random());
  }
  return geom(p, s, r);
}
function buildGrid(ds) {
  const p = [], s = [], r = [];
  const latN = 34, lonN = 52;
  for (let lat = 0; lat <= latN; lat++) {
    const phi = (lat / latN) * Math.PI;
    const n   = Math.max(2, Math.round(lonN * Math.sin(phi)));
    for (let lon = 0; lon < n; lon++) {
      const theta = (lon / n) * Math.PI * 2;
      p.push(R * Math.sin(phi) * Math.cos(theta), R * Math.sin(phi) * Math.sin(theta), R * Math.cos(phi));
      s.push(ds * 1.05); r.push(Math.random());
    }
  }
  return geom(p, s, r);
}
function buildTorus(count, ds) {
  const p = [], s = [], r = [];
  const bigR = 1.35, smallR = 0.60;
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
    p.push((bigR + smallR * Math.cos(v)) * Math.cos(u), (bigR + smallR * Math.cos(v)) * Math.sin(u), smallR * Math.sin(v));
    s.push(ds * (0.7 + Math.random() * 0.6)); r.push(Math.random());
  }
  return geom(p, s, r);
}
function buildVortex(count, ds) {
  const p = [], s = [], r = [];
  for (let i = 0; i < count; i++) {
    const t = i / count, phi = Math.acos(1 - 2 * t), theta = t * Math.PI * 2 * 20 + phi * 0.5;
    p.push(R * Math.sin(phi) * Math.cos(theta), R * Math.sin(phi) * Math.sin(theta), R * Math.cos(phi));
    s.push(ds * (0.8 + Math.random() * 0.5)); r.push(Math.random());
  }
  return geom(p, s, r);
}
function buildFibonacci(count, ds) {
  const phi_g = (1 + Math.sqrt(5)) / 2;
  const p = [], s = [], r = [];
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / phi_g, phi = Math.acos(1 - 2 * (i + 0.5) / count);
    p.push(R * Math.sin(phi) * Math.cos(theta), R * Math.sin(phi) * Math.sin(theta), R * Math.cos(phi));
    s.push(ds * (0.9 + Math.random() * 0.25)); r.push(Math.random());
  }
  return geom(p, s, r);
}
const PRESET_BUILDERS = [buildNebula, buildGrid, buildTorus, buildVortex, buildFibonacci];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HeroSphere({ onReady }) {
  const canvasRef = useRef(null);
  const glRef     = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    let raf, mounted = true;
    const gl = glRef.current;
    const rotX = new Spring(0, 0.045, 0.82);
    const rotY = new Spring(0, 0.045, 0.82);
    let mouseNX = 0, mouseNY = 0;
    let explodeProgress = 0, exploding = false, explodeDir = 1, pulseValue = 0;

    const W   = canvas.clientWidth  || canvas.offsetWidth;
    const H   = canvas.clientHeight || canvas.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 100);
    camera.position.set(1.2, 0, 5.5);

    const theme    = COLOR_THEMES[SPHERE.colorTheme];
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor:      { value: theme.base.clone() },
        uRim:        { value: theme.rim.clone() },
        uTime:       { value: 0 },
        uWobble:     { value: SPHERE.wobble },
        uExplode:    { value: 0 },
        uEffect:     { value: BURST.effect },
        uIntensity:  { value: BURST.intensity },
        uParam:      { value: BURST.param },
        uPulse:      { value: 0 },
        uReveal:     { value: 0 },
        uRevealSoft: { value: DEFAULT_SPAWN.softness },
      },
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    let points = null;
    const group = new THREE.Group();
    scene.add(group);

    function rebuildPoints() {
      if (points) { points.geometry.dispose(); group.remove(points); }
      points = new THREE.Points(PRESET_BUILDERS[SPHERE.preset](SPHERE.pointCount, SPHERE.dotSize), material);
      group.add(points);
    }
    rebuildPoints();

    gl.triggerClick = () => {
      if (exploding) return;
      exploding = true; explodeProgress = 0; explodeDir = 1;
    };

    let autoRotY = 0, t0 = null, readyFired = false;

    const tick = (ts) => {
      if (!mounted) return;
      if (t0 === null) {
        t0 = ts;
        // Fire onReady on the very first frame
        if (!readyFired) { readyFired = true; onReady?.(); }
      }
      const elapsed = (ts - t0) / 1000;

      material.uniforms.uTime.value = elapsed;

      // Spawn-in animation
      material.uniforms.uRevealSoft.value = DEFAULT_SPAWN.softness;
      material.uniforms.uReveal.value = Math.min(1.0, elapsed / DEFAULT_SPAWN.duration);

      // Burst
      if (exploding) {
        const step = 0.022 * BURST.speed;
        explodeProgress += step * explodeDir;
        if (explodeDir ===  1 && explodeProgress >= 1) { explodeDir = -1; }
        if (explodeDir === -1 && explodeProgress <= 0) { explodeProgress = 0; exploding = false; }
        pulseValue = Math.max(0, Math.sin(explodeProgress * Math.PI) * 0.9 - 0.1);
      } else {
        pulseValue *= 0.88;
      }
      material.uniforms.uExplode.value = explodeProgress;
      material.uniforms.uPulse.value   = pulseValue;

      rotX.target = mouseNY * 0.55;
      rotY.target = mouseNX * 0.55;
      rotX.step(); rotY.step();

      autoRotY += SPHERE.rotSpeed * 0.008;
      group.rotation.y = autoRotY + rotY.v;
      group.rotation.x = rotX.v;
      group.rotation.z = 0.18 + rotX.v * 0.25;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const heroSection = canvas.closest('section') || document.body;
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      mouseNX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width  * 0.6)));
      mouseNY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 0.6)));
    };
    const onMouseLeave = () => { mouseNX = 0; mouseNY = 0; };
    const onTrigger = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        gl.triggerClick();
      }
    };
    const onResize = () => {
      if (!canvas) return;
      const nW = canvas.clientWidth, nH = canvas.clientHeight;
      renderer.setSize(nW, nH, false);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      camera.position.x = nW / nH > 1.2 ? 1.2 : 0;
    };

    heroSection.addEventListener('mousemove',  onMouseMove, { passive: true });
    heroSection.addEventListener('mouseleave', onMouseLeave);
    heroSection.addEventListener('click',      onTrigger);
    heroSection.addEventListener('touchstart', onTrigger,   { passive: true });
    window.addEventListener('resize',          onResize,    { passive: true });

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      heroSection.removeEventListener('mousemove',  onMouseMove);
      heroSection.removeEventListener('mouseleave', onMouseLeave);
      heroSection.removeEventListener('click',      onTrigger);
      heroSection.removeEventListener('touchstart', onTrigger);
      window.removeEventListener('resize',          onResize);
      material.dispose();
      points?.geometry.dispose();
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="hs-wrap">
      <canvas ref={canvasRef} className="hs-canvas" />
    </div>
  );
}
