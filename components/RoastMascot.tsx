"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type MascotProps = {
  color?: string;
  mood?: "suspicious" | "delighted";
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export function RoastMascot({
  color = "#fb4903",
  mood = "suspicious",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: MascotProps) {
  const group = useRef<THREE.Group>(null);
  const pupils = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        rotation[1] + pointer.x * 0.16,
        3,
        delta,
      );
      group.current.rotation.z = rotation[2] + Math.sin(clock.elapsedTime * 1.35) * 0.025;
    }
    if (pupils.current) {
      pupils.current.position.x = pointer.x * 0.06;
      pupils.current.position.y = pointer.y * 0.04;
    }
  });

  const eyebrowTilt = mood === "suspicious" ? 0.22 : -0.08;

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <mesh scale={[1.05, 0.96, 1]}>
        <sphereGeometry args={[1.08, 48, 48]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.26}
          clearcoat={0.7}
          clearcoatRoughness={0.28}
        />
      </mesh>

      <group position={[0, 0.2, 0.91]}>
        <mesh position={[-0.35, 0, 0]} scale={[1, 1.12, 0.6]}>
          <sphereGeometry args={[0.31, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} />
        </mesh>
        <mesh position={[0.35, 0, 0]} scale={[1, 1.12, 0.6]}>
          <sphereGeometry args={[0.31, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.45} />
        </mesh>
        <group ref={pupils} position={[0, -0.02, 0.2]}>
          <mesh position={[-0.35, 0, 0]}>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
          <mesh position={[0.35, 0, 0]}>
            <sphereGeometry args={[0.115, 20, 20]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
        </group>
      </group>

      <RoundedBox
        args={[0.48, 0.1, 0.1]}
        radius={0.05}
        position={[-0.35, 0.62, 1.02]}
        rotation={[0, 0, eyebrowTilt]}
      >
        <meshStandardMaterial color="#050505" />
      </RoundedBox>
      <RoundedBox
        args={[0.48, 0.1, 0.1]}
        radius={0.05}
        position={[0.35, 0.62, 1.02]}
        rotation={[0, 0, -eyebrowTilt]}
      >
        <meshStandardMaterial color="#050505" />
      </RoundedBox>

      {mood === "suspicious" ? (
        <RoundedBox args={[0.48, 0.1, 0.1]} radius={0.05} position={[0, -0.42, 1.03]}>
          <meshStandardMaterial color="#050505" />
        </RoundedBox>
      ) : (
        <mesh position={[0, -0.37, 1.02]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.34, 0.07, 12, 40, Math.PI]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
      )}

      <mesh position={[-1.02, -0.2, 0]} rotation={[0, 0, -0.8]}>
        <capsuleGeometry args={[0.11, 0.65, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[1.02, -0.2, 0]} rotation={[0, 0, 0.8]}>
        <capsuleGeometry args={[0.11, 0.65, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}
