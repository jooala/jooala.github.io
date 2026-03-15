import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ─── VERTEX SHADER ────────────────────────────────────────────────────────────
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ─── FRAGMENT SHADER ──────────────────────────────────────────────────────────
const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float     uProgress;
  uniform float     uTime;

  uniform float uGlitchIntensity;
  uniform float uBlockSize;
  uniform float uNoiseStrength;

  uniform vec2  uMouse;
  uniform float uHoverStrength;
  uniform float uAspect;

  varying vec2 vUv;

  float hash11(float p) {
    p = fract(p * 0.1031); p *= p + 33.33; p *= p + p;
    return fract(p);
  }
  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 uv = vUv;

    float dist = uv.x - uProgress;
    if (dist > 0.012) { gl_FragColor = vec4(0.0); return; }

    float glitchWidth   = 0.14;
    float glitchFalloff = (1.0 - smoothstep(-glitchWidth, 0.0, dist)) * uGlitchIntensity;
    float revealMask    = smoothstep(0.012, -0.004, dist);

    vec2  toMouse     = vec2((uv.x - uMouse.x) * uAspect, uv.y - uMouse.y);
    float mDist       = length(toMouse);
    float ripple      = sin(mDist * 22.0 - uTime * 4.0);
    float hFalloff    = uHoverStrength * 0.016 * exp(-mDist * 3.8);
    vec2  hoverOffset = (toMouse / (mDist + 0.001)) * hFalloff * ripple;
    vec2  baseUv      = uv + hoverOffset * (1.0 - glitchFalloff);

    vec2 sUv = baseUv;

    vec2 blockCenter = (floor(uv / uBlockSize) + 0.5) * uBlockSize;
    sUv = mix(baseUv, blockCenter, glitchFalloff * 0.70);

    float rowId   = floor(uv.y / 0.045);
    float rowRand = hash11(rowId * 4.7 + floor(uTime * 12.0) * 3.1);
    sUv.x = clamp(sUv.x + (rowRand - 0.5) * 0.06 * glitchFalloff, 0.0, 1.0);

    float flipRand = hash21(floor(uv / (uBlockSize * 2.0)) + floor(uTime * 7.0));
    sUv.x = mix(sUv.x, 1.0 - sUv.x, step(0.92, flipRand) * glitchFalloff * 0.55);

    vec4  tex = texture2D(uTexture, clamp(sUv, 0.0, 1.0));
    float a   = texture2D(uTexture, clamp(mix(baseUv, sUv, 0.30), 0.0, 1.0)).a;

    float bRand1  = hash21(blockCenter + floor(uTime * 14.0) * 2.3);
    float bRand2  = hash21(blockCenter * 1.9 + floor(uTime * 9.0) * 1.7);
    float isWhite = step(0.60, bRand1) * glitchFalloff;
    float isBlack = step(0.88, bRand2) * glitchFalloff;

    float noiseW = step(1.0 - uNoiseStrength * 0.35, hash21(uv * 47.1 + uTime * 5.3)) * glitchFalloff;
    float noiseB = step(1.0 - uNoiseStrength * 0.20, hash21(uv * 61.7 + uTime * 8.1)) * glitchFalloff;

    float pulse = 1.0 + 0.40 * glitchFalloff * hash11(floor(uTime * 18.0) * 11.7);

    vec3 color = tex.rgb;
    color = mix(color, vec3(1.0), isWhite * 0.90);
    color = mix(color, vec3(0.0), isBlack);
    color = mix(color, vec3(1.0), noiseW);
    color = mix(color, vec3(0.0), noiseB);
    color = clamp(color * pulse, 0.0, 1.0);

    gl_FragColor = vec4(color, a * revealMask);
  }
`;

// ─── Baked glitch config ──────────────────────────────────────────────────────
const GLITCH = {
  intensity: 1.00,
  blockSize: 0.080,
  noise:     0.00,
  duration:  0.90,
};

// ─── Text → canvas texture ────────────────────────────────────────────────────
function buildTextTexture(lines, canvasW, canvasH, fontSize) {
  const dpr    = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(canvasW * dpr);
  canvas.height = Math.round(canvasH * dpr);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, canvasW, canvasH);

  const lineHeight = fontSize * 0.88;
  const lineGap    = fontSize * 0.01;

  if ('letterSpacing' in ctx) ctx.letterSpacing = `${-(fontSize * 0.05)}px`;
  ctx.textBaseline = 'top';

  lines.forEach((line, i) => {
    ctx.font      = `700 ${fontSize}px "Oswald", sans-serif`;
    ctx.fillStyle = line.accent ? '#d5ff3f' : '#eaeaea';
    ctx.fillText(line.text.toUpperCase(), 0, i * (lineHeight + lineGap));
  });

  return canvas;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ShaderHeroHeadline({ lines }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    let rafId;
    let startTime   = null;
    let mounted     = true;
    let targetHover = 0.0;
    let revealDone  = false;
    let renderer, material, texture, mesh, camera, scene;
    let removeListeners = () => {};

    const prefersReducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    async function init() {
      await document.fonts.ready;
      if (!mounted) return;

      const rect = container.getBoundingClientRect();
      const W = rect.width, H = rect.height;
      if (W < 2 || H < 2) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const sizerLine = container.querySelector('.shh-sizer-line');
      const fontSize  = sizerLine
        ? parseFloat(getComputedStyle(sizerLine).fontSize)
        : Math.min(Math.max(W * 0.12, 64), 176);

      const rightPad = fontSize * 0.35;
      const canvasW  = W + rightPad;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(dpr);
      renderer.setSize(canvasW, H);
      renderer.setClearColor(0x000000, 0);

      const glCanvas = renderer.domElement;
      Object.assign(glCanvas.style, {
        position: 'absolute', top: '0', left: '0',
        width: `${canvasW}px`, height: `${H}px`,
        pointerEvents: 'none', zIndex: '2',
      });
      container.appendChild(glCanvas);

      scene  = new THREE.Scene();
      camera = new THREE.OrthographicCamera(
        -canvasW / 2, canvasW / 2, H / 2, -H / 2, 0.1, 10
      );
      camera.position.z = 1;

      texture = new THREE.CanvasTexture(buildTextTexture(lines, canvasW, H, fontSize));
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = texture.minFilter = THREE.LinearFilter;

      material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture:         { value: texture },
          uProgress:        { value: 0.0 },
          uTime:            { value: 0.0 },
          uGlitchIntensity: { value: prefersReducedMotion ? 0.0 : GLITCH.intensity },
          uBlockSize:       { value: GLITCH.blockSize },
          uNoiseStrength:   { value: prefersReducedMotion ? 0.0 : GLITCH.noise },
          uMouse:           { value: new THREE.Vector2(0.5, 0.5) },
          uHoverStrength:   { value: 0.0 },
          uAspect:          { value: canvasW / H },
        },
        vertexShader: VERT, fragmentShader: FRAG,
        transparent: true, depthWrite: false,
      });

      mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvasW, H), material);
      scene.add(mesh);

      const dur = prefersReducedMotion ? GLITCH.duration * 0.2 : GLITCH.duration;

      const tick = (timestamp) => {
        if (!mounted) return;
        if (startTime === null) startTime = timestamp;

        const elapsed = (timestamp - startTime) / 1000;
        const uni     = material.uniforms;

        if (!revealDone) {
          const raw   = Math.min(elapsed / dur, 1.0);
          const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

          uni.uProgress.value = eased * 1.10;
          uni.uTime.value     = elapsed;

          // Smooth glitch fade: full until 60%, then quadratic ease to 0
          const fadeStart  = 0.60;
          const glitchFade = raw < fadeStart
            ? 1.0
            : 1.0 - Math.pow((raw - fadeStart) / (1.0 - fadeStart), 2);
          const gi = prefersReducedMotion ? 0.0 : GLITCH.intensity;
          const ns = prefersReducedMotion ? 0.0 : GLITCH.noise;
          uni.uGlitchIntensity.value = gi * Math.max(0, glitchFade);
          uni.uNoiseStrength.value   = ns * Math.max(0, glitchFade);

          if (elapsed >= dur + 0.35) {
            uni.uProgress.value        = 1.10;
            uni.uGlitchIntensity.value = 0.0;
            uni.uNoiseStrength.value   = 0.0;
            revealDone = true;
          }
        } else {
          uni.uTime.value = elapsed;
        }

        const currentH  = uni.uHoverStrength.value;
        const lerpSpeed = currentH < targetHover ? 0.10 : 0.06;
        uni.uHoverStrength.value = currentH + (targetHover - currentH) * lerpSpeed;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      const onMouseMove = (e) => {
        if (!material) return;
        const r = container.getBoundingClientRect();
        material.uniforms.uMouse.value.set(
          (e.clientX - r.left) / canvasW,
          1.0 - (e.clientY - r.top) / H
        );
        targetHover = 1.0;
      };
      const onMouseLeave = () => { targetHover = 0.0; };

      container.addEventListener('mousemove',  onMouseMove,  { passive: true });
      container.addEventListener('mouseleave', onMouseLeave);

      let resizeTimer = null;
      const onResize = () => {
        if (!container || !renderer || !mounted) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!container || !renderer || !mounted) return;
          const r     = container.getBoundingClientRect();
          const nW    = r.width, nH = r.height;
          if (nW < 2 || nH < 2) return;
          const nLine = container.querySelector('.shh-sizer-line');
          const nFont = nLine
            ? parseFloat(getComputedStyle(nLine).fontSize)
            : Math.min(Math.max(nW * 0.12, 64), 176);
          const nCanW = nW + nFont * 0.35;
          const nDpr  = Math.min(window.devicePixelRatio || 1, 2);

          renderer.setPixelRatio(nDpr);
          renderer.setSize(nCanW, nH);
          Object.assign(glCanvas.style, { width: `${nCanW}px`, height: `${nH}px` });
          camera.left = -nCanW / 2; camera.right = nCanW / 2;
          camera.top  =  nH / 2;   camera.bottom = -nH / 2;
          camera.updateProjectionMatrix();
          mesh.geometry.dispose();
          mesh.geometry = new THREE.PlaneGeometry(nCanW, nH);
          texture.image = buildTextTexture(lines, nCanW, nH, nFont);
          texture.needsUpdate = true;
          material.uniforms.uAspect.value = nCanW / nH;
        }, 150);
      };

      window.addEventListener('resize', onResize, { passive: true });

      removeListeners = () => {
        window.removeEventListener('resize', onResize);
        container.removeEventListener('mousemove',  onMouseMove);
        container.removeEventListener('mouseleave', onMouseLeave);
      };
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      removeListeners();
      mesh?.geometry?.dispose();
      material?.dispose();
      texture?.dispose();
      renderer?.dispose();
      renderer?.domElement?.remove();
    };
  }, [lines]);

  return (
    <div
      ref={containerRef}
      className="shh-root"
      role="heading"
      aria-level={1}
      aria-label={lines.map((l) => l.text).join(' ')}
    >
      <div className="shh-sizer" aria-hidden="true">
        {lines.map((line) => (
          <div key={line.text} className={`shh-sizer-line${line.accent ? ' --accent' : ''}`}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
