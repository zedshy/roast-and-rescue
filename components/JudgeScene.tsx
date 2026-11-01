"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { JudgeCharacter } from "./JudgeCharacter";

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

function JudgeBench({ compact }: { compact: boolean }) {
  return (
    <group position={[0, -1.45, -0.1]}>
      <RoundedBox args={[compact ? 6.15 : 7.1, 0.54, 0.75]} radius={0.16}>
        <meshStandardMaterial color="#050505" roughness={0.55} />
      </RoundedBox>
      {(compact ? [-1.85, 0, 1.85] : [-2.25, 0, 2.25]).map((x, index) => (
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

function JudgeLineup() {
  const { size } = useThree();
  const compact = size.width < 600;
  const positions = compact ? [-1.85, 0, 1.85] : [-2.3, 0, 2.3];
  const scales = compact ? [0.61, 0.66, 0.61] : [0.72, 0.78, 0.72];

  return (
    <>
      <Float speed={1.25} floatIntensity={0.18} rotationIntensity={0.03}>
        <JudgeCharacter kind="visitor" position={[positions[0], 0.02, 0.25]} scale={scales[0]} />
      </Float>
      <Float speed={1.55} floatIntensity={0.24} rotationIntensity={0.04}>
        <JudgeCharacter kind="gremlin" position={[positions[1], 0.12, 0.45]} scale={scales[1]} />
      </Float>
      <Float speed={1.1} floatIntensity={0.16} rotationIntensity={0.03}>
        <JudgeCharacter kind="detective" position={[positions[2], 0.02, 0.25]} scale={scales[2]} />
      </Float>
      <JudgeBench compact={compact} />
    </>
  );
}

export function JudgeScene() {
  return (
    <div className="judge-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7.5], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.15} />
        <directionalLight position={[4, 6, 6]} intensity={4.3} color="#ffffff" />
        <directionalLight position={[-4, -1, 4]} intensity={2.1} color="#dceeff" />

        <JudgeLineup />
        <Gavel />
        <MagnifyingGlass />
      </Canvas>
      <div className="judge-nameplates">
        <span>The Visitor</span>
        <span>Copy Gremlin</span>
        <span>Click Detective</span>
      </div>
      <div className="judge-scene-fallback">
        <span>😴</span><span>🤓</span><span>🕵🏽</span>
      </div>
    </div>
  );
}
