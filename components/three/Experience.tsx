'use client';
import * as THREE from 'three';
import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, N8AO, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useStore } from '@/lib/store';
import { MOODS, STOPS, TIMES } from '@/lib/tour';
import { getMaterials, kelvinToColor, TINTED } from '@/lib/materials';
import Apartment from './Apartment';
import Furniture from './Furniture';
import CameraRig from './CameraRig';
import Hotspots from './Hotspots';

const _c = new THREE.Color();

/** Smoothly blends material colours, lamp emission, sun and sky to the selected mood/time. */
function LookController() {
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const bg = useRef(new THREE.Color(TIMES.golden.bg));
  const sunPos = useRef(new THREE.Vector3(...TIMES.golden.sunPos));

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-4 * Math.min(dt, 0.05));
    const st = useStore.getState();
    const mood = MOODS[st.mood];
    const time = TIMES[st.time];
    const M = getMaterials();

    for (const [mk, pk] of TINTED) {
      const mat = M[mk] as THREE.MeshStandardMaterial;
      mat.color.lerp(_c.set(mood[pk]), k);
    }
    kelvinToColor(st.kelvin, _c);
    const lampLevel = st.dimmer * time.lamps;
    for (const m of [M.shade, M.bulb, M.led]) m.emissive.lerp(_c, k);
    M.shade.emissiveIntensity = THREE.MathUtils.lerp(M.shade.emissiveIntensity, 2.6 * lampLevel, k);
    M.led.emissiveIntensity = THREE.MathUtils.lerp(M.led.emissiveIntensity, 5 * lampLevel, k);

    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(sun.current.intensity, time.sunIntensity, k);
      sun.current.color.lerp(_c.set(time.sunColor), k);
      sunPos.current.lerp(new THREE.Vector3(...time.sunPos), k);
      sun.current.position.copy(sunPos.current);
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(hemi.current.intensity, time.hemi, k);
    scene.environmentIntensity = THREE.MathUtils.lerp(scene.environmentIntensity ?? 1, time.env, k);
    bg.current.lerp(_c.set(time.bg), k);
    if (scene.background instanceof THREE.Color) scene.background.copy(bg.current);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(bg.current);
  });

  return (
    <>
      <directionalLight
        ref={sun}
        castShadow
        position={TIMES.golden.sunPos}
        intensity={TIMES.golden.sunIntensity}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      >
        <orthographicCamera attach="shadow-camera" args={[-12, 12, 12, -12, 1, 50]} />
      </directionalLight>
      <hemisphereLight ref={hemi} args={['#ffe2c4', '#2a1c14', TIMES.golden.hemi]} />
    </>
  );
}

function Effects({ low }: { low: boolean }) {
  if (low)
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.6} luminanceThreshold={1} luminanceSmoothing={0.25} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.3} darkness={0.55} />
      </EffectComposer>
    );
  return (
    <EffectComposer multisampling={4}>
      <N8AO aoRadius={0.55} distanceFalloff={0.6} intensity={2.2} quality="medium" halfRes color="#1a0f08" />
      <Bloom mipmapBlur intensity={0.65} luminanceThreshold={1} luminanceSmoothing={0.25} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
}

export default function Experience() {
  const canvasActive = useStore((s) => s.canvasActive);
  const mode = useStore((s) => s.mode);
  const setReady = useStore((s) => s.setReady);
  const setHotspot = useStore((s) => s.setHotspot);
  const [dpr, setDpr] = useState(1.5);
  const [low, setLow] = useState(false);

  return (
    <div className="stage" aria-hidden={mode !== 'explore'}>
      <Canvas
        shadows="soft"
        flat
        dpr={dpr}
        frameloop={canvasActive || mode === 'explore' ? 'always' : 'never'}
        camera={{ fov: 42, position: STOPS[0].pos, near: 0.1, far: 140 }}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        onCreated={() => setTimeout(() => setReady(true), 600)}
        onPointerMissed={() => setHotspot(null)}
      >
        <color attach="background" args={[TIMES.golden.bg]} />
        <fog attach="fog" args={[TIMES.golden.bg, 30, 70]} />
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setLow(true);
          }}
        />
        <Environment resolution={256} environmentIntensity={TIMES.golden.env}>
          <Lightformer form="rect" intensity={2.5} color="#ffcf9e" position={[0, 6, -10]} scale={[14, 4, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#ffe6cc" position={[-10, 4, 2]} rotation={[0, Math.PI / 2, 0]} scale={[10, 3, 1]} />
          <Lightformer form="rect" intensity={0.6} color="#9fb3ff" position={[10, 5, 4]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 3, 1]} />
          <Lightformer form="circle" intensity={1.5} color="#fff1dd" position={[0, 12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={6} />
        </Environment>
        <LookController />
        <Apartment />
        <Furniture />
        <CameraRig />
        <Hotspots />
        <Effects low={low} />
      </Canvas>
    </div>
  );
}
