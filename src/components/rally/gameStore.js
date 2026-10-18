import { useSyncExternalStore } from 'react';

// Tiny store shared by the 3D game loop (inside the canvas) and the DOM HUD.
//
// phase: off → loading → intro → menu (→ lobby) → countdown → race → finished
//        → exiting → off
let state = {
  phase: 'off',
  day: null,
  room: null,
  menuError: null,
  busy: false,
  heroRect: null,
  countdown: 3,
  lap: 0,
  totalLaps: 3,
  position: 10,
  cars: 10,
  wrongWay: false,
  results: null,
  muted: false,
};

const listeners = new Set();

export function getGame() {
  return state;
}

export function setGame(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useGame(selector) {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

// High-frequency values written every frame by the game loop and read by the
// HUD in its own animation loop (no React re-renders).
export const live = {
  speed: 0,
  time: 0,
  cars: [],
  map: null,
};

// Commands the HUD can send; registered by Hero (exit) and RallyWorld (restart).
export const actions = {
  exit: () => {},
  restart: () => {},
};

// Browser fullscreen for the game (hides tabs and toolbars)
export function toggleFullscreen() {
  if (typeof document === 'undefined') return;
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  else document.documentElement.requestFullscreen?.().catch(() => {});
}
