"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";

export type JudgeKind = "visitor" | "gremlin" | "detective";

type JudgeCharacterProps = {
  kind: JudgeKind;
  position?: [number, number, number];
  scale?: number;
};

const LOOKS = {
  visitor: { skin: "#8d573e", outfit: "#fb6b32", hair: "#211916" },
  gremlin: { skin: "#efb38e", outfit: "#7458ed", hair: "#392276" },
  detective: { skin: "#b96f50", outfit: "#61dfa4", hair: "#1d1714" },
} as const;

function Eyes({ kind, pupils }: { kind: JudgeKind; pupils: RefObject<THREE.Group | null> }) {
  const eyeY = kind === "visitor" ? 0.28 : 0.3;
  return (
    <group position={[0, eyeY, 0.59]}>
      {[-0.29, 0.29].map((x) => (
        <mesh key={x} position={[x, 0, 0]} scale={[1, kind === "visitor" ? 0.72 : 1, 0.5]}>
          <sphereGeometry args={[0.19, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.48} />
        </mesh>
      ))}
      <group ref={pupils} position={[0, -0.02, 0.11]}>
        {[-0.29, 0.29].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <sphereGeometry args={[0.075, 18, 18]} />
            <meshStandardMaterial color="#050505" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function VisitorDetails() {
  return (
    <>
      <group position={[0, 0.94, 0.02]} rotation={[0.03, 0, -0.08]}>
        <RoundedBox args={[1.18, 0.4, 0.96]} radius={0.18}>
          <meshStandardMaterial color="#ffd731" roughness={0.42} />
        </RoundedBox>
        <RoundedBox args={[0.92, 0.09, 0.34]} radius={0.04} position={[0.38, -0.11, 0.46]}>
          <meshStandardMaterial color="#050505" roughness={0.4} />
        </RoundedBox>
      </group>
      <RoundedBox args={[0.72, 0.08, 0.08]} radius={0.04} position={[0, -0.25, 0.61]}>
        <meshStandardMaterial color="#211916" />
      </RoundedBox>
      <RoundedBox args={[1.15, 0.12, 0.12]} radius={0.05} position={[0, -0.78, 0.46]}>
        <meshStandardMaterial color="#ffd731" />
      </RoundedBox>
    </>
  );
}

function CopyEditorDetails() {
  return (
    <>
      <mesh position={[0, 0.87, -0.02]} scale={[0.78, 0.43, 0.7]}>
        <sphereGeometry args={[0.82, 30, 24]} />
        <meshStandardMaterial color="#392276" roughness={0.42} />
      </mesh>
      <RoundedBox args={[0.34, 1.1, 0.48]} radius={0.15} position={[-0.65, 0.25, 0]} rotation={[0, 0, 0.1]}>
        <meshStandardMaterial color="#392276" roughness={0.42} />
      </RoundedBox>
      <RoundedBox args={[0.34, 1.1, 0.48]} radius={0.15} position={[0.65, 0.25, 0]} rotation={[0, 0, -0.1]}>
        <meshStandardMaterial color="#392276" roughness={0.42} />
      </RoundedBox>
      <group position={[0, 0.3, 0.73]}>
        <mesh position={[-0.29, 0, 0]}><torusGeometry args={[0.235, 0.043, 12, 32]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[0.29, 0, 0]}><torusGeometry args={[0.235, 0.043, 12, 32]} /><meshStandardMaterial color="#050505" /></mesh>
        <RoundedBox args={[0.13, 0.04, 0.04]} radius={0.02}><meshStandardMaterial color="#050505" /></RoundedBox>
      </group>
      <mesh position={[0, -0.23, 0.64]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.19, 0.045, 10, 28, Math.PI]} />
        <meshStandardMaterial color="#6d2c35" />
      </mesh>
      <group position={[0.78, 0.45, 0.05]} rotation={[0, 0, -0.28]}>
        <RoundedBox args={[0.1, 1.0, 0.1]} radius={0.03}>
          <meshStandardMaterial color="#ffd731" />
        </RoundedBox>
        <mesh position={[0, 0.55, 0]}><coneGeometry args={[0.07, 0.22, 12]} /><meshStandardMaterial color="#ead2b9" /></mesh>
      </group>
    </>
  );
}

function DetectiveDetails() {
  return (
    <>
      <mesh position={[0, 0.84, -0.06]} scale={[0.78, 0.34, 0.68]}>
        <sphereGeometry args={[0.76, 28, 22]} />
        <meshStandardMaterial color="#1d1714" roughness={0.48} />
      </mesh>
      <group position={[0, 1.02, 0]} rotation={[0, 0, 0.04]}>
        <RoundedBox args={[1.72, 0.1, 0.9]} radius={0.04}>
          <meshStandardMaterial color="#17211d" roughness={0.48} />
        </RoundedBox>
        <RoundedBox args={[1.02, 0.42, 0.75]} radius={0.14} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#25372f" roughness={0.44} />
        </RoundedBox>
        <RoundedBox args={[1.08, 0.075, 0.78]} radius={0.03} position={[0, 0.12, 0.03]}>
          <meshStandardMaterial color="#ffd731" />
        </RoundedBox>
      </group>
      <group position={[0.29, 0.3, 0.74]}>
        <mesh><torusGeometry args={[0.25, 0.045, 12, 32]} /><meshStandardMaterial color="#050505" /></mesh>
        <mesh position={[0.2, -0.26, 0]} rotation={[0, 0, -0.72]}>
          <capsuleGeometry args={[0.03, 0.35, 5, 10]} /><meshStandardMaterial color="#050505" />
        </mesh>
      </group>
      <mesh position={[0, -0.18, 0.65]} scale={[1.4, 0.55, 0.6]}>
        <sphereGeometry args={[0.14, 22, 18]} />
        <meshStandardMaterial color="#1d1714" />
      </mesh>
      <RoundedBox args={[0.62, 0.07, 0.07]} radius={0.03} position={[0, -0.34, 0.63]}>
        <meshStandardMaterial color="#542d28" />
      </RoundedBox>
    </>
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
      group.current.rotation.z = Math.sin(clock.elapsedTime * 1.15 + phase) * 0.025;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.current.x * 0.08, 3, delta);
    }
    if (pupils.current) {
      pupils.current.position.x = pointer.current.x * 0.045;
      pupils.current.position.y = pointer.current.y * 0.025;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <RoundedBox args={[1.78, 1.05, 0.82]} radius={0.34} position={[0, -1.08, -0.06]}>
        <meshPhysicalMaterial color={look.outfit} roughness={0.36} clearcoat={0.28} />
      </RoundedBox>
      <mesh position={[-0.72, -1.03, 0]} rotation={[0, 0, 0.18]}><capsuleGeometry args={[0.16, 0.62, 6, 12]} /><meshStandardMaterial color={look.outfit} /></mesh>
      <mesh position={[0.72, -1.03, 0]} rotation={[0, 0, -0.18]}><capsuleGeometry args={[0.16, 0.62, 6, 12]} /><meshStandardMaterial color={look.outfit} /></mesh>
      <RoundedBox args={[0.38, 0.36, 0.38]} radius={0.12} position={[0, -0.55, 0]}>
        <meshStandardMaterial color={look.skin} roughness={0.5} />
      </RoundedBox>

      <RoundedBox args={[1.38, 1.55, 1.04]} radius={0.48} position={[0, 0.22, 0]}>
        <meshPhysicalMaterial color={look.skin} roughness={0.42} clearcoat={0.16} />
      </RoundedBox>
      <mesh position={[-0.73, 0.2, 0]} scale={[0.65, 1, 0.72]}><sphereGeometry args={[0.18, 20, 20]} /><meshStandardMaterial color={look.skin} /></mesh>
      <mesh position={[0.73, 0.2, 0]} scale={[0.65, 1, 0.72]}><sphereGeometry args={[0.18, 20, 20]} /><meshStandardMaterial color={look.skin} /></mesh>
      <mesh position={[0, 0.02, 0.61]} scale={[0.65, 1.05, 0.7]}><sphereGeometry args={[0.16, 20, 20]} /><meshStandardMaterial color={look.skin} roughness={0.48} /></mesh>
      <Eyes kind={kind} pupils={pupils} />

      {kind === "visitor" && <VisitorDetails />}
      {kind === "gremlin" && <CopyEditorDetails />}
      {kind === "detective" && <DetectiveDetails />}
    </group>
  );
}
