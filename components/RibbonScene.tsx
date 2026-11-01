"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { RoastMascot } from "./RoastMascot";

function Orbit() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ pointer }, delta) => {
    if (!group.current) return;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 1.08 - pointer.y * 0.08, 3, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.42 + pointer.x * 0.1, 3, delta);
  });

  return (
    <group ref={group} position={[0.25, 0.05, -1]} rotation={[1.08, 0.12, -0.42]}>
      <mesh scale={[1.22, 1, 1]}>
        <torusGeometry args={[2.05, 0.22, 24, 96]} />
        <meshPhysicalMaterial color="#4da2ff" roughness={0.27} clearcoat={0.7} clearcoatRoughness={0.25} />
      </mesh>
    </group>
  );
}

function Gavel() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = -0.48 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
  });

  return (
    <group ref={group} position={[2.12, -1.1, 1.2]} rotation={[0.12, 0.15, -0.48]}>
      <mesh position={[0, -0.48, 0]}>
        <capsuleGeometry args={[0.09, 0.9, 6, 14]} />
        <meshStandardMaterial color="#050505" roughness={0.35} />
      </mesh>
      <RoundedBox args={[0.95, 0.38, 0.42]} radius={0.1} position={[0, 0.08, 0]}>
        <meshPhysicalMaterial color="#ffd731" roughness={0.25} clearcoat={0.5} />
      </RoundedBox>
    </group>
  );
}

function VerdictCards() {
  return (
    <group>
      <Float speed={1.1} floatIntensity={0.22} rotationIntensity={0.04}>
        <RoundedBox args={[1.4, 0.82, 0.12]} radius={0.15} position={[-2.05, 1.35, 0.2]} rotation={[0.05, 0.2, -0.15]}>
          <meshPhysicalMaterial color="#e9ccff" roughness={0.3} />
        </RoundedBox>
        <mesh position={[-2.22, 1.46, 0.3]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#5c4ade" />
        </mesh>
        <mesh position={[-1.82, 1.46, 0.3]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial color="#5c4ade" />
        </mesh>
        <RoundedBox args={[0.56, 0.07, 0.07]} radius={0.03} position={[-2.02, 1.18, 0.3]}>
          <meshStandardMaterial color="#050505" />
        </RoundedBox>
      </Float>
      <Float speed={1.3} floatIntensity={0.18} rotationIntensity={0.05}>
        <mesh position={[2.45, 1.38, 0.15]} rotation={[0.2, 0.1, 0.2]}>
          <torusGeometry args={[0.38, 0.14, 18, 48]} />
          <meshPhysicalMaterial color="#55db9c" roughness={0.28} clearcoat={0.55} />
        </mesh>
      </Float>
    </group>
  );
}

function Stage() {
  return (
    <>
      <Orbit />
      <VerdictCards />
      <Float speed={1.25} rotationIntensity={0.04} floatIntensity={0.22}>
        <RoastMascot position={[0.22, -0.08, 0.72]} rotation={[0, -0.12, 0]} scale={0.93} />
      </Float>
      <RoundedBox args={[3.65, 0.34, 0.78]} radius={0.15} position={[0.28, -1.55, 0.08]}>
        <meshStandardMaterial color="#050505" roughness={0.48} />
      </RoundedBox>
      <Gavel />
    </>
  );
}

export function RibbonScene() {
  return (
    <div className="ribbon-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.4], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[4, 6, 6]} intensity={4.4} color="#ffffff" />
        <directionalLight position={[-3, -2, 4]} intensity={2.2} color="#dceeff" />
        <Stage />
      </Canvas>
      <div className="ribbon-fallback"><span>ಠ_ಠ</span></div>
    </div>
  );
}
