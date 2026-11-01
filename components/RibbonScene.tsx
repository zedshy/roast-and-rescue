"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoastMascot } from "./RoastMascot";

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

function HeroProps() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = clock.elapsedTime * 0.08;
  });

  return (
    <group ref={group}>
      <mesh position={[-4.25, 1.75, 0.6]} rotation={[0.3, 0.4, 0.2]}>
        <torusGeometry args={[0.38, 0.15, 16, 36]} />
        <meshPhysicalMaterial color="#ffd731" roughness={0.28} clearcoat={0.6} />
      </mesh>
      <mesh position={[4.4, 1.45, 0]} rotation={[0.4, 0.2, 0.3]}>
        <octahedronGeometry args={[0.46, 0]} />
        <meshPhysicalMaterial color="#e9ccff" roughness={0.34} />
      </mesh>
      <mesh position={[-4.3, -1.65, 0.2]} rotation={[0.6, 0.3, 0.2]}>
        <torusKnotGeometry args={[0.27, 0.1, 64, 10]} />
        <meshPhysicalMaterial color="#5c4ade" roughness={0.3} clearcoat={0.45} />
      </mesh>
    </group>
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
        <Float speed={1.45} rotationIntensity={0.08} floatIntensity={0.35}>
          <RoastMascot
            position={[2.7, -1.55, 1.5]}
            rotation={[0, -0.3, 0.08]}
            scale={0.5}
          />
        </Float>
        <HeroProps />
      </Canvas>
      <div className="ribbon-fallback" />
    </div>
  );
}
