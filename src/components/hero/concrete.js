// Board-formed concrete drawn on a 2D canvas context. No three.js or DOM
// here, so it also runs in a worker on an OffscreenCanvas (concrete.worker.js).

export function rng(seed = 1) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Mottled tone, plank bands, tie holes, water streaks, pits and grain.
// Drawn with wrap-around so it tiles seamlessly.
export function drawConcrete(ctx, size = 1024, seed = 11) {
  const r = rng(seed);
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
}
