// Synthesised rally audio: engine, gravel/skid noise, beeps, impacts.
// Created inside the click that starts the game so browsers allow playback.

let ctx = null;
let master = null;
let engine = null;
let skid = null;
let scrapeGain = null;
let muted = false;

try {
  muted = window.localStorage.getItem('ja-rally-muted') === '1';
} catch {
  /* storage unavailable */
}

export function isMuted() {
  return muted;
}

export function initAudio() {
  if (typeof window === 'undefined') return;
  if (ctx) {
    ctx.resume?.();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.55;
  master.connect(ctx.destination);

  // Engine: two detuned saws through a lowpass
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.Q.value = 4;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.type = 'sawtooth';
  o2.type = 'square';
  o1.frequency.value = 60;
  o2.frequency.value = 30;
  const g2 = ctx.createGain();
  g2.gain.value = 0.4;
  o1.connect(filter);
  o2.connect(g2).connect(filter);
  filter.connect(gain).connect(master);
  o1.start();
  o2.start();
  engine = { o1, o2, filter, gain };

  // Gravel / skid: looped noise through a bandpass
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 900;
  band.Q.value = 0.8;
  const sg = ctx.createGain();
  sg.gain.value = 0;
  src.connect(band).connect(sg).connect(master);
  src.start();
  skid = { gain: sg, band, buf };

  // Metal scraping along concrete: bright, narrow noise
  const src2 = ctx.createBufferSource();
  src2.buffer = buf;
  src2.loop = true;
  const hp = ctx.createBiquadFilter();
  hp.type = 'bandpass';
  hp.frequency.value = 2600;
  hp.Q.value = 2.2;
  scrapeGain = ctx.createGain();
  scrapeGain.gain.value = 0;
  src2.connect(hp).connect(scrapeGain).connect(master);
  src2.start(0, 0.7);
}

export function updateScrape(level) {
  if (!ctx || !scrapeGain) return;
  scrapeGain.gain.setTargetAtTime(Math.min(0.14, level * 0.006), ctx.currentTime, 0.04);
}

// Car-on-car hit: low thump plus a short metallic crack
export function crash(strength = 1) {
  if (!ctx || !skid) return;
  thud(Math.min(3, strength * 0.25));
  const src = ctx.createBufferSource();
  src.buffer = skid.buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1400 + Math.random() * 800;
  bp.Q.value = 3;
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(Math.min(0.35, 0.05 + strength * 0.02), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  src.connect(bp).connect(g).connect(master);
  src.start(t, Math.random());
  src.stop(t + 0.2);
}

// Fake 5-speed gearbox so the pitch rises and drops like a real car
const GEARS = [0, 11, 20, 29, 38, 60];

export function updateEngine(speed, throttle, slip) {
  if (!ctx || !engine) return;
  const v = Math.abs(speed);
  let g = 0;
  while (g < GEARS.length - 2 && v > GEARS[g + 1]) g++;
  const rpm = Math.min(1, 0.3 + ((v - GEARS[g]) / (GEARS[g + 1] - GEARS[g])) * 0.7);
  const f = 42 + rpm * 120 + g * 6;
  const t = ctx.currentTime;
  engine.o1.frequency.setTargetAtTime(f, t, 0.05);
  engine.o2.frequency.setTargetAtTime(f / 2, t, 0.05);
  engine.filter.frequency.setTargetAtTime(300 + rpm * 1400 + (throttle ? 500 : 0), t, 0.08);
  engine.gain.gain.setTargetAtTime(0.05 + (throttle ? 0.05 : 0.015) + rpm * 0.03, t, 0.1);
  skid.gain.gain.setTargetAtTime(Math.min(0.12, slip * 0.012) + Math.min(0.03, v * 0.0006), t, 0.08);
}

export function silenceEngine() {
  if (!ctx || !engine) return;
  const t = ctx.currentTime;
  engine.gain.gain.setTargetAtTime(0, t, 0.08);
  skid.gain.gain.setTargetAtTime(0, t, 0.08);
  scrapeGain?.gain.setTargetAtTime(0, t, 0.05);
}

export function beep(freq = 440, dur = 0.18, vol = 0.18) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function thud(strength = 1) {
  if (!ctx || !skid) return;
  const src = ctx.createBufferSource();
  src.buffer = skid.buf;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 260;
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(Math.min(0.6, 0.15 * strength), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  src.connect(lp).connect(g).connect(master);
  src.start(t, Math.random());
  src.stop(t + 0.4);
}

export function setMuted(m) {
  muted = m;
  try {
    window.localStorage.setItem('ja-rally-muted', m ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.05);
}

export function stopAudio() {
  if (!ctx) return;
  silenceEngine();
  const c = ctx;
  ctx = null;
  engine = null;
  skid = null;
  scrapeGain = null;
  setTimeout(() => c.close?.(), 300);
}
