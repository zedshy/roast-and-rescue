"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { RoastMascot } from "./RoastMascot";

function OrbitingProps({ rescue }: { rescue: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.z += delta * (rescue ? 0.22 : 0.55);
  });

  return (
    <group ref={group}>
      <mesh position={[-2, 1.1, -0.2]} rotation={[0.4, 0.5, 0.2]}>
        <torusGeometry args={[0.48, 0.17, 16, 42]} />
        <meshPhysicalMaterial color="#ffd731" roughness={0.3} clearcoat={0.5} />
      </mesh>
      <mesh position={[2.15, 0.65, 0]} rotation={[0.3, 0.1, 0.7]}>
        <octahedronGeometry args={[0.48, 0]} />
        <meshPhysicalMaterial color={rescue ? "#55db9c" : "#e9ccff"} roughness={0.35} />
      </mesh>
      <mesh position={[1.7, -1.35, -0.4]} rotation={[0.8, 0.4, 0.3]}>
        <torusKnotGeometry args={[0.34, 0.11, 72, 12]} />
        <meshPhysicalMaterial color="#5c4ade" roughness={0.26} clearcoat={0.55} />
      </mesh>
      <mesh position={[-1.8, -1.25, -0.5]} rotation={[0.3, 0.6, 0.2]}>
        <boxGeometry args={[0.65, 0.65, 0.65]} />
        <meshPhysicalMaterial color="#4da2ff" roughness={0.3} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

export function MascotScene({ mode = "loading" }: { mode?: "loading" | "rescue" }) {
  const rescue = mode === "rescue";
  return (
    <div className={`mascot-scene mascot-${mode}`} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6.5], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[4, 5, 6]} intensity={4} color="#ffffff" />
        <directionalLight position={[-4, -2, 3]} intensity={2.2} color="#dceeff" />
        <Float speed={rescue ? 1.2 : 2.1} floatIntensity={rescue ? 0.25 : 0.55} rotationIntensity={0.1}>
          <RoastMascot color={rescue ? "#55db9c" : "#fb4903"} mood={rescue ? "delighted" : "suspicious"} />
        </Float>
        <OrbitingProps rescue={rescue} />
      </Canvas>
      <div className="mascot-static">{rescue ? ":D" : "ಠ_ಠ"}</div>
    </div>
  );
}
