"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type JudgeKind = "visitor" | "gremlin" | "detective";

type JudgeCharacterProps = {
  kind: JudgeKind;
  position?: [number, number, number];
  scale?: number;
};

const LOOKS = {
  visitor: { color: "#fb6b32", eyeY: 0.18 },
  gremlin: { color: "#7458ed", eyeY: 0.2 },
  detective: { color: "#61dfa4", eyeY: 0.16 },
} as const;

function BaseballCap() {
  return (
    <group position={[0, 0.86, 0.06]} rotation={[0.05, 0, -0.08]}>
      <mesh scale={[1.05, 0.43, 0.88]}>
        <sphereGeometry args={[0.72, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ffd731" roughness={0.42} />
      </mesh>
      <RoundedBox args={[0.92, 0.1, 0.38]} radius={0.05} position={[0.48, -0.04, 0.5]}>
        <meshStandardMaterial color="#050505" roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

function GremlinDetails() {
  return (
    <group>
      <mesh position={[-0.68, 0.78, 0]} rotation={[0, 0, -0.45]}>
        <coneGeometry args={[0.25, 0.72, 20]} />
        <meshStandardMaterial color="#ffd731" roughness={0.4} />
      </mesh>
      <mesh position={[0.68, 0.78, 0]} rotation={[0, 0, 0.45]}>
        <coneGeometry args={[0.25, 0.72, 20]} />
        <meshStandardMaterial color="#ffd731" roughness={0.4} />
      </mesh>
      <group position={[0, 0.2, 1.02]}>
        <mesh position={[-0.34, 0, 0]}><torusGeometry args={[0.3, 0.055, 12, 36]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[0.34, 0, 0]}><torusGeometry args={[0.3, 0.055, 12, 36]} /><meshStandardMaterial color="#050505" /></mesh>
        <RoundedBox args={[0.18, 0.05, 0.05]} radius={0.02}><meshStandardMaterial color="#050505" /></RoundedBox>
      </group>
      <mesh position={[-0.13, -0.45, 1.05]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.1, 0.24, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.13, -0.45, 1.05]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.1, 0.24, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function DetectiveHat() {
  return (
    <group position={[0, 0.92, 0.02]} rotation={[0, 0, 0.05]}>
      <RoundedBox args={[1.78, 0.12, 0.98]} radius={0.05}>
        <meshStandardMaterial color="#17211d" roughness={0.48} />
      </RoundedBox>
      <RoundedBox args={[1.08, 0.46, 0.82]} radius={0.16} position={[0, 0.22, 0]}>
        <meshStandardMaterial color="#25372f" roughness={0.44} />
      </RoundedBox>
      <RoundedBox args={[1.12, 0.09, 0.85]} radius={0.03} position={[0, 0.14, 0.03]}>
        <meshStandardMaterial color="#ffd731" roughness={0.38} />
      </RoundedBox>
    </group>
  );
}

export function JudgeCharacter({ kind, position = [0, 0, 0], scale = 1 }: JudgeCharacterProps) {
  const group = useRef<THREE.Group>(null);
  const pupils = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const look = LOOKS[kind];

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame(({ clock }, delta) => {
    if (group.current) {
      const phase = kind === "visitor" ? 0 : kind === "gremlin" ? 1.8 : 3.4;
      group.current.rotation.z = Math.sin(clock.elapsedTime * 1.2 + phase) * 0.035;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.12, 3, delta);
    }
    if (pupils.current) {
      pupils.current.position.x = pointer.current.x * 0.055;
      pupils.current.position.y = pointer.current.y * 0.035;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh scale={kind === "visitor" ? [1.12, 0.92, 1] : kind === "detective" ? [0.96, 1.06, 1] : [1, 1, 1]}>
        <sphereGeometry args={[1.02, 40, 40]} />
        <meshPhysicalMaterial color={look.color} roughness={0.27} clearcoat={0.65} clearcoatRoughness={0.3} />
      </mesh>

      <group position={[0, look.eyeY, 0.88]}>
        <mesh position={[-0.34, 0, 0]} scale={[1, kind === "visitor" ? 0.82 : 1.1, 0.6]}>
          <sphereGeometry args={[0.3, 28, 28]} /><meshStandardMaterial color="#ffffff" roughness={0.45} />
        </mesh>
        <mesh position={[0.34, 0, 0]} scale={[1, kind === "visitor" ? 0.82 : 1.1, 0.6]}>
          <sphereGeometry args={[0.3, 28, 28]} /><meshStandardMaterial color="#ffffff" roughness={0.45} />
        </mesh>
        <group ref={pupils} position={[0, -0.03, 0.2]}>
          <mesh position={[-0.34, 0, 0]}><sphereGeometry args={[0.115, 18, 18]} /><meshStandardMaterial color="#050505" /></mesh>
          <mesh position={[0.34, 0, 0]}><sphereGeometry args={[0.115, 18, 18]} /><meshStandardMaterial color="#050505" /></mesh>
        </group>
      </group>

      {kind === "visitor" && <BaseballCap />}
      {kind === "gremlin" && <GremlinDetails />}
      {kind === "detective" && <DetectiveHat />}

      {kind !== "gremlin" && (
        <RoundedBox args={[kind === "visitor" ? 0.52 : 0.44, 0.1, 0.1]} radius={0.05} position={[0, -0.42, 0.99]}>
          <meshStandardMaterial color="#050505" />
        </RoundedBox>
      )}

      {kind === "detective" && (
        <group position={[0.34, look.eyeY, 1.08]}>
          <mesh><torusGeometry args={[0.34, 0.055, 12, 36]} /><meshStandardMaterial color="#050505" /></mesh>
          <mesh position={[0.28, -0.3, 0]} rotation={[0, 0, -0.72]}>
            <capsuleGeometry args={[0.035, 0.42, 5, 10]} /><meshStandardMaterial color="#050505" />
          </mesh>
        </group>
      )}
    </group>
  );
}
