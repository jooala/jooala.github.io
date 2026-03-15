import { useEffect, useRef } from 'react';

export default function WireframeBoxes() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let animId;
    let mounted = true;
    let cleanupFn = () => {};

    import('three').then((THREE) => {
      if (!mounted || !mountRef.current) return;

      const container = mountRef.current;
      const w = container.clientWidth;
      const h = container.clientHeight;

      /* ── Scene ── */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 1000);
      camera.position.z = 18;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const canvas = renderer.domElement;
      Object.assign(canvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      });
      container.appendChild(canvas);

      /* ── Helper: edge-only wireframe box ── */
      const makeBox = (x, y, z, size, color, opacity) => {
        const geo = new THREE.BoxGeometry(size, size, size);
        const edges = new THREE.EdgesGeometry(geo);
        geo.dispose();
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
        const mesh = new THREE.LineSegments(edges, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        );
        return mesh;
      };

      /* ── Base field of 30 visible wireframe boxes ── */
      const baseBoxes = [];
      for (let i = 0; i < 30; i++) {
        const size = 0.8 + Math.random() * 2.6;
        // Bias upward so boxes are visible in the hero top
        const ySign = Math.random() > 0.35 ? 1 : -1;
        const b = makeBox(
          (Math.random() - 0.5) * 36,
          Math.random() * 11 * ySign,
          (Math.random() - 0.5) * 14,
          size,
          Math.random() > 0.45 ? 0x00ffff : 0xffffff,
          0.28 + Math.random() * 0.58,
        );
        b.userData.rot = {
          x: (Math.random() - 0.5) * 0.007,
          y: (Math.random() - 0.5) * 0.009,
          z: (Math.random() - 0.5) * 0.005,
        };
        scene.add(b);
        baseBoxes.push(b);
      }

      /* ── Mouse → spawn clusters ── */
      const spawnedBoxes = [];
      let lastSpawn = 0;

      const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        if (
          e.clientX < rect.left || e.clientX > rect.right ||
          e.clientY < rect.top  || e.clientY > rect.bottom
        ) return;

        const now = performance.now();
        if (now - lastSpawn < 72) return;
        lastSpawn = now;

        // Map screen coords → approximate world coords
        const nx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        const ny = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        const wx = nx * 14;
        const wy = ny * 9;

        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const size = 0.35 + Math.random() * 1.15;
          const b = makeBox(
            wx + (Math.random() - 0.5) * 2.8,
            wy + (Math.random() - 0.5) * 2.8,
            (Math.random() - 0.5) * 4,
            size,
            Math.random() > 0.3 ? 0x00ffff : 0xffffff,
            0.95,
          );
          b.userData = {
            born: now,
            life: 1800 + Math.random() * 1200,
            drift: new THREE.Vector3(
              (Math.random() - 0.5) * 0.038,
              (Math.random() - 0.5) * 0.038,
              (Math.random() - 0.5) * 0.02,
            ),
            rot: {
              x: (Math.random() - 0.5) * 0.025,
              y: (Math.random() - 0.5) * 0.025,
              z: (Math.random() - 0.5) * 0.014,
            },
          };
          scene.add(b);
          spawnedBoxes.push(b);
        }
      };

      window.addEventListener('mousemove', onMouseMove);

      /* ── Animation loop ── */
      const tick = () => {
        animId = requestAnimationFrame(tick);
        const now = performance.now();

        // Rotate base boxes
        baseBoxes.forEach((b) => {
          b.rotation.x += b.userData.rot.x;
          b.rotation.y += b.userData.rot.y;
          b.rotation.z += b.userData.rot.z;
        });

        // Update spawned boxes: fade + drift
        for (let i = spawnedBoxes.length - 1; i >= 0; i--) {
          const b = spawnedBoxes[i];
          const t = (now - b.userData.born) / b.userData.life;
          if (t >= 1) {
            scene.remove(b);
            b.geometry.dispose();
            b.material.dispose();
            spawnedBoxes.splice(i, 1);
          } else {
            b.material.opacity = 0.95 * (1 - t * t);
            b.position.add(b.userData.drift);
            b.rotation.x += b.userData.rot.x;
            b.rotation.y += b.userData.rot.y;
            b.rotation.z += b.userData.rot.z;
          }
        }

        renderer.render(scene, camera);
      };

      tick();

      /* ── Resize ── */
      const onResize = () => {
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        baseBoxes.forEach((b) => { b.geometry.dispose(); b.material.dispose(); });
        spawnedBoxes.forEach((b) => { b.geometry.dispose(); b.material.dispose(); });
        renderer.dispose();
        canvas.remove();
      };
    });

    return () => {
      mounted = false;
      cleanupFn();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        // High z-index so it's clearly visible during dev.
        // Move to z-index 1 (below text at z-10) when you're ready.
        zIndex: 50,
        pointerEvents: 'none',
      }}
    />
  );
}
