import { useMemo } from 'react';

// Seeded PRNG so contour posters render identically on server and client.
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return Math.abs(h) || 1;
}

// Topographic contour lines: a nod to world-building for game projects.
function Contours({ seed }) {
  const paths = useMemo(() => {
    const r = rng(seed);
    const centers = [
      { x: 120 + r() * 80, y: 110 + r() * 60, n: 9 },
      { x: 300 + r() * 60, y: 200 + r() * 50, n: 6 },
    ];
    const out = [];
    centers.forEach((c) => {
      const p1 = r() * Math.PI * 2;
      const p2 = r() * Math.PI * 2;
      for (let k = 1; k <= c.n; k++) {
        const base = k * 17;
        const pts = [];
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2;
          const rad = base * (1 + 0.22 * Math.sin(3 * t + p1 + k * 0.15) + 0.12 * Math.sin(5 * t + p2));
          pts.push(`${(c.x + Math.cos(t) * rad * 1.35).toFixed(1)},${(c.y + Math.sin(t) * rad).toFixed(1)}`);
        }
        out.push(`M${pts.join('L')}Z`);
      }
    });
    return out;
  }, [seed]);

  return (
    <svg className="poster__contours" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

// Typographic poster used when a project has no artwork yet.
// Replace by setting `cover` on the project in src/content/projects.mjs.
export function Poster({ project, size = 'card' }) {
  const tone = project.poster?.tone || 'ink';
  return (
    <div className={`poster poster--${tone} poster--${size}`} aria-hidden="true">
      <div className="poster__grid" />
      {tone === 'ink' && <Contours seed={hash(project.slug)} />}
      <span className="poster__word display">{project.title}</span>
      {project.poster?.stamp && <span className="poster__stamp mono">{project.poster.stamp}</span>}
      <span className="poster__reg poster__reg--tl" />
      <span className="poster__reg poster__reg--br" />
    </div>
  );
}

// Cover image or poster fallback. `variant`: 'cover' (large) | 'thumb' (archive grid)
export default function ProjectVisual({ project, variant = 'cover', eager = false, className = '' }) {
  const cover = project.cover;
  if (!cover) return <Poster project={project} size={variant === 'thumb' ? 'thumb' : 'card'} />;

  const src = variant === 'thumb' && cover.src.startsWith('/images/covers/')
    ? cover.src.replace(/\.jpg$/, '-sm.jpg')
    : cover.src;

  return (
    <img
      src={src}
      alt={cover.alt || ''}
      className={`pv ${cover.grayscale ? 'pv--gray' : ''} ${className}`}
      style={cover.position ? { objectPosition: cover.position } : undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
