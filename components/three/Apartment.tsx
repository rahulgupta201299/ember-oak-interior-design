'use client';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getMaterials } from '@/lib/materials';
import { skyTexture, groundTexture, worldUV } from '@/lib/textures';
import { useStore } from '@/lib/store';
import { TIMES, type Vec3 } from '@/lib/tour';
import { B } from './primitives';

const H = 2.9;
const T = 0.15;

function WallX({ z, x1, x2, y1 = 0, y2 = H }: { z: number; x1: number; x2: number; y1?: number; y2?: number }) {
  const M = getMaterials();
  const w = x2 - x1;
  return (
    <>
      <B a={[w, y2 - y1, T]} p={[(x1 + x2) / 2, (y1 + y2) / 2, z]} m={M.wall} />
      {y2 >= H && <B a={[w, 0.02, T + 0.004]} p={[(x1 + x2) / 2, H + 0.01, z]} m={M.cap} cast={false} />}
    </>
  );
}

function WallZ({ x, z1, z2, y1 = 0, y2 = H }: { x: number; z1: number; z2: number; y1?: number; y2?: number }) {
  const M = getMaterials();
  const d = z2 - z1;
  return (
    <>
      <B a={[T, y2 - y1, d]} p={[x, (y1 + y2) / 2, (z1 + z2) / 2]} m={M.wall} />
      {y2 >= H && <B a={[T + 0.004, 0.02, d]} p={[x, H + 0.01, (z1 + z2) / 2]} m={M.cap} cast={false} />}
    </>
  );
}

/** Slim black-framed glazing filling an opening. axis 'x' = wall runs along x. */
function Window({ c, w, h, axis }: { c: Vec3; w: number; h: number; axis: 'x' | 'z' }) {
  const M = getMaterials();
  const f = 0.045;
  const panes = Math.max(1, Math.round(w / 1.15));
  const rot: Vec3 = axis === 'x' ? [0, 0, 0] : [0, Math.PI / 2, 0];
  return (
    <group position={c} rotation={rot}>
      <B a={[w, f, 0.09]} p={[0, h / 2 - f / 2, 0]} m={M.frame} />
      <B a={[w, f, 0.09]} p={[0, -h / 2 + f / 2, 0]} m={M.frame} />
      {Array.from({ length: panes + 1 }, (_, i) => (
        <B key={i} a={[f, h, 0.09]} p={[-w / 2 + f / 2 + (i * (w - f)) / panes, 0, 0]} m={M.frame} />
      ))}
      <mesh material={M.glass}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

const PLANES: { p: Vec3; r: Vec3; s: [number, number]; off: [number, number]; rep: [number, number] }[] = [
  { p: [0, 1.42, -5.75], r: [0, 0, 0], s: [14, 2.84], off: [0, 0.1], rep: [1, 0.6] },
  { p: [-7.65, 1.5, 2.9], r: [0, Math.PI / 2, 0], s: [3.6, 2.7], off: [0.55, 0.2], rep: [0.3, 0.55] },
  { p: [7.65, 1.55, 2.7], r: [0, -Math.PI / 2, 0], s: [3.6, 2.5], off: [0.1, 0.22], rep: [0.3, 0.52] },
];

/** Sky backdrops just outside each window; fade out when the camera rises above the walls. */
function Skies() {
  const time = useStore((s) => s.time);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const texs = useMemo(
    () =>
      PLANES.map((pl) => {
        const t = skyTexture(time).clone();
        t.offset.set(...pl.off);
        t.repeat.set(...pl.rep);
        t.needsUpdate = true;
        return t;
      }),
    [time],
  );
  useFrame(({ camera }) => {
    const y = camera.position.y;
    const o = THREE.MathUtils.clamp((5.2 - y) / 1.8, 0, 1);
    const k = TIMES[time].sky;
    for (const m of mats.current) {
      if (!m) continue;
      m.opacity = o;
      m.visible = o > 0.01;
      m.color.setScalar(k);
    }
  });
  return (
    <>
      {PLANES.map((pl, i) => {
        const t = texs[i];
        return (
          <mesh key={`${time}-${i}`} position={pl.p} rotation={pl.r}>
            <planeGeometry args={pl.s} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) mats.current[i] = m;
              }}
              map={t}
              transparent
              fog={false}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </>
  );
}

export default function Apartment() {
  const M = getMaterials();
  const woodGeo = useMemo(() => worldUV(new THREE.PlaneGeometry(14, 10), 14, 10, 1.6), []);
  const tileGeo = useMemo(() => worldUV(new THREE.PlaneGeometry(5, 5.525), 5, 5.525, 1.2), []);
  const groundMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1d1612', roughness: 1, alphaMap: groundTexture(), transparent: true, depthWrite: false }),
    [],
  );

  return (
    <group>
      {/* ground + slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, 0]} material={groundMat} receiveShadow>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <B a={[14.3, 0.36, 10.3]} p={[0, -0.18, 0]} m={M.slab} />

      {/* floors */}
      <mesh geometry={woodGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} material={M.floor} receiveShadow />
      <mesh geometry={tileGeo} rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.004, -2.2375]} material={M.tile} receiveShadow />

      {/* back wall z=-5 */}
      <WallX z={-5.075} x1={-7.15} x2={-6} />
      <WallX z={-5.075} x1={-6} x2={-1.6} y2={0.25} />
      <WallX z={-5.075} x1={-6} x2={-1.6} y1={2.6} />
      <WallX z={-5.075} x1={-1.6} x2={2.8} />
      <WallX z={-5.075} x1={2.8} x2={5.2} y2={1.15} />
      <WallX z={-5.075} x1={2.8} x2={5.2} y1={2.45} />
      <WallX z={-5.075} x1={5.2} x2={7.15} />
      <Window c={[-3.8, 1.425, -5.075]} w={4.4} h={2.35} axis="x" />
      <Window c={[4.0, 1.8, -5.075]} w={2.4} h={1.3} axis="x" />

      {/* left wall x=-7 */}
      <WallZ x={-7.075} z1={-5.15} z2={2.2} />
      <WallZ x={-7.075} z1={2.2} z2={4.2} y2={0.6} />
      <WallZ x={-7.075} z1={2.2} z2={4.2} y1={2.5} />
      <WallZ x={-7.075} z1={4.2} z2={5} />
      <Window c={[-7.075, 1.55, 3.2]} w={2} h={1.9} axis="z" />

      {/* right wall x=7 */}
      <WallZ x={7.075} z1={-5.15} z2={2} />
      <WallZ x={7.075} z1={2} z2={4} y2={0.8} />
      <WallZ x={7.075} z1={2} z2={4} y1={2.4} />
      <WallZ x={7.075} z1={4} z2={5} />
      <Window c={[7.075, 1.6, 3]} w={2} h={1.6} axis="z" />

      {/* partition between day + night zones (z=0.6) with two doorways */}
      <WallX z={0.6} x1={-7} x2={-2.1} />
      <WallX z={0.6} x1={-2.1} x2={-1.1} y1={2.15} />
      <WallX z={0.6} x1={-1.1} x2={1.0} />
      <WallX z={0.6} x1={1.0} x2={2.0} y1={2.15} />
      <WallX z={0.6} x1={2.0} x2={7} />
      {/* partition bedroom | study */}
      <WallZ x={0} z1={0.675} z2={5} />

      <Skies />
    </group>
  );
}
