import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BASE_BOX_COUNT = 24;
const MAX_ACTIVE_BOXES = 72;
const MOBILE_MAX_ACTIVE_BOXES = 36;
const POINTER_THRESHOLD = 0.02;
const POINTER_SPAWN_INTERVAL = 48;

function createBaseBoxes() {
  return Array.from({ length: BASE_BOX_COUNT }, (_, index) => {
    const row = index % 8;
    const column = Math.floor(index / 8);

    return {
      id: `base-${index}`,
      position: [row * 0.8 - 2.2, column * 0.86 - 1.25, -1.4 - (index % 4) * 0.25],
      scale: 0.48 + (index % 4) * 0.1,
      opacity: 0.38 + (index % 3) * 0.09,
      drift: [(row - 3.5) * 0.018, (column - 1.1) * 0.016, 0],
      rotation: [index * 0.12, index * 0.18, index * 0.08],
      pulse: 0.2 + (index % 5) * 0.08,
      lifetime: Infinity,
      createdAt: 0,
    };
  });
}

function createPointerCluster(pointer, now) {
  const originX = 0.85 + pointer.x * 2.7;
  const originY = 1.15 + pointer.y * 1.45;
  const count = 6 + Math.round(Math.random() * 3);

  return Array.from({ length: count }, (_, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const spreadX = (column - 1) * 0.62 + (Math.random() - 0.5) * 0.16;
    const spreadY = (row - 0.5) * 0.56 + (Math.random() - 0.5) * 0.18;

    return {
      id: `pointer-${now}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      position: [originX + spreadX, originY + spreadY, -0.4 - Math.random() * 0.8],
      scale: 0.5 + Math.random() * 0.42,
      opacity: 0.68 + Math.random() * 0.22,
      drift: [
        spreadX * 0.04 + (Math.random() - 0.5) * 0.03,
        spreadY * 0.05 + (Math.random() - 0.5) * 0.03,
        -0.01 - Math.random() * 0.016,
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
      pulse: 0.8 + Math.random() * 0.45,
      lifetime: 2600 + Math.random() * 1400,
      createdAt: now,
    };
  });
}

function BoxField({ coarsePointer }) {
  const groupRef = useRef(null);
  const previousPointerRef = useRef(new THREE.Vector2(0, 0));
  const currentPointerRef = useRef(new THREE.Vector2(0, 0));
  const lastSpawnRef = useRef(0);
  const baseBoxes = useMemo(() => createBaseBoxes(), []);
  const [boxes, setBoxes] = useState(baseBoxes);
  const activeLimit = coarsePointer ? MOBILE_MAX_ACTIVE_BOXES : MAX_ACTIVE_BOXES;

  useEffect(() => {
    setBoxes(baseBoxes);
  }, [baseBoxes]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePointerMove = (event) => {
      const nextX = (event.clientX / window.innerWidth) * 2 - 1;
      const nextY = -((event.clientY / window.innerHeight) * 2 - 1);
      currentPointerRef.current.set(nextX, nextY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    const pointer = currentPointerRef.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.08, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.06, 0.05);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0.7 + pointer.x * 0.18, 0.045);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 1.1 + pointer.y * 0.1, 0.04);
    }

    const now = state.clock.elapsedTime * 1000;
    const pointerDelta = pointer.distanceTo(previousPointerRef.current);

    if (!coarsePointer && pointerDelta > POINTER_THRESHOLD && now - lastSpawnRef.current > POINTER_SPAWN_INTERVAL) {
      const pointerCluster = createPointerCluster(pointer, now);
      lastSpawnRef.current = now;
      previousPointerRef.current.copy(pointer);

      setBoxes((currentBoxes) => {
        const ephemeralBoxes = currentBoxes.filter((box) => box.lifetime !== Infinity);
        const base = currentBoxes.filter((box) => box.lifetime === Infinity);
        const merged = [...ephemeralBoxes, ...pointerCluster].slice(-activeLimit);
        return [...base, ...merged];
      });
    } else if (pointerDelta > 0.01) {
      previousPointerRef.current.lerp(pointer, 0.35);
    }

    setBoxes((currentBoxes) => {
      let changed = false;
      const nextBoxes = [];

      for (const box of currentBoxes) {
        if (box.lifetime === Infinity) {
          nextBoxes.push(box);
          continue;
        }

        const age = now - box.createdAt;
        if (age >= box.lifetime) {
          changed = true;
          continue;
        }

        nextBoxes.push(box);
      }

      return changed ? nextBoxes : currentBoxes;
    });
  });

  return (
    <group ref={groupRef} position={[0.7, 1.1, 0]}>
      {boxes.map((box) => (
        <BoxInstance key={box.id} box={box} />
      ))}
    </group>
  );
}

function BoxInstance({ box }) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (!meshRef.current) {
      return;
    }

    const age = box.lifetime === Infinity ? 0 : state.clock.elapsedTime * 1000 - box.createdAt;
    const lifeProgress = box.lifetime === Infinity ? 0 : Math.min(age / box.lifetime, 1);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * (1.4 + box.pulse)) * 0.05;

    meshRef.current.position.x += box.drift[0] * delta;
    meshRef.current.position.y += box.drift[1] * delta;
    meshRef.current.position.z += box.drift[2] * delta;
    meshRef.current.rotation.x += delta * (0.18 + box.pulse * 0.1);
    meshRef.current.rotation.y += delta * (0.24 + box.pulse * 0.12);
    meshRef.current.rotation.z += delta * 0.08;
    meshRef.current.scale.setScalar(box.scale * pulse * (1 - lifeProgress * 0.12));
    meshRef.current.material.opacity = box.opacity * (1 - lifeProgress);
  });

  return (
    <mesh
      ref={meshRef}
      position={box.position}
      rotation={box.rotation}
      scale={box.scale}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={box.lifetime === Infinity ? '#7f8e36' : '#e0ff57'}
        wireframe
        transparent
        opacity={box.opacity}
        toneMapped={false}
      />
    </mesh>
  );
}

export default function ThreeBackground() {
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updatePointerType = () => setCoarsePointer(mediaQuery.matches);

    updatePointerType();
    mediaQuery.addEventListener('change', updatePointerType);

    return () => mediaQuery.removeEventListener('change', updatePointerType);
  }, []);

  return (
    <div className="hero-background" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6.2], fov: 38 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.92} />
        <directionalLight position={[4, 3, 4]} intensity={0.75} color="#ffffff" />
        <pointLight position={[1.8, 2.2, 1.2]} intensity={1.45} color="#d5ff3f" />
        <BoxField coarsePointer={coarsePointer} />
      </Canvas>
    </div>
  );
}
