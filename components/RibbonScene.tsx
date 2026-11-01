"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoastMascot } from "./RoastMascot";

const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
};

function VoxelWord({ word, position }: { word: string; position: [number, number, number] }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cell = 0.145;
  const letterStep = cell * 6.15;
  const cubes = useMemo(() => {
    const points: Array<[number, number, number]> = [];
    const totalWidth = (word.length - 1) * letterStep + cell * 5;
    for (let letterIndex = 0; letterIndex < word.length; letterIndex += 1) {
      const glyph = GLYPHS[word[letterIndex]];
      glyph.forEach((row, rowIndex) => {
        row.split("").forEach((pixel, columnIndex) => {
          if (pixel !== "1") return;
          points.push([
            -totalWidth / 2 + letterIndex * letterStep + columnIndex * cell,
            (3 - rowIndex) * cell,
            Math.sin((letterIndex * 7 + rowIndex + columnIndex) * 0.72) * 0.055,
          ]);
        });
      });
    }
    return points;
  }, [letterStep, word]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    const matrix = new THREE.Matrix4();
    cubes.forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      mesh.current?.setMatrixAt(index, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [cubes]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, cubes.length]} position={position}>
      <boxGeometry args={[cell * 1.06, cell * 1.06, cell * 1.35]} />
      <meshPhysicalMaterial color="#050505" roughness={0.25} clearcoat={0.52} />
    </instancedMesh>
  );
}

function VoxelTitle() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.current.x * 0.09,
      3,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -pointer.current.y * 0.035,
      3,
      delta,
    );
    group.current.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.035;
  });

  if (size.width < 901) return null;

  return (
    <group ref={group} position={[-0.38, 0.42, 2]} scale={1.03}>
      <VoxelWord word="ROAST" position={[0, 0.56, 0]} />
      <VoxelWord word="RESCUE" position={[0, -0.56, 0]} />
    </group>
  );
}

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
        <VoxelTitle />
        <Float speed={1.45} rotationIntensity={0.08} floatIntensity={0.35}>
          <RoastMascot
            position={[3.85, -1.65, 1.4]}
            rotation={[0, -0.3, 0.08]}
            scale={0.48}
          />
        </Float>
        <HeroProps />
      </Canvas>
      <div className="ribbon-fallback" />
    </div>
  );
}
