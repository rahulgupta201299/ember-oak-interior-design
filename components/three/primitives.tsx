'use client';
import * as THREE from 'three';
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useStore } from '@/lib/store';
import { TIMES, type Vec3 } from '@/lib/tour';
import { kelvinToColor, getMaterials } from '@/lib/materials';

type M = THREE.Material;

export function B({ a, p, r, m, cast = true }: { a: Vec3; p?: Vec3; r?: Vec3; m: M; cast?: boolean }) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={cast} receiveShadow>
      <boxGeometry args={a} />
    </mesh>
  );
}

export function Cyl({
  rt,
  rb,
  h,
  p,
  r,
  m,
  seg = 32,
  open = false,
  cast = true,
}: {
  rt: number;
  rb?: number;
  h: number;
  p?: Vec3;
  r?: Vec3;
  m: M;
  seg?: number;
  open?: boolean;
  cast?: boolean;
}) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={cast} receiveShadow>
      <cylinderGeometry args={[rt, rb ?? rt, h, seg, 1, open]} />
    </mesh>
  );
}

export function RB({ a, p, r, m, radius = 0.05 }: { a: Vec3; p?: Vec3; r?: Vec3; m: M; radius?: number }) {
  return <RoundedBox args={a} radius={radius} smoothness={4} position={p} rotation={r} material={m} castShadow receiveShadow />;
}

/** A warm point light whose colour follows the global kelvin + dimmer controls. */
export function LampLight({ p, power = 3, distance = 6, shadow = false }: { p: Vec3; power?: number; distance?: number; shadow?: boolean }) {
  const kelvin = useStore((s) => s.kelvin);
  const dimmer = useStore((s) => s.dimmer);
  const time = useStore((s) => s.time);
  const color = useMemo(() => kelvinToColor(kelvin), [kelvin]);
  return (
    <pointLight
      position={p}
      color={color}
      intensity={power * dimmer * TIMES[time].lamps}
      distance={distance}
      decay={2}
      castShadow={shadow}
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.002}
    />
  );
}

/** A potted plant built from faceted leaf clusters. */
export function Plant({ p, scale = 1, seed = 1 }: { p: Vec3; scale?: number; seed?: number }) {
  const M = getMaterials();
  const leaves = useMemo(() => {
    let s = seed * 9301;
    const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 14 }, (_, i) => {
      const a = rand() * Math.PI * 2;
      const h = 0.75 + rand() * 0.9;
      const rad = 0.08 + rand() * 0.26;
      return {
        pos: [Math.cos(a) * rad, h, Math.sin(a) * rad] as Vec3,
        scale: [0.2 + rand() * 0.12, 0.12 + rand() * 0.08, 0.26 + rand() * 0.12] as Vec3,
        rot: [rand() * 0.8, a, rand() * 0.8] as Vec3,
        dark: i % 3 === 0,
      };
    });
  }, [seed]);
  return (
    <group position={p} scale={scale}>
      <Cyl rt={0.21} rb={0.16} h={0.46} p={[0, 0.23, 0]} m={M.ceramic} />
      <Cyl rt={0.19} h={0.02} p={[0, 0.45, 0]} m={M.woodDark} cast={false} />
      <Cyl rt={0.012} h={1.1} p={[0, 0.95, 0]} m={M.woodDark} seg={6} />
      {leaves.map((l, i) => (
        <mesh key={i} position={l.pos} rotation={l.rot} scale={l.scale} material={l.dark ? M.leafDark : M.leaf} castShadow>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/** Softly pleated sheer curtain (plane displaced into folds). */
export function Curtain({ p, r, w, h }: { p: Vec3; r?: Vec3; w: number; h: number }) {
  const M = getMaterials();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h, 48, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin((x / w) * Math.PI * 14) * 0.035);
    }
    g.computeVertexNormals();
    return g;
  }, [w, h]);
  return <mesh geometry={geo} position={p} rotation={r} material={M.sheer} castShadow />;
}
