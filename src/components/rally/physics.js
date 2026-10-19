// Rally car physics: a rigid body on four raycast springs with a slip-angle
// tyre model, plus impulse contacts for the body (roof, sides, bumpers)
// against the road, the barriers and other cars, so cars can bounce, spin,
// roll and land on their roof. Units are metres and seconds; forces are per
// unit mass (accelerations).
//
// Car frame: +z forward, +y up, +x left. Heading h: forward = (sin h, cos h)
// on the x/z plane; the driver's right = (-cos h, sin h). Positive steer = right.
import * as THREE from 'three';
import { locate, surface, trackPoint } from './track';

export const VMAX = 50;
const GRAVITY = 23;
const ENGINE = 25;
const BRAKE = 34;
const REVERSE = 9;
const DRAG = 0.11;
const ROLL = 1.4;
const MU_F = 1.3;
const MU_R = 1.38;
const PEAK = 0.11; // slip angle (rad) of peak tyre grip
const HANDBRAKE_GRIP = 0.4;
const YAW_ASSIST = 4; // pulls the yaw rate toward what the steering asks for (arcade agility)
const ROLL_ASSIST = 0.6; // tyre forces act this much closer to the centre of mass (less body roll)
const TRIP = [7, 12]; // sideways tyre speed (m/s) where a slide starts to roll the car

// Suspension
const SPRING = 58;
const DAMP = 4.6;
const ARB = 22;
const SUSP = 0.36;
const WHEEL_R = 0.323;
const MOUNT_Y = 0.06;
const REST = SUSP - GRAVITY / 4 / SPRING; // spring length at rest
export const COM_H = REST + WHEEL_R - MOUNT_Y; // centre of mass above the road at rest

// Inverse inertia per unit mass, body frame (x pitch, y yaw, z roll)
const INV_I = new THREE.Vector3(1 / 1.3, 1 / 1.15, 1 / 0.62);
const SUBSTEP = 1 / 120;

// Footprint for car-vs-car (half length / half width)
export const CAR_HL = 1.9;
export const CAR_HW = 0.86;

const WHEELS = [
  { x: 0.7, z: 1.16, front: true, drive: 0.2, brake: 0.3 },
  { x: -0.7, z: 1.16, front: true, drive: 0.2, brake: 0.3 },
  { x: 0.7, z: -1.16, front: false, drive: 0.3, brake: 0.2 },
  { x: -0.7, z: -1.16, front: false, drive: 0.3, brake: 0.2 },
];

// Body hull points relative to the centre of mass: sills, shoulders, roof
const BODY = [];
[1, -1].forEach((sx) => {
  [1, -1].forEach((sz) => {
    BODY.push([0.84 * sx, -0.22, 1.9 * sz]);
    BODY.push([0.86 * sx, 0.3, 1.9 * sz]);
  });
  BODY.push([0.66 * sx, 0.8, -1.55], [0.66 * sx, 0.8, 0.5]);
});

const UP = new THREE.Vector3(0, 1, 0);
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// Scratch objects (the simulation is single-threaded)
const ex = new THREE.Vector3();
const ey = new THREE.Vector3();
const ez = new THREE.Vector3();
const F = new THREE.Vector3();
const T = new THREE.Vector3();
const A = new THREE.Vector3();
const C = new THREE.Vector3();
const R = new THREE.Vector3();
const RT = new THREE.Vector3();
const N_ = new THREE.Vector3();
const FW = new THREE.Vector3();
const SIDE = new THREE.Vector3();
const VP = new THREE.Vector3();
const TMP = new THREE.Vector3();
const TMP2 = new THREE.Vector3();
const TMP3 = new THREE.Vector3();
const DIR = new THREE.Vector3();
const QI = new THREE.Quaternion();
const S = {};

function basis(car) {
  ex.set(1, 0, 0).applyQuaternion(car.q);
  ey.set(0, 1, 0).applyQuaternion(car.q);
  ez.set(0, 0, 1).applyQuaternion(car.q);
}

// World-space inverse inertia applied to v
function invI(car, v, out) {
  QI.copy(car.q).invert();
  out.copy(v).applyQuaternion(QI).multiply(INV_I).applyQuaternion(car.q);
  return out;
}

// Velocity of a body point at offset r from the centre of mass
function pointVel(car, r, out) {
  return out.crossVectors(car.w, r).add(car.v);
}

// Angular part of the effective mass along dir at offset r
function angularK(car, r, dir) {
  TMP.crossVectors(r, dir);
  invI(car, TMP, TMP2);
  TMP3.crossVectors(TMP2, r);
  return dir.dot(TMP3);
}

function applyImpulse(car, r, dir, j) {
  car.v.addScaledVector(dir, j);
  TMP.crossVectors(r, dir).multiplyScalar(j);
  invI(car, TMP, TMP2);
  car.w.add(TMP2);
}

function groundNormal(slope, track, j, out) {
  return out.set(-slope * track.tx[j], 1, -slope * track.tz[j]).normalize();
}

// Front wheels lock less at speed so full lock stays near the grip limit
export function steerMax(v) {
  return Math.min(0.6, 0.1 + 70 / (v * v + 1));
}

// ── Car state ───────────────────────────────────────────────────────────────

export function createCar(track, slot, opts = {}) {
  const i = (track.N - Math.round(slot.back / track.ds)) % track.N;
  const car = {
    id: opts.id || opts.name || 'car',
    name: opts.name || 'CPU',
    isPlayer: !!opts.isPlayer,
    remote: !!opts.remote,
    ai: opts.ai || null,
    q: new THREE.Quaternion(),
    v: new THREE.Vector3(),
    w: new THREE.Vector3(),
    comp: new Float32Array(4),
    susp: new Float32Array(4),
    contact: [false, false, false, false],
    lap: 0,
    cp: true,
    finished: false,
    finishTime: null,
    lapStart: 0,
    bestLap: null,
    power: 1,
  };
  placeCar(car, track, i, slot.lateral, 0);
  return car;
}

export function resetCar(car, track, slot) {
  Object.assign(
    car,
    createCar(track, slot, { id: car.id, name: car.name, isPlayer: car.isPlayer, remote: car.remote, ai: car.ai })
  );
}

// Put a car at rest (or rolling at `speed`) on sample idx, upright
export function placeCar(car, track, idx, lateral = 0, speed = 0) {
  const p = trackPoint(track, idx, lateral);
  const k = ((idx % track.N) + track.N) % track.N;
  car.x = p.x;
  car.z = p.z;
  car.cy = p.y + COM_H;
  car.y = p.y;
  car.h = p.heading;
  car.q.setFromAxisAngle(UP, p.heading);
  car.v.set(Math.sin(p.heading) * speed, 0, Math.cos(p.heading) * speed);
  car.w.set(0, 0, 0);
  car.comp.fill(SUSP - REST);
  car.susp.fill(0);
  Object.assign(car, {
    vx: car.v.x, vy: 0, vz: car.v.z, vF: speed, vR: 0, slip: 0, steer: 0, steerAngle: 0,
    idx: k, prevIdx: k, grounded: true, upright: 1, airT: 0, flipT: 0, stuckT: 0, lost: false,
    impact: 0, landed: 0, wall: null, wallHit: null, bodyHit: null, scrape: null, burnout: 0, wheelSpin: car.wheelSpin || 0,
  });
}

// Back on the road where the car is: centre of the track, a few metres back,
// briefly a ghost so the field can't punt it straight away
export function respawn(car, track) {
  const idx = (car.idx - 4 + track.N) % track.N;
  const s = surface(track, car.idx, car.x, car.z, {});
  const lateral = Math.max(-2, Math.min(2, s.lat * 0.4));
  placeCar(car, track, idx, lateral, 0);
  car.cy += 0.4;
  car.ghost = 2;
}

// ── Simulation ──────────────────────────────────────────────────────────────

export function stepCar(car, input, dt, track) {
  car.wall = null;
  car.prevIdx = car.idx;
  const n = Math.max(1, Math.ceil(dt / SUBSTEP - 1e-6));
  for (let k = 0; k < n; k++) substep(car, input, dt / n, track);
  if (car.ghost > 0) car.ghost = Math.max(0, car.ghost - dt);

  basis(car);
  const fl = Math.hypot(ez.x, ez.z);
  if (fl > 0.2) car.h = Math.atan2(ez.x, ez.z);
  const sinH = Math.sin(car.h);
  const cosH = Math.cos(car.h);
  car.vx = car.v.x;
  car.vy = car.v.y;
  car.vz = car.v.z;
  car.vF = car.v.x * sinH + car.v.z * cosH;
  car.vR = -car.v.x * cosH + car.v.z * sinH;
  car.slip = car.grounded ? Math.abs(car.vR) : 0;
  car.upright = ey.y;
  car.y = car.cy - ey.y * COM_H;
  car.wheelSpin += (car.vF / WHEEL_R) * dt;

  // Flipped (on the roof or side), stuck against something, or off the map
  const speed = Math.hypot(car.v.x, car.v.z);
  car.flipT = ey.y < 0.4 && speed < 6 ? car.flipT + dt : 0;
  const trying = input.throttle || input.brake;
  car.stuckT = car.grounded && trying && Math.abs(car.vF) < 1.2 ? car.stuckT + dt : Math.max(0, car.stuckT - dt * 2);
  const along = Math.sin(car.h) * track.tx[car.idx] + Math.cos(car.h) * track.tz[car.idx];
  car.wrongT = along < -0.2 && speed < 10 ? (car.wrongT || 0) + dt : 0;
  const s = surface(track, car.idx, car.x, car.z, S);
  // Flew over the barriers: back on the road after a moment in the air
  car.offT = Math.abs(s.lat) > s.hw + 0.8 ? (car.offT || 0) + dt : 0;
  car.lost = car.offT > 1.5 || Math.abs(s.lat) > s.hw + 40 || car.cy < -8 || !Number.isFinite(car.cy);
}

function substep(car, input, dt, track) {
  basis(car);
  const vy0 = car.v.y;

  const fl = Math.hypot(ez.x, ez.z) || 1;
  const vF = (car.v.x * ez.x + car.v.z * ez.z) / fl;
  const throttle = Math.min(1, +input.throttle || 0);
  const brake = Math.min(1, +input.brake || 0);
  const hand = !!input.handbrake;

  car.steer += ((input.steer || 0) - car.steer) * Math.min(1, dt * (car.isPlayer ? 16 : 8));
  const delta = car.steer * steerMax(Math.abs(vF));
  car.steerAngle = delta;

  let drive = 0;
  let brakeF = 0;
  if (throttle > 0) drive = throttle * ENGINE * (car.power || 1) * (1 - Math.max(0, vF) / VMAX);
  if (brake > 0) {
    if (vF > 0.5) brakeF = brake * BRAKE;
    else if (vF > -14) drive -= brake * REVERSE;
  }

  F.set(0, -GRAVITY, 0).addScaledVector(car.v, -DRAG);
  T.set(0, 0, 0);

  // Springs
  const springs = [0, 0, 0, 0];
  const dist = [0, 0, 0, 0];
  let contacts = 0;
  for (let k = 0; k < 4; k++) {
    const wd = WHEELS[k];
    A.set(car.x, car.cy, car.z).addScaledVector(ex, wd.x).addScaledVector(ey, MOUNT_Y).addScaledVector(ez, wd.z);
    surface(track, car.idx, A.x, A.z, S);
    groundNormal(S.slope, track, S.j, N_);
    const cosT = ey.dot(N_);
    car.contact[k] = false;
    if (cosT < 0.35) {
      car.comp[k] = 0;
      car.susp[k] = REST - SUSP;
      continue;
    }
    const d = ((A.y - S.h) * N_.y) / cosT;
    const len = d - WHEEL_R;
    if (len >= SUSP) {
      car.comp[k] = 0;
      car.susp[k] = REST - SUSP;
      continue;
    }
    const x = SUSP - Math.max(0, len);
    const xdot = Math.max(-8, Math.min(8, (x - car.comp[k]) / dt));
    car.comp[k] = x;
    let f = SPRING * x + DAMP * xdot;
    if (x > SUSP * 0.85) f += 420 * (x - SUSP * 0.85); // bump stop
    springs[k] = Math.max(0, f);
    dist[k] = Math.max(0, len);
    car.susp[k] = REST - Math.max(0, len);
    car.contact[k] = true;
    contacts++;
  }
  // Anti-roll bars
  for (const [l, r] of [[0, 1], [2, 3]]) {
    if (!car.contact[l] || !car.contact[r]) continue;
    const d = ARB * (car.comp[l] - car.comp[r]);
    springs[l] = Math.max(0, springs[l] + d);
    springs[r] = Math.max(0, springs[r] - d);
  }

  // Sliding sideways fast (after a hit, not a drift) the tyres dig in and
  // trip the car over
  const vSide = Math.abs(car.v.dot(ex));
  const trip = smooth(TRIP[0], TRIP[1], vSide) * smooth(0.6, 0.85, vSide / (car.v.length() + 1e-3));

  // Tyres
  let spin = 0;
  for (let k = 0; k < 4; k++) {
    if (!car.contact[k]) continue;
    const wd = WHEELS[k];
    A.set(car.x, car.cy, car.z).addScaledVector(ex, wd.x).addScaledVector(ey, MOUNT_Y).addScaledVector(ez, wd.z);
    C.copy(A).addScaledVector(ey, -(dist[k] + WHEEL_R));
    R.set(C.x - car.x, C.y - car.cy, C.z - car.z);
    surface(track, car.idx, C.x, C.z, S);
    groundNormal(S.slope, track, S.j, N_);

    const fs = springs[k];
    F.addScaledVector(ey, fs);
    T.add(TMP.crossVectors(R, ey).multiplyScalar(fs));

    const steer = wd.front ? delta : 0;
    FW.copy(ez).multiplyScalar(Math.cos(steer)).addScaledVector(ex, -Math.sin(steer));
    FW.addScaledVector(N_, -FW.dot(N_)).normalize();
    SIDE.crossVectors(N_, FW);
    pointVel(car, R, VP);
    const vl = VP.dot(FW);
    const vs = VP.dot(SIDE);
    const load = Math.min(fs, GRAVITY * 1.2);
    const mu = wd.front ? MU_F : MU_R;
    const locked = hand && !wd.front;
    const muLat = locked ? mu * HANDBRAKE_GRIP : mu;

    const alpha = Math.atan2(vs, Math.max(Math.abs(vl), 4)) / PEAK;
    const a = Math.abs(alpha);
    const curve = a < 1 ? a * (2 - a) : 1 - 0.14 * smooth(1, 4, a);
    let lat = -Math.sign(alpha) * curve * muLat * load * (1 + 0.8 * trip);

    let lon = 0;
    if (locked) lon = -Math.sign(vl) * Math.min(1, Math.abs(vl) * 2) * mu * load * 0.45;
    else {
      lon = drive * wd.drive * 4 * (load / GRAVITY);
      if (brakeF > 0) lon -= Math.sign(vl) * Math.min(1, Math.abs(vl) * 2) * brakeF * wd.brake * 4 * (load / GRAVITY);
      if (!throttle && !brake) lon -= Math.max(-1, Math.min(1, vl * 2)) * (ROLL / 4) * (load / (GRAVITY / 4));
    }
    // Friction circle. Driven/braked wheels keep their cornering grip first
    // (traction control + ABS) so flooring it out of a hairpin doesn't spin
    // the car; a locked handbrake shares grip evenly and slides.
    const max = mu * load * (1 + 0.8 * trip);
    const mag = Math.hypot(lon, lat);
    if (mag > max) {
      if (locked) {
        lon *= max / mag;
        lat *= max / mag;
      } else {
        const keepLat = Math.min(Math.abs(lat), max * 0.92);
        const room = Math.sqrt(Math.max(0, max * max - keepLat * keepLat));
        if (Math.abs(lon) > room && drive > 0) spin = Math.max(spin, Math.min(1, (Math.abs(lon) - room) / (max * 0.3)));
        lat = Math.sign(lat) * keepLat;
        lon = Math.sign(lon) * Math.min(Math.abs(lon), room);
      }
    }
    DIR.copy(FW).multiplyScalar(lon).addScaledVector(SIDE, lat);
    F.add(DIR);
    RT.copy(R).addScaledVector(ey, -R.dot(ey) * ROLL_ASSIST * (1 - trip));
    T.add(TMP.crossVectors(RT, DIR));
  }
  car.burnout = spin;
  car.grounded = contacts >= 2;

  // Arcade turn-in: nudge the yaw rate toward the one the steering asks
  // for (capped by grip). Off on the handbrake so the rear can slide.
  if (contacts >= 2 && !hand) {
    const speed = Math.abs(vF);
    const want = speed > 1 ? (-vF * Math.tan(delta)) / WHEELBASE : 0;
    const cap = (MU_F * GRAVITY) / Math.max(speed, 4);
    const target = Math.max(-cap, Math.min(cap, want));
    T.addScaledVector(ey, (target - car.w.dot(ey)) * YAW_ASSIST * Math.min(1, speed / 6));
  }

  // A little air control: steer to yaw
  if (contacts === 0) T.addScaledVector(ey, -car.steer * 1.4);

  car.v.addScaledVector(F, dt);
  invI(car, T, TMP3);
  car.w.addScaledVector(TMP3, dt);
  car.w.multiplyScalar(Math.exp(-(contacts ? 0.5 : 0.12) * dt));

  bodyContacts(car, track);

  car.x += car.v.x * dt;
  car.cy += car.v.y * dt;
  car.z += car.v.z * dt;
  const { q, w } = car;
  const qx = q.x;
  const qy = q.y;
  const qz = q.z;
  const qw = q.w;
  q.x += 0.5 * dt * (w.x * qw + w.y * qz - w.z * qy);
  q.y += 0.5 * dt * (-w.x * qz + w.y * qw + w.z * qx);
  q.z += 0.5 * dt * (w.x * qy - w.y * qx + w.z * qw);
  q.w += 0.5 * dt * (-w.x * qx - w.y * qy - w.z * qz);
  q.normalize();

  car.idx = locate(track, car.x, car.z, car.idx);

  // Landings (for dust, sparks and camera shake)
  if (contacts === 0) car.airT += dt;
  else {
    if (car.airT > 0.2 && vy0 < -5) car.landed = Math.max(car.landed || 0, Math.min(1.6, -vy0 / 11));
    car.airT = 0;
  }
}

// Hull points against the road and the barriers: impulses with friction,
// so a car can slide on its roof, bounce off walls and tip over
function bodyContacts(car, track) {
  // Which side of the barriers the car is on (it can fly over them)
  const centre = surface(track, car.idx, car.x, car.z, S);
  const outside = !centre.solid && Math.abs(centre.lat) > centre.hw;
  let lift = 0;
  let pushX = 0;
  let pushZ = 0;
  for (let n = 0; n < BODY.length; n++) {
    const b = BODY[n];
    R.set(0, 0, 0).addScaledVector(ex, b[0]).addScaledVector(ey, b[1]).addScaledVector(ez, b[2]);
    const wx = car.x + R.x;
    const wy = car.cy + R.y;
    const wz = car.z + R.z;
    surface(track, car.idx, wx, wz, S);

    // Road
    const pen = S.h - wy;
    if (pen > 0) {
      groundNormal(S.slope, track, S.j, N_);
      pointVel(car, R, VP);
      const vn = VP.dot(N_);
      if (vn < 0) {
        const j = (-(1 + 0.12) * vn) / (1 + angularK(car, R, N_));
        applyImpulse(car, R, N_, j);
        pointVel(car, R, VP);
        DIR.copy(VP).addScaledVector(N_, -VP.dot(N_));
        const vt = DIR.length();
        if (vt > 1e-3) {
          DIR.multiplyScalar(1 / vt);
          const jt = Math.min(vt / (1 + angularK(car, R, DIR)), 0.55 * j);
          applyImpulse(car, R, DIR, -jt);
        }
        if (-vn > 3 && (!car.bodyHit || -vn > car.bodyHit.strength)) car.bodyHit = { x: wx, y: S.h, z: wz, strength: -vn };
        if (vt > 4) car.scrape = { x: wx, y: S.h, z: wz, speed: vt };
      }
      lift = Math.max(lift, pen);
    }

    // Barriers: solid up to their top (in tunnels and narrow streets the
    // walls go all the way up); higher parts of a flying car clear them
    const over = outside ? S.hw + 0.72 - Math.abs(S.lat) : Math.abs(S.lat) - (S.hw - 0.1);
    const inWall = S.solid || (wy < S.roadH + 0.92 && Math.abs(S.lat) > S.hw - 0.1 && Math.abs(S.lat) < S.hw + 0.72);
    if (over > 0 && inWall) {
      const s = Math.sign(S.lat) * (outside ? -1 : 1);
      const nxw = -s * track.nx[S.j];
      const nzw = -s * track.nz[S.j];
      pointVel(car, R, VP);
      const vnH = VP.x * nxw + VP.z * nzw;
      // Jersey barrier: a hard hit low down kicks the car upwards
      const kick = wy - S.roadH < 0.8 ? 0.85 * smooth(3, 11, -vnH) : 0;
      N_.set(nxw, kick, nzw).normalize();
      const vn = VP.dot(N_);
      const along = Math.abs(VP.x * track.tx[S.j] + VP.z * track.tz[S.j]);
      if (vn < 0) {
        const j = (-(1 + 0.3) * vn) / (1 + angularK(car, R, N_));
        applyImpulse(car, R, N_, j);
        pointVel(car, R, VP);
        DIR.copy(VP).addScaledVector(N_, -VP.dot(N_));
        const vt = DIR.length();
        if (vt > 1e-3) {
          DIR.multiplyScalar(1 / vt);
          const jt = Math.min(vt / (1 + angularK(car, R, DIR)), 0.3 * j);
          applyImpulse(car, R, DIR, -jt);
        }
        car.impact = Math.max(car.impact || 0, -vn);
        if (!car.wallHit || -vn > car.wallHit.strength) car.wallHit = { x: wx, z: wz, y: wy, strength: -vn };
      }
      if (!car.wall || along > car.wall.scrape) car.wall = { x: wx, z: wz, y: wy, scrape: along, impact: Math.max(0, -vn) };
      if (Math.abs(nxw * over) > Math.abs(pushX)) pushX = nxw * over;
      if (Math.abs(nzw * over) > Math.abs(pushZ)) pushZ = nzw * over;
    }
  }
  car.cy += lift * 0.8;
  car.x += pushX;
  car.z += pushZ;
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

// ── AI ──────────────────────────────────────────────────────────────────────
// Pure pursuit along the racing line, speed from the line's profile, and a
// lane change round anyone in the way.
const WHEELBASE = 2.32;

export function aiInput(car, track, cars = [], dt = 1 / 60) {
  const { N, ds, vline, line, px, pz, nx, nz, hw } = track;
  const v = Math.max(0, car.vF);
  const look = 6 + v * 0.36;
  const ti = (car.idx + Math.round(look / ds)) % N;

  let lane = line[ti] + car.ai.bias * 0.35;
  let slow = 1;
  const myLat = (car.x - px[car.idx]) * nx[car.idx] + (car.z - pz[car.idx]) * nz[car.idx];
  for (const o of cars) {
    if (o === car || o.ghost > 0) continue;
    let ahead = o.idx - car.idx;
    if (ahead < -N / 2) ahead += N;
    if (ahead > N / 2) ahead -= N;
    const dist = ahead * ds;
    if (dist <= 0 || dist > 16) continue;
    const oLat = (o.x - px[o.idx]) * nx[o.idx] + (o.z - pz[o.idx]) * nz[o.idx];
    if (Math.abs(oLat - lane) > 1.9) continue;
    // go round on the side with more room
    const room = hw[o.idx];
    lane = oLat + (oLat + 3.2 < room - 1.4 && (oLat < 0 || oLat - 3.2 < -room + 1.4) ? 3.2 : -3.2);
    if (dist < 5 && car.vF > o.vF + 2) slow = 0.96;
  }
  const lim = hw[ti] - 2;
  lane = Math.max(-lim, Math.min(lim, lane));

  const tx = px[ti] + nx[ti] * lane - car.x;
  const tz = pz[ti] + nz[ti] * lane - car.z;
  // Aim along the direction of travel (not the nose) so slides don't confuse it
  const vh = Math.hypot(car.vx, car.vz) > 5 ? Math.atan2(car.vx, car.vz) : car.h;
  const sinH = Math.sin(vh);
  const cosH = Math.cos(vh);
  const fwd = tx * sinH + tz * cosH;
  const right = -tx * cosH + tz * sinH;
  const ld2 = Math.max(4, fwd * fwd + right * right);
  const kappa = (2 * right) / ld2;
  // feed-forward wheel angle plus yaw-rate damping (w.y < 0 = turning right)
  const angle = Math.atan(WHEELBASE * kappa) + 0.07 * (v * kappa + car.w.y);
  const steer = Math.max(-1, Math.min(1, angle / steerMax(v) + (fwd < 0 ? Math.sign(right) : 0)));

  // Nose in a wall: back out for a moment, swinging the nose toward the road
  if (car.stuckT > 0.7 && !(car.ai.rev > 0)) car.ai.rev = 1.3;
  if (car.ai.rev > 0) {
    car.ai.rev -= dt;
    car.stuckT = 0;
    return { steer: -Math.sign(right || 1), throttle: 0, brake: 1, handbrake: false };
  }

  const ahead = (car.idx + Math.round((4 + v * 0.12) / ds)) % N;
  const target = vline[ahead] * car.ai.skill * slow;
  const err = target - car.vF;
  return {
    steer,
    throttle: err > 0 ? Math.min(1, 0.25 + err * 0.5) : 0,
    brake: err < -1.5 ? Math.min(1, -err * 0.25) : 0,
    handbrake: false,
  };
}

// ── Car vs car ──────────────────────────────────────────────────────────────
// Oriented boxes on the ground plane (separating axis test) for detection,
// then a 3D impulse at the contact point. A hard side-on hit lifts the struck
// car's flank, which is what tips cars over.

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

const RA = new THREE.Vector3();
const RB = new THREE.Vector3();
const VA = new THREE.Vector3();
const VB = new THREE.Vector3();
const NN = new THREE.Vector3();
const TT = new THREE.Vector3();

// Returns contacts ({x, y, z, strength, a, b}) for effects. Remote cars are
// moved by their owners, so they act as immovable obstacles here.
export function collideCars(cars) {
  const contacts = [];
  for (let a = 0; a < cars.length; a++) {
    for (let b = a + 1; b < cars.length; b++) {
      const A_ = cars[a];
      const B_ = cars[b];
      if (A_.remote && B_.remote) continue;
      if (A_.ghost > 0 || B_.ghost > 0) continue;
      const dx = B_.x - A_.x;
      const dz = B_.z - A_.z;
      if (dx * dx + dz * dz > 20 || Math.abs(A_.cy - B_.cy) > 1.5) continue;

      const ca = corners(A_);
      const cb = corners(B_);
      let depth = Infinity;
      let nx = 0;
      let nz = 0;
      let fromA = true;
      let separated = false;
      const axes = [...ca.axes, ...cb.axes];
      for (let k = 0; k < axes.length; k++) {
        const ax = axes[k];
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
          fromA = k < 2;
        }
      }
      if (separated) continue;

      // Contact point: the corner that went deepest into the other car
      let px;
      let pz;
      if (fromA) {
        let m = Infinity;
        cb.pts.forEach(([x, z]) => {
          const d = x * nx + z * nz;
          if (d < m) {
            m = d;
            px = x;
            pz = z;
          }
        });
      } else {
        let m = -Infinity;
        ca.pts.forEach(([x, z]) => {
          const d = x * nx + z * nz;
          if (d > m) {
            m = d;
            px = x;
            pz = z;
          }
        });
      }

      // Push apart (remote cars don't move)
      const wa = A_.remote ? 0 : B_.remote ? 1 : 0.5;
      const wb = 1 - wa;
      A_.x -= nx * depth * wa;
      A_.z -= nz * depth * wa;
      B_.x += nx * depth * wb;
      B_.z += nz * depth * wb;

      const py = (A_.cy + B_.cy) / 2 + 0.05;
      RA.set(px - A_.x, py - A_.cy, pz - A_.z);
      RB.set(px - B_.x, py - B_.cy, pz - B_.z);
      pointVel(A_, RA, VA);
      pointVel(B_, RB, VB);
      const rel = (VB.x - VA.x) * nx + (VB.z - VA.z) * nz;
      if (rel >= 0) continue;
      const strength = -rel;

      // Who gets lifted: the car hit more side-on
      const sideA = Math.abs(-Math.cos(A_.h) * nx + Math.sin(A_.h) * nz);
      const sideB = Math.abs(-Math.cos(B_.h) * nx + Math.sin(B_.h) * nz);
      const lift = 0.55 * smooth(5, 16, strength);
      NN.set(nx, sideB >= sideA ? lift : -lift, nz).normalize();

      const imA = A_.remote ? 0 : 1;
      const imB = B_.remote ? 0 : 1;
      const vrel = VB.sub(VA).dot(NN);
      if (vrel < 0) {
        const k = imA * (1 + angularK(A_, RA, NN)) + imB * (1 + angularK(B_, RB, NN));
        const j = ((-(1 + 0.4) * vrel) / k) * 1.1;
        if (imA) applyImpulse(A_, RA, NN, -j);
        if (imB) applyImpulse(B_, RB, NN, j);
        // rubbing friction
        pointVel(A_, RA, VA);
        pointVel(B_, RB, VB);
        TT.subVectors(VB, VA).addScaledVector(NN, -VB.dot(NN) + VA.dot(NN));
        const vt = TT.length();
        if (vt > 1e-3) {
          TT.multiplyScalar(1 / vt);
          const kt = imA * (1 + angularK(A_, RA, TT)) + imB * (1 + angularK(B_, RB, TT));
          const jt = Math.min(vt / kt, 0.3 * j);
          if (imA) applyImpulse(A_, RA, TT, jt);
          if (imB) applyImpulse(B_, RB, TT, -jt);
        }
      }
      // A proper ram launches the struck car, tumbling
      const struck = sideB >= sideA ? B_ : A_;
      if (strength > 10 && !struck.remote) {
        const k = strength - 10;
        struck.v.y += k * 0.32;
        struck.w.x += (Math.random() - 0.5) * k * 0.25;
        struck.w.z += (Math.random() - 0.5) * k * 0.35;
      }
      A_.impact = Math.max(A_.impact || 0, strength);
      B_.impact = Math.max(B_.impact || 0, strength);
      contacts.push({ x: px, z: pz, y: py, strength, a: A_, b: B_ });
    }
  }
  return contacts;
}
