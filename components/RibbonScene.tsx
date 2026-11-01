"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Ribbon() {
  const group = useRef<THREE.Group>(null);
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.2, -1.1, 0),
        new THREE.Vector3(-2.7, 1.4, 0.2),
        new THREE.Vector3(-0.7, 0.2, 0.8),
        new THREE.Vector3(0.7, -1.1, 0.2),
        new THREE.Vector3(2.2, 1.15, -0.1),
        new THREE.Vector3(4.3, 0.45, 0.5),
      ]),
    [],
  );

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.16,
      3,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -pointer.y * 0.08,
      3,
      delta,
    );
  });

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.18}>
      <group ref={group} rotation={[0.1, -0.08, -0.16]}>
        <mesh>
          <tubeGeometry args={[curve, 120, 0.48, 24, false]} />
          <meshPhysicalMaterial
            color="#4da2ff"
            roughness={0.3}
            metalness={0.05}
            clearcoat={0.65}
            clearcoatRoughness={0.35}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function RibbonScene() {
  return (
    <div className="ribbon-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.2], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.4} />
        <directionalLight position={[3, 5, 5]} intensity={4.2} color="#ffffff" />
        <directionalLight position={[-4, -2, 3]} intensity={2.6} color="#e9ccff" />
        <Ribbon />
      </Canvas>
      <div className="ribbon-fallback" />
    </div>
  );
}
