"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { RoastMascot } from "./RoastMascot";

function Gavel() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = -0.42 + Math.sin(clock.elapsedTime * 1.8) * 0.1;
  });
  return (
    <group ref={group} position={[0.55, -0.95, 1.2]} rotation={[0.1, 0, -0.42]}>
      <mesh position={[0, -0.45, 0]}>
        <capsuleGeometry args={[0.08, 0.85, 6, 12]} />
        <meshPhysicalMaterial color="#050505" roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.85, 0.34, 0.34]} radius={0.1} position={[0, 0.08, 0]}>
        <meshPhysicalMaterial color="#ffd731" roughness={0.25} clearcoat={0.5} />
      </RoundedBox>
    </group>
  );
}

function MagnifyingGlass() {
  return (
    <group position={[2.85, -0.7, 1.1]} rotation={[0.2, -0.1, -0.5]}>
      <mesh>
        <torusGeometry args={[0.36, 0.09, 14, 36]} />
        <meshPhysicalMaterial color="#050505" roughness={0.25} />
      </mesh>
      <mesh position={[0.42, -0.42, 0]} rotation={[0, 0, -0.78]}>
        <capsuleGeometry args={[0.07, 0.65, 6, 12]} />
        <meshPhysicalMaterial color="#050505" roughness={0.25} />
      </mesh>
    </group>
  );
}

function JudgeBench() {
  return (
    <group position={[0, -1.45, -0.1]}>
      <RoundedBox args={[7.1, 0.54, 0.75]} radius={0.16}>
        <meshStandardMaterial color="#050505" roughness={0.55} />
      </RoundedBox>
      {[-2.25, 0, 2.25].map((x, index) => (
        <mesh key={x} position={[x, 0.31, 0.42]}>
          <cylinderGeometry args={[0.28, 0.28, 0.09, 32]} />
          <meshPhysicalMaterial
            color={["#fb4903", "#5c4ade", "#55db9c"][index]}
            roughness={0.3}
            clearcoat={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

export function JudgeScene() {
  return (
    <div className="judge-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.15} />
        <directionalLight position={[4, 6, 6]} intensity={4.3} color="#ffffff" />
        <directionalLight position={[-4, -1, 4]} intensity={2.1} color="#dceeff" />

        <Float speed={1.3} floatIntensity={0.22} rotationIntensity={0.06}>
          <RoastMascot color="#fb4903" mood="suspicious" position={[-2.3, 0, 0.2]} scale={0.73} />
        </Float>
        <Float speed={1.6} floatIntensity={0.28} rotationIntensity={0.08}>
          <RoastMascot color="#5c4ade" mood="suspicious" position={[0, 0.18, 0.45]} scale={0.78} />
        </Float>
        <Float speed={1.15} floatIntensity={0.2} rotationIntensity={0.06}>
          <RoastMascot color="#55db9c" mood="delighted" position={[2.3, 0, 0.2]} scale={0.73} />
        </Float>

        <JudgeBench />
        <Gavel />
        <MagnifyingGlass />
      </Canvas>
      <div className="judge-scene-fallback">
        <span>ಠ_ಠ</span><span>¬‿¬</span><span>◉‿◉</span>
      </div>
    </div>
  );
}
