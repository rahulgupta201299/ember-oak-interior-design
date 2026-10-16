'use client';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStore, tourState } from '@/lib/store';
import { STOPS } from '@/lib/tour';

const HOLD = 0.32;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/** Sample the scripted camera path at scroll progress p ∈ [0, STOPS.length-1]. */
export function samplePath(p: number, portrait: boolean, time: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
  const n = STOPS.length;
  p = THREE.MathUtils.clamp(p, 0, n - 1);
  const i = Math.min(Math.floor(p), n - 2);
  const f = p - i;
  const t = f < HOLD ? 0 : ease((f - HOLD) / (1 - HOLD));
  const A = STOPS[i];
  const Bs = STOPS[i + 1];

  outTarget.lerpVectors(_a.fromArray(A.target), _b.fromArray(Bs.target), t);
  outPos.lerpVectors(_a.fromArray(A.pos), _b.fromArray(Bs.pos), t);

  // wide screens: slide the frame sideways so copy and model don't overlap
  const shift = THREE.MathUtils.lerp(A.shift ?? 0, Bs.shift ?? 0, t);
  if (!portrait && shift !== 0) {
    _a.subVectors(outTarget, outPos).cross(THREE.Object3D.DEFAULT_UP).normalize().multiplyScalar(shift);
    outPos.add(_a);
    outTarget.add(_a);
  }
  // portrait screens: pull the camera back from its target
  if (portrait) {
    const up = THREE.MathUtils.lerp(A.pUp ?? 0, Bs.pUp ?? 0, t);
    if (up) {
      _b.subVectors(outTarget, outPos).normalize();
      _a.crossVectors(_b, THREE.Object3D.DEFAULT_UP).normalize(); // right
      _b.crossVectors(_a, _b).normalize().multiplyScalar(-up); // screen-down
      outPos.add(_b);
      outTarget.add(_b);
    }
    const k = THREE.MathUtils.lerp(A.portrait, Bs.portrait, t);
    outPos.sub(outTarget).multiplyScalar(k).add(outTarget);
  }
  // slow push-in while holding on a room
  const hold = Math.min(f / HOLD, 1) * (1 - t);
  if (A.id !== 'overview' && A.id !== 'outro') {
    _a.subVectors(outTarget, outPos).multiplyScalar(0.07 * hold);
    outPos.add(_a);
  }
  // arc over walls between rooms
  outPos.y += Math.sin(Math.PI * t) * A.lift;

  // gentle idle drift on the overview shots
  const overviewWeight = (i === 0 ? 1 - t : 0) + (i === n - 2 ? t : 0);
  if (overviewWeight > 0) {
    const ang = Math.sin(time * 0.12) * 0.16 * overviewWeight;
    _a.subVectors(outPos, outTarget).applyAxisAngle(THREE.Object3D.DEFAULT_UP, ang);
    outPos.copy(outTarget).add(_a);
  }

  // which room are we "in"?
  let room: string | null = null;
  if (f < HOLD + 0.18) room = A.id;
  else if (t > 0.88) room = Bs.id;
  if (p >= n - 1) room = STOPS[n - 1].id;
  return room;
}

export default function CameraRig() {
  const { camera, size } = useThree();
  const mode = useStore((s) => s.mode);
  const controls = useRef<OrbitControlsImpl>(null);
  const look = useRef(new THREE.Vector3(...STOPS[0].target));
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const portrait = size.width < size.height;

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 56 : 42;
    cam.updateProjectionMatrix();
  }, [camera, portrait]);

  // hand the current view over to the orbit controls when exploring
  useEffect(() => {
    if (mode === 'explore' && controls.current) {
      controls.current.target.copy(look.current);
      controls.current.update();
    }
  }, [mode]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    const st = useStore.getState();

    if (st.mode === 'tour') {
      const room = samplePath(tourState.progress, portrait, tourState.snap ? 0 : state.clock.elapsedTime, goalPos.current, goalTarget.current);
      if (room !== st.activeRoom) st.setActiveRoom(room);

      // pointer parallax
      const px = tourState.snap ? 0 : tourState.pointer.x;
      const py = tourState.snap ? 0 : tourState.pointer.y;
      goalPos.current.x += px * 0.25;
      goalPos.current.y += py * 0.15;

      if (tourState.snap) {
        camera.position.copy(goalPos.current);
        look.current.copy(goalTarget.current);
        camera.lookAt(look.current);
        return;
      }
      camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.current.x, 3.2, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.current.y, 3.2, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.current.z, 3.2, d);
      look.current.x = THREE.MathUtils.damp(look.current.x, goalTarget.current.x, 3.6, d);
      look.current.y = THREE.MathUtils.damp(look.current.y, goalTarget.current.y, 3.6, d);
      look.current.z = THREE.MathUtils.damp(look.current.z, goalTarget.current.z, 3.6, d);
      camera.lookAt(look.current);
      return;
    }

    // explore mode: optional fly-to a room, then free orbit
    const c = controls.current;
    if (!c) return;
    if (st.flyTo) {
      const idx = STOPS.findIndex((s) => s.id === st.flyTo);
      if (idx >= 0) {
        samplePath(idx, portrait, 0, goalPos.current, goalTarget.current);
        camera.position.lerp(goalPos.current, 1 - Math.exp(-3 * d));
        c.target.lerp(goalTarget.current, 1 - Math.exp(-3.5 * d));
        if (camera.position.distanceTo(goalPos.current) < 0.05) st.setFlyTo(null);
      }
    }
    look.current.copy(c.target);
    c.update();
  });

  if (mode !== 'explore') return null;
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={32}
      maxPolarAngle={Math.PI / 2.08}
      onStart={() => useStore.getState().setFlyTo(null)}
    />
  );
}
