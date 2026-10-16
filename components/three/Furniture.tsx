'use client';
import * as THREE from 'three';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { getMaterials } from '@/lib/materials';
import type { Vec3 } from '@/lib/tour';
import { B, Cyl, RB, LampLight, Plant, Curtain } from './primitives';

const PI = Math.PI;

/* ───────────────────────────── reusable pieces ───────────────────────────── */

function Sofa({ p, r }: { p: Vec3; r?: Vec3 }) {
  const M = getMaterials();
  return (
    <group position={p} rotation={r}>
      <RB a={[2.6, 0.32, 0.95]} p={[0, 0.24, 0]} m={M.fabric} radius={0.04} />
      <RB a={[2.6, 0.5, 0.17]} p={[0, 0.63, -0.39]} m={M.fabric} radius={0.06} />
      {[-0.84, 0, 0.84].map((x) => (
        <group key={x}>
          <RB a={[0.83, 0.16, 0.78]} p={[x, 0.47, 0.07]} m={M.fabric} radius={0.06} />
          <RB a={[0.83, 0.46, 0.2]} p={[x, 0.74, -0.27]} r={[-0.14, 0, 0]} m={M.fabric} radius={0.08} />
        </group>
      ))}
      {[-1.33, 1.33].map((x) => (
        <RB key={x} a={[0.16, 0.6, 0.95]} p={[x, 0.38, 0]} m={M.fabric} radius={0.06} />
      ))}
      {[-1.2, 1.2].flatMap((x) => [-0.38, 0.38].map((z) => <Cyl key={`${x}${z}`} rt={0.02} h={0.08} p={[x, 0.04, z]} m={M.metal} seg={12} />))}
      <RB a={[0.46, 0.42, 0.13]} p={[-0.92, 0.74, -0.12]} r={[-0.2, 0.28, 0.08]} m={M.fabric2} radius={0.06} />
      <RB a={[0.42, 0.4, 0.13]} p={[0.95, 0.73, -0.12]} r={[-0.2, -0.3, -0.08]} m={M.fabric2} radius={0.06} />
      <RB a={[0.55, 0.035, 0.98]} p={[1.0, 0.565, 0.05]} r={[0, 0.06, 0]} m={M.fabric2} radius={0.015} />
    </group>
  );
}

function Armchair({ p, r, m }: { p: Vec3; r?: Vec3; m: THREE.Material }) {
  const M = getMaterials();
  return (
    <group position={p} rotation={r}>
      <RB a={[0.76, 0.2, 0.74]} p={[0, 0.39, 0.02]} m={m} radius={0.07} />
      <RB a={[0.76, 0.6, 0.18]} p={[0, 0.7, -0.32]} r={[-0.22, 0, 0]} m={m} radius={0.08} />
      {[-0.41, 0.41].map((x) => (
        <B key={x} a={[0.05, 0.05, 0.76]} p={[x, 0.58, 0]} m={M.wood} />
      ))}
      {[-0.41, 0.41].flatMap((x) =>
        [-0.32, 0.32].map((z) => <B key={`${x}${z}`} a={[0.05, 0.58, 0.05]} p={[x, 0.29, z]} m={M.wood} />),
      )}
    </group>
  );
}

function TableLamp({ p, power = 2.2 }: { p: Vec3; power?: number }) {
  const M = getMaterials();
  return (
    <group position={p}>
      <mesh position={[0, 0.1, 0]} material={M.ceramicLight} castShadow>
        <sphereGeometry args={[0.1, 24, 16]} />
      </mesh>
      <Cyl rt={0.008} h={0.12} p={[0, 0.24, 0]} m={M.metal} seg={8} />
      <Cyl rt={0.13} rb={0.17} h={0.22} p={[0, 0.36, 0]} m={M.shade} open cast={false} />
      <LampLight p={[0, 0.33, 0]} power={power} distance={4} />
    </group>
  );
}

function FloorLamp({ p, power = 3 }: { p: Vec3; power?: number }) {
  const M = getMaterials();
  return (
    <group position={p}>
      <Cyl rt={0.14} h={0.03} p={[0, 0.015, 0]} m={M.metal} />
      <Cyl rt={0.012} h={1.45} p={[0, 0.75, 0]} m={M.metal} seg={8} />
      <Cyl rt={0.16} rb={0.22} h={0.3} p={[0, 1.55, 0]} m={M.shade} open cast={false} />
      <LampLight p={[0, 1.45, 0]} power={power} distance={5} />
    </group>
  );
}

function Pendant({ p, drop, kind = 'globe', power = 0 }: { p: Vec3; drop: number; kind?: 'globe' | 'dome'; power?: number }) {
  const M = getMaterials();
  const [x, y, z] = p;
  const cordH = 2.9 - y;
  return (
    <group position={[x, 0, z]}>
      <Cyl rt={0.004} h={cordH} p={[0, y + cordH / 2, 0]} m={M.black} seg={6} cast={false} />
      {kind === 'globe' ? (
        <mesh position={[0, y - 0.12, 0]} material={M.shade}>
          <sphereGeometry args={[0.13, 32, 20]} />
        </mesh>
      ) : (
        <>
          <mesh position={[0, y - 0.2, 0]} material={M.metal} castShadow>
            <sphereGeometry args={[0.28, 40, 16, 0, PI * 2, 0, PI / 2]} />
          </mesh>
          <mesh position={[0, y - 0.19, 0]} rotation={[PI / 2, 0, 0]} material={M.shade}>
            <circleGeometry args={[0.25, 40]} />
          </mesh>
        </>
      )}
      {power > 0 && <LampLight p={[0, y - drop, 0]} power={power} distance={6} />}
    </group>
  );
}

/** One instanced mesh for every book on the library wall. */
function Books({ origin, bays, rows, bayLen, rowH, seed = 3 }: { origin: Vec3; bays: number; rows: number; bayLen: number; rowH: number; seed?: number }) {
  const M = getMaterials();
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    let s = seed;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const palette = ['#7a3a2a', '#c49a5a', '#2f3b39', '#d9cbb3', '#5a4a6a', '#8c6a4f', '#2b2420', '#a5653f', '#e6dccb', '#4b5a4a'];
    const items: { pos: Vec3; scale: Vec3; rotX: number; color: string }[] = [];
    for (let b = 0; b < bays; b++)
      for (let r = 0; r < rows; r++) {
        let z = origin[2] + b * bayLen + 0.04;
        const end = origin[2] + (b + 1) * bayLen - 0.04;
        const fill = 0.35 + rand() * 0.5;
        const stop = z + (end - z) * fill;
        const y0 = origin[1] + r * rowH + 0.03;
        while (z < stop) {
          const t = 0.022 + rand() * 0.03;
          const h = Math.min(rowH - 0.06, 0.2 + rand() * 0.13);
          items.push({ pos: [origin[0], y0 + h / 2, z + t / 2], scale: [0.2 + rand() * 0.05, h, t], rotX: 0, color: palette[Math.floor(rand() * palette.length)] });
          z += t + 0.002;
        }
        if (rand() > 0.45) {
          // a lying stack
          let y = y0;
          for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) {
            const t = 0.025 + rand() * 0.02;
            items.push({ pos: [origin[0], y + t / 2, end - 0.13], scale: [0.21, t, 0.22 + rand() * 0.04], rotX: 0, color: palette[Math.floor(rand() * palette.length)] });
            y += t;
          }
        }
      }
    return items;
  }, [origin, bays, rows, bayLen, rowH, seed]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    data.forEach((d, i) => {
      o.position.set(...d.pos);
      o.scale.set(...d.scale);
      o.rotation.set(d.rotX, 0, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, c.set(d.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.8 }), []);
  void M;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.length]} material={mat} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function Flutes({ from, to, axis, y, h, x, r = 0.03, step = 0.072 }: { from: number; to: number; axis: 'x' | 'z'; y: number; h: number; x: number; r?: number; step?: number }) {
  const M = getMaterials();
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = Math.floor((to - from) / step);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const v = from + step / 2 + i * step;
      if (axis === 'z') o.position.set(x, y, v);
      else o.position.set(v, y, x);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [from, n, step, axis, x, y]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} material={M.wood} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 12]} />
    </instancedMesh>
  );
}

function ArcLamp() {
  const M = getMaterials();
  const tube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.55, 0.05, -4.35),
      new THREE.Vector3(-1.56, 1.6, -4.3),
      new THREE.Vector3(-1.9, 2.35, -4.0),
      new THREE.Vector3(-2.7, 2.55, -3.5),
      new THREE.Vector3(-3.3, 2.32, -3.1),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.016, 8, false);
  }, []);
  return (
    <group>
      <Cyl rt={0.17} h={0.06} p={[-1.55, 0.03, -4.35]} m={M.stone} />
      <mesh geometry={tube} material={M.metal} castShadow />
      <mesh position={[-3.3, 2.08, -3.1]} material={M.metal} castShadow>
        <sphereGeometry args={[0.24, 40, 16, 0, PI * 2, 0, PI / 2]} />
      </mesh>
      <mesh position={[-3.3, 2.1, -3.1]} rotation={[PI / 2, 0, 0]} material={M.shade}>
        <circleGeometry args={[0.21, 40]} />
      </mesh>
      <LampLight p={[-3.3, 1.92, -3.1]} power={5.5} distance={7} />
    </group>
  );
}

/* ───────────────────────────── rooms ───────────────────────────── */

function Living() {
  const M = getMaterials();
  return (
    <group>
      <mesh rotation={[-PI / 2, 0, 0]} position={[-3.7, 0.007, -2.5]} material={M.rug} receiveShadow>
        <planeGeometry args={[3.5, 2.7]} />
      </mesh>
      <Sofa p={[-1.95, 0, -2.5]} r={[0, -PI / 2, 0]} />
      <Armchair p={[-4.95, 0, -4.1]} r={[0, 0.67, 0]} m={M.fabric2} />

      {/* drum coffee tables */}
      <Cyl rt={0.55} h={0.34} p={[-3.7, 0.17, -2.5]} m={M.stone} seg={48} />
      <Cyl rt={0.3} h={0.26} p={[-4.35, 0.13, -1.85]} m={M.woodDark} seg={40} />
      <mesh position={[-3.55, 0.38, -2.62]} material={M.ceramicLight} castShadow>
        <sphereGeometry args={[0.13, 32, 12, 0, PI * 2, PI / 2, PI / 2]} />
      </mesh>
      <B a={[0.3, 0.04, 0.22]} p={[-3.9, 0.36, -2.3]} m={M.books[0]} />
      <B a={[0.26, 0.035, 0.2]} p={[-3.9, 0.397, -2.3]} r={[0, 0.2, 0]} m={M.books[3]} />

      {/* fluted media wall */}
      <B a={[0.04, 2.9, 3.7]} p={[-6.98, 1.45, -2.6]} m={M.woodDark} />
      <Flutes from={-4.45} to={-0.75} axis="z" x={-6.93} y={1.45} h={2.9} />
      <B a={[0.05, 0.94, 1.66]} p={[-6.88, 1.45, -2.6]} m={M.frame} />
      <B a={[0.01, 0.9, 1.62]} p={[-6.85, 1.45, -2.6]} m={M.screen} cast={false} />
      <B a={[0.42, 0.32, 2.9]} p={[-6.7, 0.44, -2.6]} m={M.wood} />
      <B a={[0.02, 0.01, 2.7]} p={[-6.52, 0.275, -2.6]} m={M.led} cast={false} />
      <LampLight p={[-6.4, 0.18, -2.6]} power={1.6} distance={3} />
      <Cyl rt={0.07} rb={0.1} h={0.34} p={[-6.72, 0.77, -1.55]} m={M.ceramic} />
      <Cyl rt={0.05} h={0.2} p={[-6.72, 0.7, -1.35]} m={M.ceramicLight} />
      <B a={[0.24, 0.05, 0.3]} p={[-6.7, 0.625, -3.7]} m={M.books[2]} />

      <ArcLamp />
      {/* side table + lamp */}
      <Cyl rt={0.22} h={0.5} p={[-1.95, 0.25, -0.85]} m={M.woodDark} />
      <TableLamp p={[-1.95, 0.5, -0.85]} power={2} />

      <Plant p={[-6.35, 0, -4.5]} scale={1.25} seed={3} />
      {/* curtains */}
      <Cyl rt={0.012} h={5.6} p={[-3.8, 2.75, -4.86]} r={[0, 0, PI / 2]} m={M.metal} seg={8} />
      <Curtain p={[-5.75, 1.38, -4.86]} w={0.7} h={2.7} />
      <Curtain p={[-1.85, 1.38, -4.86]} w={0.7} h={2.7} />
    </group>
  );
}

function Kitchen() {
  const M = getMaterials();
  const chairs = [0.6, 0.6 + PI / 2, 0.6 + PI, 0.6 + (3 * PI) / 2];
  return (
    <group>
      {/* back run */}
      <B a={[4.2, 0.84, 0.6]} p={[4.5, 0.46, -4.69]} m={M.cabinet} />
      {Array.from({ length: 6 }, (_, i) => (
        <B key={i} a={[0.008, 0.78, 0.004]} p={[2.4 + 0.7 * (i + 1), 0.48, -4.388]} m={M.black} cast={false} />
      ))}
      <B a={[4.24, 0.04, 0.64]} p={[4.5, 0.9, -4.68]} m={M.stone} />
      <B a={[4.2, 0.23, 0.02]} p={[4.5, 1.035, -4.99]} m={M.stone} />
      <B a={[0.7, 0.01, 0.42]} p={[3.9, 0.922, -4.66]} m={M.black} cast={false} />
      <Cyl rt={0.016} h={0.34} p={[3.9, 1.09, -4.9]} m={M.metal} seg={12} />
      <B a={[0.025, 0.025, 0.24]} p={[3.9, 1.25, -4.8]} m={M.metal} />
      {[1.55, 1.95].map((y) => (
        <B key={y} a={[1.25, 0.04, 0.26]} p={[5.95, y, -4.87]} m={M.wood} />
      ))}
      <Cyl rt={0.06} h={0.18} p={[5.6, 1.66, -4.87]} m={M.ceramicLight} />
      <Cyl rt={0.08} rb={0.05} h={0.14} p={[5.85, 1.64, -4.87]} m={M.ceramic} />
      <Cyl rt={0.05} h={0.24} p={[6.3, 2.09, -4.87]} m={M.ceramicLight} />
      <Plant p={[6.1, 1.97, -4.88]} scale={0.32} seed={8} />

      {/* pantry + appliance tower */}
      <B a={[0.6, 2.5, 2.7]} p={[6.7, 1.25, -3.0]} m={M.cabinet} />
      {[-3.9, -2.1].map((z) => (
        <B key={z} a={[0.004, 2.4, 0.008]} p={[6.398, 1.25, z + 0.45]} m={M.black} cast={false} />
      ))}
      <B a={[0.02, 0.6, 0.62]} p={[6.395, 1.25, -3.9]} m={M.screen} cast={false} />
      <B a={[0.02, 0.012, 0.5]} p={[6.38, 1.62, -3.9]} m={M.metal} cast={false} />
      <B a={[0.01, 0.02, 2.6]} p={[6.4, 2.49, -3.0]} m={M.led} cast={false} />

      {/* island */}
      <B a={[2.4, 0.86, 0.9]} p={[4.5, 0.43, -2.5]} m={M.woodDark} />
      <Flutes from={3.3} to={5.7} axis="x" x={-2.04} y={0.43} h={0.86} r={0.026} step={0.06} />
      <B a={[2.6, 0.05, 1.1]} p={[4.5, 0.885, -2.4]} m={M.stone} />
      {[3.75, 4.5, 5.25].map((x) => (
        <group key={x} position={[x, 0, -1.6]}>
          <Cyl rt={0.19} h={0.07} p={[0, 0.68, 0]} m={M.leather} />
          {[
            [0.12, 0.12],
            [-0.12, 0.12],
            [0.12, -0.12],
            [-0.12, -0.12],
          ].map(([a, b]) => (
            <Cyl key={`${a}${b}`} rt={0.011} h={0.65} p={[a, 0.325, b]} m={M.black} seg={8} />
          ))}
          <mesh position={[0, 0.27, 0]} rotation={[PI / 2, 0, 0]} material={M.metal}>
            <torusGeometry args={[0.17, 0.008, 8, 32]} />
          </mesh>
        </group>
      ))}
      {[3.75, 4.5, 5.25].map((x) => (
        <Pendant key={x} p={[x, 2.15, -2.4]} drop={0.3} kind="globe" />
      ))}
      <LampLight p={[4.5, 1.8, -2.4]} power={6} distance={6} />
      <Cyl rt={0.11} rb={0.08} h={0.12} p={[4.2, 0.97, -2.6]} m={M.ceramicLight} />
      <mesh position={[4.95, 0.95, -2.5]} material={M.wood} castShadow>
        <boxGeometry args={[0.45, 0.03, 0.3]} />
      </mesh>

      {/* dining */}
      <Cyl rt={0.62} h={0.04} p={[1.55, 0.74, -2.5]} m={M.wood} seg={48} />
      <Cyl rt={0.08} h={0.7} p={[1.55, 0.37, -2.5]} m={M.woodDark} />
      <Cyl rt={0.32} h={0.03} p={[1.55, 0.015, -2.5]} m={M.woodDark} />
      {chairs.map((a) => (
        <group key={a} position={[1.55 + 0.78 * Math.sin(a), 0, -2.5 + 0.78 * Math.cos(a)]} rotation={[0, a + PI, 0]}>
          <RB a={[0.45, 0.06, 0.44]} p={[0, 0.46, 0]} m={M.fabric2} radius={0.025} />
          <RB a={[0.44, 0.3, 0.04]} p={[0, 0.74, -0.21]} r={[-0.1, 0, 0]} m={M.wood} radius={0.015} />
          {[
            [0.19, 0.18],
            [-0.19, 0.18],
            [0.19, -0.19],
            [-0.19, -0.19],
          ].map(([x, z]) => (
            <Cyl key={`${x}${z}`} rt={0.017} h={0.44} p={[x, 0.22, z]} m={M.wood} seg={8} />
          ))}
        </group>
      ))}
      <Cyl rt={0.09} h={0.16} p={[1.5, 0.84, -2.45]} m={M.ceramic} />
      <Pendant p={[1.55, 1.85, -2.5]} drop={0.32} kind="dome" power={4} />
      <Plant p={[0.85, 0, -4.45]} scale={0.95} seed={5} />
    </group>
  );
}

function Bedroom() {
  const M = getMaterials();
  return (
    <group>
      <B a={[3.6, 2.9, 0.01]} p={[-4.2, 1.45, 0.681]} m={M.accentWall} cast={false} />
      {Array.from({ length: 6 }, (_, i) => (
        <RB key={i} a={[0.39, 1.15, 0.11]} p={[-5.2 + i * 0.4, 0.78, 0.74]} m={M.fabric2} radius={0.045} />
      ))}
      <B a={[1.7, 0.08, 1.9]} p={[-4.2, 0.04, 1.9]} m={M.black} />
      <B a={[1.98, 0.24, 2.15]} p={[-4.2, 0.2, 1.88]} m={M.wood} />
      <RB a={[1.86, 0.24, 2.0]} p={[-4.2, 0.43, 1.88]} m={M.linen} radius={0.06} />
      <RB a={[1.98, 0.3, 1.5]} p={[-4.2, 0.43, 2.2]} m={M.linen} radius={0.05} />
      <RB a={[2.02, 0.05, 0.55]} p={[-4.2, 0.6, 2.6]} m={M.fabric2} radius={0.02} />
      {[-4.68, -3.72].map((x) => (
        <RB key={x} a={[0.64, 0.17, 0.4]} p={[x, 0.66, 1.08]} r={[-0.4, 0, 0]} m={M.linen} radius={0.075} />
      ))}
      {[-4.45, -3.95].map((x, i) => (
        <RB key={x} a={[0.46, 0.34, 0.12]} p={[x, 0.76, 1.32]} r={[-0.25, i ? -0.12 : 0.12, 0]} m={M.fabric} radius={0.055} />
      ))}
      {[-5.65, -2.75].map((x) => (
        <group key={x}>
          <B a={[0.52, 0.4, 0.42]} p={[x, 0.32, 0.98]} m={M.wood} />
          <B a={[0.46, 0.005, 0.002]} p={[x, 0.32, 1.192]} m={M.black} cast={false} />
          <TableLamp p={[x, 0.52, 0.95]} power={2.2} />
        </group>
      ))}
      {/* artwork */}
      <B a={[1.28, 0.88, 0.03]} p={[-4.2, 2.08, 0.7]} m={M.wood} />
      <mesh position={[-4.2, 2.08, 0.717]} material={M.art}>
        <planeGeometry args={[1.2, 0.8]} />
      </mesh>
      {/* bench + rug */}
      <RB a={[1.4, 0.12, 0.42]} p={[-4.2, 0.42, 3.32]} m={M.fabric2} radius={0.04} />
      {[-4.82, -3.58].flatMap((x) => [3.15, 3.49].map((z) => <B key={`${x}${z}`} a={[0.04, 0.36, 0.04]} p={[x, 0.18, z]} m={M.wood} />))}
      <mesh rotation={[-PI / 2, 0, 0]} position={[-4.2, 0.007, 2.5]} material={M.rug2} receiveShadow>
        <planeGeometry args={[3.0, 2.5]} />
      </mesh>
      {/* wardrobe */}
      <B a={[0.6, 2.5, 2.8]} p={[-0.375, 1.25, 3.3]} m={M.wood} />
      {[2.6, 3.3, 4.0].map((z) => (
        <group key={z}>
          <B a={[0.004, 2.44, 0.008]} p={[-0.677, 1.25, z]} m={M.black} cast={false} />
          <Cyl rt={0.008} h={0.5} p={[-0.7, 1.15, z - 0.05]} m={M.metal} seg={8} />
          <Cyl rt={0.008} h={0.5} p={[-0.7, 1.15, z + 0.05]} m={M.metal} seg={8} />
        </group>
      ))}
      <Cyl rt={0.012} h={2.6} p={[-6.86, 2.62, 3.2]} r={[PI / 2, 0, 0]} m={M.metal} seg={8} />
      <Curtain p={[-6.86, 1.32, 2.15]} r={[0, PI / 2, 0]} w={0.6} h={2.55} />
      <Curtain p={[-6.86, 1.32, 4.25]} r={[0, PI / 2, 0]} w={0.6} h={2.55} />
      <Plant p={[-6.35, 0, 4.55]} scale={0.85} seed={11} />
    </group>
  );
}

function Study() {
  const M = getMaterials();
  return (
    <group>
      <mesh rotation={[-PI / 2, 0, 0]} position={[3.4, 0.007, 3.0]} material={M.rug} receiveShadow>
        <circleGeometry args={[1.3, 64]} />
      </mesh>
      {/* library */}
      {[1.6, 2.6, 3.6, 4.6].map((z) => (
        <B key={z} a={[0.35, 2.2, 0.03]} p={[0.25, 1.1, z]} m={M.wood} />
      ))}
      {[0.02, 0.46, 0.9, 1.34, 1.78, 2.2].map((y) => (
        <B key={y} a={[0.35, 0.03, 3.03]} p={[0.25, y, 3.1]} m={M.wood} />
      ))}
      <Books origin={[0.25, 0.035, 1.615]} bays={3} rows={5} bayLen={1.0} rowH={0.44} />
      <Cyl rt={0.06} rb={0.08} h={0.22} p={[0.25, 1.9, 2.2]} m={M.ceramic} />
      <Cyl rt={0.05} h={0.16} p={[0.25, 1.01, 4.35]} m={M.ceramicLight} />
      {/* desk */}
      <B a={[0.72, 0.04, 1.7]} p={[6.4, 0.75, 3.0]} m={M.wood} />
      {[6.1, 6.7].flatMap((x) => [2.2, 3.8].map((z) => <B key={`${x}${z}`} a={[0.035, 0.73, 0.035]} p={[x, 0.365, z]} m={M.black} />))}
      <B a={[0.24, 0.015, 0.33]} p={[6.35, 0.778, 3.0]} m={M.black} />
      <B a={[0.008, 0.22, 0.33]} p={[6.49, 0.89, 3.0]} r={[0, 0, 0.18]} m={M.screen} />
      {/* desk lamp */}
      <Cyl rt={0.07} h={0.02} p={[6.55, 0.78, 3.65]} m={M.metal} />
      <Cyl rt={0.008} h={0.42} p={[6.55, 0.99, 3.65]} m={M.metal} seg={8} />
      <Cyl rt={0.008} h={0.3} p={[6.45, 1.22, 3.6]} r={[0, 0, 1.0]} m={M.metal} seg={8} />
      <Cyl rt={0.03} rb={0.09} h={0.12} p={[6.33, 1.22, 3.55]} m={M.metal} open />
      <LampLight p={[6.33, 1.12, 3.5]} power={1.6} distance={3} />
      <Plant p={[6.5, 0.77, 2.35]} scale={0.25} seed={4} />
      {/* desk chair */}
      <group position={[5.75, 0, 3.0]} rotation={[0, PI / 2, 0]}>
        <RB a={[0.5, 0.08, 0.48]} p={[0, 0.48, 0]} m={M.fabric2} radius={0.03} />
        <RB a={[0.48, 0.5, 0.06]} p={[0, 0.83, -0.24]} r={[-0.1, 0, 0]} m={M.fabric2} radius={0.025} />
        <Cyl rt={0.025} h={0.4} p={[0, 0.25, 0]} m={M.black} seg={10} />
        {Array.from({ length: 5 }, (_, i) => (
          <B key={i} a={[0.3, 0.025, 0.04]} p={[0.15 * Math.cos((i * 2 * PI) / 5), 0.05, 0.15 * Math.sin((i * 2 * PI) / 5)]} r={[0, (-i * 2 * PI) / 5, 0]} m={M.black} />
        ))}
      </group>
      {/* reading corner */}
      <Armchair p={[1.6, 0, 4.1]} r={[0, 2.36, 0]} m={M.leather} />
      <FloorLamp p={[0.85, 0, 4.65]} power={3} />
      <Cyl rt={0.2} h={0.45} p={[2.4, 0.225, 4.55]} m={M.stone} />
      <Plant p={[6.45, 0, 4.5]} scale={1.05} seed={7} />
      {/* credenza + art on the back wall */}
      <B a={[2.4, 0.5, 0.42]} p={[4.3, 0.33, 0.9]} m={M.wood} />
      {[3.5, 4.3, 5.1].map((x) => (
        <B key={x} a={[0.004, 0.44, 0.004]} p={[x - 0.4, 0.33, 1.112]} m={M.black} cast={false} />
      ))}
      <B a={[1.18, 0.82, 0.03]} p={[4.6, 1.65, 0.69]} m={M.woodDark} />
      <mesh position={[4.6, 1.65, 0.707]} material={M.art}>
        <planeGeometry args={[1.1, 0.74]} />
      </mesh>
      <TableLamp p={[3.45, 0.58, 0.9]} power={2.4} />
      <Cyl rt={0.07} rb={0.05} h={0.26} p={[5.2, 0.71, 0.9]} m={M.ceramic} />
      <B a={[0.28, 0.06, 0.2]} p={[4.85, 0.61, 0.95]} m={M.books[1]} />
    </group>
  );
}

export default function Furniture() {
  return (
    <>
      <Living />
      <Kitchen />
      <Bedroom />
      <Study />
    </>
  );
}
