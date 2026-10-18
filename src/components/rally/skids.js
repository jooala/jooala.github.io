// Tyre marks: a ring buffer of quads laid on the road behind sliding wheels.
import * as THREE from 'three';

const WIDTH = 0.12;

export default class Skids {
  constructor(maxQuads = 3000) {
    this.max = maxQuads;
    this.cursor = 0;
    this.pos = new Float32Array(maxQuads * 4 * 3);
    this.alpha = new Float32Array(maxQuads * 4);
    const idx = new Uint32Array(maxQuads * 6);
    for (let q = 0; q < maxQuads; q++) {
      const v = q * 4;
      idx.set([v, v + 2, v + 1, v + 1, v + 2, v + 3], q * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    this.material = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        attribute float aAlpha;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() { gl_FragColor = vec4(0.07, 0.07, 0.065, vAlpha); }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    });
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    this.geometry = g;
    this.trails = new Map();
  }

  // Continue (or start) the trail for one wheel; strength 0 lifts the tyre off
  add(key, x, y, z, strength) {
    const prev = this.trails.get(key);
    if (strength <= 0.05) {
      this.trails.delete(key);
      return;
    }
    if (!prev) {
      this.trails.set(key, { x, y, z });
      return;
    }
    const dx = x - prev.x;
    const dz = z - prev.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.35) return;
    if (len > 4) {
      this.trails.set(key, { x, y, z });
      return;
    }
    const sx = (-dz / len) * WIDTH;
    const sz = (dx / len) * WIDTH;
    const q = this.cursor;
    this.cursor = (this.cursor + 1) % this.max;
    const p = this.pos;
    const o = q * 12;
    const yy = y + 0.035;
    const py = prev.y + 0.035;
    p.set([prev.x - sx, py, prev.z - sz, prev.x + sx, py, prev.z + sz, x - sx, yy, z - sz, x + sx, yy, z + sz], o);
    const a = Math.min(0.7, 0.25 + strength * 0.45);
    this.alpha.set([a, a, a, a], q * 4);
    this.trails.set(key, { x, y, z });
    this.dirty = true;
  }

  // Marks slowly weather away
  update(dt) {
    const fade = Math.exp(-dt / 40);
    for (let i = 0; i < this.alpha.length; i++) this.alpha[i] *= fade;
    this.geometry.attributes.aAlpha.needsUpdate = true;
    if (this.dirty) {
      this.geometry.attributes.position.needsUpdate = true;
      this.dirty = false;
    }
  }

  clear() {
    this.alpha.fill(0);
    this.trails.clear();
    this.geometry.attributes.aAlpha.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
