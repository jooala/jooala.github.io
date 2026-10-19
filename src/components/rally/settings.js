// Track and race settings shared by the game (track.js, RallyWorld) and the
// HUD (RallyHud). No three.js here, so the HUD chunk stays small.

export const TOTAL_LAPS = 5;

// Layout scales for buildTrack. All 1 = the normal (daily) track.
export const TRACK_DEFAULTS = { size: 1, twist: 1, hills: 1, jump: 1, width: 1 };

// The race on the daily circuit: these laps and a full AI field are ranked
export const RACE_DEFAULTS = { laps: TOTAL_LAPS, ai: 9, aiSkill: 1 };

// ── Daily circuit ───────────────────────────────────────────────────────────
// The date in Finland, so everyone races (and ranks on) the same circuit each
// day and the new one comes out at midnight Finnish time (DST included)
const DAY_TZ = 'Europe/Helsinki';
let dayFormat = null;
function dayParts(date) {
  dayFormat ||= new Intl.DateTimeFormat('en-CA', {
    timeZone: DAY_TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const p = {};
  dayFormat.formatToParts(date).forEach(({ type, value }) => (p[type] = Number(value)));
  return p;
}

export function dayKey(date = new Date()) {
  const p = dayParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

// Timestamp (ms) of the next midnight in Finland, when the next circuit is out
export function nextDayAt(date = new Date()) {
  const offsetAt = (t) => {
    const p = dayParts(new Date(t));
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(t / 1000) * 1000;
  };
  const p = dayParts(date);
  const midnight = Date.UTC(p.year, p.month - 1, p.day + 1);
  // Clocks change at 3–4 am, so take the offset at the midnight itself
  return midnight - offsetAt(midnight - offsetAt(date.getTime()));
}

// Admin track lab sliders: `group` says whether it shapes the track or the race
export const LAB_FIELDS = [
  { key: 'size', label: 'Size', min: 0.7, max: 2, step: 0.05, group: 'track' },
  { key: 'twist', label: 'Twistiness', min: 0.5, max: 2, step: 0.05, group: 'track' },
  { key: 'hills', label: 'Hills', min: 0, max: 3, step: 0.1, group: 'track' },
  { key: 'jump', label: 'Jump', min: 0, max: 3, step: 0.1, group: 'track' },
  { key: 'width', label: 'Road width', min: 0.6, max: 1.6, step: 0.05, group: 'track' },
  { key: 'laps', label: 'Laps', min: 1, max: 20, step: 1, group: 'race' },
  { key: 'ai', label: 'AI cars', min: 0, max: 9, step: 1, group: 'race' },
  { key: 'aiSkill', label: 'AI skill', min: 0.7, max: 1.15, step: 0.01, group: 'race' },
];

// Typed anywhere in the game menu (not in a text field) to show the lab
export const LAB_CODE = 'jooala';

// ── Weather & time of day ───────────────────────────────────────────────────
// sky: top/middle/horizon colours of the CSS gradient behind the (transparent)
// canvas; the horizon matches the fog so the two blend. sun: colour, intensity and its
// offset from the player (low = long shadows). night: 0–1, lights the city's
// windows, the pools under the street lamps and the cars' lamps/headlights.
export const WEATHERS = {
  day: {
    label: 'Day',
    sky: ['#ebe8e1', '#e0ddd6', '#d6d3cc'],
    fog: ['#d6d3cc', 80, 340],
    sun: { color: '#fff8ee', intensity: 3.1, offset: [-28, 60, 34] },
    hemi: ['#f4f2ec', '#57564f', 0.55],
    fill: 0.45,
    env: 0.42,
    exposure: 1.05,
    night: 0,
  },
  morning: {
    label: 'Morning',
    sky: ['#c3d2e2', '#e8d8c6', '#e4cfb9'],
    fog: ['#e4cfb9', 60, 320],
    sun: { color: '#ffd2a1', intensity: 2.6, offset: [-75, 24, 30] },
    hemi: ['#f2e2cf', '#4f4840', 0.5],
    fill: 0.3,
    env: 0.34,
    exposure: 1.02,
    night: 0,
  },
  sunset: {
    label: 'Sunset',
    sky: ['#4b4371', '#cf717c', '#e89a72'],
    fog: ['#e89a72', 50, 300],
    sun: { color: '#ff9150', intensity: 2.7, offset: [70, 13, -40] },
    hemi: ['#f6a77e', '#33263a', 0.45],
    fill: 0.2,
    env: 0.28,
    exposure: 1,
    night: 0.35,
  },
  night: {
    label: 'Night',
    sky: ['#05070f', '#0c1222', '#141c30'],
    fog: ['#141c30', 40, 260],
    sun: { color: '#8fa6ff', intensity: 0.6, offset: [-30, 70, 20] },
    hemi: ['#3a4c80', '#06070c', 0.3],
    fill: 0.08,
    env: 0.07,
    exposure: 1.2,
    night: 1,
  },
  fog: {
    label: 'Fog',
    sky: ['#d4d4d0', '#cbcbc7', '#c7c7c3'],
    fog: ['#c7c7c3', 2, 80],
    sun: { color: '#f1efe8', intensity: 1.5, offset: [-20, 70, 20] },
    hemi: ['#e8e8e4', '#6a6a66', 0.75],
    fill: 0.3,
    env: 0.38,
    exposure: 1.05,
    night: 0,
  },
  nightFog: {
    label: 'Night fog',
    sky: ['#0b0e15', '#151a24', '#1b212c'],
    fog: ['#1b212c', 4, 95],
    sun: { color: '#93a4c8', intensity: 0.35, offset: [-30, 70, 20] },
    hemi: ['#2d3a55', '#07080b', 0.25],
    fill: 0.05,
    env: 0.05,
    exposure: 1.2,
    night: 1,
  },
};

// How often each comes up on the daily circuit / a random free track
const WEATHER_WEIGHTS = { day: 30, morning: 16, sunset: 16, night: 14, fog: 14, nightFog: 10 };

// Deterministic per seed, so everyone gets the same weather on the same track
export function pickWeather(seed) {
  let h = 2166136261;
  const str = `${seed}:weather`;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  let t = ((h >>> 0) % 10000) / 10000;
  const total = Object.values(WEATHER_WEIGHTS).reduce((a, b) => a + b, 0);
  for (const [key, w] of Object.entries(WEATHER_WEIGHTS)) {
    t -= w / total;
    if (t < 0) return key;
  }
  return 'day';
}
