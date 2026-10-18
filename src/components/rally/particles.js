// Pooled point particles: dust, tyre smoke, rubber/gravel debris (normal
// blending) and sparks (additive). Each particle has its own colour, size,
// growth, gravity and lifetime.
import * as THREE from 'three';

const VERT = /* glsl */ `
  attribute float aLife;
  attribute float aSize;
  attribute float aGrow;
  attribute vec3 aColor;
  uniform float uScale;
  varying float vLife;
  varying vec3 vColor;
  void main() {
    vLife = aLife;
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aLife >= 1.0 ? 0.0 : aSize * (1.0 + aLife * aGrow) * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG_SOFT = /* glsl */ `
  uniform float uAlpha;
  varying float vLife;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d) * (1.0 - vLife) * uAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`;

const FRAG_GLOW = /* glsl */ `
  varying float vLife;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * (1.0 - vLife * vLife);
    gl_FragColor = vec4(vColor * (1.4 - vLife), a);
  }
`;

class Pool {
  constructor(count, glow) {
    this.count = count;
    this.cursor = 0;
    this.pos = new Float32Array(count * 3);
    this.vel = new Float32Array(count * 3);
    this.color = new Float32Array(count * 3);
    this.life = new Float32Array(count).fill(1);
    this.rate = new Float32Array(count).fill(1);
    this.size = new Float32Array(count).fill(1);
    this.grow = new Float32Array(count).fill(1);
    this.gravity = new Float32Array(count);
    this.drag = new Float32Array(count);
    const g = new THREE.BufferGeometry();
    const dyn = (arr, n) => new THREE.BufferAttribute(arr, n).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('position', dyn(this.pos, 3));
    g.setAttribute('aLife', dyn(this.life, 1));
    g.setAttribute('aSize', dyn(this.size, 1));
    g.setAttribute('aGrow', dyn(this.grow, 1));
    g.setAttribute('aColor', dyn(this.color, 3));
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: glow ? FRAG_GLOW : FRAG_SOFT,
      uniforms: { uScale: { value: 400 }, uAlpha: { value: 0.5 } },
      transparent: true,
      depthWrite: false,
      blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.geometry = g;
    this.dirty = false;
  }

  emit(o) {
    const i = this.cursor;
    this.cursor = (this.cursor + 1) % this.count;
    const s = o.spread ?? 1;
    this.pos[i * 3] = o.x + (Math.random() - 0.5) * (o.jitter ?? 0.4);
    this.pos[i * 3 + 1] = o.y;
    this.pos[i * 3 + 2] = o.z + (Math.random() - 0.5) * (o.jitter ?? 0.4);
    this.vel[i * 3] = (o.vx ?? 0) + (Math.random() - 0.5) * s;
    this.vel[i * 3 + 1] = (o.vy ?? 0) + Math.random() * s * 0.6;
    this.vel[i * 3 + 2] = (o.vz ?? 0) + (Math.random() - 0.5) * s;
    const c = o.color;
    this.color[i * 3] = c.r;
    this.color[i * 3 + 1] = c.g;
    this.color[i * 3 + 2] = c.b;
    this.life[i] = 0;
    this.rate[i] = 1 / ((o.life ?? 1.4) * (0.7 + Math.random() * 0.6));
    this.size[i] = (o.size ?? 1.5) * (0.7 + Math.random() * 0.6);
    this.grow[i] = o.grow ?? 2.4;
    this.gravity[i] = o.gravity ?? -0.5;
    this.drag[i] = o.drag ?? 1.8;
    this.dirty = true;
  }

  update(dt, scale, floorY = 0) {
    this.material.uniforms.uScale.value = scale;
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] >= 1) continue;
      this.life[i] = Math.min(1, this.life[i] + this.rate[i] * dt);
      const drag = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= drag;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * drag - this.gravity[i] * dt;
      this.vel[i * 3 + 2] *= drag;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      // debris and sparks bounce off the road
      if (this.pos[i * 3 + 1] < floorY && this.vel[i * 3 + 1] < 0) {
        this.pos[i * 3 + 1] = floorY;
        this.vel[i * 3 + 1] *= -0.35;
        this.vel[i * 3] *= 0.6;
        this.vel[i * 3 + 2] *= 0.6;
      }
    }
    const a = this.geometry.attributes;
    a.position.needsUpdate = true;
    a.aLife.needsUpdate = true;
    if (this.dirty) {
      a.aSize.needsUpdate = true;
      a.aGrow.needsUpdate = true;
      a.aColor.needsUpdate = true;
      this.dirty = false;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

const COLORS = {
  dust: new THREE.Color('#bdb5a6'),
  smoke: new THREE.Color('#e9e7e2'),
  rubber: new THREE.Color('#232220'),
  gravel: new THREE.Color('#6f6b63'),
  spark: new THREE.Color('#ffb347'),
  sparkHot: new THREE.Color('#fff1c2'),
  paint: new THREE.Color('#d8d4cb'),
};

export default class Effects {
  constructor() {
    this.soft = new Pool(2200, false);
    this.glow = new Pool(700, true);
    this.group = new THREE.Group();
    this.group.add(this.soft.points, this.glow.points);
  }

  // Rally dust kicked up by the wheels
  dust(x, y, z, vx, vz, speed) {
    this.soft.emit({ x, y, z, vx, vz, vy: 0.8, spread: 1.2, size: 1.4 + speed * 0.02, color: COLORS.dust, life: 1.4 });
  }

  // White tyre smoke from slides, handbrake turns and launches
  smoke(x, y, z, vx, vz, amount = 1) {
    this.soft.emit({
      x, y, z, vx, vz, vy: 0.9, spread: 1.4, size: 1.6 + amount, grow: 3.2, color: COLORS.smoke, life: 2.2, gravity: -0.9, drag: 2.2,
    });
  }

  // Bits of rubber and gravel flicked off the tyres
  debris(x, y, z, vx, vz, n = 1) {
    for (let k = 0; k < n; k++) {
      this.soft.emit({
        x, y, z, vx: vx + (Math.random() - 0.5) * 3, vz: vz + (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 3,
        spread: 1.5, size: 0.14 + Math.random() * 0.12, grow: 0, color: Math.random() < 0.5 ? COLORS.rubber : COLORS.gravel,
        life: 1.1, gravity: 16, drag: 0.6, jitter: 0.6,
      });
    }
  }

  // Sparks from metal on concrete or metal on metal
  sparks(x, y, z, vx, vz, n = 6, power = 6) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      this.glow.emit({
        x, y, z,
        vx: vx * 0.5 + Math.cos(a) * power * Math.random(),
        vz: vz * 0.5 + Math.sin(a) * power * Math.random(),
        vy: 1 + Math.random() * power * 0.6,
        spread: 0.5, size: 0.16 + Math.random() * 0.1, grow: 0, color: Math.random() < 0.4 ? COLORS.sparkHot : COLORS.spark,
        life: 0.45, gravity: 14, drag: 1.2, jitter: 0.3,
      });
    }
  }

  // Heavy landing or crash: dust ring, debris and sparks
  impact(x, y, z, strength = 1, sparks = true) {
    const n = Math.round(10 + strength * 14);
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2;
      const p = 2 + strength * 3;
      this.soft.emit({
        x, y, z, vx: Math.cos(a) * p, vz: Math.sin(a) * p, vy: p * 0.3, spread: p * 0.4, size: 2.2, color: COLORS.dust, life: 1.8,
      });
    }
    this.debris(x, y + 0.3, z, 0, 0, Math.round(4 + strength * 8));
    if (sparks) this.sparks(x, y + 0.2, z, 0, 0, Math.round(6 + strength * 10), 5 + strength * 3);
  }

  // Paint chips and sparks when two cars collide
  crash(x, y, z, strength) {
    this.sparks(x, y + 0.6, z, 0, 0, Math.round(4 + strength * 1.2), 4 + strength * 0.3);
    for (let k = 0; k < Math.min(10, 2 + strength * 0.5); k++) {
      this.soft.emit({
        x, y: y + 0.7, z, vx: (Math.random() - 0.5) * 6, vz: (Math.random() - 0.5) * 6, vy: 2 + Math.random() * 3,
        spread: 1, size: 0.12, grow: 0, color: COLORS.paint, life: 1.2, gravity: 16, drag: 0.5,
      });
    }
  }

  update(dt, scale) {
    this.soft.update(dt, scale);
    this.glow.update(dt, scale);
  }

  dispose() {
    this.soft.dispose();
    this.glow.dispose();
  }
}
