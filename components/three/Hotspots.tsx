'use client';
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStore } from '@/lib/store';
import { HOTSPOTS, type Hotspot } from '@/lib/tour';

const _v = new THREE.Vector3();

function Pin({ h, visible }: { h: Hotspot; visible: boolean }) {
  const el = useRef<HTMLButtonElement>(null);
  const selected = useStore((s) => s.hotspot === h.id);
  const setHotspot = useStore((s) => s.setHotspot);

  useFrame(({ camera }) => {
    if (!el.current) return;
    const dist = camera.position.distanceTo(_v.fromArray(h.position));
    const near = visible && dist < 11;
    el.current.style.opacity = near ? '1' : '0';
    el.current.style.pointerEvents = near ? 'auto' : 'none';
    el.current.style.transform = `scale(${near ? 1 : 0.6})`;
  });

  return (
    <Html position={h.position} center zIndexRange={[30, 0]}>
      <button
        ref={el}
        className={`pin ${selected ? 'pin--on' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setHotspot(selected ? null : h.id);
        }}
        aria-label={h.title}
      >
        <span className="pin__dot" />
        <span className="pin__label">{h.title}</span>
      </button>
    </Html>
  );
}

export default function Hotspots() {
  const mode = useStore((s) => s.mode);
  const active = useStore((s) => s.activeRoom);
  return (
    <>
      {HOTSPOTS.map((h) => (
        <Pin key={h.id} h={h} visible={mode === 'explore' || active === h.room} />
      ))}
    </>
  );
}
