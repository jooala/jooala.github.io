// Arcade rally handling. Units are metres and seconds.
// Heading convention: forward = (sin h, cos h) on the x/z plane; the driver's
// right = (-cos h, sin h). Positive steer = right = heading decreases.
import { HALF_WIDTH, locate, groundAt, trackPoint } from './track';

export const VMAX = 50;
const ENGINE = 21;
const BRAKE = 34;
const REVERSE = 9;
const DRAG = 0.12;
const ROLL = 1.6;
const GRIP = 6.2;
const GRIP_HANDBRAKE = 1.35;
const STEER = 2.35;
const GRAVITY = 23;
const WALL_EDGE = HALF_WIDTH - 0.1; // inner face of the barriers
const WALL_BOUNCE = 0.55; // share of the impact speed returned off the wall

// Car body as an oriented box (half length / half width, metres)
export const CAR_HL = 1.9;
export const CAR_HW = 0.86;

export function createCar(track, slot, opts = {}) {
  const i = (track.N - Math.round(slot.back / track.ds)) % track.N;
  const p = trackPoint(track, i, slot.lateral);
  return {
    id: opts.id || opts.name || 'car',
    name: opts.name || 'CPU',
    isPlayer: !!opts.isPlayer,
    remote: !!opts.remote,
    ai: opts.ai || null,
    x: p.x,
    z: p.z,
    y: p.y,
    vy: 0,
    vx: 0,
    vz: 0,
    h: p.heading,
    yawVel: 0,
    steer: 0,
    vF: 0,
    vR: 0,
    slip: 0,
    idx: i,
    prevIdx: i,
    lap: 0,
    cp: true,
    finished: false,
    finishTime: null,
    lapStart: 0,
    bestLap: null,
    grounded: true,
    prevGround: p.y,
    pitch: 0,
    roll: 0,
    impact: 0,
    landed: 0,
    wall: null,
    stuck: 0,
    wheelSpin: 0,
  };
}

export function resetCar(car, track, slot) {
  Object.assign(
    car,
    createCar(track, slot, { id: car.id, name: car.name, isPlayer: car.isPlayer, remote: car.remote, ai: car.ai })
  );
}

// Put a car back on the centre of the track where it is
export function respawn(car, track) {
  const p = trackPoint(track, car.idx, 0);
  car.x = p.x;
  car.z = p.z;
  car.y = p.y + 0.5;
  car.vx = car.vz = car.vy = 0;
  car.yawVel = 0;
  car.h = p.heading;
  car.stuck = 0;
}

export function stepCar(car, input, dt, track) {
  const sinH = Math.sin(car.h);
  const cosH = Math.cos(car.h);
  let vF = car.vx * sinH + car.vz * cosH;
  let vR = -car.vx * cosH + car.vz * sinH;

  car.steer += (input.steer - car.steer) * Math.min(1, dt * (car.isPlayer ? 9 : 6));
  const ground = groundAt(track, car.idx, car.x, car.z);
  car.grounded = car.y - ground < 0.08;

  if (car.grounded) {
    if (input.throttle) vF += ENGINE * (1 - Math.max(0, vF) / VMAX) * dt;
    if (input.brake) {
      if (vF > 0.5) vF -= BRAKE * dt;
      else vF = Math.max(-14, vF - REVERSE * dt);
    }
    vF -= vF * DRAG * dt;
    if (!input.throttle && !input.brake) {
      const r = ROLL * dt;
      vF = Math.abs(vF) <= r ? 0 : vF - Math.sign(vF) * r;
    }
    const grip = input.handbrake ? GRIP_HANDBRAKE : GRIP;
    vR *= Math.exp(-grip * dt);
    if (input.handbrake) vF *= Math.exp(-0.5 * dt);

    const speed = Math.abs(vF);
    const response = Math.min(1, speed / 7) * (1 - 0.42 * Math.min(1, speed / VMAX));
    let yaw = -car.steer * STEER * response * (vF >= 0 ? 1 : -1);
    if (input.handbrake) yaw *= 1.45;
    car.h += yaw * dt;
  } else {
    car.h -= car.steer * 0.25 * dt;
  }

  // Spin from knocks (walls, other cars) dies away quickly
  car.h += car.yawVel * dt;
  car.yawVel *= Math.exp(-5 * dt);

  const nsin = Math.sin(car.h);
  const ncos = Math.cos(car.h);
  car.vx = nsin * vF - ncos * vR;
  car.vz = ncos * vF + nsin * vR;
  car.vF = vF;
  car.vR = vR;
  car.slip = Math.abs(vR);
  // Wheelspin: flooring it from low speed
  car.burnout = car.grounded && input.throttle && vF < 9 ? 1 - vF / 9 : 0;

  car.x += car.vx * dt;
  car.z += car.vz * dt;

  car.prevIdx = car.idx;
  car.idx = locate(track, car.x, car.z, car.idx);
  hitWalls(car, track);

  // Vertical: ballistic, clamped to the road so crests launch the car
  const g = groundAt(track, car.idx, car.x, car.z);
  car.vy -= GRAVITY * dt;
  car.y += car.vy * dt;
  if (car.y <= g) {
    if (!car.grounded && car.vy < -5) car.landed = Math.min(1.6, -car.vy / 11);
    car.y = g;
    car.vy = (g - car.prevGround) / dt;
  }
  car.prevGround = g;

  // Body attitude for the visuals
  const fwd = car.vx * Math.sin(car.h) + car.vz * Math.cos(car.h);
  const accel = (fwd - (car.lastF ?? fwd)) / Math.max(dt, 1e-3);
  car.lastF = fwd;
  let targetPitch;
  if (car.grounded) {
    targetPitch = -Math.atan(trackSlope(track, car)) + Math.max(-0.05, Math.min(0.05, -accel * 0.004));
  } else {
    targetPitch = Math.max(-0.35, Math.min(0.25, -car.vy * 0.025));
  }
  car.pitch += (targetPitch - car.pitch) * Math.min(1, dt * 8);
  const targetRoll = Math.max(-0.09, Math.min(0.09, car.steer * Math.abs(fwd) * 0.0035 + vR * 0.01));
  car.roll += (targetRoll - car.roll) * Math.min(1, dt * 6);
  car.wheelSpin += (fwd / 0.34) * dt;
}

// Keep the whole body (not just its centre) inside the barriers, and bounce
// off them. Records the contact for sparks and sound.
function hitWalls(car, track) {
  const i = car.idx;
  const nx = track.nx[i];
  const nz = track.nz[i];
  const lateral = (car.x - track.px[i]) * nx + (car.z - track.pz[i]) * nz;
  const rel = car.h - track.heading[i];
  const extent = Math.abs(Math.sin(rel)) * CAR_HL + Math.abs(Math.cos(rel)) * CAR_HW;
  const limit = WALL_EDGE - extent;
  car.wall = null;
  if (Math.abs(lateral) <= limit) return;

  const s = Math.sign(lateral);
  const push = lateral - s * limit;
  car.x -= nx * push;
  car.z -= nz * push;
  const vn = car.vx * nx + car.vz * nz;
  const into = vn * s;
  const along = Math.abs(car.vx * track.tx[i] + car.vz * track.tz[i]);
  if (into > 0) {
    // reflect the normal component with some bounce, scrub the rest
    car.vx -= nx * vn * (1 + WALL_BOUNCE);
    car.vz -= nz * vn * (1 + WALL_BOUNCE);
    const scrub = Math.max(0.82, 1 - into * 0.012);
    car.vx *= scrub;
    car.vz *= scrub;
    // knock the nose away from the wall
    const sideOfNose = Math.sign(Math.sin(rel)) || 1;
    car.yawVel += -s * sideOfNose * Math.min(1.6, into * 0.09);
    car.impact = Math.max(car.impact, into);
    if (!car.wallHit || into > car.wallHit.strength) {
      car.wallHit = { x: car.x + nx * s * extent, z: car.z + nz * s * extent, strength: into };
    }
  }
  car.wall = {
    x: car.x + nx * s * extent,
    z: car.z + nz * s * extent,
    scrape: along,
    impact: Math.max(0, into),
  };
}

function trackSlope(track, car) {
  const { N, tx, tz, h, ds } = track;
  const dir = Math.sin(car.h) * tx[car.idx] + Math.cos(car.h) * tz[car.idx];
  const a = h[(car.idx + 2) % N];
  const b = h[(car.idx - 2 + N) % N];
  return ((a - b) / (4 * ds)) * Math.sign(dir || 1);
}

// Lap counting: a checkpoint halfway round must be passed before the line counts
export function updateLap(car, track, time) {
  const { N } = track;
  if (car.idx > N * 0.4 && car.idx < N * 0.6) car.cp = true;
  if (car.prevIdx > N * 0.85 && car.idx < N * 0.15 && car.cp) {
    car.cp = false;
    if (car.lap > 0) {
      const lapTime = time - car.lapStart;
      car.bestLap = car.bestLap === null ? lapTime : Math.min(car.bestLap, lapTime);
    }
    car.lap += 1;
    car.lapStart = time;
    return true;
  }
  return false;
}

export function progressOf(car, track) {
  return car.lap * track.N + car.idx;
}

// AI: pure-pursuit steering toward a point ahead, throttle from the speed
// profile, and a lane change when someone is in the way.
export function aiInput(car, track, rubber = 1, cars = []) {
  const { N, ds, vmax, px, pz, nx, nz } = track;
  const look = 7 + Math.max(0, car.vF) * 0.42;
  const ti = (car.idx + Math.round(look / ds)) % N;

  let lane = Math.sin((car.idx * ds) / 46 + car.ai.phase) * 2.1 + car.ai.bias;
  let slow = 1;
  const myLat = (car.x - px[car.idx]) * nx[car.idx] + (car.z - pz[car.idx]) * nz[car.idx];
  for (const o of cars) {
    if (o === car) continue;
    let ahead = o.idx - car.idx;
    if (ahead < -N / 2) ahead += N;
    if (ahead > N / 2) ahead -= N;
    const dist = ahead * ds;
    if (dist <= 0 || dist > 14) continue;
    const oLat = (o.x - px[o.idx]) * nx[o.idx] + (o.z - pz[o.idx]) * nz[o.idx];
    if (Math.abs(oLat - myLat) > 2.6) continue;
    // go round on the side with more room
    lane = oLat + (oLat < 0 ? 3.4 : -3.4);
    if (dist < 6 && car.vF > o.vF) slow = 0.92;
  }
  lane = Math.max(-(HALF_WIDTH - 1.6), Math.min(HALF_WIDTH - 1.6, lane));

  const tx = px[ti] + nx[ti] * lane;
  const tz = pz[ti] + nz[ti] * lane;
  const desired = Math.atan2(tx - car.x, tz - car.z);
  const diff = Math.atan2(Math.sin(desired - car.h), Math.cos(desired - car.h));
  const steer = Math.max(-1, Math.min(1, -diff * 2.6));
  const target = vmax[(car.idx + Math.round(6 / ds)) % N] * car.ai.skill * rubber * slow;
  return {
    steer,
    throttle: car.vF < target - 0.4,
    brake: car.vF > target + 2.5,
    handbrake: false,
  };
}

// ── Car vs car: oriented boxes (separating axis test) ──────────────────────

function corners(c) {
  const fx = Math.sin(c.h);
  const fz = Math.cos(c.h);
  const rx = -fz;
  const rz = fx;
  const out = [];
  for (const [a, b] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
    out.push([c.x + fx * CAR_HL * a + rx * CAR_HW * b, c.z + fz * CAR_HL * a + rz * CAR_HW * b]);
  }
  return { pts: out, axes: [[fx, fz], [rx, rz]] };
}

function project(pts, ax) {
  let min = Infinity;
  let max = -Infinity;
  for (const [x, z] of pts) {
    const d = x * ax[0] + z * ax[1];
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return [min, max];
}

// Returns contacts ({x, z, strength, a, b}) for effects. Remote cars are
// moved by their owners, so they act as immovable obstacles here.
export function collideCars(cars) {
  const contacts = [];
  for (let a = 0; a < cars.length; a++) {
    for (let b = a + 1; b < cars.length; b++) {
      const A = cars[a];
      const B = cars[b];
      if (A.remote && B.remote) continue;
      const dx = B.x - A.x;
      const dz = B.z - A.z;
      if (dx * dx + dz * dz > 20 || Math.abs(A.y - B.y) > 1.4) continue;

      const ca = corners(A);
      const cb = corners(B);
      let depth = Infinity;
      let nx = 0;
      let nz = 0;
      let separated = false;
      for (const ax of [...ca.axes, ...cb.axes]) {
        const [a0, a1] = project(ca.pts, ax);
        const [b0, b1] = project(cb.pts, ax);
        const overlap = Math.min(a1, b1) - Math.max(a0, b0);
        if (overlap <= 0) {
          separated = true;
          break;
        }
        if (overlap < depth) {
          depth = overlap;
          // normal pointing from A to B
          const sgn = dx * ax[0] + dz * ax[1] >= 0 ? 1 : -1;
          nx = ax[0] * sgn;
          nz = ax[1] * sgn;
        }
      }
      if (separated) continue;

      // Push apart (remote cars don't move)
      const wa = A.remote ? 0 : B.remote ? 1 : 0.5;
      const wb = 1 - wa;
      A.x -= nx * depth * wa;
      A.z -= nz * depth * wa;
      B.x += nx * depth * wb;
      B.z += nz * depth * wb;

      // Bounce along the contact normal
      const rel = (B.vx - A.vx) * nx + (B.vz - A.vz) * nz;
      if (rel >= 0) continue;
      const j = -rel * 1.35; // restitution ~0.35
      if (!A.remote) {
        A.vx -= nx * j * wa;
        A.vz -= nz * j * wa;
      }
      if (!B.remote) {
        B.vx += nx * j * wb;
        B.vz += nz * j * wb;
      }
      // Off-centre hits spin the cars a little
      const cx = (A.x + B.x) / 2;
      const cz = (A.z + B.z) / 2;
      const spin = (car, sign) => {
        if (car.remote) return;
        const ox = cx - car.x;
        const oz = cz - car.z;
        const torque = (ox * nz - oz * nx) * sign;
        car.yawVel += Math.max(-1.4, Math.min(1.4, torque * -rel * 0.05));
      };
      spin(A, -1);
      spin(B, 1);
      A.impact = Math.max(A.impact, -rel);
      B.impact = Math.max(B.impact, -rel);
      contacts.push({ x: cx, z: cz, y: Math.max(A.y, B.y), strength: -rel, a: A, b: B });
    }
  }
  return contacts;
}
