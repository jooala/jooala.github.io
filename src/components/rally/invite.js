// Invite links for online rooms: https://site/?join=CODE opens the game and
// joins that room. Hero reads the link on load and starts the game; the menu
// picks up the pending code and joins once the game is ready.
import { normaliseCode } from './net';

let pending = null;

export function inviteUrl(code) {
  return `${window.location.origin}/?join=${code}`;
}

// The room code in the current URL (removed from the address bar once read,
// so a reload doesn't rejoin)
export function readInvite() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = normaliseCode(params.get('join'));
  if (!params.has('join')) return null;
  params.delete('join');
  const qs = params.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`);
  return code.length === 4 ? code : null;
}

export function setPendingJoin(code) {
  pending = code;
}

export function takePendingJoin() {
  const code = pending;
  pending = null;
  return code;
}

// Share sheet on phones, clipboard elsewhere. Resolves to 'shared' | 'copied' | null.
export async function shareInvite(code) {
  const url = inviteUrl(code);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse && navigator.share) {
    try {
      await navigator.share({ title: 'RALLY', text: `Race me in RALLY, room ${code}`, url });
      return 'shared';
    } catch {
      /* cancelled: fall back to copying */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return null;
  }
}
